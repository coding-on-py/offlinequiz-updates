/**
 * Question-database updater (GitHub).
 *
 * A built questions.db is published as a GitHub Release on the updates repo,
 * brotli-compressed and split into parts (scripts/publish-db.mjs). A small
 * signed manifest sits next to the code-update manifest:
 *     <UPDATE_BASE_URL>/db/db-manifest.json
 *     { format: 1, version: "<meta built_at>", name, schema, mode, tree,
 *       size, sha256,                       // the decompressed database
 *       compression: "br", parts: [{ name, url, size, sha256 }],
 *       signature }                         // Ed25519 over dbCanonical()
 * The app downloads the parts (each verified, kept between attempts so an
 * interrupted download resumes), decompresses them into a temp file, checks the
 * whole database's size + sha256 and that it opens, then swaps it into place.
 *
 * This file runs from the signed OTA overlay too, so it may import only Node
 * built-ins (and nothing else from src/main except through the caller).
 */
import { DatabaseSync } from "node:sqlite";
import { createHash, verify as edVerify, createPublicKey } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, statfsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createBrotliDecompress } from "node:zlib";

// ── Configuration ──────────────────────────────────────────
const UPDATE_BASE_URL = "https://raw.githubusercontent.com/coding-on-py/offlinequiz-updates/main";
const MANIFEST_URL = process.env.QB_DB_MANIFEST_URL || UPDATE_BASE_URL + "/db/db-manifest.json";
// Our own mirror (scripts/publish-mirror.mjs): the same manifest and parts at
// <mirror>/db/db-manifest.json and <mirror>/db/<version>/<part>. Tried whenever
// GitHub fails (it is blocked or throttled in mainland China). Safe because the
// signature covers WHAT is installed, never the URLs. QB_DB_MIRROR_URL overrides
// it ("" = off); a test that points QB_DB_MANIFEST_URL elsewhere gets no mirror
// unless it asks for one, so it never downloads the real database by accident.
const MIRROR_BASE_URL = String(process.env.QB_DB_MIRROR_URL != null ? process.env.QB_DB_MIRROR_URL
  : process.env.QB_DB_MANIFEST_URL ? "" : "https://updates.onlinequiz.net").replace(/\/+$/, "");
const MIRROR_MANIFEST_URL = MIRROR_BASE_URL ? MIRROR_BASE_URL + "/db/db-manifest.json" : "";
const mirrorPartUrl = (m, p) => (MIRROR_BASE_URL ? MIRROR_BASE_URL + "/db/" + encodeURIComponent(String(m.version)) + "/" + encodeURIComponent(p.name) : "");
// Newest questions.db schema this build can read. A manifest for a newer schema
// is ignored (the app update that understands it has to land first).
export const DB_SCHEMA_MAX = 2;
// Same key as the signed main-process updates (keys/main-update-private.pem).
const PUBLIC_KEY_PEM =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MCowBQYDK2VwAyEAqIHAYtG9qxfWDacA6zfGqPfPTKfmF5zFYBniVkl6QLY=\n" +
  "-----END PUBLIC KEY-----\n";

export function isConfigured() {
  return !!MANIFEST_URL;
}

// What gets signed: everything that decides WHAT is installed (not the URLs,
// which may move hosts, nor the display name).
export function dbCanonical(m) {
  return ["qbdb", m.format, m.version, m.schema, m.size, m.sha256, m.compression]
    .concat((m.parts || []).map((p) => p.name + ":" + p.size + ":" + p.sha256))
    .join("\n");
}

