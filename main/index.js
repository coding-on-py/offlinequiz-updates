import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { QuestionDatabase } from "./database.js";
import { UserData } from "./userData.js";
import { checkAnswer, checkBonus, evaluateAnswer, parseDirectives, frequencyKey, similarityKeys, similarKeysMatch, primaryAnswer } from "./answerChecker.js";
import { scoreTossup, scoreBonus } from "./scoring.js";
import { computeStats, computeSessionBreakdown } from "./stats.js";
import * as updater from "./updater.js";
import { randomBytes, createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, renameSync, statSync, existsSync } from "node:fs";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));

// The account server (the website). The desktop app signs in there, keeps the
// token in this profile's config ("cloud:<profile>") and syncs the profile into
// the account (POST /api/sync, see userData.js). QB_CLOUD_URL points tests at a
// local website server.
const CLOUD_URL = String(process.env.QB_CLOUD_URL || "https://www.onlinequiz.net").replace(/\/+$/, "");
const CLOUD_OFFLINE = "Couldn't reach onlinequiz.net — check your internet connection.";

const DEFAULT_DB_PATH = join(__dirname, "..", "..", "data", "questions.db");
// Frequency lists keep at most this many merged answers (~90 pages of 50).
const FREQ_MAX = 5000;
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


// ── Buzzwords, done where the questions are ────────────────────────────────
// The Buzzwords plugin used to fetch every question in its scope (≈7 MB a 2,500-question
// page) and count in the page. buzzwordsApi does the same count here and sends back only
// the candidates (the plugin keeps its instant knobs). It must read questions the way the
// plugin did: the app's own reading text (questionPlainText, notes and pronunciation guides
// out) is lifted from the renderer's app.js — like mpserver/qtext.mjs — then the plugin kit's
// note / guide stripping, tokens and n-grams, ported as they are.
const BW_VERSION = 1;
const BW_APP_FNS = ["_ENT", "decodeEntities", "htmlStyleRuns", "NOTE_RUN_LABEL", "noteRunsFromHtml", "foldLikeSanitized", "cutNotesUsingHtml",
  "NOTE_AUDIENCE", "noteMentionsPlayers", "stripModeratorNotes", "applyNoteFilter", "PRON_ACRONYMS", "PRON_KEEP_WORDS", "stripPronunciations", "questionPlainText"];
