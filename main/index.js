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

// Answer-power key normalization. MUST stay byte-identical to apNorm in
// src/renderer/app.js (and the Achievement Lab fallback): the renderer folds
// achievement TARGETS with it and the server folds RECORDED powers with it, so
// any drift silently breaks every answer_power achievement. Lowercase FIRST so
// the special-letter map sees "æ" for "Æ"; NFD strips combining accents
// ("Brontë" -> "bronte", "García" -> "garcia"), and the map covers the letters
// NFD does not decompose. Before this, diacritics became SPACES ("bront",
// "garc a m rquez"), so ASCII-spelled answers never matched their targets.
function apFold(s) {
  return String(s == null ? "" : s)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/œ/g, "oe").replace(/ø/g, "o").replace(/ð/g, "d").replace(/þ/g, "th").replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

export class App {
  




  constructor(opts = {}) {
    this.dbPath = opts.dbPath || DEFAULT_DB_PATH;
    this.userDbPath = opts.userDbPath || DEFAULT_USER_DB_PATH;
    // Where a downloaded question database is installed (packaged app: userData;
    // dev: the repo's data/questions.db itself).
    this.dbInstallPath = opts.dbInstallPath || this.dbPath;
    this._dbUpd = { state: "idle" };   // background question-database update
    this._dbJob = null;

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

  // A saved (type, id) whose question may have changed type: 28 former tossup
  // ids now live in bonuses (brief §0.6). Returns { type, question } or null.
  getQuestionAny(id, type) {
    const first = type === "bonus" ? "bonus" : "tossup";
    const look = (t) => (t === "bonus" ? this.questionDb.getBonus(id) : this.questionDb.getTossup(id));
    let q = look(first);
    if (q) return { type: first, question: q };
    const other = first === "bonus" ? "tossup" : "bonus";
    q = look(other);
    return q ? { type: other, question: q } : null;
  }

  getStarredItems(type) {
    const items = [];
    for (const s of this.userData.getStarredQuestions(type || null)) {
      const hit = this.getQuestionAny(s.question_id, s.type);
      if (hit) items.push({ ...s, type: hit.type, question: hit.question });
    }
    return items;
  }

  queryTossups(filters) {
    const f = this._scopeToStarred(filters, "tossup");
    return f ? this.questionDb.queryTossups(f) : { rows: [], total: 0 };
  }

  queryBonuses(filters) {
    const f = this._scopeToStarred(filters, "bonus");
    return f ? this.questionDb.queryBonuses(f) : { rows: [], total: 0 };
  }

  // Database browse/search honour starredOnly WITHOUT dropping the other
  // filters. (_resolveStarredFilter keeps only the category ones — right for
  // practice draws, wrong for a search that also filters by year, set, sort…)
  // The starred table is profile-scoped.
  _scopeToStarred(filters = {}, type) {
    if (!filters || !filters.starredOnly) return filters;
    const ids = this.userData.getStarredQuestions(type).map((s) => s.question_id);
    return ids.length ? { ...filters, ids } : null;
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

  




  _resolveStarredFilter(filters = {}, type) {
    if (!filters.starredOnly) return filters;
    const starred = this.userData.getStarredQuestions(type);
    const ids = starred.map((s) => s.question_id);
    if (ids.length === 0) return null;
    return {
      ids,
      random: filters.random,
      limit: filters.limit,
      offset: filters.offset,
      categories: filters.categories,
      subcategories: filters.subcategories,
      alternateSubcategories: filters.alternateSubcategories,
      categoryIds: filters.categoryIds,
      cleanOnly: filters.cleanOnly,
    };
  }

  searchTossups(query, filters) {
    const f = this._scopeToStarred(filters, "tossup");
    return f ? this.questionDb.searchTossups(query, f) : { rows: [], total: 0 };
  }

  searchBonuses(query, filters) {
    const f = this._scopeToStarred(filters, "bonus");
    return f ? this.questionDb.searchBonuses(query, f) : { rows: [], total: 0 };
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

  getCategoryTree(type) {
    return this.questionDb.getCategoryTree(type === "bonuses" ? "bonuses" : "tossups");
  }

  getDbInfo() {
    const m = (k) => (this.questionDb.getMeta ? this.questionDb.getMeta(k) : null);
    return { schema: this.questionDb.v2 ? 2 : 1, mode: m("source_mode") || null, tree: m("tree_spec_version") || null, built: m("built_at") || null };
  }

  getFrequentAnswers(category, subcategory, alternateSubcategory, limit = 50, qtype = "tossup", nodeId = null) {
    let rows = [];
    if (qtype !== "bonus") {
      rows = this.questionDb.getAnswerLinesForFreq(category, subcategory, alternateSubcategory, nodeId);
    }
    if (qtype === "bonus" || qtype === "both") {
      for (const r of this.questionDb.getBonusAnswerLinesForFreq(category, subcategory, alternateSubcategory, nodeId)) {
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

  _countPrimaryAnswers(rows, limit) {
    const JUNK = /\b(word ?forms?|equivalents?|underlined|synonyms?|obvious|either|etc|portions?|reasonable|anything|spellings?|pronunciations?|descriptions?|abbreviations?|partial|answers?|orders?|variants?|the above|any of)\b/i;
    const counts = new Map();
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

  getAlternateSubcategories(type, category, subcategory) {
    return this.questionDb.getAlternateSubcategories(type, category, subcategory);
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

  // Extra judging inputs from the new database (brief §6, §7): pieces that
  // together form ONE required answer, and the hidden answer key. The key is
  // read here, in the main process, and never leaves it.
  _judgeOpts(q, part = null) {
    const out = {};
    try {
      const flags = typeof q.flags === "string" ? JSON.parse(q.flags || "[]") : (q.flags || []);
      const joint = [];
      for (const f of flags) {
        if (!f || f.code !== "JOINTLY_REQUIRED_PIECES") continue;
        const m = /pieces '(.+?)' \+ '(.+?)' in the (?:part (\d+) )?answer line/.exec(f.detail || "");
        if (m && (m[3] ? Number(m[3]) : null) === (part == null ? null : part + 1)) joint.push([m[1], m[2]]);
      }
      if (joint.length) out.jointPieces = joint;
    } catch { /* no flags */ }
    try {
      const h = this.questionDb.getHiddenAnswers ? this.questionDb.getHiddenAnswers(q.id) : null;
      let slot = h;
      if (part != null) {
        // aligned with the bonus's answers; a length mismatch means skip (brief §7)
        const n = Array.isArray(q.answers) ? q.answers.length : JSON.parse(q.answers || "[]").length;
        slot = Array.isArray(h) && h.length === n ? h[part] : null;
      }
      if (slot && typeof slot === "object" && !Array.isArray(slot)) out.hidden = slot;
    } catch { /* none */ }
    return out;
  }

  // One bonus part, judged exactly as check-bonus judges it (the part's hidden
  // answers / joint pieces included) — the per-part reveal and prompt round.
  // `previous` = the answer that drew a prompt, for the follow-up judgement.
  evaluateBonusPart(userAnswer, bonus, part, strictness = 10, previous = null) {
    let answers = [], san = [];
    try { answers = JSON.parse(bonus.answers || "[]"); } catch {}
    try { san = JSON.parse(bonus.answers_sanitized || "[]"); } catch {}
    if (!(part >= 0 && part < answers.length)) return null;
    return evaluateAnswer(userAnswer, answers[part], san[part] || "", strictness,
      { ...this._bonusPartPos(bonus, part), ...this._judgeOpts(bonus, part), ...(previous ? { previous } : {}) });
  }

  // A bonus part is judged as read to its end: the leadin plus that part.
  _bonusPartPos(bonus, part) {
    let parts = [];
    try { parts = JSON.parse(bonus.parts_sanitized || "[]"); } catch {}
    const fullText = [bonus.leadin_sanitized || "", parts[part] || ""].filter(Boolean).join(" ");
    return { readText: fullText, fullText, readLen: fullText.length };
  }

  evaluateTossup(userAnswer, tossup, strictness = 10, buzzPosition = null, previous = null) {
    const pos = this._readPos(tossup, buzzPosition);
    return evaluateAnswer(userAnswer, tossup.answer, tossup.answer_sanitized, strictness,
      { ...pos, ...this._judgeOpts(tossup), ...(previous ? { previous } : {}) });
  }

  // buzzPosition indexes question_sanitized AS STORED, "(*)" included (the
  // renderer, power scoring and recorded buzz_position all count that way);
  // the judge reads the text with the mark removed. No position = read to the
  // end; fullText is always given so timing markers ("until X is read") resolve.
  _readPos(tossup, buzzPosition) {
    const raw = tossup.question_sanitized || tossup.question || "";
    let n = buzzPosition == null ? raw.length : Math.max(0, Math.min(raw.length, buzzPosition));
    const mark = n > 0 ? raw.lastIndexOf("(*)", n - 1) : -1;
    if (mark >= 0 && n < mark + 3) n = mark;   // a buzz inside the mark is at it
    const readText = raw.slice(0, n).replace(/\(\*\)/g, "");
    return { readText, fullText: raw.replace(/\(\*\)/g, ""), readLen: readText.length };
  }

  evaluateAnswerLine(userAnswer, answerline, sanitized, strictness = 10, previous = null) {
    return evaluateAnswer(userAnswer, answerline, sanitized, strictness, previous ? { previous } : undefined);
  }

  _normManual(list) {
    return (list || []).map((m) => (typeof m === "string" ? { id: m, type: "tossup", at: 0 } : m));
  }
  addReviewManual(questionId, type) {
    const ids = this._normManual(this.userData.getReviewManual());
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

  getProfileSettings() {
    return this.userData.getProfileSettings();
  }

  saveProfileSettings(obj) {
    return this.userData.saveProfileSettings(obj);
  }

  




  getReviewQueue(opts = {}) {
    const wantNegs = opts.negs !== false;
    const wantUnanswered = opts.unanswered !== false;
    const wantWrongEnd = opts.wrongEnd !== false;
    const entries = this._relabel(this.userData.getAllSessionEntries());
    const byQ = new Map();
    for (const e of entries) {
      if (e.type !== "tossup" || !e.question_id) continue;
      const cur = byQ.get(e.question_id) || { last: 0, lastWrong: false, category: "", given: "", buzz: null, lastPoints: 0, lastGiven: "", difficulty: null };
      const t = new Date(e.timestamp).getTime() || 0;
      if (t >= cur.last) {
        cur.last = t; cur.lastWrong = !e.correct;
        cur.lastPoints = e.points != null ? e.points : 0;
        cur.lastGiven = e.given_answer || "";
        cur.category = e.category || cur.category;
        cur.given = e.given_answer || "";
        cur.buzz = e.buzz_position != null ? e.buzz_position : null;
        if (e.difficulty != null) cur.difficulty = e.difficulty;
      }
      byQ.set(e.question_id, cur);
    }
    const now = Date.now();
    const dismissedMap = this.userData.getReviewDismissedMap();
    const items = [];
    const manual = this._normManual(this.userData.getReviewManual()).filter((m) => {
      const dAt = dismissedMap[m.id];
      return !(dAt != null && dAt >= (m.at || 0));
    });
    const manualSet = new Set(manual.map((m) => m.id));
    for (const m of manual) {
      let cat = "", diff = null;
      let typ = m.type || "tossup";
      try { const hit = this.getQuestionAny(m.id, typ); if (!hit) continue; typ = hit.type; cat = hit.question.category || ""; diff = hit.question.difficulty != null ? hit.question.difficulty : null; } catch {}
      items.push({ id: m.id, type: typ, category: cat, difficulty: diff, given: "", buzzPosition: null, manual: true, ageMs: Math.max(0, now - (m.at || 0)) });
    }
    for (const [qid, st] of byQ) {
      if (manualSet.has(qid) || !st.lastWrong) continue;
      const dAt = dismissedMap[qid];
      if (dAt != null && dAt >= st.last) continue;
      let kind;
      if (st.lastPoints < 0) kind = "neg";
      else if ((st.lastGiven || "").trim()) kind = "wrongEnd";
      else kind = "unanswered";
      if (kind === "neg" && !wantNegs) continue;
      if (kind === "wrongEnd" && !wantWrongEnd) continue;
      if (kind === "unanswered" && !wantUnanswered) continue;
      items.push({ id: qid, type: "tossup", category: st.category || "", difficulty: st.difficulty, given: st.given || "", buzzPosition: st.buzz, ageMs: Math.max(0, now - st.last) });
    }
    // A missed tossup whose id is no longer a tossup (moved to bonuses, or gone)
    // cannot be replayed from the tossup queue.
    {
      const tIds = items.filter((it) => it.type === "tossup" && !it.manual).map((it) => it.id);
      const live = tIds.length ? this.questionDb.getCategoryInfo("tossups", tIds) : new Map();
      for (let i = items.length - 1; i >= 0; i--) if (items[i].type === "tossup" && !items[i].manual && !live.has(items[i].id)) items.splice(i, 1);
    }
    items.sort((a, b) => a.ageMs - b.ageMs);
    const limit = opts.limit || 400;
    const top = items.slice(0, limit);
    return { count: items.length, ids: top.map((i) => i.id), items: top };
  }

  parseAnswerline(answerline, sanitized) {
    return parseDirectives(answerline || "", sanitized || "");
  }

  scoreTossupResult(userAnswer, tossup, buzzCharIndex, fullyRead, strictness, previous = null) {
    const pos = this._readPos(tossup, fullyRead ? null : buzzCharIndex);
    let unsure = false;   // open-class line ("accept equivalents") and nothing matched
    const res = scoreTossup(
      {
        userAnswer,
        answerline: tossup.answer,
        sanitizedAnswer: tossup.answer_sanitized,
        buzzCharIndex,
        questionText: tossup.question_sanitized || tossup.question,
        fullyRead,
      },
      (ua, al, sa) => {
        const ev = evaluateAnswer(ua, al, sa, strictness, { ...pos, ...this._judgeOpts(tossup), ...(previous ? { previous } : {}) });
        unsure = ev.status !== "accept" && !!ev.unsure;
        return { correct: ev.status === "accept" };
      }
    );
    if (unsure) res.unsure = true;
    return res;
  }

  // previous[i] = the answer that drew part i's prompt (the follow-up round).
  scoreBonusResult(userAnswers, bonus, strictness = 10, overrides = null, previous = null) {
    let partOpts = null, values = [];
    try {
      const n = JSON.parse(bonus.answers || "[]").length;
      partOpts = Array.from({ length: n }, (_, i) => ({
        ...this._bonusPartPos(bonus, i), ...this._judgeOpts(bonus, i),
        ...(Array.isArray(previous) && previous[i] ? { previous: previous[i] } : {}),
      }));
    } catch { partOpts = null; }
    try { values = JSON.parse(bonus.point_values || "[]"); } catch { values = []; }
    const result = checkBonus(userAnswers, bonus, strictness, partOpts);
    // Manual per-part overrides (mark up / mark down): null keeps the judged
    // verdict, true/false replaces it; the score is recomputed from the mix at
    // each part's own value.
    let parts = result.parts;
    if (Array.isArray(overrides)) {
      parts = parts.map((pt, i) => {
        if (overrides[i] == null) return pt;
        const v = Number.isFinite(+values[i]) && +values[i] > 0 ? +values[i] : 10;
        return { ...pt, correct: !!overrides[i], points: overrides[i] ? v : 0 };
      });
    }
    return {
      ...scoreBonus(parts),
      parts,
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
    return this._relabel(this.userData.getSessionEntries(sessionId));
  }

  // Every recorded attempt for the active profile (question_id, given_answer,
  // buzz_position, points, category…). Plugins that need cross-session history
  // would otherwise have to fan out one request per session.
  //
  // opts.answers resolves each entry's answer here rather than making the
  // caller re-request one question at a time — the same normalization
  // getAnswerPowers uses, so callers can compare against it directly.
  // answer_norms is a list because a bonus carries one answer per part.
  getAllSessionEntries(opts = {}) {
    const entries = this._relabel(this.userData.getAllSessionEntries());
    if (!opts || !opts.answers) return entries;

    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const cache = new Map();
    const resolve = (type, qid) => {
      const key = type + ":" + qid;
      if (cache.has(key)) return cache.get(key);
      let out = { answer: "", answer_norms: [] };
      try {
        if (type === "bonus") {
          const b = this.questionDb.getBonus(qid);
          if (b) {
            const raw = JSON.parse(b.answers || "[]");
            const sani = JSON.parse(b.answers_sanitized || "[]");
            const heads = (Array.isArray(raw) ? raw : []).map((a, i) => {
              try { return primaryAnswer(a || "", (sani && sani[i]) || ""); } catch { return ""; }
            });
            out = { answer: heads.filter(Boolean).join(" / "), answer_norms: heads.map(norm).filter(Boolean) };
          }
        } else {
          const t = this.questionDb.getTossup(qid);
          if (t) {
            let head = "";
            try { head = primaryAnswer(t.answer || "", t.answer_sanitized || ""); } catch { head = ""; }
            if (!head) head = t.answer_sanitized || t.answer || "";
            out = { answer: head, answer_norms: [norm(head)].filter(Boolean) };
          }
        }
      } catch {
        /* a missing or malformed row just means no answer for this entry */
      }
      cache.set(key, out);
      return out;
    };

    return entries.map((e) => {
      if (!e.question_id) return e;
      const r = resolve(e.type === "bonus" ? "bonus" : "tossup", e.question_id);
      return { ...e, answer: r.answer, answer_norms: r.answer_norms };
    });
  }

  // categories per session in the CURRENT tree (rows store the old labels)
  getSessionList() {
    const list = this.userData.getSessionList();
    try {
      const bySession = new Map();
      for (const e of this._relabel(this.userData.getAllSessionEntries())) {
        if (!e.session_id) continue;
        const set = bySession.get(e.session_id) || new Set();
        if (e.category) set.add(e.category);
        bySession.set(e.session_id, set);
      }
      return list.map((s) => (bySession.has(s.session_id) ? { ...s, categories: [...bySession.get(s.session_id)].join(",") } : s));
    } catch { return list; }
  }

  deleteSession(sessionId) {
    return this.userData.deleteSession(sessionId);
  }

  deleteSessionsOlderThan(days) {
    return this.userData.deleteSessionsOlderThan(days);
  }

  getOverallStats(since) {
    let entries = this.userData.getAllSessionEntries();
    if (since) entries = entries.filter((e) => (e.timestamp || 0) >= since);
    return computeStats(this._relabel(entries));
  }

  // Recorded answers store the category the question had WHEN it was played.
  // Every reader (stats, achievements, breakdowns, review, plugins) goes
  // through this instead, so history always shows the CURRENT category tree:
  // switching question databases relabels nothing on disk. A question that is
  // no longer in the database keeps its stored labels. Ids are looked up in
  // both tables (28 old tossup ids now live in bonuses).
  _relabel(entries) {
    if (!Array.isArray(entries) || !entries.length || !this.questionDb) return entries;
    const ids = entries.map((e) => e && e.question_id).filter(Boolean);
    if (!ids.length) return entries;
    let t, b;
    try {
      t = this.questionDb.getCategoryInfo("tossups", ids);
      b = this.questionDb.getCategoryInfo("bonuses", ids);
    } catch { return entries; }
    return entries.map((e) => {
      if (!e || !e.question_id) return e;
      const q = (e.type === "bonus" ? (b.get(e.question_id) || t.get(e.question_id)) : (t.get(e.question_id) || b.get(e.question_id)));
      if (!q) return e;
      let partCount;
      if (q.part_count != null) partCount = q.part_count;
      else if (q.parts != null) { try { partCount = JSON.parse(q.parts).length; } catch { partCount = undefined; } }
      return {
        ...e,
        category: q.category || e.category,
        subcategory: q.subcategory || "",
        alternate_subcategory: q.alternate_subcategory || "",
        // v1 file: the three level names joined, so path matching works on both
        category_path: q.category_path !== undefined ? (q.category_path || "") : [q.category, q.subcategory, q.alternate_subcategory].filter(Boolean).join(" > "),
        ...(q.category_id !== undefined ? { category_id: q.category_id || "" } : {}),
        ...(partCount != null && e.type === "bonus" ? { part_count: partCount } : {}),
      };
    });
  }

  getSessionStats(sessionId) {
    const entries = this.userData.getSessionEntries(sessionId);
    return computeStats(this._relabel(entries));
  }

  getAnswerPowers() {
    const ids = this.userData.getPoweredAnswerIds();
    const counts = {};
    const classes = {};
    // norm -> { "cat|sub|alt": [question ids] } so an achievement described as
    // "N different <topic> QUESTIONS" can count distinct questions rather than
    // distinct names (ten powers on Thor are one Norse figure but may be ten
    // questions) — see computeAchievementData distinct:"questions".
    const questions = {};
    for (const qid of ids) {
      let t;
      try { t = this.questionDb.getTossup(qid); } catch (e) { t = null; }
      if (!t) continue;
      let head;
      try { head = primaryAnswer(t.answer || "", t.answer_sanitized || ""); } catch (e) { head = ""; }
      const norm = apFold(head || t.answer_sanitized || t.answer || "");
      if (!norm) continue;
      counts[norm] = (counts[norm] || 0) + 1;
      // class = the question's category PATH (achievements match by prefix)
      const ck = t.category_path || [t.category, t.subcategory, t.alternate_subcategory].filter(Boolean).join(" > ");
      const cm = classes[norm] || (classes[norm] = {});
      cm[ck] = (cm[ck] || 0) + 1;
      const qm = questions[norm] || (questions[norm] = {});
      const list = qm[ck] || (qm[ck] = []);
      if (!list.includes(qid)) list.push(qid);
    }
    return { answer_counts: counts, answer_classes: classes, answer_questions: questions };
  }

  getSessionBreakdown(category, difficulty) {
    const sessions = this.userData.getSessionList();
    const allEntries = this._relabel(this.userData.getAllSessionEntries());
    return computeSessionBreakdown(sessions, allEntries, { category, difficulty });
  }


  // Question-database updates come from GitHub (src/main/updater.js): the
  // version is the open database's build stamp (meta built_at; 0 on an old
  // QBReader-format database, so any published release is newer).
  async checkForUpdate() {
    const current = (this.questionDb && this.questionDb.getMeta && this.questionDb.getMeta("built_at")) || "0";
    return updater.checkForUpdate({ currentVersion: current });
  }

  // Background job: download + verify the newest database NEXT TO the install
  // path while the open one keeps serving; commitDbUpdate() then swaps it in.
  // state: idle | checking | downloading | ready | error.
  dbUpdateStatus() {
    return { ...this._dbUpd };
  }

  startDbUpdate() {
    if (this._dbJob || this._dbUpd.state === "ready") return this.dbUpdateStatus();
    this._dbUpd = { state: "checking", pct: 0, label: "Checking…" };
    this._dbJob = (async () => {
      try {
        const info = await this.checkForUpdate();
        if (!info.available || !info.latest) { this._dbUpd = { state: "idle", needsAppUpdate: !!info.needsAppUpdate }; return; }
        const { id: version, name, size } = info.latest;
        const pending = updater.pendingUpdate(this.dbInstallPath);
        if (!pending || String(pending.version) !== version) {
          this._dbUpd = { state: "downloading", pct: 0, label: "Starting…", version, name, size };
          await updater.prepareUpdate(version, this.dbInstallPath, (p) => { this._dbUpd.pct = p.pct; this._dbUpd.label = p.label; });
        }
        this._dbUpd = { state: "ready", version, name };
      } catch (e) {
        this._dbUpd = { state: "error", error: e.message || String(e) };
      } finally {
        this._dbJob = null;
      }
    })();
    return this.dbUpdateStatus();
  }

  // Instant swap of a ready download (the renderer reloads afterwards).
  commitDbUpdate() {
    if (this._dbUpd.state !== "ready") return { ok: false, error: "no downloaded database is waiting" };
    if (this.questionDb) { this.questionDb.close(); this.questionDb = null; }
    let r = null;
    try {
      r = updater.commitUpdate(this.dbInstallPath);
      if (r) this.dbPath = this.dbInstallPath;
    } finally {
      this.questionDb = new QuestionDatabase(this.dbPath);
    }
    this._dbUpd = { state: "idle" };
    return r ? { ok: true, result: r } : { ok: false, error: "the downloaded database could not be installed" };
  }

  // "Download & install" in Settings: the same job, waited on, then the swap.
  async applyUpdate(_version, onProgress) {
    this.startDbUpdate();
    const tick = setInterval(() => { const s = this._dbUpd; if (onProgress && s.state === "downloading") onProgress({ pct: s.pct, label: s.label }); }, 250);
    try { if (this._dbJob) await this._dbJob; } finally { clearInterval(tick); }
    if (this._dbUpd.state === "error") throw new Error(this._dbUpd.error);
    if (this._dbUpd.state !== "ready") throw new Error("no newer question database is published");
    const c = this.commitDbUpdate();
    if (!c.ok) throw new Error(c.error);
    return c.result;
  }

  async importQuestions(setsData, tossupsData, bonusesData) {
    // Writes QBReader-format rows; on the new database they would lack the tree,
    // flags and playable columns (and be hidden from practice).
    if (this.questionDb && this.questionDb.v2) throw new Error("Importing QBReader dumps is not supported on this question database");
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
