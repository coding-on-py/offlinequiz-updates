import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { QuestionDatabase } from "./database.js";
import { UserData } from "./userData.js";
import { checkAnswer, checkBonus, evaluateAnswer, parseDirectives, frequencyKey, answersSimilar, primaryAnswer } from "./answerChecker.js";
import { scoreTossup, scoreBonus } from "./scoring.js";
import { computeStats, computeSessionBreakdown } from "./stats.js";
import * as updater from "./updater.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_DB_PATH = join(__dirname, "..", "..", "data", "questions.db");
const DEFAULT_USER_DB_PATH = join(
  __dirname,
  "..",
  "..",
  "data",
  "user_data.db"
);

export class App {
  /**
   * @param {object} [opts]
   * @param {string} [opts.dbPath] - Path to questions database
   * @param {string} [opts.userDbPath] - Path to user data database
   */
  constructor(opts = {}) {
    this.dbPath = opts.dbPath || DEFAULT_DB_PATH;
    this.userDbPath = opts.userDbPath || DEFAULT_USER_DB_PATH;

    this.questionDb = null;
    this.userData = null;
  }

  init() {
    this.questionDb = new QuestionDatabase(this.dbPath);
    this.userData = new UserData(this.userDbPath);
    return this;
  }

  close() {
    if (this.questionDb) this.questionDb.close();
    if (this.userData) this.userData.close();
  }

  getTossup(id) {
    return this.questionDb.getTossup(id);
  }

  getBonus(id) {
    return this.questionDb.getBonus(id);
  }

  queryTossups(filters) {
    return this.questionDb.queryTossups(filters);
  }

  queryBonuses(filters) {
    return this.questionDb.queryBonuses(filters);
  }

  getRandomTossup(filters) {
    const resolved = this._resolveStarredFilter(filters, "tossup");
    if (resolved === null) return undefined;
    return this.questionDb.getRandomTossup(resolved);
  }

  getRandomBonus(filters) {
    const resolved = this._resolveStarredFilter(filters, "bonus");
    if (resolved === null) return undefined;
    return this.questionDb.getRandomBonus(resolved);
  }

  /**
   * If filters.starredOnly is set, inject the active profile's starred question ids
   * (for the given type) as an `ids` filter the question DB can apply. Returns the
   * (possibly augmented) filters, or null when there are no starred questions to serve.
   */
  _resolveStarredFilter(filters = {}, type) {
    if (!filters.starredOnly) return filters;
    const starred = this.userData.getStarredQuestions(type);
    const ids = starred.map((s) => s.question_id);
    if (ids.length === 0) return null;
    // Serve from the starred pool only. We deliberately DROP difficulty / year /
    // standard / powermark filters (you explicitly starred these questions, so
    // they shouldn't be filtered out); category/subcategory still apply.
    return {
      ids,
      random: filters.random,
      limit: filters.limit,
      offset: filters.offset,
      categories: filters.categories,
      subcategories: filters.subcategories,
      alternateSubcategories: filters.alternateSubcategories,
    };
  }

  searchTossups(query, filters) {
    return this.questionDb.searchTossups(query, filters);
  }

  searchBonuses(query, filters) {
    return this.questionDb.searchBonuses(query, filters);
  }

  getSets() {
    return this.questionDb.getSets();
  }

  getSetById(id) {
    return this.questionDb.getSetById(id);
  }

  getSetPackets(setName) {
    return this.questionDb.getSetPacketNumbers(setName);
  }

  getPacketsForSet(setName) {
    return this.questionDb.getPacketsForSet(setName);
  }

  getPacketContent(setName, packetNumber) {
    return this.questionDb.getPacketContent(setName, packetNumber);
  }

  getFrequentAnswers(category, subcategory, alternateSubcategory, limit = 50, qtype = "tossup") {
    let rows = [];
    if (qtype !== "bonus") {
      rows = this.questionDb.getAnswerLinesForFreq(category, subcategory, alternateSubcategory);
    }
    if (qtype === "bonus" || qtype === "both") {
      // Each bonus part's answer line counts as its own line.
      for (const r of this.questionDb.getBonusAnswerLinesForFreq(category, subcategory, alternateSubcategory)) {
        let raw, sani;
        try { raw = JSON.parse(r.answers || "[]"); } catch { raw = []; }
        try { sani = JSON.parse(r.answers_sanitized || "[]"); } catch { sani = []; }
        for (let i = 0; i < sani.length; i++) {
          if (sani[i]) rows.push({ answer: raw[i] || "", answer_sanitized: sani[i] });
        }
      }
    }
    return this._countPrimaryAnswers(rows, limit);
  }