const _bwLifted = new Map();
function bwAppText(appJs) {
  if (_bwLifted.has(appJs)) return _bwLifted.get(appJs);
  const src = readFileSync(appJs, "utf8"), lines = src.split("\n");
  const pick = (name) => {
    const s = lines.findIndex((l) => l.startsWith(`function ${name}(`) || l.startsWith(`const ${name} =`));
    if (s < 0) throw new Error("buzzwords: " + name + " not in app.js");
    const fn = lines[s].startsWith("function ");
    for (let i = s; i < lines.length; i++) if (fn ? lines[i] === "}" : /;\s*(\/\/.*)?$/.test(lines[i])) return lines.slice(s, i + 1).join("\n");
    throw new Error("buzzwords: " + name + " has no end");
  };
  // pronunciation guides go once, in bwText (the plugin read the app's text with its default
  // settings — notes cut, guides kept — then stripped the guides itself)
  const box = { state: { settings: { hideNotes: true, hidePronunciations: false } } };
  vm.createContext(box);
  vm.runInContext(BW_APP_FNS.map(pick).join("\n\n") + "\n;globalThis.__bw = { questionPlainText, stripPronunciations };", box, { filename: "app.js (buzzwords)" });
  _bwLifted.set(appJs, box.__bw);
  return box.__bw;
}
// the plugin kit (plugins/buzz-words.zip impl.js __qbKit), as it is
const BW_NOTE_LBL = /(?:note to (?:the )?(?:moderators?|readers?)\b|reader(?:'s)? note\b|moderator(?:'s)? note\b)/i;
const BW_NOTE_LBL_G = /(?:note to (?:the )?(?:moderators?|readers?)\b|reader(?:'s)? note\b|moderator(?:'s)? note\b)\s*(?:#\s*\d+\s*)?(?:,[^:]{0,40})?:\s*/gi;
const BW_NOTE_RUN = /^\s*[\[(<*]*\s*(?:note to (?:the )?(?:moderators?|readers?)\b|reader(?:'s)? note\b|moderator(?:'s)? note\b)/i;
const BW_ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function bwDecode(s) {
  return String(s || "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") { try { return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)); } catch (x) { return m; } }
    const v = BW_ENT[e.toLowerCase()]; return v == null ? m : v;
  });
}
function bwNoteRuns(html) {
  if (!html || html.indexOf("<") < 0) return [];
  const runs = []; let it = 0, last = 0, m; const re = /<\/?([a-z]+)[^>]*>/gi;
  const push = (t) => { if (!t) return; const p = runs[runs.length - 1], ital = it > 0; if (p && p.italic === ital) p.text += t; else runs.push({ text: t, italic: ital }); };
  while ((m = re.exec(html))) {
    push(bwDecode(html.slice(last, m.index)));
    const tag = m[1].toLowerCase();
    if (tag === "i" || tag === "em") it = Math.max(0, it + (m[0][1] === "/" ? -1 : 1));
    last = re.lastIndex;
  }
  push(bwDecode(html.slice(last)));
  return runs.filter((r) => r.italic && BW_NOTE_RUN.test(r.text)).map((r) => r.text.trim());
}
const bwFold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/ /g, " ");
const bwCut = (t, i, j) => t.slice(0, i).replace(/\s+$/, "") + (i > 0 && j < t.length ? " " : "") + t.slice(j).replace(/^\s+/, "");
function bwStripNotes(t, html) {
  if (!BW_NOTE_LBL.test(t)) return t;
  for (const note of bwNoteRuns(html)) {
    for (const c of [bwFold(note), note]) { const i = t.indexOf(c); if (i >= 0) { t = bwCut(t, i, i + c.length); break; } }
  }
  if (!BW_NOTE_LBL.test(t)) return t;
  t = t.replace(/\s*[\[(]\s*(?:notes?\s+to\s+(?:the\s+)?(?:moderators?|readers?)|(?:moderators?|readers?)(?:'s)?\s+notes?)\b[^\])]*[\])]/gi, " ");
  let m, guard = 0;
  BW_NOTE_LBL_G.lastIndex = 0;
  while ((m = BW_NOTE_LBL_G.exec(t)) && guard++ < 6) {
    let s = m.index; const from = s + m[0].length, rest = t.slice(from, from + 300); let b = -1;
    const w = rest.match(/^\S+\s+/), re = /[.!?]+["'”’)]*\s+|[a-z0-9"'”’)]\s+(?=[A-Z](?:[a-z'’]|\s))/g; let mm;
    re.lastIndex = w ? w[0].length : 0;
    while ((mm = re.exec(rest))) {
      const stop = /^[.!?]/.test(mm[0]);
      if (!stop && ((rest.slice(0, mm.index + 1).match(/"/g) || []).length % 2)) continue;
      b = stop ? mm.index + mm[0].length : mm.index + 1; break;
    }
    while (s > 0 && /[\s*<\[(]/.test(t[s - 1])) s--;
    t = bwCut(t, s, b >= 0 ? from + b : from);
    BW_NOTE_LBL_G.lastIndex = s;
  }
  return t;
}
function bwText(q, fns) {
  let t = null;
  try { t = fns.questionPlainText(q, "question"); } catch (e) { t = null; }
  if (typeof t !== "string") t = q.question_sanitized || "";
  t = bwStripNotes(bwDecode(t), q.question);
  // every guide rule needs a "[" or a "(" (one that isn't the power mark): most questions have none
  if (/\[|\((?!\*\))/.test(t)) { try { t = fns.stripPronunciations(t); } catch (e) {} }
  return String(t || "").replace(/\s*\(\s*["“][^"”()]*["”]\s*\)/g, "").replace(/\s{2,}/g, " ").trim();
}
const bwMainAnswer = (sani) => bwDecode(sani).split(/[\[(<]/)[0].trim().replace(/[;:,.]+$/, "");
const bwTokens = (text) => (String(text || "").toLowerCase().match(/[\p{L}\p{N}'’]+/gu) || []).map((w) => w.replace(/['’]s$/, "")).filter(Boolean);
function bwSlice(q, cv, fns) {
  const text = bwText(q, fns);
  if (cv.power) { const pi = text.indexOf("(*)"); return pi < 0 ? [] : bwTokens(text.slice(0, pi)); }
  const words = bwTokens(text.replace(/\(\*\)/g, " "));
  const n = words.length; if (!n) return [];
  if (cv.lo <= 0 && cv.hi >= 100) return words;
  const a = Math.round((cv.lo / 100) * n), b = Math.round((cv.hi / 100) * n);
  return words.slice(a, Math.max(a + 1, b));
}
const BW_STOP = new Set(("a an the this that these those it its his her hers he she they them their theirs we us our you your i me my mine of in on at to for from with within without by as is are was were be been being am do does did done not no nor so or and but if then than because while during after before until once when where which who whom whose what why how all any both each few more most other some such only own same here there over under again further about above below between into through against up down out off very can will just should now points point name names named ftp identify gives give given made make makes making one two three four five six seven eight nine ten first second third often called also another may might must shall many much work works worked title titled known includes including include described describes describe used uses use using like unlike along man woman men women person people city country state nation work novel poem play opera symphony war battle king queen god goddess author authors poet poets composer composers writer writers artist artists painter sculptor novelist playwright philosopher thinker scientist character characters figure entity thing things wrote written writes have has had having").split(/\s+/));
const BW_PERSON = new Set(["Person", "Fictional Character", "Deity or Mythic Being", "Legendary or Scriptural Figure"]);
const BW_PLACE = new Set(["Place", "Place Type or Landform"]), BW_EVENT = new Set(["Event", "Period or Movement"]);
const BW_GROUP = new Set(["Organization or Company", "Group, Dynasty or Family", "People or Ethnic Group", "Musical Group or Band"]);
function bwType(tags) {
  let t = null;
  if (typeof tags === "string") { const m = /"answer_type"\s*:\s*\[\s*"((?:[^"\\]|\\.)*)"/.exec(tags); t = m ? m[1] : null; }
  else if (tags && tags.answer_type) t = tags.answer_type[0];
  if (!t) return "";
  if (/^Work:/.test(t)) return "work";
  return BW_PERSON.has(t) ? "person" : BW_PLACE.has(t) ? "place" : BW_EVENT.has(t) ? "event" : BW_GROUP.has(t) ? "group" : "thing";
}
// words, 2- and 3-word phrases: none starting or ending with a common word, none holding an
// answer word, a 1-letter word or a number (each word's checks worked out once)
function bwGrams(words, skip, emit) {
  const n = words.length, stop = new Uint8Array(n), bad = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const w = words[i]; stop[i] = BW_STOP.has(w) ? 1 : 0; bad[i] = skip.has(w) || w.length < 2 || /^\d+$/.test(w) ? 1 : 0; }
  for (let i = 0; i < n; i++) {
    const w = words[i];
    if (w.length >= 3 && !stop[i] && !bad[i]) emit(w);
    if (i + 2 > n || stop[i] || bad[i]) continue;
    if (!stop[i + 1] && !bad[i + 1]) emit(w + " " + words[i + 1]);
    if (i + 3 <= n && !stop[i + 2] && !bad[i + 1] && !bad[i + 2]) emit(w + " " + words[i + 1] + " " + words[i + 2]);
  }
}
function bwHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) || 1; }

export class App {
  




  constructor(opts = {}) {
    this.dbPath = opts.dbPath || DEFAULT_DB_PATH;
    this.userDbPath = opts.userDbPath || DEFAULT_USER_DB_PATH;
    // Where a downloaded question database is installed (packaged app: userData;
    // dev: the repo's data/questions.db itself).
    this.dbInstallPath = opts.dbInstallPath || this.dbPath;
    this._dbUpd = { state: "idle" };   // background question-database update
    this._dbJob = null;
    // Where the default frequency lists are kept between launches (the app's
    // userData); unset = memory only (the website, tests).
    this.freqCacheDir = opts.freqCacheDir || null;

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
    return this._withHidden(this.questionDb.getTossup(id));
  }

  getBonus(id) {
    return this._withHidden(this.questionDb.getBonus(id));
  }

  // The practice page judges answers itself (src/renderer/judge.js, built from answerChecker.js)
  // and needs a question's hidden answers for that — so every question handed out carries them:
  // `_hidden` (null when it has none). Judging here still reads them from the database.
  _withHidden(q) {
    if (q && typeof q === "object" && q.id != null && !Object.prototype.hasOwnProperty.call(q, "_hidden")) {
      try { q._hidden = this.questionDb.getHiddenAnswers ? this.questionDb.getHiddenAnswers(q.id) : null; } catch { q._hidden = null; }
    }
    return q;
  }
  _rowsWithHidden(r) {
    if (r && Array.isArray(r.rows)) r.rows.forEach((q) => this._withHidden(q));
    return r;
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
    return f ? this._rowsWithHidden(this.questionDb.queryTossups(f)) : { rows: [], total: 0 };
  }

  queryBonuses(filters) {
    const f = this._scopeToStarred(filters, "bonus");
    return f ? this._rowsWithHidden(this.questionDb.queryBonuses(f)) : { rows: [], total: 0 };
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
    return this._withHidden(this.questionDb.getRandomTossup(resolved));
  }

  getRandomBonus(filters) {
    const resolved = this._resolveStarredFilter(filters, "bonus");
    if (resolved === null) return undefined;
    return this._withHidden(this.questionDb.getRandomBonus(resolved));
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
      tags: filters.tags,
    };
  }

  // Tag vocabulary (every value per family, with counts) — cached next to the
  // user database so it is computed once per question-database build.
  getTagVocab() {
    let cacheFile = null;
    try { cacheFile = join(dirname(this.userDbPath), "tag-vocab.json"); } catch { cacheFile = null; }
    return this.questionDb.getTagVocab ? this.questionDb.getTagVocab(cacheFile) : { tags: {} };
  }

  // "Narrow by" tags for a search / filter set; type tossups | bonuses.
  getTagFacets(type, query, filters) {
    const t = type === "bonuses" || type === "bonus" ? "bonus" : "tossup";
    const f = this._scopeToStarred(filters, t);
    if (!f) return { facets: [], exact: true, sampled: 0 };
    return this.questionDb.getTagFacets ? this.questionDb.getTagFacets(t === "bonus" ? "bonuses" : "tossups", query || "", f) : { facets: [], exact: true, sampled: 0 };
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
    const pc = this.questionDb.getPacketContent(setName, packetNumber);
    if (pc) { (pc.tossups || []).forEach((q) => this._withHidden(q)); (pc.bonuses || []).forEach((q) => this._withHidden(q)); }
    return pc;
  }

  getCategoryTree(type) {
    return this.questionDb.getCategoryTree(type === "bonuses" ? "bonuses" : "tossups");
  }

  getDbInfo() {
    const m = (k) => (this.questionDb.getMeta ? this.questionDb.getMeta(k) : null);
    return { schema: this.questionDb.v2 ? 2 : 1, mode: m("source_mode") || null, tree: m("tree_spec_version") || null, built: m("built_at") || null };
  }

  // /api/frequent-answers for both transports. Category/subcategory NAMES are
  // the old contract (plugins); otherwise nodeIds (or one nodeId) pick subtrees
  // and the list is paged: { answers, total, max }.
  // GET /api/analysis/buzzwords: Buzzwords' scan over the tossups matching `filters`, words from
  // the clue range { lo, hi } (percent) or { power } (before the power mark) →
  // { v, n: questions read, answers: [name], types: [type per answer], cands: [[word, answer #,
  // times with that answer, times seen]] } — every word or phrase seen 2+ times whose top answer
  // has 60%+ of its sightings (the plugin's knobs filter from there). Cached per scope; it lets
  // other requests through every few thousand questions (the app's backend stays responsive).
  async buzzwordsApi(filters = {}, clue = {}) {
    const cv = { lo: Math.max(0, Math.min(100, parseInt(clue.lo, 10) || 0)), hi: Math.max(0, Math.min(100, clue.hi == null || clue.hi === "" ? 100 : parseInt(clue.hi, 10))), power: clue.power === true || clue.power === "1" || clue.power === "true" };
    if (isNaN(cv.hi)) cv.hi = 100;
    if (cv.lo > cv.hi) [cv.lo, cv.hi] = [cv.hi, cv.lo];
    const f = { ...filters }; delete f.limit; delete f.offset; delete f.random; delete f.sort;
    const key = JSON.stringify([BW_VERSION, f, cv]);
    this._bwCache = this._bwCache || new Map();
    const hit = this._bwCache.get(key);
    if (hit) { this._bwCache.delete(key); this._bwCache.set(key, hit); return hit; }
    const disk = this._bwDisk(key);
    if (disk) { this._bwCache.set(key, Promise.resolve(disk)); return disk; }
    const appJs = join(this.rendererDir || join(__dirname, "..", "renderer"), "app.js");
    const fns = bwAppText(existsSync(appJs) ? appJs : join(__dirname, "..", "renderer", "app.js"));
    const p = this._buzzwords(f, cv, fns);
    p.then((r) => this._bwDisk(key, r), () => {});
    this._bwCache.set(key, p);
    p.catch(() => { if (this._bwCache.get(key) === p) this._bwCache.delete(key); });
    while (this._bwCache.size > 12) this._bwCache.delete(this._bwCache.keys().next().value);
    return p;
  }
  // a scan kept on disk (the app: userData/bw-cache; the website's workers: their cache folder)
  // for this question database build — the newest 40; another build's go
  _bwDisk(key, value) {
    if (!this.freqCacheDir) return null;
    const dir = join(this.freqCacheDir, "bw-cache");
    const build = String(this.getDbInfo().built || "v1").replace(/[^A-Za-z0-9_.-]/g, "_");
    const prefix = `${build}-`, name = prefix + createHash("sha1").update(key).digest("hex").slice(0, 20) + ".json";
    try {
      if (value === undefined) { const r = JSON.parse(readFileSync(join(dir, name), "utf8")); return r && r.v === BW_VERSION && Array.isArray(r.cands) ? r : null; }
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, name + ".tmp"), JSON.stringify(value));
      renameSync(join(dir, name + ".tmp"), join(dir, name));
      const files = readdirSync(dir).filter((x) => x.endsWith(".json"));
      for (const x of files) if (!x.startsWith(prefix)) { try { unlinkSync(join(dir, x)); } catch {} }
      const mine = files.filter((x) => x.startsWith(prefix));
      if (mine.length > 40) mine.map((x) => ({ x, t: statSync(join(dir, x)).mtimeMs })).sort((a, b) => a.t - b.t).slice(0, mine.length - 40).forEach((o) => { try { unlinkSync(join(dir, o.x)); } catch {} });
    } catch { return null; }
    return null;
  }
  async _buzzwords(f, cv, fns) {
    const total = this.getCount("tossups", f);
    let slots = 1 << 20; while (slots < total * 48 && slots < (1 << 24)) slots <<= 1;
    // Q: the question a word was last counted in — each word counts once per question (the plugin
    // kept a Set per question for that)
    const H = new Uint32Array(slots), A = new Int32Array(slots), Q = new Int32Array(slots), MASK = slots - 1, LIMIT = Math.floor(slots * 0.75);
    let used = 0, aid = 0, qn = 0;
    const stats = new Map(), ansIds = new Map(), disp = [], types = [];
    const see = (g) => {
      const st = stats.get(g);
      if (st !== undefined) {
        if (st === 0 || st.q === qn) return;
        st.q = qn;
        st.t++;
        if (st.m === null) {
          if (st.ba === aid) { st.b++; return; }
          st.m = [st.ba, st.b, aid, 1];
        } else {
          const m = st.m; let i = 0;
          while (i < m.length && m[i] !== aid) i += 2;
          if (i < m.length) { const c = ++m[i + 1]; if (c > st.b) { st.b = c; st.ba = aid; } } else m.push(aid, 1);
        }
        if (st.t >= 12 && st.b * 3 < st.t) stats.set(g, 0);
        return;
      }
      const h = bwHash(g); let j = h & MASK;
      while (H[j] !== 0) {
        if (H[j] === h) {
          if (Q[j] === qn) return;
          const a0 = A[j]; stats.set(g, a0 === aid ? { t: 2, b: 2, ba: aid, m: null, q: qn } : { t: 2, b: 1, ba: a0, m: [a0, 1, aid, 1], q: qn }); return;
        }
        j = (j + 1) & MASK;
      }
      if (used < LIMIT) { H[j] = h; A[j] = aid; Q[j] = qn; used++; }
    };
    let n = 0;
    for (const q of this.questionDb.iterateTossupText(f)) {
      if (++n % 3000 === 0) await new Promise((r) => setImmediate(r));
      const full = bwMainAnswer(q.answer_sanitized);
      if (!full) continue;
      const k = full.toLowerCase(); let id = ansIds.get(k);
      if (id === undefined) { id = disp.length; ansIds.set(k, id); disp.push(full); types.push(null); }
      aid = id;
      const bt = bwType(q.tags);
      if (bt) { const tt = types[id] || (types[id] = {}); tt[bt] = (tt[bt] || 0) + 1; }
      qn++;
      bwGrams(bwSlice(q, cv, fns), new Set(bwTokens(q.answer_sanitized)), see);
    }
    const cands = [], used2 = new Map(), answers = [], atypes = [];
    stats.forEach((st, g) => {
      if (st === 0 || st.t < 2 || st.b < 0.6 * st.t) return;
      let ai = used2.get(st.ba);
      if (ai === undefined) {
        ai = answers.length; used2.set(st.ba, ai); answers.push(disp[st.ba]);
        const tt = types[st.ba]; let best = "thing", bn = 0;
        if (tt) for (const x in tt) if (tt[x] > bn) { bn = tt[x]; best = x; }
        atypes.push(tt ? best : "");
      }
      cands.push([g, ai, st.b, st.t]);
    });
    return { v: BW_VERSION, n, answers, types: atypes, cands };
  }

  frequentAnswersApi({ category, subcategory, alternateSubcategory, limit, qtype, nodeId, nodeIds, offset } = {}) {
    const lim = Math.max(1, Math.min(2000, parseInt(limit) || 50));
    const type = qtype === "bonus" || qtype === "both" ? qtype : "tossup";
    if (category || subcategory || alternateSubcategory) {
      return { answers: this.getFrequentAnswers(category || null, subcategory || null, alternateSubcategory || null, lim, type, nodeId || null) };
    }
    const ids = (Array.isArray(nodeIds) ? nodeIds : String(nodeIds || nodeId || "").split(",")).map(String).filter(Boolean);
    return this.getFrequentAnswersPage({ qtype: type, nodeIds: ids, offset: parseInt(offset) || 0, limit: lim });
  }

  // The whole merged list for (qtype, subtrees) is built once (~2 s over every
  // tossup) and kept on the open database, so every later page is instant.
  getFrequentAnswersPage({ qtype = "tossup", nodeIds = [], offset = 0, limit = 50 } = {}) {
    const db = this.questionDb;
    const ids = [...new Set(nodeIds.map(String).filter(Boolean))].sort();
    const key = qtype + "|" + ids.join(",");
    const cache = db._freqCache || (db._freqCache = new Map());
    let list = cache.get(key);
    if (list) { cache.delete(key); cache.set(key, list); }
    else {
      // a list takes 1–3 s to build (much longer on the website's small server), so
      // every one built is kept on disk per database build — the whole-database ones
      // and each category pick — for every later page, process and restart
      list = this._freqDisk(qtype, undefined, ids);
      if (!list) {
        list = this._frequencyRows(null, null, null, qtype, ids.length ? ids : null, FREQ_MAX);
        this._freqDisk(qtype, list, ids);
      }
      cache.set(key, list);
      while (cache.size > 12) cache.delete(cache.keys().next().value);
    }
    const off = Math.max(0, offset | 0);
    return { answers: list.slice(off, off + limit), total: list.length, max: list.length ? list[0].count : 0 };
  }

  // read (list omitted) or write the on-disk copy of a whole-database list
  _freqDisk(qtype, list, ids = []) {
    if (!this.freqCacheDir) return null;
    const FREQ_VERSION = 1;   // bump when the list-building rules change
    const dir = join(this.freqCacheDir, "freq-cache");
    const build = String(this.getDbInfo().built || "v1").replace(/[^A-Za-z0-9_.-]/g, "_");
    const prefix = `${FREQ_VERSION}-${build}-`;
    const pick = ids && ids.length ? "-" + createHash("sha1").update(ids.join(",")).digest("hex").slice(0, 16) : "";
    const name = `${prefix}${qtype}${pick}.json`;
    try {
      if (!list) { const l = JSON.parse(readFileSync(join(dir, name), "utf8")); return Array.isArray(l) ? l : null; }
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, name + ".tmp"), JSON.stringify(list));
      renameSync(join(dir, name + ".tmp"), join(dir, name));
      // another database build's lists go; category picks: the newest 600 stay
      const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
      for (const f of files) if (!f.startsWith(prefix)) { try { unlinkSync(join(dir, f)); } catch {} }
      const picks = files.filter((f) => f.startsWith(prefix) && /-[0-9a-f]{16}\.json$/.test(f));
      if (picks.length > 600) picks.map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs })).sort((a, b) => a.t - b.t).slice(0, picks.length - 600).forEach((x) => { try { unlinkSync(join(dir, x.f)); } catch {} });
    } catch { return null; }
    return null;
  }

  getFrequentAnswers(category, subcategory, alternateSubcategory, limit = 50, qtype = "tossup", nodeId = null) {
    return this._frequencyRows(category, subcategory, alternateSubcategory, qtype, nodeId, limit);
  }

  _frequencyRows(category, subcategory, alternateSubcategory, qtype, nodeId, limit) {
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
      const keys = similarityKeys(e.display);
      const bk = keys.k.slice(0, 2);
      let reps = buckets.get(bk);
      if (!reps) { reps = []; buckets.set(bk, reps); }
      // compared against each group's FIRST answer, as before (keys fixed at creation)
      const rep = reps.find((r) => similarKeysMatch(r.keys, keys));
      if (rep) { if (e.count > rep.count) rep.display = e.display; rep.count += e.count; }
      else { const ne = { display: e.display, count: e.count, keys }; reps.push(ne); merged.push(ne); }
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
      const cur = byQ.get(e.question_id) || { last: 0, lastWrong: false, category: "", path: "", given: "", buzz: null, lastPoints: 0, lastGiven: "", difficulty: null };
      const t = new Date(e.timestamp).getTime() || 0;
      if (t >= cur.last) {
        cur.last = t; cur.lastWrong = !e.correct;
        cur.lastPoints = e.points != null ? e.points : 0;
        cur.lastGiven = e.given_answer || "";
        cur.category = e.category || cur.category;
        cur.path = e.category_path || cur.path;
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
      let cat = "", path = "", diff = null;
      let typ = m.type || "tossup";
      try { const hit = this.getQuestionAny(m.id, typ); if (!hit) continue; typ = hit.type; cat = hit.question.category || ""; path = hit.question.category_path || [hit.question.category, hit.question.subcategory, hit.question.alternate_subcategory].filter(Boolean).join(" > "); diff = hit.question.difficulty != null ? hit.question.difficulty : null; } catch {}
      items.push({ id: m.id, type: typ, category: cat, path, difficulty: diff, given: "", buzzPosition: null, manual: true, ageMs: Math.max(0, now - (m.at || 0)) });
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
      items.push({ id: qid, type: "tossup", category: st.category || "", path: st.path || st.category || "", difficulty: st.difficulty, given: st.given || "", buzzPosition: st.buzz, ageMs: Math.max(0, now - st.last) });
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
  // the Streaks page: practice per day in the viewer's time zone, the streaks
  getActivity(tz) {
    return this.userData.activityDays(Number(tz) || 0);
  }

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

  getOverallStats(since, categoryIds) {
    let entries = this.userData.getAllSessionEntries();
    if (since) entries = entries.filter((e) => (e.timestamp || 0) >= since);
    return computeStats(this._inCategories(this._relabel(entries), categoryIds));
  }

  // Relabeled entries inside the picked category subtrees (node ids, array or
  // "a,b"); none picked = all of them.
  _inCategories(entries, categoryIds) {
    const ids = (Array.isArray(categoryIds) ? categoryIds : String(categoryIds || "").split(",")).map(String).filter(Boolean);
    if (!ids.length) return entries;
    const paths = ids.map((id) => this.questionDb.getCategoryNode(id)).filter(Boolean).map((n) => n.path);
    if (!paths.length) return entries;
    return entries.filter((e) => { const p = e.category_path || e.category || ""; return paths.some((u) => p === u || p.startsWith(u + " > ")); });
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
      // an older skip: no answer, no points, and the reading stopped well before the end
      // (a dead question was read out — its position is at the end)
      const oldSkip = e.type !== "bonus" && !e.correct && !e.points && !e.given_answer && q.qlen > 0 && e.buzz_position != null && e.buzz_position < q.qlen - 15;
      return {
        ...e,
        ...(oldSkip ? { skipped: true } : {}),
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

  getSessionBreakdown(category, difficulty, categoryIds) {
    const sessions = this.userData.getSessionList();
    const allEntries = this._inCategories(this._relabel(this.userData.getAllSessionEntries()), categoryIds);
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

  // ── account + sync (desktop app) ──
  // The renderer calls the same /api/account/*, /api/friends* paths as on the
  // website; here they are forwarded to the account server with this profile's
  // token (which never reaches the renderer or its plugins). runtime.js sets
  // this.cloudFetch to Electron's net.fetch (the system's certificates, so it
  // works behind school filters that inspect HTTPS); plain fetch otherwise.
  _cloudKey() { return "cloud:" + this.userData.getActiveProfileId(); }
  _cloud() { try { return JSON.parse(this.userData.getConfig(this._cloudKey()) || "null"); } catch { return null; } }
  _setCloud(c) { if (c) this.userData.setConfig(this._cloudKey(), JSON.stringify(c)); else this.userData.deleteConfig(this._cloudKey()); }
  _deviceId() {
    let d = this.userData.getConfig("cloud_device");
    if (!d) { d = randomBytes(16).toString("base64url"); this.userData.setConfig("cloud_device", d); }
    return d;
  }
  async _cloudFetch(method, path, body, token) {
    const f = this.cloudFetch || fetch;
    let r;
    try {
      r = await f(CLOUD_URL + path, {
        method,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: method === "GET" ? undefined : JSON.stringify(body || {}),
        signal: AbortSignal.timeout(path === "/api/sync" ? 90000 : 20000),
      });
    } catch (e) { return { error: CLOUD_OFFLINE, offline: true }; }
    let data = null;
    try { data = await r.json(); } catch {}
    if (r.status === 401 && token) {
      // the sign-in ended (signed out elsewhere, password reset, expired)
      const c = this._cloud(); if (c && c.token === token) this._setCloud(null);
      return { error: "You were signed out — sign in again.", signedOut: true };
    }
    if (!data) return { error: CLOUD_OFFLINE, offline: true };
    return data;
  }
  async cloudRoute(method, path, body) {
    body = body || {};
    const c = this._cloud();
    const key = method + " " + path;
    if (key === "GET /api/account/me") {
      if (!c) {
        // signed out: are accounts open on the server yet? (unreachable: let them try)
        const r = await this._cloudFetch("GET", "/api/account/me");
        return { available: r.error ? true : r.available !== false, app: true, google: !!r.google, user: null, required: false, ...(r.error ? { offline: true } : {}) };
      }
      const r = await this._cloudFetch("GET", "/api/account/me", null, c.token);
      if (r.signedOut) return { available: true, app: true, user: null, required: false, signedOutNote: r.error };
      if (r.error) return { available: true, app: true, user: c.user || null, required: false, offline: true, lastSync: c.lastSync || null, syncError: c.syncError || null };
      const now = this._cloud();
      if (now && r.user) { now.user = r.user; this._setCloud(now); }
      return { available: r.available !== false, app: true, google: !!r.google, user: r.user || null, required: false, lastSync: (now && now.lastSync) || null, syncError: (now && now.syncError) || null };
    }
    if (key === "POST /api/account/login") {
      const r = await this._cloudFetch("POST", "/api/account/login", { email: body.email, password: body.password, client: "app" });
      if (!r.ok || !r.token) return r.ok ? { error: "The server didn't sign this app in — try again." } : r;
      // another account on this profile before: start its sync from scratch
      const same = c && c.user && r.user && c.user.email === r.user.email;
      this._setCloud({ token: r.token, user: r.user, pulled: same ? c.pulled || 0 : 0, pushed: same ? c.pushed || 0 : 0, lastSync: same ? c.lastSync || null : null });
      this._cloudFetch("POST", "/api/account/profile", { tz: body.tz, avatar: body.avatar }, r.token).catch(() => {});
      return { ok: true, user: r.user };
    }
    if (key === "POST /api/account/logout") {
      if (c) { await this._cloudFetch("POST", "/api/account/logout", {}, c.token).catch(() => {}); this._setCloud(null); }
      return { ok: true };
    }
    if (["POST /api/account/signup", "POST /api/account/resend", "POST /api/account/forgot"].includes(key)) return this._cloudFetch("POST", path, body);
    if (key === "POST /api/cloud/sync") return this.syncNow();
    // Sign in through the browser (Continue with Google): the server gives a code
    // and a poll secret (kept here), the browser page approves the code, and the
    // poll returns this app's token.
    if (key === "POST /api/account/app-link/start") {
      const r = await this._cloudFetch("POST", "/api/account/app-link/start", {});
      if (!r.ok) return r;
      this._appLink = { code: r.code, poll: r.poll, at: Date.now() };
      const url = r.url + (body.google ? "&google=1" : "");
      this._openExternal(url);
      return { ok: true, code: r.code, url };
    }
    if (key === "POST /api/account/app-link/poll") {
      const l = this._appLink;
      if (!l || Date.now() - l.at > 10 * 60e3) return { error: "This sign-in expired — try again.", expired: true };
      const r = await this._cloudFetch("POST", "/api/account/app-link/poll", { code: l.code, poll: l.poll });
      if (!r.ok || !r.token) return r.error ? r : { pending: true };
      this._appLink = null;
      const same = c && c.user && r.user && c.user.email === r.user.email;
      this._setCloud({ token: r.token, user: r.user, pulled: same ? c.pulled || 0 : 0, pushed: same ? c.pushed || 0 : 0, lastSync: same ? c.lastSync || null : null });
      this._cloudFetch("POST", "/api/account/profile", { tz: body.tz }, r.token).catch(() => {});
      return { ok: true, user: r.user };
    }
    if (key === "POST /api/cloud/open") { this._openExternal(String(body.url || "")); return { ok: true }; }
    // the global leaderboard is public; the rest needs the account
    if (key === "GET /api/leaderboards") return this._cloudFetch("GET", path + (body.qs ? "?" + body.qs : ""), null, c && c.token);
    if (key === "GET /api/users/profile") return this._cloudFetch("GET", path + (body.qs ? "?" + body.qs : ""), null, c && c.token);
    // the shop (a room of your own) and room tickets: the account's, through the website
    if (key === "GET /api/shop/info") return this._cloudFetch("GET", path, null, c && c.token);
    if (/^GET \/api\/shop\/(room-available|order|rooms)$/.test(key) || key === "POST /api/shop/checkout" || key === "POST /api/mp/ticket") {
      if (!c) return { error: "Sign in first.", authRequired: true };
      return this._cloudFetch(method, path + (method === "GET" && body.qs ? "?" + body.qs : ""), method === "GET" ? null : body, c.token);
    }
    if (key === "POST /api/account/profile" || key === "GET /api/friends" || /^POST \/api\/friends\/(request|respond|remove)$/.test(key)
      || key === "GET /api/leaderboards/board" || /^POST \/api\/leaderboards\/(create|invite|respond|leave|remove|rename|delete)$/.test(key)) {
      if (!c) return { error: "Sign in first.", authRequired: true };
      return this._cloudFetch(method, path + (method === "GET" && body.qs ? "?" + body.qs : ""), method === "GET" ? null : body, c.token);
    }
    return { error: "Not available in the app" };
  }
  // Open an onlinequiz.net page in the person's own browser (Google won't sign
  // in inside an app window). Only the account server's own pages.
  _openExternal(url) {
    if (typeof url !== "string" || !url.startsWith(CLOUD_URL + "/")) return false;
    if (process.env.QB_NO_EXTERNAL_OPEN === "1") { this._lastOpened = url; return true; }   // tests
    const cmd = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url.replace(/&/g, "^&")]] : ["xdg-open", [url]];
    try { execFile(cmd[0], cmd[1], { windowsHide: true }, () => {}); return true; } catch { return false; }
  }

  // Two-way sync of the active profile with its account: push what changed
  // here, apply what changed there, in batches until both sides are done. One
  // run at a time; a change made meanwhile goes in the next run.
  syncNow() {
    if (!this._syncP) this._syncP = this._syncRun().finally(() => { this._syncP = null; });
    return this._syncP;
  }
  async _syncRun() {
    const pid = this.userData.getActiveProfileId();
    let c = this._cloud();
    if (!c) return { ok: false, signedOut: true };
    const device = this._deviceId(), t0 = Date.now();
    let pushed = 0, pulled = 0;
    for (let round = 0; round < 1000; round++) {
      const out = this.userData.exportChanges(c.pushed || 0, 1500);
      const r = await this._cloudFetch("POST", "/api/sync", { device, since: c.pulled || 0, changes: out.changes, limit: 2000 }, c.token);
      const cur = this._cloud();
      if (this.userData.getActiveProfileId() !== pid || !cur || cur.token !== c.token) return { ok: false, error: "The profile or account changed during the sync." };
      if (!r || !r.ok) {
        cur.syncError = (r && r.error) || "The sync didn't finish.";
        this._setCloud(cur);
        return { ok: false, error: cur.syncError, offline: !!(r && r.offline), signedOut: !!(r && r.signedOut) };
      }
      this.userData.applyChanges(r.changes, { assignSeq: false });
      c = { ...cur, pushed: out.cursor, pulled: r.cursor };
      this._setCloud(c);
      pushed += out.changes.length; pulled += (r.changes || []).length;
      if (!out.more && !r.more) break;
    }
    c.lastSync = Date.now(); c.syncError = null;
    this._setCloud(c);
    return { ok: true, pushed, pulled, lastSync: c.lastSync, ms: Date.now() - t0 };
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
