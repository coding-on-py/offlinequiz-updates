/**
 * Question-database updater.
 *
 * Checks a public Google Drive folder for the newest snapshot (a MongoDB dump:
 * sets/packets/tossups/bonuses .bson), and rebuilds the local questions.db from
 * it. Listing a Drive folder requires an API key — paste a Google Drive API key
 * into GOOGLE_API_KEY below (Google Cloud Console → APIs & Services → Enable
 * "Google Drive API" → Credentials → Create API key; restrict it to the Drive
 * API). Without a key, the updater reports "not configured" and the app still
 * works with its bundled database.
 */
import { DatabaseSync } from "node:sqlite";
import { existsSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

// Load the bson module no matter where THIS file runs from. A bare
// import("bson") resolves relative to the importing file — fine inside the app
// bundle (node_modules/bson ships in the asar), but this file also runs from
// the OTA overlay dir under userData, where that walk finds nothing. Fall back
// to resolving through the packaged app's own package.json.
async function loadBson() {
  try { return await import("bson"); } catch (e) {}
  const candidates = [];
  if (process.resourcesPath) {
    candidates.push(join(process.resourcesPath, "app.asar", "package.json"));
    candidates.push(join(process.resourcesPath, "app", "package.json"));
  }
  candidates.push(join(process.cwd(), "package.json"));
  for (const c of candidates) {
    try { return createRequire(c)("bson"); } catch (e) {}
  }
  throw new Error("bson module not found — reinstall the app");
}

// ── Configuration ──────────────────────────────────────────
export const GOOGLE_API_KEY = "AIzaSyCSyvh5_21xzogdKlLhM27b9OGODQssyww"; // Drive API key — restrict to Drive API only
const ROOT_FOLDER_ID = "1ECdCeXNAFAEur71C5-k5iLNqSI-OM8sK";
const DRIVE = "https://www.googleapis.com/drive/v3";

const FOLDER_MIME = "application/vnd.google-apps.folder";

export function isConfigured() {
  return !!GOOGLE_API_KEY;
}

async function driveJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** Newest sub-folder (snapshot) inside the root folder, by creation time. */
async function latestSnapshot() {
  const q = encodeURIComponent(`'${ROOT_FOLDER_ID}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`);
  const url = `${DRIVE}/files?q=${q}&orderBy=createdTime desc&pageSize=20&fields=files(id,name,createdTime)&key=${GOOGLE_API_KEY}`;
  const data = await driveJson(url);
  const folders = data.files || [];
  return folders[0] || null;
}

/**
 * @param {string|null} currentVersion - the folder id of the currently-installed snapshot
 * @returns {{configured:boolean, available:boolean, latest:object|null, current:string|null}}
 */
export async function checkForUpdate(currentVersion) {
  if (!isConfigured()) return { configured: false, available: false, latest: null, current: currentVersion || null };
  const latest = await latestSnapshot();
  return {
    configured: true,
    available: !!latest && latest.id !== currentVersion,
    latest,
    current: currentVersion || null,
  };
}

async function listFilesInFolder(folderId) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const url = `${DRIVE}/files?q=${q}&pageSize=100&fields=files(id,name,size)&key=${GOOGLE_API_KEY}`;
  const data = await driveJson(url);
  const map = {};
  for (const f of data.files || []) map[f.name] = f;
  return map;
}