  // ONE entry per question: the PRIMARY (underlined main) answer. Aliases in
  // [or …] no longer create separate rows (no more China / Zhongguo / PRC
  // triplets), and word forms fold together.
  _countPrimaryAnswers(rows, limit) {
    // For each question, count EVERY acceptable answer (not just the primary),
    // folding plural forms together so they're one entry.
    // Instruction phrases that show up in "accept …" directives but aren't real
    // answers (e.g. "accept word forms", "accept either underlined answer").
    const JUNK = /\b(word ?forms?|equivalents?|underlined|synonyms?|obvious|either|etc|portions?|reasonable|anything|spellings?|pronunciations?|descriptions?|abbreviations?|partial|answers?|orders?|variants?|the above|any of)\b/i;
    const counts = new Map(); // key -> { display, count }
    for (const r of rows) {
      const sani = r.answer_sanitized || "";
      let display;
      try { display = primaryAnswer(r.answer || "", sani); } catch { display = ""; }
      if (!display) display = sani.split(/[\[(]/)[0].trim();
      display = display.replace(/[;:,.]+$/, "").trim();
      if (!display || display.length > 80 || JUNK.test(display)) continue;
      const key = frequencyKey(display);
      if (!key) continue;
      const e = counts.get(key) || { display, count: 0 };
      e.count++;
      counts.set(key, e);
    }
    // Merge similar entries (mitochondria/mitochondrion) only among the top
    // candidates, bucketed by prefix so it stays fast regardless of `limit`.
    const sorted = [...counts.values()].sort((a, b) => b.count - a.count);
    const cand = sorted.slice(0, Math.min(sorted.length, limit + 400));
    const buckets = new Map();
    const merged = [];
    for (const e of cand) {
      const bk = frequencyKey(e.display).replace(/\s+/g, "").slice(0, 2);
      let reps = buckets.get(bk);
      if (!reps) { reps = []; buckets.set(bk, reps); }
      const rep = reps.find((r) => answersSimilar(r.display, e.display));
      if (rep) { if (e.count > rep.count) rep.display = e.display; rep.count += e.count; }
      else { const ne = { display: e.display, count: e.count }; reps.push(ne); merged.push(ne); }
    }
    return merged.sort((a, b) => b.count - a.count).slice(0, limit).map((e) => ({ answer: e.display, count: e.count }));
  }

  getCategories(type) {
    return this.questionDb.getCategories(type);
  }

  getSubcategories(type, category) {
    return this.questionDb.getSubcategories(type, category);
  }

  getCount(type, filters) {
    const resolved = this._resolveStarredFilter(filters, type === "tossups" ? "tossup" : "bonus");
    if (resolved === null) return 0;
    if (type === "tossups") return this.questionDb.getTossupCount(resolved);
    return this.questionDb.getBonusCount(resolved);
  }

  checkTossupAnswer(userAnswer, tossup) {
    return checkAnswer(
      userAnswer,
      tossup.answer,
      tossup.answer_sanitized
    );
  }

  checkBonusParts(userAnswers, bonus) {
    return checkBonus(userAnswers, bonus);
  }

  // Accept/prompt/reject evaluation without scoring or recording.
  // buzzPosition (char index into the (*)-stripped sanitized text) makes
  // "accept X until/before/after Y" and partial-answer prompts read-aware.
  evaluateTossup(userAnswer, tossup, strictness = 10, buzzPosition = null) {
    const pos = this._readPos(tossup, buzzPosition);
    return evaluateAnswer(userAnswer, tossup.answer, tossup.answer_sanitized, strictness, pos);
  }

  // {readText, fullText, readLen} for word-exact until/after windows.
  _readPos(tossup, buzzPosition) {
    if (buzzPosition == null) return {};
    const text = (tossup.question_sanitized || tossup.question || "").replace(/\(\*\)/g, "");
    const n = Math.max(0, Math.min(text.length, buzzPosition));
    return { readText: text.slice(0, n), fullText: text, readLen: n };
  }

  // Evaluate an answer against an arbitrary answer line (e.g. one bonus part).
  evaluateAnswerLine(userAnswer, answerline, sanitized, strictness = 10) {
    return evaluateAnswer(userAnswer, answerline, sanitized, strictness);
  }

  _normManual(list) {
    return (list || []).map((m) => (typeof m === "string" ? { id: m, type: "tossup", at: 0 } : m));
  }
  addReviewManual(questionId, type) {
    const ids = this._normManual(this.userData.getReviewManual());
    // The re-add must win even against a same-millisecond prior dismissal.
    const dAt = (this.userData.getReviewDismissedMap() || {})[questionId] || 0;
    const at = Math.max(Date.now(), dAt + 1);
    if (!ids.some((m) => m.id === questionId)) ids.unshift({ id: questionId, type: type || "tossup", at });
    this.userData.setReviewManual(ids.slice(0, 1000));
    return { ok: true, count: ids.length };
  }

  removeReviewManual(questionId) {
    this.userData.setReviewManual(this._normManual(this.userData.getReviewManual()).filter((m) => m.id !== questionId));
    return { ok: true };
  }

  clearReview() {
    const q = this.getReviewQueue({ limit: Infinity });
    this.userData.setReviewDismissed(q.items.map((it) => it.id));
    this.userData.setReviewManual([]);
    return { ok: true, cleared: q.items.length };
  }

  dismissReview(questionId) {
    this.removeReviewManual(questionId);
    return this.userData.dismissReview(questionId);
  }

  pluginSql(pluginId, sql, params) {
    return this.userData.pluginSql(pluginId, sql, params);
  }

  getPluginData(pluginId, key) {
    return this.userData.getPluginData(pluginId, key);
  }

  setPluginData(pluginId, key, value) {
    return this.userData.setPluginData(pluginId, key, value);
  }

  // ── Per-profile settings (gameplay, hotkeys, identity) ──
  getProfileSettings() {
    return this.userData.getProfileSettings();
  }

  saveProfileSettings(obj) {
    return this.userData.saveProfileSettings(obj);
  }

  /**
   * Spaced-repetition review queue: tossups whose LAST attempt was wrong come
   * back after 1 day (1 miss), 3 days (2 misses) or 7 days (3+ misses).
   * Returns { count, ids } of currently-due tossups.
   */
  // Everything in review (no due-timing): every tossup you last got wrong
  // (negged / unanswered per the Settings toggles) plus everything you added
  // manually (tossups AND bonuses). Each item carries ageMs so the review menu
  // can filter by how long ago it entered review.
  getReviewQueue(opts = {}) {
    const wantNegs = opts.negs !== false;
    const wantUnanswered = opts.unanswered !== false;
    const wantWrongEnd = opts.wrongEnd !== false;
    const entries = this.userData.getAllSessionEntries();
    const byQ = new Map();
    for (const e of entries) {
      if (e.type !== "tossup" || !e.question_id) continue;
      const cur = byQ.get(e.question_id) || { last: 0, lastWrong: false, category: "", given: "", buzz: null, lastPoints: 0, lastGiven: "" };
      const t = new Date(e.timestamp).getTime() || 0;
      if (t >= cur.last) {
        cur.last = t; cur.lastWrong = !e.correct;
        cur.lastPoints = e.points != null ? e.points : 0;
        cur.lastGiven = e.given_answer || "";
        cur.category = e.category || cur.category;
        cur.given = e.given_answer || "";
        cur.buzz = e.buzz_position != null ? e.buzz_position : null;
      }
      byQ.set(e.question_id, cur);
    }
    const now = Date.now();
    const dismissedMap = this.userData.getReviewDismissedMap();
    const items = [];
    // manual item is hidden only if dismissed at/after it was (re-)added
    const manual = this._normManual(this.userData.getReviewManual()).filter((m) => {
      const dAt = dismissedMap[m.id];
      return !(dAt != null && dAt >= (m.at || 0));
    });
    const manualSet = new Set(manual.map((m) => m.id));
    for (const m of manual) {
      let cat = "";
      try { const q = m.type === "bonus" ? this.getBonus(m.id) : this.getTossup(m.id); cat = (q && q.category) || ""; } catch {}
      items.push({ id: m.id, type: m.type || "tossup", category: cat, given: "", buzzPosition: null, manual: true, ageMs: Math.max(0, now - (m.at || 0)) });
    }
    for (const [qid, st] of byQ) {
      if (manualSet.has(qid) || !st.lastWrong) continue;
      // hidden only while dismissed AT OR AFTER the last wrong attempt
      const dAt = dismissedMap[qid];
      if (dAt != null && dAt >= st.last) continue;
      // neg = buzzed wrong before the end; wrong-at-end = answered wrong after a
      // full read (has a given answer, 0 pts); unanswered = never buzzed / dead.
      let kind;
      if (st.lastPoints < 0) kind = "neg";
      else if ((st.lastGiven || "").trim()) kind = "wrongEnd";
      else kind = "unanswered";
      if (kind === "neg" && !wantNegs) continue;
      if (kind === "wrongEnd" && !wantWrongEnd) continue;
      if (kind === "unanswered" && !wantUnanswered) continue;
      items.push({ id: qid, type: "tossup", category: st.category || "", given: st.given || "", buzzPosition: st.buzz, ageMs: Math.max(0, now - st.last) });
    }
    items.sort((a, b) => a.ageMs - b.ageMs);
    const limit = opts.limit || 400;
    const top = items.slice(0, limit);
    return { count: items.length, ids: top.map((i) => i.id), items: top };
  }

  // The parsed accept / prompt / reject directives of an answer line
  // (used by the Answerline Lab plugin to show how a line is read).
  parseAnswerline(answerline, sanitized) {
    return parseDirectives(answerline || "", sanitized || "");
  }

  scoreTossupResult(userAnswer, tossup, buzzCharIndex, fullyRead, strictness) {
    const pos = fullyRead ? {} : this._readPos(tossup, buzzCharIndex);
    return scoreTossup(
      {
        userAnswer,
        answerline: tossup.answer,
        sanitizedAnswer: tossup.answer_sanitized,
        buzzCharIndex,
        questionText: tossup.question_sanitized || tossup.question,
        fullyRead,
      },
      // Only an outright "accept" scores as correct here; prompts are resolved
      // (or declined) by the caller before scoring.
      (ua, al, sa) => ({ correct: evaluateAnswer(ua, al, sa, strictness, pos).status === "accept" })
    );
  }

  scoreBonusResult(userAnswers, bonus) {
    const result = checkBonus(userAnswers, bonus);
    return {
      ...scoreBonus(result.parts),
      parts: result.parts,
    };
  }

  starQuestion(questionId, type) {
    return this.userData.starQuestion(questionId, type);
  }

  unstarQuestion(questionId, type) {
    return this.userData.unstarQuestion(questionId, type);
  }

  isStarred(questionId, type) {
    return this.userData.isStarred(questionId, type);
  }

  getStarredQuestions(type) {
    return this.userData.getStarredQuestions(type);
  }

  // ── Profiles ──

  getProfiles() {
    return this.userData.getProfiles();
  }

  createProfile(name) {
    return this.userData.createProfile(name);
  }

  deleteProfile(id) {
    return this.userData.deleteProfile(id);
  }

  getActiveProfile() {
    return this.userData.getActiveProfile();
  }

  setActiveProfile(id) {
    return this.userData.setActiveProfile(id);
  }

  // ── Sessions ──

  recordOverride(entry) {
    return this.userData.recordOverride(entry);
  }

  addSessionEntry(entry) {
    return this.userData.addSessionEntry(entry);
  }

  getSessionHistory(filters) {
    return this.userData.getSessionHistory(filters);
  }

  getSessionEntries(sessionId) {
    return this.userData.getSessionEntries(sessionId);
  }

  getSessionList() {
    return this.userData.getSessionList();
  }

  deleteSession(sessionId) {
    return this.userData.deleteSession(sessionId);
  }

  deleteSessionsOlderThan(days) {
    return this.userData.deleteSessionsOlderThan(days);
  }

  getOverallStats(since) {
    let entries = this.userData.getAllSessionEntries();
    // Optional time-period filter (Statistics "period" dropdown): keep only
    // entries at/after `since` (a Unix-ms cutoff). 0/undefined = all time.
    if (since) entries = entries.filter((e) => (e.timestamp || 0) >= since);
    return computeStats(entries);
  }

  getSessionStats(sessionId) {
    const entries = this.userData.getSessionEntries(sessionId);
    return computeStats(entries);
  }

  getSessionBreakdown(category, difficulty) {
    const sessions = this.userData.getSessionList();
    const allEntries = this.userData.getAllSessionEntries();
    return computeSessionBreakdown(sessions, allEntries, { category, difficulty });
  }

  // ── Question DB updates (Google Drive snapshot) ──

  async checkForUpdate() {
    const current = this.userData.getConfig("questions_version");
    return updater.checkForUpdate(current);
  }

  /**
   * Download the newest (or given) snapshot and rebuild the question DB.
   * @param {string} [folderId] - snapshot folder id; defaults to the latest available
   * @param {(msg:string)=>void} [onProgress]
   */
  async applyUpdate(folderId, onProgress) {
    let target = folderId;
    if (!target) {
      const info = await updater.checkForUpdate(this.userData.getConfig("questions_version"));
      if (!info.latest) throw new Error("no snapshot found");
      target = info.latest.id;
    }
    // Release the read-only handle so the file can be replaced.
    if (this.questionDb) { this.questionDb.close(); this.questionDb = null; }
    try {
      const result = await updater.applyUpdate(target, this.dbPath, onProgress);
      this.userData.setConfig("questions_version", result.version);
      return result;
    } finally {
      this.questionDb = new QuestionDatabase(this.dbPath);
    }
  }

  async importQuestions(setsData, tossupsData, bonusesData) {
    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(this.dbPath);
    try {
      const insertSet = db.prepare(
        "INSERT OR IGNORE INTO sets (id, name, year, difficulty, standard) VALUES (?, ?, ?, ?, ?)"
      );
      const insertTossup = db.prepare(`
        INSERT OR IGNORE INTO tossups (id, question, question_sanitized, answer, answer_sanitized,
          category, subcategory, alternate_subcategory, difficulty, set_id, set_name, set_year,
          packet_id, packet_name, packet_number, question_number, standard)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertBonus = db.prepare(`
        INSERT OR IGNORE INTO bonuses (id, leadin, leadin_sanitized, parts, parts_sanitized,
          answers, answers_sanitized, category, subcategory, alternate_subcategory, difficulty,
          set_id, set_name, set_year, packet_id, packet_name,
          packet_number, question_number, point_values, standard)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let imported = 0;
      for (const s of setsData) {
        insertSet.run(s.id, s.name, s.year, s.difficulty || 0, s.standard ? 1 : 0);
      }
      for (const t of tossupsData) {
        insertTossup.run(
          t.id, t.question || "", t.question_sanitized || "", t.answer || "", t.answer_sanitized || "",
          t.category || "", t.subcategory || "", t.alternate_subcategory || "", t.difficulty || 0, t.set_id || "", t.set_name || "",
          t.set_year || 0, t.packet_id || "", t.packet_name || "", t.packet_number || 0,
          t.question_number || 0, t.standard ? 1 : 0
        );
        imported++;
      }
      for (const b of bonusesData) {
        insertBonus.run(
          b.id, b.leadin || "", b.leadin_sanitized || "", JSON.stringify(b.parts || []),
          JSON.stringify(b.parts_sanitized || []), JSON.stringify(b.answers || []),
          JSON.stringify(b.answers_sanitized || []), b.category || "", b.subcategory || "",
          b.alternate_subcategory || "", b.difficulty || 0, b.set_id || "", b.set_name || "", b.set_year || 0,
          b.packet_id || "", b.packet_name || "", b.packet_number || 0,
          b.question_number || 0, JSON.stringify(b.values || [10,10,10]), b.standard ? 1 : 0
        );
        imported++;
      }

      // Rebuild FTS
      db.exec("DELETE FROM tossups_fts");
      db.exec("DELETE FROM bonuses_fts");
      db.exec(`
        INSERT INTO tossups_fts(rowid, question_sanitized, answer_sanitized, category, subcategory, set_name)
        SELECT rowid, question_sanitized, answer_sanitized, category, subcategory, set_name FROM tossups
      `);
      db.exec(`
        INSERT INTO bonuses_fts(rowid, leadin_sanitized, parts_sanitized, answers_sanitized, category, subcategory, set_name)
        SELECT rowid, leadin_sanitized, parts_sanitized, answers_sanitized, category, subcategory, set_name FROM bonuses
      `);

      return { success: true, imported };
    } finally {
      db.close();
      // Reopen the read-only question DB so subsequent queries keep working
      // (the write connection above is separate and now closed).
      if (this.questionDb) this.questionDb.close();
      this.questionDb = new QuestionDatabase(this.dbPath);
    }
  }
}

const main = import.meta.url === `file://${process.argv[1]}`;
if (main) {
  const app = new App().init();

  console.log("QBReader Offline backend initialized.");
  console.log(`  Questions DB: ${app.dbPath}`);
  console.log(`  User Data DB: ${app.userDbPath}`);

  const tossupCount = app.getCount("tossups", {});
  const bonusCount = app.getCount("bonuses", {});
  const sets = app.getSets();

  console.log(`\n  Tossups: ${tossupCount}`);
  console.log(`  Bonuses: ${bonusCount}`);
  console.log(`  Sets: ${sets.length}`);

  const categories = app.getCategories("tossups");
  console.log(`\n  Top 5 Categories:`);
  categories.slice(0, 5).forEach((c) => {
    console.log(`    ${c.category}: ${c.count}`);
  });

  if (tossupCount > 0) {
    const randomTossup = app.getRandomTossup({});
    console.log(`\n  Random tossup: ${randomTossup.question_sanitized?.substring(0, 100)}...`);
    console.log(`  Answer: ${randomTossup.answer_sanitized}`);

    const checkResult = app.checkTossupAnswer(
      randomTossup.answer_sanitized,
      randomTossup
    );
    console.log(`  Self-check: ${checkResult.correct ? "CORRECT" : "INCORRECT"}`);
  }

  app.close();
}
