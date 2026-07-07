import { DatabaseSync } from "node:sqlite";
import { dirname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

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

    this.db.prepare("INSERT OR IGNORE INTO profiles (id, name, created_at) VALUES (?, ?, ?)").run("default", "Default", Date.now());
  }

  close() { this.db.close(); }

  getConfig(key) {
    const row = this.db.prepare("SELECT value FROM config WHERE key = ?").get(key);
    return row ? row.value : null;
  }

  setConfig(key, value) {
    this.db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").run(key, value);
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

  getPluginData(pluginId, key) {
    const pid = this.getActiveProfileId();
    const raw = this.getConfig("plug:" + pid + ":" + pluginId + ":" + key);
    try { return raw == null ? null : JSON.parse(raw); } catch { return null; }
  }
  setPluginData(pluginId, key, value) {
    const pid = this.getActiveProfileId();
    this.setConfig("plug:" + pid + ":" + pluginId + ":" + key, JSON.stringify(value === undefined ? null : value));
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
    return this.db.prepare(
      "INSERT OR IGNORE INTO starred (question_id, type, starred_at, profile_id) VALUES (?, ?, ?, ?)"
    ).run(questionId, type, Date.now(), pid);
  }

  unstarQuestion(questionId, type) {
    const pid = this.getActiveProfileId();
    return this.db.prepare("DELETE FROM starred WHERE question_id = ? AND type = ? AND profile_id = ?").run(questionId, type, pid);
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
        difficulty, correct, points, celerity, buzz_position, bonus_parts_correct, given_answer, timestamp, profile_id)
      VALUES (:session_id, :type, :question_id, :category, :subcategory,
        :difficulty, :correct, :points, :celerity, :buzz_position, :bonus_parts_correct, :given_answer, :timestamp, :profile_id)
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
    });
  }

  recordOverride(entry) {
    const pid = this.getActiveProfileId();
    const row = this.db.prepare(
      "SELECT id FROM sessions WHERE session_id = :s AND question_id = :q AND profile_id = :p ORDER BY timestamp DESC LIMIT 1"
    ).get({ s: entry.session_id || "default", q: entry.question_id || null, p: pid });
    if (!row) return this.addSessionEntry(entry);
    return this.db.prepare(
      "UPDATE sessions SET correct = :c, points = :pt, celerity = :cel, buzz_position = :bp, given_answer = :ga WHERE id = :id"
    ).run({
      c: entry.correct ? 1 : 0,
      pt: entry.points || 0,
      cel: entry.celerity != null ? entry.celerity : null,
      bp: entry.buzz_position != null ? entry.buzz_position : null,
      ga: entry.given_answer != null ? String(entry.given_answer) : null,
      id: row.id,
    });
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
    return this.db.prepare("DELETE FROM sessions WHERE session_id = ? AND profile_id = ?").run(sessionId, pid);
  }

  deleteSessionsOlderThan(days) {
    const pid = this.getActiveProfileId();
    const n = parseInt(days, 10);
    if (!n || n <= 0) return { changes: 0 };
    const cutoff = Date.now() - n * 24 * 60 * 60 * 1000;
    return this.db.prepare(
      "DELETE FROM sessions WHERE profile_id = :pid AND session_id IN (" +
      "SELECT session_id FROM sessions WHERE profile_id = :pid " +
      "GROUP BY session_id HAVING MAX(timestamp) < :cutoff)"
    ).run({ pid, cutoff });
  }

  clearAllHistory() {
    const pid = this.getActiveProfileId();
    return this.db.prepare("DELETE FROM sessions WHERE profile_id = ?").run(pid);
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
    this.db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)")
      .run("review_manual:" + pid, JSON.stringify(ids || []));
  }

  getAllSessionEntries() {
    const pid = this.getActiveProfileId();
    return this.db.prepare("SELECT * FROM sessions WHERE profile_id = ? ORDER BY timestamp").all(pid);
  }

  getPoweredAnswerIds() {
    const pid = this.getActiveProfileId();
    return this.db.prepare(
      "SELECT question_id FROM sessions WHERE points >= 15 AND correct = 1 AND type = 'tossup' AND profile_id = ?"
    ).all(pid).map((r) => r.question_id).filter(Boolean);
  }
}