async function downloadBson(fileId) {
  const res = await fetch(`${DRIVE}/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Split a mongodump .bson buffer (concatenated documents) into objects. */
function parseBsonDocs(buf, deserialize) {
  const docs = [];
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let o = 0;
  while (o + 4 <= buf.length) {
    const size = dv.getInt32(o, true);
    if (size <= 0 || o + size > buf.length) break;
    docs.push(deserialize(buf.subarray(o, o + size), { promoteValues: true, promoteLongs: true }));
    o += size;
  }
  return docs;
}

const idStr = (v) => (v == null ? "" : typeof v === "object" && v.toString ? v.toString() : String(v));
const num = (v) => (typeof v === "number" ? v : v == null ? 0 : Number(v) || 0);
const bool01 = (v) => (v ? 1 : 0);

const SCHEMA = `
  CREATE TABLE tossups (
    id TEXT PRIMARY KEY, question TEXT, question_sanitized TEXT, answer TEXT, answer_sanitized TEXT,
    category TEXT, subcategory TEXT, alternate_subcategory TEXT, difficulty INTEGER, set_id TEXT, set_name TEXT, set_year INTEGER,
    packet_id TEXT, packet_name TEXT, packet_number INTEGER, question_number INTEGER, standard INTEGER
  );
  CREATE TABLE bonuses (
    id TEXT PRIMARY KEY, leadin TEXT, leadin_sanitized TEXT, parts TEXT, parts_sanitized TEXT,
    answers TEXT, answers_sanitized TEXT, category TEXT, subcategory TEXT, alternate_subcategory TEXT, difficulty INTEGER,
    set_id TEXT, set_name TEXT, set_year INTEGER, packet_id TEXT, packet_name TEXT,
    packet_number INTEGER, question_number INTEGER, point_values TEXT, standard INTEGER
  );
  CREATE TABLE sets ( id TEXT PRIMARY KEY, name TEXT, year INTEGER, difficulty INTEGER, standard INTEGER );
  CREATE TABLE packets ( id TEXT PRIMARY KEY, name TEXT, set_id TEXT, number INTEGER );
  CREATE INDEX idx_tossups_altsub ON tossups(alternate_subcategory);
  CREATE INDEX idx_bonuses_altsub ON bonuses(alternate_subcategory);
  CREATE INDEX idx_tossups_category ON tossups(category);
  CREATE INDEX idx_tossups_difficulty ON tossups(difficulty);
  CREATE INDEX idx_tossups_set_id ON tossups(set_id);
  CREATE INDEX idx_tossups_set_name ON tossups(set_name);
  CREATE INDEX idx_tossups_standard ON tossups(standard);
  CREATE INDEX idx_bonuses_category ON bonuses(category);
  CREATE INDEX idx_bonuses_difficulty ON bonuses(difficulty);
  CREATE INDEX idx_bonuses_set_id ON bonuses(set_id);
  CREATE INDEX idx_bonuses_set_name ON bonuses(set_name);
  CREATE INDEX idx_bonuses_standard ON bonuses(standard);
`;

const FTS = `
  CREATE VIRTUAL TABLE tossups_fts USING fts5(
    question_sanitized, answer_sanitized, category, subcategory, set_name,
    content='tossups', content_rowid='rowid');
  INSERT INTO tossups_fts(rowid, question_sanitized, answer_sanitized, category, subcategory, set_name)
    SELECT rowid, question_sanitized, answer_sanitized, category, subcategory, set_name FROM tossups;
  CREATE VIRTUAL TABLE bonuses_fts USING fts5(
    leadin_sanitized, parts_sanitized, answers_sanitized, category, subcategory, set_name,
    content='bonuses', content_rowid='rowid');
  INSERT INTO bonuses_fts(rowid, leadin_sanitized, parts_sanitized, answers_sanitized, category, subcategory, set_name)
    SELECT rowid, leadin_sanitized, parts_sanitized, answers_sanitized, category, subcategory, set_name FROM bonuses;
`;

/**
 * Download the given snapshot folder and rebuild the questions DB at `dbPath`.
 * Writes to a temp file then atomically replaces. The caller must close any open
 * handle to `dbPath` first (and reopen after).
 * @param {string} folderId
 * @param {string} dbPath
 * @param {(msg:string)=>void} [onProgress]
 */
export async function applyUpdate(folderId, dbPath, onProgress = () => {}) {
  if (!isConfigured()) throw new Error("updater not configured (missing GOOGLE_API_KEY)");
  const { deserialize } = await loadBson();

  onProgress({ label: "Locating files…", pct: 4 });
  const files = await listFilesInFolder(folderId);
  const need = ["sets.bson", "packets.bson", "tossups.bson", "bonuses.bson"];
  for (const n of need) if (!files[n]) throw new Error(`missing ${n} in the update folder`);

  onProgress({ label: "Downloading sets…", pct: 12 });
  const setDocs = parseBsonDocs(await downloadBson(files["sets.bson"].id), deserialize);
  onProgress({ label: "Downloading packets…", pct: 22 });
  const packetDocs = parseBsonDocs(await downloadBson(files["packets.bson"].id), deserialize);
  onProgress({ label: "Downloading tossups…", pct: 40 });
  const tossupDocs = parseBsonDocs(await downloadBson(files["tossups.bson"].id), deserialize);
  onProgress({ label: "Downloading bonuses…", pct: 62 });
  const bonusDocs = parseBsonDocs(await downloadBson(files["bonuses.bson"].id), deserialize);

  onProgress({ label: "Building database…", pct: 80 });
  const tmpPath = dbPath + ".new";
  if (existsSync(tmpPath)) rmSync(tmpPath);
  const db = new DatabaseSync(tmpPath);
  try {
    db.exec("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;");
    db.exec(SCHEMA);

    const setInfo = {};
    db.exec("BEGIN");
    const insSet = db.prepare("INSERT OR IGNORE INTO sets (id,name,year,difficulty,standard) VALUES (?,?,?,?,?)");
    for (const s of setDocs) {
      const id = idStr(s._id);
      const info = { name: s.name || "", year: num(s.year), standard: s.standard ? 1 : 0 };
      setInfo[id] = info;
      insSet.run(id, info.name, info.year, num(s.difficulty), info.standard);
    }
    const insPkt = db.prepare("INSERT OR IGNORE INTO packets (id,name,set_id,number) VALUES (?,?,?,?)");
    for (const p of packetDocs) {
      insPkt.run(idStr(p._id), p.name || "", idStr(p.set && p.set._id), num(p.number));
    }

    const insT = db.prepare(`INSERT OR IGNORE INTO tossups
      (id,question,question_sanitized,answer,answer_sanitized,category,subcategory,alternate_subcategory,difficulty,
       set_id,set_name,set_year,packet_id,packet_name,packet_number,question_number,standard)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    let tCount = 0;
    for (const q of tossupDocs) {
      const category = q.category || "";
      const subcategory = q.subcategory || "";
      if (subcategory === "Ancient History" && category !== "History") continue; // strays only valid under History
      const setRef = q.set || {};
      const setId = idStr(setRef._id);
      const meta = setInfo[setId] || {};
      const pkt = q.packet || {};
      insT.run(
        idStr(q._id), q.question || "", q.question_sanitized || "", q.answer || "", q.answer_sanitized || "",
        category, subcategory, q.alternate_subcategory || "", num(q.difficulty), setId, meta.name || setRef.name || "",
        num(setRef.year) || meta.year || 0, idStr(pkt._id), pkt.name || "", num(pkt.number),
        num(q.number), meta.standard != null ? meta.standard : 1,
      );
      tCount++;
    }

    const insB = db.prepare(`INSERT OR IGNORE INTO bonuses
      (id,leadin,leadin_sanitized,parts,parts_sanitized,answers,answers_sanitized,category,subcategory,alternate_subcategory,
       difficulty,set_id,set_name,set_year,packet_id,packet_name,packet_number,question_number,point_values,standard)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    let bCount = 0;
    for (const q of bonusDocs) {
      const category = q.category || "";
      const subcategory = q.subcategory || "";
      if (subcategory === "Ancient History" && category !== "History") continue;
      const setRef = q.set || {};
      const setId = idStr(setRef._id);
      const meta = setInfo[setId] || {};
      const pkt = q.packet || {};
      const values = JSON.stringify((q.values || [10, 10, 10]).map(num));
      insB.run(
        idStr(q._id), q.leadin || "", q.leadin_sanitized || "", JSON.stringify(q.parts || []),
        JSON.stringify(q.parts_sanitized || []), JSON.stringify(q.answers || []), JSON.stringify(q.answers_sanitized || []),
        category, subcategory, q.alternate_subcategory || "", num(q.difficulty), setId, meta.name || setRef.name || "",
        num(setRef.year) || meta.year || 0, idStr(pkt._id), pkt.name || "", num(pkt.number),
        num(q.number), values, meta.standard != null ? meta.standard : 1,
      );
      bCount++;
    }
    db.exec("COMMIT");

    onProgress({ label: "Indexing for search…", pct: 92 });
    db.exec(FTS);
    // Stamp the snapshot id INSIDE the database so "up to date" is detected no
    // matter which profile/transport/user-data dir later asks.
    db.exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)");
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('snapshot_id', ?)").run(folderId);
    db.exec("ANALYZE");
    db.close();

    // Atomically swap the new DB into place.
    if (existsSync(dbPath)) rmSync(dbPath);
    renameSync(tmpPath, dbPath);

    return { version: folderId, tossups: tCount, bonuses: bCount, sets: setDocs.length };
  } catch (e) {
    try { db.close(); } catch {}
    if (existsSync(tmpPath)) { try { rmSync(tmpPath); } catch {} }
    throw e;
  }
}