export function verifyDbManifest(m, publicKeyPem = PUBLIC_KEY_PEM) {
  try {
    if (!m || m.format !== 1 || !m.signature || !Array.isArray(m.parts) || !m.parts.length) return false;
    if (m.compression !== "br" || !/^[0-9a-f]{64}$/.test(m.sha256 || "") || !(m.size > 0)) return false;
    if (!m.parts.every((p) => p && p.name && p.url && p.size > 0 && /^[0-9a-f]{64}$/.test(p.sha256 || ""))) return false;
    return edVerify(null, Buffer.from(dbCanonical(m), "utf8"), createPublicKey(publicKeyPem), Buffer.from(m.signature, "base64"));
  } catch { return false; }
}

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/** Build stamp + schema of a questions.db file ({ok:false} when unreadable). */
export function dbStamp(path) {
  if (!path || !existsSync(path)) return { ok: false };
  let db;
  try {
    db = new DatabaseSync(path, { readOnly: true });
    const hasMeta = !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='meta'").get();
    const meta = (k) => (hasMeta ? (db.prepare("SELECT value FROM meta WHERE key = ?").get(k) || {}).value : null);
    db.prepare("SELECT 1 FROM tossups LIMIT 1").get();   // a question database at all
    return { ok: true, stamp: num(meta("built_at")), schema: num(meta("schema_version")) || 1, mode: meta("source_mode") || "" };
  } catch { return { ok: false }; }
  finally { try { db && db.close(); } catch {} }
}

/**
 * Which database to open: a downloaded one (in userData) wins over the copy
 * bundled with the app when it is readable, of a supported schema, and built
 * later. A downloaded copy older than a newer app's bundled one is deleted.
 */
export function pickDbPath(bundledPath, downloadedPath) {
  // a download verified last session but not yet switched to: nothing has the file open now
  try { if (downloadedPath && downloadedPath !== bundledPath) commitUpdate(downloadedPath); } catch {}
  if (!downloadedPath || downloadedPath === bundledPath || !existsSync(downloadedPath)) return bundledPath;
  const d = dbStamp(downloadedPath);
  if (!d.ok || d.schema > DB_SCHEMA_MAX) return bundledPath;
  const b = dbStamp(bundledPath);
  if (!b.ok || d.stamp > b.stamp) return downloadedPath;
  try { rmSync(downloadedPath, { force: true }); } catch {}
  return bundledPath;
}

// null = nothing published yet (404)
async function fetchManifestFrom(url) {
  const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`update manifest → ${r.status}`);
  return r.json();
}
// GitHub first; the mirror when GitHub can't be reached (not when it answers
// "nothing published"). An explicit url (tests, callers) is used alone.
async function fetchManifest(url) {
  if (url) return fetchManifestFrom(url);
  try { return await fetchManifestFrom(MANIFEST_URL); }
  catch (e) {
    if (!MIRROR_MANIFEST_URL) throw e;
    return fetchManifestFrom(MIRROR_MANIFEST_URL);
  }
}

function latestOf(m) {
  const dl = m.parts.reduce((a, p) => a + p.size, 0);
  return { id: String(m.version), name: String(m.name || "Question database").slice(0, 120), mode: String(m.mode || ""), size: dl, dbSize: m.size };
}

/**
 * @param {{currentVersion?: string|number, manifestUrl?: string, publicKeyPem?: string}} opts
 * @returns {{configured, available, latest: {id, name, mode, size, dbSize}|null, current}}
 */
export async function checkForUpdate(opts = {}) {
  const current = String(opts.currentVersion || "0");
  if (!isConfigured() && !opts.manifestUrl) return { configured: false, available: false, latest: null, current };
  const m = await fetchManifest(opts.manifestUrl);
  if (!m) return { configured: true, available: false, latest: null, current };
  if (!verifyDbManifest(m, opts.publicKeyPem)) throw new Error("the update manifest failed verification");
  const supported = num(m.schema) <= DB_SCHEMA_MAX;
  return {
    configured: true,
    available: supported && num(m.version) > num(current),
    needsAppUpdate: !supported,
    latest: latestOf(m),
    current,
  };
}

const MB = 1024 * 1024;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sha256File(path) {
  const h = createHash("sha256");
  await pipeline(createReadStream(path), new Transform({ transform(c, _e, cb) { h.update(c); cb(null); } }));
  return h.digest("hex");
}

