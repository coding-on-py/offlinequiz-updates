




const isElectron = !!(window.qbreader);

function qbEmit(ev, data) {
  try { if (window.QB) window.QB._emit(ev, data); } catch {}
}

let ttsHold = false;

function getArt(name) {
  if (typeof ART !== "undefined" && ART[name]) return ART[name];
  if (window.ART && window.ART[name]) return window.ART[name];
  return "";
}

function parseQuery(qs) {
  if (!qs) return {};
  const params = new URLSearchParams(qs);
  const out = {};
  for (const [k, v] of params) {
    if (k === "categories" || k === "subcategories" || k === "alternateSubcategories" || k === "setIds" || k === "setNames")
      out[k] = v.split(",").filter(Boolean);
    else if (k === "difficulties")
      out[k] = v.split(",").map(Number).filter((n) => !isNaN(n));
    else if (k === "standard")
      out[k] = v === "1" || v === "true";
    else if (k === "limit" || k === "offset")
      out[k] = parseInt(v);
    else if (k === "random")
      out[k] = true;
    else
      out[k] = v;
  }
  return out;
}

const API = isElectron
  ? {
      get(url) {
        const [path, qs] = url.split("?");
        const q = parseQuery(qs);

        if (path === "/api/sets") return window.qbreader.getSets();
        if (path === "/api/categories") return window.qbreader.getCategories(q.type);
        if (path === "/api/subcategories") return window.qbreader.getSubcategories(q.type, q.category);
        if (path === "/api/alternate-subcategories") return window.qbreader.getAlternateSubcategories(q.type || "tossups", q.category, q.subcategory);
        if (path === "/api/difficulty-range") return window.qbreader.getDifficultyRange(q.type);
        if (path === "/api/tossups/count") return window.qbreader.getCount("tossups", q);
        if (path === "/api/bonuses/count") return window.qbreader.getCount("bonuses", q);
        if (path === "/api/tossups/random") return window.qbreader.getRandomTossup(q);
        if (path === "/api/bonuses/random") return window.qbreader.getRandomBonus(q);
        if (path === "/api/tossups/search") return window.qbreader.searchTossups(q.query || "", q);
        if (path === "/api/bonuses/search") return window.qbreader.searchBonuses(q.query || "", q);
        if (path === "/api/tossups/query") return window.qbreader.queryTossups(q);
        if (path === "/api/bonuses/query") return window.qbreader.queryBonuses(q);
        if (path.startsWith("/api/tossups/")) return window.qbreader.getTossup(path.split("/")[3]);
        if (path.startsWith("/api/bonuses/")) return window.qbreader.getBonus(path.split("/")[3]);
        if (path === "/api/starred") return window.qbreader.getStarred(q.type);
        if (path === "/api/starred/check") return window.qbreader.checkStarred(q.questionId, q.type);
        if (path === "/api/stats") return window.qbreader.getStats(q.sessionId, q.since);
        if (path === "/api/sessions") return window.qbreader.getSessions();
        if (path === "/api/sessions/breakdown") return window.qbreader.getSessionBreakdown(q.category, q.difficulty);
        if (path === "/api/sessions/entries") return window.qbreader.getSessionEntries(q.sessionId);
        if (path === "/api/answer-powers") return window.qbreader.getAnswerPowers();
        if (path === "/api/profiles") return window.qbreader.getProfiles();
        if (path === "/api/profiles/active") return window.qbreader.getActiveProfile();
        if (path === "/api/check-update") return window.qbreader.checkUpdate();
        if (path === "/api/app-update-info") return window.qbreader.appUpdateInfo ? window.qbreader.appUpdateInfo() : { configured: false, active: false, version: 0, dev: true };
        if (path === "/api/app-update-peek") return window.qbreader.appUpdatePeek ? window.qbreader.appUpdatePeek() : { unsupported: true };
        if (path === "/api/app-update-plugins") return window.qbreader.appUpdatePlugins ? window.qbreader.appUpdatePlugins() : { version: 0, plugins: [] };
        if (path === "/api/set-packets") return window.qbreader.getSetPackets(q.setName);
        if (path === "/api/packets-for-set") return window.qbreader.getPacketsForSet(q.setName);
        if (path === "/api/packet-content") return window.qbreader.getPacketContent(q.setName, parseInt(q.packetNumber) || 0);
        if (path === "/api/frequent-answers") return window.qbreader.getFrequentAnswers(q.category, q.subcategory, q.alternateSubcategory, parseInt(q.limit) || 50, q.qtype || "tossup");
        if (path === "/api/profile-settings") return window.qbreader.getProfileSettings();
        if (path === "/api/review/due") return window.qbreader.getReviewDue({ negs: q.negs !== "0", unanswered: q.unanswered !== "0", wrongEnd: q.wrongEnd !== "0" });
        if (path === "/api/plugin-data") return window.qbreader.getPluginData(q.plugin, q.key);
        throw new Error("Unknown API route: " + path);
      },
      post(url, data) {
        const path = url.split("?")[0];
        if (path === "/api/check-tossup") return window.qbreader.checkTossup(data.questionId, data.answer, data.buzzPosition, data.sessionId, { fullyRead: data.fullyRead, strictness: data.strictness, overriding: data.overriding, allowPrompt: data.allowPrompt, record: data.record, correct: data.correct, isPower: data.isPower, points: data.points, celerity: data.celerity });
        if (path === "/api/evaluate-tossup") return window.qbreader.evaluateTossup(data.questionId, data.answer, data.strictness, data.buzzPosition);
        if (path === "/api/evaluate-answer") return window.qbreader.evaluateAnswerLine(data.answerline, data.sanitized, data.answer, data.strictness);
        if (path === "/api/parse-answerline") return window.qbreader.parseAnswerline(data.answerline, data.sanitized);
        if (path === "/api/profile-settings") return window.qbreader.saveProfileSettings(data.settings);
        if (path === "/api/review/dismiss") return window.qbreader.dismissReview(data.questionId);
        if (path === "/api/review/manual") return window.qbreader.reviewManual(data.questionId, data.add !== false, data.type);
        if (path === "/api/review/clear") return window.qbreader.clearReview();
        if (path === "/api/sessions/prune") return window.qbreader.pruneSessions(data.days);
        if (path === "/api/plugin-data") return window.qbreader.setPluginData(data.plugin, data.key, data.value);
        if (path === "/api/plugin-sql") return window.qbreader.pluginSql(data.plugin, data.sql, data.params);
        if (path === "/api/check-bonus") return window.qbreader.checkBonus(data.questionId, data.answers, data.sessionId);
        if (path === "/api/starred/toggle") return window.qbreader.toggleStar(data.questionId, data.type);
        if (path === "/api/profiles") return window.qbreader.createProfile(data.name);
        if (path === "/api/profiles/activate") return window.qbreader.setActiveProfile(data.id);
        if (path === "/api/import-questions") return window.qbreader.importQuestions(data.sets, data.tossups, data.bonuses);
        if (path === "/api/apply-update") return window.qbreader.applyUpdate(data.folderId);
        if (path === "/api/app-update-check") return window.qbreader.appUpdateCheck ? window.qbreader.appUpdateCheck() : { configured: false, updated: false, dev: true };
        throw new Error("Unknown API route: " + path);
      },
      delete(url) {
        const path = url.split("?")[0];
        if (path.startsWith("/api/sessions/")) return window.qbreader.deleteSession(decodeURIComponent(path.split("/")[3]));
        if (path.startsWith("/api/profiles/")) return window.qbreader.deleteProfile(decodeURIComponent(path.split("/")[3]));
        throw new Error("Unknown API route: " + path);
      },
    }
  : {
      async get(url, timeoutMs = 15000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const r = await fetch(url, { signal: controller.signal });
          return r.json();
        } finally {
          clearTimeout(timer);
        }
      },
      async post(url, data, timeoutMs = 15000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            signal: controller.signal,
          });
          return r.json();
        } finally {
          clearTimeout(timer);
        }
      },
      async delete(url) {
        const r = await fetch(url, { method: "DELETE" });
        return r.json();
      },
    };

let _profileSyncTimer = null;
function lsGet(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}

// Where the in-app update manifest is published (matches UPDATE_BASE_URL in
// src/main/appUpdater.js). The renderer reads it directly so a version check
// never depends on the packaged backend having a specific IPC handler.
const APP_UPDATE_MANIFEST_URL = "https://raw.githubusercontent.com/coding-on-py/offlinequiz-updates/main/manifest.json";

// Compare dotted numeric versions ("8.1.0", "8.1.1.1.1", "9.2", "10"): returns
// -1 / 0 / 1. Missing trailing segments count as 0, so "9" === "9.0.0".
function cmpVer(a, b) {
  const pa = String(a == null ? 0 : a).split(".");
  const pb = String(b == null ? 0 : b).split(".");
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (parseInt(pa[i], 10) || 0) - (parseInt(pb[i], 10) || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

// Peek at the app update WITHOUT downloading: read the currently-installed
// overlay version via IPC, then fetch the remote manifest and compare.
async function peekAppUpdate() {
  let info = null;
  try { info = await API.get("/api/app-update-info"); } catch (e) {}
  if (info && info.dev) return { dev: true };
  if (info && info.configured === false) return { configured: false };
  const have = info && info.version != null ? info.version : 0;
  let manifest;
  try {
    const res = await fetch(APP_UPDATE_MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("manifest " + res.status);
    manifest = await res.json();
  } catch (e) { return { error: e.message || String(e) }; }
  const version = manifest.version != null ? String(manifest.version) : "0";
  return {
    configured: true,
    available: cmpVer(version, have) > 0,
    version,
    haveVersion: String(have),
    critical: !!manifest.critical,
    notes: typeof manifest.notes === "string" ? manifest.notes.slice(0, 400) : "",
  };
}
function lsSet(key, value) {
  window.localStorage.setItem(key, value);
  clearTimeout(_profileSyncTimer);
  _profileSyncTimer = setTimeout(pushProfileSettings, 800);
}
function collectProfileSettings() {
  return {
    settings: state.settings,
    username: state.username,
    avatar: state.avatar,
    viewMode: state.viewMode,
    filters: window.localStorage.getItem("qb-filters") || null,
  };
}
async function pushProfileSettings() {
  try { await API.post("/api/profile-settings", { settings: collectProfileSettings() }); } catch {}
}
function persistSettingsToLocalStorage() {
  const st = state.settings;
  const map = {
    "qb-speed": st.revealSpeed, "qb-auto-reveal": st.autoReveal,
    "qb-buzz-timeout": st.buzzTimeout, "qb-buzz-window": st.buzzWindow, "qb-bonus-timer": st.bonusTimer,
    "qb-strictness": st.strictness, "qb-allow-rebuzzes": st.allowRebuzzes,
    "qb-stop-on-power": st.stopOnPower, "qb-allow-skips": st.allowSkips,
    "qb-show-qmeta": st.showQuestionMeta, "qb-hide-pron": st.hidePronunciations, "qb-use-weights": st.useWeights,
    "qb-app-accent": st.appAccent, "qb-app-radius": st.appRadius, "qb-app-btngap": st.appBtnGap,
    "qb-app-mode": st.appAppearanceMode, "qb-app-custom-accent": st.appCustomAccent, "qb-app-font": st.appFont,
    "qb-review-wrongend": st.reviewWrongEnd, "qb-session-retention": st.sessionRetentionDays,
    "qb-hotkeys": JSON.stringify(st.hotkeys || {}), "qb-viewmode": state.viewMode,
    "qb-username": state.username, "qb-avatar": state.avatar,
  };
  for (const [k, v] of Object.entries(map)) window.localStorage.setItem(k, String(v));
}
async function loadProfileSettings() {
  try {
    const d = await API.get("/api/profile-settings");
    const p = d && d.settings;
    if (!p) { pushProfileSettings(); return; }
    if (p.settings) Object.assign(state.settings, p.settings);
    if (p.username != null) state.username = p.username;
    if (p.avatar != null) state.avatar = p.avatar;
    if (p.viewMode) state.viewMode = p.viewMode;
    if (p.filters) window.localStorage.setItem("qb-filters", p.filters);
    persistSettingsToLocalStorage();
    initSettings();
    initGameplayControls();
    setRevealSpeed(state.settings.revealSpeed);
    updateKeyLabels();
    const greeting = document.getElementById("title-greeting");
    if (greeting) greeting.textContent = state.username ? `HELLO, ${state.username.toUpperCase()}!` : "";
  } catch {}
}


const state = {
  mode: null,
  sessionActive: false,
  sessionId: null,
  questionCount: 0,
  totalPoints: 0,
  powers: 0,
  negs: 0,
  correct: 0,
  currentQuestion: null,
  buzzPosition: 0,
  revealTimer: null,
  revealIndex: 0,
  prePowerEnd: 0,
  isBuzzed: false,
  isPaused: false,
  bonusPartsAnswered: 0,
  bonusUserAnswers: [],
  bonusAnswers: [],
  lastResult: null,
  resultOverridden: false,
  histories: { tossups: [], bonuses: [] },
  viewMode: localStorage.getItem("qb-viewmode") || "expanded",
  username: localStorage.getItem("qb-username") || "",
  avatar: localStorage.getItem("qb-avatar") || "(◕‿◕)",
  buzzTimerInterval: null,
  buzzTimerRemaining: 0,
  celerityHistory: [],
  correctCelerityHistory: [],
  incorrectCelerityHistory: [],
  subcategoryCache: {},
  escTimer: null,
  escOnce: false,
  settings: {
    theme: localStorage.getItem("qb-theme") || "dark",
    accent: localStorage.getItem("qb-accent") || "blue",
    revealSpeed: parseInt(localStorage.getItem("qb-speed") || "50"),
    autoReveal: localStorage.getItem("qb-auto-reveal") !== "false",
    buzzTimeout: parseInt(localStorage.getItem("qb-buzz-timeout") || "10"),
    buzzWindow: parseInt(localStorage.getItem("qb-buzz-window") || "10"),
    bonusTimer: parseInt(localStorage.getItem("qb-bonus-timer") || "15"),
    strictness: parseInt(localStorage.getItem("qb-strictness") || "20"),
    allowRebuzzes: localStorage.getItem("qb-allow-rebuzzes") === "true",
    stopOnPower: localStorage.getItem("qb-stop-on-power") === "true",
    allowSkips: localStorage.getItem("qb-allow-skips") !== "false",
    showQuestionMeta: localStorage.getItem("qb-show-qmeta") !== "false",
    hidePronunciations: localStorage.getItem("qb-hide-pron") === "true",
    appAccent: localStorage.getItem("qb-app-accent") || "gold",
    appAppearanceMode: localStorage.getItem("qb-app-mode") || "preset",
    appCustomAccent: localStorage.getItem("qb-app-custom-accent") || "#dfb347",
    appFont: localStorage.getItem("qb-app-font") || "default",
    bonusAfter: localStorage.getItem("qb-bonus-after") === "true",
    reviewNegs: localStorage.getItem("qb-review-negs") !== "false",
    reviewUnans: localStorage.getItem("qb-review-unans") !== "false",
    reviewWrongEnd: localStorage.getItem("qb-review-wrongend") !== "false",
    autoReviewNoPower: localStorage.getItem("qb-review-nopower") === "true",
    autoReviewSkipNoMark: localStorage.getItem("qb-review-skipnomark") !== "false",
    appRadius: localStorage.getItem("qb-app-radius") || "default",
    appBtnGap: localStorage.getItem("qb-app-btngap") || "default",
    useWeights: localStorage.getItem("qb-use-weights") === "true",
    sessionRetentionDays: parseInt(localStorage.getItem("qb-session-retention") || "0"),
    hotkeys: JSON.parse(localStorage.getItem("qb-hotkeys") || "{}"),
  },
  hotkeyRebinding: null,
};

Object.defineProperty(state, "sessionHistory", {
  get() { return state.histories[_historyKey()]; },
  set(v) { state.histories[_historyKey()] = v; },
});
function _historyKey() {
  return state.mode === "bonuses" ? "bonuses" : "tossups";
}


const DEFAULT_HOTKEYS = {
  "buzz": "Space",
  "start-skip": "s",
  "next-question": "n",
  "end-session": "q",
  "star-question": "t",
  "pause-reveal": "p",
  "mark-correct": "ArrowUp",
  "mark-incorrect": "ArrowDown",
  "home": "Escape",
  "nav-tossups": "1",
  "nav-bonuses": "2",
  "nav-stats": "3",
  "nav-starred": "4",
  "nav-settings": "5",
  "nav-player": "6",
  "nav-extensions": "7",
};

const HOTKEY_LABELS = {
  "buzz": "Buzz",
  "start-skip": "Start session / Skip question",
  "next-question": "Next question",
  "end-session": "End session",
  "star-question": "Star question",
  "pause-reveal": "Pause / Resume text",
  "mark-correct": "Mark answer correct",
  "mark-incorrect": "Mark answer incorrect",
  "home": "Back",
  "nav-tossups": "Practice Tossups",
  "nav-bonuses": "Practice Bonuses",
  "nav-stats": "Statistics",
  "nav-starred": "Database",
  "nav-settings": "Settings",
  "nav-player": "Player",
  "nav-extensions": "Plugins & Themes",
};

function getHotkey(action) {
  return state.settings.hotkeys[action] || DEFAULT_HOTKEYS[action];
}

function matchesHotkey(e, action) {
  const binding = getHotkey(action);
  if (!binding || binding === "Not Set") return false;
  if (e.metaKey || e.altKey) return false;
  const parts = binding.toLowerCase().split("+");
  const ctrl = parts.includes("ctrl");
  const shift = parts.includes("shift");
  const key = parts[parts.length - 1];
  return (
    e.ctrlKey === ctrl &&
    e.shiftKey === shift &&
    (e.key.toLowerCase() === key || (key === "space" && (e.key === " " || e.code === "Space")))
  );
}

const KEY_GLYPHS = {
  ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
  Enter: "↵", " ": "Space", Escape: "Esc",
};
function keyDisplay(action) {
  const b = getHotkey(action);
  if (!b || b === "Not Set") return "—";
  return b.split("+").map((p) => KEY_GLYPHS[p] || (p.length === 1 ? p.toUpperCase() : p)).join("+");
}

function keyLabelHtml(action, label) {
  return `<span class="key">[${escapeHtml(keyDisplay(action))}]</span> ${escapeHtml(label)}`;
}
function updateKeyLabels() {
  const startBtn = $("#btn-start-session");
  if (startBtn && !state.sessionActive) startBtn.innerHTML = keyLabelHtml("start-skip", "Start Session");
  const endBtn = $("#btn-end-session");
  if (endBtn) endBtn.innerHTML = keyLabelHtml("end-session", "End");
  [["#btn-home"], ["#btn-stats-home"], ["#btn-settings-home"], ["#btn-player-home"], ["#btn-db-home"], ["#btn-ext-home"]]
    .forEach(([sel]) => { const el = $(sel); if (el) el.innerHTML = keyLabelHtml("home", "Back"); });
  const psk = $("#placeholder-start-key"); if (psk) psk.textContent = keyDisplay("start-skip");
}


const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let _dom = {};
function dom(id) { return _dom[id] || (_dom[id] = document.getElementById(id)); }
function refreshDom() {
  _dom = {};
  ["stat-acc","stat-pwr","stat-neg","stat-cel","stat-cel-detail","stat-ppq",
   "session-counter","session-score","btn-start-session","question-area",
   "question-text","question-meta","question-placeholder","question-content",
   "buzz-area","buzz-input","result-area","result-banner","result-answer",
   "btn-next","power-mark","bonus-parts-area","btn-submit-bonus",
   "history-panel","history-list","btn-db-home",
   "category-filters","difficulty-filters","filter-standard","title-status","title-greeting",
  ].forEach(id => { _dom[id] = document.getElementById(id); });
}


const Sound = {
  _ctx: null,
  _init() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
  },
  _beep(freq, len, type = "square", vol = 0.08) {
    this._init();
    if (!this._ctx) return;
    const o = this._ctx.createOscillator();
    const g = this._ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, this._ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + len);
    o.connect(g); g.connect(this._ctx.destination);
    o.start(); o.stop(this._ctx.currentTime + len);
  },
  _clickAt: 0,
  _recentClick() { try { return this._clickAt && (performance.now() - this._clickAt) < 180; } catch (e) { return false; } },
  menu()   { if (this._recentClick()) return; this._beep(800, 0.04, "square", 0.04); },
  buzz()   { this._beep(600, 0.1, "square", 0.06); setTimeout(() => this._beep(900, 0.08, "square", 0.06), 100); },
  correct(){ this._beep(660, 0.08, "square", 0.06); setTimeout(() => this._beep(880, 0.12, "sine", 0.07), 80); },
  power()  { this._beep(880, 0.06, "square", 0.06); setTimeout(() => this._beep(1100, 0.06, "square", 0.06), 60); setTimeout(() => this._beep(1320, 0.12, "sine", 0.07), 120); },
  incorrect(){ this._beep(250, 0.18, "sawtooth", 0.05); },
  next()   { this._beep(500, 0.03, "square", 0.03); },
  skip()   { this._beep(180, 0.12, "triangle", 0.04); },
  star()   { if (this._recentClick()) return; this._beep(1200, 0.05, "sine", 0.04); },
  toggle() { if (this._recentClick()) return; this._beep(700, 0.04, "triangle", 0.05); },
  pause()  { this._beep(400, 0.05, "triangle", 0.03); },
  achievement(){ this._beep(660, 0.08, "sine", 0.06); setTimeout(() => this._beep(880, 0.08, "sine", 0.06), 90); setTimeout(() => this._beep(1320, 0.18, "sine", 0.07), 180); },
  click()  { this._beep(620, 0.02, "square", 0.022); },
};

(function initGlobalClickSound() {
  const SEL = "button,a,input,select,textarea,label,.btn,.pill,.menu-item,.filter-item," +
    ".avatar-option,[role='button'],.session-row,.qh-row,.ext-card,.mode-input,.checkbox-row," +
    ".cat-checkbox,.subcat-checkbox,.diff-checkbox,.tab,.chip,.fo-folder,summary,.clickable";
  let last = 0;
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const t = e.target.closest && e.target.closest(SEL);
    if (!t || t.disabled) return;
    const now = (e.timeStamp || 0);
    if (now - last < 40) return;
    last = now;
    try { Sound._clickAt = performance.now(); Sound.click(); } catch (err) {}
  }, true);
})();


(function initResize() {
  const EDGE = 8;
  let drag = null;
  document.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("input,select,button,textarea,a,.dual-range")) return;
    const panel = e.target.closest(".filters-panel");
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sbW = panel.offsetWidth - panel.clientWidth;
    const onScrollbar = sbW > 0 && e.clientX >= r.left + panel.clientWidth;
    const nearRight = !onScrollbar && Math.abs(e.clientX - r.right) <= EDGE;
    const nearLeft = Math.abs(e.clientX - r.left) <= EDGE;
    if (!nearRight && !nearLeft) return;
    drag = { panel, startX: e.clientX, startW: panel.offsetWidth, edge: nearRight ? 1 : -1 };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!drag) return;
    const delta = e.clientX - drag.startX;
    const newW = Math.max(180, Math.min(620, drag.startW + drag.edge * delta));
    drag.panel.style.width = newW + "px";
    drag.panel.style.flex = "0 0 auto";
  });
  document.addEventListener("mouseup", () => {
    if (!drag) return;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    drag = null;
  });
})();


let _navStack = [];
let _navCurrent = "title";
let _navBack = false;
function recordNav(name) {
  if (name === "starred") name = "database";
  if (name === _navCurrent) return;
  if (_navBack) { _navCurrent = name; return; }
  if (name === "title") { _navStack.length = 0; _navCurrent = "title"; return; }
  _navStack.push(_navCurrent);
  if (_navStack.length > 50) _navStack.shift();
  _navCurrent = name;
}
function navigateTo(name) {
  if (name.includes("::")) {
    if (window.QB?.showPage?.(name)) return;
    name = "title";
  }
  showScreen(name);
  if (name === "practice-tossups") setMode("tossups");
  else if (name === "practice-bonuses") setMode("bonuses");
  else if (name === "stats") loadStats();
  else if (name === "database") loadDatabase();
  else if (name === "settings") initSettings();
  else if (name === "player") loadPlayer();
  else if (name === "extensions") window.QB?.renderScreen();
}
function goBack() {
  if (window.QB?.handleBack?.()) return;
  if (dbBrowseBack()) return;
  if (_navCurrent === "stats" && state.statsSessionId) { state.statsSessionId = null; loadStats(); return; }
  if (state.sessionActive) endSession();
  state.escOnce = false;
  clearTimeout(state.escTimer);
  hideEscHint();
  const prev = _navStack.pop() || "title";
  _navBack = true;
  try { navigateTo(prev); } finally { _navBack = false; }
}

function showScreen(name) {
  recordNav(name);
  crtFlash();
  $$(".screen").forEach((s) => s.classList.remove("active"));
  const mapped = name === "practice-tossups" || name === "practice-bonuses" ? "practice"
    : name === "starred" ? "database" : name;
  const screen = $(`#${mapped}-screen`);
  if (screen) screen.classList.add("active");
  state.mode = name === "practice-tossups" ? "tossups" : name === "practice-bonuses" ? "bonuses" : null;
  // Pin the practice base to the screen being opened — a stale base from an
  // earlier tossup+bonus interleave must never make bonus practice serve tossups.
  if (state.mode) state._practiceBase = state.mode;
  if (mapped === "practice") collapseFilterSections();
  if (mapped === "title") { loadTitleArt(); refreshReviewBadge(); }
  qbEmit("screen:change", { name });
}

// Opening a screen with the settings bar always starts with every collapsible
// section closed.
function collapseFilterSections() {
  $$("#filters-panel .filter-section.collapsible").forEach((s) => s.classList.add("collapsed"));
}

function crtFlash() {
  const overlay = document.getElementById("crt-overlay");
  if (!overlay) return;
  overlay.classList.remove("wipe");
  void overlay.offsetWidth;
  overlay.classList.add("wipe");
  setTimeout(() => overlay.classList.remove("wipe"), 400);
  Sound.menu();
}

function goHome() {
  if (state.sessionActive) endSession();
  state.escOnce = false;
  clearTimeout(state.escTimer);
  hideEscHint();
  showScreen("title");
}

function showEscHint() {
  let el = document.getElementById("esc-hint");
  if (!el) {
    el = document.createElement("div");
    el.id = "esc-hint";
    el.className = "esc-hint";
    el.textContent = "Press [Esc] again to leave";
    $("#question-area")?.appendChild(el);
  }
}

function hideEscHint() {
  const el = document.getElementById("esc-hint");
  if (el) el.remove();
}


function toggleHotkeySheet() {
  let el = document.getElementById("hotkey-sheet");
  if (el) { el.remove(); return; }
  el = document.createElement("div");
  el.id = "hotkey-sheet";
  el.className = "hotkey-sheet";
  const rows = allHotkeyActions()
    .map((a) => `<div class="hk-row"><span>${escapeHtml(a.label)}</span><kbd>${escapeHtml(keyDisplay(a.action))}</kbd></div>`)
    .join("");
  el.innerHTML =
    `<div class="hotkey-sheet-box">
      <div class="hotkey-sheet-title">KEYBOARD SHORTCUTS <span class="text-muted" style="font-weight:400;font-size:11px">? or Esc closes · rebind in Settings [5]</span></div>
      ${rows}
      <div class="hk-row"><span>Show this sheet</span><kbd>?</kbd></div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) el.remove(); });
  document.body.appendChild(el);
}


document.addEventListener("keydown", (e) => {
  if (state.hotkeyRebinding) {
    e.preventDefault();
    if (e.key === "Escape") {
      state.hotkeyRebinding = null;
      renderHotkeySettings();
      return;
    }
    if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
    const parts = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.shiftKey) parts.push("Shift");
    parts.push(e.code === "Space" ? "Space" : e.key);
    const newBinding = parts.join("+");
    const action = state.hotkeyRebinding;
    state.hotkeyRebinding = null;
    const conflict = bindingConflict(action, newBinding);
    if (conflict) {
      state._hotkeyError = action;
      window.QB?.toast?.(`"${newBinding}" is already used by "${conflict.label}"`, "error");
      renderHotkeySettings();
      setTimeout(() => { state._hotkeyError = null; renderHotkeySettings(); }, 1600);
      return;
    }
    state.settings.hotkeys[action] = newBinding;
    lsSet("qb-hotkeys", JSON.stringify(state.settings.hotkeys));
    renderHotkeySettings();
    updateKeyLabels();
    return;
  }

  {
    const tag = e.target.tagName;
    if (e.key === "?" && tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
      toggleHotkeySheet();
      return;
    }
  }

  if (e.key === "Escape") {
    const overlays = [
      ...document.querySelectorAll("#confirm-dialog, #save-menu, #review-menu, #review-viewer, #history-overlay, #hotkey-sheet, .qb-overlay, .fo-overlay, .ar-overlay"),
    ];
    if (overlays.length) { e.preventDefault(); overlays[overlays.length - 1].remove(); return; }
    if (state.sessionActive) {
      if (state.escOnce) {
        clearTimeout(state.escTimer);
        state.escOnce = false;
        endSession();
        goBack();
      } else {
        e.preventDefault();
        state.escOnce = true;
        showEscHint();
        state.escTimer = setTimeout(() => {
          state.escOnce = false;
          hideEscHint();
        }, 1500);
      }
    } else {
      goBack();
    }
    return;
  }

  {
    const isInputG = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
    if (!isInputG) {
      for (const h of pluginHotkeyDefs()) {
        if (matchesHotkey(e, h.action)) { e.preventDefault(); window.QB?.fireHotkey?.(h.action); }
      }
    }
  }

  const activeScreen = document.querySelector(".screen.active");
  if (!activeScreen) return;

  if (activeScreen.id === "title-screen") {
    if (matchesHotkey(e, "nav-tossups")) { showScreen("practice-tossups"); setMode("tossups"); }
    if (matchesHotkey(e, "nav-bonuses")) { showScreen("practice-bonuses"); setMode("bonuses"); }
    if (matchesHotkey(e, "nav-stats")) { showScreen("stats"); state.statsSessionId = null; loadStats(); }
    if (matchesHotkey(e, "nav-starred")) { showScreen("database"); loadDatabase(); }
    if (matchesHotkey(e, "nav-settings")) { showScreen("settings"); initSettings(); }
    if (matchesHotkey(e, "nav-player")) { showScreen("player"); loadPlayer(); }
    if (matchesHotkey(e, "nav-extensions")) { showScreen("extensions"); window.QB?.renderScreen(); }
    return;
  }

  if (activeScreen.id === "practice-screen") {
    const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";

    if (matchesHotkey(e, "buzz") && !isInput) {
      e.preventDefault();
      if (state.sessionActive && !state.isBuzzed && state.mode === "tossups") buzz();
    }
    if (matchesHotkey(e, "start-skip") && !isInput) {
      e.preventDefault();
      if (!state.sessionActive) startSession();
      else if (advanceBonusPart()) { /* revealed the next bonus part */ }
      else if (state.resultAreaVisible) nextQuestion();
      else if (state.settings.allowSkips) skipQuestion();
    }
    if (matchesHotkey(e, "end-session") && !isInput) {
      if (state.sessionActive) endSession();
      goHome();
    }
    if (matchesHotkey(e, "next-question") && !isInput) {
      if (state.sessionActive && advanceBonusPart()) {
        e.preventDefault();
      } else if (state.resultAreaVisible) {
        e.preventDefault();
        nextQuestion();
      } else if (state.sessionActive && state.settings.allowSkips && state.currentQuestion && !state.isBuzzed) {
        e.preventDefault();
        skipQuestion();
      }
    }
    if (matchesHotkey(e, "star-question") && !isInput) {
      e.preventDefault();
      toggleStar();
    }
    if (matchesHotkey(e, "pause-reveal") && !isInput) {
      e.preventDefault();
      togglePause();
    }

    if (state.resultAreaVisible && state.mode === "tossups" && state.lastResult) {
      if (matchesHotkey(e, "mark-correct")) { e.preventDefault(); toggleResultOverride(true); }
      else if (matchesHotkey(e, "mark-incorrect")) { e.preventDefault(); toggleResultOverride(false); }
    }
    if (e.key === "Enter" && state.resultAreaVisible && !isInput) {
      e.preventDefault();
      nextQuestion();
    }
  }
});


function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.settings.theme);
  document.documentElement.setAttribute("data-accent", state.settings.accent);
}

applyTheme();


function computeDailyStreak(byDate) {
  const days = Object.keys(byDate || {}).sort();
  if (!days.length) return 0;
  const DAY = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const last = new Date(days[days.length - 1] + "T00:00:00");
  if (today - last > DAY) return 0;
  let streak = 1;
  for (let i = days.length - 2; i >= 0; i--) {
    const cur = new Date(days[i + 1] + "T00:00:00");
    const prev = new Date(days[i] + "T00:00:00");
    if (cur - prev <= DAY * 1.5) streak++;
    else break;
  }
  return streak;
}

async function initTitle() {
  try {
    const data = await API.get("/api/tossups/count");
    const bonusData = await API.get("/api/bonuses/count");
    const sets = await API.get("/api/sets");
    $("#title-status").textContent =
      `DB: ${(data.count + bonusData.count).toLocaleString()} questions · ${sets.sets.length} sets`;
  } catch (e) {
    $("#title-status").textContent = "DB: offline (server not running)";
  }
  loadTitleArt();
  const greeting = document.getElementById("title-greeting");
  if (greeting) {
    greeting.textContent = state.username ? `HELLO, ${state.username.toUpperCase()}!` : "";
  }
  try {
    const sd = await API.get("/api/stats");
    const streak = computeDailyStreak(sd.stats?.questionsByDate);
    const el = document.getElementById("title-streak");
    if (el) el.textContent = streak >= 2 ? `\u{1F525} ${streak}-day streak` : "";
  } catch {}
  refreshReviewBadge();
}

var AGE_STOPS = [0, 3600e3, 6 * 3600e3, 12 * 3600e3, 86400e3, 3 * 86400e3, 7 * 86400e3, 14 * 86400e3, 30 * 86400e3, Infinity];
var AGE_LABELS = ["Now", "1h", "6h", "12h", "1d", "3d", "7d", "14d", "30d", "\u221e"];
let _reviewItems = [];

async function refreshReviewBadge() {
  try {
    const due = await API.get(reviewDueUrl());
    _reviewItems = due.items || (due.ids || []).map((id) => ({ id, type: "tossup", ageMs: 0 }));
    const item = document.getElementById("menu-review");
    if (!item) return;
    item.classList.remove("hidden");
    item.style.opacity = "";
    item.innerHTML = `<span class="key">[\u21bb]</span> Review (<span id="review-count">${_reviewItems.length}</span>)`;
    item.onclick = () => openReviewMenu(_reviewItems);
  } catch {}
}

function fmtAge(ms) {
  if (ms == null) return "";
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function reviewRemoveAfter() { return localStorage.getItem("qb-review-remove") === "true"; }

function openReviewMenu(items) {
  document.getElementById("review-menu")?.remove();
  const hasFlashcards = (window.QB?.getActivePages?.() || []).some((pg) => pg.id.startsWith("flashcards::"));
  const catSet = [...new Set(items.map((it) => it.category).filter(Boolean))].sort();
  const el = document.createElement("div");
  el.id = "review-menu";
  el.className = "hotkey-sheet";
  el.innerHTML = `
    <div class="hotkey-sheet-box rv-box">
      <div class="hotkey-sheet-title">REVIEW</div>
      <div class="rv-filter">
        <div class="rv-row"><span class="rv-lbl">Age range</span>
          <div class="dual-range rv-dual"><div class="dual-range-track"><div class="dual-range-fill" id="rv-fill"></div></div>
            <input type="range" id="rv-lo" min="0" max="9" step="1" value="0">
            <input type="range" id="rv-hi" min="0" max="9" step="1" value="9"></div>
          <span class="rv-lbl" id="rv-rangeval" style="min-width:96px;text-align:right"></span>
        </div>
        <div class="rv-row"><span class="rv-lbl">Category</span>
          <select id="rv-cat" class="mode-input" style="flex:1">
            <option value="">All categories</option>
            ${catSet.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
          </select>
        </div>
        <div class="rv-row"><span class="rv-lbl">Type</span>
          <select id="rv-type" class="mode-input" style="flex:1">
            <option value="">Tossups &amp; bonuses</option>
            <option value="tossup">Tossups only</option>
            <option value="bonus">Bonuses only</option>
          </select>
        </div>
        <div class="rv-row rv-difficulties"><span class="rv-lbl">Difficulty</span>
          <div class="rv-diff-grid" id="rv-diffs">
            ${[0,1,2,3,4,5,6,7,8,9,10].map((d) => `<label class="rv-diff-chip"><input type="checkbox" class="rv-diff" value="${d}"> ${d}</label>`).join("")}
          </div>
        </div>
        <label class="checkbox-row" style="font-size:12px"><input type="checkbox" id="rv-remove"${reviewRemoveAfter() ? " checked" : ""}> Remove from review after I get it right</label>
        <div class="rv-count text-muted" id="rv-matchcount"></div>
      </div>
      <div class="review-menu-actions">
        <button class="btn btn-primary btn-full" id="rv-play">Play matching as tossups</button>
        ${hasFlashcards ? '<button class="btn btn-full" id="rv-cards">Study matching as flashcards</button>' : ""}
        <button class="btn btn-full" id="rv-view">View matching questions</button>
        <button class="btn btn-full" id="rv-saved">Saved items (keywords, buzz words, cards) — ${itemReviewList().length}</button>
        <button class="btn btn-ghost btn-full" id="rv-clearall">Remove all from review</button>
      </div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) el.remove(); });
  document.body.appendChild(el);

  const lo = el.querySelector("#rv-lo"), hi = el.querySelector("#rv-hi");
  const catSel = el.querySelector("#rv-cat");
  function ageBand() {
    let mn = Math.min(parseInt(lo.value), parseInt(hi.value));
    let mx = Math.max(parseInt(lo.value), parseInt(hi.value));
    if (mn === mx) { if (mx < 9) mx++; else mn--; }
    return { lo: AGE_STOPS[mn], hi: AGE_STOPS[mx], mnI: mn, mxI: mx };
  }
  function selectedDiffs() {
    return new Set([...el.querySelectorAll(".rv-diff:checked")].map((cb) => parseInt(cb.value)));
  }
  const typeSel = el.querySelector("#rv-type");
  function matching() {
    const band = ageBand();
    const cat = catSel ? catSel.value : "";
    const typ = typeSel ? typeSel.value : "";
    const diffs = selectedDiffs();
    const noDiffFilter = diffs.size === 0;
    return items.filter((it) => {
      const age = it.ageMs == null ? 0 : it.ageMs;
      if (age < band.lo || age > band.hi) return false;
      if (cat && it.category !== cat) return false;
      if (typ && (it.type || "tossup") !== typ) return false;
      if (!noDiffFilter && it.difficulty != null && !diffs.has(it.difficulty)) return false;
      return true;
    });
  }
  function paint() {
    const band = ageBand();
    const mn = band.mnI, mx = band.mxI;
    el.querySelector("#rv-rangeval").textContent = AGE_LABELS[mn] + " \u2013 " + AGE_LABELS[mx];
    const fill = el.querySelector("#rv-fill");
    if (fill) { fill.style.left = (mn / 9) * 100 + "%"; fill.style.right = ((9 - mx) / 9) * 100 + "%"; }
    const m = matching();
    el.querySelector("#rv-matchcount").textContent = m.length + " of " + items.length + " match";
  }
  lo.addEventListener("input", paint); hi.addEventListener("input", paint);
  if (catSel) catSel.addEventListener("change", paint);
  if (typeSel) typeSel.addEventListener("change", paint);
  el.querySelectorAll(".rv-diff").forEach((cb) => cb.addEventListener("change", paint));
  paint();
  el.querySelector("#rv-remove").addEventListener("change", (e) => localStorage.setItem("qb-review-remove", e.target.checked.toString()));

  el.querySelector("#rv-play").onclick = () => {
    const ids = matching().filter((it) => (it.type || "tossup") === "tossup").map((it) => it.id);
    if (!ids.length) { window.QB?.toast?.("No tossups match (bonuses can't be played as tossups)", "error"); return; }
    el.remove(); startReviewSession(ids);
  };
  const rc = el.querySelector("#rv-cards");
  if (rc) rc.onclick = () => { const ids = matching().filter((it) => (it.type || "tossup") === "tossup").map((it) => it.id); el.remove(); reviewAsFlashcards(ids); };
  el.querySelector("#rv-view").onclick = () => { el.remove(); openReviewViewer(matching()); };
  el.querySelector("#rv-saved").onclick = () => { el.remove(); openItemReviewViewer(); };
  el.querySelector("#rv-clearall").onclick = () => {
    confirmDialog(`Remove all ${items.length} questions from review? This can't be undone.`, async () => {
      try { await API.post("/api/review/clear", {}); } catch {}
      el.remove(); refreshReviewBadge();
      window.QB?.toast?.("Cleared review");
    }, { yes: "Remove all" });
  };
}

function reviewAsFlashcards(ids) {
  const pages = window.QB?.getActivePages?.() || [];
  const page = pages.find((p) => p.id.startsWith("flashcards::"));
  if (!page) { window.QB?.toast?.("Enable the Flashcards plugin first (Plugins & Themes)", "error"); return; }
  try { localStorage.setItem("qb-flashcards-handoff", JSON.stringify({ ids })); } catch {}
  window.QB.showPage(page.id);
}

async function openReviewViewer(items) {
  document.getElementById("review-viewer")?.remove();
  const el = document.createElement("div");
  el.id = "review-viewer";
  el.className = "review-viewer";
  el.innerHTML = `
    <div class="review-viewer-box">
      <div class="review-viewer-head">
        <span class="hotkey-sheet-title" style="margin:0">REVIEW QUESTIONS</span>
        <span style="display:flex;gap:6px">
          <button class="btn btn-sm btn-ghost" id="rv-collapse">Collapse all</button>
          <button class="btn btn-sm btn-ghost" id="rv-expand">Expand all</button>
          <button class="btn btn-sm btn-ghost" id="rv-close">Close</button>
        </span>
      </div>
      <div class="rv-filterbar">
        <select id="rv-ftype" class="mode-input"><option value="">All types</option><option value="tossup">Tossups</option><option value="bonus">Bonuses</option></select>
        <select id="rv-fcat" class="mode-input"><option value="">All categories</option></select>
        <select id="rv-fsub" class="mode-input"><option value="">All subcategories</option></select>
        <select id="rv-falt" class="mode-input"><option value="">All alternate subcategories</option></select>
        <input type="text" id="rv-vsearch" class="mode-input" placeholder="Search answer / text" autocomplete="off">
      </div>
      <div class="review-viewer-list"><div class="text-muted" style="padding:12px">Loading…</div></div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) el.remove(); });
  document.body.appendChild(el);
  el.querySelector("#rv-close").onclick = () => el.remove();
  await refreshDbStarred();
  const cards = [];
  for (const it of items.slice(0, 80)) {
    const type = it.type || "tossup";
    try {
      if (type === "bonus") {
        const d = await API.get("/api/bonuses/" + encodeURIComponent(it.id));
        if (d.bonus) cards.push({ q: d.bonus, it, type: "bonus" });
      } else {
        const d = await API.get("/api/tossups/" + encodeURIComponent(it.id));
        if (d.tossup) cards.push({ q: d.tossup, it, type: "tossup" });
      }
    } catch {}
  }
  function cardHtml({ q, it, type }) {
    const starred = _dbStarred && _dbStarred.has(type + ":" + q.id);
    const search = ((q.category || "") + " " + (q.subcategory || "") + " " + (q.alternate_subcategory || "") + " " +
      (q.answer_sanitized || "") + " " + (q.question_sanitized || q.leadin_sanitized || "") + " " +
      ((() => { try { return JSON.parse(q.answers_sanitized || "[]").join(" ") + " " + JSON.parse(q.parts_sanitized || "[]").join(" "); } catch { return ""; } })())).toLowerCase();
    const side = `<span class="star-btn rv-save" data-qid="${escapeHtml(q.id)}" data-type="${type}" title="Save to review / folders" style="font-size:16px">+</span>` +
      `<button class="btn btn-sm btn-ghost rv-remove" data-qid="${escapeHtml(q.id)}" title="Stop showing this question in Review">Remove from review</button>` +
      `<span class="qb-star${starred ? " on" : ""}" data-qid="${q.id}" data-type="${type}">${starred ? "\u2605" : "\u2606"}</span>`;
    const dataAttrs = ` data-rvqid="${escapeHtml(q.id)}" data-rvtype="${type}" data-rvsearch="${escapeHtml(search)}" data-cat="${escapeHtml(q.category || "")}" data-sub="${escapeHtml(q.subcategory || "")}" data-alt="${escapeHtml(q.alternate_subcategory || "")}"`;
    if (type === "bonus") {
      let parts = [], answers = [], raws = [];
      try { parts = JSON.parse(q.parts_sanitized || "[]"); } catch {}
      try { answers = JSON.parse(q.answers_sanitized || "[]"); } catch {}
      try { raws = JSON.parse(q.answers || "[]"); } catch {}
      const body = `<div class="qcard-text">${escapeHtml(q.leadin_sanitized || "")}</div>` +
        parts.map((pt, k) => `<div class="qcard-part">[10] ${escapeHtml(pt)}<br><span class="ans">ANSWER: ${answerLineHtml(raws[k], answers[k] || "")}</span></div>`).join("");
      return qcardHtml({
        compact: false, category: q.category, subcategory: q.subcategory, year: q.set_year, difficulty: q.difficulty,
        attrs: dataAttrs,
        sideHtml: `<span class="pill">BONUS</span>` + side,
        answerHtml: `Bonus · ${parts.length} parts`,
        bodyHtml: body,
      });
    }
    const fake = { type: "tossup", question: q, buzzPosition: it.buzzPosition || 0 };
    return qcardHtml({
      compact: false, category: q.category, subcategory: q.subcategory, altSub: q.alternate_subcategory, year: q.set_year, difficulty: q.difficulty,
      attrs: dataAttrs,
      sideHtml: side,
      answerHtml: `Answer: <span class="ans">${answerLineHtml(q.answer, q.answer_sanitized || "")}</span>`,
      bodyHtml: `<div class="qcard-text">${historyQuestionHtml(fake)}</div>` +
        (it.given ? `<div class="qcard-foot">Your answer: <strong style="color:var(--red)">${escapeHtml(it.given)}</strong></div>` : ""),
    });
  }
  const html = cards.map(cardHtml).join("") || '<div class="text-muted" style="padding:12px">Nothing to show.</div>';
  const list = el.querySelector(".review-viewer-list");
  if (list) list.innerHTML = html;
  const fcat = el.querySelector("#rv-fcat"), fsub = el.querySelector("#rv-fsub"), falt = el.querySelector("#rv-falt"), vs = el.querySelector("#rv-vsearch"), ftype = el.querySelector("#rv-ftype");
  const meta = cards.map(({ q }) => ({ cat: q.category || "", sub: q.subcategory || "", alt: q.alternate_subcategory || "" }));
  function fill(sel, values) { const cur = sel.value; const opts = [...new Set(values.filter(Boolean))].sort(); sel.innerHTML = sel.options[0].outerHTML + opts.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join(""); if (opts.includes(cur)) sel.value = cur; }
  fill(fcat, meta.map((m) => m.cat));
  function refillSub() { const c = fcat.value; fill(fsub, meta.filter((m) => !c || m.cat === c).map((m) => m.sub)); fill(falt, meta.filter((m) => !c || m.cat === c).map((m) => m.alt)); }
  refillSub();
  function applyFilters() {
    const c = fcat.value, su = fsub.value, al = falt.value, q = (vs.value || "").toLowerCase().trim();
    const ty = ftype ? ftype.value : "";
    list.querySelectorAll(".qcard[data-rvqid]").forEach((card) => {
      let show = true;
      if (ty && (card.getAttribute("data-rvtype") || "tossup") !== ty) show = false;
      if (c && (card.getAttribute("data-cat") || "") !== c) show = false;
      if (su && (card.getAttribute("data-sub") || "") !== su) show = false;
      if (al && (card.getAttribute("data-alt") || "") !== al) show = false;
      if (q && (card.getAttribute("data-rvsearch") || "").indexOf(q) < 0) show = false;
      card.classList.toggle("hidden", !show);
    });
  }
  fcat.addEventListener("change", () => { refillSub(); applyFilters(); });
  fsub.addEventListener("change", applyFilters);
  falt.addEventListener("change", applyFilters);
  if (ftype) ftype.addEventListener("change", applyFilters);
  if (vs) vs.addEventListener("input", applyFilters);
  list.querySelectorAll(".rv-save").forEach((b) => {
    b.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const type = b.dataset.type || "tossup";
      try { const d = await API.get((type === "bonus" ? "/api/bonuses/" : "/api/tossups/") + encodeURIComponent(b.dataset.qid)); const q = d.tossup || d.bonus; if (q) openSaveMenu(q, type, b); } catch {}
    });
  });
  list.querySelectorAll(".rv-remove").forEach((b) => {
    b.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      try { await API.post("/api/review/dismiss", { questionId: b.dataset.qid }); } catch {}
      el.querySelector(`[data-rvqid="${CSS.escape(b.dataset.qid)}"]`)?.remove();
      refreshReviewBadge();
    });
  });
  el.querySelector("#rv-collapse").onclick = () =>
    el.querySelectorAll(".qcard").forEach((c) => { c.classList.add("compact"); c.classList.remove("expanded"); });
  el.querySelector("#rv-expand").onclick = () =>
    el.querySelectorAll(".qcard").forEach((c) => { c.classList.remove("compact"); c.classList.add("expanded"); });
}

function startReviewSession(ids) {
  if (!ids.length) return;
  state.reviewIds = [...ids];
  state._reviewRemoveAfter = reviewRemoveAfter();
  showScreen("practice-tossups");
  setMode("tossups");
  startSession();
}
function startBonusIdsSession(ids) {
  if (!ids || !ids.length) return;
  state.bonusIds = [...ids];
  showScreen("practice-bonuses");
  setMode("bonuses");
  startSession();
}

$$(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    const screen = item.dataset.screen;
    if (!screen) return;
    showScreen(screen);
    if (screen === "practice-tossups") setMode("tossups");
    if (screen === "practice-bonuses") setMode("bonuses");
    if (screen === "stats") { state.statsSessionId = null; loadStats(); }
    if (screen === "starred") loadDatabase();
    if (screen === "database") loadDatabase();
    if (screen === "settings") initSettings();
    if (screen === "player") loadPlayer();
    if (screen === "extensions") window.QB?.renderScreen();
  });
});


let allCategories = [];

let _allCategoryNames = null;
async function getAllCategoryNames() {
  if (_allCategoryNames) return _allCategoryNames;
  try {
    const [t, b] = await Promise.all([
      API.get("/api/categories?type=tossups"),
      API.get("/api/categories?type=bonuses"),
    ]);
    const set = new Set();
    (t.categories || []).forEach((c) => c.category && set.add(c.category));
    (b.categories || []).forEach((c) => c.category && set.add(c.category));
    _allCategoryNames = [...set].sort();
  } catch {
    _allCategoryNames = [];
  }
  return _allCategoryNames;
}

async function fillCategoryDropdown(sel) {
  if (!sel) return;
  const cats = await getAllCategoryNames();
  const current = sel.value;
  const firstLabel = sel.options[0] ? sel.options[0].textContent : "All categories";
  sel.innerHTML =
    `<option value="">${escapeHtml(firstLabel)}</option>` +
    cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  if ([...sel.options].some((o) => o.value === current)) sel.value = current;
}

function filtersMode() { return state.mode === "bonuses" ? "bonuses" : "tossups"; }
function loadFilterBlob() {
  let obj; try { obj = JSON.parse(localStorage.getItem("qb-filters")); } catch (e) { obj = null; }
  if (!obj || typeof obj !== "object") return {};
  if (obj.categories || obj.difficulties || obj.subcategories) {
    return { tossups: { ...obj }, bonuses: { ...obj } };
  }
  return obj;
}
function getModeFilters() { const b = loadFilterBlob(); return b[filtersMode()] || null; }
function saveModeFilters(fs) { const b = loadFilterBlob(); b[filtersMode()] = fs; lsSet("qb-filters", JSON.stringify(b)); }

function saveFilterState() {
  const cats = getSelectedCategories();
  const subs = {};
  $$("#category-filters .category-group").forEach(group => {
    const catCheck = group.querySelector(".cat-checkbox");
    if (!catCheck?.checked) return;
    const catName = catCheck.value;
    const checkedSubs = [
      ...[...group.querySelectorAll(".subcat-checkbox:checked")].map(cb => cb.value),
      ...[...group.querySelectorAll(".altsub-checkbox:checked")].map(cb => cb.value),
    ];
    subs[catName] = checkedSubs;
  });
  const filterState = {
    categories: cats,
    subcategories: subs,
    standard: $("#filter-standard")?.checked,
    difficulties: getSelectedDifficulties(),
    mode: $("#mode-select")?.value || "random",
    setName: $("#mode-set-name")?.value || "",
    packet: $("#mode-packet")?.value || "",
    starredOnly: $("#filter-starred")?.checked,
    powermarkOnly: $("#filter-powermark")?.checked,
    yearMin: $("#year-min")?.value,
    yearMax: $("#year-max")?.value,
    settings: Object.fromEntries(PER_MODE_SETTING_KEYS.map((k) => [k, state.settings[k]])),
  };
  saveModeFilters(filterState);
}
const PER_MODE_SETTING_KEYS = ["allowRebuzzes", "stopOnPower", "allowSkips", "strictness", "useWeights", "buzzTimeout", "buzzWindow", "bonusTimer", "revealSpeed", "autoReveal", "bonusAfter", "hidePronunciations", "showQuestionMeta"];
function applyModeSettings(saved) {
  if (!saved || typeof saved.settings !== "object") return;
  for (const k of PER_MODE_SETTING_KEYS) if (k in saved.settings) state.settings[k] = saved.settings[k];
  try { initGameplayControls(); } catch (e) {}
  try { setRevealSpeed(state.settings.revealSpeed); } catch (e) {}
}

function restoreFilterState() {
  try {
    const saved = getModeFilters();
    if (!saved) return false;
    if (saved.standard !== undefined && $("#filter-standard"))
      $("#filter-standard").checked = saved.standard;
    if (saved.starredOnly !== undefined && $("#filter-starred"))
      $("#filter-starred").checked = saved.starredOnly;
    if (saved.powermarkOnly !== undefined && $("#filter-powermark"))
      $("#filter-powermark").checked = saved.powermarkOnly;
    if (Array.isArray(saved.difficulties)) {
      $$("#difficulty-filters .diff-checkbox").forEach((cb) => {
        cb.checked = saved.difficulties.includes(parseInt(cb.value));
      });
    }
    if (saved.yearMin !== undefined) $("#year-min").value = saved.yearMin;
    if (saved.yearMax !== undefined) $("#year-max").value = saved.yearMax;
    if (saved.setName !== undefined && $("#mode-set-name")) $("#mode-set-name").value = saved.setName;
    if (saved.packet !== undefined && $("#mode-packet")) $("#mode-packet").value = saved.packet;
    applyModeSettings(saved);
    updateModeFields();
    updateYearLabel();
    return saved;
  } catch { return false; }
}

function restoreCategorySelections(saved) {
  if (!saved?.categories) return;
  const catChecks = $$("#category-filters .cat-checkbox");
  catChecks.forEach(cb => {
    cb.checked = saved.categories.includes(cb.value);
    const group = cb.closest(".category-group");
    const subList = group?.querySelector(".subcategory-list");
    const expand = group?.querySelector(".cat-expand");
    if (!cb.checked) {
      if (subList) {
        subList.querySelectorAll(".subcat-checkbox").forEach(sc => sc.checked = false);
        subList.classList.add("hidden");
      }
      if (expand) expand.textContent = "▸";
    }
  });
  if (saved.subcategories) {
    for (const [cat, subs] of Object.entries(saved.subcategories)) {
      const group = [...$$("#category-filters .category-group")].find(g => g.querySelector(".cat-checkbox")?.value === cat);
      if (!group) continue;
      const catCheck = group.querySelector(".cat-checkbox");
      if (!catCheck?.checked) continue;
      group.querySelectorAll(".subcat-checkbox, .altsub-checkbox").forEach(sc => { sc.checked = subs.includes(sc.value); });
    }
  }
  catChecks.forEach(cb => {
    if (!cb.checked) {
      const subList = cb.closest(".category-group")?.querySelector(".subcategory-list");
      if (subList) {
        subList.querySelectorAll(".subcat-checkbox, .altsub-checkbox").forEach(sc => sc.checked = false);
      }
    }
  });
}

const ALT_SUBCATS = {
  "Other Science": ["Astronomy", "Computer Science", "Earth Science", "Engineering", "Math", "Misc Science"],
  "Other Literature": ["Drama", "Long Fiction", "Poetry", "Short Fiction", "Misc Literature"],
  "Other Fine Arts": ["Architecture", "Dance", "Film", "Jazz", "Musicals", "Opera", "Photography", "Misc Arts"],
  "Social Science": ["Anthropology", "Economics", "Linguistics", "Psychology", "Sociology", "Other Social Science"],
};
function sortSubcats(subs) {
  return subs.slice().sort((a, b) => {
    const ao = /^Other /.test(a.subcategory) ? 1 : 0;
    const bo = /^Other /.test(b.subcategory) ? 1 : 0;
    return ao - bo;
  });
}

async function loadCategories(type) {
  const container = $("#category-filters");
  container.innerHTML = '<div class="text-muted" style="padding:8px">Loading categories...</div>';
  try {
    const data = await API.get(`/api/categories?type=${type}`);
    allCategories = data.categories || [];

    if (allCategories.length === 0) {
      container.innerHTML = '<div class="text-muted" style="padding:8px">No categories found</div>';
      return;
    }

    const typeKey = state.mode === "tossups" ? "tossups" : "bonuses";
    container.innerHTML = "";

    const saved = restoreFilterState();

    for (const c of allCategories) {
      const catDiv = document.createElement("div");
      catDiv.className = "category-group";
      const isChecked = saved?.categories ? saved.categories.includes(c.category) : false;
      catDiv.innerHTML = `
        <label class="filter-item">
          <input type="checkbox" value="${escapeHtml(c.category)}" class="cat-checkbox" ${isChecked ? "checked" : ""}>
          <span class="cat-expand">${isChecked ? "▾" : "▸"}</span>
          <span>${escapeHtml(c.category)}</span>
          <span class="text-muted" style="margin-left:auto;font-size:11px">${c.count}</span>
          <input type="number" class="cat-weight" value="${isChecked ? 10 : 0}" min="0" step="10" title="weight (ratio)" onclick="event.preventDefault()">
        </label>
        <div class="subcategory-list hidden" id="subcats-${escapeHtml(c.category)}"></div>
      `;

      const checkbox = catDiv.querySelector(".cat-checkbox");
      const expand = catDiv.querySelector(".cat-expand");
      const subList = catDiv.querySelector(".subcategory-list");

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          expand.textContent = "\u25BE";
          loadSubcategories(c.category, typeKey, subList, false, true).then(saveFilterState);
        } else {
          expand.textContent = "\u25B8";
          subList.classList.add("hidden");
          subList.querySelectorAll(".subcat-checkbox, .altsub-checkbox").forEach(sc => sc.checked = false);
          saveFilterState();
        }
      });

      expand.addEventListener("click", (e) => {
        e.preventDefault();
        if (subList.classList.contains("hidden")) {
          expand.textContent = "\u25BE";
          loadSubcategories(c.category, typeKey, subList);
        } else {
          expand.textContent = "\u25B8";
          subList.classList.add("hidden");
        }
      });

      container.appendChild(catDiv);

      if (checkbox.checked) {
        setTimeout(() => loadSubcategories(c.category, typeKey, subList, true), 50);
      }
    }
  } catch (e) {
    container.innerHTML = '<div class="text-muted" style="padding:8px">Failed to load categories. Is the server running?</div>';
    console.error("Failed to load categories:", e);
  }
}

async function loadSubcategories(category, type, container, silent = false, checkAll = false) {
  const cacheKey = `${type}:${category}`;
  const applyCheckAll = () => {
    if (!checkAll) return;
    container.querySelectorAll(".subcat-checkbox, .altsub-checkbox").forEach((cb) => {
      cb.checked = true;
      const w = cb.closest(".filter-item")?.querySelector(".subcat-weight, .altsub-weight");
      if (w) w.value = "10";
    });
  };

  if (state.subcategoryCache[cacheKey]) {
    renderSubcategoryList(container, category, state.subcategoryCache[cacheKey]);
    applyCheckAll();
    return;
  }

  if (!silent) {
    container.classList.remove("hidden");
    container.innerHTML = '<div class="text-muted" style="padding:4px 8px;font-size:11px">Loading...</div>';
  }

  try {
    const data = await API.get(`/api/subcategories?type=${type}&category=${encodeURIComponent(category)}`);
    const subs = data.subcategories || [];
    state.subcategoryCache[cacheKey] = subs;
    renderSubcategoryList(container, category, subs);
    applyCheckAll();
  } catch (e) {
    if (!silent) {
      container.innerHTML = '<div class="text-muted" style="padding:4px 8px;font-size:11px">Failed to load</div>';
    }
  }
}

function renderSubcategoryList(container, category, subs) {
  container.classList.remove("hidden");
  if (!subs || subs.length === 0) {
    const group = container.parentElement;
    const expand = group?.querySelector(".cat-expand");
    if (expand) expand.style.visibility = "hidden";
    container.innerHTML = "";
    container.classList.add("hidden");
    return;
  }
  const group = container.parentElement;
  const expand = group?.querySelector(".cat-expand");
  if (expand) expand.style.visibility = "visible";

  let savedSubs = null;
  try {
    const saved = getModeFilters();
    if (saved?.subcategories?.[category]) {
      savedSubs = saved.subcategories[category];
    }
  } catch {}

  const catCheck = group?.querySelector(".cat-checkbox");
  const parentChecked = catCheck?.checked;

  const isSubChecked = (name) => (!parentChecked || !savedSubs) ? false : savedSubs.includes(name);

  if (category === "Social Science" && ALT_SUBCATS["Social Science"]) {
    container.innerHTML = ALT_SUBCATS["Social Science"]
      .map((alt) => altItemHtml(alt, "Social Science", category, isSubChecked(alt) || isSubChecked("Social Science")))
      .join("");
    return;
  }

  container.innerHTML = sortSubcats(subs)
    .map((s) => {
      const isChecked = isSubChecked(s.subcategory);
      const hasAlts = !!ALT_SUBCATS[s.subcategory];
      let html = `
    <label class="filter-item sub-item">
      <input type="checkbox" value="${escapeHtml(s.subcategory)}" data-category="${escapeHtml(category)}" class="subcat-checkbox" ${isChecked ? "checked" : ""}>
      ${hasAlts ? `<span class="altsub-expand" title="alternate subcategories">${isChecked ? "▾" : "▸"}</span>` : ""}
      <span>${escapeHtml(s.subcategory)}</span>
      <span class="text-muted" style="margin-left:auto;font-size:10px">${s.count}</span>
      <input type="number" class="subcat-weight" value="${isChecked ? 10 : 0}" min="0" step="10" title="weight (ratio)" onclick="event.preventDefault()">
    </label>`;
      if (hasAlts) {
        html += `<div class="altsub-list ${isChecked ? "" : "hidden"}" data-parent="${escapeHtml(s.subcategory)}">` +
          ALT_SUBCATS[s.subcategory].map((alt) => altItemHtml(alt, s.subcategory, category, isChecked)).join("") +
          "</div>";
      }
      return html;
    })
    .join("");
}

function altItemHtml(alt, parentSub, category, checked) {
  return `
    <label class="filter-item altsub-item">
      <input type="checkbox" value="${escapeHtml(alt)}" data-parent-sub="${escapeHtml(parentSub)}" data-category="${escapeHtml(category)}" class="altsub-checkbox" ${checked ? "checked" : ""}>
      <span>${escapeHtml(alt)}</span>
      <input type="number" class="altsub-weight" value="${checked ? 10 : 0}" min="0" step="10" title="weight (ratio)" onclick="event.preventDefault()">
    </label>`;
}

function resetPracticeFiltersToDefaults() {
  const ms = $("#mode-select"); if (ms) ms.value = "random";
  updateModeFields();
  $$("#category-filters .cat-checkbox:checked").forEach((cb) => {
    cb.checked = false;
    cb.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const ew = $("#enable-cat-weights");
  if (ew && ew.checked) { ew.checked = false; ew.dispatchEvent(new Event("change", { bubbles: true })); }
  state.settings.useWeights = false; lsSet("qb-use-weights", "false");
  $$("#difficulty-filters .diff-checkbox").forEach((cb) => { cb.checked = ["2", "3", "4", "5"].includes(cb.value); });
  setRevealSpeed(50);
  setBuzzTimer(10);
  setBuzzWindow(10);
  const strict = $("#strictness-slider");
  if (strict) { strict.value = 20; state.settings.strictness = 20; lsSet("qb-strictness", "20"); const lbl = $("#strictness-label"); if (lbl) lbl.textContent = "20"; }
  const std = $("#filter-standard"); if (std) std.checked = false;
  const pm = $("#filter-powermark"); if (pm) pm.checked = true;
  const st = $("#filter-starred"); if (st) st.checked = false;
  const ymin = $("#year-min"); if (ymin) ymin.value = 2010;
  const ymax = $("#year-max"); if (ymax) ymax.value = 2026;
  updateYearLabel();
  saveFilterState();
}

function getSelectedCategories() {
  const checked = [...$$("#category-filters .cat-checkbox:checked")];
  return checked.map((cb) => cb.value);
}

function getSelectedSubcategories() {
  return collectSubcatFilters().subcategories;
}

function collectSubcatFilters() {
  const subs = new Set();
  const alts = new Set();
  $$("#category-filters .category-group").forEach((group) => {
    const catCheck = group.querySelector(".cat-checkbox");
    if (!catCheck?.checked) return;
    group.querySelectorAll(".subcat-checkbox").forEach((cb) => {
      if (cb.checked && !ALT_SUBCATS[cb.value]) subs.add(cb.value);
    });
    const byParent = {};
    group.querySelectorAll(".altsub-checkbox").forEach((a) => {
      const p = a.dataset.parentSub;
      (byParent[p] = byParent[p] || []).push(a);
    });
    Object.keys(byParent).forEach((parent) => {
      const boxes = byParent[parent];
      const checked = boxes.filter((b) => b.checked);
      if (checked.length === 0) return;
      if (checked.length === boxes.length) subs.add(parent);
      else checked.forEach((b) => alts.add(b.value));
    });
  });
  return { subcategories: [...subs], alternateSubcategories: [...alts] };
}

let _allSets = null;

async function loadSets() {
  const sel = $("#mode-set-name");
  if (!sel) return;
  if (!_allSets) {
    try { const data = await API.get("/api/sets"); _allSets = data.sets || []; }
    catch { _allSets = []; }
  }
  const cur = sel.value;
  sel.innerHTML = '<option value="">choose…</option>' +
    _allSets.map((s) => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}${s.year ? " (" + s.year + ")" : ""}</option>`).join("");
  if ([...sel.options].some((o) => o.value === cur)) sel.value = cur;
}

function updateModeFields() {
  const modeVal = $("#mode-select")?.value;
  const isSet = modeVal === "set";
  const isImport = modeVal === "import";
  $("#set-mode-fields")?.classList.toggle("hidden", !isSet);
  $("#import-mode-fields")?.classList.toggle("hidden", !isImport);
  state._gameSig = null;
  const packetMode = isSet || isImport;
  ["#sec-categories", "#sec-difficulty"].forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    el.classList.toggle("filter-disabled", packetMode);
    if (packetMode) el.classList.add("collapsed");
  });
  $$(".packet-disable").forEach((el) => el.classList.toggle("filter-disabled", packetMode));
  ["#year-min", "#year-max", "#filter-powermark", "#filter-starred"].forEach((sel) => {
    const el = $(sel); if (el) el.disabled = packetMode;
  });
  if (isSet) loadSetPackets();
}

function parsePacketNumbers(str) {
  const out = [];
  (str || "").split(",").forEach((part) => {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (/^\d+$/.test(t)) out.push(+t);
  });
  return out;
}

let _setPackets = [];
async function loadSetPackets() {
  const name = $("#mode-set-name")?.value;
  if (!name) { _setPackets = []; return; }
  try { const d = await API.get("/api/set-packets?setName=" + encodeURIComponent(name)); _setPackets = d.packets || []; }
  catch { _setPackets = []; }
  validatePacketInput();
}
function validatePacketInput() {
  const el = $("#mode-packet"); if (!el) return;
  el.classList.remove("input-error");
  if (!_setPackets.length || !el.value.trim()) return;
  const min = _setPackets[0], max = _setPackets[_setPackets.length - 1];
  let changed = false;
  const parts = el.value.split(",").map((p) => {
    const t = p.trim(); if (!t) return "";
    const clamp = (n) => Math.min(Math.max(n, min), max);
    const m = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) { const a = +m[1], b = +m[2], ca = clamp(a), cb = clamp(b); if (ca !== a || cb !== b) changed = true; return ca === cb ? String(ca) : ca + "-" + cb; }
    if (/^\d+$/.test(t)) { const n = +t, c = clamp(n); if (c !== n) changed = true; return String(c); }
    changed = true; return "";
  }).filter(Boolean);
  if (changed) { el.value = parts.join(","); el.classList.add("input-error"); setTimeout(() => el.classList.remove("input-error"), 2500); }
}

$("#mode-select")?.addEventListener("change", () => { updateModeFields(); debounceSaveFilters(); });
$("#import-packet-btn")?.addEventListener("click", () => $("#import-packet-file")?.click());
$("#import-packet-file")?.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const status = $("#import-packet-status");
  try {
    const data = JSON.parse(await file.text());
    const tossups = Array.isArray(data.tossups) ? data.tossups : [];
    const bonuses = Array.isArray(data.bonuses) ? data.bonuses : [];
    if (!tossups.length && !bonuses.length) throw new Error("no questions");
    state._importedPacket = { name: data.name || file.name.replace(/\.json$/i, ""), tossups, bonuses };
    state._gameSig = null;
    if (status) status.textContent = state._importedPacket.name + " — " + tossups.length + " TU · " + bonuses.length + " B";
  } catch {
    state._importedPacket = null;
    if (status) status.textContent = "Couldn't read that file — export one from Packet Builder.";
  }
});
$("#mode-set-name")?.addEventListener("change", () => { state._gameSig = null; loadSetPackets(); debounceSaveFilters(); });
$("#mode-packet")?.addEventListener("change", () => { state._gameSig = null; validatePacketInput(); debounceSaveFilters(); });
$("#mode-packet")?.addEventListener("input", debounceSaveFilters);

function getActiveFilters() {
  const modeVal = $("#mode-select")?.value;
  if (modeVal === "import") return { random: true };
  if (modeVal === "set") {
    const setName = $("#mode-set-name")?.value || "";
    const f = { random: true };
    if (setName) f.setNames = [setName];
    const packets = parsePacketNumbers($("#mode-packet")?.value);
    if (packets.length) f.packetNumbers = packets;
    return f;
  }

  const selectedCats = getSelectedCategories();
  const { subcategories: selectedSubs, alternateSubcategories: selectedAlts } = collectSubcatFilters();

  const fullyChecked = [...$$("#category-filters .category-group")]
    .filter(g => g.querySelector(".cat-checkbox")?.checked)
    .every(g =>
      ![...g.querySelectorAll(".subcat-checkbox")].some(cb => !cb.checked) &&
      ![...g.querySelectorAll(".altsub-checkbox")].some(cb => !cb.checked)
    );

  const difficulties = getSelectedDifficulties();

  const _ya = parseInt($("#year-min")?.value || 2000), _yb = parseInt($("#year-max")?.value || 2026);
  const yearMin = Math.min(_ya, _yb);
  const yearMax = Math.max(_ya, _yb);

  const filters = {
    difficulties,
    standard: $("#filter-standard")?.checked ? 1 : undefined,
    random: true,
    starredOnly: $("#filter-starred")?.checked || false,
    powermarkOnly: $("#filter-powermark")?.checked || false,
    yearMin,
    yearMax,
  };

  if (state.settings.useWeights) {
    const picked = weightedPickCategoryFilter();
    if (picked) {
      if (picked.alternateSubcategory) filters.alternateSubcategories = [picked.alternateSubcategory];
      else if (picked.subcategory) filters.subcategories = [picked.subcategory];
      else filters.categories = [picked.category];
      return filters;
    }
  }

  if (fullyChecked && selectedCats.length > 0 && selectedAlts.length === 0) {
    filters.categories = selectedCats;
  } else if (selectedSubs.length > 0 || selectedAlts.length > 0) {
    if (selectedSubs.length > 0) filters.subcategories = selectedSubs;
    if (selectedAlts.length > 0) filters.alternateSubcategories = selectedAlts;
  } else if (selectedCats.length > 0) {
    filters.categories = selectedCats;
  }
  // No selection = no category constraint: questions are drawn uniformly from
  // the whole pool, so each category appears at its natural database frequency.

  return filters;
}

function describeActiveFilters() {
  const f = getActiveFilters();
  const parts = [];
  if (f.setNames) parts.push("Set: " + f.setNames.join(", ") + (f.packetNumbers ? " (packets " + f.packetNumbers.join(",") + ")" : ""));
  if (f.categories) parts.push("Categories: " + f.categories.join(", "));
  if (f.subcategories) parts.push("Subcats: " + f.subcategories.join(", "));
  if (!f.categories && !f.subcategories && !f.setNames) parts.push("All categories (natural mix)");
  if (f.difficulties && f.difficulties.length) parts.push("Difficulty: " + f.difficulties.join(", "));
  if (f.yearMin || f.yearMax) parts.push("Years: " + (f.yearMin || 2000) + "–" + (f.yearMax || 2026));
  if (state.settings.useWeights) parts.push("weighted");
  if (f.powermarkOnly) parts.push("powermarked");
  if (f.starredOnly) parts.push("starred only");
  return parts.join(" · ");
}

function weightedPick(items) {
  const positive = items.filter((i) => i.weight > 0);
  const pool = positive.length ? positive : items.map((i) => ({ ...i, weight: 1 }));
  const total = pool.reduce((a, b) => a + b.weight, 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const it of pool) { r -= it.weight; if (r <= 0) return it; }
  return pool[pool.length - 1];
}

function weightedPickCategoryFilter() {
  const groups = [...$$("#category-filters .category-group")].filter(
    (g) => g.querySelector(".cat-checkbox")?.checked
  );
  if (!groups.length) return null;
  const catItems = groups.map((g) => ({
    value: g.querySelector(".cat-checkbox").value,
    weight: parseFloat(g.querySelector(".cat-weight")?.value) || 0,
    el: g,
  }));
  const pickedCat = weightedPick(catItems);
  if (!pickedCat) return null;
  const g = pickedCat.el;
  const wOf = (cb) => parseFloat(cb.closest(".filter-item")?.querySelector(".subcat-weight, .altsub-weight")?.value) || 0;

  const units = [];
  g.querySelectorAll(".subcat-checkbox:checked").forEach((cb) => {
    if (!ALT_SUBCATS[cb.value]) units.push({ kind: "sub", value: cb.value, weight: wOf(cb) });
  });
  const byParent = {};
  g.querySelectorAll(".altsub-checkbox").forEach((a) => { (byParent[a.dataset.parentSub] = byParent[a.dataset.parentSub] || []).push(a); });
  Object.keys(byParent).forEach((parent) => {
    const boxes = byParent[parent];
    const checked = boxes.filter((b) => b.checked);
    if (!checked.length) return;
    if (checked.length === boxes.length) {
      const pcb = [...g.querySelectorAll(".subcat-checkbox")].find((c) => c.value === parent);
      units.push({ kind: "sub", value: parent, weight: pcb ? wOf(pcb) : 10 });
    } else {
      checked.forEach((b) => units.push({ kind: "alt", value: b.value, weight: wOf(b) }));
    }
  });

  if (!units.length) return { category: pickedCat.value };
  const picked = weightedPick(units);
  if (!picked) return { category: pickedCat.value };
  if (picked.kind === "alt") return { category: pickedCat.value, alternateSubcategory: picked.value };
  return { category: pickedCat.value, subcategory: picked.value };
}

function getSelectedDifficulties() {
  return [...$$("#difficulty-filters .diff-checkbox:checked")].map((cb) => parseInt(cb.value));
}

function getFilters() {
  return getActiveFilters();
}

$("#difficulty-filters")?.addEventListener("change", debounceSaveFilters);
$("#year-min")?.addEventListener("input", () => { clampYearDual("min"); debounceSaveFilters(); });
$("#year-max")?.addEventListener("input", () => { clampYearDual("max"); debounceSaveFilters(); });
["#filter-starred", "#filter-powermark", "#filter-standard"].forEach((sel) => {
  $(sel)?.addEventListener("change", debounceSaveFilters);
});

document.addEventListener("mousemove", (e) => {
  const host = e.target.closest?.(".dual-range");
  if (!host) return;
  const inputs = host.querySelectorAll("input[type=range]");
  if (inputs.length < 2) return;
  const a = inputs[0], b = inputs[1];
  const rect = host.getBoundingClientRect();
  const min = parseInt(a.min), max = parseInt(a.max), span = (max - min) || 1;
  const val = min + ((e.clientX - rect.left) / rect.width) * span;
  if (Math.abs(val - parseInt(a.value)) <= Math.abs(val - parseInt(b.value))) { a.style.zIndex = 5; b.style.zIndex = 4; }
  else { b.style.zIndex = 5; a.style.zIndex = 4; }
});

function clampYearDual() { updateYearLabel(); }

let _debounceTimer = null;
function debounceSaveFilters() {
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(saveFilterState, 300);
}

function updateYearLabel() {
  const lo = $("#year-min"), hi = $("#year-max");
  const a = parseInt(lo?.value || 2000), b = parseInt(hi?.value || 2026);
  const mn = Math.min(a, b), mx = Math.max(a, b);
  const el = $("#year-range-label");
  if (el) el.textContent = `${mn} \u2013 ${mx}`;
  const fill = $("#year-fill");
  if (fill && lo && hi) {
    const min = parseInt(lo.min), max = parseInt(lo.max), span = (max - min) || 1;
    fill.style.left = ((mn - min) / span) * 100 + "%";
    fill.style.right = ((max - mx) / span) * 100 + "%";
  }
}

document.addEventListener("change", (e) => {
  const cb = e.target.closest(".cat-checkbox, .subcat-checkbox, .altsub-checkbox");
  if (cb) {
    const w = cb.closest(".filter-item")?.querySelector(".cat-weight, .subcat-weight, .altsub-weight");
    if (w) w.value = cb.checked ? "10" : "0";
    if (cb.classList.contains("subcat-checkbox") && ALT_SUBCATS[cb.value]) {
      const list = cb.closest(".filter-item")?.nextElementSibling;
      if (list && list.classList.contains("altsub-list")) {
        list.classList.toggle("hidden", !cb.checked);
        list.querySelectorAll(".altsub-checkbox").forEach((a) => {
          a.checked = cb.checked;
          const aw = a.closest(".filter-item")?.querySelector(".altsub-weight");
          if (aw) aw.value = cb.checked ? "10" : "0";
        });
        const exp = cb.closest(".filter-item")?.querySelector(".altsub-expand");
        if (exp) exp.textContent = cb.checked ? "▾" : "▸";
      }
    }
    if (cb.classList.contains("altsub-checkbox") && cb.checked) {
      const list = cb.closest(".altsub-list");
      const parentItem = list?.previousElementSibling;
      const parentCb = parentItem?.querySelector(".subcat-checkbox");
      if (parentCb && !parentCb.checked) {
        parentCb.checked = true;
        const pw = parentItem.querySelector(".subcat-weight"); if (pw) pw.value = "10";
      }
    }
  }
  const wInput = e.target.closest(".cat-weight, .subcat-weight, .altsub-weight");
  if (wInput) {
    const item = wInput.closest(".filter-item");
    const box = item?.querySelector(".cat-checkbox, .subcat-checkbox, .altsub-checkbox");
    const val = parseFloat(wInput.value) || 0;
    if (box && val <= 0 && box.checked) { box.checked = false; box.dispatchEvent(new Event("change", { bubbles: true })); }
    else if (box && val > 0 && !box.checked) { box.checked = true; box.dispatchEvent(new Event("change", { bubbles: true })); }
  }
  if (e.target.closest("#category-filters")) {
    saveFilterState();
  }
});

document.addEventListener("click", (e) => {
  const exp = e.target.closest(".altsub-expand");
  if (!exp) return;
  e.preventDefault();
  e.stopPropagation();
  const item = exp.closest(".filter-item");
  const list = item?.nextElementSibling;
  if (list && list.classList.contains("altsub-list")) {
    const hidden = list.classList.toggle("hidden");
    exp.textContent = hidden ? "▸" : "▾";
  }
});

function setRevealSpeed(val) {
  state.settings.revealSpeed = val;
  lsSet("qb-speed", String(val));
  const label = val === 0 ? "instant" : `${val}ms`;
  const pl = $("#panel-speed-label"); if (pl) pl.textContent = label;
  const sl = $("#speed-slider-label"); if (sl) sl.textContent = label;
  const ps = $("#panel-speed-slider"); if (ps && parseInt(ps.value) !== val) ps.value = val;
  const ss = $("#speed-slider"); if (ss && parseInt(ss.value) !== val) ss.value = val;
}

$("#panel-speed-slider")?.addEventListener("input", (e) => setRevealSpeed(parseInt(e.target.value)));

function setBuzzTimer(val) {
  state.settings.buzzTimeout = val;
  lsSet("qb-buzz-timeout", String(val));
  const lbls = ["#panel-buzz-timer-label", "#buzz-timeout-label"];
  lbls.forEach((s) => { const el = $(s); if (el) el.textContent = val === 0 ? "off" : `${val}s`; });
  const a = $("#panel-buzz-timer"); if (a && parseInt(a.value) !== val) a.value = val;
  const b = $("#buzz-timeout-slider"); if (b && parseInt(b.value) !== val) b.value = val;
}
function setBuzzWindow(val) {
  state.settings.buzzWindow = val;
  lsSet("qb-buzz-window", String(val));
  const el = $("#panel-buzz-window-label"); if (el) el.textContent = val === 0 ? "off" : `${val}s`;
  const a = $("#panel-buzz-window"); if (a && parseInt(a.value) !== val) a.value = val;
}
$("#panel-buzz-window")?.addEventListener("input", (e) => setBuzzWindow(parseInt(e.target.value)));

function setBonusTimer(val) {
  state.settings.bonusTimer = val;
  lsSet("qb-bonus-timer", String(val));
  const el = $("#panel-bonus-timer-label"); if (el) el.textContent = val === 0 ? "off" : `${val}s`;
  const a = $("#panel-bonus-timer"); if (a && parseInt(a.value) !== val) a.value = val;
}
$("#panel-buzz-timer")?.addEventListener("input", (e) => setBuzzTimer(parseInt(e.target.value)));
$("#panel-bonus-timer")?.addEventListener("input", (e) => setBonusTimer(parseInt(e.target.value)));

document.addEventListener("click", (e) => {
  const header = e.target.closest(".collapse-header");
  if (!header) return;
  const section = header.closest(".collapsible");
  if (section) section.classList.toggle("collapsed");
});

function initGameplayControls() {
  const map = {
    "opt-allow-rebuzzes": "allowRebuzzes",
    "opt-stop-on-power": "stopOnPower",
    "opt-allow-skips": "allowSkips",
  };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.checked = state.settings[key];
  }
  const strict = $("#strictness-slider");
  if (strict) {
    strict.value = state.settings.strictness;
    const lbl = $("#strictness-label"); if (lbl) lbl.textContent = String(state.settings.strictness);
  }
  const ew = $("#enable-cat-weights");
  if (ew) ew.checked = !!state.settings.useWeights;
  const bt = $("#panel-buzz-timer"); if (bt) { bt.value = state.settings.buzzTimeout; const l = $("#panel-buzz-timer-label"); if (l) l.textContent = state.settings.buzzTimeout === 0 ? "off" : `${state.settings.buzzTimeout}s`; }
  const bw = $("#panel-buzz-window"); if (bw) { bw.value = state.settings.buzzWindow; const l = $("#panel-buzz-window-label"); if (l) l.textContent = state.settings.buzzWindow === 0 ? "off" : `${state.settings.buzzWindow}s`; }
  const bnt = $("#panel-bonus-timer"); if (bnt) { bnt.value = state.settings.bonusTimer; const l = $("#panel-bonus-timer-label"); if (l) l.textContent = state.settings.bonusTimer === 0 ? "off" : `${state.settings.bonusTimer}s`; }
}

const _MODE_SETTING_IDS = new Set(["opt-allow-rebuzzes", "opt-stop-on-power", "opt-allow-skips", "strictness-slider", "enable-cat-weights", "panel-buzz-timer", "panel-buzz-window", "panel-bonus-timer", "panel-speed-slider", "speed-slider", "opt-bonus-after", "opt-hide-pron", "opt-show-qmeta", "filter-hide-pron", "auto-reveal"]);
let _modeSettingTimer = null;
function scheduleModeSettingSave() {
  clearTimeout(_modeSettingTimer);
  _modeSettingTimer = setTimeout(() => { if ($("#category-filters .category-group")) saveFilterState(); }, 250);
}
document.addEventListener("change", (e) => { if (e.target && _MODE_SETTING_IDS.has(e.target.id)) scheduleModeSettingSave(); });
document.addEventListener("input", (e) => { if (e.target && (e.target.id === "strictness-slider" || e.target.id === "panel-speed-slider" || e.target.id === "speed-slider")) scheduleModeSettingSave(); });
$("#opt-allow-rebuzzes")?.addEventListener("change", (e) => { state.settings.allowRebuzzes = e.target.checked; lsSet("qb-allow-rebuzzes", e.target.checked); });
$("#opt-stop-on-power")?.addEventListener("change", (e) => { state.settings.stopOnPower = e.target.checked; lsSet("qb-stop-on-power", e.target.checked); });
$("#opt-allow-skips")?.addEventListener("change", (e) => { state.settings.allowSkips = e.target.checked; lsSet("qb-allow-skips", e.target.checked); });
$("#strictness-slider")?.addEventListener("input", (e) => {
  state.settings.strictness = parseInt(e.target.value);
  lsSet("qb-strictness", e.target.value);
  const lbl = $("#strictness-label"); if (lbl) lbl.textContent = e.target.value;
});
$("#enable-cat-weights")?.addEventListener("change", (e) => {
  state.settings.useWeights = e.target.checked;
  lsSet("qb-use-weights", e.target.checked);
  $("#category-filters")?.classList.toggle("weights-on", e.target.checked);
});
$("#session-retention")?.addEventListener("change", (e) => {
  const days = parseInt(e.target.value) || 0;
  state.settings.sessionRetentionDays = days;
  lsSet("qb-session-retention", days);
  pruneOldSessions();
});

function pruneOldSessions() {
  const days = parseInt(state.settings.sessionRetentionDays) || 0;
  if (days > 0) API.post("/api/sessions/prune", { days }).catch(() => {});
}


function setMode(mode) {
  if (state.mode && state.mode !== mode && $("#category-filters .category-group")) saveFilterState();
  state.mode = mode;
  state._practiceBase = mode;
  const type = mode === "tossups" ? "tossups" : "bonuses";
  $("#practice-title").textContent =
    `PRACTICE: ${mode.toUpperCase()}`;
  loadSets().then(() => restoreFilterState());
  updateModeFields();

  loadCategories(type).then(() => {
    const saved = restoreFilterState();
    if (saved) restoreCategorySelections(saved);
    $("#category-filters")?.classList.toggle("weights-on", !!state.settings.useWeights);
  });
  initGameplayControls();
  updateKeyLabels();
  window.QB?.renderPracticeSettings(document.getElementById("ext-practice-host"));

  const bonusArea = $("#bonus-parts-area");
  const questionArea = $("#question-area");

  if (mode === "bonuses") {
    // Keep the parts skeleton hidden until an actual bonus is rendered.
    bonusArea.classList.toggle("hidden", !(state.sessionActive && state.currentQuestion));
    const hist = document.getElementById("history-panel");
    if (hist && hist.parentElement === questionArea) questionArea.insertBefore(bonusArea, hist);
    else questionArea.appendChild(bonusArea);
  } else {
    bonusArea.classList.add("hidden");
  }
  const pwrItem = $("#stat-pwr")?.closest(".stat-item");
  if (pwrItem) pwrItem.style.display = mode === "bonuses" ? "none" : "";
  applyModeVisibility(mode);
  renderHistoryPanel();
}

function applyModeVisibility(mode) {
  const tossup = mode === "tossups";
  const hide = (sel, container, show) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const row = el.closest(container) || el;
    row.style.display = show ? "" : "none";
  };
  hide("#panel-speed-slider", ".filter-section", tossup);
  hide("#panel-buzz-timer", ".slider-group", tossup);
  hide("#panel-buzz-window", ".slider-group", tossup);
  hide("#panel-bonus-timer", ".slider-group", !tossup);
  hide("#opt-allow-rebuzzes", ".checkbox-row", tossup);
  hide("#opt-stop-on-power", ".checkbox-row", tossup);
  hide("#opt-bonus-after", ".checkbox-row", tossup);
  hide("#filter-powermark", ".checkbox-row", tossup);
  hide("#stat-cel", ".stat-item", tossup);
  hide("#stat-neg", ".stat-item", tossup);
  const ppqLabel = $("#stat-ppq")?.closest(".stat-item")?.querySelector(".stat-label");
  if (ppqLabel) ppqLabel.textContent = tossup ? "PTS/Q" : "PPB";
}


function startSession() {
  state.sessionActive = true;
  state.sessionId = "session-" + Date.now();
  state.questionCount = 0;
  state.totalPoints = 0;
  state.powers = 0;
  state.negs = 0;
  state.correct = 0;
  state.celerityHistory = [];
  state.correctCelerityHistory = [];
  state.incorrectCelerityHistory = [];
  state.lastResult = null;
  state.resultOverridden = false;
  state.sessionHistory = [];
  state._gameSig = null; state._gameQueue = null; state._gamePaired = null; state._gameIdx = 0;
  state._wantBonus = false; state._pendingPairedBonus = null; state._currentPaired = null;
  state._starredQueue = null; state._starredSig = null; state._starredIdx = 0;

  updateLiveStats();
  $("#btn-start-session").innerHTML = state.mode === "tossups"
    ? keyLabelHtml("buzz", "Buzz")
    : keyLabelHtml("start-skip", "Skip");
  qbEmit("session:start", { sessionId: state.sessionId, mode: state.mode });
  nextQuestion();
}

function endSession() {
  state.sessionActive = false;
  state.reviewIds = null;
  state.bonusIds = null;
  state._gameSig = null; state._gameQueue = null; state._gameIdx = 0;
  state._wantBonus = false; state._pendingPairedBonus = null; state._currentPaired = null;
  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }
  $("#btn-start-session").innerHTML = keyLabelHtml("start-skip", "Start Session");
  resetQuestionUI();
  updateLiveStats();
  qbEmit("session:end", { sessionId: state.sessionId });
}

async function nextQuestion() {
  if (!state.sessionActive) return;
  stopBuzzTimer();

  state.questionCount++;
  state.isBuzzed = false;
  state.questionFullyRead = false;
  state._stoppedAtPower = false;
  state.buzzMarks = [];
  state.buzzPosition = 0;
  state.revealIndex = 0;
  state.prePowerEnd = 0;
  state.bonusPartsAnswered = 0;
  state.bonusUserAnswers = [];
  state.resultAreaVisible = false;

  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }

  resetQuestionUI();

  const placeholder = $("#question-placeholder");
  placeholder.classList.remove("hidden");
  placeholder.innerHTML = '<div class="placeholder-icon"><svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.4-1.3 1-1.3 1.8v.3"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg></div><p class="text-muted">Loading next question…</p>';

  if (state.reviewIds && state.mode === "tossups") {
    if (!state.reviewIds.length) {
      state.reviewIds = null;
      showError("Review complete \u2014 nice work! Press Esc to leave.");
      return;
    }
    const id = state.reviewIds.shift();
    try {
      const d = await API.get("/api/tossups/" + encodeURIComponent(id));
      if (d.tossup) {
        state.currentQuestion = d.tossup;
        renderQuestion(d.tossup);
        $("#session-counter").textContent = `${state.questionCount}`;
        return;
      }
    } catch {}
    return nextQuestion();
  }

  if (state.bonusIds && state.mode === "bonuses") {
    if (!state.bonusIds.length) { state.bonusIds = null; showError("Done — Press Esc to leave."); return; }
    const id = state.bonusIds.shift();
    try {
      const d = await API.get("/api/bonuses/" + encodeURIComponent(id));
      if (d.bonus) { state.currentQuestion = d.bonus; renderQuestion(d.bonus); $("#session-counter").textContent = `${state.questionCount}`; return; }
    } catch {}
    return nextQuestion();
  }

  if (state._wantBonus) {
    state._wantBonus = false;
    const b0 = state._pendingPairedBonus || null;
    state._pendingPairedBonus = null;
    // Bonus-after-correct-tossup only exists in tossup practice.
    if (state._practiceBase === "tossups") {
      let b = b0;
      if (!b) b = await fetchMatchingBonus(state._bonusFromQ);
      if (b) {
        switchPracticeType("bonuses", "PRACTICE");
        state.currentQuestion = b;
        renderQuestion(b);
        $("#session-counter").textContent = `${state.questionCount}`;
        return;
      }
    }
  }

  const _mv = $("#mode-select")?.value;
  if (_mv === "import" || _mv === "set") { await serveOrdered(); return; }

  restoreTossupDisplay();

  const filters = getFilters();

  if (filters.starredOnly) { await serveStarredQuestion(filters); return; }

  const endpoint =
    state.mode === "tossups"
      ? "/api/tossups/random"
      : "/api/bonuses/random";

  const params = new URLSearchParams();
  if (filters.categories?.length) params.set("categories", filters.categories.join(","));
  if (filters.subcategories?.length) params.set("subcategories", filters.subcategories.join(","));
  if (filters.alternateSubcategories?.length) params.set("alternateSubcategories", filters.alternateSubcategories.join(","));
  if (filters.setNames?.length) params.set("setNames", filters.setNames.join(","));
  if (filters.packetNumbers?.length) params.set("packetNumbers", filters.packetNumbers.join(","));
  if (filters.difficulties?.length) params.set("difficulties", filters.difficulties.join(","));
  if (filters.standard) params.set("standard", "1");
  if (filters.powermarkOnly) params.set("powermarkOnly", "true");
  if (filters.starredOnly) params.set("starredOnly", "true");
  if (filters.yearMin) params.set("yearMin", filters.yearMin);
  if (filters.yearMax) params.set("yearMax", filters.yearMax);
  params.set("random", "1");

  let data;
  try {
    data = await API.get(`${endpoint}?${params}`);
  } catch (e) {
    console.error(e);
    showError(e.name === "AbortError"
      ? "Request timed out. The database may be too large."
      : "Couldn't load question: " + (e.message || e));
    return;
  }
  let question = state.mode === "tossups" ? data.tossup : data.bonus;
  if (data.error) { showError("Error: " + data.error); return; }
  if (!question) {
    showError("No questions match your filters. Try broadening your criteria.");
    return;
  }
  if (window.QB?.passesQuestionFilters) {
    for (let tries = 0; tries < 5 && !window.QB.passesQuestionFilters(question, { mode: state.mode }); tries++) {
      try {
        const retry = await API.get(`${endpoint}?${params}`);
        const next = state.mode === "tossups" ? retry.tossup : retry.bonus;
        if (next) question = next;
      } catch { break; }
    }
  }

  state.currentQuestion = question;
  try {
    renderQuestion(question);
  } catch (e) {
    console.error("render error", e);
    showError("Couldn't display question: " + (e.message || e));
    return;
  }
  $("#session-counter").textContent = `${state.questionCount}`;
}

async function skipQuestion() {
  if (!state.currentQuestion || state.resultAreaVisible) return;
  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }
  if (state.isPaused) {
    state.isPaused = false;
    state._stoppedAtPower = false;
    $("#question-text")?.classList.remove("paused-text");
    document.getElementById("pause-overlay")?.remove();
  }
  Sound.skip();
  stopBuzzTimer();

  const question = state.currentQuestion;

  if (state.sessionId && question) {
    if (state.mode === "tossups") {
      API.post("/api/check-tossup", {
        questionId: question.id,
        answer: "",
        buzzPosition: state.buzzPosition || 0,
        sessionId: state.sessionId,
        overriding: true,
        correct: false,
        isPower: false,
        points: 0,
      }).catch(() => {});
    } else {
      API.post("/api/check-bonus", {
        questionId: question.id,
        answers: [],
        sessionId: state.sessionId,
      }).catch(() => {});
    }
  }

  state.sessionHistory.push({
    id: question.id,
    type: state.mode === "tossups" ? "tossup" : "bonus",
    question,
    userAnswer: "(skipped)",
    correct: false,
    isPower: false,
    points: 0,
    celerity: 1,
    buzzPosition: 0,
    answer: question.answer_sanitized,
    answers: state.mode === "bonuses"
      ? (() => { try { return JSON.parse(question.answers_sanitized || "[]"); } catch { return []; } })()
      : undefined,
    starred: false,
  });
  renderHistoryPanel();

  state.currentQuestion = null;
  const pauseOverlay = document.getElementById("pause-overlay");
  if (pauseOverlay) pauseOverlay.remove();
  const buzzMarker = document.querySelector(".buzz-marker");
  if (buzzMarker) buzzMarker.remove();
  $("#buzz-area").classList.add("hidden");
  $("#buzz-input").value = "";
  nextQuestion();
}

async function ensureOrderedQueue() {
  const wantBonuses = state._practiceBase === "bonuses";
  const modeVal = $("#mode-select")?.value;
  let sig, tossups = null, bonuses = null;
  if (modeVal === "import") {
    const pk = state._importedPacket;
    if (!pk) return { error: "Choose a packet file in MODE first (export one from Packet Builder)." };
    sig = "import::" + pk.name + "::" + (wantBonuses ? "b" : "t");
    if (state._gameSig !== sig) {
      tossups = (pk.tossups || []).slice();
      bonuses = (pk.bonuses || []).slice();
    }
  } else {
    const setName = $("#mode-set-name")?.value || "";
    if (!setName) return { error: "Pick a set name in MODE first." };
    const packets = parsePacketNumbers($("#mode-packet")?.value);
    sig = "set::" + setName + "::" + packets.join(",") + "::" + (wantBonuses ? "b" : "t");
    if (state._gameSig !== sig) {
      tossups = []; bonuses = [];
      let pkts = packets.length ? packets : null;
      if (!pkts) { try { pkts = ((await API.get("/api/packets-for-set?setName=" + encodeURIComponent(setName))).packets || []).map((p) => p.packet_number); } catch { pkts = []; } }
      for (const n of pkts) {
        try {
          const pc = await API.get(`/api/packet-content?setName=${encodeURIComponent(setName)}&packetNumber=${n}`);
          (pc.tossups || []).forEach((t) => tossups.push(t));
          (pc.bonuses || []).forEach((b) => bonuses.push(b));
        } catch {}
      }
    }
  }
  if (state._gameSig !== sig) {
    state._gameSig = sig;
    state._gameIdx = 0;
    state._gameQueue = wantBonuses ? bonuses : tossups;
    state._gamePaired = bonuses || [];
  }
  return { queue: state._gameQueue || [] };
}

async function serveOrdered() {
  const r = await ensureOrderedQueue();
  if (r.error) { showError(r.error); return; }
  const queue = r.queue || [];
  if (!queue.length) { showError("No questions found for that selection."); return; }
  if (state._gameIdx >= queue.length) {
    showError("Packet finished \u2014 you've read every question. Press Esc to leave.");
    return;
  }
  const i = state._gameIdx++;
  if (state._practiceBase !== "bonuses") {
    state._currentPaired = (state._gamePaired || [])[i] || null;
    restoreTossupDisplay();
  }
  state.currentQuestion = queue[i];
  renderQuestion(queue[i]);
  $("#session-counter").textContent = `${state.questionCount}`;
}

function _starredPasses(q, f) {
  if (f.categories && f.categories.length && q.category && f.categories.indexOf(q.category) < 0) return false;
  if (f.subcategories && f.subcategories.length && q.subcategory && f.subcategories.indexOf(q.subcategory) < 0) return false;
  if (f.alternateSubcategories && f.alternateSubcategories.length && q.alternate_subcategory && f.alternateSubcategories.indexOf(q.alternate_subcategory) < 0) return false;
  if (f.difficulties && f.difficulties.length && q.difficulty != null && f.difficulties.map(String).indexOf(String(q.difficulty)) < 0) return false;
  if (f.yearMin && q.set_year && q.set_year < f.yearMin) return false;
  if (f.yearMax && q.set_year && q.set_year > f.yearMax) return false;
  return true;
}
async function serveStarredQuestion(filters) {
  const type = state.mode === "bonuses" ? "bonus" : "tossup";
  const sig = ["starred", type,
    (filters.categories || []).join(","), (filters.subcategories || []).join(","),
    (filters.alternateSubcategories || []).join(","), (filters.difficulties || []).join(","),
    filters.yearMin, filters.yearMax].join("::");
  if (state._starredSig !== sig || !state._starredQueue) {
    let list = [], failed = false;
    try {
      const d = await API.get("/api/starred?type=" + type);
      list = (d.starred || []).map((s) => s.question).filter(Boolean).filter((q) => _starredPasses(q, filters));
    } catch { failed = true; }
    if (failed) { showError("Couldn't load your starred questions \u2014 check your connection and try again."); return; }
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    state._starredQueue = list;
    state._starredSig = sig;
    state._starredIdx = 0;
  }
  const queue = state._starredQueue;
  const noun = type === "bonus" ? "bonuses" : "tossups";
  if (!queue.length) { showError(`You have no starred ${noun} matching these filters. Star some questions first (or broaden the filters).`); return; }
  if (state._starredIdx >= queue.length) {
    showError(`You've gone through all ${queue.length} starred ${noun}! Press Esc to leave, or start a new session to go again.`);
    return;
  }
  state.currentQuestion = queue[state._starredIdx++];
  renderQuestion(state.currentQuestion);
  $("#session-counter").textContent = `${state.questionCount}`;
}

async function fetchMatchingBonus(q) {
  if (!q) return null;
  const params = new URLSearchParams();
  params.set("random", "1");
  if (q.category) params.set("categories", q.category);
  if (q.difficulty != null) params.set("difficulties", String(q.difficulty));
  if ($("#mode-select")?.value === "set") { const sn = $("#mode-set-name")?.value; if (sn) params.set("setNames", sn); }
  try { const d = await API.get("/api/bonuses/random?" + params.toString()); return d.bonus || null; } catch { return null; }
}

function restoreTossupDisplay() {
  if (state._practiceBase === "tossups" && state.mode === "bonuses") {
    switchPracticeType("tossups", "PRACTICE");
  }
}

function switchPracticeType(type, label) {
  state.mode = type;
  $("#practice-title").textContent = (label || "PACKET GAME") + " \u2014 " + (type === "bonuses" ? "BONUS" : "TOSSUP");
  const bonusArea = $("#bonus-parts-area");
  const questionArea = $("#question-area");
  if (type === "bonuses") {
    // Stay hidden until renderQuestion fills the parts — no empty PART A/B/C skeleton.
    bonusArea.classList.add("hidden");
    const hist = document.getElementById("history-panel");
    if (hist && hist.parentElement === questionArea) questionArea.insertBefore(bonusArea, hist);
    else questionArea.appendChild(bonusArea);
  } else {
    bonusArea.classList.add("hidden");
  }
  const pwrItem = $("#stat-pwr")?.closest(".stat-item");
  if (pwrItem) pwrItem.style.display = type === "bonuses" ? "none" : "";
  applyModeVisibility(type);
}


function renderQuestion(question) {
  resetQuestionUI();
  const isTossup = state.mode === "tossups";

  $("#question-placeholder").classList.add("hidden");
  const content = $("#question-content");
  content.classList.remove("hidden");

  const setInfo = question.set_name
    ? `${question.set_name} (${question.set_year || "?"})`
    : "Unknown set";
  const diffLabel = question.difficulty || "?";

  const diffName = DIFFICULTY_NAMES[parseInt(diffLabel)] || "";
  $("#question-meta").classList.toggle("hidden", !state.settings.showQuestionMeta);
  $("#question-meta").innerHTML = `
    <span>${escapeHtml(question.category || "?")} / ${escapeHtml(question.subcategory || "?")}${question.alternate_subcategory ? " \u00b7 " + escapeHtml(question.alternate_subcategory) : ""}</span>
    <span>Diff ${diffLabel}${diffName ? " \u00b7 " + escapeHtml(diffName) : ""}</span>
    <span>${escapeHtml(setInfo)}</span>
    <span class="star-btn save-plus" id="save-indicator" title="Save to review / folders">+</span>
    <span class="star-btn" id="star-indicator" data-id="${question.id}" data-type="${isTossup ? "tossup" : "bonus"}">
      ${getStarChar(question.id, isTossup ? "tossup" : "bonus")}
    </span>
  `;

  document.getElementById("star-indicator")?.addEventListener("click", toggleStar);
  document.getElementById("save-indicator")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (state.currentQuestion) openSaveMenu(state.currentQuestion, state.mode === "tossups" ? "tossup" : "bonus", ev.currentTarget);
  });

  checkStarStatus(question.id, isTossup ? "tossup" : "bonus");

  if (isTossup) {
    renderTossup(question);
  } else {
    renderBonus(question);
  }

  qbEmit("question:render", { type: isTossup ? "tossup" : "bonus", question });
}

function renderTossup(q) {
  let text = q.question_sanitized || q.question || "";
  if (state.settings.hidePronunciations) text = stripPronunciations(text);
  text = window.QB?.applyTextTransforms?.(text, { type: "tossup", question: q }) ?? text;
  const powerIdx = text.indexOf("(*)");
  const displayText = text.replace(/\(\*\)/g, "").replace(/\(\)/g, "").replace(/\(\s*\)/g, "");
  state.currentDisplayText = displayText;

  state.buzzPosition = 0;

  if (powerIdx >= 0) {
    state.prePowerEnd = powerIdx;
  } else {
    state.prePowerEnd = -1;
  }

  $("#power-mark").classList.add("hidden");
  $("#bonus-parts-area").classList.add("hidden");

  if (state.settings.revealSpeed === 0 && state.settings.autoReveal) {
    state.revealIndex = displayText.length;
    state.questionFullyRead = true;
    $("#question-text").innerHTML = formatQuestionText(displayText, displayText.length, state.prePowerEnd);
    startBuzzWindow();
    return;
  }

  $("#question-text").textContent = "";
  state.revealIndex = 0;
  revealText(displayText);
}

async function renderBonus(q) {
  let leadin = q.leadin_sanitized || q.leadin || "";
  if (state.settings.hidePronunciations) leadin = stripPronunciations(leadin);
  leadin = window.QB?.applyTextTransforms?.(leadin, { type: "bonus-leadin", question: q }) ?? leadin;
  let parts;
  try {
    parts = JSON.parse(q.parts_sanitized || q.parts || "[]");
  } catch {
    parts = ["Error parsing bonus parts"];
  }
  try {
    state.bonusAnswers = JSON.parse(q.answers_sanitized || q.answers || "[]");
  } catch {
    state.bonusAnswers = [];
  }
  try { state.bonusAnswersRaw = JSON.parse(q.answers || "[]"); } catch { state.bonusAnswersRaw = []; }

  $("#power-mark").classList.add("hidden");
  $("#question-text").textContent = leadin;
  state.revealIndex = leadin.length;
  $("#buzz-area").classList.add("hidden");

  const bonusArea = $("#bonus-parts-area");
  bonusArea.classList.remove("hidden");

  state.bonusPartsAnswered = 0;
  state.bonusUserAnswers = [];

  for (let i = 0; i < 3; i++) {
    let partText = parts[i] || `Part ${i + 1}`;
    if (state.settings.hidePronunciations) partText = stripPronunciations(partText);
    partText = window.QB?.applyTextTransforms?.(partText, { type: "bonus-part", question: q, part: i }) ?? partText;
    $(`#bonus-text-${i}`).textContent = partText;
    $(`#bonus-input-${i}`).value = "";
    $(`#bonus-part-${i}`).classList.add("hidden");
    $(`#bonus-input-${i}`).disabled = true;
    $(`#bonus-part-${i}`)?.querySelector(".bonus-input")?.classList.remove("hidden");
    const ansEl = $(`#bonus-answer-${i}`);
    if (ansEl) { ansEl.classList.add("hidden"); ansEl.innerHTML = ""; }
  }
  $("#btn-submit-bonus").classList.add("hidden");

  // Parts reveal one at a time: read the leadin, then the next key steps
  // through A → B → C (each part's timer starts when it appears).
  state.bonusAwait = 0;
  showBonusNextHint(0);
}

function showBonusNextHint(idx) {
  const el = $("#bonus-next-hint");
  if (!el) return;
  el.innerHTML = keyLabelHtml("next-question", `Reveal Part ${"ABC"[idx] || idx + 1}`);
  el.classList.remove("hidden");
}

function advanceBonusPart() {
  if (state.mode !== "bonuses" || !state.currentQuestion || state.bonusAwait == null) return false;
  const idx = state.bonusAwait;
  state.bonusAwait = null;
  $("#bonus-next-hint")?.classList.add("hidden");
  startBonusPart(idx);
  return true;
}

function startBonusPart(idx) {
  $(`#bonus-part-${idx}`)?.classList.remove("hidden");
  const inp = $(`#bonus-input-${idx}`);
  if (inp) { inp.disabled = false; setTimeout(() => inp.focus(), 60); }
  stopEventTimer();
  const t = state.settings.bonusTimer;
  if (t > 0) startEventTimer(t, "Part " + (idx + 1), () => bonusPartTimeUp(idx));
}

function bonusPartTimeUp(idx) {
  const inp = $(`#bonus-input-${idx}`);
  if (inp && !inp.disabled) { state.bonusUserAnswers[idx] = inp.value.trim(); inp.disabled = true; }
  finalizeBonusPart(idx);
}

function finalizeBonusPart(idx) {
  stopEventTimer();
  revealBonusPartAnswer(idx);
  if (idx < 2) { state.bonusAwait = idx + 1; showBonusNextHint(idx + 1); }
  else { $("#btn-submit-bonus").classList.add("hidden"); submitBonusAnswers(); }
}

document.addEventListener("keydown", (e) => {
  if (!e.target?.classList?.contains("bonus-answer-input")) return;
  if (e.key !== "Enter") return;
  e.preventDefault();
  const idx = parseInt(e.target.id.replace("bonus-input-", ""));
  const answer = e.target.value.trim();
  state.bonusUserAnswers[idx] = answer;
  state.bonusPartsAnswered = Math.max(state.bonusPartsAnswered, idx + 1);
  e.target.disabled = true;
  finalizeBonusPart(idx);
});

async function revealBonusPartAnswer(idx) {
  const el = $(`#bonus-answer-${idx}`);
  if (!el) return;
  const ans = (state.bonusAnswers && state.bonusAnswers[idx]) || "";
  if (!ans) { el.classList.add("hidden"); return; }
  const userAns = (state.bonusUserAnswers && state.bonusUserAnswers[idx]) || "";
  const rawAns = (state.bonusAnswersRaw && state.bonusAnswersRaw[idx]) || "";
  const inputRow = $(`#bonus-part-${idx}`)?.querySelector(".bonus-input");
  if (inputRow) inputRow.classList.add("hidden");
  const yourLine = `<div class="bonus-your-answer">Your Answer: <strong>${userAns ? escapeHtml(userAns) : '<span class="text-muted">(no answer)</span>'}</strong></div>`;
  const show = (verdict) => { el.innerHTML = `${yourLine}<div>${verdict}ANSWER: <span class="bonus-answer-text">${answerLineHtml(rawAns, ans)}</span></div>`; el.classList.remove("hidden"); };
  show("");
  let verdict = '<span class="bonus-verdict incorrect">✗ </span>';
  if (userAns) {
    try {
      const r = await API.post("/api/evaluate-answer", { answerline: state.bonusAnswersRaw?.[idx] || ans, sanitized: ans, answer: userAns, strictness: state.settings.strictness });
      verdict = (r.status === "accept" || r.status === "prompt") ? '<span class="bonus-verdict correct">✓ </span>' : '<span class="bonus-verdict incorrect">✗ </span>';
    } catch {}
  }
  show(verdict);
}

async function submitBonusAnswers() {
  if (!state.currentQuestion || state.mode !== "bonuses") return;
  stopEventTimer();
  for (let i = 0; i < 3; i++) revealBonusPartAnswer(i);

  const answers = [
    state.bonusUserAnswers[0] || "",
    state.bonusUserAnswers[1] || "",
    state.bonusUserAnswers[2] || "",
  ];

  try {
    const result = await API.post("/api/check-bonus", {
      questionId: state.currentQuestion.id,
      answers,
      sessionId: state.sessionId,
    });
    displayBonusResult(result, answers);
    updateSessionStats({ points: result.totalPoints, correct: result.totalPoints > 0 });
  } catch (e) {
    showError("Failed to check bonus");
  }

  $$(".bonus-answer-input").forEach((inp) => (inp.disabled = true));
  $("#btn-submit-bonus").classList.add("hidden");
}


function revealText(text) {
  if (!state.sessionActive || state.isBuzzed || state.isPaused) return;

  const speed = state.settings.revealSpeed;
  if (speed === 0) {
    state.revealIndex = text.length;
    state.questionFullyRead = true;
    $("#question-text").innerHTML = formatQuestionText(text, text.length, state.prePowerEnd);
    startBuzzWindow();
    return;
  }

  let lastTime = 0;
  function step(ts) {
    if (!state.sessionActive || state.isBuzzed || state.isPaused) return;
    if (state.revealIndex >= text.length) return;
    const curSpeed = state.settings.revealSpeed;
    if (curSpeed === 0) {
      state.revealIndex = text.length;
      state.questionFullyRead = true;
      $("#question-text").innerHTML = formatQuestionText(text, text.length, state.prePowerEnd);
      startBuzzWindow();
      return;
    }
    if (!lastTime) lastTime = ts;
    if (ts - lastTime < curSpeed) {
      state.revealTimer = requestAnimationFrame(step);
      return;
    }
    lastTime = ts;
    state.revealIndex++;
    state.buzzPosition = state.revealIndex;
    $("#question-text").innerHTML = formatQuestionText(text, state.revealIndex, state.prePowerEnd);
    if (state.settings.stopOnPower && state.prePowerEnd > 0 && state.revealIndex >= state.prePowerEnd && !state._stoppedAtPower) {
      state._stoppedAtPower = true;
      state.isPaused = true;
      const el = document.createElement("div");
      el.className = "pause-overlay"; el.id = "pause-overlay";
      el.textContent = "AT POWER — press P to continue";
      $("#question-area")?.appendChild(el);
      return;
    }
    if (state.revealIndex >= text.length) {
      state.questionFullyRead = true;
      startBuzzWindow();
    } else {
      state.revealTimer = requestAnimationFrame(step);
    }
  }
  state.revealTimer = requestAnimationFrame(step);
}

function markDeadQuestion(text) {
  if (state.isBuzzed || !state.sessionActive) return;
  if (ttsHold) return;
  state.isBuzzed = true;
  $("#question-text").innerHTML = formatQuestionText(text, text.length, state.prePowerEnd, null, true);
  const area = $("#result-area");
  const banner = $("#result-banner");
  const answerDiv = $("#result-answer");
  area.classList.remove("hidden");
  banner.className = "result-banner";
  banner.style.color = "var(--text-muted)";
  banner.textContent = "DEAD (0 pts)";
  answerDiv.innerHTML = `Correct: <span class="actual">${answerLineHtml(state.currentQuestion?.answer, state.currentQuestion?.answer_sanitized || "")}</span>`;
  $("#buzz-area").classList.add("hidden");
  state.resultAreaVisible = true;
  state.lastResult = { correct: false, isPower: false, points: 0, celerity: 1, answer: state.currentQuestion?.answer_sanitized, userAnswer: "", questionId: state.currentQuestion?.id, buzzPosition: state.buzzPosition, category: state.currentQuestion?.category };

  state.sessionHistory.push({
    id: state.currentQuestion?.id, type: "tossup",
    question: state.currentQuestion, userAnswer: "",
    correct: false, isPower: false, points: 0,
    celerity: 1, answer: state.currentQuestion?.answer_sanitized,
    starred: false,
  });
  renderHistoryPanel();

  if (state.sessionId && state.currentQuestion) {
    API.post("/api/check-tossup", {
      questionId: state.currentQuestion.id,
      answer: "",
      buzzPosition: state.buzzPosition || 0,
      sessionId: state.sessionId,
      overriding: true,
      correct: false,
      isPower: false,
      points: 0,
    }).catch(() => {});
  }

  setTimeout(() => { try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {} }, 50);
}

function togglePause() {
  if (!state.sessionActive || state.isBuzzed) return;
  state.isPaused = !state.isPaused;
  Sound.pause();

  if (state.isPaused) {
    if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }
    pauseEventTimer();
    $("#question-text")?.classList.add("paused-text");
    const el = document.createElement("div");
    el.className = "pause-overlay";
    el.id = "pause-overlay";
    el.textContent = "PAUSED";
    $("#question-area")?.appendChild(el);
  } else {
    $("#question-text")?.classList.remove("paused-text");
    const el = document.getElementById("pause-overlay");
    if (el) el.remove();
    resumeEventTimer();
    resumeReveal();
  }
}

function resumeReveal() {
  if (!state.sessionActive || state.isBuzzed || state.isPaused) return;
  const text = state.currentDisplayText || state.currentQuestion?.question_sanitized || "";
  if (state.revealIndex < text.length) {
    revealText(text);
  }
}

function formatQuestionText(text, revealedUpTo, _prePowerEnd, marks, showPower) {
  const buzzMarks = marks || state.buzzMarks || [];
  function withMarks(segEnd) {
    const inserts = buzzMarks
      .filter((i) => i >= 0 && i <= segEnd)
      .map((i) => ({ i, html: '<span class="buzz-mark">(#)</span>' }));
    if (showPower && _prePowerEnd > 0 && _prePowerEnd <= segEnd) {
      inserts.push({ i: _prePowerEnd, html: '<span class="power-mark-inline">(*)</span>' });
    }
    inserts.sort((a, b) => a.i - b.i);
    let out = "", last = 0;
    for (const m of inserts) { out += escapeHtml(text.substring(last, m.i)) + m.html; last = m.i; }
    out += escapeHtml(text.substring(last, segEnd));
    return out;
  }
  const pre = withMarks(revealedUpTo);
  const post = escapeHtml(text.substring(revealedUpTo).replace(/\S/g, "·"));
  return `<span class="revealed">${pre}</span><span class="unrevealed" aria-hidden="true">${post}</span>`;
}


function buzz() {
  if (state.isBuzzed || !state.sessionActive) return;
  state.isBuzzed = true;
  state.isPaused = false;
  state.promptActive = false;

  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }

  Sound.buzz();

  state.buzzPosition = state.revealIndex;
  (state.buzzMarks = state.buzzMarks || []).push(state.revealIndex);

  const text = state.currentDisplayText || state.currentQuestion?.question_sanitized || "";
  $("#question-text").innerHTML = formatQuestionText(text, state.revealIndex, state.prePowerEnd);

  const marker = document.createElement("div");
  marker.className = "buzz-marker";
  marker.textContent = "▼ BUZZED ▼";
  $("#question-text").appendChild(marker);

  clearPromptBanner();
  $("#buzz-area").classList.remove("hidden");
  setTimeout(() => $("#buzz-input")?.focus(), 50);

  startBuzzTimer();

  qbEmit("buzz", { question: state.currentQuestion, position: state.buzzPosition });
}

let _eventTimer = { id: null, end: 0, total: 0, onExpire: null, label: "", paused: false, remaining: 0 };

function _eventTimerTick() {
  renderEventTimer(_eventTimer.label);
  if (_eventTimer.end - Date.now() <= 0) {
    const cb = _eventTimer.onExpire;
    stopEventTimer();
    if (cb) cb();
  }
}
function startEventTimer(seconds, label, onExpire) {
  stopEventTimer();
  if (!seconds || seconds <= 0) return;
  _eventTimer.total = seconds;
  _eventTimer.end = Date.now() + seconds * 1000;
  _eventTimer.onExpire = onExpire || null;
  _eventTimer.label = label || "";
  _eventTimer.paused = false;
  renderEventTimer(label);
  _eventTimer.id = setInterval(_eventTimerTick, 100);
}

function pauseEventTimer() {
  if (!_eventTimer.id || _eventTimer.paused) return;
  _eventTimer.remaining = Math.max(0, _eventTimer.end - Date.now());
  clearInterval(_eventTimer.id); _eventTimer.id = null;
  _eventTimer.paused = true;
}
function resumeEventTimer() {
  if (!_eventTimer.paused) return;
  _eventTimer.end = Date.now() + _eventTimer.remaining;
  _eventTimer.paused = false;
  _eventTimer.id = setInterval(_eventTimerTick, 100);
}

function stopEventTimer() {
  if (_eventTimer.id) { clearInterval(_eventTimer.id); _eventTimer.id = null; }
  _eventTimer.paused = false;
  const el = document.getElementById("event-timer");
  if (el) el.remove();
}

function renderEventTimer(label) {
  let el = document.getElementById("event-timer");
  if (!el) {
    el = document.createElement("div");
    el.id = "event-timer";
    el.className = "event-timer";
    el.innerHTML = '<span class="event-timer-label"></span><div class="event-timer-track"><div class="event-timer-fill"></div></div><span class="event-timer-num"></span>';
    ($("#question-area") || document.body).appendChild(el);
  }
  const remaining = Math.max(0, (_eventTimer.end - Date.now()) / 1000);
  const pct = _eventTimer.total > 0 ? Math.max(0, Math.min(100, (remaining / _eventTimer.total) * 100)) : 0;
  el.querySelector(".event-timer-fill").style.width = pct + "%";
  el.querySelector(".event-timer-label").textContent = label || "";
  el.querySelector(".event-timer-num").textContent = remaining.toFixed(1) + "s";
  el.classList.toggle("low", remaining <= 3);
}

function startBuzzTimer() {
  startEventTimer(state.settings.buzzTimeout, "Answer", () => {
    if (state.isBuzzed && state.resultAreaVisible === false && state.mode === "tossups") {
      submitTossupAnswer($("#buzz-input")?.value?.trim() || "");
    }
  });
}
function stopBuzzTimer() { stopEventTimer(); }

function startBuzzWindow() {
  if (ttsHold) return;
  startEventTimer(state.settings.buzzWindow, "Buzz", () => {
    markDeadQuestion(state.currentDisplayText || state.currentQuestion?.question_sanitized || "");
  });
}


$("#buzz-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const answer = $("#buzz-input").value.trim();
    if (answer || state.mode === "tossups") {
      submitTossupAnswer(answer);
    }
  }
});

$("#btn-submit-bonus")?.addEventListener("click", submitBonusAnswers);

function showPromptBanner(ask) {
  const area = $("#buzz-area");
  if (!area) return;
  let banner = document.getElementById("buzz-prompt-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "buzz-prompt-banner";
    banner.className = "buzz-prompt-banner";
    area.insertBefore(banner, area.firstChild);
  }
  banner.innerHTML = ask
    ? `<span class="prompt-tag">PROMPT</span> ${escapeHtml(ask)}`
    : `<span class="prompt-tag">PROMPT</span>`;
}
function clearPromptBanner() {
  document.getElementById("buzz-prompt-banner")?.remove();
}

async function submitTossupAnswer(answer) {
  if (!state.currentQuestion || state.mode !== "tossups") return;
  state.resultAreaVisible = true;
  stopBuzzTimer();

  try {
    const result = window.QB?.hasJudgingRules?.()
      ? await judgeWithPluginRules(answer)
      : await API.post("/api/check-tossup", {
        questionId: state.currentQuestion.id,
        answer,
        buzzPosition: state.buzzPosition,
        sessionId: state.sessionId,
        fullyRead: !!state.questionFullyRead,
        strictness: state.settings.strictness,
        allowPrompt: !state.promptActive,
      });
    if (!result) return;

    if (result.prompted) {
      state.promptActive = true;
      state.resultAreaVisible = false;
      const ask = result.prompt && result.prompt.ask;
      showPromptBanner(ask);
      const inp = $("#buzz-input");
      if (inp) { inp.value = ""; inp.disabled = false; inp.placeholder = "answer again…"; setTimeout(() => inp.focus(), 30); }
      window.QB && window.QB.toast && window.QB.toast(ask ? "Prompt: " + ask : "Prompt", "info");
      startBuzzTimer();
      return;
    }
    state.promptActive = false;
    clearPromptBanner();

    if (!result.correct && state.settings.allowRebuzzes && !state.questionFullyRead) {
      updateSessionStats(result);
      Sound.incorrect();
      state.isBuzzed = false;
      state.resultAreaVisible = false;
      $("#buzz-area").classList.add("hidden");
      $("#buzz-input").value = "";
      const bm = document.querySelector(".buzz-marker"); if (bm) bm.remove();
      window.QB && window.QB.toast && window.QB.toast(`NEG (${result.points}) — keep reading, buzz again`);
      resumeReveal();
      return;
    }

    displayTossupResult(result, answer);
    updateSessionStats(result);
    if (state.reviewIds && state._reviewRemoveAfter && result.correct && state.currentQuestion?.id) {
      API.post("/api/review/dismiss", { questionId: state.currentQuestion.id }).catch(() => {});
    }
  } catch (e) {
    showError("Failed to check answer");
  }

  clearPromptBanner();
  $("#buzz-area").classList.add("hidden");
  $("#buzz-input").value = "";
}

async function judgeWithPluginRules(answer) {
  const q = state.currentQuestion;
  const fullyRead = !!state.questionFullyRead;
  let verdict;
  try {
    const ev = await API.post("/api/evaluate-tossup", {
      questionId: q.id,
      answer,
      strictness: state.settings.strictness,
      buzzPosition: fullyRead ? null : state.buzzPosition,
    });
    verdict = { status: ev.status, prompt: ev.prompt, antiprompt: !!ev.antiprompt };
  } catch (e) {
    showError("Failed to check answer");
    return null;
  }

  const ruleCtx = {
    userAnswer: answer,
    question: q,
    buzzPosition: state.buzzPosition,
    fullyRead,
    strictness: state.settings.strictness,
  };
  verdict = window.QB.applyAnswerRules(verdict, ruleCtx);

  if (verdict.status === "prompt" && state.promptActive) verdict.status = "reject";
  if (verdict.status === "prompt") {
    return { prompted: true, prompt: verdict.prompt || { ask: "be more specific" }, answer: q.answer_sanitized };
  }

  const correct = verdict.status === "accept";
  const isPower = correct && state.prePowerEnd > 0 && state.buzzPosition <= state.prePowerEnd;
  const textLen = (state.currentDisplayText || q.question_sanitized || "").length || 1;
  const celerity = fullyRead ? 1 : Math.min(1, state.buzzPosition / textLen);
  const basePoints = correct ? (isPower ? 15 : 10) : (fullyRead ? 0 : -5);
  const points = window.QB.applyScoringRules(basePoints, {
    correct, isPower, fullyRead, celerity,
    buzzPosition: state.buzzPosition, question: q, userAnswer: answer,
  });

  try {
    const rec = await API.post("/api/check-tossup", {
      questionId: q.id,
      answer,
      buzzPosition: state.buzzPosition,
      sessionId: state.sessionId,
      overriding: true,
      correct, isPower, points, celerity,
    });
    return { correct, points, isPower, celerity, answer: rec.answer || q.answer_sanitized };
  } catch (e) {
    showError("Failed to record answer");
    return null;
  }
}


function displayTossupResult(result, userAnswer) {
  const area = $("#result-area");
  area.classList.remove("hidden");

  const pauseOverlay = document.getElementById("pause-overlay");
  if (pauseOverlay) pauseOverlay.remove();
  const buzzMarker = document.querySelector(".buzz-marker");
  if (buzzMarker) buzzMarker.remove();

  const text = state.currentDisplayText || state.currentQuestion?.question_sanitized || "";
  $("#question-text").innerHTML = formatQuestionText(text, text.length, state.prePowerEnd, null, true);

  state.sessionHistory.push({
    id: state.currentQuestion?.id,
    type: "tossup",
    question: state.currentQuestion,
    userAnswer,
    correct: result.correct,
    isPower: result.isPower,
    points: result.points,
    celerity: result.celerity,
    answer: result.answer,
    buzzPosition: state.buzzPosition || 0,
    starred: state.currentQuestion ? isStarredLocal(state.currentQuestion.id, "tossup") : false,
  });
  renderHistoryPanel();

  const celVal = 1 - result.celerity;
  if (result.correct) {
    state.correctCelerityHistory.push(celVal);
    if (state.correctCelerityHistory.length > 10) state.correctCelerityHistory.shift();
  } else {
    state.incorrectCelerityHistory.push(celVal);
    if (state.incorrectCelerityHistory.length > 10) state.incorrectCelerityHistory.shift();
  }

  state.lastResult = {
    correct: result.correct,
    isPower: result.isPower,
    points: result.points,
    celerity: result.celerity,
    answer: result.answer,
    userAnswer,
    questionId: state.currentQuestion?.id,
    buzzPosition: state.buzzPosition,
    category: state.currentQuestion?.category,
  };
  state.resultOverridden = false;

  renderTossupResult();

  if (state.settings.bonusAfter && result.correct && state.mode === "tossups" && state._practiceBase === "tossups") {
    state._wantBonus = true;
    state._bonusFromQ = state.currentQuestion;
    const _mv = $("#mode-select")?.value;
    state._pendingPairedBonus = (_mv === "import" || _mv === "set") ? (state._currentPaired || null) : null;
  }

  if (result.isPower) Sound.power();
  else if (result.correct) Sound.correct();
  else Sound.incorrect();

  renderResultPanels({ type: "tossup", result, question: state.currentQuestion, userAnswer });
  qbEmit("answer:result", { type: "tossup", result, userAnswer });

  scheduleAchievementCheck();

  if (state.settings.autoReviewNoPower && result.correct && !result.isPower && state.currentQuestion?.id) {
    const hasMark = state.prePowerEnd > 0;
    if (hasMark || !state.settings.autoReviewSkipNoMark) {
      API.post("/api/review/manual", { questionId: state.currentQuestion.id, add: true, type: "tossup" })
        .then(() => refreshReviewBadge()).catch(() => {});
    }
  }
}

function isStarredLocal(qId, type) {
  const t = type || "tossup";
  if (state.starredIds && state.starredIds.has(t + ":" + qId)) return true;
  return state.sessionHistory.some(e => e.id === qId && e.type === type && e.starred);
}
function setStarredLocal(qId, type, on) {
  if (!state.starredIds) state.starredIds = new Set();
  const k = (type || "tossup") + ":" + qId;
  if (on) state.starredIds.add(k); else state.starredIds.delete(k);
}
async function loadStarredIds() {
  try {
    const [t, b] = await Promise.all([API.get("/api/starred?type=tossup"), API.get("/api/starred?type=bonus")]);
    const set = new Set();
    (t.starred || []).forEach((s) => { const id = (s.question && s.question.id) || s.questionId || s.question_id; if (id) set.add("tossup:" + id); });
    (b.starred || []).forEach((s) => { const id = (s.question && s.question.id) || s.questionId || s.question_id; if (id) set.add("bonus:" + id); });
    state.starredIds = set;
    renderHistoryPanel();
  } catch {}
}

function qcardHtml(o) {
  const cls = "qcard " + (o.compact ? "compact" : "expanded") + (o.extraClass ? " " + o.extraClass : "");
  const meta = [
    escapeHtml(o.category || "?") +
      (o.subcategory ? " / " + escapeHtml(o.subcategory) : "") +
      (o.altSub ? " \u00b7 " + escapeHtml(o.altSub) : ""),
    o.year ? String(o.year) : null,
    o.difficulty !== undefined && o.difficulty !== null && o.difficulty !== ""
      ? `<span title="${escapeHtml(DIFFICULTY_NAMES[parseInt(o.difficulty)] || "")}">Diff ${escapeHtml(String(o.difficulty))}</span>`
      : null,
  ].filter(Boolean).map((x) => x.startsWith("<span") ? x : `<span>${x}</span>`).join("");
  return `<div class="${cls}"${o.attrs || ""}>
    <div class="qcard-head">
      <span class="qcard-chev" aria-hidden="true"></span>
      <span class="qcard-meta">${meta}</span>
      <span class="qcard-side">${o.sideHtml || ""}</span>
    </div>
    ${o.answerHtml != null ? `<div class="qcard-answer">${o.answerHtml}</div>` : ""}
    <div class="qcard-body">${o.bodyHtml || ""}</div>
  </div>`;
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".qb-star, .star-toggle, button, a, input, select, textarea, kbd")) return;
  const card = e.target.closest(".qcard");
  if (!card || card.hasAttribute("data-self-toggle")) return;
  if (card.classList.contains("compact")) {
    card.classList.remove("compact");
    card.classList.add("expanded");
  } else if (e.target.closest(".qcard-head")) {
    card.classList.add("compact");
    card.classList.remove("expanded");
  }
});

const DEFAULT_APPEARANCE = {
  accent: {
    gold: ["#dfb347", "#dfb34733"],
    blue: ["#58a6ff", "#1f6feb33"],
    green: ["#3fb950", "#2ea04333"],
    cyan: ["#2dd4bf", "#2dd4bf33"],
    magenta: ["#d65bd6", "#d65bd633"],
    amber: ["#d2991d", "#9e6a0333"],
    red: ["#f85149", "#da363333"],
  },
  radius: { default: null, sharp: "2px", round: "12px" },
  gap: { default: null, compact: "4px", spacious: "16px" },
  fonts: {
    default: null,
    mono: "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace",
    sans: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
    rounded: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', system-ui, sans-serif",
  },
};

function hexToDim(hex) {
  const h = String(hex || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(h)) return h + "33";
  if (/^#[0-9a-fA-F]{3}$/.test(h)) { return "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] + "33"; }
  return h;
}

function activeTheme() {
  return ((window.QB && window.QB._themes) || []).find((t) => t.enabled) || null;
}
function themeAppearanceMode(theme) {
  const m = theme && theme._manifest && theme._manifest.appearance;
  return (m === "preset" || m === "custom") ? m : null;
}

function applyDefaultAppearance() {
  const theme = activeTheme();
  if (window.QB?.hasAppearancePanel?.()) {
    $("#default-appearance")?.classList.add("hidden");
    const h = $("#appearance-empty"); if (h) h.style.display = "none";
    return;
  }
  let mode;
  if (theme) mode = themeAppearanceMode(theme);
  else mode = state.settings.appAppearanceMode === "custom" ? "custom" : "preset";

  const panel = $("#default-appearance");
  panel?.classList.toggle("hidden", mode == null);
  $("#app-mode-row")?.classList.toggle("hidden", !!theme || mode == null);
  $("#app-preset-controls")?.classList.toggle("hidden", mode !== "preset");
  $("#app-custom-controls")?.classList.toggle("hidden", mode !== "custom");

  const hint = $("#appearance-empty");
  if (hint) hint.style.display = (theme && mode == null) ? "" : "none";

  if (mode == null) return;

  const root = document.documentElement.style;
  const rad = DEFAULT_APPEARANCE.radius[state.settings.appRadius];
  if (rad) root.setProperty("--radius", rad); else root.removeProperty("--radius");
  const gap = DEFAULT_APPEARANCE.gap[state.settings.appBtnGap];
  if (gap) root.setProperty("--btn-gap", gap); else root.removeProperty("--btn-gap");

  if (mode === "preset") {
    const acc = DEFAULT_APPEARANCE.accent[state.settings.appAccent];
    if (acc) { root.setProperty("--accent", acc[0]); root.setProperty("--accent-dim", acc[1]); }
    else { root.removeProperty("--accent"); root.removeProperty("--accent-dim"); }
    if (!theme) root.removeProperty("--font");
  } else {
    const hex = state.settings.appCustomAccent || "#dfb347";
    root.setProperty("--accent", hex);
    root.setProperty("--accent-dim", hexToDim(hex));
    const font = DEFAULT_APPEARANCE.fonts[state.settings.appFont];
    if (font) root.setProperty("--font", font); else root.removeProperty("--font");
  }
}
$("#app-mode")?.addEventListener("change", (e) => { state.settings.appAppearanceMode = e.target.value; lsSet("qb-app-mode", e.target.value); applyDefaultAppearance(); });
$("#app-accent")?.addEventListener("change", (e) => { state.settings.appAccent = e.target.value; lsSet("qb-app-accent", e.target.value); applyDefaultAppearance(); });
$("#app-custom-accent")?.addEventListener("input", (e) => { state.settings.appCustomAccent = e.target.value; lsSet("qb-app-custom-accent", e.target.value); applyDefaultAppearance(); });
$("#app-font")?.addEventListener("change", (e) => { state.settings.appFont = e.target.value; lsSet("qb-app-font", e.target.value); applyDefaultAppearance(); });
$("#app-radius")?.addEventListener("change", (e) => { state.settings.appRadius = e.target.value; lsSet("qb-app-radius", e.target.value); applyDefaultAppearance(); });
$("#app-btngap")?.addEventListener("change", (e) => { state.settings.appBtnGap = e.target.value; lsSet("qb-app-btngap", e.target.value); applyDefaultAppearance(); });
function appearanceLabel(k, kind) {
  const fontLabels = { default: "Default", mono: "Monospace", sans: "Sans-serif", serif: "Serif", rounded: "Rounded" };
  if (kind === "font" && fontLabels[k]) return fontLabels[k];
  if (k === "gold") return "Gold (default)";
  return k.charAt(0).toUpperCase() + k.slice(1);
}
function rebuildAppearanceOptions() {
  const acc = $("#app-accent");
  if (acc) { const cur = acc.value; acc.innerHTML = Object.keys(DEFAULT_APPEARANCE.accent).map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(appearanceLabel(k, "accent"))}</option>`).join(""); if ([...acc.options].some((o) => o.value === cur)) acc.value = cur; }
  const fnt = $("#app-font");
  if (fnt) { const cur = fnt.value; fnt.innerHTML = Object.keys(DEFAULT_APPEARANCE.fonts).map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(appearanceLabel(k, "font"))}</option>`).join(""); if ([...fnt.options].some((o) => o.value === cur)) fnt.value = cur; }
}
function addAppearanceOptions(opts) {
  opts = opts || {};
  const addedAcc = [], addedFont = [];
  if (opts.accents) for (const k in opts.accents) { if (!(k in DEFAULT_APPEARANCE.accent)) addedAcc.push(k); const v = opts.accents[k]; DEFAULT_APPEARANCE.accent[k] = Array.isArray(v) ? v : [v, hexToDim(v)]; }
  if (opts.fonts) for (const k in opts.fonts) { if (!(k in DEFAULT_APPEARANCE.fonts)) addedFont.push(k); DEFAULT_APPEARANCE.fonts[k] = opts.fonts[k]; }
  rebuildAppearanceOptions();
  return () => { addedAcc.forEach((k) => delete DEFAULT_APPEARANCE.accent[k]); addedFont.forEach((k) => delete DEFAULT_APPEARANCE.fonts[k]); rebuildAppearanceOptions(); applyDefaultAppearance(); };
}
window.QB?.on?.("theme:change", () => applyDefaultAppearance());
rebuildAppearanceOptions();
applyDefaultAppearance();

function confirmDialog(message, onYes, opts) {
  opts = opts || {};
  document.getElementById("confirm-dialog")?.remove();
  const el = document.createElement("div");
  el.id = "confirm-dialog";
  el.className = "qb-overlay confirm-overlay";
  el.innerHTML = `<div class="confirm-box"><div class="confirm-msg">${escapeHtml(message)}</div>
    <div class="confirm-actions"><button class="btn btn-primary" id="cf-yes">${escapeHtml(opts.yes || "Delete")}</button>
    <button class="btn btn-ghost" id="cf-no">Cancel</button></div></div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) el.remove(); });
  document.body.appendChild(el);
  el.querySelector("#cf-yes").onclick = () => { el.remove(); try { onYes(); } catch (e) { console.error(e); } };
  el.querySelector("#cf-no").onclick = () => el.remove();
}

function closeSaveMenu() { document.getElementById("save-menu")?.remove(); }
function _renderSaveMenu(items, anchor) {
  const menu = document.createElement("div");
  menu.className = "save-menu";
  menu.id = "save-menu";
  menu.innerHTML = items.map((it, i) => `<div class="save-menu-item" data-i="${i}">${escapeHtml(it.label)}</div>`).join("");
  document.body.appendChild(menu);
  // Position by the anchor when it has a real on-screen box; otherwise fall
  // back to the upper third of the viewport (never the body-flow corner).
  let left = null, top = null;
  try {
    const r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : null;
    if (r && (r.width || r.height || r.top || r.left)) { left = r.left; top = r.bottom + 4; }
  } catch (e) {}
  if (left == null) {
    left = (window.innerWidth - menu.offsetWidth) / 2;
    top = (window.innerHeight - menu.offsetHeight) / 3;
  }
  menu.style.left = Math.max(8, Math.min(left, window.innerWidth - menu.offsetWidth - 8)) + "px";
  menu.style.top = Math.max(8, Math.min(top, window.innerHeight - menu.offsetHeight - 8)) + "px";
  menu.querySelectorAll(".save-menu-item").forEach((el) => {
    el.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      closeSaveMenu();
      try { await items[+el.dataset.i].fn(); } catch (e) { console.error(e); }
    });
  });
  setTimeout(() => document.addEventListener("click", closeSaveMenu, { once: true }), 0);
}
function openSaveMenu(question, type, anchor) {
  closeSaveMenu();
  const items = [];
  items.push({
    label: "Add to Review",
    fn: async () => {
      await API.post("/api/review/manual", { questionId: question.id, add: true, type });
      window.QB?.toast?.("Added to review");
      refreshReviewBadge();
    },
  });
  (window.QB?.getSaveActions?.(question, type) || []).forEach((a) => items.push({ label: a.label, fn: a.onClick }));
  if (!items.length) items.push({ label: "Nothing to add to (enable the Folders plugin)", fn: () => {} });
  _renderSaveMenu(items, anchor);
}

// Unified "Saved for Review" list — cross-type (keywords, buzz words, flashcards).
function itemReviewKey(it) { return (it.kind || "") + "|" + (it.front || "") + "|" + (it.back || ""); }
function itemReviewList() { try { return JSON.parse(localStorage.getItem("qb-item-review") || "[]") || []; } catch (e) { return []; } }
function itemReviewSave(arr) { try { localStorage.setItem("qb-item-review", JSON.stringify(arr)); } catch (e) {} }
function itemReviewHas(it) { const k = itemReviewKey(it); return itemReviewList().some((x) => itemReviewKey(x) === k); }
function itemReviewAdd(it) {
  if (!it || (!it.front && !it.back)) return false;
  const arr = itemReviewList();
  const k = itemReviewKey(it);
  if (arr.some((x) => itemReviewKey(x) === k)) { window.QB?.toast?.("Already in review"); return false; }
  arr.push({ kind: it.kind || "item", front: it.front || "", back: it.back || "", meta: it.meta || "", ts: Date.now() });
  itemReviewSave(arr);
  window.QB?.toast?.("Added to review");
  return true;
}
function itemReviewRemove(key) { itemReviewSave(itemReviewList().filter((x) => itemReviewKey(x) !== key)); }
function openItemSaveMenu(spec, anchor) {
  closeSaveMenu();
  const items = [];
  if (spec && spec.review) items.push({ label: itemReviewHas(spec.review) ? "In review ✓" : "Add to Review", fn: () => itemReviewAdd(spec.review) });
  if (spec && spec.folder && window.QBFolders) items.push({ label: "Add to folder…", fn: () => window.QBFolders.pick(spec.folder.type, spec.folder.item, anchor) });
  if (!items.length) items.push({ label: "Enable the Folders plugin to save here", fn: () => {} });
  _renderSaveMenu(items, anchor);
}
function reviewItemsAsFlashcards() {
  const cards = itemReviewList().map((it) => ({ front: it.front, back: it.back, meta: it.meta || it.kind || "review" }));
  if (!cards.length) { window.QB?.toast?.("Nothing saved to review"); return; }
  try { localStorage.setItem("qb-flashcards-cards", JSON.stringify({ cards, ts: Date.now() })); } catch (e) {}
  if (!(window.QB && window.QB.showPage && window.QB.showPage("flashcards::cards"))) {
    try { localStorage.removeItem("qb-flashcards-cards"); } catch (e) {}
    window.QB?.toast?.("Enable the Flashcards plugin first", "error");
  }
}
function openItemReviewViewer() {
  document.getElementById("review-viewer")?.remove();
  const list = itemReviewList();
  const el = document.createElement("div");
  el.id = "review-viewer";
  el.className = "review-viewer";
  const cards = list.map((it) => {
    const k = itemReviewKey(it);
    return `<div class="qcard expanded" data-irkey="${escapeHtml(k)}"><div class="qcard-head"><span class="qcard-chev" aria-hidden="true"></span>` +
      `<span class="qcard-meta"><span>${escapeHtml(it.meta || it.kind || "")}</span></span>` +
      `<span class="qcard-side"><button class="btn btn-sm btn-ghost ir-remove" data-irkey="${escapeHtml(k)}">Remove</button></span></div>` +
      `<div class="qcard-answer">${escapeHtml(it.front || "")} → <span class="ans">${escapeHtml(it.back || "")}</span></div></div>`;
  }).join("");
  el.innerHTML = `
    <div class="review-viewer-box">
      <div class="review-viewer-head">
        <span class="hotkey-sheet-title" style="margin:0">SAVED FOR REVIEW (${list.length})</span>
        <span style="display:flex;gap:6px">
          ${list.length ? '<button class="btn btn-sm btn-primary" id="ir-flash">Review as flashcards</button>' : ""}
          ${list.length ? '<button class="btn btn-sm btn-ghost" id="ir-clear">Clear all</button>' : ""}
          <button class="btn btn-sm btn-ghost" id="ir-close">Close</button>
        </span>
      </div>
      <div class="review-viewer-list">${list.length ? cards : '<div class="text-muted" style="padding:12px">No saved items yet — use the + on a keyword, buzz word, or flashcard.</div>'}</div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) el.remove(); });
  document.body.appendChild(el);
  el.querySelector("#ir-close").onclick = () => el.remove();
  const fl = el.querySelector("#ir-flash"); if (fl) fl.onclick = () => { el.remove(); reviewItemsAsFlashcards(); };
  const cl = el.querySelector("#ir-clear"); if (cl) cl.onclick = () => confirmDialog("Clear all saved review items?", () => { itemReviewSave([]); el.remove(); }, { yes: "Clear" });
  el.querySelectorAll(".ir-remove").forEach((b) => {
    b.addEventListener("click", (ev) => { ev.stopPropagation(); itemReviewRemove(b.dataset.irkey); el.querySelector(`[data-irkey="${CSS.escape(b.dataset.irkey)}"]`)?.remove(); });
  });
}

function reviewDueUrl() {
  return "/api/review/due?negs=" + (state.settings.reviewNegs ? 1 : 0) +
    "&unanswered=" + (state.settings.reviewUnans ? 1 : 0) +
    "&wrongEnd=" + (state.settings.reviewWrongEnd ? 1 : 0);
}

const PRON_ACRONYMS = new Set(["USA", "USSR", "NATO", "DNA", "RNA", "UN", "US", "UK", "EU", "TV", "FBI", "CIA", "NASA", "WWI", "WWII", "NBA", "NFL", "MLB", "NHL", "NCAA", "GDP", "AIDS", "HIV", "BC", "AD", "BCE", "CE", "II", "III", "IV", "VI", "VII", "VIII", "IX", "XI", "MVP", "CEO", "PhD", "JFK", "FDR", "POW", "AI", "IQ", "OK"]);
function stripPronunciations(text) {
  let t = String(text || "");
  // Quoted guide in brackets/parens: ("kee-HO-tay"), ['zhawnr']
  t = t.replace(/\s*[\[(]\s*["“'‘][^\])]*?["”'’]\s*[\])]/g, "");
  // Anything that says it's a pronunciation
  t = t.replace(/\s*[\[(][^\])]*pronounc[^\])]*[\])]/gi, "");
  // Moderator / reader instructions in brackets (notes addressed to PLAYERS stay)
  t = t.replace(/\s*\[\s*(?:notes?\s+to\s+(?:the\s+)?(?:moderators?|readers?)\b[^\]]*|moderators?\s+notes?\b[^\]]*|moderators?\s*[:,][^\]]*|emphasi[sz]e[^\]]*|read\s+slowly[^\]]*|read\s+(?:the\s+)?answerline[^\]]*|pause\b[^\]]*|spell\s+(?:it|out)\b[^\]]*|slowly\s*:?[^\]]*)\]/gi, "");
  // Phonetic-looking brackets: short runs of letter tokens where a token is
  // hyphenated ("eel duh lah see-tay") or a CAPS syllable sits beside a
  // lowercase one ("mool AHN"). Editorial inserts like [this man], [s], [10],
  // [*] and [...] never match.
  t = t.replace(/\[([^\][]{1,80})\]/g, (m, inner) => {
    const tokens = inner.trim().replace(/\s*-\s+|\s+-\s*/g, "-").split(/\s+/);
    if (!tokens.length || tokens.length > 7) return m;
    if (!tokens.every((w) => /^["“”'‘’(]?[A-Za-z][A-Za-z0-9'’"“”()-]*[.,;:]?$/.test(w))) return m;
    const bare = tokens.map((w) => w.replace(/^["“”'‘’(]+|["“”'‘’().,;:]+$/g, ""));
    // Determiner-led brackets are editorial placeholders ([this two-word
    // phrase], [his best-known novel]) — never pronunciation guides.
    if (/^(this|these|that|those|his|her|their|its|the|a|an)$/i.test(bare[0])) return m;
    // Quoted syllables glued by hyphens ('"SAY"-tur') count as hyphenated.
    const dequoted = bare.map((w) => w.replace(/["“”'‘’]/g, ""));
    const hyphenated = dequoted.some((w) => /[A-Za-z0-9]-[A-Za-z0-9]/.test(w));
    const capsSyllable = dequoted.some((w) => /^[A-Z]{2,}$/.test(w) && !PRON_ACRONYMS.has(w)) && dequoted.some((w) => /^[a-z]{2,}$/.test(w));
    return hyphenated || capsSyllable ? "" : m;
  });
  // Parentheticals except the power mark; twice for one level of nesting
  t = t.replace(/\s*\((?!\*\))[^()]*\)/g, "");
  t = t.replace(/\s*\((?!\*\))[^()]*\)/g, "");
  // Residue: empty brackets (present in source data or left by inner strips)
  t = t.replace(/\s*\[\s*\]/g, "");
  return t.replace(/  +/g, " ");
}

function colorizePowerMarks(escapedHtml) {
  return escapedHtml.replace(/\(\*\)/g, '<span class="power-mark-inline">(*)</span>');
}

function historyQuestionHtml(e) {
  const raw = e.question?.question_sanitized || e.question?.leadin_sanitized || "";
  const isTossup = e.type === "tossup";
  const powerIdx = isTossup ? raw.indexOf("(*)") : -1;
  const text = isTossup ? raw.replace(/\(\*\)/g, "") : raw;
  const marks = [];
  const pos = isTossup ? (e.buzzPosition || 0) : 0;
  if (powerIdx >= 0 && powerIdx <= text.length) marks.push({ i: powerIdx, html: '<span class="power-mark-inline">(*)</span>' });
  if (pos > 0 && pos <= text.length) marks.push({ i: pos, html: '<span class="buzz-mark">(#)</span>' });
  if (!marks.length) return escapeHtml(text);
  marks.sort((a, b) => a.i - b.i);
  let out = "", last = 0;
  for (const m of marks) { out += escapeHtml(text.substring(last, m.i)) + m.html; last = m.i; }
  out += escapeHtml(text.substring(last));
  return out;
}

function renderHistoryPanel() {
  const panel = document.getElementById("history-panel");
  if (panel) {
    panel.style.display = state.sessionHistory.length ? "" : "none";
    const cnt = document.getElementById("history-count");
    if (cnt) cnt.textContent = String(state.sessionHistory.length);
  }
  const list = document.getElementById("history-list");
  if (!list) return;

  if (state.sessionHistory.length === 0) {
    list.innerHTML = "";
    return;
  }

  const entries = [...state.sessionHistory].reverse();
  const isCompact = state.viewMode === "compact";

  list.innerHTML = entries.map((e, i) => {
    const celPct = ((1 - (e.celerity || 0)) * 100).toFixed(0);
    const isTossup = e.type === "tossup";
    const pts = e.points || 0;
    const badge = isTossup
      ? (e.isPower
        ? '<span class="pill pill-accent">PWR +' + pts + '</span>'
        : e.correct
          ? '<span class="pill pill-green">+' + pts + '</span>'
          : (pts < 0
            ? '<span class="pill pill-red">' + pts + '</span>'
            : '<span class="pill">' + pts + '</span>'))
      : '<span class="pill pill-green">' + pts + '</span>';
    const celMarker = isTossup ? `<span class="qcard-note">cel ${celPct}%</span>` : "";
    const answer = answerLineHtml(
      e.question?.answer || (() => { try { return JSON.parse(e.question?.answers || "[]").join(" / "); } catch { return ""; } })(),
      e.answer || (e.answers ? e.answers.join(" / ") : "") || e.question?.answer_sanitized || ""
    );
    const yourAnswer = e.userAnswer ?? (e.userAnswers ? e.userAnswers.join(", ") : "(skipped)");
    return qcardHtml({
      compact: isCompact,
      category: e.question?.category,
      subcategory: e.question?.subcategory,
      altSub: e.question?.alternate_subcategory,
      year: e.question?.set_year,
      difficulty: e.question?.difficulty,
      sideHtml: (() => { const st = isStarredLocal(e.id, e.type); return `${celMarker}${badge}<span class="star-btn save-plus hist-save" data-idx="${i}" title="Save to review / folders">+</span><span class="star-toggle${st ? " on" : ""}" data-qid="${e.id}" data-type="${e.type}">${st ? "\u2605" : "\u2606"}</span>`; })(),
      answerHtml: `Answer: <span class="ans">${answer}</span>`,
      bodyHtml: `
        <div class="qcard-text">${historyQuestionHtml(e)}</div>
        <div class="qcard-foot">Your answer:
          <strong style="color:${e.correct ? "var(--green)" : "var(--red)"}">${escapeHtml(yourAnswer || "(no answer)")}</strong>
          ${e.question?.set_name ? `<span class="qcard-note">\u00b7 ${escapeHtml(e.question.set_name)}</span>` : ""}
        </div>`,
    });
  }).join("");

  list.querySelectorAll(".star-toggle").forEach(el => {
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleStarInHistory(el.dataset.qid, el.dataset.type, el);
    });
  });
  list.querySelectorAll(".hist-save").forEach(el => {
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const e = entries[+el.dataset.idx];
      if (e?.question) openSaveMenu(e.question, e.type || "tossup", el);
    });
  });
}


document.addEventListener("click", async (e) => {
  const star = e.target.closest(".qb-star");
  if (!star) return;
  e.preventDefault();
  e.stopPropagation();
  const qId = star.dataset.qid, type = star.dataset.type || "tossup";
  if (!qId) return;
  try {
    const result = await API.post("/api/starred/toggle", { questionId: qId, type });
    setStarredLocal(qId, type, result.starred);
    star.textContent = result.starred ? "★" : "☆";
    star.classList.toggle("on", !!result.starred);
    Sound.star();
    renderHistoryPanel();
  } catch {}
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".db-save");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const qId = btn.dataset.qid, type = btn.dataset.type || "tossup";
  if (!qId) return;
  try {
    const d = await API.get((type === "bonus" ? "/api/bonuses/" : "/api/tossups/") + encodeURIComponent(qId));
    const q = d.tossup || d.bonus;
    if (q) openSaveMenu(q, type, btn);
  } catch {}
});

async function toggleStarInHistory(qId, type, el) {
  try {
    const result = await API.post("/api/starred/toggle", { questionId: qId, type });
    setStarredLocal(qId, type, result.starred);
    if (el) { el.textContent = result.starred ? "\u2605" : "\u2606"; el.classList.toggle("on", !!result.starred); }
    state.sessionHistory.forEach(e => {
      if (e.id === qId && e.type === type) e.starred = result.starred;
    });
    Sound.star();
  } catch {}
}

function renderTossupResult() {
  const r = state.lastResult;
  if (!r) return;
  const banner = $("#result-banner");
  const answerDiv = $("#result-answer");

  banner.className = "result-banner";
  if (r.isPower) {
    banner.classList.add("power");
    banner.textContent = `POWER! +${r.points} pts`;
  } else if (r.correct) {
    banner.classList.add("correct");
    banner.textContent = `CORRECT +${r.points} pts`;
  } else if (r.points < 0) {
    banner.classList.add("incorrect");
    banner.textContent = `NEG ${r.points} pts`;
  } else {
    banner.classList.add("incorrect");
    banner.textContent = "INCORRECT (0 pts)";
  }

  const celPct = ((1 - r.celerity) * 100).toFixed(1);
  answerDiv.innerHTML = `
    Your answer: <strong>${escapeHtml(r.userAnswer || "(no answer)")}</strong>
    ${r.correct ? "" : `<br>Correct: <span class="actual">${answerLineHtml(state.currentQuestion?.answer, r.answer || "")}</span>`}
    <br>Celerity: ${celPct}% remaining
    <div class="override-hints" style="margin-top:6px;font-size:11px;color:var(--text-muted)">
      <kbd>${escapeHtml(keyDisplay("mark-correct"))}</kbd> mark correct &nbsp; <kbd>${escapeHtml(keyDisplay("mark-incorrect"))}</kbd> mark incorrect
      ${state.resultOverridden ? ' <span style="color:var(--yellow)">(overridden)</span>' : ''}
    </div>
  `;

  setTimeout(() => {
    if (!state.resultAreaVisible) return;
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
  }, 100);
}

function toggleResultOverride(markCorrect) {
  if (!state.lastResult || !state.resultAreaVisible) return;
  const r = state.lastResult;

  if (r.correct === markCorrect && !state.resultOverridden) return;

  const wasCorrect = r.correct;
  const wasPower = r.isPower;
  const wasPoints = r.points;
  const celVal = 1 - r.celerity;

  const incorrectPts = state.questionFullyRead ? 0 : -5;
  const inPowerZone = state.prePowerEnd > 0 && r.buzzPosition != null && r.buzzPosition <= state.prePowerEnd;
  r.correct = markCorrect;
  r.isPower = markCorrect ? inPowerZone : false;
  r.points = markCorrect ? (r.isPower ? 15 : 10) : incorrectPts;
  state.resultOverridden = true;

  if (state.mode === "tossups" && state.settings.bonusAfter) {
    if (markCorrect && !wasCorrect) {
      state._wantBonus = true;
      state._bonusFromQ = state.currentQuestion;
      const _mv = $("#mode-select")?.value;
      state._pendingPairedBonus = (_mv === "import" || _mv === "set") ? (state._currentPaired || null) : null;
    } else if (!markCorrect && wasCorrect) {
      state._wantBonus = false;
      state._pendingPairedBonus = null;
    }
  }

  const histEntry = state.sessionHistory.find(e => e.id === r.questionId && e.correct !== markCorrect);
  if (histEntry) {
    histEntry.correct = markCorrect;
    histEntry.isPower = markCorrect ? r.isPower : false;
    histEntry.points = r.points;
    renderHistoryPanel();
  }

  state.totalPoints += r.points - wasPoints;

  if (!wasCorrect && markCorrect) {
    state.correct++;
    if (wasPoints < 0) state.negs = Math.max(0, state.negs - 1);
  } else if (wasCorrect && !markCorrect) {
    state.correct = Math.max(0, state.correct - 1);
    if (r.points < 0) state.negs++;
  }
  if (!wasPower && r.isPower) state.powers++;
  else if (wasPower && !r.isPower) state.powers = Math.max(0, state.powers - 1);

  if (markCorrect) {
    state.correctCelerityHistory.push(celVal);
    state.incorrectCelerityHistory = state.incorrectCelerityHistory.filter(c => c !== celVal);
  } else {
    state.incorrectCelerityHistory.push(celVal);
    state.correctCelerityHistory = state.correctCelerityHistory.filter(c => c !== celVal);
  }
  if (state.correctCelerityHistory.length > 10) state.correctCelerityHistory.shift();
  if (state.incorrectCelerityHistory.length > 10) state.incorrectCelerityHistory.shift();

  if (r.category && state.mode === "tossups") {
    API.post("/api/check-tossup", {
      questionId: r.questionId,
      answer: r.userAnswer,
      buzzPosition: r.buzzPosition || 0,
      sessionId: state.sessionId,
      overriding: true,
      correct: r.correct,
      isPower: r.isPower,
      points: r.points,
    }).catch(() => {});
  }

  renderTossupResult();
  updateSessionStats();
  Sound.toggle();
}

function displayBonusResult(result, userAnswers) {
  const banner = $("#result-banner");
  const answerDiv = $("#result-answer");
  const area = $("#result-area");
  area.classList.remove("hidden");
  state.resultAreaVisible = true;

  banner.className = "result-banner";
  banner.classList.add(result.totalPoints > 20 ? "power" : result.totalPoints > 0 ? "correct" : "incorrect");
  banner.textContent = `BONUS: ${result.totalPoints}/30 pts (${result.partsCorrect}/3)`;

  const actualAnswers = result.answers || [];
  answerDiv.innerHTML = "";

  state.sessionHistory.push({
    id: state.currentQuestion?.id,
    type: "bonus",
    question: state.currentQuestion,
    userAnswers,
    correct: result.totalPoints > 20,
    points: result.totalPoints,
    partsCorrect: result.partsCorrect,
    answers: actualAnswers,
    starred: state.currentQuestion ? isStarredLocal(state.currentQuestion.id, "bonus") : false,
  });
  renderHistoryPanel();

  renderResultPanels({ type: "bonus", result, question: state.currentQuestion, userAnswers });
  qbEmit("bonus:result", { result, userAnswers });

  scheduleAchievementCheck();

  setTimeout(() => {
    if (!state.resultAreaVisible) return;
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
  }, 100);
}


function updateSessionStats(result) {
  if (result) {
    state.totalPoints += result.points || 0;
    if (result.isPower) state.powers++;
    if (result.points && result.points < 0) state.negs++;
    if (result.correct) state.correct++;
  }

  $("#session-score").textContent = `Score: ${state.totalPoints}`;
  updateLiveStats();
}

function updateLiveStats() {
  const n = Math.max(1, state.questionCount);
  const active = state.sessionActive && state.questionCount > 0;

  $("#stat-acc").textContent = active ? `${((state.correct / n) * 100).toFixed(0)}%` : "\u2014";
  $("#stat-pwr").textContent = active ? `${state.powers}` : "\u2014";
  $("#stat-neg").textContent = active ? `${state.negs}` : "\u2014";

  const avgCel = state.correctCelerityHistory.length > 0
    ? state.correctCelerityHistory.reduce((a, b) => a + b, 0) / state.correctCelerityHistory.length
    : 0;
  $("#stat-cel").textContent = active && state.correctCelerityHistory.length > 0
    ? `${(avgCel * 100).toFixed(0)}%`
    : "\u2014";

  const correctAvg = state.correctCelerityHistory.length > 0
    ? state.correctCelerityHistory.reduce((a,b) => a+b, 0) / state.correctCelerityHistory.length
    : 0;
  const incorrectAvg = state.incorrectCelerityHistory.length > 0
    ? state.incorrectCelerityHistory.reduce((a,b) => a+b, 0) / state.incorrectCelerityHistory.length
    : 0;
  const celEl = $("#stat-cel-detail");
  if (celEl) {
    const parts = [];
    if (state.correctCelerityHistory.length > 0) parts.push(`\u2713${(correctAvg * 100).toFixed(0)}%`);
    if (state.incorrectCelerityHistory.length > 0) parts.push(`\u2717${(incorrectAvg * 100).toFixed(0)}%`);
    celEl.textContent = parts.join(" ");
  }

  $("#stat-ppq").textContent = active ? `${(state.totalPoints / n).toFixed(1)}` : "\u2014";
  $("#session-counter").textContent = `${state.questionCount}`;
}


function startPromptHtml() {
  return '<div class="placeholder-icon"><svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.4-1.3 1-1.3 1.8v.3"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg></div>' +
    "<p>Select categories and difficulty, then start a session.</p>" +
    '<p class="text-muted">Press <kbd id="placeholder-start-key">' + escapeHtml(keyDisplay("start-skip")) + "</kbd> to start.</p>";
}
function resetQuestionUI() {
  state.resultAreaVisible = false;
  state.isPaused = false;
  const pauseOverlay = document.getElementById("pause-overlay");
  if (pauseOverlay) pauseOverlay.remove();
  const buzzMarker = document.querySelector(".buzz-marker");
  if (buzzMarker) buzzMarker.remove();
  $("#question-text")?.classList.remove("paused-text");
  $("#question-content").classList.add("hidden");
  const ph = $("#question-placeholder");
  if (ph) { ph.classList.remove("hidden"); ph.innerHTML = startPromptHtml(); }
  $("#buzz-area").classList.add("hidden");
  $("#result-area").classList.add("hidden");
  document.querySelectorAll("#result-area .ext-result-panel").forEach((el) => el.remove());
  $("#bonus-parts-area").classList.add("hidden");
  state.bonusAwait = null;
  $("#bonus-next-hint")?.classList.add("hidden");
  $("#question-text").textContent = "";
  $("#question-meta").innerHTML = "";
  $("#buzz-input").value = "";
  $("#power-mark").classList.add("hidden");
  $$(".bonus-answer-input").forEach((inp) => (inp.value = ""));
}



$("#bonus-next-hint")?.addEventListener("click", advanceBonusPart);

// "Hide answers": each hidden answer is a cover box — click reveals, click again re-hides.
document.addEventListener("click", (e) => {
  const t = e.target.closest?.(".ans-toggle");
  if (t && t.closest(".db-hide-ans")) t.classList.toggle("shown");
});

function copyToClipboard(t) {
  try { navigator.clipboard.writeText(t); window.QB?.toast?.("Copied"); } catch (e) {}
}

// Right-click any question card (search, packets, history, review, starred)
// for quick actions built from what the card actually contains.
document.addEventListener("contextmenu", (e) => {
  const card = e.target.closest?.(".qcard");
  if (!card || !window.QB?.contextMenu) return;
  const items = [];
  const text = card.querySelector(".qcard-text")?.textContent?.trim();
  const ans = card.querySelector(".ans")?.textContent?.trim();
  const star = card.querySelector(".qb-star[data-qid]");
  const save = card.querySelector(".db-save[data-qid]");
  const compact = card.classList.contains("compact");
  items.push({ label: compact ? "Expand card" : "Collapse card", onClick: () => { card.classList.toggle("compact", !compact); card.classList.toggle("expanded", compact); } });
  if (text) items.push({ label: "Copy question", onClick: () => copyToClipboard(text) });
  if (ans) items.push({ label: "Copy answer", onClick: () => copyToClipboard(ans.replace(/^answer:\s*/i, "")) });
  if (star) items.push({ label: star.classList.contains("on") ? "Unstar" : "Star", onClick: () => star.click() });
  if (save) items.push({ label: "Save to review / folders…", onClick: () => save.click() });
  e.preventDefault();
  window.QB.contextMenu(e.clientX, e.clientY, items);
});

// Right-click the live practice question for the same quick actions.
$("#question-content")?.addEventListener("contextmenu", (e) => {
  if (!state.currentQuestion || !window.QB?.contextMenu) return;
  const q = state.currentQuestion;
  const isBonus = state.mode === "bonuses";
  const items = [{ label: "Copy question", onClick: () => copyToClipboard($("#question-text")?.textContent || "") }];
  if (!isBonus && state.resultAreaVisible && q.answer_sanitized) {
    items.push({ label: "Copy answer", onClick: () => copyToClipboard(q.answer_sanitized) });
  }
  items.push({ label: "Star question", onClick: () => toggleStar() });
  items.push({ label: "Save to review / folders…", onClick: () => openSaveMenu(q, isBonus ? "bonus" : "tossup", e.target) });
  e.preventDefault();
  window.QB.contextMenu(e.clientX, e.clientY, items);
});

$("#btn-start-session").addEventListener("click", () => {
  if (!state.sessionActive) startSession();
  else if (state.mode === "tossups" && !state.isBuzzed) buzz();
  else if (state.mode === "bonuses" && state.settings.allowSkips) skipQuestion();
});

$("#btn-end-session").addEventListener("click", () => {
  endSession();
  goHome();
});

function exportSessionHistory() {
  if (!state.sessionHistory.length) { window.QB?.toast?.("No questions this session yet", "error"); return; }
  const entries = state.sessionHistory.map((e) => ({
    type: e.type,
    category: e.question?.category || "",
    subcategory: e.question?.subcategory || "",
    difficulty: e.question?.difficulty ?? null,
    set: e.question?.set_name || "",
    question: e.question?.question_sanitized || e.question?.leadin_sanitized || "",
    yourAnswer: e.userAnswer ?? (e.userAnswers ? e.userAnswers.join(" / ") : ""),
    correctAnswer: e.answer || (e.answers ? e.answers.join(" / ") : ""),
    correct: !!e.correct,
    points: e.points || 0,
    buzzPosition: e.buzzPosition ?? null,
    starred: !!e.starred,
  }));
  const blob = new Blob(
    [JSON.stringify({ exportedAt: new Date().toISOString(), mode: state.mode, count: entries.length, entries }, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `session-${state.mode || "practice"}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function openHistoryOverlay() {
  document.getElementById("history-overlay")?.remove();
  const el = document.createElement("div");
  el.id = "history-overlay";
  el.className = "review-viewer";
  el.innerHTML = `
    <div class="review-viewer-box">
      <div class="review-viewer-head">
        <span class="hotkey-sheet-title" style="margin:0">SESSION HISTORY (${state.sessionHistory.length})</span>
        <span style="display:flex;gap:6px">
          <button class="btn btn-sm btn-ghost" id="btn-history-export">Export</button>
          <button class="btn btn-sm btn-ghost" id="btn-history-compact">Compact all</button>
          <button class="btn btn-sm btn-ghost" id="btn-history-expand">Expand all</button>
          <button class="btn btn-sm btn-ghost" id="btn-history-close">Close</button>
        </span>
      </div>
      <div class="review-viewer-list history-list" id="history-list"></div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) el.remove(); });
  document.body.appendChild(el);
  el.querySelector("#btn-history-close").onclick = () => el.remove();
  el.querySelector("#btn-history-export").onclick = exportSessionHistory;
  el.querySelector("#btn-history-compact").onclick = () => { state.viewMode = "compact"; lsSet("qb-viewmode", "compact"); renderHistoryPanel(); };
  el.querySelector("#btn-history-expand").onclick = () => { state.viewMode = "expanded"; lsSet("qb-viewmode", "expanded"); renderHistoryPanel(); };
  renderHistoryPanel();
}

$("#btn-history-open")?.addEventListener("click", openHistoryOverlay);

$("#btn-home").addEventListener("click", goBack);
$("#btn-stats-home").addEventListener("click", goBack);
$("#stats-cat-filter")?.addEventListener("change", () => loadStats());
$("#stats-period")?.addEventListener("change", (e) => { _statsPeriod = e.target.value; loadStats(); });
$("#btn-settings-home").addEventListener("click", goBack);
$("#btn-player-home")?.addEventListener("click", goBack);
$("#btn-ext-home")?.addEventListener("click", goBack);

function renderResultPanels(resultCtx) {
  document.querySelectorAll("#result-area .ext-result-panel").forEach((el) => el.remove());
  const area = $("#result-area");
  if (!area) return;
  for (const p of (window.QB?.getResultPanels?.() || [])) {
    const host = document.createElement("div");
    host.className = "ext-result-panel";
    area.appendChild(host);
    try { p.render(host, resultCtx); } catch { host.remove(); }
  }
}

function showError(msg) {
  const banner = $("#result-banner");
  const area = $("#result-area");
  area.classList.remove("hidden");
  banner.className = "result-banner incorrect";
  banner.textContent = msg;
}


async function toggleStar() {
  const q = state.currentQuestion;
  if (!q) return;
  Sound.star();

  const type = state.mode === "tossups" ? "tossup" : "bonus";
  try {
    const result = await API.post("/api/starred/toggle", {
      questionId: q.id,
      type,
    });
    setStarredLocal(q.id, type, result.starred);
    updateStarIndicator(q.id, type, result.starred);
    state.sessionHistory.forEach(e => {
      if (e.id === q.id && e.type === type) e.starred = result.starred;
    });
    renderHistoryPanel();
  } catch (e) {
    console.error("Star toggle failed:", e);
  }
}

function updateStarIndicator(questionId, type, starred) {
  const el = $("#star-indicator");
  if (el) { el.textContent = starred ? "\u2605" : "\u2606"; el.classList.toggle("on", !!starred); }
}

async function checkStarStatus(questionId, type) {
  try {
    const data = await API.get(`/api/starred/check?questionId=${questionId}&type=${type}`);
    updateStarIndicator(questionId, type, data.starred);
  } catch (e) {}
}

function getStarChar(questionId, type) {
  return "\u2606";
}


function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W: w, H: h };
}

function niceAxisMax(v) {
  if (!isFinite(v) || v <= 0) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10;
  return Math.max(4, step * pow);
}

function chartTheme() {
  const s = getComputedStyle(document.documentElement); const v = (n) => s.getPropertyValue(n).trim();
  return { accent: v("--accent"), green: v("--green"), red: v("--red"), yellow: v("--yellow"), text: v("--text"), sec: v("--text-secondary"), muted: v("--text-muted"), border: v("--border"), bg: v("--bg") || "#0d0d0d", font: v("--font") || "monospace" };
}
function shortDate(d) { try { return new Date(d).toLocaleDateString(undefined, { month: "numeric", day: "numeric" }); } catch { return ""; } }
function emptyChart(canvas, msg) {
  const { ctx, W, H } = setupCanvas(canvas); const t = chartTheme();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.muted; ctx.font = "12px " + t.font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(msg || "Not enough data yet", W / 2, H / 2); ctx.textBaseline = "alphabetic";
}
function rrect(ctx, x, y, w, h, r) {
  if (h < 0) { y += h; h = -h; }
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function chartFrame(ctx, W, H, t, opts, yMin, yMax, fmt) {
  const pad = { top: (opts.title ? 34 : 16) + (opts._reserve || 0), right: 16, bottom: 30, left: 50 };
  const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
  if (opts.title) {
    ctx.fillStyle = t.sec; ctx.font = "600 11px " + t.font;
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.title.toUpperCase(), pad.left, 17);
  }
  const range = (yMax - yMin) || 1;
  ctx.font = "10px " + t.font; ctx.textBaseline = "middle";
  for (let i = 0; i <= 4; i++) {
    const val = yMin + (i / 4) * range;
    const y = pad.top + plotH - (i / 4) * plotH;
    ctx.fillStyle = t.muted; ctx.textAlign = "right"; ctx.fillText(fmt(val), pad.left - 7, y);
    ctx.strokeStyle = t.border; ctx.globalAlpha = 0.35; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  ctx.textBaseline = "alphabetic";
  return { pad, plotW, plotH, yOf: (v) => pad.top + plotH - ((v - yMin) / range) * plotH };
}

function xLabel(ctx, t, text, cx, y, maxW) {
  let str = String(text);
  ctx.font = "10px " + t.font;
  if (ctx.measureText(str).width > maxW) {
    while (str.length > 2 && ctx.measureText(str + "\u2026").width > maxW) str = str.slice(0, -1);
    str += "\u2026";
  }
  ctx.fillStyle = t.muted; ctx.textAlign = "center";
  ctx.fillText(str, cx, y);
}

function barChart(canvas, bars, opts = {}) {
  if (!bars || !bars.length) return emptyChart(canvas, opts.empty);
  const { ctx, W, H } = setupCanvas(canvas); const t = chartTheme(); ctx.clearRect(0, 0, W, H);
  const fmt = opts.fmt || ((v) => String(Math.round(v)));
  const vals = bars.map((b) => b.value);
  const yMax = opts.yMax != null ? opts.yMax : niceAxisMax(Math.max(...vals, 0.0001));
  let yMin = Math.min(0, ...vals);
  if (yMin < 0) yMin = -niceAxisMax(-yMin);
  const { pad, plotW, plotH, yOf } = chartFrame(ctx, W, H, t, { ...opts, _reserve: 14 }, yMin, yMax, fmt);
  const zeroY = yOf(0);
  const slot = plotW / bars.length, bw = Math.min(44, Math.max(10, slot * 0.6));
  const step = Math.max(1, Math.ceil(bars.length / Math.max(1, Math.floor(plotW / 46))));
  bars.forEach((b, i) => {
    const cx = pad.left + slot * (i + 0.5);
    const y = yOf(b.value);
    const top = Math.min(y, zeroY), h = Math.max(2, Math.abs(y - zeroY));
    ctx.fillStyle = b.color || t.accent;
    rrect(ctx, cx - bw / 2, top, bw, h, 4); ctx.fill();
    const label = fmt(b.value);
    ctx.font = "10px " + t.font; ctx.textAlign = "center"; ctx.fillStyle = t.text;
    if (b.value >= 0) {
      ctx.fillText(label, cx, top - 4);
    } else {
      const bot = top + h;
      if (H - pad.bottom - bot >= 13) ctx.fillText(label, cx, bot + 11);
      else ctx.fillText(label, cx, zeroY - 4);
    }
    if (i % step === 0) xLabel(ctx, t, b.label, cx, H - pad.bottom + 15, slot * step - 6);
  });
}

function stackedChart(canvas, groups, opts = {}) {
  if (!groups || !groups.length) return emptyChart(canvas, opts.empty);
  const { ctx, W, H } = setupCanvas(canvas); const t = chartTheme(); ctx.clearRect(0, 0, W, H);
  const totals = groups.map((g) => g.segments.reduce((s, x) => s + Math.max(0, x.value), 0));
  const yMax = opts.yMax != null ? opts.yMax : niceAxisMax(Math.max(...totals, 1));
  const fmt = (v) => String(Math.round(v));
  const { pad, plotW, plotH } = chartFrame(ctx, W, H, t, { ...opts, _reserve: 14 }, 0, yMax, fmt);
  if (opts.legend && opts.legend.length) {
    ctx.font = "10px " + t.font;
    const lw = opts.legend.reduce((a, l) => a + ctx.measureText(l.label).width + 26, 0);
    let lx = W - pad.right - lw;
    opts.legend.forEach((l) => {
      ctx.fillStyle = l.color; rrect(ctx, lx, 9, 9, 9, 2); ctx.fill();
      ctx.fillStyle = t.sec; ctx.textAlign = "left"; ctx.fillText(l.label, lx + 13, 17);
      lx += ctx.measureText(l.label).width + 26;
    });
  }
  const slot = plotW / groups.length, bw = Math.min(40, Math.max(10, slot * 0.6));
  const step = Math.max(1, Math.ceil(groups.length / Math.max(1, Math.floor(plotW / 46))));
  groups.forEach((g, i) => {
    const cx = pad.left + slot * (i + 0.5);
    const total = g.segments.reduce((s, x) => s + Math.max(0, x.value), 0);
    if (total > 0) {
      const colH = Math.max(2, (total / yMax) * plotH);
      const top = pad.top + plotH - colH;
      ctx.save();
      rrect(ctx, cx - bw / 2, top, bw, colH, 4); ctx.clip();
      let y = pad.top + plotH;
      g.segments.forEach((seg) => {
        if (seg.value <= 0) return;
        const h = (seg.value / yMax) * plotH;
        ctx.fillStyle = seg.color;
        ctx.fillRect(cx - bw / 2, y - h, bw, h);
        y -= h;
      });
      ctx.restore();
      ctx.font = "10px " + t.font; ctx.textAlign = "center";
      ctx.fillStyle = t.text; ctx.fillText(String(Math.round(total)), cx, top - 4);
    }
    if (i % step === 0) xLabel(ctx, t, g.label, cx, H - pad.bottom + 15, slot * step - 6);
  });
}

function lineChart(canvas, points, opts = {}) {
  if (!points || !points.length) return emptyChart(canvas, opts.empty);
  const { ctx, W, H } = setupCanvas(canvas); const t = chartTheme(); ctx.clearRect(0, 0, W, H);
  const fmt = opts.fmt || ((v) => String(Math.round(v)));
  const ys = points.map((p) => p.y);
  const yMax = niceAxisMax(Math.max(...ys, 1)), yMin = Math.min(0, ...ys);
  const { pad, plotW, plotH, yOf } = chartFrame(ctx, W, H, t, opts, yMin, yMax, fmt);
  const xOf = (i) => pad.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  ctx.beginPath();
  points.forEach((p, i) => { const x = xOf(i), y = yOf(p.y); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.lineTo(xOf(points.length - 1), yOf(yMin)); ctx.lineTo(xOf(0), yOf(yMin)); ctx.closePath();
  ctx.fillStyle = t.accent + "1f"; ctx.fill();
  ctx.strokeStyle = t.accent; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
  points.forEach((p, i) => { const x = xOf(i), y = yOf(p.y); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.stroke();
  points.forEach((p, i) => {
    const x = xOf(i), y = yOf(p.y);
    ctx.fillStyle = t.bg; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = t.accent; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill();
  });
  const last = points[points.length - 1];
  ctx.font = "10px " + t.font; ctx.textAlign = "right"; ctx.fillStyle = t.text;
  ctx.fillText(fmt(last.y), W - pad.right, Math.max(pad.top + 10, yOf(last.y) - 8));
  const step = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(plotW / 52))));
  points.forEach((p, i) => { if (i % step === 0 || i === points.length - 1) xLabel(ctx, t, p.x, xOf(i), H - pad.bottom + 15, 50); });
}

function drawStatsGraph(canvas, stats) {
  const entries = Object.entries(stats.questionsByDate || {}).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length < 2) return emptyChart(canvas, "Play on 2+ days to see your points trend");
  let cum = 0;
  const points = entries.map(([date, d]) => { cum += d.points; const dt = new Date(date + "T00:00:00"); return { x: (dt.getMonth() + 1) + "/" + dt.getDate(), y: cum }; });
  lineChart(canvas, points, { title: "Cumulative Points Over Time", fmt: (v) => String(Math.round(v)) });
}
function drawDiffAccuracy(canvas, stats) {
  const t = chartTheme();
  const bars = Object.keys(stats.byDifficulty || {}).sort((a, b) => a - b).map((k) => { const d = stats.byDifficulty[k]; return d.tossupsAttempted > 0 ? { label: k, value: (d.tossupsCorrect / d.tossupsAttempted) * 100, color: t.green } : null; }).filter(Boolean);
  barChart(canvas, bars, { title: "Tossup Accuracy by Difficulty", fmt: (v) => Math.round(v) + "%", yMax: 100, empty: "No tossup data yet" });
}
function drawDiffCelerity(canvas, stats) {
  const t = chartTheme();
  const all = ["power", "early", "mid", "late", "end"].reduce((acc, z) => acc.concat(stats.celerityDistribution?.[z] || []), []);
  const byD = {}; all.forEach((e) => { (byD[e.difficulty] = byD[e.difficulty] || []).push(e.celerity || 0); });
  const bars = Object.keys(byD).sort((a, b) => a - b).map((k) => ({ label: k, value: (byD[k].reduce((s, x) => s + x, 0) / byD[k].length) * 100, color: t.accent }));
  barChart(canvas, bars, { title: "Avg Celerity by Difficulty", fmt: (v) => Math.round(v) + "%", yMax: 100, empty: "No celerity data yet" });
}
function drawDiffBonus(canvas, stats) {
  const t = chartTheme();
  const bars = Object.keys(stats.byDifficulty || {}).sort((a, b) => a - b).map((k) => { const d = stats.byDifficulty[k]; return d.bonusesAttempted > 0 ? { label: k, value: d.bonusPoints / d.bonusesAttempted, color: t.yellow } : null; }).filter(Boolean);
  barChart(canvas, bars, { title: "Bonus Conversion by Difficulty", fmt: (v) => v.toFixed(1), yMax: 30, empty: "No bonus data yet" });
}

function populateGraphFilters(stats) {
  const catSel = document.getElementById("graph-filter-cat");
  const diffSel = document.getElementById("graph-filter-diff");

  if (catSel && catSel.options.length <= 1) fillCategoryDropdown(catSel);
  if (diffSel && diffSel.options.length <= 1) {
    for (let d = 1; d <= 10; d++) { const o = document.createElement("option"); o.value = String(d); o.textContent = "Diff " + d; diffSel.appendChild(o); }
  }

  if (catSel) catSel.onchange = () => redrawFilteredGraphs();
  if (diffSel) diffSel.onchange = () => redrawFilteredGraphs();
}

let _breakdownCache = null;
async function redrawFilteredGraphs(breakdown) {
  const cat = document.getElementById("graph-filter-cat")?.value || "";
  const diff = document.getElementById("graph-filter-diff")?.value || "";

  let bd;
  if (breakdown) { _breakdownCache = breakdown; bd = breakdown; }
  else {
    try {
      const params = (cat ? "category=" + encodeURIComponent(cat) : "") + (diff ? (cat ? "&" : "") + "difficulty=" + encodeURIComponent(diff) : "");
      const res = await API.get("/api/sessions/breakdown" + (params ? "?" + params : ""));
      bd = res.breakdown || [];
    } catch { bd = _breakdownCache || []; }
  }

  const cOutcomes = document.getElementById("graph-session-outcomes");
  const cPpg = document.getElementById("graph-ppg");
  const cRates = document.getElementById("graph-rates");
  const cCel = document.getElementById("graph-celerity-detail");

  if (cOutcomes) drawSessionOutcomes(cOutcomes, bd, cat, diff);
  if (cPpg) drawPointsPerTU(cPpg, bd, cat, diff);
  if (cRates) drawRatesGraph(cRates, bd, cat, diff);
  if (cCel) drawCelerityDetail(cCel, bd, cat, diff);
}

function drawSessionOutcomes(canvas, breakdown) {
  const t = chartTheme();
  const recent = (breakdown || []).slice(-12);
  const groups = recent.map((s) => ({ label: shortDate(s.startedAt), segments: [ { value: s.powers, color: t.accent }, { value: s.tens, color: t.green }, { value: s.deads, color: t.muted }, { value: s.negs, color: t.red } ] }));
  stackedChart(canvas, groups, { title: "Outcomes per Session", empty: "No sessions yet", legend: [ { label: "Power", color: t.accent }, { label: "+10", color: t.green }, { label: "Dead", color: t.muted }, { label: "Neg", color: t.red } ] });
}
function drawPointsPerTU(canvas, breakdown) {
  const t = chartTheme();
  const recent = (breakdown || []).filter((s) => s.totalTU > 0).slice(-12);
  const bars = recent.map((s) => ({ label: shortDate(s.startedAt), value: Math.round(s.pointsPerTU * 10) / 10, color: s.pointsPerTU >= 0 ? t.green : t.red }));
  barChart(canvas, bars, { title: "Points per Tossup (by session)", fmt: (v) => v.toFixed(1), empty: "No tossup sessions yet" });
}
function drawRatesGraph(canvas, breakdown) {
  const t = chartTheme();
  const recent = (breakdown || []).filter((s) => s.totalTU > 0).slice(-12);
  const groups = recent.map((s) => ({ label: shortDate(s.startedAt), segments: [ { value: Math.round(s.powerRate * 100), color: t.accent }, { value: Math.round(s.negRate * 100), color: t.red } ] }));
  stackedChart(canvas, groups, { title: "Power vs Neg Rate (by session)", yMax: 100, empty: "No tossup sessions yet", legend: [ { label: "Power %", color: t.accent }, { label: "Neg %", color: t.red } ] });
}
function drawCelerityDetail(canvas, breakdown) {
  const recent = (breakdown || []).filter((s) => s.totalTU > 0).slice(-15);
  const points = recent.map((s) => ({ x: shortDate(s.startedAt), y: Math.round((s.avgCorrectCelerity || 0) * 100) }));
  lineChart(canvas, points, { title: "Avg Buzz Celerity per Session", fmt: (v) => v + "%", empty: "No tossup sessions yet" });
}

async function exportStatsImage() {
  let stats;
  try {
    const sid = state.statsSessionId || null;
    stats = (await API.get("/api/stats" + (sid ? "?sessionId=" + encodeURIComponent(sid) : ""))).stats;
  } catch { return; }
  if (!stats || !stats.totalQuestions) { window.QB?.toast?.("No stats to export yet", "error"); return; }
  const t = chartTheme();
  const W = 760, H = 540, dpr = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = t.bg || "#0d1117"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = t.accent; ctx.font = "700 22px " + t.font;
  ctx.fillText("OFFLINEQUIZ \u2014 STATISTICS", 32, 48);
  ctx.fillStyle = t.muted; ctx.font = "12px " + t.font;
  const sub = (state.username ? state.username + " \u00b7 " : "") +
    (state.statsSessionId ? "session " + formatSessionTitle(state.statsSessionId) : "all time") +
    " \u00b7 " + new Date().toLocaleDateString();
  ctx.fillText(sub, 32, 70);
  const cards = [
    ["Questions", String(stats.totalQuestions)],
    ["Total points", String(stats.totalPoints)],
    ["Pts / question", (stats.averagePointsPerQuestion || 0).toFixed(1)],
    ["TU accuracy", ((stats.tossupAccuracy || 0) * 100).toFixed(1) + "%"],
    ["Powers", String(stats.tossupPowers || 0)],
    ["PPB", (stats.bonusConversion || 0).toFixed(1)],
  ];
  const cw = (W - 64 - 5 * 12) / 6;
  cards.forEach(([label, val], i) => {
    const x = 32 + i * (cw + 12);
    ctx.fillStyle = t.border; ctx.globalAlpha = 0.25;
    rrect(ctx, x, 92, cw, 74, 8); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = t.text; ctx.font = "700 20px " + t.font; ctx.textAlign = "center";
    ctx.fillText(val, x + cw / 2, 128);
    ctx.fillStyle = t.muted; ctx.font = "10px " + t.font;
    ctx.fillText(label.toUpperCase(), x + cw / 2, 150);
    ctx.textAlign = "left";
  });
  const cats = Object.values(stats.byCategory || {})
    .sort((a, b) => b.totalQuestions - a.totalQuestions).slice(0, 8);
  ctx.fillStyle = t.sec; ctx.font = "600 12px " + t.font;
  ctx.fillText("BY CATEGORY", 32, 204);
  const maxQ = Math.max(...cats.map((c) => c.totalQuestions), 1);
  cats.forEach((c, i) => {
    const y = 224 + i * 36;
    ctx.fillStyle = t.text; ctx.font = "12px " + t.font;
    ctx.fillText(c.category, 32, y + 13);
    ctx.fillStyle = t.border; ctx.globalAlpha = 0.3;
    rrect(ctx, 200, y, 420, 18, 5); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = t.accent;
    rrect(ctx, 200, y, Math.max(8, (c.totalQuestions / maxQ) * 420), 18, 5); ctx.fill();
    ctx.fillStyle = t.muted; ctx.font = "11px " + t.font;
    ctx.fillText(`${c.totalQuestions} q \u00b7 ${c.totalPoints} pts`, 632, y + 13);
  });
  ctx.fillStyle = t.muted; ctx.font = "10px " + t.font;
  ctx.fillText("made with OfflineQuiz", 32, H - 18);
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offlinequiz-stats-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
$("#btn-stats-export")?.addEventListener("click", exportStatsImage);


let _statsPeriod = "all";
function statsSinceMs() {
  const p = _statsPeriod;
  if (p === "today") { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  const days = parseInt(p);
  return days > 0 ? Date.now() - days * 86400000 : 0;
}
function statsPeriodLabel() {
  return { all: "All time", today: "Today", "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" }[_statsPeriod] || "All time";
}
function syncStatsControls(sid) {
  const per = document.getElementById("stats-period");
  if (per && per.value !== _statsPeriod) per.value = _statsPeriod;
  if (per) per.style.display = sid ? "none" : "";
  const cat = document.getElementById("stats-cat-filter");
  if (cat) cat.style.display = sid ? "none" : "";
}
function qhDetailHtml(q, type) {
  if (type === "bonus") {
    let answers = [], raws = [], parts = [];
    try { answers = JSON.parse(q.answers_sanitized || "[]"); } catch (e) {}
    try { raws = JSON.parse(q.answers || "[]"); } catch (e) {}
    try { parts = JSON.parse(q.parts_sanitized || "[]"); } catch (e) {}
    return '<div class="qh-qtext">' + escapeHtml(q.leadin_sanitized || "") + "</div>" +
      parts.map((p, k) => '<div class="qh-part">[10] ' + escapeHtml(p) + '<br><span class="qh-ans">ANSWER: ' + answerLineHtml(raws[k], answers[k] || "") + "</span></div>").join("");
  }
  return '<div class="qh-qtext">' + escapeHtml(q.question_sanitized || "") + "</div>" +
    '<div class="qh-ans">Answer: ' + answerLineHtml(q.answer, q.answer_sanitized || "") + "</div>";
}
async function loadStats(preserveScroll = false) {
  const screen = document.getElementById("stats-screen");
  const keepScroll = preserveScroll && screen ? screen.scrollTop : 0;
  const container = $("#stats-container");
  if (!preserveScroll) container.innerHTML = '<div class="text-muted">Loading stats...</div>';

  const sid = state.statsSessionId || null;
  const since = sid ? 0 : statsSinceMs();
  try {
    const data = await API.get("/api/stats" + (sid ? "?sessionId=" + encodeURIComponent(sid) : (since ? "?since=" + since : "")));
    const stats = data.stats;

    syncStatsControls(sid);
    if (!stats || stats.totalQuestions === 0) {
      container.innerHTML = `
        ${sid ? '<button class="btn btn-sm btn-ghost" id="stats-back">\u2190 All sessions</button>' : ""}
        <div style="text-align:center;padding:40px;color:var(--text-muted)">
          <div style="font-size:48px;margin-bottom:16px"><svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.4-1.3 1-1.3 1.8v.3"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg></div>
          <p>${sid ? "This session has no recorded questions." : (_statsPeriod !== "all" ? "No questions in " + escapeHtml(statsPeriodLabel().toLowerCase()) + " \u2014 try a wider period." : "No statistics yet. Start a practice session to see your performance data.")}</p>
        </div>
      `;
      document.getElementById("stats-back")?.addEventListener("click", () => { state.statsSessionId = null; loadStats(); });
      return;
    }

    const sessions = await API.get("/api/sessions");
    const sessionList = sessions.sessions || [];

    let sessionEntries = [];
    if (sid) { try { sessionEntries = (await API.get("/api/sessions/entries?sessionId=" + encodeURIComponent(sid))).entries || []; } catch (e) {} }

    const catFilter = $("#stats-cat-filter");
    if (catFilter && catFilter.options.length <= 1) await fillCategoryDropdown(catFilter);

    const selectedCat = catFilter?.value || "";
    const catData = selectedCat ? stats.byCategory[selectedCat] : null;
    const view = catData ? {
      totalQuestions: catData.totalQuestions,
      totalPoints: catData.totalPoints,
      averagePointsPerQuestion: catData.totalQuestions ? catData.totalPoints / catData.totalQuestions : 0,
      tossupAccuracy: catData.tossupsAttempted ? catData.tossupsCorrect / catData.tossupsAttempted : 0,
      bonusConversion: catData.bonusesAttempted ? catData.bonusPoints / catData.bonusesAttempted : 0,
      powerRate: catData.tossupsAttempted ? (catData.tossupPowers || 0) / catData.tossupsAttempted : 0,
      tossupsAttempted: catData.tossupsAttempted,
      tossupsCorrect: catData.tossupsCorrect || 0,
      tossupPowers: catData.tossupPowers || 0,
      tossupNegs: catData.tossupNegs || 0,
      tossupAvgCelerity: catData.celerityCount ? catData.celeritySum / catData.celerityCount : 0,
      bonusesAttempted: catData.bonusesAttempted,
      bonusPartsCorrect: catData.bonusPartsCorrect || 0,
      bonusPartsTotal: (catData.bonusesAttempted || 0) * 3,
    } : stats;

    let html = "";

    if (sid) {
      html += `<div class="stats-session-head">
        <button class="btn btn-sm btn-ghost" id="stats-back">\u2190 All sessions</button>
        <span class="stats-session-name">SESSION ${escapeHtml(formatSessionTitle(sid))}</span>
      </div>`;
    }

    html += `<div class="stats-section">
      <div class="stats-section-title">OVERVIEW${selectedCat ? " — " + escapeHtml(selectedCat) : ""}</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-value">${view.totalQuestions}</div>
          <div class="stat-card-label">Questions</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${view.totalPoints}</div>
          <div class="stat-card-label">Total Points</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${view.averagePointsPerQuestion.toFixed(1)}</div>
          <div class="stat-card-label">Avg Pts/Q</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${(view.tossupAccuracy * 100).toFixed(1)}%</div>
          <div class="stat-card-label">Tossup Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${view.bonusConversion.toFixed(1)}</div>
          <div class="stat-card-label">Bonus Conv</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${(view.powerRate * 100).toFixed(1)}%</div>
          <div class="stat-card-label">Power Rate</div>
        </div>
      </div>
    </div>`;

    if (!sid) {
      html += `<div class="stats-section">
        <div class="stats-section-title">GRAPH</div>
        <canvas id="stats-graph" class="chart-canvas" width="700" height="300" style="width:100%;max-width:760px"></canvas>
      </div>`;
    }

    html += `<div class="stats-section">
      <div class="stats-section-title">TOSSUPS: ${view.tossupsAttempted}</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-value" style="color:var(--green)">${view.tossupPowers}</div>
          <div class="stat-card-label">Powers (15)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${Math.max(0, (view.tossupsCorrect || 0) - view.tossupPowers)}</div>
          <div class="stat-card-label">Correct (10)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="color:var(--red)">${view.tossupNegs}</div>
          <div class="stat-card-label">Negs (-5)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${(view.tossupAvgCelerity * 100).toFixed(1)}%</div>
          <div class="stat-card-label">Avg Celerity</div>
        </div>
      </div>
    </div>`;

    if (view.bonusesAttempted > 0) {
      html += `<div class="stats-section">
        <div class="stats-section-title">BONUSES: ${view.bonusesAttempted}</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-value">${view.bonusPartsCorrect}/${view.bonusPartsTotal}</div>
            <div class="stat-card-label">Parts Correct</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value">${view.bonusConversion.toFixed(1)}</div>
            <div class="stat-card-label">Points/Bonus</div>
          </div>
        </div>
      </div>`;
    }

    const categoryData = Object.values(stats.byCategory || {})
      .filter((c) => c.totalQuestions > 0)
      .sort((a, b) => (b.totalPoints / b.totalQuestions) - (a.totalPoints / a.totalQuestions));
    if (categoryData.length > 0) {
      html += `<div class="stats-section">
        <div class="stats-section-title">BY CATEGORY</div>
        <table class="stats-table">
          <thead><tr>
            <th>Category</th><th>Q's</th><th>Pts</th><th>Pts/Q</th>
          </tr></thead>
          <tbody>
            ${categoryData
              .map(
                (c) => `
              <tr>
                <td>${escapeHtml(c.category)}</td>
                <td>${c.totalQuestions}</td>
                <td>${c.totalPoints}</td>
                <td>
                  <div class="stats-bar">
                    <div class="stats-bar-fill" style="width:${Math.max(2, Math.min(100, ((c.totalPoints / c.totalQuestions) + 5) / 20 * 100))}%"></div>
                    <span class="stats-bar-label">${(c.totalPoints / c.totalQuestions).toFixed(1)}</span>
                  </div>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    }

    if (sid && sessionEntries.length) {
      const rowsHtml = sessionEntries.map((en, i) => {
        const isBonus = en.type === "bonus";
        let cls = "qh-miss", label = "MISS";
        if (isBonus) { cls = en.points >= 20 ? "qh-correct" : en.points > 0 ? "qh-partial" : "qh-miss"; label = (en.bonus_parts_correct != null ? en.bonus_parts_correct : 0) + "/3"; }
        else if (en.points >= 15) { cls = "qh-power"; label = "POWER"; }
        else if (en.correct) { cls = "qh-correct"; label = "CORRECT"; }
        else if (en.points < 0) { cls = "qh-neg"; label = "NEG"; }
        const cel = Math.max(0, Math.min(1, en.celerity == null ? 1 : en.celerity));
        const buzzBar = isBonus ? "" :
          '<div class="qh-buzzbar" title="Buzzed ' + Math.round(cel * 100) + '% into the question">' +
            '<div class="qh-buzzmark" style="left:' + (cel * 100).toFixed(1) + '%"></div></div>';
        const ans = en.given_answer ? escapeHtml(en.given_answer) : '<span class="text-muted">(no answer)</span>';
        return '<tr class="qh-row" data-qh="' + i + '" data-qid="' + escapeHtml(en.question_id || "") + '" data-qtype="' + (en.type || "tossup") + '" style="cursor:pointer" title="Show the question & answer">' +
          '<td><span class="qh-chev">▸</span> <span class="qh-badge ' + cls + '">' + label + "</span></td>" +
          "<td>" + escapeHtml(en.category || "") + (en.difficulty != null ? ' <span class="text-muted">d' + en.difficulty + "</span>" : "") + "</td>" +
          "<td>" + ans + "</td>" +
          "<td>" + buzzBar + "</td>" +
          '<td style="text-align:right">' + (en.points > 0 ? "+" : "") + en.points + "</td>" +
        "</tr>" +
        '<tr class="qh-detail hidden" data-qhd="' + i + '"><td colspan="5"><div class="text-muted">Loading…</div></td></tr>';
      }).join("");
      html += '<div class="stats-section">' +
        '<div class="stats-section-title">QUESTION HISTORY (' + sessionEntries.length + ")</div>" +
        '<table class="stats-table qh-table"><thead><tr><th>Result</th><th>Category</th><th>Your answer</th><th>Buzz location</th><th>Pts</th></tr></thead><tbody>' +
        rowsHtml + "</tbody></table></div>";
    }

    const celDist = stats.celerityDistribution || {};
    const celTotal =
      (celDist.power?.length || 0) +
      (celDist.early?.length || 0) +
      (celDist.mid?.length || 0) +
      (celDist.late?.length || 0) +
      (celDist.end?.length || 0);
    if (celTotal > 0) {
      html += `<div class="stats-section">
        <div class="stats-section-title">CELERITY DISTRIBUTION</div>
        <table class="stats-table">
          <thead><tr>
            <th>Zone</th><th>Count</th><th>Distribution</th>
          </tr></thead>
          <tbody>
            ${[
              { label: "Power (0-20%)", data: celDist.power || [], color: "var(--accent)" },
              { label: "Early (20-40%)", data: celDist.early || [], color: "var(--green)" },
              { label: "Mid (40-60%)", data: celDist.mid || [], color: "var(--yellow)" },
              { label: "Late (60-80%)", data: celDist.late || [], color: "var(--yellow)" },
              { label: "End (80-100%)", data: celDist.end || [], color: "var(--red)" },
            ]
              .map(
                (zone) => `
              <tr>
                <td>${zone.label}</td>
                <td>${zone.data.length}</td>
                <td>
                  <div class="stats-bar">
                    <div class="stats-bar-fill" style="width:${Math.max(2, (zone.data.length / celTotal) * 100)}%;background:${zone.color}"></div>
                  </div>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    }

    if (!sid && sessionList.length > 0) {
      html += `<div class="stats-section">
        <div class="stats-section-title">SESSIONS (${sessionList.length})</div>
        <table class="stats-table">
          <thead><tr>
            <th>Session</th><th>Questions</th><th>Points</th><th>Started</th><th></th>
          </tr></thead>
          <tbody>
            ${sessionList
              .slice(0, 50)
              .map((s) => {
                const outOfPeriod = since && (s.ended_at || s.started_at || 0) < since;
                const sCats = (s.categories || "").split(",").map((c) => c.trim()).filter(Boolean);
                const outOfCat = selectedCat && !sCats.includes(selectedCat);
                const faint = outOfPeriod || outOfCat;
                return `
              <tr class="session-row${faint ? " session-faint" : ""}" data-session="${escapeHtml(s.session_id)}" title="${faint ? "Outside the current filter — click to open anyway" : "View this session's stats"}">
                <td>${formatSessionTitle(s.session_id)}</td>
                <td>${s.question_count}</td>
                <td>${s.total_points}</td>
                <td>${new Date(s.started_at).toLocaleString()}</td>
                <td><button class="btn btn-sm btn-ghost session-delete" data-session="${escapeHtml(s.session_id)}" title="Delete session">&times;</button></td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
    }

    const diffKeys = Object.keys(stats.byDifficulty || {}).sort((a,b) => parseInt(a) - parseInt(b));
    if (diffKeys.length >= 2) {
      html += `<div class="stats-section">
        <div class="stats-section-title">BY DIFFICULTY</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <canvas id="graph-diff-accuracy" class="chart-canvas" width="420" height="260" style="flex:1;min-width:340px;max-width:520px"></canvas>
          <canvas id="graph-diff-celerity" class="chart-canvas" width="420" height="260" style="flex:1;min-width:340px;max-width:520px"></canvas>
          <canvas id="graph-diff-bonus" class="chart-canvas" width="420" height="260" style="flex:1;min-width:340px;max-width:520px"></canvas>
        </div>
      </div>`;
    }

    if (!sid) html += `<div class="stats-section">
      <div class="stats-section-title">SESSION BREAKDOWN
        <select id="graph-filter-cat" style="margin-left:12px;font-family:var(--font);font-size:10px;padding:1px 6px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:3px;color:var(--text)">
          <option value="">All categories</option>
        </select>
        <select id="graph-filter-diff" style="margin-left:4px;font-family:var(--font);font-size:10px;padding:1px 6px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:3px;color:var(--text)">
          <option value="">All Difficulties</option>
        </select>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <canvas id="graph-session-outcomes" class="chart-canvas" width="800" height="400" style="flex:1;min-width:480px;max-width:880px"></canvas>
        <canvas id="graph-ppg" class="chart-canvas" width="700" height="400" style="flex:1;min-width:480px;max-width:880px"></canvas>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px">
        <canvas id="graph-rates" class="chart-canvas" width="800" height="360" style="flex:1;min-width:480px;max-width:880px"></canvas>
        <canvas id="graph-celerity-detail" class="chart-canvas" width="700" height="360" style="flex:1;min-width:480px;max-width:880px"></canvas>
      </div>
    </div>`;

    let breakdown = [];
    if (!sid) {
      try {
        const bd = await API.get("/api/sessions/breakdown");
        breakdown = bd.breakdown || [];
      } catch {}
    }

    container.innerHTML = html;

    if (!sid) {
      for (const prov of (window.QB?.getStatsProviders?.() || [])) {
        const sec = document.createElement("div");
        sec.className = "stats-section";
        sec.innerHTML = `<div class="stats-section-title">${escapeHtml(prov.title.toUpperCase())}</div>`;
        const bodyEl = document.createElement("div");
        sec.appendChild(bodyEl);
        container.appendChild(sec);
        try { await prov.render(bodyEl); } catch { bodyEl.innerHTML = '<div class="text-muted" style="font-size:12px">Failed to load.</div>'; }
      }
    }

    if (preserveScroll && screen) { screen.scrollTop = keepScroll; requestAnimationFrame(() => { screen.scrollTop = keepScroll; }); }

    document.getElementById("stats-back")?.addEventListener("click", () => { state.statsSessionId = null; loadStats(); });

    container.querySelectorAll(".qh-row").forEach((row) => {
      row.addEventListener("click", async () => {
        const d = container.querySelector('[data-qhd="' + row.dataset.qh + '"]');
        if (!d) return;
        d.classList.toggle("hidden");
        const chev = row.querySelector(".qh-chev"); if (chev) chev.textContent = d.classList.contains("hidden") ? "▸" : "▾";
        if (d.classList.contains("hidden") || d.dataset.loaded) return;
        d.dataset.loaded = "1";
        const qid = row.dataset.qid, qtype = row.dataset.qtype;
        const cell = d.querySelector("td");
        if (!qid) { cell.innerHTML = '<div class="text-muted">Question id not recorded.</div>'; return; }
        try {
          const dd = await API.get("/api/" + (qtype === "bonus" ? "bonuses" : "tossups") + "/" + encodeURIComponent(qid));
          const q = dd.tossup || dd.bonus;
          cell.innerHTML = q ? qhDetailHtml(q, qtype) : '<div class="text-muted">Question not found in the database.</div>';
          if (qtype !== "bonus" && q) {
            const bar = row.querySelector(".qh-buzzbar");
            const raw = q.question_sanitized || "";
            const pi = raw.indexOf("(*)");
            if (bar && pi >= 0 && !bar.querySelector(".qh-powermark")) {
              const len = raw.replace(/\(\*\)/g, "").length || 1;
              const frac = Math.max(0, Math.min(1, pi / len));
              const pm = document.createElement("div");
              pm.className = "qh-powermark";
              pm.style.left = (frac * 100).toFixed(1) + "%";
              pm.title = "Power mark";
              bar.appendChild(pm);
            }
          }
        } catch (e) { cell.innerHTML = '<div class="text-muted">Failed to load.</div>'; }
      });
    });

    container.querySelectorAll(".session-row").forEach((row) => {
      row.addEventListener("click", (ev) => {
        if (ev.target.closest(".session-delete")) return;
        if (!row.dataset.session) return;
        state.statsSessionId = row.dataset.session;
        loadStats();
      });
    });

    container.querySelectorAll(".session-delete").forEach((b) => {
      b.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const id = b.dataset.session;
        if (!id) return;
        try { await API.delete("/api/sessions/" + encodeURIComponent(id)); } catch (e) {}
        loadStats(true);
      });
    });

    populateGraphFilters(stats);

    setTimeout(() => {
      const canvas = document.getElementById("stats-graph");
      if (canvas) drawStatsGraph(canvas, stats);
      const c1 = document.getElementById("graph-diff-accuracy");
      const c2 = document.getElementById("graph-diff-celerity");
      const c3 = document.getElementById("graph-diff-bonus");
      if (c1) drawDiffAccuracy(c1, stats);
      if (c2) drawDiffCelerity(c2, stats);
      if (c3) drawDiffBonus(c3, stats);
      redrawFilteredGraphs(breakdown);
    }, 100);
  } catch (e) {
    container.innerHTML = `<div class="text-muted">Failed to load stats: ${e.message}</div>`;
  }
}




$("#speed-slider").addEventListener("input", (e) => setRevealSpeed(parseInt(e.target.value)));

$("#auto-reveal").addEventListener("change", (e) => {
  state.settings.autoReveal = e.target.checked;
  lsSet("qb-auto-reveal", e.target.checked.toString());
});

$("#buzz-timeout-slider")?.addEventListener("input", (e) => setBuzzTimer(parseInt(e.target.value)));

function setHidePron(on) {
  state.settings.hidePronunciations = on;
  lsSet("qb-hide-pron", on.toString());
  const a = $("#opt-hide-pron"); if (a) a.checked = on;
  const b = $("#filter-hide-pron"); if (b) b.checked = on;
}
$("#opt-hide-pron")?.addEventListener("change", (e) => setHidePron(e.target.checked));
$("#opt-bonus-after")?.addEventListener("change", (e) => { state.settings.bonusAfter = e.target.checked; lsSet("qb-bonus-after", e.target.checked.toString()); });
$("#opt-review-negs")?.addEventListener("change", (e) => { state.settings.reviewNegs = e.target.checked; lsSet("qb-review-negs", e.target.checked.toString()); refreshReviewBadge(); });
$("#opt-review-unans")?.addEventListener("change", (e) => { state.settings.reviewUnans = e.target.checked; lsSet("qb-review-unans", e.target.checked.toString()); refreshReviewBadge(); });
$("#opt-review-wrongend")?.addEventListener("change", (e) => { state.settings.reviewWrongEnd = e.target.checked; lsSet("qb-review-wrongend", e.target.checked.toString()); refreshReviewBadge(); });
$("#opt-review-nopower")?.addEventListener("change", (e) => { state.settings.autoReviewNoPower = e.target.checked; lsSet("qb-review-nopower", e.target.checked.toString()); });
$("#opt-review-skipnomark")?.addEventListener("change", (e) => { state.settings.autoReviewSkipNoMark = e.target.checked; lsSet("qb-review-skipnomark", e.target.checked.toString()); });
$("#filter-hide-pron")?.addEventListener("change", (e) => setHidePron(e.target.checked));
{ const b = $("#filter-hide-pron"); if (b) b.checked = state.settings.hidePronunciations; }

$("#opt-show-qmeta")?.addEventListener("change", (e) => {
  state.settings.showQuestionMeta = e.target.checked;
  lsSet("qb-show-qmeta", e.target.checked.toString());
  $("#question-meta")?.classList.toggle("hidden", !e.target.checked);
});

function initSettings() {
  syncAppUpdateUI();
  const speedSlider = $("#speed-slider");
  const autoReveal = $("#auto-reveal");

  if (speedSlider) {
    speedSlider.value = state.settings.revealSpeed;
    $("#speed-slider-label").textContent = state.settings.revealSpeed === 0 ? "instant" : `${state.settings.revealSpeed}ms`;
  }
  const panelSpeed = $("#panel-speed-slider");
  if (panelSpeed) {
    panelSpeed.value = state.settings.revealSpeed;
    const pl = $("#panel-speed-label"); if (pl) pl.textContent = state.settings.revealSpeed === 0 ? "instant" : `${state.settings.revealSpeed}ms`;
  }
  if (autoReveal) autoReveal.checked = state.settings.autoReveal;
  const qmeta = $("#opt-show-qmeta");
  if (qmeta) qmeta.checked = state.settings.showQuestionMeta;
  const hpron = $("#opt-hide-pron");
  if (hpron) hpron.checked = state.settings.hidePronunciations;
  const fpron = $("#filter-hide-pron");
  if (fpron) fpron.checked = state.settings.hidePronunciations;
  const ba = $("#opt-bonus-after"); if (ba) ba.checked = state.settings.bonusAfter;
  const rn = $("#opt-review-negs"); if (rn) rn.checked = state.settings.reviewNegs;
  const ru = $("#opt-review-unans"); if (ru) ru.checked = state.settings.reviewUnans;
  const rwe = $("#opt-review-wrongend"); if (rwe) rwe.checked = state.settings.reviewWrongEnd;
  const rnp = $("#opt-review-nopower"); if (rnp) rnp.checked = state.settings.autoReviewNoPower;
  const rsm = $("#opt-review-skipnomark"); if (rsm) rsm.checked = state.settings.autoReviewSkipNoMark;
  const aAcc = $("#app-accent"); if (aAcc) aAcc.value = state.settings.appAccent;
  const aMode = $("#app-mode"); if (aMode) aMode.value = state.settings.appAppearanceMode;
  const aCust = $("#app-custom-accent"); if (aCust) aCust.value = /^#[0-9a-fA-F]{6}$/.test(state.settings.appCustomAccent || "") ? state.settings.appCustomAccent : "#dfb347";
  const aFont = $("#app-font"); if (aFont) aFont.value = state.settings.appFont;
  const aRad = $("#app-radius"); if (aRad) aRad.value = state.settings.appRadius;
  const aGap = $("#app-btngap"); if (aGap) aGap.value = state.settings.appBtnGap;
  const sret = $("#session-retention"); if (sret) sret.value = String(state.settings.sessionRetentionDays || 0);
  applyDefaultAppearance();
  const buzzSlider = $("#buzz-timeout-slider");
  if (buzzSlider) {
    buzzSlider.value = state.settings.buzzTimeout;
    $("#buzz-timeout-label").textContent = state.settings.buzzTimeout === 0 ? "off" : `${state.settings.buzzTimeout}s`;
  }

  renderHotkeySettings();
  window.QB?.renderAppearanceSettings(document.getElementById("theme-appearance-host"));
  window.QB?.renderSettingsSections(document.getElementById("ext-settings-host"));
  loadSettingsArt();
}

function activeThemeArt() {
  try { return (window.QB && window.QB._activeThemeArt) || null; } catch (e) { return null; }
}

async function loadSettingsArt() {
  const container = document.getElementById("settings-art-content");
  if (!container) return;
  const ta = activeThemeArt();
  if (ta && ta.image) { container.innerHTML = '<img class="theme-art-img" src="' + escapeHtml(ta.image) + '" alt="">'; return; }
  if (ta && ta.text) { renderArtToFit(container, ta.text); return; }
  const artFiles = ["reflection", "trio", "chernobyl", "legion", "wave"];
  let selectedArt = localStorage.getItem("qb-art") || "reflection";
  if (selectedArt === "random") selectedArt = artFiles[Math.floor(Math.random() * artFiles.length)];
  const text = getArt(selectedArt);
  if (!text) { container.textContent = ""; return; }
  renderArtToFit(container, text);
}

async function loadTitleArt() {
  const container = document.getElementById("title-art");
  if (!container) return;
  const screen = document.getElementById("title-screen");
  const artFiles = ["reflection", "trio", "chernobyl", "legion", "wave"];
  const ta = activeThemeArt();
  let selectedArt = localStorage.getItem("qb-art") || "reflection";
  if (selectedArt === "random") selectedArt = artFiles[Math.floor(Math.random() * artFiles.length)];
  const themeImg = ta && ta.image ? ta.image : null;
  const text = ta && ta.text ? ta.text : getArt(selectedArt);
  if (!themeImg && !text) { container.innerHTML = ""; return; }

  const isStacked = (ta && (ta.text || ta.image))
    ? ta.layout !== "sidebar"
    : (selectedArt === "trio" || selectedArt === "chernobyl" || selectedArt === "wave");
  const left = screen ? screen.querySelector(".title-left") : null;

  screen.classList.remove("stacked", "sidebar");
  screen.classList.add(isStacked ? "stacked" : "sidebar");

  if (isStacked) {
    if (left && container.parentElement !== left) {
      var spot = left.querySelector(".title-art-stacked-spot");
      if (spot) spot.after(container);
      else left.appendChild(container);
    }
  } else {
    if (screen && container.parentElement !== screen) {
      container.remove();
      screen.appendChild(container);
    }
  }

  if (themeImg) { container.innerHTML = '<img class="theme-art-img" src="' + escapeHtml(themeImg) + '" alt="">'; return; }
  renderArtToFit(container, text);
}

function getArtDimensions(artText) {
  const lines = artText.split("\n");
  const maxCols = Math.max(...lines.map(l => l.length), 1);
  const numLines = lines.length || 1;
  return { maxCols, numLines };
}

function renderArtToFit(container, artText, retries) {
  if (retries === undefined) retries = 0;
  var cw = container.clientWidth;
  var ch = container.clientHeight;

  if ((cw <= 0 || ch <= 0) && retries < 20) {
    requestAnimationFrame(function () { renderArtToFit(container, artText, retries + 1); });
    return;
  }
  if (cw <= 0 || ch <= 0) return;

  var _a = getArtDimensions(artText), maxCols = _a.maxCols, numLines = _a.numLines;
  var charAspect = 0.55;
  var containerPad = 32;
  var framePad = 20;
  var frameBorder = 2;
  var frameOverhead = (framePad + frameBorder) * 2;
  var targetW = cw - containerPad * 2 - frameOverhead;
  if (targetW < 80) targetW = cw - frameOverhead;
  if (targetW < 40) targetW = cw;

  var fontSize = Math.min(targetW / (charAspect * maxCols), 8);
  if (fontSize < 1.5) fontSize = 1.5;

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.overflow = "hidden";
  container.style.padding = containerPad + "px";
  container.style.background = "";
  container.style.border = "";

  var frame = document.createElement("div");
  frame.className = "art-frame";
  frame.style.cssText = [
    "border:" + frameBorder + "px solid var(--accent)",
    "border-radius:10px",
    "padding:" + framePad + "px",
    "background:var(--bg-secondary)",
    "box-shadow:0 0 24px var(--accent-dim)",
    "overflow:hidden",
    "max-width:100%",
    "max-height:100%",
    "flex-shrink:0",
  ].join(";");

  var pre = document.createElement("pre");
  pre.textContent = artText;
  pre.style.cssText = [
    "font-size:" + fontSize + "px",
    "line-height:1",
    "white-space:pre",
    "font-family:var(--font-mono)",
    "font-weight:700",
    "color:var(--accent)",
    "opacity:0.7",
    "margin:0",
    "overflow:hidden",
  ].join(";");

  frame.appendChild(pre);
  container.appendChild(frame);
}

$("#btn-update-db")?.addEventListener("click", checkForUpdatesUI);

$("#opt-app-autoupdate")?.addEventListener("change", (e) => lsSet("qb-app-autoupdate", e.target.checked.toString()));
$("#opt-app-critical-auto")?.addEventListener("change", (e) => lsSet("qb-app-critical-auto", e.target.checked.toString()));
function isNetworkErr(msg) {
  return /failed to fetch|fetch failed|network|err_|enotfound|getaddrinfo|timed ?out|econn|\bdns\b/i.test(String(msg || ""));
}
function friendlyUpdateErr(msg) {
  return isNetworkErr(msg)
    ? "Couldn't reach the update server. Check your internet connection and try again (some school/work networks block it)."
    : String(msg || "Unknown error");
}
// Download the already-confirmed update into `status`, showing progress and a
// restart button when done. Used by the Settings button AND the startup dialog.
async function downloadAppUpdate(status, barId) {
  status.innerHTML = progressBarHtml(barId, "Downloading update…");
  let unsub = null;
  if (window.qbreader?.onAppUpdateProgress) {
    unsub = window.qbreader.onAppUpdateProgress((p) => setProgress(barId, p && p.pct, "Downloading update…"));
  }
  try {
    let r;
    for (let attempt = 0; attempt < 3; attempt++) {
      r = await API.post("/api/app-update-check", {});
      if (!r || !r.error || !isNetworkErr(r.error) || attempt === 2) break;
      status.innerHTML = progressBarHtml(barId, "Network hiccup — retrying (" + (attempt + 2) + "/3)…");
      await new Promise((res) => setTimeout(res, 1500));
    }
    if (r && r.updated) {
      setProgress(barId, 100, "Update v" + r.version + " downloaded.");
      const restart = document.createElement("button");
      restart.className = "btn btn-sm btn-primary"; restart.style.marginTop = "8px";
      restart.textContent = "Restart now to apply";
      restart.onclick = () => { try { window.qbreader?.relaunchApp?.(); } catch {} };
      status.appendChild(restart);
      return true;
    }
    status.textContent = r && r.error ? "Update failed: " + friendlyUpdateErr(r.error) : "Nothing new to install.";
  } catch (e) { status.textContent = "Update failed: " + friendlyUpdateErr(e.message || e); }
  finally { if (unsub) unsub(); }
  return false;
}

$("#btn-app-update")?.addEventListener("click", async () => {
  const btn = $("#btn-app-update"), status = $("#app-update-status");
  if (!btn || !status) return;
  btn.disabled = true; btn.textContent = "Checking…";
  status.textContent = "Checking for updates…";
  try {
    const r = await peekAppUpdate();
    if (r.dev) status.textContent = "App updates only run in the packaged app.";
    else if (r.error) status.textContent = "Update check failed: " + friendlyUpdateErr(r.error);
    else if (!r.configured) status.textContent = "App updates aren't set up in this build.";
    else if (!r.available) status.textContent = "You're on the latest version (v" + (r.haveVersion || r.version || "?") + ").";
    else {
      // Checking never installs — a separate "Download update" button does.
      status.innerHTML = `<div style="margin-bottom:8px">Update available: <strong>v${escapeHtml(String(r.version))}</strong>${r.critical ? " (important)" : ""}</div>`;
      const install = document.createElement("button");
      install.className = "btn btn-sm btn-primary";
      install.textContent = "Download update";
      install.onclick = () => downloadAppUpdate(status, "app-upd");
      status.appendChild(install);
    }
  } catch (e) { status.textContent = "Update check failed: " + friendlyUpdateErr(e.message || e); }
  btn.disabled = false; btn.textContent = "Check for updates";
});

async function syncAppUpdateUI() {
  try {
    const info = await API.get("/api/app-update-info");
    const sec = $("#app-update-section"); if (!sec) return;
    if (info.dev) { sec.style.display = "none"; return; }
    const auto = $("#opt-app-autoupdate"); if (auto) auto.checked = localStorage.getItem("qb-app-autoupdate") !== "false";
    const crit = $("#opt-app-critical-auto"); if (crit) crit.checked = localStorage.getItem("qb-app-critical-auto") !== "false";
    const status = $("#app-update-status");
    if (status && !status.textContent) {
      status.textContent = info.configured
        ? "Current version: v" + (info.version || "0") + (info.active ? " (updated)" : " (bundled)")
        : "App updates aren't set up in this build.";
    }
  } catch {}
}

async function checkForUpdatesUI() {
  const status = $("#update-status");
  const btn = $("#btn-update-db");
  if (!status || !btn) return;

  btn.disabled = true;
  btn.textContent = "Checking…";
  status.innerHTML = "";

  try {
    const info = await API.get("/api/check-update");
    if (info.error) {
      status.textContent = isNetworkErr(info.error)
        ? friendlyUpdateErr(info.error)
        : "Question updates aren't configured for this build. (The app + plugins update via your GitHub repo; the question database updates separately.)";
    } else if (!info.configured) {
      status.textContent = "Online updates aren't set up in this build.";
    } else if (!info.available) {
      status.textContent = "Your question database is up to date.";
    } else {
      status.innerHTML = `<div style="margin-bottom:8px">Update available: <strong>${escapeHtml(info.latest.name)}</strong></div>`;
      const install = document.createElement("button");
      install.className = "btn btn-sm btn-primary";
      install.textContent = "Download & install";
      install.addEventListener("click", () => installUpdateUI(info.latest));
      status.appendChild(install);
    }
  } catch (e) {
    status.textContent = "Update check failed: " + friendlyUpdateErr(e.message || e);
  }

  btn.disabled = false;
  btn.textContent = "Check for Updates";
}

function progressBarHtml(id, label) {
  return `<div class="upd-bar-label" id="${id}-label">${escapeHtml(label || "Starting…")}</div>` +
    `<div class="upd-bar"><div class="upd-bar-fill" id="${id}-fill"></div></div>`;
}
function setProgress(id, pct, label) {
  const fill = document.getElementById(id + "-fill");
  if (fill && pct != null) fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
  const lab = document.getElementById(id + "-label");
  if (lab && label != null) lab.textContent = label;
}

async function installUpdateUI(latest) {
  const status = $("#update-status");
  if (!status) return;
  status.innerHTML = progressBarHtml("db-upd", "Starting…");
  const pt = () => document.getElementById("db-upd-label");

  let unsub = null;
  if (window.qbreader?.onUpdateProgress) {
    unsub = window.qbreader.onUpdateProgress((p) => {
      if (p && typeof p === "object") setProgress("db-upd", p.pct, p.label);
      else setProgress("db-upd", null, String(p));
    });
  }

  try {
    const res = await API.post("/api/apply-update", { folderId: latest.id }, 600000);
    if (res.error) throw new Error(res.error);
    const r = res.result || {};
    setProgress("db-upd", 100, `Updated to ${latest.name} — ${(r.tossups || 0).toLocaleString()} tossups, ${(r.bonuses || 0).toLocaleString()} bonuses.`);
    const el = pt();
    if (el) {
    }
    _allCategoryNames = null;
    state.subcategoryCache = {};
    initTitle();
  } catch (e) {
    const el = pt();
    if (el) el.textContent = "Update failed: " + e.message;
  } finally {
    if (unsub) unsub();
  }
}

function pluginHotkeyDefs() {
  return (window.QB && window.QB.getActiveHotkeys && window.QB.getActiveHotkeys()) || [];
}
function allHotkeyActions() {
  const base = Object.keys(DEFAULT_HOTKEYS).map((a) => ({ action: a, label: HOTKEY_LABELS[a] || a }));
  const pl = pluginHotkeyDefs().map((h) => ({ action: h.action, label: h.label, pluginId: h.pluginId }));
  return base.concat(pl);
}
const HOTKEY_SCOPES = {
  "buzz": "practice", "start-skip": "practice", "next-question": "practice",
  "end-session": "practice", "star-question": "practice", "pause-reveal": "practice",
  "mark-correct": "practice", "mark-incorrect": "practice",
  "home": "global",
  "nav-tossups": "title", "nav-bonuses": "title", "nav-stats": "title",
  "nav-starred": "title", "nav-settings": "title", "nav-player": "title",
  "nav-extensions": "title",
};
function hotkeyScope(action) {
  if (HOTKEY_SCOPES[action]) return HOTKEY_SCOPES[action];
  const i = action.indexOf(":");
  if (i > 0) return "plugin:" + action.slice(0, i);
  return "global";
}
function hotkeyScopeLabel(action) {
  const sc = hotkeyScope(action);
  if (sc === "practice") return "practice";
  if (sc === "title") return "title menu";
  if (sc.startsWith("plugin:")) return "plugin page";
  return "global";
}
function scopesOverlap(a, b) { return a === b || a === "global" || b === "global"; }

function bindingConflict(action, binding) {
  if (!binding || binding === "Not Set") return null;
  const myScope = hotkeyScope(action);
  for (const a of allHotkeyActions()) {
    if (a.action === action) continue;
    if (!scopesOverlap(myScope, hotkeyScope(a.action))) continue;
    if ((getHotkey(a.action) || "") === binding) return a;
  }
  return null;
}
function ensureAllPluginHotkeys() {
  pluginHotkeyDefs().forEach((h) => {
    const cur = state.settings.hotkeys[h.action];
    const def = h.default || "";
    if (cur === undefined) {
      state.settings.hotkeys[h.action] = (def && !bindingConflict(h.action, def)) ? def : "Not Set";
    } else if (cur === "Not Set" && def && !bindingConflict(h.action, def)) {
      state.settings.hotkeys[h.action] = def;
    }
  });
  lsSet("qb-hotkeys", JSON.stringify(state.settings.hotkeys));
}

function renderHotkeySettings() {
  const table = $("#hotkey-table");
  if (!table) return;
  ensureAllPluginHotkeys();
  const actions = allHotkeyActions();

  let html = '<table class="stats-table"><thead><tr><th>Action</th><th>Where</th><th>Binding</th></tr></thead><tbody>';
  for (const { action, label } of actions) {
    const binding = getHotkey(action) || "Not Set";
    const isRebinding = state.hotkeyRebinding === action;
    const conflict = (binding !== "Not Set" && !!bindingConflict(action, binding)) || state._hotkeyError === action;
    html += `
      <tr class="hotkey-row${conflict ? " conflict" : ""}" data-action="${action}" style="cursor:pointer">
        <td>${escapeHtml(label)}</td>
        <td><span class="hk-scope">${escapeHtml(hotkeyScopeLabel(action))}</span></td>
        <td class="hotkey-binding">
          ${isRebinding ? '<span class="hotkey-listening">Press key…</span>' : escapeHtml(binding)}
        </td>
      </tr>`;
  }
  html += '</tbody></table>';
  table.innerHTML = html;

  table.querySelectorAll(".hotkey-row").forEach(row => {
    row.addEventListener("click", () => {
      const action = row.dataset.action;
      if (state.hotkeyRebinding === action) {
        state.hotkeyRebinding = null;
      } else {
        state.hotkeyRebinding = action;
      }
      renderHotkeySettings();
    });
  });

  const resetBtn = document.createElement("button");
  resetBtn.className = "btn btn-sm btn-ghost";
  resetBtn.textContent = "Reset to defaults";
  resetBtn.style.marginTop = "8px";
  resetBtn.addEventListener("click", () => {
    state.settings.hotkeys = {};
    localStorage.removeItem("qb-hotkeys");
    renderHotkeySettings();
    updateKeyLabels();
  });
  table.appendChild(resetBtn);
}


function formatSessionTitle(sid) {
  const match = sid.match(/(\d{13})/);
  if (match) {
    const d = new Date(parseInt(match[1]));
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  }
  return sid.slice(0, 20);
}

function answerLineHtml(raw, sanitizedFallback) {
  const src = (raw && String(raw).trim()) ? String(raw) : String(sanitizedFallback || "");
  const html = escapeHtml(src).replace(/&lt;(\/?)(b|u|i|em|strong)&gt;/gi, "<$1$2>");
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.innerHTML;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


async function loadPlayer() {
  const container = $("#player-container");
  if (!container) return;
  container.innerHTML = '<div class="text-muted">Loading player data...</div>';

  try {
    const [statsData, sessionsData, apData, activeProfile] = await Promise.all([
      API.get("/api/stats"),
      API.get("/api/sessions"),
      API.get("/api/answer-powers").catch(() => ({ answer_counts: {} })),
      API.get("/api/profiles/active").catch(() => null),
    ]);

    const stats = statsData.stats || {};
    const sessions = sessionsData.sessions || [];
    const apCounts = apData.answer_counts || {};
    const apClasses = apData.answer_classes || {};
    const ap = activeProfile && (activeProfile.profile || activeProfile);
    const profileKey = (ap && (ap.id ?? ap.profile_id)) || "default";

    const username = state.username || "Player";
    const avatar = state.avatar || "(◕‿◕)";
    const totalQ = stats.totalQuestions || 0;
    const powers = stats.tossupPowers || 0;
    const negs = stats.tossupNegs || 0;

    const achData = computeAchievementData(stats, apCounts, apClasses);
    const pluginAchs = collectPluginAchievements(stats, apCounts);
    const achievementsHtml = buildAchievementHTML(achData, totalQ, powers, negs, pluginAchs);
    maybeShowAchievementPopups(achData, pluginAchs, profileKey);

    container.innerHTML = `
      <div class="player-header">
        <div class="player-welcome">${state.username ? `Welcome, ${escapeHtml(state.username)}` : "Welcome"}</div>
        <div class="player-avatar" id="player-avatar" title="Click to change avatar">${escapeHtml(avatar)}</div>
        <div class="player-name-row">
          <input type="text" id="player-username-input" value="${escapeHtml(state.username)}" placeholder="Set username..." maxlength="24" style="font-family:var(--font);font-size:14px;padding:4px 10px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:4px;color:var(--text);outline:none;width:180px;text-align:center">
        </div>
        <div class="player-stats-row">
          <div class="player-stat"><strong>${totalQ}</strong> questions</div>
          <div class="player-stat"><strong>${powers}</strong> powers</div>
          <div class="player-stat"><strong>${negs}</strong> negs</div>
          <div class="player-stat"><strong>${sessions.length}</strong> sessions</div>
        </div>
      </div>
      <div class="stats-section">
        <div class="stats-section-title">ACHIEVEMENTS</div>
        <div class="achievements-grid">${achievementsHtml}</div>
      </div>
    `;

    $("#player-avatar")?.addEventListener("click", showAvatarPicker);

    $("#player-username-input")?.addEventListener("input", (e) => {
      state.username = e.target.value.trim();
      lsSet("qb-username", state.username);
    });

    $("#btn-export-data")?.addEventListener("click", exportData);
    $("#btn-import-data")?.addEventListener("click", () => $("#import-file")?.click());
    $("#import-file")?.addEventListener("change", importData);
  } catch (e) {
    container.innerHTML = `<div class="text-muted">Failed to load player data</div>`;
  }
}

function apNorm(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
// Faithful renderer port of src/main/answerChecker.js primaryAnswer() so the
// Achievement Lab keys a power the same way the server does (it cannot import
// the main-process module). Helpers are local to avoid name collisions.
function apPrimary(raw, sanitized) {
  const WORD_CHAR = /[A-Za-z0-9'’]/;
  const stripTags = (t) => String(t == null ? "" : t).replace(/<[^>]+>/g, "").trim();
  const stripQuotes = (s) => String(s || "").replace(/^["“”'']+|["“”'']+$/g, "").trim();
  const isDirectiveInner = (inner) => /\b(accept|prompt|reject|do not|anti-?prompt)\b/i.test(inner) || /^\s*or\b/i.test(inner);
  function findContainers(s) {
    const out = [];
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c !== "[" && c !== "(") continue;
      const close = c === "[" ? "]" : ")";
      let depth = 1, j = i + 1;
      while (j < s.length && depth > 0) { if (s[j] === c) depth++; else if (s[j] === close) depth--; j++; }
      out.push({ start: i, text: s.slice(i, j) });
      i = j - 1;
    }
    return out;
  }
  function underlineSpans(html) {
    let vis = "";
    const spans = [];
    let depth = 0, spanStart = -1;
    const re = /<[^>]+>|[^<]+/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      const tok = m[0];
      if (tok[0] === "<") {
        if (/^<u(\s|>)/i.test(tok)) { if (depth === 0) spanStart = vis.length; depth++; }
        else if (/^<\/u\s*>/i.test(tok)) {
          depth = Math.max(0, depth - 1);
          if (depth === 0 && spanStart >= 0) { spans.push([spanStart, vis.length]); spanStart = -1; }
        }
      } else { vis += tok; }
    }
    if (depth > 0 && spanStart >= 0) spans.push([spanStart, vis.length]);
    const merged = [];
    for (const sp of spans) {
      const prev = merged[merged.length - 1];
      if (prev && sp[0] - prev[1] <= 1 && /^['’’-]?$/.test(vis.slice(prev[1], sp[0]))) prev[1] = sp[1];
      else merged.push([sp[0], sp[1]]);
    }
    return { vis, spans: merged };
  }
  const src = (raw && String(raw).trim()) ? String(raw) : String(sanitized || "");
  const containers = findContainers(src);
  const firstDir = containers.find((c) => isDirectiveInner(c.text.slice(1, -1)));
  const mainRaw = firstDir ? src.slice(0, firstDir.start) : src;
  const { vis, spans } = underlineSpans(mainRaw);
  if (spans.length) {
    const fulls = [];
    for (const [s0, e0] of spans) {
      let a = s0, b = e0;
      while (a > 0 && WORD_CHAR.test(vis[a - 1])) a--;
      while (b < vis.length && WORD_CHAR.test(vis[b])) b++;
      const w = vis.slice(a, b).trim();
      if (w) fulls.push(w);
    }
    const joined = fulls.join(" ").trim();
    if (joined) return joined;
  }
  return stripQuotes(stripTags(mainRaw).trim());
}
const AP_STOP = new Set(["the", "a", "an", "of", "and", "or", "de", "la", "le", "el", "il", "s"]);
function apMatch(ans, target) {
  if (!ans || !target) return false;
  if (ans === target) return true;
  const aw = ans.split(/\s+/).filter((w) => w.length >= 3 && !AP_STOP.has(w));
  const tw = target.split(/\s+/).filter((w) => w.length >= 3 && !AP_STOP.has(w));
  if (!aw.length || !tw.length) return false;
  const short = aw.length <= tw.length ? aw : tw;
  const longSet = new Set(aw.length <= tw.length ? tw : aw);
  return short.every((w) => longSet.has(w));
}

// Derive an answer_power achievement's required category from its id prefix
// (or an explicit ach.cat). Powers only count toward it if the question's
// category — and any declared subcategory / alternate subcategory — match.
function apAchCategory(id) {
  if (!id) return null;
  for (const [prefix, label] of AP_CATEGORY_PREFIXES) if (id.indexOf(prefix) === 0) return label;
  return null;
}
// Count powers of one answer whose class (category|subcategory|altSub) matches
// the achievement domain. Empty domain dimensions are wildcards; questions that
// lack a subcategory/altSub simply won't match an achievement that requires one.
function apDimOk(val, want) {
  if (!want) return true;
  return Array.isArray(want) ? want.includes(val) : val === want;
}
function apClassCount(classMap, cat, sub, alt) {
  if (!classMap) return 0;
  if (!cat && !sub && !alt) return 0;
  let n = 0;
  for (const key in classMap) {
    const parts = key.split("|");
    if (apDimOk(parts[0], cat) && apDimOk(parts[1], sub) && apDimOk(parts[2], alt)) n += classMap[key];
  }
  return n;
}
function computeAchievementData(stats, apCounts, apClasses) {
  stats = stats || {};
  apCounts = apCounts || {};
  apClasses = apClasses || {};
  const totalQ = stats.totalQuestions || 0;
  const powers = stats.tossupPowers || 0;
  const negs = stats.tossupNegs || 0;
  const streak = computeDailyStreak(stats.questionsByDate);
  const achData = {};
  for (const ach of ACHIEVEMENT_LIST) {
    let progress = 0;
    if (ach.type === "total") progress = totalQ;
    else if (ach.type === "powers") progress = powers;
    else if (ach.type === "negs") progress = negs;
    else if (ach.type === "cat") {
      const cats = stats.byCategory || {};
      progress = Math.max(...Object.values(cats).map(c => c.totalQuestions || 0), 0);
    } else if (ach.type === "cat_specific") {
      const catData = (stats.byCategory || {})[ach.category];
      progress = catData ? catData.totalQuestions || 0 : 0;
    } else if (ach.type === "daily") {
      const days = stats.questionsByDate || {};
      progress = Math.max(...Object.values(days).map(d => d.questions || 0), 0);
    } else if (ach.type === "streak") {
      progress = streak;
    } else if (ach.type === "answer_power") {
      const targets = (Array.isArray(ach.target) ? ach.target : [ach.target]).map(apNorm).filter(Boolean);
      const cat = ach.cat || apAchCategory(ach.id), sub = ach.sub || null, alt = ach.alt || null;
      const locked = !!(cat || sub || alt);
      const cnt = (ans) => (locked ? apClassCount(apClasses[ans], cat, sub, alt) : (apCounts[ans] || 0));
      if (ach.distinct && targets.length > 1) {
        for (const norm of targets) {
          if (Object.keys(apCounts).some((ans) => apMatch(ans, norm) && cnt(ans) > 0)) progress++;
        }
      } else {
        for (const ans of Object.keys(apCounts)) {
          if (targets.some((norm) => apMatch(ans, norm))) progress += cnt(ans);
        }
      }
    }
    achData[ach.id] = { earned: progress >= ach.threshold, progress };
  }
  return achData;
}

let _rtAchTimer = null;
let _rtAchProfileKey = null;
async function refreshAchievementsRealtime() {
  try {
    if (_rtAchProfileKey == null) {
      try {
        const ap = await API.get("/api/profiles/active");
        const a = ap && (ap.profile || ap);
        _rtAchProfileKey = (a && (a.id ?? a.profile_id)) || "default";
      } catch (e) { _rtAchProfileKey = "default"; }
    }
    const [statsData, apData] = await Promise.all([
      API.get("/api/stats").catch(() => ({ stats: {} })),
      API.get("/api/answer-powers").catch(() => ({ answer_counts: {} })),
    ]);
    const stats = statsData.stats || {};
    const apCounts = apData.answer_counts || {};
    const apClasses = apData.answer_classes || {};
    const achData = computeAchievementData(stats, apCounts, apClasses);
    const pluginAchs = collectPluginAchievements(stats, apCounts);
    maybeShowAchievementPopups(achData, pluginAchs, _rtAchProfileKey);
  } catch (e) {}
}
function scheduleAchievementCheck() {
  if (_rtAchTimer) clearTimeout(_rtAchTimer);
  _rtAchTimer = setTimeout(refreshAchievementsRealtime, 1200);
}

function resolveAchievementIcon(ach) {
  let icon = ach.icon;
  try {
    const map = window.QB && window.QB._achievementIcons;
    if (map && map[ach.id] != null && map[ach.id] !== "") {
      icon = map[ach.id];
    } else {
      const fn = window.QB && window.QB._achievementIconFn;
      if (typeof fn === "function") { const r = fn(ach); if (r != null && r !== "") icon = r; }
    }
  } catch (e) {}
  return icon;
}

function achievementIconHTML(ach, extraClass) {
  const icon = resolveAchievementIcon(ach);
  const s = String(icon == null ? "" : icon);
  const cls = "achievement-icon" + (extraClass ? " " + extraClass : "");
  if (/^\s*</.test(s)) {
    return `<span class="${cls} achievement-icon-graphic">${s}</span>`;
  }
  const chars = [...s];
  if (chars.length >= 4) {
    return `<span class="${cls} achievement-icon-grid">${chars.slice(0, 4).map(c => `<span>${escapeHtml(c)}</span>`).join("")}</span>`;
  }
  return `<span class="${cls}">${escapeHtml(s)}</span>`;
}

const AP_CATEGORY_PREFIXES = [
  ["ap-lit-", "Literature"],
  ["ap-hist-", "History"],
  ["ap-geo-", "Geography"],
  ["ap-sci-", "Science"],
  ["ap-myth-", "Mythology"],
  ["ap-pop-", "Pop Culture"],
  ["ap-fa-", "Fine Arts"],
  ["ap-phil-", "Philosophy"],
];

function renderAchievementCard(ach, data) {
  const earned = !!(data && data.earned);
  const progress = (data && data.progress) || 0;
  const threshold = ach.threshold || 1;
  const pct = Math.min(100, Math.round((progress / threshold) * 100));
  const mystery = ach.type === "cat_specific" && !earned;
  const displayName = mystery ? "??? Mystery ???" : ach.name;
  const displayDesc = mystery ? "Secret achievement" : (ach.desc || "");
  return `
    <div class="achievement-card ${earned ? "earned" : ""}">
      ${achievementIconHTML(ach)}
      <div class="achievement-info">
        <div class="achievement-name">${escapeHtml(displayName)}</div>
        <div class="achievement-desc">${escapeHtml(displayDesc)}</div>
        <div class="achievement-bar"><div class="achievement-bar-fill" style="width:${pct}%"></div></div>
        <div class="achievement-progress">${progress}/${threshold}</div>
      </div>
    </div>`;
}

function buildAchievementHTML(achData, totalQ, powers, negs, pluginAchs) {
  if (!achData || Object.keys(achData).length === 0) {
    return '<div class="text-muted">No achievements yet. Start playing!</div>';
  }

  const globalSections = [
    ["total", "Questions"],
    ["powers", "Powers"],
    ["negs", "Negs"],
    ["cat", "Categories"],
    ["cat_specific", "Category Legends"],
    ["daily", "Endurance"],
    ["streak", "Streaks"],
  ];

  let html = '<div class="achievement-section-title">Global</div>';
  for (const [type, label] of globalSections) {
    const typeAchs = ACHIEVEMENT_LIST.filter(a => a.type === type);
    if (typeAchs.length === 0) continue;
    html += `<div class="achievement-category">${escapeHtml(label)}</div>`;
    for (const ach of typeAchs) {
      const data = achData[ach.id];
      if (!data) continue;
      html += renderAchievementCard(ach, data);
    }
  }

  const apAchs = ACHIEVEMENT_LIST.filter(a => a.type === "answer_power");
  if (apAchs.length) {
    html += '<div class="achievement-section-title">Answer Powers</div>';
    for (const [prefix, label] of AP_CATEGORY_PREFIXES) {
      const group = apAchs.filter(a => a.id.startsWith(prefix));
      if (!group.length) continue;
      html += `<div class="achievement-category">${escapeHtml(label)}</div>`;
      for (const ach of group) {
        html += renderAchievementCard(ach, achData[ach.id]);
      }
    }
    const known = new Set(AP_CATEGORY_PREFIXES.map(p => p[0]));
    const other = apAchs.filter(a => ![...known].some(p => a.id.startsWith(p)));
    if (other.length) {
      html += `<div class="achievement-category">Other</div>`;
      for (const ach of other) html += renderAchievementCard(ach, achData[ach.id]);
    }
  }

  if (Array.isArray(pluginAchs) && pluginAchs.length) {
    const bySource = {};
    for (const p of pluginAchs) {
      const src = p.source || "Plugin";
      (bySource[src] = bySource[src] || []).push(p);
    }
    html += '<div class="achievement-section-title">Plugins</div>';
    for (const src of Object.keys(bySource)) {
      html += `<div class="achievement-category">${escapeHtml(src)}</div>`;
      for (const p of bySource[src]) {
        html += renderAchievementCard(p, { earned: p.earned, progress: p.progress });
      }
    }
  }

  return html;
}

function collectPluginAchievements(stats, apCounts) {
  let defs = [];
  try { defs = (window.QB && window.QB._pluginAchievements) || []; } catch (e) { defs = []; }
  if (!Array.isArray(defs) || !defs.length) return [];
  const ctx = {
    stats: stats || {},
    apCounts: apCounts || {},
    totalQuestions: (stats && stats.totalQuestions) || 0,
    powers: (stats && stats.tossupPowers) || 0,
    negs: (stats && stats.tossupNegs) || 0,
  };
  const out = [];
  for (const d of defs) {
    if (!d || !d.id) continue;
    let progress = 0;
    try {
      progress = typeof d.progress === "function" ? (d.progress(ctx) || 0) : (Number(d.progress) || 0);
    } catch (e) { progress = 0; }
    const threshold = d.threshold || 1;
    out.push({
      id: d.id,
      name: d.name || d.id,
      desc: d.desc || "",
      icon: d.icon || "★",
      source: d.source || d.plugin || "Plugin",
      threshold,
      progress,
      earned: progress >= threshold,
    });
  }
  return out;
}

let _achPopupQueue = [];
let _achPopupActive = false;

function _earnedAchKey(profileKey) {
  return "qb-earned-achs:" + (profileKey == null ? "default" : profileKey);
}
function _loadEarnedAchRaw(profileKey) {
  try { return localStorage.getItem(_earnedAchKey(profileKey)); } catch (e) { return null; }
}
function _saveEarnedAchIds(set, profileKey) {
  try { localStorage.setItem(_earnedAchKey(profileKey), JSON.stringify([...set])); } catch (e) {}
}

function maybeShowAchievementPopups(achData, pluginAchs, profileKey) {
  const raw = _loadEarnedAchRaw(profileKey);
  const firstRun = raw == null;
  let prev;
  try { prev = new Set(JSON.parse(raw || "[]")); } catch (e) { prev = new Set(); }

  const nowEarned = [];
  for (const ach of ACHIEVEMENT_LIST) {
    if (achData[ach.id] && achData[ach.id].earned) nowEarned.push(ach);
  }
  for (const p of (pluginAchs || [])) {
    if (p.earned) nowEarned.push(p);
  }

  const all = new Set(prev);
  const fresh = [];
  for (const a of nowEarned) {
    if (!all.has(a.id)) {
      all.add(a.id);
      if (!firstRun) fresh.push(a);
    }
  }
  _saveEarnedAchIds(all, profileKey);
  for (const a of fresh) queueAchievementPopup(a);
}

function queueAchievementPopup(ach) {
  _achPopupQueue.push(ach);
  if (!_achPopupActive) showNextAchievementPopup();
}

function showNextAchievementPopup() {
  if (_achPopupQueue.length === 0) { _achPopupActive = false; return; }
  _achPopupActive = true;
  const ach = _achPopupQueue.shift();
  const el = document.createElement("div");
  el.className = "ach-popup";
  el.innerHTML = `
    <div class="ach-popup-icon">${achievementIconHTML(ach, "ach-popup-icon-inner")}</div>
    <div class="ach-popup-text">
      <div class="ach-popup-title">Achievement Unlocked!</div>
      <div class="ach-popup-name">${escapeHtml(ach.name || "")}</div>
      <div class="ach-popup-desc">${escapeHtml(ach.desc || "")}</div>
    </div>`;
  document.body.appendChild(el);
  try { Sound.achievement(); } catch (e) {}
  requestAnimationFrame(() => el.classList.add("show"));
  let done = false;
  const dismiss = () => {
    if (done) return; done = true;
    el.classList.remove("show");
    setTimeout(() => { el.remove(); showNextAchievementPopup(); }, 350);
  };
  el.addEventListener("click", dismiss);
  setTimeout(dismiss, 4200);
}

const ACHIEVEMENT_LIST = [
  { id:"q100", name:"Rookie", desc:"100 questions", type:"total", threshold:100, icon:"百" },
  { id:"q300", name:"Novice", desc:"300 questions", type:"total", threshold:300, icon:"参" },
  { id:"q500", name:"Member", desc:"500 questions", type:"total", threshold:500, icon:"伍" },
  { id:"q1000", name:"Dedication", desc:"1000 questions", type:"total", threshold:1000, icon:"千" },
  { id:"q2000", name:"Commitment", desc:"2000 questions", type:"total", threshold:2000, icon:"弐" },
  { id:"q3000", name:"Legend", desc:"3000 questions", type:"total", threshold:3000, icon:"壱" },
  { id:"q5000", name:"Myth", desc:"5000 questions", type:"total", threshold:5000, icon:"極" },
  { id:"q10000", name:"Zenith", desc:"10000 questions", type:"total", threshold:10000, icon:"萬" },
  { id:"pwr50", name:"Speedy", desc:"50 powers", type:"powers", threshold:50, icon:"速" },
  { id:"pwr100", name:"Really fast", desc:"100 powers", type:"powers", threshold:100, icon:"迅" },
  { id:"pwr250", name:"Really really fast", desc:"250 powers", type:"powers", threshold:250, icon:"疾" },
  { id:"pwr500", name:"Overclocking", desc:"500 powers", type:"powers", threshold:500, icon:"光" },
  { id:"pwr999", name:"Keskil's 333rd 3 Meanings", desc:"999 powers", type:"powers", threshold:999, icon:"輝" },
  { id:"neg100", name:"Learning Experience", desc:"100 negs", type:"negs", threshold:100, icon:"誤" },
  { id:"neg300", name:"Confidence Interval", desc:"300 negs", type:"negs", threshold:300, icon:"迷" },
  { id:"neg500", name:"Buzzer Damage", desc:"500 negs", type:"negs", threshold:500, icon:"散" },
  { id:"neg1000", name:"Aggressive Knowledge", desc:"1000 negs", type:"negs", threshold:1000, icon:"猛" },
  { id:"cat100", name:"Dabbler", desc:"100 in a category", type:"cat", threshold:100, icon:"初" },
  { id:"cat300", name:"Intrigued", desc:"300 in a category", type:"cat", threshold:300, icon:"探" },
  { id:"cat500", name:"Specialist", desc:"500 in a category", type:"cat", threshold:500, icon:"達" },
  { id:"cat1000", name:"Enthusiast", desc:"1000 in a category", type:"cat", threshold:1000, icon:"匠" },
  { id:"day200", name:"Invitational Champions", desc:"200 Qs in a day", type:"daily", threshold:200, icon:"戦" },
  { id:"day500", name:"Get a life bro", desc:"500 Qs in a day", type:"daily", threshold:500, icon:"狂" },
  { id:"streak3", name:"Habit", desc:"3 day streak", type:"streak", threshold:3, icon:"日" },
  { id:"streak7", name:"Consistency", desc:"7 day streak", type:"streak", threshold:7, icon:"週" },
  { id:"streak14", name:"Two Week Streak", desc:"14 day streak", type:"streak", threshold:14, icon:"月" },
  { id:"streak30", name:"Locked In", desc:"30 day streak", type:"streak", threshold:30, icon:"年" },
  { id:"cat3333_History", name:"Keskil Khan", desc:"3333 in History", type:"cat_specific", threshold:3333, icon:"汗", category:"History" },
  { id:"cat3333_Literature", name:"Keskil Collector", desc:"3333 in Literature", type:"cat_specific", threshold:3333, icon:"文", category:"Literature" },
  { id:"cat3333_Science", name:"Keskil Chemist", desc:"3333 in Science", type:"cat_specific", threshold:3333, icon:"科", category:"Science" },
  { id:"cat3333_Fine Arts", name:"Keskil Craftsmen", desc:"3333 in Fine Arts", type:"cat_specific", threshold:3333, icon:"芸", category:"Fine Arts" },
  { id:"cat3333_Religion", name:"Keskil Kultist", desc:"3333 in Religion", type:"cat_specific", threshold:3333, icon:"宗", category:"Religion" },
  { id:"cat3333_Mythology", name:"Keskil Legend", desc:"3333 in Mythology", type:"cat_specific", threshold:3333, icon:"神", category:"Mythology" },
  { id:"cat3333_Philosophy", name:"Keskil Questioner", desc:"3333 in Philosophy", type:"cat_specific", threshold:3333, icon:"哲", category:"Philosophy" },
  { id:"cat3333_Current Events", name:"Keskil King", desc:"3333 in Current Events", type:"cat_specific", threshold:3333, icon:"王", category:"Current Events" },
  { id:"cat3333_Geography", name:"Keskil Cartographer", desc:"3333 in Geography", type:"cat_specific", threshold:3333, icon:"地", category:"Geography" },
  { id:"cat3333_Math", name:"Keskil Calculator", desc:"3333 in Math", type:"cat_specific", threshold:3333, icon:"数", category:"Math" },
  { id:"cat3333_Computer Science", name:"Keskil claude user", desc:"3333 in Computer Science", type:"cat_specific", threshold:3333, icon:"算", category:"Computer Science" },
  { id:"cat3333_Trash", name:"Keskil's Opps", desc:"3333 in Trash", type:"cat_specific", threshold:3333, icon:"屑", category:"Trash" },
  { id:"day25", name:"Full Round", desc:"Answer 25 questions in a day", type:"daily", threshold:25, icon:"準" },
  { id:"day50", name:"Prelims", desc:"Answer 50 questions in a day", type:"daily", threshold:50, icon:"予" },
  { id:"day100", name:"Playoffs", desc:"Answer 100 questions in a day", type:"daily", threshold:100, icon:"決" },
  { id:"day300", name:"Marathon", desc:"Answer 300 questions in a day", type:"daily", threshold:300, icon:"覇" },
  {id:"ap-lit-mobydih",name:"Moby Dih",desc:"Power on a Moby Dick question",type:"answer_power",threshold:1,target:"moby dick",icon:"鯨"},
  {id:"ap-lit-hope",name:"Hope is the Thing with Feathers",desc:"Power on an Emily Dickinson question",type:"answer_power",threshold:1,target:"emily dickinson",icon:"羽"},
  {id:"ap-lit-raven",name:"The Raven",desc:"Power on an Edgar Allan Poe question",type:"answer_power",threshold:1,target:"edgar allan poe",icon:"鴉"},
  {id:"ap-lit-shore",name:"On the Shore",desc:"Power on a Franz Kafka question",type:"answer_power",threshold:1,target:"franz kafka",icon:"岸"},
  {id:"ap-lit-pewpew",name:"Pew Pew",desc:"Power on an Anton Chekhov question",type:"answer_power",threshold:1,target:"anton chekhov",icon:"銃"},
  {id:"ap-lit-pottery",name:"Lover of Pottery",desc:"Power on a John Keats question",type:"answer_power",threshold:1,target:"john keats",icon:"壺"},
  {id:"ap-lit-inimitable",name:"The Inimitable",desc:"Power on a Charles Dickens question",type:"answer_power",threshold:1,target:"charles dickens",icon:"筆"},
  {id:"ap-lit-dear",name:"Dear Reader",desc:"Power on a Jane Austen question",type:"answer_power",threshold:1,target:"jane austen",icon:"淑"},
  {id:"ap-lit-bronte",name:"Double Trouble",desc:"Power on Emily and Charlotte Brontë",type:"answer_power",threshold:2,target:["emily brontë","charlotte brontë"],distinct:true,icon:"姉"},
  {id:"ap-lit-beowulf",name:"Epic of the North",desc:"Power on a Beowulf question",type:"answer_power",threshold:1,target:"beowulf",icon:"竜"},
  {id:"ap-lit-magical",name:"Magical Realist",desc:"Power on a Gabriel García Márquez question",type:"answer_power",threshold:1,target:"gabriel garcía márquez",icon:"魔"},
  {id:"ap-lit-norwegian",name:"Norwegian Wood",desc:"Power on a Haruki Murakami question",type:"answer_power",threshold:1,target:"haruki murakami",icon:"森"},
  {id:"ap-lit-dante",name:"Descent into Hell",desc:"Power on a Dante question",type:"answer_power",threshold:1,target:"dante",icon:"獄"},
  {id:"ap-lit-paradise",name:"Fall of Man",desc:"Power on a Paradise Lost question",type:"answer_power",threshold:1,target:"paradise lost",icon:"堕"},
  {id:"ap-lit-twelfth",name:"Twelfth Night",desc:"Power on 12 different Shakespeare works",type:"answer_power",threshold:12,target:["hamlet","macbeth","othello","king lear","romeo and juliet","the tempest","a midsummer night's dream","julius caesar","antony and cleopatra","richard iii","henry v","much ado about nothing","twelfth night","the merchant of venice","as you like it","the taming of the shrew","the winter's tale","coriolanus","titus andronicus","henry iv"],distinct:true,icon:"劇"},
  {id:"ap-hist-wars",name:"Wars of the Three Meanings",desc:"Power on War of the Three Henries, War of the Triple Alliance, and Punic Wars",type:"answer_power",threshold:3,target:["war of the three henries","war of the triple alliance","punic wars"],distinct:true,icon:"戦"},
  {id:"ap-hist-teto",name:"Kasane Teto",desc:"Power on a Tito or Yugoslavia question",type:"answer_power",threshold:1,target:["tito","yugoslavia"],icon:"統"},
  {id:"ap-hist-memento",name:"Memento Mori",desc:"Power on a Goths, Vandals, or Huns question",type:"answer_power",threshold:1,target:["goths","vandals","huns"],icon:"蛮"},
  {id:"ap-hist-alexander",name:"Conqueror of the Known World",desc:"Power on 9 Alexander the Great questions",type:"answer_power",threshold:9,target:"alexander the great",icon:"帝"},
  {id:"ap-hist-grant",name:"Unconditional Surrender Grant",desc:"Power on a Ulysses S. Grant question",type:"answer_power",threshold:1,target:"ulysses s. grant",icon:"将"},
  {id:"ap-hist-luther",name:"Hater of German Serfs",desc:"Power on a Martin Luther question",type:"answer_power",threshold:1,target:"martin luther",icon:"改"},
  {id:"ap-hist-capet",name:"House of Capet",desc:"Power on 16 questions answered Louis",type:"answer_power",threshold:16,target:"louis",icon:"冠"},
  {id:"ap-hist-union",name:"Union Jack",desc:"Power on England, Scotland, Wales, Ireland, and Britain",type:"answer_power",threshold:5,target:["england","scotland","wales","ireland","britain"],distinct:true,icon:"連"},
  {id:"ap-hist-autumn",name:"Autumn of Nations",desc:"Power on a Berlin Wall or Soviet Union question",type:"answer_power",threshold:1,target:["berlin wall","soviet union"],icon:"壁"},
  {id:"ap-hist-fdj",name:"Freie Deutsche Jugend",desc:"Power on an East Germany question",type:"answer_power",threshold:1,target:"east germany",icon:"東"},
  {id:"ap-hist-bismarck",name:"Iron and Blood",desc:"Power on a Bismarck question",type:"answer_power",threshold:1,target:"bismarck",icon:"血"},
  {id:"ap-hist-dynasty",name:"Dynasty of Dynasties",desc:"Power on 8 different Chinese dynasties",type:"answer_power",threshold:8,target:["han","tang","song","ming","qing","yuan","qin","zhou","sui","shang","xia","jin"],distinct:true,icon:"朝"},
  {id:"ap-hist-treatises",name:"Treatises",desc:"Power on Versailles, Westphalia, Utrecht, Paris, and Tordesillas",type:"answer_power",threshold:5,target:["versailles","westphalia","utrecht","paris","tordesillas"],distinct:true,icon:"約"},
  {id:"ap-hist-sun",name:"Sun Never Sets",desc:"Power on a British Empire or Victoria question",type:"answer_power",threshold:1,target:["british empire","victoria"],icon:"日"},
  {id:"ap-hist-japan",name:"Land of the Rising Sun",desc:"Power on a Japan question",type:"answer_power",threshold:1,target:"japan",icon:"和"},
  {id:"ap-hist-mansa",name:"I'm Mansa Musa",desc:"Power on a Mansa Musa question",type:"answer_power",threshold:1,target:"mansa musa",icon:"金"},
  {id:"ap-hist-sunking",name:"The Sun King",desc:"Power on a Louis XIV question",type:"answer_power",threshold:1,target:"louis xiv",icon:"陽"},
  {id:"ap-hist-thatcher",name:"Milk Snatcher",desc:"Power on a Margaret Thatcher question",type:"answer_power",threshold:1,target:"margaret thatcher",icon:"鉄"},
  {id:"ap-hist-genghis",name:"Great Conqueror",desc:"Power on a Genghis Khan question",type:"answer_power",threshold:1,target:"genghis khan",icon:"征"},
  {id:"ap-hist-workers",name:"Workers of the World, Unite!",desc:"Power on 12 different communist revolutionaries",type:"answer_power",threshold:12,target:["stalin","lenin","trotsky","mao","che guevara","ho chi minh","castro","engels","rosa luxemburg","tito","kim il-sung","pol pot","deng xiaoping","zhou enlai","honecker","ceausescu"],distinct:true,icon:"革"},
  {id:"ap-geo-siberia",name:"Birthplace of Keskil",desc:"Power on a Siberia question",type:"answer_power",threshold:1,target:"siberia",icon:"寒"},
  {id:"ap-geo-newfin",name:"New-fin-land",desc:"Power on a Newfoundland question",type:"answer_power",threshold:1,target:"newfoundland",icon:"島"},
  {id:"ap-geo-mormon",name:"Land of the Mormons",desc:"Power on a Utah question",type:"answer_power",threshold:1,target:"utah",icon:"塩"},
  {id:"ap-geo-faithful",name:"Old Faithful",desc:"Power on a Yellowstone question",type:"answer_power",threshold:1,target:"yellowstone",icon:"泉"},
  {id:"ap-geo-carnival",name:"Carnival",desc:"Power on a Brazil question",type:"answer_power",threshold:1,target:"brazil",icon:"祭"},
  {id:"ap-geo-lion",name:"Lion City",desc:"Power on a Singapore question",type:"answer_power",threshold:1,target:"singapore",icon:"獅"},
  {id:"ap-geo-harbour",name:"Fragrant Harbour",desc:"Power on a Hong Kong question",type:"answer_power",threshold:1,target:"hong kong",icon:"港"},
  {id:"ap-geo-capitals",name:"Capital of Capitals",desc:"Power on a London question",type:"answer_power",threshold:1,target:"london",icon:"都"},
  {id:"ap-geo-pearl",name:"Pearl of the Orient",desc:"Power on a Shanghai question",type:"answer_power",threshold:1,target:"shanghai",icon:"珠"},
  {id:"ap-geo-snow",name:"Abode of Snow",desc:"Power on a Himalayas question",type:"answer_power",threshold:1,target:"himalayas",icon:"雪"},
  {id:"ap-geo-penguins",name:"Penguins",desc:"Power on a Madagascar question",type:"answer_power",threshold:1,target:"madagascar",icon:"狐"},
  {id:"ap-geo-arteries",name:"Arteries of the World",desc:"Power on Nile, Yangtze, Amazon, Mississippi, and Danube",type:"answer_power",threshold:5,target:["nile","yangtze","amazon","mississippi","danube"],distinct:true,icon:"河"},
  {id:"ap-geo-potassium",name:"Greatest Exporter of Potassium",desc:"Power on a Kazakhstan question",type:"answer_power",threshold:1,target:"kazakhstan",icon:"鉀"},
  {id:"ap-geo-stans",name:"Stan(d) Up Comedy",desc:"Power on 6 different -stan countries",type:"answer_power",threshold:6,target:["kazakhstan","uzbekistan","turkmenistan","kyrgyzstan","tajikistan","afghanistan","pakistan"],distinct:true,icon:"邦"},
  {id:"ap-geo-seas",name:"Seven Seas",desc:"Power on 7 oceans and major seas",type:"answer_power",threshold:7,target:["pacific","atlantic","indian","arctic","southern","mediterranean","caribbean","baltic","black","red","caspian","north sea"],distinct:true,icon:"海"},
  {id:"ap-sci-alloys",name:"Too Complicated for Simple Wikipedia",desc:"Power on an alloys question",type:"answer_power",threshold:1,target:"alloys",icon:"合"},
  {id:"ap-sci-mito",name:"Powerhouse of the Cell",desc:"Power on a mitochondria question",type:"answer_power",threshold:1,target:"mitochondria",icon:"粒"},
  {id:"ap-sci-blackhole",name:"Hail Mary",desc:"Power on a black hole question",type:"answer_power",threshold:1,target:"black hole",icon:"孔"},
  {id:"ap-sci-nobel",name:"Nobel Intentions",desc:"Power on a Nobel Prize-winning discovery",type:"answer_power",threshold:1,target:["nobel prize","nobel"],icon:"賞"},
  {id:"ap-sci-dna",name:"Double Helix",desc:"Power on a DNA question",type:"answer_power",threshold:1,target:"dna",icon:"螺"},
  {id:"ap-sci-gut",name:"Gut Instinct",desc:"Power on a digestive system or enzyme question",type:"answer_power",threshold:1,target:["digestive","enzyme","stomach","intestine"],icon:"腸"},
  {id:"ap-sci-ideal",name:"Ideal Gas",desc:"Power on a thermodynamics question",type:"answer_power",threshold:1,target:"thermodynamics",icon:"熱"},
  {id:"ap-sci-em",name:"Electromagnetism",desc:"Power on an electromagnetism question",type:"answer_power",threshold:1,target:"electromagnetism",icon:"磁"},
  {id:"ap-sci-schrodinger",name:"Schrödinger's Cat",desc:"Power on a quantum mechanics question",type:"answer_power",threshold:1,target:"quantum",icon:"量"},
  {id:"ap-sci-lagrangian",name:"Lagrangian",desc:"Power on a classical mechanics question",type:"answer_power",threshold:1,target:"lagrangian",icon:"力"},
  {id:"ap-sci-selection",name:"Law of the Jungle",desc:"Power on a natural selection question",type:"answer_power",threshold:1,target:"natural selection",icon:"進"},
  {id:"ap-sci-water",name:"Universal Solvent",desc:"Power on a water question",type:"answer_power",threshold:1,target:"water",icon:"水"},
  {id:"ap-sci-standard",name:"Standard Model",desc:"Power on a particle physics question",type:"answer_power",threshold:1,target:["standard model","particle physics"],icon:"粒"},
  {id:"ap-sci-speciation",name:"Speciation",desc:"Power on an evolution or speciation question",type:"answer_power",threshold:1,target:"speciation",icon:"種"},
  {id:"ap-sci-chloroplast",name:"Chloroplast",desc:"Power on a photosynthesis question",type:"answer_power",threshold:1,target:"photosynthesis",icon:"葉"},
  {id:"ap-sci-mendel",name:"Mendelian",desc:"Power on a genetics question",type:"answer_power",threshold:1,target:"genetics",icon:"遺"},
  {id:"ap-sci-aero",name:"Curious",desc:"Power on an aerospace or aerodynamics question",type:"answer_power",threshold:1,target:["aerospace","aerodynamics","airfoil"],icon:"翼"},
  {id:"ap-sci-fibonacci",name:"Fibonacci",desc:"Power on a golden ratio question",type:"answer_power",threshold:1,target:"golden ratio",icon:"比"},
  {id:"ap-sci-gaussian",name:"Gaussian",desc:"Power on a Gauss or normal distribution question",type:"answer_power",threshold:1,target:["gauss","normal distribution"],icon:"鐘"},
  {id:"ap-sci-sort",name:"Stalin Sort",desc:"Power on a sorting question",type:"answer_power",threshold:1,target:"sorting",icon:"序"},
  {id:"ap-sci-turing",name:"Turing Test",desc:"Power on an AI or machine learning question",type:"answer_power",threshold:1,target:["ai","machine learning","artificial intelligence","neural network"],icon:"機"},
  {id:"ap-sci-compiler",name:"Compiler",desc:"Power on a compiler or programming language question",type:"answer_power",threshold:1,target:["compiler","programming language"],icon:"訳"},
  {id:"ap-sci-kernels",name:"Kernels",desc:"Power on an operating system question",type:"answer_power",threshold:1,target:["linux","unix","windows","operating system"],icon:"核"},
  {id:"ap-sci-sun",name:"The Sun Is a Deadly Laser",desc:"Power on a question about the sun",type:"answer_power",threshold:1,target:"sun",icon:"燃"},
  {id:"ap-sci-v12",name:"V12 Engine",desc:"Power on an internal combustion or Otto cycle question",type:"answer_power",threshold:1,target:["internal combustion","otto cycle","engine"],icon:"輪"},
  {id:"ap-sci-stress",name:"Stress-Strain Curve",desc:"Power on a materials science question",type:"answer_power",threshold:1,target:["materials science","stress-strain","material"],icon:"張"},
  {id:"ap-sci-hydrology",name:"Water Cycle",desc:"Power on a hydrology or precipitation question",type:"answer_power",threshold:1,target:["hydrology","precipitation","water cycle"],icon:"雨"},
  {id:"ap-sci-periodic",name:"Periodic Table",desc:"Power on 7 different element questions",type:"answer_power",threshold:7,target:["hydrogen","helium","lithium","beryllium","boron","carbon","nitrogen","oxygen","fluorine","neon","sodium","magnesium","aluminium","silicon","phosphorus","sulfur","chlorine","argon","potassium","calcium","iron","copper","zinc","silver","gold","mercury","lead","uranium","platinum","titanium","nickel","cobalt","manganese","chromium","vanadium","bromine","iodine","strontium","barium","radium","thorium"],distinct:true,icon:"元"},
  {id:"ap-sci-spectroscopy",name:"Spectroscopy",desc:"Power on NMR, IR, UV-Vis, mass spec, and X-ray crystallography",type:"answer_power",threshold:5,target:["nmr","ir","uv-vis","mass spectrometry","x-ray crystallography"],distinct:true,icon:"光"},
  {id:"ap-sci-solvay",name:"Solvay Conference",desc:"Power on Einstein, Bohr, Heisenberg, Dirac, Pauli, Curie, and Schrödinger",type:"answer_power",threshold:7,target:["einstein","bohr","heisenberg","dirac","pauli","curie","schrödinger"],distinct:true,icon:"学"},
  {id:"ap-sci-spacerace",name:"Space Race",desc:"Power on Apollo, Gemini, Mercury, Soyuz, and Space Shuttle",type:"answer_power",threshold:5,target:["apollo","gemini","mercury","soyuz","space shuttle"],distinct:true,icon:"宙"},
  {id:"ap-myth-lightning",name:"God of Lightning",desc:"Power on Thor, Zeus, and Indra",type:"answer_power",threshold:3,target:["thor","zeus","indra"],distinct:true,icon:"雷"},
  {id:"ap-myth-freaky",name:"Freaky Deaky",desc:"Power on an Oedipus Rex question",type:"answer_power",threshold:1,target:"oedipus",icon:"眼"},
  {id:"ap-myth-underworld",name:"Underworld",desc:"Power on Anubis, Hades, and Osiris",type:"answer_power",threshold:3,target:["anubis","hades","osiris"],distinct:true,icon:"冥"},
  {id:"ap-myth-monkey",name:"Great Sage Equal to Heaven",desc:"Power on a Monkey King or Journey to the West question",type:"answer_power",threshold:1,target:["monkey king","journey to the west","sun wukong"],icon:"猿"},
  {id:"ap-myth-trickster",name:"Trickster God",desc:"Power on Loki and Coyote",type:"answer_power",threshold:2,target:["loki","coyote"],distinct:true,icon:"狡"},
  {id:"ap-myth-gilgamesh",name:"Uuudreeeeeeeaaaa",desc:"Power on a Gilgamesh question",type:"answer_power",threshold:1,target:"gilgamesh",icon:"王"},
  {id:"ap-myth-ragnarok",name:"Ragnarök",desc:"Power on a Norse apocalypse question",type:"answer_power",threshold:1,target:"ragnarök",icon:"滅"},
  {id:"ap-myth-shinto",name:"Shinto Shrine",desc:"Power on a Japanese mythology question",type:"answer_power",threshold:1,target:"japanese myth",icon:"社"},
  {id:"ap-myth-morrigan",name:"The Morrigan",desc:"Power on a Celtic mythology question",type:"answer_power",threshold:1,target:"celtic",icon:"巫"},
  {id:"ap-myth-genesis",name:"Genesis",desc:"Power on a creation myth question",type:"answer_power",threshold:1,target:"creation myth",icon:"創"},
  {id:"ap-myth-quetzal",name:"Feathered Serpent",desc:"Power on a Quetzalcoatl question",type:"answer_power",threshold:1,target:"quetzalcoatl",icon:"蛇"},
  {id:"ap-myth-labours",name:"The Labours",desc:"Power on a Heracles or Hercules question",type:"answer_power",threshold:1,target:"heracles",icon:"獅"},
  {id:"ap-myth-theogony",name:"Theogony",desc:"Power on 12 different Greek deities or Titans",type:"answer_power",threshold:12,target:["zeus","hera","poseidon","demeter","athena","apollo","artemis","ares","hephaestus","aphrodite","hermes","dionysus","hades","hestia","cronus","rhea","oceanus","tethys","hyperion","theia","coeus","phoebe","mnemosyne","themis","crius","iapetus","atlas","prometheus","epimetheus"],distinct:true,icon:"神"},
  {id:"ap-myth-iliad",name:"Iliad Heroes",desc:"Power on Achilles, Hector, Agamemnon, Odysseus, Ajax, Diomedes, and Patroclus",type:"answer_power",threshold:7,target:["achilles","hector","agamemnon","odysseus","ajax","diomedes","patroclus"],distinct:true,icon:"英"},
  {id:"ap-myth-allfather",name:"Allfather's Blessing",desc:"Power on 10 different Norse mythology questions",type:"answer_power",threshold:10,target:["odin","thor","loki","freyja","freyr","baldr","tyr","heimdall","frigg","hel","jörmungandr","fenrir","yggdrasil","valhalla","ragnarök","valkyrie","njord","skadi","mimir","norns"],distinct:true,icon:"北"},
  {id:"ap-pop-kanye",name:"I Guess We'll Never Know",desc:"Power on a Kanye West question",type:"answer_power",threshold:1,target:"kanye",icon:"韻"},
  {id:"ap-pop-mj",name:"King of Pop",desc:"Power on a Michael Jackson question",type:"answer_power",threshold:1,target:"michael jackson",icon:"舞"},
  {id:"ap-pop-starwars",name:"Skywalker",desc:"Power on a Star Wars question",type:"answer_power",threshold:1,target:"star wars",icon:"星"},
  {id:"ap-pop-minecraft",name:"Master of the Craft",desc:"Power on a Minecraft question",type:"answer_power",threshold:1,target:"minecraft",icon:"塊"},
  {id:"ap-pop-nba",name:"Point Guard",desc:"Power on an NBA question",type:"answer_power",threshold:1,target:"nba",icon:"球"},
  {id:"ap-pop-lebron",name:"LeSunshine",desc:"Power on a LeBron James question",type:"answer_power",threshold:1,target:"lebron james",icon:"覇"},
  {id:"ap-pop-zelda",name:"Hyrule",desc:"Power on a Legend of Zelda question",type:"answer_power",threshold:1,target:"zelda",icon:"剣"},
  {id:"ap-pop-fortnite",name:"Battle Royale",desc:"Power on a Fortnite or battle royale question",type:"answer_power",threshold:1,target:["fortnite","battle royale"],icon:"闘"},
  {id:"ap-pop-harry",name:"Wizarding World",desc:"Power on a Harry Potter question",type:"answer_power",threshold:1,target:"harry potter",icon:"杖"},
  {id:"ap-pop-lol",name:"Get a Life",desc:"Power on a League of Legends question",type:"answer_power",threshold:1,target:"league of legends",icon:"戯"},
  {id:"ap-pop-nfl",name:"Touchdown",desc:"Power on an NFL question",type:"answer_power",threshold:1,target:"nfl",icon:"突"},
  {id:"ap-pop-nintendo",name:"64",desc:"Power on a Nintendo franchise question",type:"answer_power",threshold:1,target:"nintendo",icon:"遊"},
  {id:"ap-pop-mario",name:"Wahoo!",desc:"Power on a Mario question",type:"answer_power",threshold:1,target:"mario",icon:"跳"},
  {id:"ap-fa-requiem",name:"Requiem",desc:"Power on a Mozart question",type:"answer_power",threshold:1,target:"mozart",icon:"奏"},
  {id:"ap-fa-messiah",name:"Messiah",desc:"Power on a Handel question",type:"answer_power",threshold:1,target:"handel",icon:"唱"},
  {id:"ap-fa-tmnt",name:"Teenage Mutant Ninja Turtles",desc:"Power on Raphael, Michelangelo, Donatello, and da Vinci",type:"answer_power",threshold:4,target:["raphael","michelangelo","donatello","da vinci"],distinct:true,icon:"絵"},
  {id:"ap-fa-wagner",name:"Total Work of Art",desc:"Power on a Wagner question",type:"answer_power",threshold:1,target:"wagner",icon:"楽"},
  {id:"ap-fa-rodin",name:"The Thinker",desc:"Power on a Rodin question",type:"answer_power",threshold:1,target:"rodin",icon:"想"},
  {id:"ap-fa-monet",name:"Water Lilies",desc:"Power on a Monet question",type:"answer_power",threshold:1,target:"monet",icon:"蓮"},
  {id:"ap-fa-lascala",name:"La Scala",desc:"Power on an Italian opera question",type:"answer_power",threshold:1,target:"opera",icon:"歌"},
  {id:"ap-fa-ring",name:"Ring Cycle",desc:"Power on a Wagner Ring Cycle question",type:"answer_power",threshold:1,target:"ring cycle",icon:"環"},
  {id:"ap-fa-debussy",name:"Clair de Lune",desc:"Power on a Debussy question",type:"answer_power",threshold:1,target:"debussy",icon:"月"},
  {id:"ap-fa-vangogh",name:"Earless Man",desc:"Power on a van Gogh question",type:"answer_power",threshold:1,target:"van gogh",icon:"耳"},
  {id:"ap-fa-dali",name:"The Persistence of Memory",desc:"Power on a Dalí question",type:"answer_power",threshold:1,target:"dalí",icon:"夢"},
  {id:"ap-fa-impressionist",name:"Impressionist Circle",desc:"Power on Monet, Renoir, Degas, Cézanne, Pissarro, and Morisot",type:"answer_power",threshold:6,target:["monet","renoir","degas","cézanne","pissarro","morisot"],distinct:true,icon:"印"},
  {id:"ap-fa-string",name:"String Quartets",desc:"Power on 4 different chamber music questions",type:"answer_power",threshold:4,target:["string quartet","chamber music","sonata","quartet"],distinct:true,icon:"弦"},
  {id:"ap-phil-locke",name:"Essay Competition",desc:"Power on a John Locke question",type:"answer_power",threshold:1,target:"john locke",icon:"白"},
  {id:"ap-phil-athens",name:"The Three Meanings of Athens",desc:"Power on Plato, Aristotle, and Socrates",type:"answer_power",threshold:3,target:["plato","aristotle","socrates"],distinct:true,icon:"知"},
  {id:"ap-phil-cave",name:"The Cave Allegory",desc:"Power on a Plato's Republic question",type:"answer_power",threshold:1,target:"republic",icon:"洞"},
  {id:"ap-phil-marx",name:"Gen Z Larper Handbook",desc:"Power on a Marx question",type:"answer_power",threshold:1,target:"marx",icon:"階"},
  {id:"ap-phil-nietzsche",name:"Übermensch",desc:"Power on a Nietzsche question",type:"answer_power",threshold:1,target:"nietzsche",icon:"超"},
  {id:"ap-phil-hobbes",name:"Leviathan",desc:"Power on a Hobbes question",type:"answer_power",threshold:1,target:"hobbes",icon:"獣"},
  {id:"ap-phil-exist",name:"Existentialism",desc:"Power on a Sartre or Camus question",type:"answer_power",threshold:1,target:["sartre","camus"],icon:"存"},
  {id:"ap-phil-machiavelli",name:"Il Principe",desc:"Power on a Machiavelli question",type:"answer_power",threshold:1,target:"machiavelli",icon:"君"},
  {id:"ap-phil-kant",name:"Categorical Imperative",desc:"Power on a Kant question",type:"answer_power",threshold:1,target:"kant",icon:"徳"},
  {id:"ap-phil-enlightened",name:"Enlightened Monarch",desc:"Power on Locke, Hume, Kant, Rousseau, Voltaire, and Montesquieu",type:"answer_power",threshold:6,target:["locke","hume","kant","rousseau","voltaire","montesquieu"],distinct:true,icon:"啓"},
  {id:"ap-phil-school",name:"The School of Athens",desc:"Power on 5 figures from The School of Athens",type:"answer_power",threshold:5,target:["plato","aristotle","socrates","pythagoras","euclid","diogenes","heraclitus","ptolemy","zoroaster","raphael"],distinct:true,icon:"学"},
];

function showAvatarPicker() {
  const kaomojis = [
  "(◕‿◕)", "(◠‿◠)", "(◡‿◡)", "(.❛ᴗ❛.)", "(◍•ᴗ•◍)",
  "(¬‿¬)", "(≧◡≦)", "(・∀・)", "(｡◕‿◕｡)", "(✿◠‿◠)",
  "(─‿‿─)", "(^‿^)", "(◑‿◐)", "(◉‿◉)", "(ᵔ◡ᵔ)",
  "(ꈍ ‿ ꈍ)", "(◕ᴗ◕✿)", "(•̀ᴗ•́)و", "(つ≧▽≦)つ", "(ノ◕ヮ◕)ノ",
  "♪(๑ᴖ◡ᴖ๑)♪", "☆*:.｡.o(≧▽≦)o.｡.:*☆", "(￣▽￣)ノ", "(^_−)☆", "╰(▔∀▔)╯",
  "(-‿◦☀)", "(~˘▾˘)~", "(／≧ω＼)", "ψ(｀∇´)ψ", "(•_•)",
  "(｡･ω･｡)", "(´｡• ᵕ •｡`)", "(｡•́‿•̀｡)", "(„ᵕᴗᵕ„)", "(✧ω✧)",
  "⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄", "(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)", "(´• ω •`)", "(｡•̀ᴗ-)✧", "(⁄ʘ⁄ ⁄ ω ⁄ ʘ⁄)♡",
  "(๑˃̵ᴗ˂̵)و", "(๑•̀ㅂ•́)و✧", "(-ω-、)", "(；一_一)", "(｡-人-｡)",
  "(￣ω￣;)", "(　；∀；)", "(；⌣̀_⌣́)", "щ(゜ロ゜щ)", "(꒪⌓꒪)",
  "Σ(°△°|||)", "(×_×;）", "(｡ŏ﹏ŏ)", "(╯︵╰,)", "( ´•̥̥̥ω•̥̥̥` )",
  "╮(￣▽￣)╭", "＼(￣▽￣)／", "┐(￣ヘ￣)┌", "＼(＾▽＾)／", "ヽ(>∀<☆)ノ",
];
  let picker = document.getElementById("avatar-picker");
  if (picker) { picker.remove(); return; }
  const av = document.getElementById("player-avatar");
  if (!av) return;
  picker = document.createElement("div");
  picker.id = "avatar-picker";
  picker.className = "avatar-picker";
  picker.innerHTML = kaomojis.map(k =>
    `<span class="avatar-option" data-avatar="${k}">${k}</span>`
  ).join("");
  av.appendChild(picker);
  picker.querySelectorAll(".avatar-option").forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      state.avatar = opt.dataset.avatar;
      lsSet("qb-avatar", state.avatar);
      picker.remove();
      av.textContent = state.avatar;
    });
  });
}

async function exportData() {
  try {
    const [stats, sessions, starred] = await Promise.all([
      API.get("/api/stats"),
      API.get("/api/sessions"),
      API.get("/api/starred"),
    ]);
    const exportObj = {
      version: "0.9",
      exportedAt: new Date().toISOString(),
      username: state.username,
      stats: stats.stats,
      sessions: sessions.sessions,
      starred: starred.starred,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offlinequiz-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Export failed: " + e.message);
  }
}

async function importData(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.version) throw new Error("Invalid export file");

    if (data.sessions) {
      alert("Session history import requires question database. Starred questions will be imported.");
    }
    if (data.starred) {
      for (const s of data.starred) {
        try {
          const cur = await API.get(`/api/starred/check?questionId=${encodeURIComponent(s.question_id)}&type=${s.type}`);
          if (!cur.starred) await API.post("/api/starred/toggle", { questionId: s.question_id, type: s.type });
        } catch {}
      }
    }
    if (data.username) {
      state.username = data.username;
      lsSet("qb-username", data.username);
    }
    alert("Data imported successfully!");
    loadPlayer();
  } catch (e) {
    alert("Import failed: " + e.message);
  }
  e.target.value = "";
}

let _dbWired = false;
let _dbStarred = null;
async function refreshDbStarred() {
  try {
    const [t, b] = await Promise.all([API.get("/api/starred?type=tossup"), API.get("/api/starred?type=bonus")]);
    _dbStarred = new Set();
    (t.starred || []).forEach((s) => _dbStarred.add("tossup:" + (s.question_id ?? s.id)));
    (b.starred || []).forEach((s) => _dbStarred.add("bonus:" + (s.question_id ?? s.id)));
  } catch { _dbStarred = new Set(); }
}

function renderDbProviderTabs() {
  const strip = document.querySelector(".db-tabs");
  if (!strip) return;
  strip.querySelectorAll(".db-tab.prov").forEach((t) => t.remove());
  (window.QB?.getStarredProviders?.() || []).forEach((p) => {
    const b = document.createElement("button");
    b.className = "db-tab prov";
    b.dataset.tab = "prov:" + p.id;
    b.textContent = "\u2605 " + p.title.replace(/^STARRED\s+/i, "");
    b.addEventListener("click", () => {
      state.dbTab = b.dataset.tab;
      document.querySelectorAll(".db-tab").forEach((x) => x.classList.toggle("active", x === b));
      renderDbTab();
    });
    strip.appendChild(b);
  });
}

function loadDatabase() {
  refreshDbStarred();
  renderDbProviderTabs();
  if (!_dbWired) {
    _dbWired = true;
    document.getElementById("btn-db-home")?.addEventListener("click", goBack);
    const setAll = (compact) => {
      state.viewMode = compact ? "compact" : "expanded";
      lsSet("qb-viewmode", state.viewMode);
      document.querySelectorAll("#db-content .qcard").forEach((c) => {
        c.classList.toggle("compact", compact);
        c.classList.toggle("expanded", !compact);
      });
    };
    document.getElementById("btn-db-compact")?.addEventListener("click", () => setAll(true));
    document.getElementById("btn-db-expand")?.addEventListener("click", () => setAll(false));
    document.querySelectorAll(".db-tab").forEach((t) => {
      t.addEventListener("click", () => {
        state.dbTab = t.dataset.tab;
        document.querySelectorAll(".db-tab").forEach((x) => x.classList.toggle("active", x === t));
        renderDbTab();
      });
    });
  }
  renderDbTab();
}

function renderDbTab() {
  const tab = state.dbTab || "search";
  if (tab.startsWith("prov:")) return renderProviderTab(tab.slice(5));
  if (tab === "search") renderSearchTab();
  else if (tab === "sets") renderSetsTab();
  else if (tab === "frequency") renderFrequencyTab();
  else renderStarredTab();
}

async function renderProviderTab(id) {
  const c = document.getElementById("db-content"); if (!c) return;
  const p = (window.QB?.getStarredProviders?.() || []).find((x) => x.id === id);
  c.innerHTML = '<div class="search-results" id="db-results"></div>';
  const host = document.getElementById("db-results");
  if (!p) { host.innerHTML = '<div class="text-muted" style="padding:16px">This section\u2019s plugin is disabled.</div>'; return; }
  try { await p.render(host); }
  catch { host.innerHTML = '<div class="text-muted" style="padding:16px">Failed to load.</div>'; }
}

let _dbTimer = null;
const DIFFICULTY_NAMES = ["Pop Culture", "Middle School", "Easy HS", "Regular HS", "Hard HS", "National HS", "Easy College", "Medium College", "Regionals College", "Nationals College", "Open"];
function renderSearchTab() {
  const c = document.getElementById("db-content"); if (!c) return;
  const diffChecks = DIFFICULTY_NAMES.map((name, i) =>
    `<label class="db-diff" title="${escapeHtml(name)}"><input type="checkbox" class="db-diff-cb" value="${i}"> ${i}</label>`
  ).join("");
  c.innerHTML =
    '<div class="db-toolbar">' +
      '<input type="text" id="db-search-input" class="db-input" placeholder="Search questions…" autocomplete="off">' +
      '<select id="db-qtype" class="db-input db-input-sm"><option value="all">Tossups + Bonuses</option><option value="tossup">Tossups only</option><option value="bonus">Bonuses only</option></select>' +
      '<select id="db-search-type" class="db-input db-input-sm"><option value="all">All text</option><option value="question">Question only</option><option value="answer">Answer only</option></select>' +
      '<select id="db-cat-filter" class="db-input db-input-sm"><option value="">All categories</option></select>' +
      '<select id="db-sub-filter" class="db-input db-input-sm"><option value="">All subcategories</option></select>' +
      '<select id="db-alt-filter" class="db-input db-input-sm"><option value="">All alternate subcategories</option></select>' +
      '<label class="db-opt"><input type="checkbox" id="db-exact" checked> Exact phrase</label>' +
      '<label class="db-opt"><input type="checkbox" id="db-hide-ans"> Hide answers</label>' +
    "</div>" +
    '<div class="db-toolbar db-toolbar-adv">' +
      '<span class="db-adv-label">Difficulty:</span>' + diffChecks +
      '<span class="db-adv-label" style="margin-left:12px">Years:</span>' +
      '<div class="dual-range db-year-dual"><div class="dual-range-track"><div class="dual-range-fill" id="db-year-fill"></div></div>' +
        '<input type="range" id="db-year-min" min="2000" max="2026" value="2000">' +
        '<input type="range" id="db-year-max" min="2000" max="2026" value="2026"></div>' +
      '<span class="db-adv-label" id="db-year-label">2000 – 2026</span>' +
    "</div>" +
    '<div class="search-results" id="db-results"><div class="text-muted" style="padding:24px;text-align:center">Type a search term above</div></div>';
  const deb = () => { clearTimeout(_dbTimer); _dbTimer = setTimeout(performDbSearch, 300); };
  fillCategoryDropdown(document.getElementById("db-cat-filter")).then(() => {
    wireCatCascade(document.getElementById("db-cat-filter"), document.getElementById("db-sub-filter"), document.getElementById("db-alt-filter"), deb);
  });
  c.querySelectorAll("#db-search-input, #db-qtype, #db-search-type, #db-exact, .db-diff-cb, #db-year-min, #db-year-max")
    .forEach((el) => el.addEventListener(el.type === "text" || el.type === "number" || el.type === "range" ? "input" : "change", deb));
  // Hiding answers is instant — a CSS cover over each answer, no re-query.
  document.getElementById("db-hide-ans").addEventListener("change", (e) => {
    document.getElementById("db-results")?.classList.toggle("db-hide-ans", e.target.checked);
    document.querySelectorAll("#db-results .ans-toggle.shown").forEach((t) => t.classList.remove("shown"));
  });
  performDbSearch();
}

// Indeterminate loading bar used wherever a query/scan takes noticeable time.
function loadingBarHtml(label) {
  return `<div class="qb-loading"><div class="qb-loadbar"><div class="qb-loadbar-fill"></div></div><span>${escapeHtml(label || "Loading…")}</span></div>`;
}

let _dbPage = 0;
const DB_PAGE_SIZE = 50;
function dbPagerHtml(hasMore) {
  return '<div class="db-pager"><button class="btn btn-sm" id="db-prev"' + (_dbPage <= 0 ? " disabled" : "") + ">‹ Prev</button>" +
    '<span class="text-muted" style="font-size:12px">Page ' + (_dbPage + 1) + "</span>" +
    '<button class="btn btn-sm" id="db-next"' + (hasMore ? "" : " disabled") + ">Next ›</button></div>";
}
function wireDbPager(container) {
  const prev = container.querySelector("#db-prev"); if (prev) prev.onclick = () => performDbSearch({ page: _dbPage - 1 });
  const next = container.querySelector("#db-next"); if (next) next.onclick = () => performDbSearch({ page: _dbPage + 1 });
}
async function performDbSearch(opts) {
  _dbPage = opts && opts.page != null ? Math.max(0, opts.page) : 0;
  const query = document.getElementById("db-search-input")?.value?.trim();
  const qtype = document.getElementById("db-qtype")?.value || "all";
  const textType = document.getElementById("db-search-type")?.value || "all";
  const catSel = document.getElementById("db-cat-filter"), subSel = document.getElementById("db-sub-filter"), altSel = document.getElementById("db-alt-filter");
  const { category: cat, subcategory: sub, alternateSubcategory: alt } = catSel ? getCatCascadeFilter(catSel, subSel, altSel) : { category: "", subcategory: "", alternateSubcategory: "" };
  const exact = document.getElementById("db-exact")?.checked;
  const hideAns = document.getElementById("db-hide-ans")?.checked;
  const diffs = [...document.querySelectorAll(".db-diff-cb:checked")].map((cb) => cb.value);
  const _ya = parseInt(document.getElementById("db-year-min")?.value || 2000);
  const _yb = parseInt(document.getElementById("db-year-max")?.value || 2026);
  const yearMin = Math.min(_ya, _yb), yearMax = Math.max(_ya, _yb);
  const yl = document.getElementById("db-year-label");
  if (yl) yl.textContent = `${yearMin} \u2013 ${yearMax}`;
  const fill = document.getElementById("db-year-fill");
  if (fill) { fill.style.left = ((yearMin - 2000) / 26) * 100 + "%"; fill.style.right = ((2026 - yearMax) / 26) * 100 + "%"; }
  const container = document.getElementById("db-results");
  if (!container) return;
  container.classList.toggle("db-hide-ans", !!hideAns);

  const common =
    `limit=${DB_PAGE_SIZE}&offset=${_dbPage * DB_PAGE_SIZE}` +
    (cat ? `&categories=${encodeURIComponent(cat)}` : "") +
    (sub ? `&subcategories=${encodeURIComponent(sub)}` : "") +
    (alt ? `&alternateSubcategories=${encodeURIComponent(alt)}` : "") +
    (diffs.length ? `&difficulties=${diffs.join(",")}` : "") +
    (yearMin > 2000 ? `&yearMin=${yearMin}` : "") +
    (yearMax < 2026 ? `&yearMax=${yearMax}` : "");

  const tokens = query ? (query.match(/[\p{L}\p{N}]+/gu) || []) : [];
  if (!query || !tokens.length) {
    container.innerHTML = loadingBarHtml("Loading questions…");
    try {
      const [t, b] = await Promise.all([
        qtype === "bonus" ? Promise.resolve({ rows: [] }) : API.get(`/api/tossups/query?${common}`),
        qtype === "tossup" ? Promise.resolve({ rows: [] }) : API.get(`/api/bonuses/query?${common}`),
      ]);
      const rows = [...(t.rows || []), ...(b.rows || [])];
      const perSource = Math.max((t.rows || []).length, (b.rows || []).length);
      if (!rows.length) {
        container.innerHTML = '<div class="text-muted" style="padding:24px;text-align:center">' + (_dbPage > 0 ? "No more results" : "No questions match these filters") + "</div>" + (_dbPage > 0 ? dbPagerHtml(false) : "");
      } else {
        container.innerHTML = rows.map((q) => renderSearchResult(q)).join("") + dbPagerHtml(perSource >= DB_PAGE_SIZE);
      }
      wireDbPager(container);
    } catch (e) { container.innerHTML = '<div class="text-muted" style="padding:16px">Failed: ' + escapeHtml(e.message || "") + "</div>"; }
    return;
  }

  const base = exact ? `"${tokens.join(" ")}"` : tokens.map((t) => `"${t}"`).join(" ");
  const tossupFts = textType === "answer" ? `answer_sanitized : (${base})` : textType === "question" ? `question_sanitized : (${base})` : base;
  const bonusFts = textType === "answer" ? `answers_sanitized : (${base})` : textType === "question" ? `{leadin_sanitized parts_sanitized} : (${base})` : base;

  container.innerHTML = loadingBarHtml("Searching…");
  try {
    const [t, b] = await Promise.all([
      qtype === "bonus" ? Promise.resolve({ rows: [] }) : API.get(`/api/tossups/search?query=${encodeURIComponent(tossupFts)}&${common}`),
      qtype === "tossup" ? Promise.resolve({ rows: [] }) : API.get(`/api/bonuses/search?query=${encodeURIComponent(bonusFts)}&${common}`),
    ]);
    const rows = [...(t.rows || []), ...(b.rows || [])];
    const perSource = Math.max((t.rows || []).length, (b.rows || []).length);
    if (rows.length === 0) {
      container.innerHTML = '<div class="text-muted" style="padding:24px;text-align:center">' + (_dbPage > 0 ? "No more results" : "No results") + "</div>" + (_dbPage > 0 ? dbPagerHtml(false) : "");
    } else {
      container.innerHTML = rows.map((q) => renderSearchResult(q)).join("") + dbPagerHtml(perSource >= DB_PAGE_SIZE);
    }
    wireDbPager(container);
  } catch (e) { container.innerHTML = '<div class="text-muted" style="padding:16px">Search failed: ' + escapeHtml(e.message || "") + "</div>"; }
}

function renderSearchResult(q) {
  const isTossup = q.question_sanitized != null;
  const type = isTossup ? "tossup" : "bonus";
  const starred = _dbStarred && _dbStarred.has(type + ":" + q.id);
  const star = `<span class="qb-star${starred ? " on" : ""}" data-qid="${q.id}" data-type="${type}" title="Star">${starred ? "\u2605" : "\u2606"}</span>`;
  let answerHtmlStr;
  let body;
  if (isTossup) {
    answerHtmlStr = answerLineHtml(q.answer, q.answer_sanitized || "?");
    body = `<div class="qcard-text">${colorizePowerMarks(escapeHtml(q.question_sanitized || ""))}</div>`;
  } else {
    let parts = [], answers = [], rawAnswers = [];
    try { parts = JSON.parse(q.parts_sanitized || "[]"); } catch {}
    try { answers = JSON.parse(q.answers_sanitized || "[]"); } catch {}
    try { rawAnswers = JSON.parse(q.answers || "[]"); } catch {}
    answerHtmlStr = answers.map((a, i) => answerLineHtml(rawAnswers[i], a)).join(" / ") || "?";
    body = `<div class="qcard-text">${escapeHtml(q.leadin_sanitized || "")}</div>` +
      parts.map((p, i) =>
        `<div class="qcard-part">[10] ${escapeHtml(p)}<br><span class="ans-toggle"><span class="ans">ANSWER: ${answerLineHtml(rawAnswers[i], answers[i] || "")}</span></span></div>`).join("");
  }
  if (q.set_name) body += `<div class="qcard-foot"><span class="qcard-note">${escapeHtml(q.set_name)}${q.set_year ? " (" + q.set_year + ")" : ""}</span></div>`;
  return qcardHtml({
    compact: state.viewMode === "compact",
    category: q.category,
    subcategory: q.subcategory,
    altSub: q.alternate_subcategory,
    year: q.set_year,
    difficulty: q.difficulty,
    sideHtml: `<span class="star-btn save-plus db-save" data-qid="${escapeHtml(q.id)}" data-type="${type}" title="Save to review / folders">+</span><span class="pill">${isTossup ? "TU" : "BO"}</span>${star}`,
    answerHtml: `Answer: <span class="ans-toggle"><span class="ans">${answerHtmlStr}</span></span>`,
    bodyHtml: body,
  });
}

let _dbSets = null;
// Where the sets browser is drilled to — back steps up one level (packet →
// set → set list) instead of leaving the Database screen.
let _dbBrowse = null;
function dbBrowseBack() {
  if (!_dbBrowse) return false;
  if (!document.querySelector("#database-screen.active")) return false;
  if ((state.dbTab || "search") !== "sets") return false;
  if (_dbBrowse.pkt != null) { openSet(_dbBrowse.set); return true; }
  renderSetsTab();
  return true;
}
async function renderSetsTab() {
  _dbBrowse = null;
  const c = document.getElementById("db-content"); if (!c) return;
  c.innerHTML = loadingBarHtml("Loading sets…");
  if (!_dbSets) { try { _dbSets = (await API.get("/api/sets")).sets || []; } catch { _dbSets = []; } }
  c.innerHTML =
    '<div class="db-toolbar"><input type="text" id="db-set-search" class="db-input" placeholder="Filter sets…" autocomplete="off"></div>' +
    '<div class="db-browse" id="db-set-list"></div>';
  const render = () => {
    const term = (document.getElementById("db-set-search").value || "").toLowerCase();
    const list = _dbSets.filter((s) => !term || (s.name || "").toLowerCase().includes(term));
    document.getElementById("db-set-list").innerHTML = list.map((s) =>
      `<div class="db-row" data-set="${escapeHtml(s.name)}"><span>${escapeHtml(s.name)}</span><span class="text-muted">${s.year || ""}</span></div>`
    ).join("") || '<div class="text-muted" style="padding:12px">No sets</div>';
    document.querySelectorAll("#db-set-list .db-row").forEach((r) => r.addEventListener("click", () => openSet(r.dataset.set)));
  };
  document.getElementById("db-set-search").addEventListener("input", render);
  render();
}

async function openSet(setName) {
  _dbBrowse = { set: setName };
  const c = document.getElementById("db-content");
  c.innerHTML = `<div class="db-crumb"><button class="ext-link" id="db-back-sets">← Sets</button> / <strong>${escapeHtml(setName)}</strong></div><div class="db-browse" id="db-packet-list"><div class="text-muted" style="padding:12px">Loading packets…</div></div>`;
  document.getElementById("db-back-sets").addEventListener("click", renderSetsTab);
  let packets = [], err = "";
  try {
    const res = await API.get("/api/packets-for-set?setName=" + encodeURIComponent(setName));
    packets = (res && (res.packets || (Array.isArray(res) ? res : []))) || [];
  } catch (e) { err = e.message || String(e); }
  document.getElementById("db-packet-list").innerHTML = packets.length
    ? packets.map((p) => `<div class="db-row" data-pkt="${p.packet_number}"><span>Packet ${p.packet_number}${p.packet_name && p.packet_name !== String(p.packet_number) ? " — " + escapeHtml(p.packet_name) : ""}</span></div>`).join("")
    : `<div class="text-muted" style="padding:12px">${err ? "Couldn't load packets: " + escapeHtml(err) : "No packets in this set."}</div>`;
  document.querySelectorAll("#db-packet-list .db-row").forEach((r) => r.addEventListener("click", () => openPacket(setName, parseInt(r.dataset.pkt))));
}

async function openPacket(setName, packetNumber) {
  _dbBrowse = { set: setName, pkt: packetNumber };
  const c = document.getElementById("db-content");
  c.innerHTML =
    `<div class="db-crumb"><button class="ext-link" id="db-back-sets">← Sets</button> / <button class="ext-link" id="db-back-set">${escapeHtml(setName)}</button> / <strong>Packet ${packetNumber}</strong>` +
    `<span class="db-pkt-view"><button class="btn btn-sm" id="db-view-sections">Tossups → Bonuses</button><button class="btn btn-sm" id="db-view-inter">Interleaved</button></span></div>` +
    `<div class="search-results" id="db-pkt-content">${loadingBarHtml("Loading packet…")}</div>`;
  document.getElementById("db-back-sets").addEventListener("click", renderSetsTab);
  document.getElementById("db-back-set").addEventListener("click", () => openSet(setName));
  let data = { tossups: [], bonuses: [] }, pErr = "";
  try { data = await API.get(`/api/packet-content?setName=${encodeURIComponent(setName)}&packetNumber=${packetNumber}`); } catch (e) { pErr = e.message || String(e); }
  const el = document.getElementById("db-pkt-content");
  if (pErr) { el.innerHTML = '<div class="text-muted" style="padding:12px">Couldn\'t load packet: ' + escapeHtml(pErr) + "</div>"; return; }
  const tus = data.tossups || [], bos = data.bonuses || [];
  const render = () => {
    const inter = lsGet("qb-pkt-view") === "interleaved";
    document.getElementById("db-view-sections")?.classList.toggle("btn-primary", !inter);
    document.getElementById("db-view-inter")?.classList.toggle("btn-primary", inter);
    let html = "";
    if (inter) {
      for (let i = 0; i < Math.max(tus.length, bos.length); i++) {
        if (tus[i]) html += `<div class='db-section-label'>TOSSUP ${i + 1}</div>` + renderSearchResult(tus[i]);
        if (bos[i]) html += `<div class='db-section-label'>BONUS ${i + 1}</div>` + renderSearchResult(bos[i]);
      }
    } else {
      html = "<div class='db-section-label'>TOSSUPS</div>" + tus.map((q) => renderSearchResult(q)).join("");
      html += "<div class='db-section-label'>BONUSES</div>" + bos.map((b) => renderSearchResult(b)).join("");
    }
    el.innerHTML = html || '<div class="text-muted" style="padding:12px">Empty packet</div>';
  };
  document.getElementById("db-view-sections").addEventListener("click", () => { lsSet("qb-pkt-view", "sections"); render(); });
  document.getElementById("db-view-inter").addEventListener("click", () => { lsSet("qb-pkt-view", "interleaved"); render(); });
  render();
}

function _catAddOpt(sel, v) { const o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o); }
function _catSetDisabled(sel, dis) { sel.disabled = dis; sel.style.opacity = dis ? "0.5" : "1"; sel.title = dis ? "Not applicable for this selection" : ""; }
function wireCatCascade(catSel, subSel, altSel, onChange) {
  _catSetDisabled(subSel, true); _catSetDisabled(altSel, true);
  catSel.addEventListener("change", async () => {
    subSel.innerHTML = '<option value="">All subcategories</option>';
    altSel.innerHTML = '<option value="">All alternate subcategories</option>';
    _catSetDisabled(altSel, true);
    const cat = catSel.value;
    if (!cat) { _catSetDisabled(subSel, true); onChange(); return; }
    if (cat === "Social Science") {
      (ALT_SUBCATS["Social Science"] || []).forEach((a) => _catAddOpt(subSel, a));
      _catSetDisabled(subSel, false);
    } else {
      let subs = [];
      try { subs = (await API.get(`/api/subcategories?type=tossups&category=${encodeURIComponent(cat)}`)).subcategories || []; } catch {}
      if (subs.length) { subs.forEach((s) => _catAddOpt(subSel, s.subcategory)); _catSetDisabled(subSel, false); }
      else _catSetDisabled(subSel, true);
    }
    onChange();
  });
  subSel.addEventListener("change", async () => {
    altSel.innerHTML = '<option value="">All alternate subcategories</option>';
    const cat = catSel.value, sub = subSel.value;
    let alts = [];
    if (cat && cat !== "Social Science" && sub) {
      // Real alternate subcategories for this (category, subcategory) pair —
      // the static ALT_SUBCATS table only covers "Other …" groups.
      try {
        alts = (await API.get(`/api/alternate-subcategories?type=tossups&category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sub)}`)).alternateSubcategories || [];
      } catch {}
      if (!alts.length && /^Other /.test(sub) && ALT_SUBCATS[sub]) alts = ALT_SUBCATS[sub];
    }
    if (sub !== subSel.value) return; // selection changed while we were fetching
    if (alts.length) { alts.forEach((a) => _catAddOpt(altSel, a)); _catSetDisabled(altSel, false); }
    else _catSetDisabled(altSel, true);
    onChange();
  });
  altSel.addEventListener("change", onChange);
}
function getCatCascadeFilter(catSel, subSel, altSel) {
  const cat = catSel.value || "";
  if (!cat) return { category: "", subcategory: "", alternateSubcategory: "" };
  if (cat === "Social Science") {
    return { category: "Social Science", subcategory: "", alternateSubcategory: subSel.value || "" };
  }
  if (!altSel.disabled && altSel.value) return { category: cat, subcategory: subSel.value || "", alternateSubcategory: altSel.value };
  return { category: cat, subcategory: subSel.value || "", alternateSubcategory: "" };
}

async function renderFrequencyTab() {
  const c = document.getElementById("db-content"); if (!c) return;
  c.innerHTML =
    '<div class="db-toolbar">' +
      '<select id="freq-cat" class="db-input db-input-sm"><option value="">All categories</option></select>' +
      '<select id="freq-sub" class="db-input db-input-sm"><option value="">All subcategories</option></select>' +
      '<select id="freq-alt" class="db-input db-input-sm"><option value="">All alternate subcategories</option></select>' +
      '<select id="freq-type" class="db-input db-input-sm"><option value="tossup">Tossups only</option><option value="bonus">Bonuses only</option><option value="both">Tossups + Bonuses</option></select>' +
      '<select id="freq-limit" class="db-input db-input-sm"><option>25</option><option selected>50</option><option>100</option><option>200</option><option>500</option><option>1000</option></select>' +
    "</div>" +
    '<div id="freq-results" class="search-results"><div class="text-muted" style="padding:16px">Loading…</div></div>';
  await fillCategoryDropdown(document.getElementById("freq-cat"));
  const catSel = document.getElementById("freq-cat"), subSel = document.getElementById("freq-sub"), altSel = document.getElementById("freq-alt"), limSel = document.getElementById("freq-limit");
  wireCatCascade(catSel, subSel, altSel, runFrequency);
  limSel.addEventListener("change", runFrequency);
  document.getElementById("freq-type")?.addEventListener("change", runFrequency);
  runFrequency();
}

async function runFrequency() {
  const catSel = document.getElementById("freq-cat"), subSel = document.getElementById("freq-sub"), altSel = document.getElementById("freq-alt");
  if (!catSel) return;
  const { category: cat, subcategory: sub, alternateSubcategory: alt } = getCatCascadeFilter(catSel, subSel, altSel);
  const limit = document.getElementById("freq-limit")?.value || 50;
  const qtype = document.getElementById("freq-type")?.value || "tossup";
  const el = document.getElementById("freq-results"); if (!el) return;
  el.innerHTML = loadingBarHtml("Building frequency list…");
  try {
    const data = await API.get(`/api/frequent-answers?limit=${limit}&qtype=${qtype}` + (cat ? `&category=${encodeURIComponent(cat)}` : "") + (sub ? `&subcategory=${encodeURIComponent(sub)}` : "") + (alt ? `&alternateSubcategory=${encodeURIComponent(alt)}` : ""));
    const rows = data.answers || [];
    if (rows.length === 0) { el.innerHTML = '<div class="text-muted" style="padding:16px">No answers found for this selection.</div>'; return; }
    el.innerHTML = `<table class="stats-table"><thead><tr><th>#</th><th>Answer</th><th>Frequency</th></tr></thead><tbody>` +
      rows.map((r, i) => `<tr><td>${i + 1}</td><td class="freq-answer" data-answer="${escapeHtml(r.answer)}">${escapeHtml(r.answer)}</td><td>${r.count}</td></tr>`).join("") + "</tbody></table>";
    el.querySelectorAll(".freq-answer").forEach((td) =>
      td.addEventListener("click", () => searchFromFrequency(td.dataset.answer, qtype)));
  } catch (e) { el.innerHTML = '<div class="text-muted" style="padding:16px">Failed to load: ' + escapeHtml(e.message || String(e)) + "</div>"; }
}

function searchFromFrequency(answer, qtype) {
  state.dbTab = "search";
  document.querySelectorAll(".db-tab").forEach((x) => x.classList.toggle("active", x.dataset.tab === "search"));
  renderSearchTab();
  const inp = document.getElementById("db-search-input");
  const typeSel = document.getElementById("db-search-type");
  const qtypeSel = document.getElementById("db-qtype");
  if (typeSel) typeSel.value = "answer";
  if (qtypeSel) qtypeSel.value = qtype === "bonus" ? "bonus" : qtype === "both" ? "all" : "tossup";
  if (inp) inp.value = answer;
  performDbSearch();
}

async function renderStarredTab() {
  const c = document.getElementById("db-content"); if (!c) return;
  c.innerHTML = '<div class="search-results">' + loadingBarHtml("Loading starred…") + "</div>";
  let items = [];
  try { items = (await API.get("/api/starred")).starred || []; } catch {}
  const actions = (window.QB && window.QB.getStarredActions) ? window.QB.getStarredActions() : [];
  const actionBtns = actions.map((a, i) => '<button class="btn btn-sm" data-star-action="' + i + '">' + escapeHtml(a.label) + "</button>").join("");
  c.innerHTML =
    '<div class="db-toolbar">' +
      '<button class="btn btn-sm btn-primary" id="db-practice-starred">Practice starred (tossups)</button>' +
      actionBtns +
      '<span class="text-muted" style="font-size:11px">Opens Tossups practice with "starred only" on</span>' +
    "</div>" +
    '<div class="search-results" id="db-results"></div>';
  document.getElementById("db-practice-starred")?.addEventListener("click", () => {
    try {
      const b = loadFilterBlob();
      b.tossups = b.tossups || {};
      b.tossups.starredOnly = true;
      lsSet("qb-filters", JSON.stringify(b));
    } catch {}
    const cb = $("#filter-starred"); if (cb) cb.checked = true;
    showScreen("practice-tossups");
    setMode("tossups");
  });
  c.querySelectorAll("[data-star-action]").forEach((b) => {
    b.addEventListener("click", () => {
      const a = actions[parseInt(b.dataset.starAction)];
      if (a && typeof a.run === "function") { try { a.run(items); } catch (e) { console.error(e); window.QB?.toast?.("Action failed: " + (e.message || e), "error"); } }
    });
  });
  const container = document.getElementById("db-results");
  if (items.length === 0) { container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><p>No starred questions yet.</p></div>'; return; }
  container.innerHTML = items.filter((it) => it.question).map((it) => renderSearchResult(it.question)).join("");
}


function startSplash() {
  const splash = document.getElementById("splash-screen");
  if (!splash) { initApp(); return; }
  splash.classList.remove("hidden");
  splash.setAttribute("style", "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:var(--bg)");
  const el = document.createElement("div");
  el.style.cssText = "font-family:var(--font);font-size:22px;color:var(--accent);letter-spacing:4px";
  el.textContent = "OFFLINEQUIZ";
  splash.innerHTML = "";
  splash.appendChild(el);
  let dots = 0;
  const interval = setInterval(() => { dots = (dots + 1) % 4; el.textContent = "OFFLINEQUIZ" + ".".repeat(dots); }, 400);
  setTimeout(() => { clearInterval(interval); splash.style.opacity = "0"; splash.style.transition = "opacity 400ms"; }, 2000);
  setTimeout(() => { splash.classList.add("hidden"); splash.innerHTML = ""; initApp(); }, 2400);
}


function showSetupOverlay() {
  const overlay = document.getElementById("player-setup");
  if (!overlay) return;
  overlay.classList.remove("hidden");
  document.getElementById("setup-username")?.focus();

  const grid = document.getElementById("setup-avatar-grid");
  const kaomojis = [
  "(◕‿◕)", "(◠‿◠)", "(◡‿◡)", "(.❛ᴗ❛.)", "(◍•ᴗ•◍)",
  "(¬‿¬)", "(≧◡≦)", "(・∀・)", "(｡◕‿◕｡)", "(✿◠‿◠)",
  "(─‿‿─)", "(^‿^)", "(◑‿◐)", "(◉‿◉)", "(ᵔ◡ᵔ)",
  "(ꈍ ‿ ꈍ)", "(◕ᴗ◕✿)", "(•̀ᴗ•́)و", "(つ≧▽≦)つ", "(ノ◕ヮ◕)ノ",
  "♪(๑ᴖ◡ᴖ๑)♪", "☆*:.｡.o(≧▽≦)o.｡.:*☆", "(￣▽￣)ノ", "(^_−)☆", "╰(▔∀▔)╯",
  "(-‿◦☀)", "(~˘▾˘)~", "(／≧ω＼)", "ψ(｀∇´)ψ", "(•_•)",
  "(｡･ω･｡)", "(´｡• ᵕ •｡`)", "(｡•́‿•̀｡)", "(„ᵕᴗᵕ„)", "(✧ω✧)",
  "⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄", "(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)", "(´• ω •`)", "(｡•̀ᴗ-)✧", "(⁄ʘ⁄ ⁄ ω ⁄ ʘ⁄)♡",
  "(๑˃̵ᴗ˂̵)و", "(๑•̀ㅂ•́)و✧", "(-ω-、)", "(；一_一)", "(｡-人-｡)",
  "(￣ω￣;)", "(　；∀；)", "(；⌣̀_⌣́)", "щ(゜ロ゜щ)", "(꒪⌓꒪)",
  "Σ(°△°|||)", "(×_×;）", "(｡ŏ﹏ŏ)", "(╯︵╰,)", "( ´•̥̥̥ω•̥̥̥` )",
  "╮(￣▽￣)╭", "＼(￣▽￣)／", "┐(￣ヘ￣)┌", "＼(＾▽＾)／", "ヽ(>∀<☆)ノ",
];
  if (grid) {
    grid.innerHTML = kaomojis.map(k =>
      `<span class="avatar-option setup-avatar-opt" data-avatar="${k}">${k}</span>`
    ).join("");
    grid.querySelectorAll(".setup-avatar-opt").forEach(opt => {
      opt.addEventListener("click", () => {
        document.getElementById("setup-avatar").textContent = opt.dataset.avatar;
        grid.querySelectorAll(".setup-avatar-opt").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });
  }

  document.getElementById("btn-setup-done")?.addEventListener("click", () => {
    const name = document.getElementById("setup-username")?.value?.trim() || "Player";
    const avatar = document.getElementById("setup-avatar")?.textContent || "(◕‿◕)";
    state.username = name;
    state.avatar = avatar;
    lsSet("qb-username", name);
    lsSet("qb-avatar", avatar);
    lsSet("qb-setup-done", "1");
    overlay.classList.add("hidden");
  });
}

function initApp() {
  applyTheme();
  ensureAllPluginHotkeys();
  initSettings();
  initTitle();
  renderPluginNav();
  updateKeyLabels();
  window.QB?.on?.("plugins:changed", () => {
    ensureAllPluginHotkeys();
    renderPluginNav();
    updateKeyLabels();
    if (document.getElementById("settings-screen")?.classList.contains("active")) renderHotkeySettings();
  });
  window.QB?.on?.("plugins:changed", () => {
    if (document.getElementById("database-screen")?.classList.contains("active")) {
      renderDbProviderTabs();
      if ((state.dbTab || "").startsWith("prov:")) { state.dbTab = "search"; renderDbTab(); }
    }
  });
  window.QB?.on?.("theme:change", () => {
    window.QB?.renderAppearanceSettings(document.getElementById("theme-appearance-host"));
  });
  showScreen("title");
  loadStarredIds();
  loadProfileSettings().then(pruneOldSessions);
  if (!localStorage.getItem("qb-setup-done") && !state.username) {
    showSetupOverlay();
  }
}

function renderPluginNav() {
  const menu = document.querySelector("#title-screen .title-menu");
  if (!menu) return;
  let extra = document.getElementById("title-extra-menu");
  if (extra) extra.remove();
  const pages = (window.QB && window.QB.getActivePages && window.QB.getActivePages()) || [];
  if (!pages.length) return;
  extra = document.createElement("div");
  extra.id = "title-extra-menu";
  extra.innerHTML = '<div class="title-extra-label">Extra:</div>' + pages.map((p) =>
    `<div class="menu-item" data-page="${escapeHtml(p.id)}"><span class="key">[+]</span> ${escapeHtml(p.navLabel || p.title || p.id)}</div>`
  ).join("");
  menu.appendChild(extra);
  extra.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => window.QB?.showPage?.(item.dataset.page));
  });
}

function init() {
  if (window.QB) {
    window.QB.boot({
      api: API,
      getState: () => ({
        mode: state.mode,
        sessionActive: state.sessionActive,
        sessionId: state.sessionId,
        currentQuestion: state.currentQuestion,
        isBuzzed: state.isBuzzed,
        questionCount: state.questionCount,
        totalPoints: state.totalPoints,
        avatar: state.avatar,
        username: state.username,
      }),
      showScreen,
      goHome,
      setReadingHold: (v) => { ttsHold = !!v; },
      getActiveFilters: () => getActiveFilters(),
      ensureFiltersLoaded: () => { if (!document.querySelector("#category-filters .category-group")) setMode(state.mode || "tossups"); },
      resetPracticeFilters: () => resetPracticeFiltersToDefaults(),
      getPracticeConfig: () => ({
        filters: getActiveFilters(),
        strictness: parseInt($("#strictness-slider")?.value || "10"),
        revealSpeed: state.settings.revealSpeed,
        hidePron: !!state.settings.hidePronunciations,
        stopOnPower: !!state.settings.stopOnPower,
        allowSkips: state.settings.allowSkips !== false,
        filterSummary: describeActiveFilters(),
      }),
      stripPronunciations: (t) => stripPronunciations(t),
      recordNav: (name) => recordNav(name),
      collapseFilterSections: () => collapseFilterSections(),
      keyDisplay: (action) => keyDisplay(action),
      confirm: (message, onYes, opts) => confirmDialog(message, onYes, opts),
      openSaveMenu: (question, type, anchor) => openSaveMenu(question, type, anchor),
      openItemSaveMenu: (spec, anchor) => openItemSaveMenu(spec, anchor),
      itemReviewAdd: (it) => itemReviewAdd(it),
      itemReviewHas: (it) => itemReviewHas(it),
      itemReviewList: () => itemReviewList(),
      refreshArt: () => { try { loadTitleArt(); loadSettingsArt(); } catch (e) {} },
      addAppearanceOptions: (opts) => { try { return addAppearanceOptions(opts); } catch (e) { return () => {}; } },
      playSound: (name) => { try { if (Sound && typeof Sound[name] === "function") Sound[name](); } catch (e) {} },
      launchQuestions: (target, ids) => {
        if (!Array.isArray(ids) || !ids.length) return false;
        if (target === "tossups") { startReviewSession(ids); return true; }
        if (target === "bonuses") { startBonusIdsSession(ids); return true; }
        const map = {
          flashcards: { page: "flashcards::cards", key: "qb-flashcards-handoff", name: "Flashcards" },
          coach: { page: "coach-mode::coach", key: "qb-coach-handoff", name: "Coach Mode" },
        };
        const t = map[target]; if (!t) return false;
        try { localStorage.setItem(t.key, JSON.stringify({ ids: ids.slice(), ts: Date.now() })); } catch (e) {}
        const ok = window.QB && window.QB.showPage && window.QB.showPage(t.page);
        if (!ok) {
          try { localStorage.removeItem(t.key); } catch (e) {}
          window.QB && window.QB.toast && window.QB.toast("Enable the " + t.name + " plugin first (Plugins & Themes)", "error");
          return false;
        }
        return true;
      },
      getImportedPacket: () => state._importedPacket
        ? { ...state._importedPacket, mode: "tu" }
        : null,
      getAchievementList: () => ACHIEVEMENT_LIST.map((a) => ({ ...a, cat: a.cat || (a.type === "answer_power" ? apAchCategory(a.id) : undefined) })),
      normalizeAnswerPower: (s) => apNorm(s),
      matchAnswerPower: (a, b) => apMatch(apNorm(a), apNorm(b)),
      extractPrimaryAnswer: (raw, sani) => { try { return apPrimary(raw, sani); } catch (e) { return ""; } },
    });
  }
  applyStagedPluginUpdates().then(maybeAutoCheckAppUpdate);
  startSplash();
}

async function applyStagedPluginUpdates() {
  try {
    const info = await API.get("/api/app-update-plugins");
    if (!info || !info.plugins || !info.plugins.length) return;
    const applied = parseInt(localStorage.getItem("qb-overlay-plugins-applied") || "0");
    if (info.version <= applied) return;
    let updated = 0;
    for (const p of info.plugins) {
      if (!window.QB?._plugins?.some?.((x) => x.id === p.id)) continue;
      try {
        const bytes = Uint8Array.from(atob(p.base64), (c) => c.charCodeAt(0));
        await window.QB.installZipBytes(bytes);
        updated++;
      } catch (e) { console.error("plugin update failed", p.id, e); }
    }
    if (info.complete !== false) localStorage.setItem("qb-overlay-plugins-applied", String(info.version));
    if (updated) window.QB?.toast?.(updated + " plugin update" + (updated === 1 ? "" : "s") + " applied");
  } catch {}
}

// Startup policy: normal updates are only ever OFFERED (Update / Ignore) —
// never installed on their own. Critical releases (manifest.critical) install
// automatically unless the user turned that off in Settings.
async function maybeAutoCheckAppUpdate() {
  if (localStorage.getItem("qb-app-autoupdate") === "false") return;
  let r = null;
  try { r = await peekAppUpdate(); } catch (e) { return; }
  if (!r || r.dev || r.error || !r.configured || !r.available) return;
  // Critical releases auto-install (unless the user turned that off); normal
  // ones are only ever OFFERED — never downloaded without a click.
  if (r.critical && localStorage.getItem("qb-app-critical-auto") !== "false") {
    try {
      const d = await API.post("/api/app-update-check", {});
      if (d && d.updated) showUpdateDialog(r, { installed: true });
    } catch {}
    return;
  }
  if (localStorage.getItem("qb-ignored-update") === String(r.version)) return;
  showUpdateDialog(r, { installed: false });
}

function showUpdateDialog(info, opts) {
  document.getElementById("update-dialog")?.remove();
  const el = document.createElement("div");
  el.id = "update-dialog";
  el.className = "qb-overlay confirm-overlay";
  const head = opts.installed
    ? `Update v${escapeHtml(String(info.version))} downloaded — restart to apply.`
    : `Update available: v${escapeHtml(String(info.version))}${info.critical ? " (important)" : ""}`;
  el.innerHTML = `<div class="confirm-box"><div class="confirm-msg">${head}${info.notes ? `<div class="text-muted" style="font-size:12px;margin-top:6px">${escapeHtml(info.notes)}</div>` : ""}</div>
    <div id="update-dialog-status" style="margin:4px 0"></div>
    <div class="confirm-actions" id="update-dialog-actions"></div></div>`;
  document.body.appendChild(el);
  const actions = el.querySelector("#update-dialog-actions");
  const statusEl = el.querySelector("#update-dialog-status");
  const mkBtn = (label, cls, fn) => {
    const b = document.createElement("button");
    b.className = "btn " + cls; b.textContent = label; b.onclick = fn;
    actions.appendChild(b);
    return b;
  };
  if (opts.installed) {
    mkBtn("Restart now", "btn-primary", () => { try { window.qbreader?.relaunchApp?.(); } catch {} });
    mkBtn("Later", "btn-ghost", () => el.remove());
  } else {
    mkBtn("Update", "btn-primary", async () => {
      actions.style.display = "none";
      await downloadAppUpdate(statusEl, "app-upd-dlg");
      actions.style.display = "";
      actions.innerHTML = "";
      mkBtn("Close", "btn-ghost", () => el.remove());
    });
    mkBtn("Ignore", "btn-ghost", () => {
      try { localStorage.setItem("qb-ignored-update", String(info.version)); } catch (e) {}
      el.remove();
    });
  }
}

init();
