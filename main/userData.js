import { DatabaseSync } from "node:sqlite";
import { dirname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

// ── Sync (an account links a profile to onlinequiz.net) ──
// Every synced record carries mtime (when it last changed, ms) and seq (this
// database's change counter; 0 = it came from the other side and needn't go
// back); a deletion leaves a tombstone (sync_tomb). Synced: practice history
// (sessions), stars, and the profile's settings / review lists / plugin data
// (config keys matching SYNC_KEY). exportChanges and applyChanges are the two
// halves of POST /api/sync — the app sends what changed since its last push and
// applies what the server returns; the server does the same on the account's
// own database. The newest mtime wins (review dismissals merge instead).
const SYNC_KEY = /^(settings|review_dismissed|review_manual|trials|overrides|refund_note|ach_at|plug):/;
const SYNC_NAME = /^(settings|review_dismissed|review_manual|trials|overrides|refund_note|ach_at)$|^plug:[^:]+:.+$/;
const MAX_SYNC_VALUE = 900 * 1024;   // a bigger config value stays on its device
const sessionKey = (r) => JSON.stringify([String(r.session_id), String(r.type), r.question_id == null ? "" : String(r.question_id), Number(r.timestamp)]);

// Seasonal events (14.90 Halloween, 15.29 Thanksgiving). One tossup in `every` is the event's item (a hash of its
// id with the event's id, the same everywhere: the app, the website, the game server, the leaderboard); powering
// one during the event collects it (each question once), and `goal` of them is the event's badge. Halloween ends as
// Thanksgiving starts, midnight on November 1 (U.S. Pacific: 07:00 UTC). Kept here: the over-the-air update ships
// only the existing main files.
export const EVENTS = [
  { id: "halloween-2026", key: "halloween", name: "Halloween", item: "candy", start: Date.UTC(2026, 9, 16), end: Date.UTC(2026, 10, 1, 7), every: 8, goal: 31 },
  { id: "thanksgiving-2026", key: "thanksgiving", name: "Thanksgiving", item: "pie", start: Date.UTC(2026, 10, 1, 7), end: Date.UTC(2026, 11, 1, 8), every: 8, goal: 26 },
];
// Halloween, by its old name (older code reads EVENT.start / .end / .goal); pumpkinEvery is its `every`
export const EVENT = { ...EVENTS[0], pumpkinEvery: EVENTS[0].every };
export const eventAt = (now = Date.now()) => EVENTS.find((e) => now >= e.start && now < e.end) || null;
export const eventOn = (now = Date.now()) => !!eventAt(now);
export function isEventItem(id, ev) {
  if (id == null || id === "" || !ev) return false;
  const s = ev.id + ":" + id;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h % ev.every === 0;
}
// a Halloween pumpkin (the same hash as ever)
export function isPumpkin(id) { return isEventItem(id, EVENTS[0]); }
// the event this tossup is an item of right now, or null
export function eventItemNow(id, now = Date.now()) { const ev = eventAt(now); return ev && isEventItem(id, ev) ? ev : null; }

// Trials (14.88): { "<category>|<level>": { s: last start, p: first pass, l: last pass } } (ms)
export function mergeTrials(a, b) {
  const out = {};
  for (const src of [a || {}, b || {}]) for (const [k, v] of Object.entries(src)) {
    if (!/^[a-z]+\|\d{1,2}$/.test(k) || !v || typeof v !== "object") continue;
    const o = out[k] || (out[k] = {});
    if (Number(v.s) > (o.s || 0)) { o.s = Number(v.s); if (v.run) o.run = String(v.run).slice(0, 40); else delete o.run; }   // (who runs the latest start)
    if (Number(v.p) > 0 && (!o.p || Number(v.p) < o.p)) o.p = Number(v.p);
    if (Number(v.l) > (o.l || 0)) o.l = Number(v.l);
    if (Number(v.e) > (o.e || 0)) o.e = Number(v.e);   // 15.0: the last attempt's end (the cooldown counts from it)
    // 15.0: XP by attempt (its start → its XP): the union, so no attempt is lost or counted twice
    if (v.a && typeof v.a === "object" && !Array.isArray(v.a)) for (const [ts, x] of Object.entries(v.a)) {
      if (!/^\d{10,14}$/.test(ts) || !(Number(x) >= 0)) continue;
      o.a = o.a || {};
      o.a[ts] = Math.max(o.a[ts] || 0, Math.min(Number(x), 2500));
    }
  }
  return out;
}

// When each achievement was unlocked (15.25): { "<achievement id>": ms }, the earliest time wins (an unlock found
// from the history and one seen live are the same unlock)
export function mergeAchDates(a, b) {
  const out = {};
  for (const src of [a || {}, b || {}]) {
    if (!src || typeof src !== "object" || Array.isArray(src)) continue;
    for (const [k, v] of Object.entries(src)) {
      const t = Math.floor(Number(v));
      if (!k || k.length > 120 || !(t > 0) || t > 4e12) continue;
      if (!(out[k] > 0) || t < out[k]) out[k] = t;
    }
  }
  return out;
}

export class UserData {
  constructor(dbPath) {
    const dir = dirname(dbPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA journal_mode=WAL");
    this.db.exec("PRAGMA foreign_keys=ON");
    this._activeProfile = null;
    this._initSchema();
    this._migrate();
  }

  _initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS starred (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('tossup', 'bonus')),
        starred_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('tossup', 'bonus')),
        question_id TEXT,
        category TEXT,
        subcategory TEXT,
        difficulty INTEGER,
        correct INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        celerity REAL,
        buzz_position INTEGER,
        bonus_parts_correct INTEGER,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
      CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions(category);
      CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_starred_type ON starred(type);
    `);
  }

  _migrate() {
    const sCol = this.db.prepare("PRAGMA table_info(sessions)").all();
    if (!sCol.some(c => c.name === "profile_id")) {
      this.db.exec("ALTER TABLE sessions ADD COLUMN profile_id TEXT DEFAULT 'default'");
    }
    if (!sCol.some(c => c.name === "given_answer")) {
      this.db.exec("ALTER TABLE sessions ADD COLUMN given_answer TEXT");
    }
    const stCol = this.db.prepare("PRAGMA table_info(starred)").all();
    if (!stCol.some(c => c.name === "profile_id")) {
      this.db.exec("ALTER TABLE starred ADD COLUMN profile_id TEXT DEFAULT 'default'");
    }

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_profile ON sessions(profile_id);
      CREATE INDEX IF NOT EXISTS idx_starred_profile ON starred(profile_id);
    `);

    try {
      this.db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_starred_unique ON starred(question_id, type, profile_id)");
    } catch {}

    // sync bookkeeping (see the top of this file)
    let fresh = false;
    for (const t of ["sessions", "starred"]) {
      const cols = this.db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
      if (!cols.includes("seq")) {
        this.db.exec(`ALTER TABLE ${t} ADD COLUMN mtime INTEGER; ALTER TABLE ${t} ADD COLUMN seq INTEGER NOT NULL DEFAULT 0; ALTER TABLE ${t} ADD COLUMN src TEXT;`);
        fresh = true;
      }
    }
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_tomb (profile_id TEXT NOT NULL, kind TEXT NOT NULL, key TEXT NOT NULL,
        mtime INTEGER NOT NULL, seq INTEGER NOT NULL DEFAULT 0, src TEXT, PRIMARY KEY (profile_id, kind, key));
      CREATE TABLE IF NOT EXISTS sync_meta (key TEXT PRIMARY KEY, mtime INTEGER NOT NULL, seq INTEGER NOT NULL DEFAULT 0, src TEXT);
      CREATE INDEX IF NOT EXISTS idx_sessions_seq ON sessions(profile_id, seq);
      CREATE INDEX IF NOT EXISTS idx_starred_seq ON starred(profile_id, seq);
      CREATE INDEX IF NOT EXISTS idx_tomb_seq ON sync_tomb(profile_id, seq);
      CREATE INDEX IF NOT EXISTS idx_sessions_key ON sessions(profile_id, session_id, timestamp);
    `);
    if (fresh) {
      // existing records get unique, increasing change numbers, so the first
      // sync carries everything this database already had
      this.db.exec("BEGIN");
      try {
        this.db.exec("UPDATE sessions SET mtime = timestamp, seq = id");
        let n = this.db.prepare("SELECT COALESCE(MAX(id), 0) AS m FROM sessions").get().m;
        this.db.prepare("UPDATE starred SET mtime = starred_at, seq = id + ?").run(n);
        n += this.db.prepare("SELECT COALESCE(MAX(id), 0) AS m FROM starred").get().m;
        const meta = this.db.prepare("INSERT OR IGNORE INTO sync_meta (key, mtime, seq) VALUES (?, 1, ?)");
        for (const r of this.db.prepare("SELECT key FROM config").all()) if (SYNC_KEY.test(r.key)) meta.run(r.key, ++n);
        this.db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('sync_seq', ?)").run(String(n));
        this.db.exec("COMMIT");
      } catch (e) { this.db.exec("ROLLBACK"); throw e; }
    }

    this.db.prepare("INSERT OR IGNORE INTO profiles (id, name, created_at) VALUES (?, ?, ?)").run("default", "Default", Date.now());
  }

  close() { this.db.close(); }

  getConfig(key) {
    const row = this.db.prepare("SELECT value FROM config WHERE key = ?").get(key);
    return row ? row.value : null;
  }

  setConfig(key, value) {
    this.db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").run(key, value);
    if (SYNC_KEY.test(key)) this._touchMeta(key);
  }

  deleteConfig(key) {
    this.db.prepare("DELETE FROM config WHERE key = ?").run(key);
  }

  // ── sync ──
  _nextSeq() {
    return Number(this.db.prepare("INSERT INTO config (key, value) VALUES ('sync_seq', '1') ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + 1 RETURNING value").get().value);
  }
  _touchMeta(key, mtime = Date.now()) {
    this.db.prepare("INSERT OR REPLACE INTO sync_meta (key, mtime, seq, src) VALUES (?, ?, ?, NULL)").run(key, mtime, this._nextSeq());
  }
  _tomb(kind, key, mtime = Date.now()) {
    this.db.prepare("INSERT OR REPLACE INTO sync_tomb (profile_id, kind, key, mtime, seq, src) VALUES (?, ?, ?, ?, ?, NULL)")
      .run(this.getActiveProfileId(), kind, key, mtime, this._nextSeq());
  }
  // Delete practice rows (a WHERE on sessions, profile already in it), leaving tombstones.
  _deleteSessionsWhere(where, params) {
    const rows = this.db.prepare("SELECT id, session_id, type, question_id, timestamp FROM sessions WHERE " + where).all(params);
    if (!rows.length) return { changes: 0 };
    const now = Date.now();
    this.db.exec("BEGIN");
    try {
      const del = this.db.prepare("DELETE FROM sessions WHERE id = ?");
      for (const r of rows) { this._tomb("s", sessionKey(r), now); del.run(r.id); }
      this.db.exec("COMMIT");
    } catch (e) { this.db.exec("ROLLBACK"); throw e; }
    return { changes: rows.length };
  }

  // What changed in the active profile after change number `since`, oldest
  // first, at most `limit` records (and ~1.2 MB). `cursor` is the last change
  // number looked at — the next call's `since`. Changes that came from device
  // `excludeSrc` are skipped (it has them already) but still move the cursor.
  exportChanges(since = 0, limit = 1500, excludeSrc = null) {
    const pid = this.getActiveProfileId();
    since = Math.max(0, Number(since) || 0);
    limit = Math.max(1, Math.min(5000, Number(limit) || 1500));
    const p = { pid, since, n: limit + 1 };
    const all = [
      ...this.db.prepare(`SELECT session_id, type, question_id, category, subcategory, difficulty, correct, points, celerity, buzz_position,
          bonus_parts_correct, given_answer, timestamp, mtime, seq, src FROM sessions WHERE profile_id = :pid AND seq > :since ORDER BY seq LIMIT :n`).all(p).map((r) => ({ k: "s", ...r })),
      ...this.db.prepare("SELECT question_id, type, starred_at, mtime, seq, src FROM starred WHERE profile_id = :pid AND seq > :since ORDER BY seq LIMIT :n").all(p).map((r) => ({ k: "r", ...r })),
      ...this.db.prepare("SELECT kind, key, mtime, seq, src FROM sync_tomb WHERE profile_id = :pid AND seq > :since ORDER BY seq LIMIT :n").all(p).map((r) => ({ k: "t", ...r })),
      ...this.db.prepare(`SELECT m.key, m.mtime, m.seq, m.src, c.value FROM sync_meta m JOIN config c ON c.key = m.key
          WHERE m.seq > :since AND (m.key IN ('settings:' || :pid, 'review_dismissed:' || :pid, 'review_manual:' || :pid, 'trials:' || :pid, 'overrides:' || :pid, 'refund_note:' || :pid, 'ach_at:' || :pid) OR m.key LIKE 'plug:' || :pid || ':%')
          ORDER BY m.seq LIMIT :n`).all(p).map((r) => ({ k: "c", ...r })),
    ].sort((a, b) => a.seq - b.seq);
    const out = [];
    let cursor = since, bytes = 0, more = false;
    for (const r of all) {
      if (out.length >= limit || bytes > 1.2e6) { more = true; break; }
      cursor = r.seq;
      if (excludeSrc != null && r.src === excludeSrc) continue;
      const { seq, src, ...c } = r;
      if (c.k === "c") {
        c.name = c.key.startsWith("plug:") ? "plug:" + c.key.slice(("plug:" + pid + ":").length) : c.key.slice(0, c.key.indexOf(":"));
        delete c.key;
        if (c.value != null && c.value.length > MAX_SYNC_VALUE) continue;
      }
      bytes += JSON.stringify(c).length;
      out.push(c);
    }
    if (!more && all.length > limit) more = true;
    return { changes: out, cursor, more };
  }

  // Apply changes from the other side to the active profile; the newest mtime
  // wins. assignSeq: number them here (the server, so other devices get them);
  // otherwise they're stored with seq 0 (the app: they came from the server).
  applyChanges(changes, opts = {}) {
    const pid = this.getActiveProfileId();
    const src = opts.src == null ? null : String(opts.src);
    const seqOf = () => (opts.assignSeq ? this._nextSeq() : 0);
    const getTomb = this.db.prepare("SELECT mtime FROM sync_tomb WHERE profile_id = ? AND kind = ? AND key = ?");
    const dropTomb = this.db.prepare("DELETE FROM sync_tomb WHERE profile_id = ? AND kind = ? AND key = ?");
    const findSession = this.db.prepare("SELECT id, mtime FROM sessions WHERE profile_id = ? AND session_id = ? AND type = ? AND IFNULL(question_id, '') = ? AND timestamp = ?");
    const findStar = this.db.prepare("SELECT id, mtime FROM starred WHERE profile_id = ? AND type = ? AND question_id = ?");
    const num = (v) => (v == null || v === "" || !isFinite(Number(v)) ? null : Number(v));
    const str = (v, max) => (v == null ? null : String(v).slice(0, max));
    let applied = 0;
    this.db.exec("BEGIN");
    try {
      for (const c of Array.isArray(changes) ? changes : []) {
        if (!c || typeof c !== "object") continue;
        const mt = Number(c.mtime) || 0;
        if (c.k === "s") {
          if ((c.type !== "tossup" && c.type !== "bonus") || !c.session_id || !isFinite(Number(c.timestamp))) continue;
          const key = sessionKey(c), tomb = getTomb.get(pid, "s", key);
          if (tomb && tomb.mtime >= mt) continue;
          const row = { sid: String(c.session_id).slice(0, 200), type: c.type, qid: str(c.question_id, 100), cat: str(c.category, 300) || "", sub: str(c.subcategory, 300) || "",
            diff: num(c.difficulty) || 0, cor: c.correct ? 1 : 0, pts: num(c.points) || 0, cel: num(c.celerity), bp: num(c.buzz_position), bpc: num(c.bonus_parts_correct),
            ga: str(c.given_answer, 1000), ts: Number(c.timestamp), mt, seq: seqOf(), src, pid };
          const ex = findSession.get(pid, row.sid, row.type, row.qid || "", row.ts);
          if (ex) {
            if ((ex.mtime || 0) >= mt) continue;
            this.db.prepare(`UPDATE sessions SET category = :cat, subcategory = :sub, difficulty = :diff, correct = :cor, points = :pts, celerity = :cel, buzz_position = :bp,
              bonus_parts_correct = :bpc, given_answer = :ga, mtime = :mt, seq = :seq, src = :src WHERE id = :id`).run({
              cat: row.cat, sub: row.sub, diff: row.diff, cor: row.cor, pts: row.pts, cel: row.cel, bp: row.bp, bpc: row.bpc, ga: row.ga, mt, seq: row.seq, src, id: ex.id });
          } else {
            this.db.prepare(`INSERT INTO sessions (session_id, type, question_id, category, subcategory, difficulty, correct, points, celerity, buzz_position,
              bonus_parts_correct, given_answer, timestamp, profile_id, mtime, seq, src) VALUES (:sid, :type, :qid, :cat, :sub, :diff, :cor, :pts, :cel, :bp, :bpc, :ga, :ts, :pid, :mt, :seq, :src)`).run(row);
          }
          if (tomb) dropTomb.run(pid, "s", key);
          applied++;
        } else if (c.k === "r") {
          if ((c.type !== "tossup" && c.type !== "bonus") || !c.question_id) continue;
          const qid = String(c.question_id).slice(0, 100), key = c.type + ":" + qid, tomb = getTomb.get(pid, "r", key);
          if (tomb && tomb.mtime >= mt) continue;
          const ex = findStar.get(pid, c.type, qid);
          if (ex) {
            if ((ex.mtime || 0) >= mt) continue;
            this.db.prepare("UPDATE starred SET starred_at = ?, mtime = ?, seq = ?, src = ? WHERE id = ?").run(num(c.starred_at) || mt, mt, seqOf(), src, ex.id);
          } else {
            this.db.prepare("INSERT OR IGNORE INTO starred (question_id, type, starred_at, profile_id, mtime, seq, src) VALUES (?, ?, ?, ?, ?, ?, ?)").run(qid, c.type, num(c.starred_at) || mt, pid, mt, seqOf(), src);
          }
          if (tomb) dropTomb.run(pid, "r", key);
          applied++;
        } else if (c.k === "t") {
          if ((c.kind !== "s" && c.kind !== "r") || typeof c.key !== "string" || c.key.length > 600) continue;
          const old = getTomb.get(pid, c.kind, c.key);
          if (old && old.mtime >= mt) continue;
          if (c.kind === "s") {
            let k; try { k = JSON.parse(c.key); } catch { continue; }
            if (!Array.isArray(k) || k.length !== 4) continue;
            const ex = findSession.get(pid, String(k[0]), String(k[1]), String(k[2]), Number(k[3]));
            if (ex && (ex.mtime || 0) <= mt) this.db.prepare("DELETE FROM sessions WHERE id = ?").run(ex.id);
          } else {
            const i = c.key.indexOf(":"), type = c.key.slice(0, i), qid = c.key.slice(i + 1);
            const ex = findStar.get(pid, type, qid);
            if (ex && (ex.mtime || 0) <= mt) this.db.prepare("DELETE FROM starred WHERE id = ?").run(ex.id);
          }
          this.db.prepare("INSERT OR REPLACE INTO sync_tomb (profile_id, kind, key, mtime, seq, src) VALUES (?, ?, ?, ?, ?, ?)").run(pid, c.kind, c.key, mt, seqOf(), src);
          applied++;
        } else if (c.k === "c") {
          const name = String(c.name || "");
          if (!SYNC_NAME.test(name) || typeof c.value !== "string" || c.value.length > MAX_SYNC_VALUE) continue;
          const key = name.startsWith("plug:") ? "plug:" + pid + ":" + name.slice(5) : name + ":" + pid;
          const meta = this.db.prepare("SELECT mtime FROM sync_meta WHERE key = ?").get(key);
          let value = c.value, mtime = mt, seq = seqOf(), from = src;
          if (name === "review_dismissed") {
            // dismissals merge: the later time per question wins
            let mine = {}, theirs = {};
            try { mine = JSON.parse(this.getConfig(key) || "{}") || {}; } catch {}
            try { theirs = JSON.parse(value) || {}; } catch { continue; }
            if (Array.isArray(mine)) mine = {};
            const merged = { ...mine };
            for (const [q, t] of Object.entries(theirs)) if (!(Number(merged[q]) >= Number(t))) merged[q] = Number(t) || 0;
            value = JSON.stringify(merged);
            mtime = Math.max(mt, meta ? meta.mtime : 0);
            // the sender lacks some of these: the merged list goes back to it
            // (the app pushes it; the server stops treating it as the sender's)
            if (Object.keys(merged).length > Object.keys(theirs).length) { seq = this._nextSeq(); from = null; }
          } else if (name === "overrides") {
            // answers marked right or wrong by hand (15.12): the union (a regrade never touches one of them)
            let mine = [], theirs = [];
            try { mine = JSON.parse(this.getConfig(key) || "[]") || []; } catch {}
            try { theirs = JSON.parse(value) || []; } catch { continue; }
            if (!Array.isArray(mine)) mine = [];
            if (!Array.isArray(theirs)) continue;
            const merged = [...new Set([...mine, ...theirs].map(String))].slice(-20000);
            value = JSON.stringify(merged);
            mtime = Math.max(mt, meta ? meta.mtime : 0);
            if (merged.length > theirs.length) { seq = this._nextSeq(); from = null; }
          } else if (name === "trials") {
            // trials merge per trial: the last start, the first pass and the last pass (a badge is never lost)
            let mine = {}, theirs = {};
            try { mine = JSON.parse(this.getConfig(key) || "{}") || {}; } catch {}
            try { theirs = JSON.parse(value) || {}; } catch { continue; }
            const merged = mergeTrials(mine, theirs);
            value = JSON.stringify(merged);
            mtime = Math.max(mt, meta ? meta.mtime : 0);
            if (value !== JSON.stringify(theirs)) { seq = this._nextSeq(); from = null; }
          } else if (name === "ach_at") {
            // achievement dates merge per achievement: the earliest unlock
            let mine = {}, theirs = {};
            try { mine = JSON.parse(this.getConfig(key) || "{}") || {}; } catch {}
            try { theirs = JSON.parse(value) || {}; } catch { continue; }
            const merged = mergeAchDates(mine, theirs);
            value = JSON.stringify(merged);
            mtime = Math.max(mt, meta ? meta.mtime : 0);
            if (value !== JSON.stringify(mergeAchDates(theirs))) { seq = this._nextSeq(); from = null; }
          } else if (meta && meta.mtime >= mt) continue;
          this.db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").run(key, value);
          this.db.prepare("INSERT OR REPLACE INTO sync_meta (key, mtime, seq, src) VALUES (?, ?, ?, ?)").run(key, mtime, seq, from);
          applied++;
        }
      }
      this.db.exec("COMMIT");
    } catch (e) { this.db.exec("ROLLBACK"); throw e; }
    return { applied };
  }

  // Leaderboard totals for the active profile: the last 7 days, the last 30
  // days and all time — q questions, pts points, pw powers, tu tossups, cor
  // correct tossups.
  leaderboardStats(now = Date.now()) {
    const pid = this.getActiveProfileId(), DAY = 864e5;
    const sum = (since, until = 8.64e15) => {
      const o = { q: 0, pts: 0, pw: 0, tu: 0, cor: 0 };
      // tu: the tossups answered (a skipped one isn't an attempt — leaderboards' accuracy is cor / tu)
      for (const r of this.db.prepare(`SELECT type, COUNT(*) AS n, SUM(points) AS pts, SUM(correct) AS c, SUM(CASE WHEN points >= 15 AND correct = 1 THEN 1 ELSE 0 END) AS pw,
          SUM(CASE WHEN COALESCE(given_answer, '') <> '(skipped)' THEN 1 ELSE 0 END) AS ans
          FROM sessions WHERE profile_id = ? AND timestamp >= ? AND timestamp < ? GROUP BY type`).all(pid, since, until)) {
        o.q += r.n; o.pts += r.pts || 0;
        if (r.type === "tossup") { o.tu = r.ans || 0; o.cor = r.c || 0; o.pw = r.pw || 0; }
      }
      return o;
    };
    const all = sum(0);
    // each event's board (the leaderboards' "Halloween", "Thanksgiving" periods): its practice and its items;
    // ev = Halloween's, by its old name
    all.events = {};
    for (const ev of EVENTS) if (now >= ev.start) all.events[ev.key] = { ...sum(ev.start, ev.end), items: this.eventItems(ev).length };
    all.ev = { ...(all.events.halloween || sum(EVENT.start, EVENT.end)), candy: (all.events.halloween || {}).items || 0 };
    return { week: sum(now - 7 * DAY), month: sum(now - 30 * DAY), all };
  }

  // A friend-list summary of the active profile's practice: today, the last 7
  // days, the day streak (in the owner's time zone, tz = minutes east of UTC).
  activitySummary(tz = 0, now = Date.now()) {
    const pid = this.getActiveProfileId();
    const off = (Number(tz) || 0) * 60000, DAY = 864e5;
    const dayOf = (t) => Math.floor((t + off) / DAY);
    const today = dayOf(now);
    const all = this.db.prepare("SELECT COUNT(*) AS n, MAX(timestamp) AS last FROM sessions WHERE profile_id = ?").get(pid);
    const todayN = this.db.prepare("SELECT COUNT(*) AS n FROM sessions WHERE profile_id = ? AND timestamp >= ?").get(pid, today * DAY - off).n;
    const wk = { questions: 0, tossups: 0, correct: 0, points: 0, powers: 0 };
    let wkAnswered = 0;
    for (const r of this.db.prepare(`SELECT type, COUNT(*) AS n, SUM(correct) AS c, SUM(points) AS pts, SUM(CASE WHEN points >= 15 AND correct = 1 THEN 1 ELSE 0 END) AS pw,
        SUM(CASE WHEN COALESCE(given_answer, '') <> '(skipped)' THEN 1 ELSE 0 END) AS ans
        FROM sessions WHERE profile_id = ? AND timestamp >= ? GROUP BY type`).all(pid, now - 7 * DAY)) {
      wk.questions += r.n; wk.points += r.pts || 0;
      if (r.type === "tossup") { wk.tossups = r.n; wk.correct = r.c || 0; wk.powers = r.pw || 0; wkAnswered = r.ans || 0; }
    }
    wk.accuracy = wkAnswered ? Math.round((100 * wk.correct) / wkAnswered) : null;   // skipped tossups left out
    const days = this.db.prepare("SELECT DISTINCT CAST((timestamp + ?) / 86400000 AS INTEGER) AS d FROM sessions WHERE profile_id = ? ORDER BY d DESC LIMIT 400").all(off, pid).map((r) => r.d);
    let streak = 0;
    if (days.length && days[0] >= today - 1) { let want = days[0]; for (const d of days) { if (d !== want) break; streak++; want--; } }
    return { total: all.n, today: todayN, week: wk, streak, lastActive: all.last || null };
  }

  // The Streaks page: the active profile's practice per day (tz = minutes east of
  // UTC, the viewer's own days), the current day streak (today or yesterday back)
  // and the longest one.
  activityDays(tz = 0, now = Date.now()) {
    const pid = this.getActiveProfileId();
    const off = (Number(tz) || 0) * 60000, DAY = 864e5;
    const today = Math.floor((now + off) / DAY);
    const rows = this.db.prepare(`SELECT CAST((timestamp + ?) / 86400000 AS INTEGER) AS d, COUNT(*) AS q,
        SUM(CASE WHEN type = 'tossup' THEN 1 ELSE 0 END) AS tu, SUM(CASE WHEN type = 'bonus' THEN 1 ELSE 0 END) AS bo,
        SUM(points) AS pts, SUM(CASE WHEN type = 'tossup' AND correct = 1 THEN 1 ELSE 0 END) AS cor,
        SUM(CASE WHEN type = 'tossup' AND correct = 1 AND points >= 15 THEN 1 ELSE 0 END) AS pw,
        SUM(CASE WHEN type = 'tossup' AND points < 0 THEN 1 ELSE 0 END) AS neg,
        SUM(CASE WHEN type = 'bonus' THEN COALESCE(bonus_parts_correct, 0) ELSE 0 END) AS bpc,
        SUM(CASE WHEN type = 'tossup' AND COALESCE(given_answer, '') <> '(skipped)' THEN 1 ELSE 0 END) AS tans
      FROM sessions WHERE profile_id = ? GROUP BY d ORDER BY d`).all(off, pid);
    const iso = (d) => new Date(d * DAY).toISOString().slice(0, 10);
    let best = 0, run = 0, prev = null;
    for (const r of rows) { run = prev != null && r.d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = r.d; }
    let streak = 0;
    if (rows.length && rows[rows.length - 1].d >= today - 1) { let want = rows[rows.length - 1].d; for (let i = rows.length - 1; i >= 0 && rows[i].d === want; i--) { streak++; want--; } }
    return {
      today: iso(today), streak, best,
      // tans: tossups answered (not skipped) — the day's accuracy is cor / tans
      days: rows.map((r) => ({ date: iso(r.d), q: r.q, tu: r.tu || 0, bo: r.bo || 0, pts: r.pts || 0, cor: r.cor || 0, pw: r.pw || 0, neg: r.neg || 0, bpc: r.bpc || 0, tans: r.tans || 0 })),
    };
  }

  getReviewDismissedMap() {
    const pid = this.getActiveProfileId();
    let raw;
    try { raw = JSON.parse(this.getConfig("review_dismissed:" + pid) || "{}"); } catch { raw = {}; }
    if (Array.isArray(raw)) {
      const now = Date.now();
      const map = {};
      raw.forEach((id) => { map[id] = now; });
      this.setConfig("review_dismissed:" + pid, JSON.stringify(map));
      return map;
    }
    return raw || {};
  }
  getReviewDismissed() { return Object.keys(this.getReviewDismissedMap()); }
  dismissReview(questionId) {
    const pid = this.getActiveProfileId();
    const map = this.getReviewDismissedMap();
    map[questionId] = Date.now();
    this.setConfig("review_dismissed:" + pid, JSON.stringify(map));
    return { ok: true };
  }

  // pluginId "*": everything the profile's plugins keep, { plugin: { key: value } } (the
  // renderer loads it at start: ctx.storage and plugin settings live here and sync)
  getPluginData(pluginId, key) {
    const pid = this.getActiveProfileId();
    if (pluginId === "*") {
      const pre = "plug:" + pid + ":", out = {};
      for (const r of this.db.prepare("SELECT key, value FROM config WHERE key >= ? AND key < ?").all(pre, pre + "\uffff")) {
        const rest = r.key.slice(pre.length), i = rest.indexOf(":");
        if (i <= 0) continue;
        let v; try { v = JSON.parse(r.value); } catch { continue; }
        (out[rest.slice(0, i)] = out[rest.slice(0, i)] || {})[rest.slice(i + 1)] = v;
      }
      return out;
    }
    const raw = this.getConfig("plug:" + pid + ":" + pluginId + ":" + key);
    try { return raw == null ? null : JSON.parse(raw); } catch { return null; }
  }
  setPluginData(pluginId, key, value) {
    const pid = this.getActiveProfileId();
    if (!pluginId || pluginId === "*" || !key) return { error: "plugin and key required" };
    const k = "plug:" + pid + ":" + pluginId + ":" + key, raw = JSON.stringify(value === undefined ? null : value);
    if (this.getConfig(k) === raw) return { ok: true };   // unchanged: nothing to sync
    this.setConfig(k, raw);
    return { ok: true };
  }

  // The site's admin: what this account keeps (answers, stars, plugin data), and clearing one
  // plugin entry — set to null, so the change syncs to the app like any other.
  adminSummary() {
    const one = (sql) => Number((this.db.prepare(sql).get() || {}).n || 0);
    const plugin = [];
    for (const r of this.db.prepare("SELECT key, length(value) AS n, substr(value, 1, 160) AS head FROM config WHERE key LIKE 'plug:%' ORDER BY key").all()) {
      const m = /^plug:([^:]+):([^:]+):(.+)$/.exec(r.key);
      if (!m || r.head === "null") continue;
      plugin.push({ profile: m[1], plugin: m[2], key: m[3], bytes: Number(r.n) || 0, preview: r.head });
    }
    return { profiles: one("SELECT COUNT(*) AS n FROM profiles"), starred: one("SELECT COUNT(*) AS n FROM starred"),
      answers: one("SELECT COUNT(*) AS n FROM sessions"), sessions: one("SELECT COUNT(DISTINCT session_id) AS n FROM sessions"), plugin };
  }
  adminClearPluginData(profile, pluginId, key) {
    const k = "plug:" + profile + ":" + pluginId + ":" + key;
    if (this.getConfig(k) == null) return { error: "Nothing stored there." };
    this.setConfig(k, "null");
    return { ok: true };
  }

  pluginSql(pluginId, sql, params) {
    const src = String(sql || "");
    const safeId = String(pluginId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safeId) throw new Error("plugin id required");
    const FORBIDDEN = /\b(sessions|starred|profiles|config|tossups|bonuses|sets|packets|sqlite_master|sqlite_sequence)\b/i;
    if (FORBIDDEN.test(src)) throw new Error("plugin SQL may only touch its own plug_" + safeId + "__* tables");
    if (/\b(attach|detach|pragma|vacuum)\b/i.test(src)) throw new Error("statement not allowed");
    const tables = src.match(/\bplug_[a-zA-Z0-9_-]+__[a-zA-Z0-9_]+/g) || [];
    const prefix = "plug_" + safeId + "__";
    for (const t of tables) if (!t.startsWith(prefix)) throw new Error("table " + t + " belongs to another plugin");
    const p2 = Array.isArray(params) ? params : [];
    if (/^\s*select\b/i.test(src)) return { rows: this.db.prepare(src).all(...p2) };
    if (p2.length) { const r = this.db.prepare(src).run(...p2); return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) }; }
    this.db.exec(src);
    return { ok: true };
  }

  getProfileSettings() {
    const pid = this.getActiveProfileId();
    const raw = this.getConfig("settings:" + pid);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  saveProfileSettings(obj) {
    const pid = this.getActiveProfileId();
    this.setConfig("settings:" + pid, JSON.stringify(obj || {}));
    return { ok: true };
  }


  createProfile(name) {
    const id = "prof-" + Date.now();
    this.db.prepare("INSERT INTO profiles (id, name, created_at) VALUES (?, ?, ?)").run(id, name, Date.now());
    return { id, name };
  }

  getProfiles() {
    return this.db.prepare("SELECT * FROM profiles ORDER BY created_at").all();
  }

  deleteProfile(id) {
    if (id === "default") return;
    this.db.prepare("DELETE FROM sessions WHERE profile_id = ?").run(id);
    this.db.prepare("DELETE FROM starred WHERE profile_id = ?").run(id);
    this.db.prepare("DELETE FROM profiles WHERE id = ?").run(id);
  }

  getActiveProfileId() {
    if (this._activeProfile) return this._activeProfile;
    const row = this.db.prepare("SELECT value FROM config WHERE key = 'active_profile'").get();
    this._activeProfile = row ? row.value : "default";
    return this._activeProfile;
  }

  setActiveProfile(id) {
    this._activeProfile = id;
    this.db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('active_profile', ?)").run(id);
  }

  getActiveProfile() {
    const id = this.getActiveProfileId();
    const row = this.db.prepare("SELECT * FROM profiles WHERE id = ?").get(id);
    return row || { id: "default", name: "Default" };
  }


  starQuestion(questionId, type) {
    const pid = this.getActiveProfileId();
    const now = Date.now();
    const r = this.db.prepare(
      "INSERT OR IGNORE INTO starred (question_id, type, starred_at, profile_id, mtime, seq) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(questionId, type, now, pid, now, this._nextSeq());
    if (r.changes) this.db.prepare("DELETE FROM sync_tomb WHERE profile_id = ? AND kind = 'r' AND key = ?").run(pid, type + ":" + questionId);
    return r;
  }

  unstarQuestion(questionId, type) {
    const pid = this.getActiveProfileId();
    const r = this.db.prepare("DELETE FROM starred WHERE question_id = ? AND type = ? AND profile_id = ?").run(questionId, type, pid);
    if (r.changes) this._tomb("r", type + ":" + questionId);
    return r;
  }

  isStarred(questionId, type) {
    const pid = this.getActiveProfileId();
    const row = this.db.prepare("SELECT 1 FROM starred WHERE question_id = ? AND type = ? AND profile_id = ?").get(questionId, type, pid);
    return !!row;
  }

  getStarredQuestions(type = null) {
    const pid = this.getActiveProfileId();
    if (type) return this.db.prepare("SELECT * FROM starred WHERE type = ? AND profile_id = ? ORDER BY starred_at DESC").all(type, pid);
    return this.db.prepare("SELECT * FROM starred WHERE profile_id = ? ORDER BY starred_at DESC").all(pid);
  }

  getStarredCount(type = null) {
    const pid = this.getActiveProfileId();
    if (type) {
      const row = this.db.prepare("SELECT COUNT(*) as count FROM starred WHERE type = ? AND profile_id = ?").get(type, pid);
      return row ? row.count : 0;
    }
    const row = this.db.prepare("SELECT COUNT(*) as count FROM starred WHERE profile_id = ?").get(pid);
    return row ? row.count : 0;
  }


  addSessionEntry(entry) {
    const pid = this.getActiveProfileId();
    const stmt = this.db.prepare(`
      INSERT INTO sessions (session_id, type, question_id, category, subcategory,
        difficulty, correct, points, celerity, buzz_position, bonus_parts_correct, given_answer, timestamp, profile_id, mtime, seq)
      VALUES (:session_id, :type, :question_id, :category, :subcategory,
        :difficulty, :correct, :points, :celerity, :buzz_position, :bonus_parts_correct, :given_answer, :timestamp, :profile_id, :mtime, :seq)
    `);
    return stmt.run({
      session_id: entry.session_id || "default",
      type: entry.type,
      question_id: entry.question_id || null,
      category: entry.category || "",
      subcategory: entry.subcategory || "",
      difficulty: entry.difficulty || 0,
      correct: entry.correct ? 1 : 0,
      points: entry.points || 0,
      celerity: entry.celerity != null ? entry.celerity : null,
      buzz_position: entry.buzz_position != null ? entry.buzz_position : null,
      bonus_parts_correct: entry.bonus_parts_correct != null ? entry.bonus_parts_correct : null,
      given_answer: entry.given_answer != null ? String(entry.given_answer) : null,
      timestamp: entry.timestamp || Date.now(),
      profile_id: pid,
      mtime: Date.now(),
      seq: this._nextSeq(),
    });
  }

  recordOverride(entry) {
    const pid = this.getActiveProfileId();
    const row = this.db.prepare(
      "SELECT id FROM sessions WHERE session_id = :s AND question_id = :q AND profile_id = :p ORDER BY timestamp DESC LIMIT 1"
    ).get({ s: entry.session_id || "default", q: entry.question_id || null, p: pid });
    if (!row) { const r = this.addSessionEntry(entry); this._noteOverride(r && r.lastInsertRowid); return r; }
    this._noteOverride(row.id);
    return this.db.prepare(
      "UPDATE sessions SET correct = :c, points = :pt, celerity = :cel, buzz_position = :bp, given_answer = :ga, mtime = :mt, seq = :seq, src = NULL WHERE id = :id"
    ).run({
      mt: Date.now(),
      seq: this._nextSeq(),
      c: entry.correct ? 1 : 0,
      pt: entry.points || 0,
      cel: entry.celerity != null ? entry.celerity : null,
      bp: entry.buzz_position != null ? entry.buzz_position : null,
      ga: entry.given_answer != null ? String(entry.given_answer) : null,
      id: row.id,
    });
  }

  // 15.12: an answer marked right or wrong by hand, remembered (synced) so a regrade never changes it
  _noteOverride(rowId) {
    if (rowId == null) return;
    const r = this.db.prepare("SELECT session_id, type, question_id, timestamp FROM sessions WHERE id = ?").get(Number(rowId));
    if (!r) return;
    const key = "overrides:" + this.getActiveProfileId();
    let list = []; try { list = JSON.parse(this.getConfig(key) || "[]") || []; } catch {}
    if (!Array.isArray(list)) list = [];
    const k = sessionKey(r);
    if (!list.includes(k)) { list.push(k); this.setConfig(key, JSON.stringify(list.slice(-20000))); }
  }
  overriddenKeys() {
    let list = []; try { list = JSON.parse(this.getConfig("overrides:" + this.getActiveProfileId()) || "[]") || []; } catch {}
    return new Set(Array.isArray(list) ? list.map(String) : []);
  }
  // 15.12 regrades: this profile's tossups marked wrong with a typed answer (negs and wrong answers at the end)
  regradeCandidates() {
    return this.db.prepare(`SELECT id, session_id, type, question_id, points, correct, celerity, buzz_position, given_answer, timestamp FROM sessions
      WHERE profile_id = ? AND type = 'tossup' AND correct = 0 AND question_id IS NOT NULL AND given_answer IS NOT NULL AND TRIM(given_answer) != ''`).all(this.getActiveProfileId());
  }
  // the tossups answered from `from` to `to` (a trial attempt's window), in order
  tossupsBetween(from, to) {
    return this.db.prepare(`SELECT id, session_id, type, question_id, points, correct, given_answer, buzz_position, timestamp FROM sessions
      WHERE profile_id = ? AND type = 'tossup' AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp, id`).all(this.getActiveProfileId(), Number(from), Number(to));
  }
  // a regraded answer: right now, with its new points (synced like any change)
  applyRegrade(rowId, points, celerity) {
    return this.db.prepare("UPDATE sessions SET correct = 1, points = ?, celerity = ?, mtime = ?, seq = ?, src = NULL WHERE id = ? AND correct = 0")
      .run(Number(points), celerity == null ? null : Number(celerity), Date.now(), this._nextSeq(), Number(rowId));
  }
  sessionKeyOf(r) { return sessionKey(r); }
  // 15.20 a manual refund: the attempt a report was about — the one with its typed answer when the report kept it,
  // else the latest real attempt up to `before` (the row itself, or null)
  attemptRow(type, qid, before = Date.now(), text = "") {
    type = type === "bonus" ? "bonus" : "tossup";
    const rows = this.db.prepare(`SELECT * FROM sessions WHERE profile_id = ? AND type = ? AND question_id = ? AND timestamp <= ?
      AND COALESCE(given_answer, '') <> '(skipped)' ORDER BY timestamp DESC, id DESC LIMIT 50`).all(this.getActiveProfileId(), type, String(qid || ""), Number(before) + 60000);
    const real = type === "bonus" ? rows : rows.filter((r) => String(r.given_answer || "").trim());
    const fold = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const want = fold(text);
    return (want && real.find((r) => fold(r.given_answer) === want)) || real[0] || null;
  }
  // a bonus refunded by hand: one more part right (its value), synced like any change
  applyBonusRefund(rowId, add, maxParts) {
    return this.db.prepare(`UPDATE sessions SET points = points + ?, bonus_parts_correct = MIN(COALESCE(bonus_parts_correct, 0) + 1, ?), correct = 1,
      mtime = ?, seq = ?, src = NULL WHERE id = ? AND COALESCE(bonus_parts_correct, 0) < ?`).run(Number(add), Number(maxParts), Date.now(), this._nextSeq(), Number(rowId), Number(maxParts));
  }
  // 15.19 question reports: this profile's latest real attempt at a question (not a skip; a tossup with something
  // typed), up to `before` (a report made earlier shows the answer it was about) → { text, correct, points, buzz, at }
  // (a tossup) or { points, partsCorrect, at } (a bonus: its parts' answers aren't kept), or null
  lastAttempt(type, qid, before = Date.now()) {
    type = type === "bonus" ? "bonus" : "tossup";
    const rows = this.db.prepare(`SELECT given_answer, correct, points, buzz_position, bonus_parts_correct, timestamp FROM sessions
      WHERE profile_id = ? AND type = ? AND question_id = ? AND timestamp <= ? AND COALESCE(given_answer, '') <> '(skipped)'
      ORDER BY timestamp DESC, id DESC LIMIT 20`).all(this.getActiveProfileId(), type, String(qid || ""), Number(before) + 60000);
    for (const r of rows) {
      if (type === "bonus") return { points: r.points, partsCorrect: r.bonus_parts_correct, at: r.timestamp };
      if (String(r.given_answer || "").trim()) return { text: r.given_answer, correct: !!r.correct, points: r.points, buzz: r.buzz_position, at: r.timestamp };
    }
    return null;
  }

  getSessionHistory(filters = {}) {
    const pid = this.getActiveProfileId();
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    let sql = "SELECT * FROM sessions WHERE profile_id = :pid";
    const params = { pid, limit, offset };
    if (filters.type) { sql += " AND type = :type"; params.type = filters.type; }
    if (filters.session_id) { sql += " AND session_id = :sid"; params.sid = filters.session_id; }
    sql += " ORDER BY timestamp DESC LIMIT :limit OFFSET :offset";
    const countRow = this.db.prepare("SELECT COUNT(*) as count FROM sessions WHERE profile_id = :pid").get({ pid });
    return { rows: this.db.prepare(sql).all(params), total: countRow ? countRow.count : 0 };
  }

  getSessionEntries(sessionId) {
    const pid = this.getActiveProfileId();
    return this.db.prepare("SELECT * FROM sessions WHERE session_id = :sid AND profile_id = :pid ORDER BY timestamp").all({ sid: sessionId, pid });
  }

  getSessionList() {
    const pid = this.getActiveProfileId();
    return this.db.prepare(`
      SELECT session_id, COUNT(*) as question_count, SUM(points) as total_points,
             MIN(timestamp) as started_at, MAX(timestamp) as ended_at,
             GROUP_CONCAT(DISTINCT category) as categories
      FROM sessions WHERE profile_id = :pid
      GROUP BY session_id ORDER BY MIN(timestamp) DESC
    `).all({ pid });
  }

  deleteSession(sessionId) {
    const pid = this.getActiveProfileId();
    return this._deleteSessionsWhere("session_id = :sid AND profile_id = :pid", { sid: sessionId, pid });
  }

  deleteSessionsOlderThan(days) {
    const pid = this.getActiveProfileId();
    const n = parseInt(days, 10);
    if (!n || n <= 0) return { changes: 0 };
    const cutoff = Date.now() - n * 24 * 60 * 60 * 1000;
    return this._deleteSessionsWhere(
      "profile_id = :pid AND session_id IN (" +
      "SELECT session_id FROM sessions WHERE profile_id = :pid " +
      "GROUP BY session_id HAVING MAX(timestamp) < :cutoff)", { pid, cutoff });
  }

  clearAllHistory() {
    const pid = this.getActiveProfileId();
    return this._deleteSessionsWhere("profile_id = :pid", { pid });
  }

  setReviewDismissed(ids) {
    const pid = this.getActiveProfileId();
    const map = this.getReviewDismissedMap();
    const now = Date.now();
    (ids || []).forEach((id) => { map[id] = now; });
    this.setConfig("review_dismissed:" + pid, JSON.stringify(map));
  }

  getReviewManual() {
    const pid = this.getActiveProfileId();
    const row = this.db.prepare("SELECT value FROM config WHERE key = ?").get("review_manual:" + pid);
    try { return row ? JSON.parse(row.value) : []; } catch { return []; }
  }

  setReviewManual(ids) {
    const pid = this.getActiveProfileId();
    this.setConfig("review_manual:" + pid, JSON.stringify(ids || []));
  }

  getAllSessionEntries() {
    const pid = this.getActiveProfileId();
    return this.db.prepare("SELECT * FROM sessions WHERE profile_id = ? ORDER BY timestamp").all(pid);
  }

  // an event's items: its tossups this profile powered during it (each question once)
  eventItems(ev) {
    const pid = this.getActiveProfileId();
    return this.db.prepare("SELECT DISTINCT question_id FROM sessions WHERE profile_id = ? AND type = 'tossup' AND correct = 1 AND points >= 15 AND timestamp >= ? AND timestamp < ?")
      .all(pid, ev.start, ev.end).map((r) => r.question_id).filter((id) => isEventItem(id, ev));
  }
  // Halloween's candy (the pumpkins)
  eventPumpkins() { return this.eventItems(EVENTS[0]); }
  // when each powered tossup was first powered (limited achievements count only their window)
  getPowerTimes() {
    const pid = this.getActiveProfileId();
    const out = {};
    for (const r of this.db.prepare("SELECT question_id, MIN(timestamp) AS t FROM sessions WHERE points >= 15 AND correct = 1 AND type = 'tossup' AND profile_id = ? GROUP BY question_id").all(pid)) if (r.question_id) out[r.question_id] = r.t;
    return out;
  }

  getPoweredAnswerIds() {
    const pid = this.getActiveProfileId();
    return this.db.prepare(
      "SELECT question_id FROM sessions WHERE points >= 15 AND correct = 1 AND type = 'tossup' AND profile_id = ?"
    ).all(pid).map((r) => r.question_id).filter(Boolean);
  }
}