// One part → disk, verified. An existing file with the right size + hash is
// kept (resume). `urls` are its sources (the manifest's, then the mirror's):
// attempts alternate between them, a source that answers nothing within 20 s
// or stalls for 60 s is dropped for that attempt, and the index of the source
// that worked is returned so the next part starts there.
async function downloadPart(part, file, onBytes, urls = [part.url], start = 0) {
  if (existsSync(file) && statSync(file).size === part.size && (await sha256File(file)) === part.sha256) {
    onBytes(part.size);
    return start;
  }
  let lastErr = null;
  const n = urls.length;
  for (let attempt = 0; attempt < 4 * n; attempt++) {
    if (attempt && attempt % n === 0) await sleep(1500 * (attempt / n));
    const src = (start + attempt) % n;
    const ac = new AbortController();
    let idle = setTimeout(() => ac.abort(), 20000);   // until the response starts
    let got = 0;
    try {
      const r = await fetch(urls[src], { signal: ac.signal, redirect: "follow" });
      if (!r.ok || !r.body) throw new Error(`download → ${r.status}`);
      const h = createHash("sha256");
      clearTimeout(idle); idle = setTimeout(() => ac.abort(), 60000);
      const meter = new Transform({
        transform(chunk, _e, cb) {
          clearTimeout(idle); idle = setTimeout(() => ac.abort(), 60000);
          got += chunk.length; h.update(chunk); onBytes(chunk.length);
          cb(null, chunk);
        },
      });
      await pipeline(Readable.fromWeb(r.body), meter, createWriteStream(file + ".tmp"));
      clearTimeout(idle);
      if (got !== part.size || h.digest("hex") !== part.sha256) throw new Error("a downloaded piece was corrupted");
      renameSync(file + ".tmp", file);
      return src;
    } catch (e) {
      clearTimeout(idle);
      onBytes(-got);
      try { rmSync(file + ".tmp", { force: true }); } catch {}
      lastErr = e.name === "AbortError" ? new Error("the download stalled") : e;
    }
  }
  throw lastErr || new Error("download failed");
}

function freeBytes(dir) {
  try { const s = statfsSync(dir); return Number(s.bavail) * Number(s.bsize); } catch { return Infinity; }
}
const gb = (n) => (n / 1024 / MB).toFixed(1) + " GB";

/**
 * Download the database `version` and leave it VERIFIED next to the target,
 * ready to swap in: <targetPath>.new plus a <targetPath>.ready marker. Nothing
 * the app has open is touched, so this runs in the background while the app
 * keeps using its current database; commitUpdate() does the instant swap.
 * The downloaded pieces live in <targetPath>.download/ (kept for a resume).
 * @param {string} version
 * @param {string} targetPath
 * @param {(p:{label:string,pct:number})=>void} [onProgress]
 * @param {{manifestUrl?: string, publicKeyPem?: string}} [opts]
 */
export async function prepareUpdate(version, targetPath, onProgress = () => {}, opts = {}) {
  onProgress({ label: "Checking…", pct: 1 });
  const m = await fetchManifest(opts.manifestUrl);
  if (!m) throw new Error("no database update is published");
  if (!verifyDbManifest(m, opts.publicKeyPem)) throw new Error("the update manifest failed verification");
  if (num(m.schema) > DB_SCHEMA_MAX) throw new Error("this database needs a newer version of the app");
  if (version && String(m.version) !== String(version)) throw new Error("a newer database was published meanwhile; check again");

  const dir = dirname(targetPath);
  mkdirSync(dir, { recursive: true });
  const work = targetPath + ".download";
  mkdirSync(work, { recursive: true });
  // pieces of an older release are useless now
  const keep = new Set(m.parts.map((p) => p.name));
  for (const f of readdirSync(work)) if (!keep.has(f)) { try { rmSync(join(work, f), { force: true }); } catch {} }

  const total = m.parts.reduce((a, p) => a + p.size, 0);
  const have = m.parts.reduce((a, p) => { const f = join(work, p.name); return a + (existsSync(f) && statSync(f).size === p.size ? p.size : 0); }, 0);
  const need = (total - have) + m.size + 200 * MB;
  if (freeBytes(dir) < need) throw new Error(`not enough disk space: ${gb(need)} free is needed`);

  let done = 0, lastPct = -1;
  const onBytes = (n) => {
    done += n;
    const pct = Math.round(2 + (78 * done) / total);
    if (pct !== lastPct) { lastPct = pct; onProgress({ label: `Downloading… ${Math.round(done / MB)} / ${Math.round(total / MB)} MB`, pct }); }
  };
  let src = 0;
  for (const p of m.parts) {
    const urls = [...new Set([p.url, mirrorPartUrl(m, p)].filter(Boolean))];
    src = await downloadPart(p, join(work, p.name), onBytes, urls, Math.min(src, urls.length - 1));
  }

  // Decompress the pieces in order into a temp file next to the target.
  onProgress({ label: "Unpacking…", pct: 82 });
  const tmp = targetPath + ".new";
  try { rmSync(targetPath + ".ready", { force: true }); rmSync(tmp, { force: true }); } catch {}
  const h = createHash("sha256");
  let out = 0, lastU = -1;
  async function* pieces() { for (const p of m.parts) yield* createReadStream(join(work, p.name)); }
  const meter = new Transform({
    transform(chunk, _e, cb) {
      out += chunk.length; h.update(chunk);
      const pct = Math.round(82 + (14 * out) / m.size);
      if (pct !== lastU) { lastU = pct; onProgress({ label: "Unpacking…", pct: Math.min(96, pct) }); }
      cb(null, chunk);
    },
  });
  try {
    await pipeline(Readable.from(pieces()), createBrotliDecompress(), meter, createWriteStream(tmp));
    if (out !== m.size || h.digest("hex") !== m.sha256) throw new Error("the unpacked database did not match the published one");
    onProgress({ label: "Checking the database…", pct: 97 });
    const st = dbStamp(tmp);
    if (!st.ok || String(st.stamp) !== String(m.version)) throw new Error("the downloaded database could not be opened");
    writeFileSync(targetPath + ".ready", JSON.stringify({ version: String(m.version), size: m.size, sha256: m.sha256, name: latestOf(m).name }));
  } catch (e) {
    try { rmSync(tmp, { force: true }); } catch {}
    throw e;
  }
  try { rmSync(work, { recursive: true, force: true }); } catch {}
  onProgress({ label: "Ready", pct: 100 });
  return { version: String(m.version), name: latestOf(m).name };
}

/** A verified download waiting at <targetPath>.new, or null. */
export function pendingUpdate(targetPath) {
  try {
    const r = JSON.parse(readFileSync(targetPath + ".ready", "utf8"));
    const st = statSync(targetPath + ".new");
    if (st.size !== r.size) return null;
    const s = dbStamp(targetPath + ".new");
    return s.ok && String(s.stamp) === String(r.version) ? r : null;
  } catch { return null; }
}

/**
 * Swap a prepared download into place (the caller has closed any handle on
 * targetPath). Returns {version, name, tossups, bonuses}, or null if nothing
 * verified is waiting.
 */
export function commitUpdate(targetPath) {
  const r = pendingUpdate(targetPath);
  if (!r) return null;
  renameSync(targetPath + ".new", targetPath);
  try { rmSync(targetPath + ".ready", { force: true }); } catch {}
  let tossups = 0, bonuses = 0, db;
  try {
    db = new DatabaseSync(targetPath, { readOnly: true });
    tossups = db.prepare("SELECT COUNT(*) AS n FROM tossups WHERE playable = 1").get().n;
    bonuses = db.prepare("SELECT COUNT(*) AS n FROM bonuses WHERE playable = 1").get().n;
  } catch {} finally { try { db && db.close(); } catch {} }
  return { version: r.version, name: r.name, tossups, bonuses };
}

/** prepareUpdate + commitUpdate (caller closes its handle first). */
export async function applyUpdate(version, targetPath, onProgress = () => {}, opts = {}) {
  await prepareUpdate(version, targetPath, onProgress, opts);
  const r = commitUpdate(targetPath);
  if (!r) throw new Error("the downloaded database could not be installed");
  return r;
}
