




const isElectron = !!(window.qbreader);
// onlinequiz.net: server.js (QB_WEB=1) serves this renderer with window.QB_WEB set.
// The website differs from the app only where it must: a Download page and home
// box, no drag-and-drop plugin install, no app / database updates.
const IS_WEB = !isElectron && !!window.QB_WEB;

// Writes to the profile's own data schedule an account sync in the app
// (cloudDirty, defined with the account code below).
const SYNC_WRITES = /^\/api\/(check-tossup|check-bonus|starred\/toggle|review\/(dismiss|manual|clear)|profile-settings|plugin-data|sessions\/prune)/;

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
    if (k === "categories" || k === "subcategories" || k === "alternateSubcategories" || k === "categoryIds" || k === "setIds" || k === "setNames")
      out[k] = v.split(",").filter(Boolean);
    else if (k === "difficulties")
      out[k] = v.split(",").map(Number).filter((n) => !isNaN(n));
    else if (k === "standard")
      out[k] = v === "1" || v === "true";
    else if (k === "limit" || k === "offset")
      out[k] = parseInt(v);
    else if (k === "random" || k === "includeUnplayable" || k === "cleanOnly")
      out[k] = v === "1" || v === "true" || k === "random";
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
        if (path === "/api/stats") return window.qbreader.getStats(q.sessionId, q.since, q.categoryIds || null);
        if (path === "/api/activity") return window.qbreader.getActivity ? window.qbreader.getActivity(Number(q.tz) || 0) : Promise.reject(new Error("update the app"));
        if (path === "/api/sessions") return window.qbreader.getSessions();
        if (path === "/api/sessions/breakdown") return window.qbreader.getSessionBreakdown(q.category, q.difficulty, q.categoryIds || null);
        if (path === "/api/sessions/entries") return window.qbreader.getSessionEntries(q.sessionId);
        if (path === "/api/sessions/all-entries")
          return window.qbreader.getAllSessionEntries({ answers: q.answers === "1" || q.answers === "true" });
        if (path === "/api/answer-powers") return window.qbreader.getAnswerPowers();
        if (path === "/api/profiles") return window.qbreader.getProfiles();
        if (path === "/api/profiles/active") return window.qbreader.getActiveProfile();
        if (path === "/api/check-update") return window.qbreader.checkUpdate();
        if (path === "/api/db-update-status") return window.qbreader.dbUpdateStatus ? window.qbreader.dbUpdateStatus() : { state: "idle" };
        if (path === "/api/app-update-info") return window.qbreader.appUpdateInfo ? window.qbreader.appUpdateInfo() : { configured: false, active: false, version: 0, dev: true };
        if (path === "/api/app-update-peek") return window.qbreader.appUpdatePeek ? window.qbreader.appUpdatePeek() : { unsupported: true };
        if (path === "/api/app-update-plugins") return window.qbreader.appUpdatePlugins ? window.qbreader.appUpdatePlugins() : { version: 0, plugins: [] };
        if (path === "/api/set-packets") return window.qbreader.getSetPackets(q.setName);
        if (path === "/api/packets-for-set") return window.qbreader.getPacketsForSet(q.setName);
        if (path === "/api/packet-content") return window.qbreader.getPacketContent(q.setName, parseInt(q.packetNumber) || 0);
        if (path === "/api/frequent-answers") return window.qbreader.getFrequentAnswers(q.category, q.subcategory, q.alternateSubcategory, parseInt(q.limit) || 50, q.qtype || "tossup", q.nodeId || null, parseInt(q.offset) || 0, q.nodeIds || null);
        if (path === "/api/category-tree") return window.qbreader.getCategoryTree ? window.qbreader.getCategoryTree(q.type || "tossups") : { tree: [] };
        if (path === "/api/db-info") return window.qbreader.getDbInfo ? window.qbreader.getDbInfo() : { schema: 1 };
        if (path === "/api/tag-vocab") return window.qbreader.getTagVocab ? window.qbreader.getTagVocab() : { tags: {} };
        if (path === "/api/tag-facets") return window.qbreader.getTagFacets ? window.qbreader.getTagFacets(q.type || "tossups", q.query || "", q) : { facets: [] };
        if (path === "/api/profile-settings") return window.qbreader.getProfileSettings();
        if (path === "/api/review/due") return window.qbreader.getReviewDue({ negs: q.negs !== "0", unanswered: q.unanswered !== "0", wrongEnd: q.wrongEnd !== "0" });
        if (path === "/api/plugin-data") return window.qbreader.getPluginData(q.plugin, q.key);
        if (/^\/api\/(account\/|friends$|leaderboards(\/board)?$)/.test(path)) return window.qbreader.cloud ? window.qbreader.cloud("GET", path, { qs: qs || "" }) : { available: false };
        throw new Error("Unknown API route: " + path);
      },
      post(url, data) {
        const path = url.split("?")[0];
        if (path === "/api/check-tossup") return window.qbreader.checkTossup(data.questionId, data.answer, data.buzzPosition, data.sessionId, { fullyRead: data.fullyRead, strictness: data.strictness, overriding: data.overriding, allowPrompt: data.allowPrompt, record: data.record, previous: data.previous, correct: data.correct, isPower: data.isPower, points: data.points, celerity: data.celerity });
        if (path === "/api/evaluate-tossup") return window.qbreader.evaluateTossup(data.questionId, data.answer, data.strictness, data.buzzPosition, data.previous);
        if (path === "/api/evaluate-bonus-part") return window.qbreader.evaluateBonusPart(data.questionId, data.part, data.answer, data.strictness, data.previous);
        if (path === "/api/evaluate-answer") return window.qbreader.evaluateAnswerLine(data.answerline, data.sanitized, data.answer, data.strictness, data.previous);
        if (path === "/api/parse-answerline") return window.qbreader.parseAnswerline(data.answerline, data.sanitized);
        if (path === "/api/profile-settings") return window.qbreader.saveProfileSettings(data.settings);
        if (path === "/api/review/dismiss") return window.qbreader.dismissReview(data.questionId);
        if (path === "/api/review/manual") return window.qbreader.reviewManual(data.questionId, data.add !== false, data.type);
        if (path === "/api/review/clear") return window.qbreader.clearReview();
        if (path === "/api/sessions/prune") return window.qbreader.pruneSessions(data.days);
        if (path === "/api/plugin-data") return window.qbreader.setPluginData(data.plugin, data.key, data.value);
        if (path === "/api/plugin-sql") return window.qbreader.pluginSql(data.plugin, data.sql, data.params);
        if (path === "/api/db-update-start") return window.qbreader.dbUpdateStart ? window.qbreader.dbUpdateStart() : { state: "idle" };
        if (path === "/api/db-update-commit") return window.qbreader.dbUpdateCommit ? window.qbreader.dbUpdateCommit() : { ok: false };
        if (path === "/api/check-bonus") return window.qbreader.checkBonus(data.questionId, data.answers, data.sessionId, data.strictness, data.overrides, data.previous);
        if (path === "/api/starred/toggle") return window.qbreader.toggleStar(data.questionId, data.type);
        if (path === "/api/profiles") return window.qbreader.createProfile(data.name);
        if (path === "/api/profiles/activate") return window.qbreader.setActiveProfile(data.id);
        if (path === "/api/import-questions") return window.qbreader.importQuestions(data.sets, data.tossups, data.bonuses);
        if (path === "/api/apply-update") return window.qbreader.applyUpdate(data.folderId);
        if (path === "/api/app-update-check") return window.qbreader.appUpdateCheck ? window.qbreader.appUpdateCheck() : { configured: false, updated: false, dev: true };
        if (/^\/api\/(account\/|friends\/|cloud\/|leaderboards\/)/.test(path)) return window.qbreader.cloud ? window.qbreader.cloud("POST", path, data) : { error: "Update the app to use accounts." };
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
      // 30 s: a heavy first-time answer (a category's frequency list, a very common
      // word) can take a while on the website's server; a timeout says so in words
      async get(url, timeoutMs = 30000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(new Error("timeout")), timeoutMs);
        try {
          const r = await fetch(url, { signal: controller.signal });
          return r.json();
        } catch (e) {
          if (controller.signal.aborted) throw new Error("the server took too long to answer — try again in a moment");
          if (e && e.name === "TypeError") throw new Error("couldn't reach the server — check your connection");
          throw e;
        } finally {
          clearTimeout(timer);
        }
      },
      async post(url, data, timeoutMs = 30000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(new Error("timeout")), timeoutMs);
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            signal: controller.signal,
          });
          return r.json();
        } catch (e) {
          if (controller.signal.aborted) throw new Error("the server took too long to answer — try again in a moment");
          if (e && e.name === "TypeError") throw new Error("couldn't reach the server — check your connection");
          throw e;
        } finally {
          clearTimeout(timer);
        }
      },
      async delete(url) {
        const r = await fetch(url, { method: "DELETE" });
        return r.json();
      },
    };
{
  const post = API.post.bind(API), del = API.delete.bind(API);
  API.post = (url, data, timeoutMs) => { const r = post(url, data, timeoutMs); if (SYNC_WRITES.test(url)) cloudDirty(); return r; };
  API.delete = (url) => { const r = del(url); if (/^\/api\/sessions\//.test(url)) cloudDirty(); return r; };
}

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
    "qb-show-qmeta": st.showQuestionMeta, "qb-hide-pron": st.hidePronunciations, "qb-hide-notes": st.hideNotes, "qb-use-weights": st.useWeights,
    "qb-app-accent": st.appAccent, "qb-app-radius": st.appRadius, "qb-app-btngap": st.appBtnGap,
    "qb-app-mode": st.appAppearanceMode, "qb-app-custom-accent": st.appCustomAccent, "qb-app-font": st.appFont,
    "qb-review-wrongend": st.reviewWrongEnd, "qb-session-retention": st.sessionRetentionDays,
    "qb-hotkeys": JSON.stringify(st.hotkeys || {}), "qb-viewmode": state.viewMode,
    "qb-username": state.username, "qb-avatar": state.avatar,
    "qb-tag-display": JSON.stringify(st.tagDisplay || null),
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
    renderGreeting();
    renderTopbarProfile();
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
    hideNotes: localStorage.getItem("qb-hide-notes") === "true",
    appAccent: localStorage.getItem("qb-app-accent") || "blue",
    appAppearanceMode: localStorage.getItem("qb-app-mode") || "preset",
    appCustomAccent: localStorage.getItem("qb-app-custom-accent") || "#58a6ff",
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
    tagDisplay: (() => { try { return JSON.parse(localStorage.getItem("qb-tag-display") || "null"); } catch (e) { return null; } })(),
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


// Platform-aware: text-size shortcuts follow the OS convention (⌘ on mac,
// Ctrl on Windows/Linux), and binding displays use mac glyphs only on mac.
const IS_MAC = /Mac|iP(hone|ad|od)/.test(navigator.platform || navigator.userAgent);
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
  "text-bigger": IS_MAC ? "Meta+=" : "Ctrl+=",
  "text-smaller": IS_MAC ? "Meta+-" : "Ctrl+-",
  "text-reset": IS_MAC ? "Meta+0" : "Ctrl+0",
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
  "text-bigger": "Bigger text",
  "text-smaller": "Smaller text",
  "text-reset": "Reset text size",
};

function getHotkey(action) {
  return state.settings.hotkeys[action] || DEFAULT_HOTKEYS[action];
}

// True while a live answer box is on screen: the tossup buzz input (shown and
// enabled, including during a prompt) or any enabled bonus part input.
function isAnsweringNow() {
  const area = document.getElementById("buzz-area");
  const input = document.getElementById("buzz-input");
  if (area && !area.classList.contains("hidden") && input && !input.disabled) return true;
  return [...document.querySelectorAll(".bonus-answer-input")].some((i) => !i.disabled && i.offsetParent !== null);
}

function matchesHotkey(e, action) {
  const binding = getHotkey(action);
  if (!binding || binding === "Not Set") return false;
  // EXACT modifier match: "Shift+E" never fires on plain E, and Cmd/Alt combos
  // are real bindings now instead of being rejected outright.
  const parts = binding.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  return (
    e.ctrlKey === parts.includes("ctrl") &&
    e.shiftKey === parts.includes("shift") &&
    e.metaKey === (parts.includes("meta") || parts.includes("cmd")) &&
    e.altKey === (parts.includes("alt") || parts.includes("option")) &&
    (e.key.toLowerCase() === key || (key === "space" && (e.key === " " || e.code === "Space")))
  );
}

const KEY_GLYPHS = {
  ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
  Enter: "↵", " ": "Space", Escape: "Esc",
  ...(IS_MAC
    ? { Meta: "⌘", Cmd: "⌘", Alt: "⌥", Option: "⌥", Ctrl: "⌃", Shift: "⇧" }
    : { Meta: "Win", Cmd: "Win", Option: "Alt" }),
};
function bindingGlyphs(b) {
  if (!b || b === "Not Set") return "—";
  const parts = b.split("+").map((p) => KEY_GLYPHS[p] || (p.length === 1 ? p.toUpperCase() : p));
  // mac glyphs read as one unit (⇧E, ⌘=); word-based parts keep the + so
  // "Ctrl+Shift+E" doesn't collapse into "CtrlShiftE".
  return IS_MAC ? parts.join("") : parts.join("+");
}
function keyDisplay(action) {
  return bindingGlyphs(getHotkey(action));
}

// UI text scale (Cmd+= / Cmd+- / Cmd+0 by default). In Electron this is REAL
// Chromium page zoom via webFrame — layout, vh/vw units and canvases all scale
// together, exactly like a browser's Cmd+/-; CSS zoom (the dev-browser
// fallback) can't do that, which is why the old version pushed the UI around.
function _applyUiScale(v) {
  if (window.qbreader?.setZoomFactor) window.qbreader.setZoomFactor(v);
  else {
    document.documentElement.style.zoom = v === 1 ? "" : String(v);
    // CSS zoom also scales vh; fixed-height windows divide by this (Electron's
    // real page zoom leaves it unset, so they fall back to 1)
    document.documentElement.style.setProperty("--ui-zoom", String(v));
  }
}
function setUiScale(v) {
  v = Math.max(0.5, Math.min(2, Math.round(v * 20) / 20));
  state.settings.uiScale = v;
  lsSet("qb-ui-scale", String(v));
  _applyUiScale(v);
}

function keyLabelHtml(action, label) {
  return `<span class="key">[${escapeHtml(keyDisplay(action))}]</span> ${escapeHtml(label)}`;
}
function updateKeyLabels() {
  const startBtn = $("#btn-start-session");
  if (startBtn && !state.sessionActive) startBtn.innerHTML = keyLabelHtml("start-skip", "Start Session");
  const endBtn = $("#btn-end-session");
  if (endBtn) { endBtn.textContent = "End"; endBtn.title = "End session (" + keyDisplay("end-session") + ")"; }
  [["#btn-home"], ["#btn-stats-home"], ["#btn-settings-home"], ["#btn-player-home"], ["#btn-db-home"], ["#btn-ext-home"], ["#btn-download-home"], ["#btn-friends-home"], ["#btn-leaderboards-home"], ["#btn-streaks-home"]]
    .forEach(([sel]) => { const el = $(sel); if (el) { el.innerHTML = ic("left", 16) + "Back"; el.title = "Back (" + keyDisplay("home") + ")"; } });
  const psk = $("#placeholder-start-key"); if (psk) psk.textContent = keyDisplay("start-skip");
}


const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ═════════════════════════════════════════════════════════════════════════
// UI KIT — icons, category/tag colors, badges, tags, the \ tag field.
// Declared up here so top-level code further down can use it at load time.
// ═════════════════════════════════════════════════════════════════════════
const ICON = {
  play: '<path d="M7 4l13 8-13 8z"/>',
  book: '<path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h12"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"/><path d="M16 4.5a3.5 3.5 0 010 7M18 15c2 .7 3.2 2.3 3.8 5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  puzzle: '<path d="M9 3h6v3a2 2 0 004 0V3h2v8h-3a2 2 0 000 4h3v6h-8v-3a2 2 0 00-4 0v3H3v-6h3a2 2 0 000-4H3V3z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  review: '<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  tag: '<path d="M3 12V4a1 1 0 011-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
};
function ic(name, size, extra) {
  const s = size || 18;
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || "") + ">" + (ICON[name] || "") + "</svg>";
}

// Twelve root categories each keep one hue everywhere (badges, tiles, dots).
const ROOT_COLOR = { "Literature": "#bc8cff", "Science and Math": "#58a6ff", "Fine Arts": "#f778ba", "History": "#e3b341", "Geography": "#56d364", "Mythology": "#ffa657", "Pop Culture Sports": "#ff7b72", "Social Science": "#3dd6a3", "Philosophy": "#39c5cf", "Theology": "#8e9bff", "Current Events": "#c9d16b", "Miscellaneous": "#8b949e" };
function rootColorOf(path) { return ROOT_COLOR[String(path || "").split(" > ")[0]] || "#8b949e"; }
// Tag families: short label + hue. "subject" = a category-tree node.
const TAG_FAM = {
  era: { label: "era", name: "Era", color: "#e3b341" },
  place: { label: "place", name: "Place", color: "#56d364" },
  theme: { label: "theme", name: "Theme", color: "#bc8cff" },
  form: { label: "form", name: "Form", color: "#f778ba" },
  answer_type: { label: "answer", name: "Answer type", color: "#39c5cf" },
  format: { label: "format", name: "Format", color: "#ffa657" },
  subject: { label: "subject", name: "Subject", color: "#58a6ff" },
};
const TAG_FAM_ORDER = ["era", "place", "theme", "form", "answer_type", "format"];
const DIFF_FULL = ["Unrated", "Middle school", "Easy high school", "Regular high school", "Hard high school", "National high school", "Easy college", "Medium college", "Regionals college", "Nationals college", "Open"];

function qPathOf(q) {
  if (!q) return "";
  return String(q.category_path || [q.category, q.subcategory, q.alternate_subcategory].filter(Boolean).join(" > "));
}
// "Literature › American Literature" — root and leaf of the record's path.
function catBadgeHtml(path) {
  const parts = String(path || "").split(" > ").filter(Boolean);
  if (!parts.length) return "";
  const short = parts.length > 1 ? parts[0] + " › " + parts[parts.length - 1] : parts[0];
  return `<span class="badge cat-badge" style="--c:${rootColorOf(path)}" title="${escapeHtml(parts.join(" › "))}"><span class="dot"></span><span class="t">${escapeHtml(short)}</span></span>`;
}
function yearBadgeHtml(y) { return y ? `<span class="badge year-badge">${escapeHtml(String(y))}</span>` : ""; }

// ── tag display settings (Settings → Tags) ──
const TAG_DISPLAY_DEFAULT = { show: true, fams: { era: true, place: true, theme: true, form: true, answer_type: true, format: true }, where: { search: true, sets: true, starred: true, history: true, practice: true } };
function tagDisplay() {
  const d = state.settings.tagDisplay;
  if (!d || typeof d !== "object") return TAG_DISPLAY_DEFAULT;
  return { show: d.show !== false, fams: { ...TAG_DISPLAY_DEFAULT.fams, ...(d.fams || {}) }, where: { ...TAG_DISPLAY_DEFAULT.where, ...(d.where || {}) } };
}
function setTagDisplay(patch) {
  const cur = tagDisplay();
  state.settings.tagDisplay = { show: patch.show != null ? !!patch.show : cur.show, fams: { ...cur.fams, ...(patch.fams || {}) }, where: { ...cur.where, ...(patch.where || {}) } };
  lsSet("qb-tag-display", JSON.stringify(state.settings.tagDisplay));
}
function tagsVisibleOn(where) { const d = tagDisplay(); return d.show && d.where[where] !== false; }
function questionTags(q) {
  if (!q || !q.tags) return null;
  if (typeof q.tags === "object") return q.tags;
  try { return JSON.parse(q.tags); } catch (e) { return null; }
}
// The record's tags as clickable chips (a click searches the database for it).
function tagChipsHtml(q, where) {
  if (where && !tagsVisibleOn(where)) return "";
  const t = questionTags(q); if (!t) return "";
  const d = tagDisplay();
  const out = [];
  for (const f of TAG_FAM_ORDER) {
    if (!d.fams[f]) continue;
    for (const v of (Array.isArray(t[f]) ? t[f] : [])) {
      if (typeof v !== "string" || !v) continue;
      out.push(`<button type="button" class="qtag" style="--c:${TAG_FAM[f].color}" data-tag-fam="${f}" data-tag-val="${escapeHtml(v)}" title="Search ${escapeHtml(TAG_FAM[f].name.toLowerCase())}: ${escapeHtml(v)}"><span class="dot"></span><span class="t">${escapeHtml(v)}</span></button>`);
    }
  }
  return out.join("");
}
// Category + year badges, the source, then the tags — one row under a question.
function questionMetaRowHtml(q, where, opts) {
  if (!q) return "";
  const o = opts || {};
  const src = o.src != null ? o.src : (q.set_name || "");
  const tags = tagChipsHtml(q, where);
  return `<div class="qmeta-row">${catBadgeHtml(qPathOf(q))}${yearBadgeHtml(q.set_year)}${src ? `<span class="src">${escapeHtml(src)}</span>` : ""}${tags ? '<span class="vsep" aria-hidden="true"></span>' + tags : ""}</div>`;
}
// Clicking any tag chip opens Database → Search with just that tag.
document.addEventListener("click", (e) => {
  const t = e.target.closest?.(".qtag[data-tag-fam]");
  if (!t) return;
  e.preventDefault(); e.stopPropagation();
  searchDatabase({ query: "", tags: [{ f: t.dataset.tagFam, v: t.dataset.tagVal }] });
});

// ── range sliders paint their filled part from --pct (ui.css): kept in sync on
//    input, on programmatic .value writes, and when a slider is rendered ──
(function syncRangeFill() {
  const sync = (el) => {
    const min = parseFloat(el.min) || 0, max = parseFloat(el.max), v = parseFloat(el.value);
    const hi = Number.isFinite(max) ? max : 100;
    el.style.setProperty("--pct", (hi > min ? Math.max(0, Math.min(100, ((v - min) / (hi - min)) * 100)) : 0) + "%");
  };
  const isRange = (el) => el && el.tagName === "INPUT" && el.type === "range" && !el.closest(".dual-range");
  document.addEventListener("input", (e) => { if (isRange(e.target)) sync(e.target); }, true);
  const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  if (d && d.set) Object.defineProperty(HTMLInputElement.prototype, "value", { ...d, set(v) { d.set.call(this, v); if (isRange(this)) sync(this); } });
  const scan = (root) => { if (root.querySelectorAll) root.querySelectorAll('input[type="range"]').forEach((el) => { if (isRange(el)) sync(el); }); };
  new MutationObserver((muts) => { for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) { if (isRange(n)) sync(n); else if (n.firstElementChild) scan(n); } })
    .observe(document.documentElement, { childList: true, subtree: true });
  if (document.body) scan(document.body); else document.addEventListener("DOMContentLoaded", () => scan(document.body));
})();

// ── light / dark detection: html[data-scheme] drives the derived tokens ──
// Runs on every appearance change (applyDefaultAppearance). It reads the FINAL
// background: body's background transitions, and mid-transition
// getComputedStyle still returns the previous theme's color, so the scheme
// lagged one theme behind (a light theme kept near-white headings). Colors
// resolve through a 1px canvas, so rgb(), color(srgb …) and oklch() all work.
function syncScheme() {
  try {
    const root = document.documentElement, body = document.body;
    if (!body) return;
    const cv = syncScheme._cv || (syncScheme._cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true }));
    const rgba = (css) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = "#000"; cv.fillStyle = css; cv.fillRect(0, 0, 1, 1); return cv.getImageData(0, 0, 1, 1).data; };
    const lum = (d) => 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2];
    const finalBg = (el) => { const t = el.style.transition; el.style.transition = "none"; const c = getComputedStyle(el).backgroundColor; el.style.transition = t; return rgba(c); };
    let bg = finalBg(body);
    if (bg[3] < 128) bg = finalBg(root);   // a theme that paints <html> instead
    if (bg[3] >= 128) root.dataset.scheme = lum(bg) > 140 ? "light" : "dark";
    const acc = getComputedStyle(root).getPropertyValue("--accent").trim();
    if (acc) root.style.setProperty("--on-accent", lum(rgba(acc)) > 170 ? "#0d1117" : "#fff");
  } catch (e) {}
}

// ── tag vocabulary (for the \ composer) ──
let _tagVocab = null, _tagVocabP = null;
function loadTagVocab() {
  if (_tagVocab) return Promise.resolve(_tagVocab);
  if (!_tagVocabP) {
    _tagVocabP = Promise.all([API.get("/api/tag-vocab").catch(() => ({ tags: {} })), fetchCatTree("tossups").catch(() => null)]).then(([v, tree]) => {
      const list = [];
      const tags = (v && v.tags) || {};
      for (const f of TAG_FAM_ORDER) for (const e of (tags[f] || [])) list.push({ f, v: e[0], n: (e[1] || 0) + (e[2] || 0) });
      // subjects: category-tree nodes down to level 3 with enough questions
      if (tree) {
        const walk = (n) => { if (n.depth <= 3 && n.count >= 250) list.push({ f: "subject", v: n.name, n: n.count, id: n.id, path: n.path }); if (n.depth < 3) (n.children || []).forEach(walk); };
        tree.roots.forEach(walk);
      }
      _tagVocab = list;
      return list;
    }).catch(() => { _tagVocabP = null; return []; });
  }
  return _tagVocabP;
}

// ── TagField: a chip field with the "\" composer ──
// opts: { host, chips: [{f,v,x,id}], placeholder, small, icon, onChange(chips),
//         textInput (search bar: the free-text input lives in the same field) }
// Typing "\" (anywhere in the field's text box) opens an empty dashed tag
// bubble with suggestions; typing filters them; Enter/Tab adds, Esc or
// Backspace on an empty bubble closes. Clicking a chip flips required/skipped.
function TagField(opts) {
  const self = { chips: (opts.chips || []).slice(), compose: null, opts };
  const host = opts.host;
  const small = !!opts.small;
  // a tag button opens the tag menu (the field's own tag icon is that button)
  const tagBtnHtml = (lead) => `<button type="button" class="cfield-tag${lead ? " lead" : ""}" title="Add a tag" aria-label="Add a tag">${ic("tag", small ? 16 : 18)}</button>`;
  host.innerHTML =
    `<div class="cfield${small ? " small" : ""}">` + (opts.icon === "tag" ? tagBtnHtml(true) : opts.icon ? ic(opts.icon, small ? 16 : 18) : "") +
    `<span class="chips-holder"></span>` +
    `<input class="cinput" type="text" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(opts.ariaLabel || "Tags")}">` +
    (opts.rightHtml || "") +
    (opts.icon === "tag" ? "" : tagBtnHtml(false)) +
    `<div class="sugg" hidden role="listbox"></div></div>`;
  const field = host.querySelector(".cfield");
  const holder = host.querySelector(".chips-holder");
  const input = host.querySelector(".cinput");
  const sugg = host.querySelector(".sugg");
  self.field = field; self.input = input;
  if (opts.textValue) input.value = opts.textValue;

  const fire = () => { try { opts.onChange && opts.onChange(self.chips.slice()); } catch (e) { console.error(e); } };
  const placeholder = () => {
    if (self.compose) return "";
    if (opts.placeholder) return typeof opts.placeholder === "function" ? opts.placeholder(self.chips) : opts.placeholder;
    return "";
  };
  function chipHtml(c, i) {
    const fam = TAG_FAM[c.f] || TAG_FAM.subject;
    return `<span class="qchip${c.x ? " ex" : ""}" style="--c:${fam.color}"><button type="button" class="qchip-main" data-i="${i}" title="${c.x ? "Skipping — click to require it" : "Required — click to skip it"}"><span class="qchip-fam">${escapeHtml(fam.label)}${c.x ? " not" : ""}</span><span class="qchip-val">${escapeHtml(c.v)}</span></button><button type="button" class="qchip-x" data-i="${i}" aria-label="Remove ${escapeHtml(c.v)}">×</button></span>`;
  }
  function paint(focusCompose) {
    let h = self.chips.map(chipHtml).join("");
    if (self.compose) h += `<span class="composer"><span aria-hidden="true">\\</span><input class="composer-in" type="text" autocomplete="off" spellcheck="false" aria-label="Tag" placeholder="tag" value="${escapeHtml(self.compose.q)}"></span>`;
    holder.innerHTML = h;
    input.placeholder = placeholder();
    paintSugg();
    if (focusCompose) {
      const ci = holder.querySelector(".composer-in");
      if (ci) { ci.focus(); try { ci.setSelectionRange(ci.value.length, ci.value.length); } catch (e) {} }
    }
  }
  function matches() {
    const vocab = _tagVocab || [];
    const q = (self.compose && self.compose.q || "").trim().toLowerCase();
    const have = new Set(self.chips.map((c) => c.f + "|" + (c.id || c.v)));
    let list;
    if (!q) {
      // every family, biggest tags first (the menu scrolls)
      list = TAG_FAM_ORDER.flatMap((f) => vocab.filter((x) => x.f === f).sort((a, b) => b.n - a.n).slice(0, 25));
    } else {
      const score = (x) => { const v = x.v.toLowerCase(); return v.startsWith(q) ? 0 : v.split(/[\s,&/()-]+/).some((w) => w.startsWith(q)) ? 1 : 2; };
      list = vocab.filter((x) => x.v.toLowerCase().includes(q)).sort((a, b) => score(a) - score(b) || b.n - a.n);
    }
    return list.filter((x) => x && !have.has(x.f + "|" + (x.id || x.v))).slice(0, 150);
  }
  function paintSugg() {
    if (!self.compose) { sugg.hidden = true; sugg.innerHTML = ""; return; }
    if (!_tagVocab) {
      sugg.hidden = false;
      sugg.innerHTML = '<div class="sugg-empty">Loading tags…</div>';
      loadTagVocab().then(() => { if (self.compose) paintSugg(); });
      return;
    }
    const list = matches();
    self._list = list;
    const hi = Math.min(self.compose.hi || 0, Math.max(0, list.length - 1));
    sugg.hidden = false;
    sugg.innerHTML = `<div class="sugg-head"><span class="sh-l">${self.compose.q ? "Tags matching “" + escapeHtml(self.compose.q) + "”" : "Tags — type to narrow"}</span><span class="sh-r">↵ add · esc close</span></div>` +
      (list.length ? '<div class="sugg-list">' + list.map((x, i) => `<button type="button" role="option" class="sugg-item${i === hi ? " hi" : ""}" data-i="${i}" style="--c:${(TAG_FAM[x.f] || TAG_FAM.subject).color}"><span class="f">${escapeHtml((TAG_FAM[x.f] || TAG_FAM.subject).label)}</span><span class="v">${escapeHtml(x.v)}</span><span class="c">${Number(x.n || 0).toLocaleString()}</span></button>`).join("") + "</div>"
        : '<div class="sugg-empty">No tag matches</div>');
    sugg.querySelector(".sugg-item.hi")?.scrollIntoView({ block: "nearest" });
    if (!small) {
      // float under the composer bubble, kept inside the field
      const comp = holder.querySelector(".composer");
      if (comp) {
        sugg.style.width = Math.min(460, field.clientWidth) + "px";
        const max = Math.max(0, field.clientWidth - sugg.offsetWidth);
        sugg.style.left = Math.min(comp.offsetLeft, max) + "px";
        sugg.style.top = (comp.offsetTop + comp.offsetHeight + 8) + "px";
      }
    }
  }
  function add(x) {
    if (!x) return;
    if (!self.chips.some((c) => c.f === x.f && (c.id || c.v) === (x.id || x.v))) self.chips.push(x.id ? { f: x.f, v: x.v, x: false, id: x.id, p: x.path || x.p || "" } : { f: x.f, v: x.v, x: false });
    self.compose = null;
    paint(false);
    input.focus();
    fire();
  }
  function startCompose(q) { self.compose = { q: q || "", hi: 0 }; loadTagVocab(); paint(true); }
  function cancelCompose(refocus) { self.compose = null; paint(false); if (refocus) input.focus(); }
  self.setChips = (chips) => { self.chips = (chips || []).slice(); self.compose = null; paint(false); };
  self.addChip = (c) => add(c);
  self.focus = () => input.focus();

  field.addEventListener("mousedown", (e) => {
    if (e.target === field || e.target === holder) { e.preventDefault(); (holder.querySelector(".composer-in") || input).focus(); }
  });
  // the tag button opens the tag menu (the same as typing \ — handy without a keyboard)
  const tagBtn = field.querySelector(".cfield-tag");
  if (tagBtn) {
    tagBtn.addEventListener("mousedown", (e) => e.preventDefault());
    tagBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); if (self.compose) cancelCompose(true); else startCompose(""); });
  }
  holder.addEventListener("click", (e) => {
    const flip = e.target.closest(".qchip-main"), rm = e.target.closest(".qchip-x");
    if (rm) { e.stopPropagation(); self.chips.splice(+rm.dataset.i, 1); paint(false); fire(); return; }
    if (flip) { e.stopPropagation(); const c = self.chips[+flip.dataset.i]; if (c) c.x = !c.x; paint(false); fire(); }
  });
  sugg.addEventListener("mousedown", (e) => {
    const it = e.target.closest(".sugg-item");
    e.preventDefault();
    if (it && self._list) add(self._list[+it.dataset.i]);
  });
  holder.addEventListener("input", (e) => {
    if (!e.target.classList.contains("composer-in") || !self.compose) return;
    self.compose.q = e.target.value.replace(/\\/g, "");
    self.compose.hi = 0;
    paintSugg();
  });
  holder.addEventListener("keydown", (e) => {
    if (!e.target.classList.contains("composer-in") || !self.compose) return;
    e.stopPropagation();
    const list = self._list || [];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); self.compose.hi = Math.max(0, Math.min(list.length - 1, (self.compose.hi || 0) + (e.key === "ArrowDown" ? 1 : -1))); paintSugg(); return; }
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (list.length) add(list[Math.min(self.compose.hi || 0, list.length - 1)]); return; }
    if (e.key === "Escape" || (e.key === "Backspace" && !e.target.value)) { e.preventDefault(); cancelCompose(true); return; }
    if (e.key === "\\") e.preventDefault();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "\\") { e.preventDefault(); e.stopPropagation(); startCompose(""); return; }
    if (e.key === "Backspace" && !input.value && self.chips.length && !opts.keepOnBackspace) { e.stopPropagation(); self.chips.pop(); paint(false); fire(); }
  });
  input.addEventListener("input", () => {
    if (input.value.includes("\\")) {
      const i = input.value.indexOf("\\");
      const rest = input.value.slice(i + 1);
      input.value = input.value.slice(0, i).replace(/\s+$/, "");
      if (opts.onText) opts.onText(input.value);
      startCompose(rest);
      return;
    }
    if (opts.onText) opts.onText(input.value);
  });
  // focus leaving the field closes an open bubble (and its suggestions)
  document.addEventListener("mousedown", (e) => {
    if (self.compose && field.isConnected && !field.contains(e.target)) cancelCompose(false);
  }, true);
  paint(false);
  return self;
}

// ═════════════════════════════════════════════════════════════════════════
// APP SHELL — top bar, home, navigation shortcuts, setup drawer, settings.
// ═════════════════════════════════════════════════════════════════════════
function goTo(target) {
  if (_dbLocked) { openSettings("updates"); return; }
  closeSetupDrawer();
  closeAllPops();
  switch (target) {
    case "home": goHome(); break;
    case "practice-tossups": showScreen("practice-tossups"); setMode("tossups"); break;
    case "practice-bonuses": showScreen("practice-bonuses"); setMode("bonuses"); break;
    case "multiplayer": window.QB?.showPage?.("multiplayer::lobby"); break;
    case "review": if (!accountGate("Sign in to review the questions you missed.")) openReviewMenu(_reviewItems); break;
    case "stats": showScreen("stats"); state.statsSessionId = null; loadStats(); break;
    case "db-search": case "db-sets": case "db-frequency": case "db-starred":
      state.dbTab = { "db-search": "search", "db-sets": "sets", "db-frequency": "frequency", "db-starred": "starred" }[target];
      showScreen("database"); loadDatabase(); break;
    case "plugins": case "plugins-themes": case "plugins-manage":
      // Plugins always opens on Open (the plugin pages); Themes / Manage only when asked for.
      if (window.QB) window.QB._extTab = target === "plugins-themes" ? "themes" : target === "plugins-manage" ? "manage" : "open";
      showScreen("extensions"); window.QB?.renderScreen(); break;
    case "settings": toggleSettings(); break;
    case "player": showScreen("player"); loadPlayer(); break;
    case "download": showScreen("download"); renderDownload(); break;
    case "friends": showScreen("friends"); renderFriends(); break;
    case "leaderboards": showScreen("leaderboards"); renderLeaderboards(); break;
    case "streaks": showScreen("streaks"); renderStreaks(); break;
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest?.("[data-go]");
  if (!b || b.disabled) return;
  e.preventDefault();
  goTo(b.dataset.go);
});

// ── Website addresses (onlinequiz.net/<page>) ──
// Every screen has its own address — /tossups, /bonuses, /multiplayer and
// /multiplayer/<room>, /search, /sets, /frequency, /starred, /stats, /profile,
// /friends, /plugins (/plugins/store, /plugins/<plugin>/<page>), /download — so a
// link, a bookmark or a reload opens that page, the browser's Back / Forward
// move between pages, and the tab title names the page. server.js answers these
// paths with the app's page (WEB_PAGE_PATHS). The desktop app (file://) has none.
const WEB_PATHS = { tossups: "practice-tossups", bonuses: "practice-bonuses", multiplayer: "multiplayer", search: "db-search", sets: "db-sets",
  frequency: "db-frequency", starred: "db-starred", stats: "stats", profile: "player", friends: "friends", plugins: "plugins", download: "download", leaderboards: "leaderboards", streaks: "streaks" };
let _webRouting = false;
// the address of what is on screen now (null: leave the address alone)
function webPathNow() {
  const a = document.querySelector(".screen.active");
  if (!a) return null;
  const db = ["search", "sets", "frequency", "starred"];
  switch (a.id) {
    case "title-screen": return "/";
    case "practice-screen": return state.mode === "bonuses" ? "/bonuses" : "/tossups";
    case "database-screen": return "/" + (db.includes(state.dbTab) ? state.dbTab : "search");
    case "stats-screen": return "/stats";
    case "player-screen": return "/profile";
    case "friends-screen": return "/friends";
    case "leaderboards-screen": return "/leaderboards";
    case "streaks-screen": return "/streaks";
    case "download-screen": return "/download";
    case "extensions-screen": return window.QB && window.QB._extTab === "store" ? "/plugins/store" : "/plugins";
  }
  const pg = ((window.QB && window.QB._pages) || []).find((p) => p.screenEl === a);
  if (!pg) return null;
  if (pg.pluginId === "multiplayer") { const room = window.QB.mpRoom ? window.QB.mpRoom() : ""; return "/multiplayer" + (room ? "/" + encodeURIComponent(room) : ""); }
  return "/plugins/" + encodeURIComponent(pg.pluginId) + "/" + encodeURIComponent(pg.id);
}
function webTitleSync() {
  const crumb = document.getElementById("tb-crumb"), t = crumb && !crumb.hidden ? (document.getElementById("tb-crumb-text")?.textContent || "").trim() : "";
  document.title = t ? t + " · onlinequiz" : "onlinequiz";
}
// after any screen change: a new history entry for a new address
function webPathSync() {
  if (!IS_WEB || _webRouting) return;
  const p = webPathNow();
  if (p && p !== location.pathname) { try { history.pushState({ qb: 1 }, "", p); } catch (e) {} }
  webTitleSync();
}
window.qbWebPathSync = () => setTimeout(webPathSync, 0);
// open the page an address names (a link, a reload, Back / Forward)
function webRoute(path) {
  let seg = [];
  try { seg = String(path || "/").replace(/^\/+|\/+$/g, "").split("/").filter(Boolean).map(decodeURIComponent); } catch (e) {}
  const [a, b, c] = seg;
  _webRouting = true;
  try {
    if (a === "multiplayer") {
      if (b) window.QB?.mpJoin?.(b);
      else { window.QB?.mpLeave?.(); goTo("multiplayer"); }
    } else if (a === "plugins" && b && c) {
      if (!window.QB?.showPage?.(b + "::" + c)) goTo("plugins");
    } else if (a === "plugins") {
      goTo("plugins");
      if (b === "store" || b === "manage") { window.QB._extTab = b; window.QB.renderScreen(); }
    } else if (a && WEB_PATHS[a]) {
      goTo(WEB_PATHS[a]);
    } else if (!document.querySelector("#title-screen.active")) goHome();
  } catch (e) { console.error("route:", e); }
  _webRouting = false;
  // an unknown or partly-known address settles on what actually opened
  const now = webPathNow();
  if (now && now !== location.pathname) { try { history.replaceState({ qb: 1 }, "", now); } catch (e) {} }
  webTitleSync();
}
if (IS_WEB) {
  window.addEventListener("popstate", () => webRoute(location.pathname));
  window.QB?.on?.("screen:change", () => window.qbWebPathSync());
}
(function wireTopbar() {
  const on = (id, fn) => document.getElementById(id)?.addEventListener("click", fn);
  on("tb-brand", () => { closeSetupDrawer(); if (!document.querySelector("#title-screen.active")) goHome(); });
  on("tb-streak", () => goTo("streaks"));
  on("tb-plugins", () => goTo("plugins"));
  on("tb-scheme", () => toggleScheme());
  document.getElementById("opt-light-mode")?.addEventListener("change", (e) => { if (e.target.checked !== (uiScheme() === "light")) toggleScheme(); });
  on("tb-settings", () => toggleSettings());
  // the avatar opens a small menu: Profile (achievements) and, later, Account
  on("tb-profile", (e) => {
    const menu = document.getElementById("tb-profile-menu"), b = e.currentTarget;
    if (!menu) return;
    const open = menu.hidden;
    closeAllPops();
    if (open) { renderTopbarProfile(); menu.hidden = false; b.setAttribute("aria-expanded", "true"); }
  });
})();

// "MULTIPLAYER" -> "Multiplayer"; mixed-case titles and codes (K7Q2) stay.
function niceTitle(s) {
  s = String(s || "").trim();
  if (!s || /[a-z]/.test(s)) return s;
  return s.toLowerCase().replace(/(^|[\s:/(·-])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b([a-z]*\d[a-z\d]*)\b/gi, (w) => w.toUpperCase());
}
function updateTopbar() {
  const active = document.querySelector(".screen.active");
  const crumb = document.getElementById("tb-crumb"), txt = document.getElementById("tb-crumb-text");
  if (crumb && txt) {
    if (!active || active.id === "title-screen") crumb.hidden = true;
    else {
      const t = active.querySelector(".top-bar-title");
      txt.textContent = niceTitle(t ? t.textContent : "");
      crumb.hidden = !txt.textContent;
    }
  }
  renderTopbarProfile();
}
function renderTopbarProfile() {
  const initial = (String(state.username || "").trim()[0] || "?").toUpperCase();
  ["tb-avatar", "tbm-avatar"].forEach((id) => { const av = document.getElementById(id); if (av) av.textContent = initial; });
  const nm = document.getElementById("tbm-name"); if (nm) nm.textContent = state.username || "Player";
  renderAccountMenu();
  const prof = document.getElementById("tb-profile");
  if (prof) prof.title = state.username || "Profile";
}
function renderGreeting() {
  const g = document.getElementById("title-greeting");
  if (!g) return;
  g.innerHTML = state.username ? `Welcome back, <b>${escapeHtml(state.username)}</b>` : "Welcome";
}
function renderStreak(n) {
  const b = document.getElementById("tb-streak"), c = document.getElementById("tb-streak-n");
  if (!b || !c) return;
  b.hidden = !(n >= 1);
  c.textContent = String(n || 0);
  b.title = (n || 0) + "-day streak";
  const lbl = b.querySelector(".lbl"); if (lbl) lbl.textContent = n === 1 ? "day" : "days";
}

// ── home background: real power-marked tossups rising up the home in columns,
//    each with one to three buzz marks in three player colours and its answer
//    line. A live stream, not a fixed loop: each column adds a card below once
//    its last one rises into view (so any window size or zoom is filled — the
//    number of columns follows the width too) and drops the card that left the
//    top. Fresh questions come from the server in batches; a shown one waits in
//    the pool (newest HB_KEEP), so with the connection gone — or the server
//    unreachable — the stream just loops what it has. The pool is kept in
//    localStorage, so the home fills at once even before (or without) a fetch.
const HB = { fresh: [], pool: [], live: new Set(), cols: [], n: 0, fetching: false, failAt: 0, raf: 0, last: 0, check: 0 };
const HB_LS = "qb-home-bg", HB_KEEP = 180;
function homeBgLoadSaved() {
  try { const a = JSON.parse(lsGet(HB_LS) || "[]"); if (Array.isArray(a)) HB.pool = a.filter((c) => c && c.id && c.pre && c.ans).sort(() => Math.random() - 0.5); } catch (e) {}
}
function homeBgSave() {
  try { lsSet(HB_LS, JSON.stringify([...HB.fresh, ...HB.pool].slice(-HB_KEEP))); } catch (e) {}
}
function homeBgCard(q) {
  const raw = String(q.question_sanitized || "");
  const i = raw.indexOf("(*)");
  if (i < 40 || raw.indexOf("(*)", i + 3) >= 0 || raw.length < 260 || raw.length > 680) return null;
  if (/\b(note to|moderator|do not read|read slowly)\b/i.test(raw)) return null;
  let ans = "";
  try { ans = apPrimary(q.answer || "", q.answer_sanitized || ""); } catch (e) { ans = ""; }
  if (!ans) ans = primaryAnswerText(q.answer_sanitized || "");
  if (!ans || ans.length > 40) return null;
  return { id: String(q.id), pre: raw.slice(0, i).trim(), post: raw.slice(i + 3).trim(), ans };
}
// a batch of fresh cards; a random narrow slice (one difficulty, a few years)
// keeps each random pick on the filter index (~0.1 s, not seconds)
async function homeBgFetch(slices) {
  if (HB.fetching || (HB.failAt && Date.now() - HB.failAt < 30e3)) return;
  HB.fetching = true;
  try {
    const got = await Promise.all(Array.from({ length: slices }, () => {
      const d = 2 + Math.floor(Math.random() * 6), y0 = 2010 + Math.floor(Math.random() * 12);
      return API.get(`/api/tossups/query?powermarkOnly=true&cleanOnly=1&random=1&limit=50&difficulties=${d}&yearMin=${y0}&yearMax=${y0 + 4}`).then((r) => (r && r.rows) || []);
    }));
    const have = new Set([...HB.fresh, ...HB.pool].map((c) => c.id).concat([...HB.live]));
    for (const q of got.flat()) { const c = homeBgCard(q); if (c && !have.has(c.id)) { have.add(c.id); HB.fresh.push(c); } }
    HB.failAt = 0;
    homeBgSave();
  } catch (e) { HB.failAt = Date.now(); }
  HB.fetching = false;
}
window.addEventListener("online", () => { HB.failAt = 0; });
// the next card for a column: a fresh one first, else the oldest shown one not on screen now
function homeBgNext() {
  if (HB.fresh.length < 30) homeBgFetch(2);
  let c = HB.fresh.shift();
  if (!c) {
    for (let k = 0; k < HB.pool.length; k++) { const x = HB.pool.shift(); if (!HB.live.has(x.id)) { c = x; break; } HB.pool.push(x); }
  }
  if (!c) return null;
  HB.live.add(c.id);
  return c;
}
function homeBgRetire(c) {
  HB.live.delete(c.id);
  HB.pool.push(c);
  if (HB.pool.length > HB_KEEP) HB.pool.splice(0, HB.pool.length - HB_KEEP);   // online, older shown ones make room for fresh ones
}
function homeBgAppend(col) {
  const c = homeBgNext(); if (!c) return false;
  const tmp = document.createElement("div"); tmp.innerHTML = homeBgCardHtml(c.pre, c.post, c.ans);
  const el = tmp.firstElementChild; el._hb = c;
  col.el.appendChild(el);
  return true;
}
// columns for this width; each filled to below the bottom edge, staggered
function homeBgLayout() {
  const host = document.getElementById("home-bg"); if (!host || !host.clientWidth) return;
  const n = Math.max(2, Math.min(10, Math.round(host.clientWidth / 310)));
  if (n !== HB.n) {
    for (const col of HB.cols) for (const el of col.el.children) if (el._hb) homeBgRetire(el._hb);
    host.innerHTML = "";
    host.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    HB.cols = Array.from({ length: n }, (_, k) => {
      const el = document.createElement("div"); el.className = "home-track"; host.appendChild(el);
      return { el, y: 120 + Math.random() * 260, speed: 11 + ((k * 7) % 5) + Math.random() * 2 };
    });
    HB.n = n;
  }
  homeBgFill();
}
// drop cards that left the top, add cards until the column runs past the bottom (reads layout: not every frame)
function homeBgFill() {
  const host = document.getElementById("home-bg"); if (!host) return;
  const H = host.clientHeight;
  for (const col of HB.cols) {
    // a card that left the top goes; the column moves down by exactly what it took up (to the
    // next card's top, sub-pixel), in the same frame — nothing on screen shifts
    let first = col.el.firstElementChild;
    while (first && first.nextElementSibling) {
      const step = first.nextElementSibling.getBoundingClientRect().top - first.getBoundingClientRect().top;
      if (step >= col.y - 8) break;
      col.y -= step; if (first._hb) homeBgRetire(first._hb); first.remove(); first = col.el.firstElementChild;
    }
    for (let k = 0; k < 12 && col.el.scrollHeight - col.y < H + 260; k++) if (!homeBgAppend(col)) break;
    col.el.style.transform = `translate3d(0, ${-col.y}px, 0)`;
  }
}
function homeBgTick(t) {
  HB.raf = 0;
  if (!document.querySelector("#title-screen.active") || document.hidden) return;   // resumes when the home shows again
  const dt = HB.last ? Math.min(0.1, (t - HB.last) / 1000) : 0; HB.last = t;
  for (const col of HB.cols) { col.y += col.speed * dt; col.el.style.transform = `translate3d(0, ${-col.y}px, 0)`; }
  if (t - HB.check > 400) { HB.check = t; homeBgFill(); }
  HB.raf = requestAnimationFrame(homeBgTick);
}
async function ensureHomeBg() {
  const host = document.getElementById("home-bg"); if (!host) return;
  host.classList.add("live");
  if (!HB.pool.length && !HB.fresh.length && !HB.live.size) homeBgLoadSaved();
  if (!HB.pool.length && !HB.fresh.length && !HB.live.size) await homeBgFetch(4);   // the first visit: a big batch
  else if (HB.fresh.length < 30) homeBgFetch(3);
  homeBgLayout();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!HB.raf) { HB.last = 0; HB.raf = requestAnimationFrame(homeBgTick); }
}
window.addEventListener("resize", () => { if (HB.n) homeBgLayout(); });   // zoom changes the width too
document.addEventListener("visibilitychange", () => { if (!document.hidden && HB.n && document.querySelector("#title-screen.active")) ensureHomeBg(); });
function homeBgCardHtml(pre, post, ans) {
  const words = (pre + " \u00b6 " + post).split(/\s+/);
  const n = words.length;
  const marks = 1 + Math.floor(Math.random() * 3);
  const spots = new Set();
  for (let t = 0; spots.size < marks && t < 20; t++) spots.add(3 + Math.floor(Math.random() * Math.max(1, n - 6)));
  const order = [...spots].sort((a, b) => a - b);
  let out = "<b>", inPre = true;
  words.forEach((w, k) => {
    if (w === "\u00b6") { out += '</b> <span class="pm">(*)</span>'; inPre = false; return; }
    out += (k ? " " : "") + escapeHtml(w);
    const at = order.indexOf(k);
    if (at >= 0) out += ` <span class="bz b${(at % 3) + 1}">(#)</span>`;
  });
  if (inPre) out += "</b>";
  return `<div class="home-bgq">${out}<div class="ans">ANSWER <strong>${escapeHtml(ans)}</strong></div></div>`;
}

// ── practice setup panel (#filters-panel while it sits on the practice screen):
//    it opens beside the page and pushes it left (CSS :has(.filters-panel.open)),
//    so the session keeps running and its hotkeys keep working ──
function setupDrawerEl() {
  const p = document.getElementById("filters-panel");
  return p && p.closest("#practice-screen") ? p : null;
}
function isSetupDrawerOpen() { const p = setupDrawerEl(); return !!(p && p.classList.contains("open")); }
function openSetupDrawer() {
  const p = setupDrawerEl(); if (!p) return;
  closeSettings();
  p.classList.add("open");
  tipInto(p, "setup", null, p.querySelector(".fp-head")?.nextElementSibling);
  updateYearLabel();
  document.getElementById("btn-open-setup")?.setAttribute("aria-expanded", "true");
  syncDrawerStart();
  refreshDrawerCount();
}
function closeSetupDrawer() {
  const p = document.getElementById("filters-panel");
  if (p) p.classList.remove("open");
  document.getElementById("btn-open-setup")?.setAttribute("aria-expanded", "false");
}
function syncDrawerStart() {
  const b = document.getElementById("btn-drawer-start");
  if (b) b.textContent = state.sessionActive ? "Done" : "Start";
}
document.getElementById("btn-open-setup")?.addEventListener("click", () => (isSetupDrawerOpen() ? closeSetupDrawer() : openSetupDrawer()));
document.getElementById("btn-close-setup")?.addEventListener("click", closeSetupDrawer);
document.getElementById("btn-drawer-start")?.addEventListener("click", () => {
  const wasActive = state.sessionActive;
  const onPractice = !!setupDrawerEl();   // borrowed by a multiplayer room: just close
  closeSetupDrawer();
  if (!wasActive && onPractice) startSession();
});
// While the panel is open Esc closes it (unless a picker / dropdown inside it
// owns Esc); every other key reaches the page, so practice goes on beside it.
window.addEventListener("keydown", (e) => {
  if (!isSetupDrawerOpen() || e.key !== "Escape") return;
  if (isCatOverlayOpen && isCatOverlayOpen()) return;
  if (document.querySelector('.qb-select[data-open="true"], .pop:not([hidden])')) return;
  e.preventDefault(); e.stopPropagation(); closeSetupDrawer();
}, true);
// A mouse click on a checkbox or button in the panel hands focus back to the
// page, so the next hotkey (Space, N…) isn't swallowed by the focused control.
document.getElementById("filters-panel")?.addEventListener("pointerup", (e) => {
  const t = e.target.closest?.('input[type="checkbox"], button');
  if (t && !t.closest(".cat-ovl")) setTimeout(() => { if (document.activeElement === t) t.blur(); }, 0);
});
// How many questions the current setup matches (weights ignored: all units).
let _drawerCountTimer = null, _drawerCountSeq = 0;
function refreshDrawerCount() {
  clearTimeout(_drawerCountTimer);
  _drawerCountTimer = setTimeout(async () => {
    const el = document.getElementById("fp-count");
    if (!el || !isSetupDrawerOpen()) return;
    const mv = $("#mode-select")?.value;
    if (mv === "set" || mv === "custom") { el.textContent = ""; return; }
    const seq = ++_drawerCountSeq;
    const f = getActiveFilters({ real: true, allUnits: true });
    const type = filtersMode();
    const params = _randomQuestionParams(f);
    params.delete("random");
    try {
      const d = await API.get(`/api/${type}/count?${params}`);
      if (seq !== _drawerCountSeq) return;
      const n = d && typeof d.count === "number" ? d.count : null;
      el.textContent = n == null ? "" : n.toLocaleString() + " " + (type === "bonuses" ? (n === 1 ? "bonus" : "bonuses") : (n === 1 ? "tossup" : "tossups"));
    } catch (e) { if (seq === _drawerCountSeq) el.textContent = ""; }
  }, 250);
}
document.getElementById("filters-panel")?.addEventListener("change", () => { if (isSetupDrawerOpen()) refreshDrawerCount(); }, true);
document.getElementById("filters-panel")?.addEventListener("input", () => { if (isSetupDrawerOpen()) refreshDrawerCount(); }, true);

// ── practice Tags (the \ field in the setup drawer; saved per mode like the
//    other filters, mirrored to multiplayer through the panel snapshot) ──
let _practiceTagField = null;
function practiceTagFieldInit() {
  const host = document.getElementById("practice-tagfield");
  if (!host || _practiceTagField) return;
  _practiceTagField = TagField({
    host, small: true, icon: "tag", ariaLabel: "Add a tag", chips: state._pendingPracticeTags || [],
    onChange: () => { host.dispatchEvent(new Event("change", { bubbles: true })); debounceSaveFilters(); },
  });
  state._pendingPracticeTags = null;
}
function cleanTagList(list) {
  return (Array.isArray(list) ? list : []).filter((t) => t && t.f && t.v)
    .map((t) => (t.id ? { f: t.f, v: String(t.v), x: !!t.x, id: String(t.id), p: String(t.p || "") } : { f: String(t.f), v: String(t.v), x: !!t.x }));
}
function practiceTags() { return cleanTagList(_practiceTagField ? _practiceTagField.chips : state._pendingPracticeTags); }
function setPracticeTags(list) {
  const clean = cleanTagList(list);
  if (_practiceTagField) _practiceTagField.setChips(clean); else state._pendingPracticeTags = clean;
}
practiceTagFieldInit();

// ── practice sidebar: the last few answers of this session ──
function renderSessionMini() {
  const el = document.getElementById("session-mini");
  if (!el) return;
  const items = [...state.sessionHistory].reverse().slice(0, 8);
  el.innerHTML = items.map((e) => {
    const q = e.question || {};
    const pts = e.points || 0;
    const col = e.isPower ? "var(--yellow)" : pts > 0 ? "var(--green)" : pts < 0 ? "var(--red)" : "var(--muted)";
    let ans = "";
    if (e.type === "bonus") {
      try { ans = (e.answers && e.answers.length ? e.answers : JSON.parse(q.answers_sanitized || "[]")).map(primaryAnswerText).filter(Boolean).join(" / "); } catch (er) { ans = ""; }
    } else ans = primaryAnswerText(e.answer || q.answer_sanitized || "");
    return `<button type="button" class="sm-row" title="${escapeHtml(ans)}"><span class="dot" style="background:${rootColorOf(qPathOf(q))}"></span><span class="a">${escapeHtml(ans || "\u2014")}</span><b style="color:${col}">${pts > 0 ? "+" : ""}${pts}</b></button>`;
  }).join("");
}
document.getElementById("session-mini")?.addEventListener("click", (e) => { if (e.target.closest(".sm-row")) openHistoryOverlay(); });

// ── after answering: category, year, source and the question's tags ──
function showResultActions(on) {
  const a = document.getElementById("result-actions");
  if (a) a.hidden = !on;
}
document.getElementById("btn-result-next")?.addEventListener("click", () => { if (state.resultAreaVisible && state.sessionActive) nextQuestion(); });
function renderResultTags(q) {
  showResultActions(!!q && state.sessionActive);
  if (q) document.getElementById("question-meta")?.classList.remove("qm-reading");
  const el = document.getElementById("result-tags");
  if (!el) return;
  if (!q) { el.innerHTML = ""; return; }
  const src = [q.set_name, q.packet_number ? "packet " + q.packet_number : "", q.question_number ? "#" + q.question_number : ""].filter(Boolean).join(" \u00b7 ");
  el.innerHTML = questionMetaRowHtml(q, "practice", { src });
}

// ── Settings modal: sections on the left, one pane at a time ──
function settingsModal() { return document.getElementById("settings-modal"); }
function isSettingsOpen() { const m = settingsModal(); return !!(m && !m.classList.contains("hidden")); }
function openSettings(sec) {
  const m = settingsModal();
  if (!m) return;
  closeSetupDrawer();
  closeAllPops();
  try { initSettings(); } catch (e) { console.error(e); }
  showSettingsSection(sec || state._setSec || "gameplay");
  m.classList.remove("hidden");
  try { m.querySelector(".set-modal")?.focus({ preventScroll: true }); } catch (e) {}
}
function closeSettings() {
  if (_dbLocked || !isSettingsOpen()) return false;
  state.hotkeyRebinding = null;
  settingsModal().classList.add("hidden");
  return true;
}
function toggleSettings(sec) { if (isSettingsOpen() && !sec) closeSettings(); else openSettings(sec); }
function showSettingsSection(sec) {
  if (_dbLocked) sec = "updates";
  const panes = [...document.querySelectorAll("#set-body .set-pane")];
  if (!panes.some((p) => p.dataset.pane === sec)) sec = "gameplay";
  const navBtn = document.querySelector(`#set-nav .set-nav-btn[data-sec="${sec}"]`);
  if (navBtn && navBtn.hidden) sec = "gameplay";
  state._setSec = sec;
  document.querySelectorAll("#set-nav .set-nav-btn").forEach((b) => b.setAttribute("aria-current", String(b.dataset.sec === sec)));
  panes.forEach((p) => p.classList.toggle("on", p.dataset.pane === sec));
  if (sec === "tags") renderTagSettings();
  if (sec === "hotkeys") renderHotkeySettings();
  if (sec === "sound") syncSoundControls();
  if (sec === "profile") { const n = document.getElementById("set-username"); if (n) n.value = state.username || ""; }
  if (sec === "appearance") { const tn = document.getElementById("set-theme-name"); if (tn) tn.textContent = activeTheme()?.name || "Default"; }
  const body = document.getElementById("set-body"); if (body) body.scrollTop = 0;
}
document.getElementById("set-nav")?.addEventListener("click", (e) => { const b = e.target.closest(".set-nav-btn"); if (b) showSettingsSection(b.dataset.sec); });
function renderTagSettings() {
  const d = tagDisplay();
  const sw = document.getElementById("opt-tags-show"); if (sw) sw.checked = d.show;
  const chips = document.getElementById("tag-fam-chips");
  if (chips) chips.innerHTML = TAG_FAM_ORDER.map((f) => `<button type="button" class="chip${d.fams[f] ? " on" : ""}" style="--c:${TAG_FAM[f].color}" data-fam="${f}" aria-pressed="${!!d.fams[f]}"><span class="dot"></span>${escapeHtml(TAG_FAM[f].name)}</button>`).join("");
  document.querySelectorAll("#tag-where input[data-where]").forEach((cb) => { cb.checked = d.where[cb.dataset.where] !== false; });
}
function refreshTagViews() {
  try { if (state.resultAreaVisible && state.currentQuestion) renderResultTags(state.currentQuestion); } catch (e) {}
  try { renderHistoryPanel(); } catch (e) {}
  try { if (document.querySelector("#database-screen.active") && (state.dbTab || "search") === "search" && document.getElementById("db-results")) performDbSearch({ page: _dbPage }); } catch (e) {}
}
document.getElementById("opt-tags-show")?.addEventListener("change", (e) => { setTagDisplay({ show: e.target.checked }); refreshTagViews(); });
document.getElementById("tag-fam-chips")?.addEventListener("click", (e) => {
  const b = e.target.closest("[data-fam]"); if (!b) return;
  const d = tagDisplay();
  setTagDisplay({ fams: { [b.dataset.fam]: !d.fams[b.dataset.fam] } });
  renderTagSettings(); refreshTagViews();
});
document.getElementById("tag-where")?.addEventListener("change", (e) => {
  const cb = e.target.closest("input[data-where]"); if (!cb) return;
  setTagDisplay({ where: { [cb.dataset.where]: cb.checked } }); refreshTagViews();
});
document.getElementById("set-username")?.addEventListener("change", (e) => {
  const v = e.target.value.trim().slice(0, 24);
  if (!v) { e.target.value = state.username || ""; return; }
  state.username = v; lsSet("qb-username", v);
  renderGreeting(); renderTopbarProfile();
  pushAccountName(v);   // signed in: the account (website, other devices) gets it too
});
document.getElementById("btn-open-profile")?.addEventListener("click", () => { closeSettingsOverlays(); goTo("player"); });
document.getElementById("btn-browse-themes")?.addEventListener("click", () => { closeSettingsOverlays(); goTo("plugins-themes"); });

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


// Settings → Sound (this device, localStorage "qb-sound"): off unless turned on;
// a volume, and the tick on button presses. Every sound — plugins' included
// (ctx.host.playSound) — goes through _beep, so this one gate covers them all.
const SOUND_LS = "qb-sound";
function soundPrefs() {
  if (soundPrefs._c) return soundPrefs._c;
  let p = {}; try { p = JSON.parse(lsGet(SOUND_LS) || "{}") || {}; } catch (e) {}
  return (soundPrefs._c = { on: p.on === true, vol: Math.max(10, Math.min(100, Number(p.vol) || 70)), clicks: p.clicks !== false });
}
function setSoundPrefs(ch) { const p = { ...soundPrefs(), ...ch }; soundPrefs._c = p; lsSet(SOUND_LS, JSON.stringify(p)); syncSoundControls(); }
function syncSoundControls() {
  const p = soundPrefs(), on = document.getElementById("opt-sound"), v = document.getElementById("opt-sound-volume"), vl = document.getElementById("opt-sound-volume-val"), ck = document.getElementById("opt-sound-clicks");
  if (on) on.checked = p.on;
  if (v) { v.value = String(p.vol); try { v.style.setProperty("--pct", ((p.vol - 10) / 90) * 100 + "%"); } catch (e) {} }
  if (vl) vl.textContent = p.vol + "%";
  if (ck) ck.checked = p.clicks;
  document.querySelectorAll("#ovl-sound .sound-sub").forEach((r) => r.classList.toggle("is-off", !p.on));
}
document.getElementById("opt-sound")?.addEventListener("change", (e) => { setSoundPrefs({ on: e.target.checked }); if (e.target.checked) Sound.correct(); });
document.getElementById("opt-sound-volume")?.addEventListener("input", (e) => setSoundPrefs({ vol: parseInt(e.target.value, 10) || 70 }));
document.getElementById("opt-sound-volume")?.addEventListener("change", () => Sound.correct());
document.getElementById("opt-sound-clicks")?.addEventListener("change", (e) => setSoundPrefs({ clicks: e.target.checked }));
syncSoundControls();

const Sound = {
  _ctx: null,
  _init() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
  },
  _beep(freq, len, type = "square", vol = 0.08) {
    const p = soundPrefs();
    if (!p.on) return;
    vol *= p.vol / 70;   // 70 % is the sounds' own level
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
  click()  { if (soundPrefs().clicks) this._beep(620, 0.02, "square", 0.022); },
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
    if (e.target.closest("#cat-ovl")) return;   // the category GUI sits inside the panel
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
// Screens whose contents have been built at least once this session. Coming
// BACK to one re-shows it instead of rebuilding it — the rebuild is exactly
// what wiped the user's filters, search text and results.
const _screenBuilt = new Set();

// `display:none` drops every scroll offset inside a screen, so each screen's
// offsets are snapshotted on the way out and replayed on the way back in.
// Keyed by screen element id, so plugin pages get this for free.
const _scrollState = new Map();
function _scrollables(root) {
  const out = [root];
  root.querySelectorAll("*").forEach((el) => { if (el.scrollHeight > el.clientHeight + 4) out.push(el); });
  return out;
}
function _scrollKey(root, el) {
  if (el === root) return ":root";
  if (el.id) return "#" + el.id;
  const p = el.parentElement;
  return p ? el.tagName + ":" + Array.prototype.indexOf.call(p.children, el) + "@" + (p.id || p.className || "") : null;
}
function saveScreenScroll() {
  const cur = document.querySelector(".screen.active");
  if (!cur || !cur.id) return;
  const map = {};
  _scrollables(cur).forEach((el) => {
    const k = _scrollKey(cur, el);
    if (k && el.scrollTop > 0) map[k] = el.scrollTop;
  });
  _scrollState.set(cur.id, map);
}
function restoreScreenScroll(screen) {
  if (!screen || !screen.id) return;
  const map = _scrollState.get(screen.id);
  if (!map) return;
  const apply = () => {
    _scrollables(screen).forEach((el) => {
      const k = _scrollKey(screen, el);
      if (k && map[k] != null) el.scrollTop = map[k];
    });
  };
  apply();
  requestAnimationFrame(apply); // again after layout settles
}

// Building a screen is destructive (innerHTML rebuilds at default values);
// reviving one only refreshes what can go stale behind the user's back.
// An ENDED session must not haunt the practice page: next visit starts
// fresh — placeholder, 0 points, empty history. A merely SUSPENDED session
// (sessionActive still true) keeps its page exactly as left.
function resetEndedPracticeView() {
  if (state.sessionActive) return;
  if (!state.questionCount && !state.totalPoints && !state.currentQuestion &&
      !state.histories.tossups.length && !state.histories.bonuses.length) return;   // already fresh
  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }
  stopBuzzTimer();
  stopEventTimer();
  state.questionCount = 0; state.totalPoints = 0; state.powers = 0; state.negs = 0; state.correct = 0;
  state.correctCelerityHistory = []; state.incorrectCelerityHistory = [];
  state.histories = { tossups: [], bonuses: [] };
  state.currentQuestion = null; state.lastResult = null; state.resultOverridden = false;
  state._wantBonus = false; state._pendingPairedBonus = null; state._pairPrefetch = null;
  resetQuestionUI();
  const sc = $("#session-counter"); if (sc) sc.textContent = "0";
  updateSessionStats();
  renderHistoryPanel();
  const sb = $("#btn-start-session"); if (sb) sb.innerHTML = keyLabelHtml("start-skip", "Start Session");
  updateLiveStats();
}

function buildScreen(name) {
  if (name === "practice-tossups") { setMode("tossups"); resetEndedPracticeView(); }
  else if (name === "practice-bonuses") { setMode("bonuses"); resetEndedPracticeView(); }
  else if (name === "stats") loadStats();
  else if (name === "database") loadDatabase();
  else if (name === "settings") initSettings();
  else if (name === "player") loadPlayer();
  else if (name === "extensions") window.QB?.renderScreen();
  else if (name === "friends") renderFriends();
  else if (name === "leaderboards") renderLeaderboards();
}
function reviveScreen(name) {
  if (name === "database") {
    // Stars/provider tabs can change while away; the tab BODY is left as the
    // user left it (filters, query, results, scroll).
    refreshDbStarred();
    renderDbProviderTabs();
    syncDbTabActive();
  } else if (name === "extensions") window.QB?.renderScreen();
  else if (name === "practice-tossups" || name === "practice-bonuses") {
    // Keep the mode pinned without re-running the filter restore.
    state.mode = name === "practice-tossups" ? "tossups" : "bonuses";
    state._practiceBase = state.mode;
    resetEndedPracticeView();
  }
}
function navigateTo(name, opts) {
  const back = opts ? !!opts.back : _navBack;
  if (name.includes("::")) {
    if (window.QB?.showPage?.(name, { back })) return;
    name = "title";
  }
  showScreen(name, { back });
  // On Back, re-show an already-built screen instead of rebuilding it.
  if (back && _screenBuilt.has(name)) reviveScreen(name);
  else buildScreen(name);
}
function goBack() {
  if (window.QB?.handleBack?.()) return;
  if (dbBrowseBack()) return;
  if (_navCurrent === "stats" && state.statsSessionId) { state.statsSessionId = null; loadStats(); return; }
  if (state.sessionActive) suspendSession();
  state.escOnce = false;
  clearTimeout(state.escTimer);
  hideEscHint();
  const prev = _navStack.pop() || "title";
  _navBack = true;
  try { navigateTo(prev); } finally { _navBack = false; }
}

function showScreen(name, opts) {
  // Settings is a modal over whatever is showing, not a screen of its own.
  if (name === "settings") { openSettings(); return; }
  if (_dbLocked) return;   // locked on Settings → Updates until the new database is open
  // A settings modal left open would float its click-eating backdrop over the
  // next screen (the "Back did nothing / buttons stopped working" bug).
  try { closeSettingsOverlays(); } catch (e) {}
  try { closeSetupDrawer(); } catch (e) {}
  try { flushPendingFilterSave(); } catch (e) {}   // while state.mode still names the outgoing tab
  const back = opts ? !!opts.back : _navBack;
  saveScreenScroll(); // must run while the outgoing screen is still visible
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
  // Fresh entries start collapsed; Back hands the panel back as it was left.
  if (mapped === "practice" && !back) collapseFilterSections();
  if (mapped === "title") {
    loadTitleArt();
    refreshReviewBadge();
    // Keep the greeting in sync — a rename on the Profile screen must show
    // everywhere immediately, not only after a restart.
    renderGreeting();
    ensureHomeBg();
    streakNow().then(renderStreak).catch(() => {});   // the day streak, with whatever was just practiced
  }
  updateTopbar();
  qbEmit("screen:change", { name, back });
  if (screen) restoreScreenScroll(screen);
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
  // Suspend, don't end — returning to practice resumes where you left off.
  if (state.sessionActive) suspendSession();
  state.escOnce = false;
  clearTimeout(state.escTimer);
  hideEscHint();
  showScreen("title");
}

// Where a second [Esc] is required. Everywhere else one press goes back —
// `state.sessionActive` stays true while a session is merely SUSPENDED, so
// gating on it alone made every screen in the app demand two presses once the
// user had ever started practising.
function needsEscConfirm() {
  const active = document.querySelector(".screen.active");
  if (!active) return false;
  // Mid-question in tossups/bonuses: leaving costs the buzz, so confirm.
  if (active.id === "practice-screen") return !!state.sessionActive;
  // Multiplayer: only inside a room (leaving drops you out of a live game for
  // everyone else); the join screen leaves on one Esc.
  return active.id.startsWith("ext-page-multiplayer-") && active.classList.contains("mp-in-room");
}

function showEscHint() {
  let el = document.getElementById("esc-hint");
  if (!el) {
    el = document.createElement("div");
    el.id = "esc-hint";
    el.className = "esc-hint";
    el.textContent = "Press [Esc] again to leave";
    // Anchor to whatever is on screen: #question-area only exists on the
    // practice screen, so on multiplayer the hint would be invisible and the
    // first press would look like it did nothing.
    const active = document.querySelector(".screen.active");
    ($("#question-area")?.closest(".screen.active") ? $("#question-area") : active)?.appendChild(el);
  }
}

function hideEscHint() {
  const el = document.getElementById("esc-hint");
  if (el) el.remove();
}


function toggleHotkeySheet() {
  let el = document.getElementById("hotkey-sheet");
  if (el) { animateRemove(el); return; }
  el = document.createElement("div");
  el.id = "hotkey-sheet";
  el.className = "hotkey-sheet";
  const rows = allHotkeyActions()
    .map((a) => `<div class="hk-row"><span>${escapeHtml(a.label)}</span><kbd>${escapeHtml(keyDisplay(a.action))}</kbd></div>`)
    .join("");
  el.innerHTML =
    `<div class="hotkey-sheet-box">
      <div class="hotkey-sheet-title">KEYBOARD SHORTCUTS</div>
      ${rows}
      <div class="hk-row"><span>Show this sheet</span><kbd>?</kbd></div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) animateRemove(el); });
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
    if (e.metaKey) parts.push("Meta");
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    parts.push(e.code === "Space" ? "Space" : e.key);
    const newBinding = parts.join("+");
    const action = state.hotkeyRebinding;
    state.hotkeyRebinding = null;
    const conflict = bindingConflict(action, newBinding);
    if (conflict) {
      state._hotkeyError = action;
      state._hotkeyErrorBy = conflict.label;   // the row shows "Used by …" for 1.6s
      renderHotkeySettings();
      clearTimeout(state._hotkeyErrTimer);     // a second conflict must not be cut short by the first's timer
      state._hotkeyErrTimer = setTimeout(() => { state._hotkeyError = null; renderHotkeySettings(); }, 1600);
      return;
    }
    clearTimeout(state._hotkeyErrTimer); state._hotkeyError = null;   // an accepted key never shows a stale "Used by"
    state.settings.hotkeys[action] = newBinding;
    lsSet("qb-hotkeys", JSON.stringify(state.settings.hotkeys));
    renderHotkeySettings();
    updateKeyLabels();
    return;
  }

  // the website leaves Cmd+= / Cmd+- / Cmd+0 to the browser's own zoom
  if (!IS_WEB && matchesHotkey(e, "text-bigger")) { e.preventDefault(); setUiScale((state.settings.uiScale || 1) + 0.05); return; }
  if (!IS_WEB && matchesHotkey(e, "text-smaller")) { e.preventDefault(); setUiScale((state.settings.uiScale || 1) - 0.05); return; }
  if (!IS_WEB && matchesHotkey(e, "text-reset")) { e.preventDefault(); setUiScale(1); return; }

  // ANSWERING BLOCKS EVERY HOTKEY. Focus alone was not enough: buzzing focuses
  // the input 50ms later and clicking the question text drops focus to the
  // body, so "n" used to skip to the next question mid-answer. Escape still
  // works (leaving/closing), and the zoom keys above are modifier-only.
  if (e.key !== "Escape" && isAnsweringNow()) return;

  {
    const tag = e.target.tagName;
    if (e.key === "?" && tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
      toggleHotkeySheet();
      return;
    }
  }

  if (e.key === "Escape") {
    // Only VISIBLE overlays count, and the persistent settings modals are
    // excluded — they live in the DOM even while hidden, so the old selector
    // silently .remove()d one per Esc press until the section buttons had
    // nothing left to open (the "Esc kills the settings buttons" bug).
    const overlays = [
      ...document.querySelectorAll("#confirm-dialog, #save-menu, #review-menu, #review-viewer, #history-overlay, #hotkey-sheet, .qb-overlay:not(.settings-ovl), .fo-overlay, .ar-overlay"),
    ].filter((el) => !el.classList.contains("hidden") && getComputedStyle(el).display !== "none");
    if (overlays.length) { e.preventDefault(); animateRemove(overlays[overlays.length - 1]); return; }
    if (needsEscConfirm()) {
      if (state.escOnce) {
        clearTimeout(state.escTimer);
        state.escOnce = false;
        // Leaving KEEPS the session (goBack suspends it) so returning resumes
        // the same question. Ending is explicit: the End Session button or the
        // end-session hotkey.
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

  // A confirm dialog owns the keyboard: Enter confirms, nothing fires behind it.
  if (document.querySelector("#confirm-dialog:not(.qb-leaving)")) {
    if (e.key === "Enter") { e.preventDefault(); document.getElementById("cf-yes")?.click(); }
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

  if (activeScreen.id === "title-screen") return;   // the home's 1–7 page keys are gone (14.39)

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
      confirmEndSession(goHome);
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
    if (state.resultAreaVisible && state.mode === "bonuses" && state._bonusRecorded) {
      if (matchesHotkey(e, "mark-correct")) { e.preventDefault(); applyBonusOverride(state._bonusLastIdx != null ? state._bonusLastIdx : 2, true); }
      else if (matchesHotkey(e, "mark-incorrect")) { e.preventDefault(); applyBonusOverride(state._bonusLastIdx != null ? state._bonusLastIdx : 2, false); }
    }
    if (e.key === "Enter" && state.resultAreaVisible && !isInput) {
      e.preventDefault();
      nextQuestion();
    }
  }
});


// The default look comes in dark and light: the top-bar sun/moon switches it
// and "qb-scheme" remembers it. (The old switch's "qb-theme" is not read: its
// light turned only the base colors light.) An installed theme paints its own
// colors over the dark base, so the toggle hides while one is on.
function uiScheme() { try { return localStorage.getItem("qb-scheme") === "light" ? "light" : "dark"; } catch (e) { return "dark"; } }
function applyTheme() {
  const themed = !!activeTheme();
  document.documentElement.setAttribute("data-theme", themed ? "dark" : uiScheme());
  // The old accent switch (qb-accent: magenta / gold / red / mono) is retired —
  // Appearance's accent replaced it — but a value it saved still recoloured the
  // greens, reds and yellows (the app's Multiplayer button looked dull).
  document.documentElement.removeAttribute("data-accent");
  const b = document.getElementById("tb-scheme");
  if (b) {
    b.hidden = themed;
    const light = uiScheme() === "light";
    b.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    b.title = light ? "Dark mode" : "Light mode";
    b.querySelector(".ic-sun")?.toggleAttribute("hidden", light);
    b.querySelector(".ic-moon")?.toggleAttribute("hidden", !light);
  }
  const row = document.getElementById("row-light-mode"), sw = document.getElementById("opt-light-mode");
  if (row) row.hidden = themed;
  if (sw) sw.checked = uiScheme() === "light";
}
function toggleScheme() {
  lsSet("qb-scheme", uiScheme() === "light" ? "dark" : "light");
  applyTheme();
  applyDefaultAppearance();
}

applyTheme();

// ── custom info tooltips (.qb-info[data-tip]) ──────────────────────────────
// Our own hover card, not the OS title bubble: instant-ish, themed, and it
// works identically in Electron and the dev browser.
{
  let tipEl = null, tipTimer = null;
  const showTip = (icon) => {
    if (!icon.isConnected) return;   // re-rendered away during the delay
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.id = "qb-tooltip"; document.body.appendChild(tipEl); }
    tipEl.textContent = icon.dataset.tip || "";
    tipEl.classList.remove("on");
    const r = icon.getBoundingClientRect();
    tipEl.style.left = "0px"; tipEl.style.top = "0px";
    // measure after content is set, then clamp inside the viewport
    requestAnimationFrame(() => {
      if (!icon.isConnected) return;
      const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
      let x = r.left + r.width / 2 - tw / 2;
      x = Math.max(8, Math.min(window.innerWidth - tw - 8, x));
      let y = r.top - th - 8;
      if (y < 8) y = r.bottom + 8;
      tipEl.style.left = x + "px"; tipEl.style.top = y + "px";
      tipEl.classList.add("on");
    });
  };
  const hideTip = () => { clearTimeout(tipTimer); tipTimer = null; if (tipEl) tipEl.classList.remove("on"); };
  // Any pointer move onto something that is not an ⓘ hides the tip: when a
  // hotkey re-renders the icon away under the pointer, no mouseout ever fires
  // for it, and the tip used to stay up on every screen after.
  document.addEventListener("mouseover", (e) => {
    const icon = e.target.closest?.(".qb-info, .stk-cell[data-tip]");   // ⓘs, and the Streaks page's days
    if (!icon || !icon.dataset.tip) { hideTip(); return; }
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => showTip(icon), 120);
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest?.(".qb-info, .stk-cell[data-tip]")) hideTip();
  });
  document.addEventListener("scroll", hideTip, true);
  // hotkeys re-render what the tip points at. WINDOW capture, registered before
  // the Categories window's key guard (which stops propagation), so it always runs.
  window.addEventListener("keydown", hideTip, true);
}

// ── idle update reminder ───────────────────────────────────────────────────
// If an update is available and the user has been away for 30+ minutes, the
// SAME update dialog that appears at launch pops up (Update / Ignore). One
// attempt per idle stretch; "Ignore" silences that version everywhere, and a
// newer version prompts again. The check is a manifest peek — nothing
// downloads until the user clicks Update.
let _lastActive = Date.now(), _idleReminded = false;
["pointerdown", "keydown", "mousemove", "wheel"].forEach((ev) =>
  document.addEventListener(ev, () => { _lastActive = Date.now(); _idleReminded = false; }, { passive: true })
);
const IDLE_REMIND_MS = 30 * 60 * 1000;
async function _maybeIdleUpdateReminder() {
  if (_idleReminded || Date.now() - _lastActive < IDLE_REMIND_MS) return;
  if (document.getElementById("update-dialog")) return;   // one is already up
  _idleReminded = true;   // one attempt per idle stretch, even on errors
  let peek = null;
  try { peek = await peekAppUpdate(); } catch { return; }
  if (!peek || peek.dev || peek.error || peek.configured === false || !peek.available) return;
  if (lsGet("qb-ignored-update") === String(peek.version)) return;
  showUpdateDialog(peek, { installed: false });
}
setInterval(_maybeIdleUpdateReminder, 60 * 1000);

{
  const z = IS_WEB ? 1 : parseFloat(lsGet("qb-ui-scale") || "1");   // the website: the browser's zoom only
  if (z && z !== 1) { state.settings.uiScale = z; _applyUiScale(z); }
}


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
  loadTitleArt();
  renderGreeting();
  renderTopbarProfile();
  ensureHomeBg();
  try {
    renderStreak(await streakNow());
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
    const n = _reviewItems.length;
    const c = document.getElementById("review-count"); if (c) c.textContent = n ? String(n) : "";
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
  const el = document.createElement("div");
  el.id = "review-menu";
  el.className = "qb-overlay review-ovl";
  el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "rv-h");
  const seg = [["", "All"], ["tossup", "Tossups"], ["bonus", "Bonuses"]].map(([v, l]) => `<button type="button" data-rvtype="${v}" aria-pressed="${!v}">${l}</button>`).join("");
  const diffs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => `<label title="${escapeHtml(DIFF_FULL[d] || "")}"><input type="checkbox" class="rv-diff" value="${d}"><span>${d}</span></label>`).join("");
  el.innerHTML = `
    <div class="settings-modal rv-modal" tabindex="-1">
      <div class="modal-head"><h2 id="rv-h">Review</h2><span class="rv-due num">${items.length.toLocaleString()} to review</span><span class="spacer"></span>
        <button type="button" class="btn btn-ghost btn-icon" id="rv-x" aria-label="Close">${ic("x")}</button></div>
      <div class="rv-cols">
      <div class="rv-body">
        <div class="rv-f"><span class="rv-k">Categories</span><button type="button" id="rv-cat-btn"></button></div>
        <div class="rv-f"><span class="rv-k">Type</span><div class="seg" id="rv-type-seg" role="group" aria-label="Question type">${seg}</div></div>
        <div class="rv-f"><span class="rv-k">Difficulty</span><div class="diff-toggles" id="rv-diffs" role="group" aria-label="Difficulty">${diffs}</div></div>
        <div class="rv-f"><span class="rv-k">Missed <span class="qb-info" data-tip="How long ago you last missed the question.">i</span></span>
          <div class="dual-range rv-dual"><div class="dual-range-track"><div class="dual-range-fill" id="rv-fill"></div></div>
            <input type="range" id="rv-lo" min="0" max="9" step="1" value="0" aria-label="Newest">
            <input type="range" id="rv-hi" min="0" max="9" step="1" value="9" aria-label="Oldest"></div>
          <span class="rv-range num" id="rv-rangeval"></span></div>
        <div class="rv-f"><span class="rv-k"></span><label class="checkbox-row"><input type="checkbox" id="rv-remove"${reviewRemoveAfter() ? " checked" : ""}> Remove when correct</label></div>
      </div>
      <aside class="rv-side" aria-label="Matching questions">
        <div class="rv-total"><b class="num" id="rv-total-n">0</b><span id="rv-matchcount"></span></div>
        <div class="rv-split num" id="rv-split"></div>
        <div class="eyebrow rv-side-h">By category</div>
        <div class="rv-bars" id="rv-bars"></div>
      </aside>
      </div>
      <div class="modal-foot rv-foot">
        <button type="button" class="btn btn-ghost" id="rv-saved">Saved items<span class="btn-num">${itemReviewList().length}</span></button>
        <button type="button" class="btn btn-ghost rv-danger" id="rv-clearall">Remove all</button>
        <span class="spacer"></span>
        <button type="button" class="btn" id="rv-view">View</button>
        ${hasFlashcards ? '<button type="button" class="btn" id="rv-cards">Flashcards</button>' : ""}
        <button type="button" class="btn btn-primary" id="rv-play">${ic("play", 14)}<span id="rv-play-l">Play</span></button>
      </div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) animateRemove(el); });
  document.body.appendChild(el);
  el.querySelector("#rv-x").onclick = () => animateRemove(el);

  const lo = el.querySelector("#rv-lo"), hi = el.querySelector("#rv-hi");
  let typ = "";
  const cat = CategoryButton(el.querySelector("#rv-cat-btn"), { label: "", live: true, onChange: () => paint() });
  function ageBand() {
    let mn = Math.min(parseInt(lo.value), parseInt(hi.value));
    let mx = Math.max(parseInt(lo.value), parseInt(hi.value));
    if (mn === mx) { if (mx < 9) mx++; else mn--; }
    return { lo: AGE_STOPS[mn], hi: AGE_STOPS[mx], mnI: mn, mxI: mx };
  }
  function selectedDiffs() {
    return new Set([...el.querySelectorAll(".rv-diff:checked")].map((cb) => parseInt(cb.value)));
  }
  function matching() {
    const band = ageBand();
    const diffs = selectedDiffs();
    return items.filter((it) => {
      const age = it.ageMs == null ? 0 : it.ageMs;
      if (age < band.lo || age > band.hi) return false;
      if (!cat.matches(it.path || it.category || "")) return false;
      if (typ && (it.type || "tossup") !== typ) return false;
      if (diffs.size && it.difficulty != null && !diffs.has(it.difficulty)) return false;
      return true;
    });
  }
  function paint() {
    const band = ageBand();
    const mn = band.mnI, mx = band.mxI;
    el.querySelector("#rv-rangeval").textContent = AGE_LABELS[mn] + " – " + AGE_LABELS[mx];
    const fill = el.querySelector("#rv-fill");
    if (fill) { fill.style.left = (mn / 9) * 100 + "%"; fill.style.right = ((9 - mx) / 9) * 100 + "%"; }
    const m = matching();
    const tus = m.filter((it) => (it.type || "tossup") === "tossup").length;
    el.querySelector("#rv-total-n").textContent = m.length.toLocaleString();
    el.querySelector("#rv-matchcount").textContent = m.length === items.length ? (m.length === 1 ? "question" : "questions") : "of " + items.length.toLocaleString() + " match";
    el.querySelector("#rv-split").textContent = tus.toLocaleString() + (tus === 1 ? " tossup" : " tossups") + " \u00b7 " + (m.length - tus).toLocaleString() + (m.length - tus === 1 ? " bonus" : " bonuses");
    // due by root category; a bar narrows the picker to that category
    const byRoot = new Map();
    for (const it of m) { const r = String(it.path || it.category || "Other").split(" > ")[0] || "Other"; byRoot.set(r, (byRoot.get(r) || 0) + 1); }
    const rows = [...byRoot].sort((a, b) => b[1] - a[1]);
    const top = rows.length ? rows[0][1] : 1;
    const t = cat.tree(), picked = new Set(cat.get());
    el.querySelector("#rv-bars").innerHTML = rows.length ? rows.map(([r, n]) => {
      const node = t && t.byPath.get(r);
      return `<button type="button" class="rv-bar${node && picked.size === 1 && picked.has(node.id) ? " on" : ""}" data-root="${escapeHtml(r)}"${node ? "" : " disabled"}><span class="dot" style="background:${rootColorOf(r)}"></span><span class="rv-bar-n">${escapeHtml(r)}</span><span class="rv-bar-t"><i style="width:${Math.max(3, Math.round(100 * n / top))}%;background:${rootColorOf(r)}"></i></span><span class="rv-bar-c num">${n.toLocaleString()}</span></button>`;
    }).join("") : '<div class="rv-empty">Nothing matches</div>';
    el.querySelector("#rv-play-l").textContent = tus ? "Play " + tus.toLocaleString() + (tus === 1 ? " tossup" : " tossups") : "Play";
    const pb = el.querySelector("#rv-play"); if (pb) pb.disabled = !tus;
    const cb = el.querySelector("#rv-cards"); if (cb) cb.disabled = !tus;
    const vb = el.querySelector("#rv-view"); if (vb) vb.disabled = !m.length;
  }
  clampDualRange(lo, hi);
  lo.addEventListener("input", paint); hi.addEventListener("input", paint);
  el.querySelector("#rv-type-seg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-rvtype]"); if (!b) return;
    typ = b.dataset.rvtype;
    el.querySelectorAll("#rv-type-seg [data-rvtype]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    paint();
  });
  el.querySelectorAll(".rv-diff").forEach((cb) => cb.addEventListener("change", paint));
  el.querySelector("#rv-bars").addEventListener("click", (e) => {
    const b = e.target.closest(".rv-bar"); const t = cat.tree(); if (!b || !t) return;
    const node = t.byPath.get(b.dataset.root); if (!node) return;
    cat.set(b.classList.contains("on") ? [] : [node.id]);
    paint();
  });
  cat.ready.then(() => paint());
  paint();
  el.querySelector("#rv-remove").addEventListener("change", (e) => localStorage.setItem("qb-review-remove", e.target.checked.toString()));

  el.querySelector("#rv-play").onclick = () => {
    const ids = matching().filter((it) => (it.type || "tossup") === "tossup").map((it) => it.id);
    if (!ids.length) return;   // the button is disabled then
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
    }, { yes: "Remove all", danger: true });
  };
}

function reviewAsFlashcards(ids) {
  const pages = window.QB?.getActivePages?.() || [];
  const page = pages.find((p) => p.id.startsWith("flashcards::"));
  if (!page) return;
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
        <button type="button" id="rv-fcat-btn"></button>
        <input type="text" id="rv-vsearch" class="mode-input" placeholder="Search answer / text" autocomplete="off">
      </div>
      <div class="review-viewer-list"><div class="text-muted" style="padding:12px">Loading…</div></div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) animateRemove(el); });
  document.body.appendChild(el);
  el.querySelector("#rv-close").onclick = () => animateRemove(el);
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
    const dataAttrs = ` data-rvqid="${escapeHtml(q.id)}" data-rvtype="${type}" data-rvsearch="${escapeHtml(search)}" data-path="${escapeHtml(qPathOf(q))}"`;
    if (type === "bonus") {
      let parts = [], answers = [], raws = [];
      try { parts = JSON.parse(q.parts_sanitized || "[]"); } catch {}
      try { answers = JSON.parse(q.answers_sanitized || "[]"); } catch {}
      try { raws = JSON.parse(q.answers || "[]"); } catch {}
      const body = `<div class="qcard-text">${escapeHtml(q.leadin_sanitized || "")}</div>` +
        parts.map((pt, k) => `<div class="qcard-part">[${bonusPartValues(q).values[k] || 10}] ${escapeHtml(pt)}<br><span class="ans">ANSWER: ${answerLineHtml(raws[k], answers[k] || "")}</span></div>`).join("");
      return qcardHtml({
        compact: false, question: q, tagsWhere: "starred", category: q.category, subcategory: q.subcategory, year: q.set_year, difficulty: q.difficulty,
        attrs: dataAttrs,
        sideHtml: `<span class="pill">BONUS</span>` + side,
        answerHtml: `Bonus · ${parts.length} parts`,
        bodyHtml: body,
      });
    }
    const fake = { type: "tossup", question: q, buzzPosition: it.buzzPosition || 0 };
    return qcardHtml({
      compact: false, question: q, tagsWhere: "starred", category: q.category, subcategory: q.subcategory, altSub: q.alternate_subcategory, year: q.set_year, difficulty: q.difficulty,
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
  const vs = el.querySelector("#rv-vsearch"), ftype = el.querySelector("#rv-ftype");
  const vcat = CategoryButton(el.querySelector("#rv-fcat-btn"), { live: true, onChange: () => applyFilters() });
  function applyFilters() {
    const q = (vs.value || "").toLowerCase().trim();
    const ty = ftype ? ftype.value : "";
    list.querySelectorAll(".qcard[data-rvqid]").forEach((card) => {
      let show = true;
      if (ty && (card.getAttribute("data-rvtype") || "tossup") !== ty) show = false;
      if (!vcat.matches(card.getAttribute("data-path") || "")) show = false;
      if (q && (card.getAttribute("data-rvsearch") || "").indexOf(q) < 0) show = false;
      card.classList.toggle("hidden", !show);
    });
  }
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
  state.bonusIds = null;          // a stale list of the other type must not resume later
  state.customType = "tossups";
  state.reviewIds = [...ids];
  state._reviewRemoveAfter = reviewRemoveAfter();
  showScreen("practice-tossups");
  setMode("tossups");
  startSession();
}
function startBonusIdsSession(ids) {
  if (!ids || !ids.length) return;
  state.reviewIds = null;
  state.customType = "bonuses";
  state.bonusIds = [...ids];
  showScreen("practice-bonuses");
  setMode("bonuses");
  startSession();
}

// (The home buttons navigate through the [data-go] handler in the app shell.)


let allCategories = [];

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
  // Never persist a panel that has no tree yet (the "Loading…" placeholder):
  // that would save an empty selection over the real one.
  if (_applyingSnapshot) return;
  if (!document.querySelector("#category-filters .category-group")) return;
  // Custom list showing: save into the LIST's bucket (state.mode may already be
  // null or the other type by the time a debounced save fires) and substitute
  // the user's real mode + difficulties for the emptied display.
  const cv = _customView;
  const bucket = cv ? cv.type : filtersMode();
  const prev = loadFilterBlob()[bucket] || null;
  const filterState = {
    catTree: catStateFromDom(),
    standard: $("#filter-standard")?.checked,
    difficulties: cv ? cv.prevDiffs.slice() : getSelectedDifficulties(),
    mode: cv ? cv.prevMode : ($("#mode-select")?.value || "random"),
    setName: $("#mode-set-name")?.value || "",
    packet: $("#mode-packet")?.value || "",
    starredOnly: $("#filter-starred")?.checked,
    powermarkOnly: $("#filter-powermark")?.checked,
    cleanOnly: !!$("#filter-clean")?.checked,
    yearMin: $("#year-min")?.value,
    yearMax: $("#year-max")?.value,
    tags: practiceTags(),
    settings: Object.fromEntries(PER_MODE_SETTING_KEYS.map((k) => [k, state.settings[k]])),
  };
  if (filterState.mode === "custom") filterState.mode = "random";   // never persist the placeholder
  const blob = loadFilterBlob();
  blob[bucket] = filterState;
  lsSet("qb-filters", JSON.stringify(blob));
}
const PER_MODE_SETTING_KEYS = ["allowRebuzzes", "stopOnPower", "allowSkips", "strictness", "useWeights", "buzzTimeout", "buzzWindow", "bonusTimer", "revealSpeed", "autoReveal", "bonusAfter", "hidePronunciations", "hideNotes", "showQuestionMeta"];
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
    if ($("#filter-clean")) $("#filter-clean").checked = !!saved.cleanOnly;
    if (Array.isArray(saved.difficulties)) {
      $$("#difficulty-filters .diff-checkbox").forEach((cb) => {
        cb.checked = saved.difficulties.includes(parseInt(cb.value));
      });
    }
    if (saved.yearMin !== undefined) $("#year-min").value = saved.yearMin;
    if (saved.yearMax !== undefined) $("#year-max").value = saved.yearMax;
    if (saved.setName !== undefined && $("#mode-set-name")) $("#mode-set-name").value = currentSetName(saved.setName);
    if (saved.packet !== undefined && $("#mode-packet")) $("#mode-packet").value = saved.packet;
    setPracticeTags(Array.isArray(saved.tags) ? saved.tags : []);
    applyModeSettings(saved);
    updateModeFields();
    updateYearLabel();
    return saved;
  } catch { return false; }
}

function restoreCategorySelections(saved) {
  applyCatState(savedCatState(saved), { initial: true });
}

// ── CATEGORY TREE ────────────────────────────────────────────────────────────
// The question database files every question under ONE node of a category
// tree (up to 6 levels; 12 roots). The panel renders the whole tree at once
// from /api/category-tree, so there is no per-category async loading.
//   • Ticking a node ticks its whole subtree and its ancestors (auto-marked,
//     undone symmetrically when the last ticked child goes).
//   • The SELECTION is the smallest set of whole subtrees: a ticked node with no
//     ticked children means "all of it"; unticking some children narrows it to
//     the ticked children, at any depth (catSelectedUnits).
//   • Filters carry node ids in `categories` (the server reads an id as its
//     subtree), so plugins that forward that key keep working unchanged.
const _catTreeCache = {};   // type -> Promise<{ roots, byId, byPath }>
let _catIndex = null;       // the tree the panel currently shows
let _catLoadGen = 0;
function fetchCatTree(type) {
  const t = type === "bonuses" ? "bonuses" : "tossups";
  if (!_catTreeCache[t]) {
    _catTreeCache[t] = API.get("/api/category-tree?type=" + t).then((d) => {
      const roots = (d && d.tree) || [];
      const byId = new Map(), byPath = new Map();
      const walk = (n, parent) => {
        n.parentId = parent ? parent.id : null;
        byId.set(n.id, n); byPath.set(n.path, n);
        (n.children || []).forEach((c) => walk(c, n));
      };
      roots.forEach((r) => walk(r, null));
      // v1 = the old QBReader-format database (tree synthesized from its labels)
      return { roots, byId, byPath, v1: roots.some((r) => String(r.id).startsWith("v1:")) };
    }).catch((e) => { delete _catTreeCache[t]; throw e; });
  }
  return _catTreeCache[t];
}
function catNodeHtml(n) {
  const kids = n.children || [];
  return `<div class="cat-node${n.depth === 1 ? " category-group" : ""}${n.count ? "" : " cat-empty"}" data-id="${escapeHtml(n.id)}" data-depth="${n.depth}">` +
    `<div class="filter-item cat-row${n.depth > 1 ? " sub-item" : ""}">` +
      `<span class="cat-expand"${kids.length ? "" : ' style="visibility:hidden"'}>▸</span>` +
      `<label class="cat-hit"><input type="checkbox" class="cat-checkbox" value="${escapeHtml(n.id)}"><span class="cat-name">${escapeHtml(n.name)}</span></label>` +
      (n.definition ? `<span class="qb-info cat-def" data-tip="${escapeHtml(n.definition)}">i</span>` : "") +
      `<span class="cat-count text-muted">${n.count}</span>` +
      `<input type="number" class="cat-weight" value="0" min="0" step="10" title="weight (ratio)">` +
    `</div>` +
    (kids.length ? `<div class="subcategory-list cat-children hidden">${kids.map(catNodeHtml).join("")}</div>` : "") +
  `</div>`;
}
function _catNodes(root) { return [...(root || document.getElementById("category-filters") || document).querySelectorAll(".cat-node")]; }
function _catRoots() { const c = document.getElementById("category-filters"); return c ? [...c.children].filter((x) => x.classList.contains("cat-node")) : []; }
function _catRowBox(el) { return el && el.querySelector(":scope > .cat-row .cat-checkbox"); }
function _catW(el) { return el && el.querySelector(":scope > .cat-row .cat-weight"); }
function _catKids(el) { const c = el && el.querySelector(":scope > .cat-children"); return c ? [...c.children].filter((x) => x.classList.contains("cat-node")) : []; }
function _catParent(el) { return (el && el.parentElement && el.parentElement.closest(".cat-node")) || null; }
function _catSet(el, on) {
  const cb = _catRowBox(el); if (!cb) return;
  cb.checked = on; delete cb.dataset.autoChecked;
  const w = _catW(el); if (w) w.value = on ? "10" : "0";
}
function _catEachDesc(el, fn) { _catKids(el).forEach((k) => { fn(k); _catEachDesc(k, fn); }); }
function _catExpand(el, open) {
  const list = el && el.querySelector(":scope > .cat-children"); if (!list) return;
  list.classList.toggle("hidden", !open);
  const a = el.querySelector(":scope > .cat-row .cat-expand"); if (a) { a.textContent = open ? "▾" : "▸"; a.classList.toggle("open", !!open); }
}
function catWeightOf(el) { return parseFloat(_catW(el)?.value) || 0; }
// { whole, units }: units = the node elements whose WHOLE subtree is selected.
function _catUnits(el) {
  const cb = _catRowBox(el);
  if (!cb || !cb.checked) return { whole: false, units: [] };
  const kids = _catKids(el);
  const ticked = kids.filter((k) => _catRowBox(k)?.checked);
  if (!ticked.length) return { whole: true, units: [el] };
  const res = ticked.map(_catUnits);
  if (ticked.length === kids.length && res.every((r) => r.whole)) return { whole: true, units: [el] };
  return { whole: false, units: res.flatMap((r) => r.units) };
}
function catSelectedUnits() { return _catRoots().flatMap((r) => _catUnits(r).units); }
function catNodeLabel(el) {
  const id = el && el.dataset.id;
  const n = id && _catIndex && _catIndex.byId.get(id);
  return n ? n.name : (el?.querySelector(":scope > .cat-row .cat-name")?.textContent || "");
}
function catNodePath(el) {
  const id = el && el.dataset.id;
  const n = id && _catIndex && _catIndex.byId.get(id);
  return n ? n.path : catNodeLabel(el);
}

// Weighted draw: descend the ticked tree by the rows' weights (0 = never drawn
// while any sibling is positive). A whole subtree whose ticked rows all keep
// the default 10 is drawn at its natural mix instead of uniformly per leaf.
function weightedPickCategoryNode() {
  const rootsOn = _catRoots().filter((r) => _catRowBox(r)?.checked);
  if (!rootsOn.length) return null;
  let pick = weightedPick(rootsOn.map((el) => ({ el, weight: catWeightOf(el) })))?.el;
  while (pick) {
    const ticked = _catKids(pick).filter((k) => _catRowBox(k)?.checked);
    if (!ticked.length) return pick;
    // :scope > — a bare ".cat-children …" also matches pick's OWN row through
    // its parent's list, so a weighted non-root pick never drew as itself.
    const untouched = [...pick.querySelectorAll(":scope > .cat-children .cat-checkbox:checked")]
      .every((cb) => (parseFloat(cb.closest(".cat-row")?.querySelector(".cat-weight")?.value) || 0) === 10);
    if (_catUnits(pick).whole && untouched) return pick;
    pick = weightedPick(ticked.map((el) => ({ el, weight: catWeightOf(el) })))?.el;
  }
  return null;
}

// ── selection state (saved per mode, snapshots, migration) ──
function catStateFromDom() {
  const ids = [], auto = [], weights = {};
  document.querySelectorAll("#category-filters .cat-checkbox:checked").forEach((cb) => {
    ids.push(cb.value);
    if (cb.dataset.autoChecked) auto.push(cb.value);
    const v = parseFloat(cb.closest(".cat-row")?.querySelector(".cat-weight")?.value);
    // 10 is implied; a deliberate 0 on a ticked row is kept ("never draw it")
    if (Number.isFinite(v) && v !== 10) weights[cb.value] = v;
  });
  // On the old database the selected units are recorded too: once the new
  // database is installed they are what carries the selection over (the old
  // tree is gone then, so the units could not be worked out from the ids).
  if (_catIndex && _catIndex.v1) return { v: 1, ids, auto, weights, units: catSelectedUnits().map(catNodePath) };
  return { v: 1, ids, auto, weights };
}
// Event-free write of a selection into the rendered tree. initial: collapse
// everything except branches whose selection is NARROWED (so it is visible).
// While the window is open, a live (multiplayer) apply only ever opens lists —
// never closes one the user is browsing.
function applyCatState(st, opts = {}) {
  if (!st) return;
  const want = new Set(st.ids || []), auto = new Set(st.auto || []), wmap = st.weights || {};
  for (const el of _catNodes()) {
    const cb = _catRowBox(el); if (!cb) continue;
    const id = cb.value;
    cb.checked = want.has(id);
    if (cb.checked && auto.has(id)) cb.dataset.autoChecked = "1"; else delete cb.dataset.autoChecked;
    const w = _catW(el);
    if (w) w.value = cb.checked ? String(wmap[id] != null ? wmap[id] : 10) : "0";
  }
  const guiOpen = isCatOverlayOpen() && !opts.initial;
  const visit = (el) => {
    const r = _catUnits(el);
    const partial = _catRowBox(el)?.checked && !r.whole;
    if (partial) _catExpand(el, true);
    else if (!guiOpen) _catExpand(el, false);
    _catKids(el).forEach(visit);
  };
  _catRoots().forEach(visit);
}
// Old (QBReader) category labels -> new tree paths. Used once to carry saved
// selections and old multiplayer snapshots over; unmapped names are dropped.
const OLD_CAT_MAP = {
  "Literature": ["Literature"], "History": ["History"], "Science": ["Science and Math"], "Fine Arts": ["Fine Arts"],
  "Mythology": ["Mythology"], "Religion": ["Theology"], "Philosophy": ["Philosophy"], "Social Science": ["Social Science"],
  "Geography": ["Geography"], "Current Events": ["Current Events"], "Pop Culture": ["Pop Culture Sports"], "Trash": ["Pop Culture Sports"],
  "Other Academic": ["Miscellaneous"],
  "Literature|American Literature": ["Literature > English Literature > American Literature"],
  "Literature|British Literature": ["Literature > English Literature > British Literature"],
  "Literature|Classical Literature": ["Literature > Non English Literature > European Literature > Classical Greek & Latin"],
  "Literature|European Literature": ["Literature > Non English Literature > European Literature"],
  "Literature|World Literature": ["Literature > Non English Literature > World Literature"],
  "Literature|Other Literature": ["Literature > Any Literature", "Literature > Young Reader Literature"],
  "History|American History": ["History > American History"], "History|Ancient History": ["History > Ancient History"],
  "History|European History": ["History > European History"], "History|World History": ["History > World History"],
  "History|Other History": ["History > Cross History"],
  "Science|Biology": ["Science and Math > Science > Biology"], "Science|Chemistry": ["Science and Math > Science > Chemistry"],
  "Science|Physics": ["Science and Math > Science > Physics"],
  "Science|Other Science": ["Science and Math > Math", "Science and Math > Science > Astronomy", "Science and Math > Science > Computer Science", "Science and Math > Science > Earth Science", "Science and Math > Science > Other Science", "Science and Math > Science > Any Science"],
  "Science|Math": ["Science and Math > Math"], "Science|Astronomy": ["Science and Math > Science > Astronomy"],
  "Science|Computer Science": ["Science and Math > Science > Computer Science"], "Science|Earth Science": ["Science and Math > Science > Earth Science"],
  "Science|Engineering": ["Science and Math > Science > Other Science > Engineering"], "Science|Misc Science": ["Science and Math > Science > Other Science"],
  "Fine Arts|Visual Fine Arts": ["Fine Arts > Visual"], "Fine Arts|Auditory Fine Arts": ["Fine Arts > Music"],
  "Fine Arts|Other Fine Arts": ["Fine Arts > Performance", "Fine Arts > Any Fine Arts"],
  "Fine Arts|Architecture": ["Fine Arts > Visual > Architecture"], "Fine Arts|Dance": ["Fine Arts > Performance > Dance"],
  "Fine Arts|Opera": ["Fine Arts > Performance > Opera"], "Fine Arts|Jazz": ["Fine Arts > Music > Jazz"],
  "Fine Arts|Musicals": ["Fine Arts > Performance > Theater"], "Fine Arts|Photography": ["Fine Arts > Visual > Other > Photography"],
  "Fine Arts|Film": ["Fine Arts > Any Fine Arts"], "Fine Arts|Misc Arts": ["Fine Arts > Any Fine Arts"],
  "Pop Culture|Movies": ["Pop Culture Sports > Pop Culture > Film"], "Pop Culture|Music": ["Pop Culture Sports > Pop Culture > Music"],
  "Pop Culture|Sports": ["Pop Culture Sports > Sports"], "Pop Culture|Television": ["Pop Culture Sports > Pop Culture > TV"],
  "Pop Culture|Video Games": ["Pop Culture Sports > Pop Culture > Video Games"],
  "Pop Culture|Other Pop Culture": ["Pop Culture Sports > Pop Culture > Other", "Pop Culture Sports > Pop Culture > Any"],
  "Social Science|Anthropology": ["Social Science > Anthropology Sociology"], "Social Science|Sociology": ["Social Science > Anthropology Sociology"],
  "Social Science|Economics": ["Social Science > Economics"], "Social Science|Psychology": ["Social Science > Psychology"],
  "Social Science|Linguistics": ["Social Science > Any Social Science > Linguistics"],
  "Social Science|Other Social Science": ["Social Science > Government", "Social Science > Jurisprudence", "Social Science > Political Phil", "Social Science > Archaeology", "Social Science > Any Social Science"],
};
// [{name, subs, alts}] (old snapshot) + old weights {"c:X","s:Y","a:Z"} -> tree state
function catStateFromLegacy(cats, weights) {
  const idx = _catIndex;
  if (!idx || !Array.isArray(cats)) return { v: 1, ids: [], auto: [], weights: {} };
  const ids = new Set(), auto = new Set(), w = {};
  const tickWhole = (n) => { ids.add(n.id); (n.children || []).forEach(tickWhole); };
  const markAncestors = (n) => { for (let p = n.parentId && idx.byId.get(n.parentId); p; p = p.parentId && idx.byId.get(p.parentId)) if (!ids.has(p.id)) { ids.add(p.id); auto.add(p.id); } };
  const nodesFor = (key) => {
    if (!idx.v1) return (OLD_CAT_MAP[key] || []).map((p) => idx.byPath.get(p)).filter(Boolean);
    // Still on the old database: its tree IS the old labels ("Science", "Science >
    // Biology"); an alternate subcategory sits one level further down.
    const [cat, sub] = key.split("|");
    const root = idx.byPath.get(cat);
    if (!root || !sub) return root ? [root] : [];
    const direct = idx.byPath.get(cat + " > " + sub);
    if (direct) return [direct];
    let hit = null;
    const walk = (n) => { if (!hit && n.name === sub) hit = n; (n.children || []).forEach(walk); };
    (root.children || []).forEach(walk);
    return hit ? [hit] : [];
  };
  const ow = weights || {};
  for (const c of cats) {
    if (!c || !c.name) continue;
    const picks = [...(c.subs || []), ...(c.alts || [])].filter((x) => x && x !== c.name);
    const roots = nodesFor(c.name);
    if (!picks.length) {
      roots.forEach((n) => { tickWhole(n); if (ow["c:" + c.name] != null) w[n.id] = ow["c:" + c.name]; });
      continue;
    }
    for (const p of picks) {
      const nodes = nodesFor(c.name + "|" + p);
      nodes.forEach((n) => {
        tickWhole(n); markAncestors(n);
        const ww = ow["s:" + p] != null ? ow["s:" + p] : ow["a:" + p];
        if (ww != null) w[n.id] = ww;
      });
    }
    roots.forEach((n) => { if (ids.has(n.id) && ow["c:" + c.name] != null) { w[n.id] = ow["c:" + c.name]; auto.delete(n.id); } });
  }
  return { v: 1, ids: [...ids], auto: [...auto], weights: w };
}
// A selection made on the OLD database's tree ("v1:A > B > C" ids) -> the old
// labels + weights catStateFromLegacy maps onto the new tree. The units come
// from `units` (recorded on the old tree); without it, the topmost ticks that
// are not auto-ticked ancestors.
function legacyFromV1State(st) {
  const ids = (st.ids || []).filter((id) => String(id).startsWith("v1:"));
  const on = new Set(ids), auto = new Set(st.auto || []);
  const parentOf = (id) => { const i = id.lastIndexOf(" > "); return i > 0 ? id.slice(0, i) : null; };
  const units = Array.isArray(st.units) ? st.units.map((p) => "v1:" + p)
    : ids.filter((id) => !auto.has(id) && !(on.has(parentOf(id)) && !auto.has(parentOf(id))));
  const cats = new Map(), weights = {};
  for (const id of units) {
    const parts = id.slice(3).split(" > ");
    const c = cats.get(parts[0]) || { name: parts[0], subs: [], alts: [] };
    cats.set(parts[0], c);
    if (parts.length === 2) c.subs.push(parts[1]);
    else if (parts.length >= 3) c.alts.push(parts[parts.length - 1]);
  }
  for (const [id, w] of Object.entries(st.weights || {})) {
    if (!on.has(id)) continue;
    const parts = id.slice(3).split(" > ");
    weights[(parts.length === 1 ? "c:" : parts.length === 2 ? "s:" : "a:") + parts[parts.length - 1]] = w;
  }
  return { cats: [...cats.values()], weights };
}
// A saved/snapshot tree state, made usable on the tree that is loaded now.
function catStateForTree(st) {
  if (_catIndex && !_catIndex.v1 && (st.ids || []).some((id) => String(id).startsWith("v1:"))) {
    const l = legacyFromV1State(st);
    return catStateFromLegacy(l.cats, l.weights);
  }
  // drop ids the current tree no longer has (a tree version change)
  const ok = (id) => !_catIndex || _catIndex.byId.has(id);
  return { v: 1, ids: (st.ids || []).filter(ok), auto: (st.auto || []).filter(ok), weights: st.weights || {} };
}
// The saved per-mode blob -> tree state (migrating a pre-tree save once).
function savedCatState(saved) {
  if (!saved) return { v: 1, ids: [], auto: [], weights: {} };
  if (saved.catTree && Array.isArray(saved.catTree.ids)) return catStateForTree(saved.catTree);
  if (Array.isArray(saved.categories) && saved.categories.length) {
    const subsOf = saved.subcategories || {};
    return catStateFromLegacy(saved.categories.map((name) => ({ name, subs: subsOf[name] || [], alts: [] })), saved.weights);
  }
  return { v: 1, ids: [], auto: [], weights: {} };
}

async function loadCategories(type, opts = {}) {
  const container = $("#category-filters");
  if (!container) return;
  const gen = ++_catLoadGen;
  const epoch = _panelEpoch;
  if (!container.querySelector(".cat-node")) container.innerHTML = '<div class="text-muted" style="padding:8px">Loading categories...</div>';
  let tree;
  try { tree = await fetchCatTree(type); }
  catch (e) {
    if (gen === _catLoadGen) container.innerHTML = '<div class="text-muted" style="padding:8px">Failed to load categories</div>';
    console.error("Failed to load categories:", e);
    return;
  }
  if (gen !== _catLoadGen) return;   // a newer load (the other tab) owns the panel
  _catIndex = tree;
  if (!tree.roots.length) { container.innerHTML = '<div class="text-muted" style="padding:8px">No categories found</div>'; return; }
  container.innerHTML = tree.roots.map(catNodeHtml).join("");
  const saved = restoreFilterState();
  // A multiplayer mirror that landed while the tree was loading owns the panel:
  // never paint the solo save over it.
  if (!opts.skipSaved && epoch === _panelEpoch) applyCatState(savedCatState(saved), { initial: true });
  refreshCategorySummary();
}

function resetPracticeFiltersToDefaults() {
  const hadCustom = !!_customView;
  removeCustomView();
  const ms = $("#mode-select"); if (ms) { ms.value = "random"; _syncSel(ms); }
  updateModeFields();
  applyCatState({ ids: [], auto: [], weights: {} }, { initial: true });
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
  setPracticeTags([]);
  updateYearLabel();
  saveFilterState();
  refreshCategorySummary();
  if (hadCustom) applyCustomView();
}

// The selection as node ids (whole subtrees) and as readable names.
function getSelectedCategories() {
  return catSelectedUnits().map((el) => el.dataset.id);
}
function getSelectedCategoryNames() {
  return catSelectedUnits().map(catNodeLabel);
}

// ── Filter-selection snapshot ──────────────────────────────────────────────
// A lossless picture of the filter panel's SELECTION (what getActiveFilters
// derives from), so another machine can mirror the panel exactly. The derived
// filters object can't do this: it collapses fully-checked categories and
// carries no parent info for subcategories, so the cascade can't be rebuilt
// from it. Multiplayer uses this pair to keep every player's panel in sync.
function getFilterSelectionSnapshot() {
  // catTree carries the selection; `cats` stays (empty) because older app
  // versions reject a snapshot without it.
  const catTree = document.querySelector("#category-filters .cat-node") ? catStateFromDom() : savedCatState(getModeFilters());
  const _ya = parseInt($("#year-min")?.value || 2000), _yb = parseInt($("#year-max")?.value || 2026);
  const modeSel = $("#mode-select");
  return {
    v: 3,
    cats: [],
    catTree,
    useWeights: !!$("#enable-cat-weights")?.checked,
    // panel-level knobs: these are part of "the room's settings" too
    revealSpeed: state.settings.revealSpeed,
    strictness: parseInt($("#strictness-slider")?.value || "10"),
    hidePron: !!$("#filter-hide-pron")?.checked,
    hideNotes: !!$("#filter-hide-notes")?.checked,
    mode: _customView ? _customView.prevMode : (modeSel ? modeSel.value : "random"),
    setName: $("#mode-set-name")?.value || "",
    packet: $("#mode-packet")?.value || "",
    difficulties: _customView ? _customView.prevDiffs.slice() : getSelectedDifficulties(),
    yearMin: Math.min(_ya, _yb),
    yearMax: Math.max(_ya, _yb),
    powermarkOnly: !!$("#filter-powermark")?.checked,
    cleanOnly: !!$("#filter-clean")?.checked,
    standard: !!$("#filter-standard")?.checked,
    starredOnly: !!$("#filter-starred")?.checked,
    tags: practiceTags(),
  };
}

let _applySnapGen = 0;
let _applyingSnapshot = false;   // saveFilterState refuses while a mirror-apply runs
let _customView = null;          // { type, prevMode, prevDiffs } while the panel DISPLAYS "Custom"
let _panelEpoch = 0;             // bumping this kills deferred saved-blob restore timers
let _snapCustomPending = false;  // a Custom display an apply took down; owed back by whichever apply finishes LAST
async function applyFilterSelectionSnapshot(snap) {
  if (!snap || (!Array.isArray(snap.cats) && !snap.catTree)) return false;
  const gen = ++_applySnapGen;   // a newer snapshot arriving mid-apply wins
  _panelEpoch++;                 // pending loadCategories restore timers must not clobber this apply
  _applyingSnapshot = true;
  // A multiplayer mirror can arrive (from any screen) while this player runs a
  // custom list: drop the Custom display for the apply — no flush, the room's
  // state must never be saved into the solo blob — and put it back afterwards.
  // The flag is module-level: a newer apply arriving mid-await sees no view to
  // remove, and a per-call local left NEITHER apply restoring it.
  if (_customView) _snapCustomPending = true;
  removeCustomView({ noFlush: true });
  try {
    const ok = await _applySnapshotInner(snap, gen);
    // Event-free apply: change listeners never see it, so the GUI summary is
    // refreshed directly (this is how a multiplayer client's open GUI and its
    // launcher label stay live).
    if (gen === _applySnapGen) refreshCategorySummary();
    return ok;
  } finally {
    if (gen === _applySnapGen) {
      _applyingSnapshot = false;
      if (_snapCustomPending) {
        _snapCustomPending = false;
        applyCustomView();   // self-guarding: does nothing once the list has ended
        // Rebuilt over the APPLIED (room) panel, so prevMode/prevDiffs are the
        // room's: never flush it into the solo blob — multiplayer's
        // restoreSoloPanel owns that save on leave.
        if (_customView) _customView.mirrored = true;
      }
    }
  }
}
async function _applySnapshotInner(snap, gen) {
  const typeKey = state.mode === "bonuses" ? "bonuses" : "tossups";
  if (!document.querySelector("#category-filters .cat-node")) {
    try { await loadCategories(typeKey, { skipSaved: true }); } catch { return false; }
    if (gen !== _applySnapGen) return false;
  }
  // No events are dispatched: the change handlers cascade and save, both wrong
  // for a mirrored apply. A snapshot from an older app version (names) is
  // mapped onto the tree.
  applyCatState(snap.catTree && Array.isArray(snap.catTree.ids) ? catStateForTree(snap.catTree) : catStateFromLegacy(snap.cats || [], snap.weights));
  if (Array.isArray(snap.difficulties)) {
    const wd = snap.difficulties.map(String);
    $$("#difficulty-filters .diff-checkbox").forEach((x) => { x.checked = wd.includes(String(x.value)); });
  }
  if (snap.yearMin != null) { const e = $("#year-min"); if (e) e.value = snap.yearMin; }
  if (snap.yearMax != null) { const e = $("#year-max"); if (e) e.value = snap.yearMax; }
  updateYearLabel();
  if (snap.powermarkOnly != null) { const e = $("#filter-powermark"); if (e) e.checked = !!snap.powermarkOnly; }
  if (snap.cleanOnly != null) { const e = $("#filter-clean"); if (e) e.checked = !!snap.cleanOnly; }
  if (snap.standard != null) { const e = $("#filter-standard"); if (e) e.checked = !!snap.standard; }
  if (snap.starredOnly != null) { const e = $("#filter-starred"); if (e) e.checked = !!snap.starredOnly; }
  if (Array.isArray(snap.tags)) setPracticeTags(snap.tags);
  // Panel knobs apply EVENT-FREE: real change events broke multiplayer's
  // no-events invariant — every apply echoed a setConfig, chat blamed the
  // wrong player for "changed mode", saves persisted room state into the solo
  // blob, and a suspended set-mode session lost its _gameSig. State and DOM
  // are written directly instead.
  if (snap.useWeights != null) {
    const ew = $("#enable-cat-weights");
    if (ew) ew.checked = !!snap.useWeights;
    state.settings.useWeights = !!snap.useWeights;
    $("#category-filters")?.classList.toggle("weights-on", !!snap.useWeights);
  }
  if (snap.mode === "import") snap = { ...snap, mode: "random" };   // packet files are gone (14.38)
  if (snap.mode != null && snap.mode !== "custom") {
    const ms = $("#mode-select");
    if (ms && ms.value !== snap.mode) { ms.value = snap.mode; _syncSel(ms); try { updateModeFields(); } catch {} }
    if (snap.mode === "set") {
      const sn = $("#mode-set-name");
      if (sn && snap.setName != null && sn.value !== snap.setName) {
        sn.value = snap.setName;
        // packet validation must clamp against the NEW set's packet list, so
        // the packet value is written only after that list loads
        try { await loadSetPackets(); } catch {}
        if (gen !== _applySnapGen) return false;
      }
      const pk = $("#mode-packet");
      if (pk && snap.packet != null) pk.value = snap.packet;
    }
  }
  if (snap.revealSpeed != null) {
    const s = $("#panel-speed-slider");
    if (s) s.value = snap.revealSpeed;
    const s2 = $("#speed-slider"); if (s2) s2.value = snap.revealSpeed;
    state.settings.revealSpeed = snap.revealSpeed;
    const l = $("#panel-speed-label"); if (l) l.textContent = snap.revealSpeed + "ms";
    const l2 = $("#speed-slider-label"); if (l2) l2.textContent = snap.revealSpeed + "ms";
  }
  if (snap.strictness != null) {
    const s = $("#strictness-slider");
    if (s) s.value = snap.strictness;
    state.settings.strictness = parseInt(snap.strictness) || 10;
    const l = $("#strictness-label"); if (l) l.textContent = String(snap.strictness);
  }
  if (snap.hidePron != null) {
    const e = $("#filter-hide-pron"); if (e) e.checked = !!snap.hidePron;
    state.settings.hidePronunciations = !!snap.hidePron;
  }
  if (snap.hideNotes != null) {
    const e = $("#filter-hide-notes"); if (e) e.checked = !!snap.hideNotes;
    state.settings.hideNotes = !!snap.hideNotes;
  }
  clearPrefetch();
  return true;
}

let _allSets = null;

// A set name saved before the rename -> the set's current name.
function currentSetName(name) {
  if (!name || !_allSets) return name;
  if (_allSets.some((s) => s.name === name)) return name;
  const hit = _allSets.find((s) => (s.old_names || []).includes(name));
  return hit ? hit.name : name;
}
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
  $("#set-mode-fields")?.classList.toggle("hidden", !isSet);
  state._gameSig = null;
  const packetMode = isSet;
  const isCustom = modeVal === "custom";
  const msEl = $("#mode-select");
  if (msEl) msEl.disabled = isCustom;   // QBSelect follows the attribute
  ["#sec-categories", "#sec-difficulty"].forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    el.classList.toggle("filter-disabled", packetMode || isCustom);
    if (packetMode) el.classList.add("collapsed");
    // .filter-disabled is pointer-events only; inert also stops Tab + Space.
    // The collapse header stays usable so the empty section can be looked at.
    el.querySelectorAll(".filter-body").forEach((b) => { b.inert = isCustom; });
  });
  if (packetMode || isCustom) closeCategoryOverlay();
  $$(".packet-disable").forEach((el) => el.classList.toggle("filter-disabled", packetMode));
  clampDualRange($("#year-min"), $("#year-max"));
  ["#year-min", "#year-max", "#filter-powermark", "#filter-starred"].forEach((sel) => {
    const el = $(sel); if (el) el.disabled = packetMode;
  });
  if (isSet) loadSetPackets();
  refreshCategorySummary();
}

// ── CUSTOM MODE ──────────────────────────────────────────────────────────────
// A custom question list (a plugin's "Play", the Review queue, a folder…) shows
// Mode = "Custom" and locks Difficulty + Categories, displayed EMPTY because the
// list is played as-is. The user's own filters are never touched:
//  • difficulties are unticked on screen only — the previous mode + difficulties
//    live in _customView and are substituted into every save and snapshot;
//  • the category tree is NOT unticked (a snapshot taken before sub lists load
//    records subs:[] and would wipe curated picks and weights); it stays behind
//    the disabled launcher, whose summary reads "None";
//  • saves are pinned to the list's own bucket (tossups / bonuses);
//  • the host API keeps reporting the REAL filters (multiplayer).
// state.customType marks the list for the session; _customView is only the
// on-screen display, torn down whenever the practice screen is not showing it.
function _syncSel(el) { try { if (el && el._qbSync) el._qbSync(); } catch (e) {} }
function _customOpt(on) {
  const ms = $("#mode-select"); if (!ms) return;
  let o = ms.querySelector('option[value="custom"]');
  if (on && !o) { o = document.createElement("option"); o.value = "custom"; o.textContent = "Custom"; o.disabled = true; ms.appendChild(o); }
  if (!on && o) o.remove();
}
// Idempotent. Captures the previous state ONLY on the off -> on edge, and only
// once the panel matches the saved blob (setMode's chain end).
function applyCustomView() {
  const t = state.customType;
  const onPractice = !!$("#practice-screen")?.classList.contains("active");
  if (!t || !state.sessionActive || !onPractice || filtersMode() !== t) { removeCustomView(); return; }
  const ms = $("#mode-select"); if (!ms) return;
  if (!_customView) _customView = { type: t, prevMode: (ms.value && ms.value !== "custom") ? ms.value : "random", prevDiffs: getSelectedDifficulties() };
  _customOpt(true); ms.value = "custom"; _syncSel(ms);
  $$("#difficulty-filters .diff-checkbox").forEach((cb) => { cb.checked = false; });   // display only, no events
  closeCategoryOverlay();
  updateModeFields(); clearPrefetch();
}
// Synchronous, event-free. Flushes any pending save while the pin is still on
// (a debounced save firing later would otherwise land in the wrong bucket).
function removeCustomView(opts) {
  const v = _customView; if (!v) return;
  clearTimeout(_debounceTimer); clearTimeout(_modeSettingTimer); _debounceTimer = _modeSettingTimer = null;
  if (!(opts && opts.noFlush) && !v.mirrored) saveFilterState();
  _customView = null;
  _customOpt(false);
  const ms = $("#mode-select"); if (ms) { ms.value = v.prevMode; _syncSel(ms); }
  const want = v.prevDiffs.map(String);
  $$("#difficulty-filters .diff-checkbox").forEach((cb) => { cb.checked = want.includes(String(cb.value)); });
  updateModeFields(); clearPrefetch();
}
function endCustom() { removeCustomView(); state.customType = null; }

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

$("#mode-select")?.addEventListener("change", () => {
  const ms = $("#mode-select");
  // Picking another mode while a custom list is SHOWING ends that list. Gated
  // on _customView, not state.customType: plugins that borrow the panel force
  // "random" after the view is already down, and must not kill a suspended list.
  if (_customView && ms && ms.value !== "custom") {
    const v = _customView, chosen = ms.value;
    _customView = null; state.customType = null; state.reviewIds = null; state.bonusIds = null;
    _customOpt(false); ms.value = chosen; _syncSel(ms);
    const want = v.prevDiffs.map(String);
    $$("#difficulty-filters .diff-checkbox").forEach((cb) => { cb.checked = want.includes(String(cb.value)); });
    clearPrefetch();
    if (state.sessionActive && !state.currentQuestion) endSession();   // exhausted list: let Start work
  }
  updateModeFields(); debounceSaveFilters();
});
$("#mode-set-name")?.addEventListener("change", () => { state._gameSig = null; loadSetPackets(); debounceSaveFilters(); });
$("#mode-packet")?.addEventListener("change", () => { state._gameSig = null; validatePacketInput(); debounceSaveFilters(); });
$("#mode-packet")?.addEventListener("input", debounceSaveFilters);

function getActiveFilters(opts) {
  // A custom list is played as-is, so internally there is no constraint. The
  // host API passes {real:true}: a multiplayer host running a list in the
  // background must still serve the room from the user's REAL filters.
  const cv = _customView;
  if (cv && !(opts && opts.real)) return { random: true };
  const modeVal = cv ? cv.prevMode : $("#mode-select")?.value;
  if (modeVal === "set") {
    const setName = $("#mode-set-name")?.value || "";
    const f = { random: true };
    if (setName) {
      f.setNames = [setName];   // plugins read the name; the server filters by id when present
      const set = (_allSets || []).find((x) => x.name === setName);
      if (set && set.id) f.setIds = [set.id];
    }
    const packets = parsePacketNumbers($("#mode-packet")?.value);
    if (packets.length) f.packetNumbers = packets;
    return f;
  }

  const difficulties = cv ? cv.prevDiffs.slice() : getSelectedDifficulties();

  const _ya = parseInt($("#year-min")?.value || 2000), _yb = parseInt($("#year-max")?.value || 2026);
  const yearMin = Math.min(_ya, _yb);
  const yearMax = Math.max(_ya, _yb);

  const filters = {
    difficulties,
    standard: $("#filter-standard")?.checked ? 1 : undefined,
    random: true,
    starredOnly: $("#filter-starred")?.checked || false,
    powermarkOnly: $("#filter-powermark")?.checked || false,
    cleanOnly: $("#filter-clean")?.checked || false,
    yearMin,
    yearMax,
  };

  const tags = practiceTags();
  if (tags.length) filters.tags = tags;

  // Tree node ids travel in `categories` (the server reads an id as its whole
  // subtree); categoryPaths is for client-side matching and display only.
  // opts.allUnits: the whole selection even in weighted mode (counts).
  if (state.settings.useWeights && !(opts && opts.allUnits)) {
    const el = weightedPickCategoryNode();   // ONE weighted pick per call
    if (el) { filters.categories = [el.dataset.id]; filters.categoryPaths = [catNodePath(el)]; return filters; }
  }
  const units = catSelectedUnits();
  if (units.length) { filters.categories = units.map((el) => el.dataset.id); filters.categoryPaths = units.map(catNodePath); }
  // No selection = no category constraint: questions are drawn uniformly from
  // the whole pool, so each category appears at its natural database frequency.

  return filters;
}

function describeActiveFilters(opts) {
  if (_customView && !(opts && opts.real)) return "Custom list";
  const f = getActiveFilters(opts);
  const parts = [];
  if (f.setNames) parts.push("Set: " + f.setNames.join(", ") + (f.packetNumbers ? " (packets " + f.packetNumbers.join(",") + ")" : ""));
  // From the SELECTION, not f: in weighted mode f holds one random pick.
  const names = f.setNames ? [] : getSelectedCategoryNames();
  if (names.length) parts.push("Categories: " + names.join(", "));
  if (!names.length && !f.setNames) parts.push("All categories");
  if (f.difficulties && f.difficulties.length) parts.push("Difficulty: " + f.difficulties.join(", "));
  if (f.tags && f.tags.length) parts.push("Tags: " + f.tags.map((t) => (t.x ? "not " : "") + t.v).join(", "));
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

function getSelectedDifficulties() {
  return [...$$("#difficulty-filters .diff-checkbox:checked")].map((cb) => parseInt(cb.value));
}

function getFilters() {
  return getActiveFilters();
}

$("#difficulty-filters")?.addEventListener("change", debounceSaveFilters);
// Weight edits never triggered a save (only the checkbox cascade did) —
// weight values silently vanished on the next screen build.
$("#category-filters")?.addEventListener("change", (e) => {
  if (e.target?.classList?.contains("cat-weight") || e.target?.classList?.contains("subcat-weight") || e.target?.classList?.contains("altsub-weight")) debounceSaveFilters();
});
$("#year-min")?.addEventListener("input", () => { clampYearDual("min"); debounceSaveFilters(); });
$("#year-max")?.addEventListener("input", () => { clampYearDual("max"); debounceSaveFilters(); });
["#filter-starred", "#filter-powermark", "#filter-standard", "#filter-clean"].forEach((sel) => {
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
  _debounceTimer = setTimeout(() => { _debounceTimer = null; saveFilterState(); }, 300);
}
// Run a pending debounced save NOW. showScreen calls this before it reassigns
// state.mode: a timer firing afterwards resolved filtersMode() to the NEW screen
// (null -> "tossups") and wrote the Bonuses panel over the saved Tossups filters.
function flushPendingFilterSave() {
  if (!_debounceTimer && !_modeSettingTimer) return;
  clearTimeout(_debounceTimer); clearTimeout(_modeSettingTimer); _debounceTimer = _modeSettingTimer = null;
  if ($("#category-filters .category-group")) saveFilterState();
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
updateYearLabel();   // a fresh profile restores no filters: draw the fill now

document.addEventListener("change", (e) => {
  const cb = e.target.closest("#category-filters .cat-checkbox");
  if (cb) {
    const node = cb.closest(".cat-node");
    delete cb.dataset.autoChecked;   // a direct change on a box = the user owns it
    const w = _catW(node); if (w) w.value = cb.checked ? "10" : "0";
    if (cb.checked) {
      _catEachDesc(node, (k) => _catSet(k, true));   // the whole subtree
      if (_catKids(node).length) _catExpand(node, true);   // one level, never the whole subtree
      // A ticked node implies its ancestors. Silent and marked, so the teardown
      // below undoes exactly what THIS ticked, never a box the user ticked.
      for (let p = _catParent(node); p; p = _catParent(p)) {
        const pcb = _catRowBox(p);
        if (pcb && !pcb.checked) {
          pcb.checked = true; pcb.dataset.autoChecked = "1";
          const pw = _catW(p); if (pw) pw.value = "10";   // an unticked row sits at 0 = never drawn
        }
        _catExpand(p, true);
      }
    } else {
      _catEachDesc(node, (k) => _catSet(k, false));
      // Tick-then-untick is a true no-op; "tick a node, untick every child"
      // still means the whole node (its box was ticked by the user).
      for (let p = _catParent(node); p; p = _catParent(p)) {
        const pcb = _catRowBox(p);
        if (!pcb || !pcb.dataset.autoChecked) break;
        if (_catKids(p).some((k) => _catRowBox(k)?.checked)) break;
        pcb.checked = false; delete pcb.dataset.autoChecked;
        const pw = _catW(p); if (pw) pw.value = "0";
      }
    }
  }
  const wInput = e.target.closest("#category-filters .cat-weight");
  if (wInput) {
    const box = _catRowBox(wInput.closest(".cat-node"));
    const val = parseFloat(wInput.value) || 0;
    // Typing a weight is a deliberate act on THAT row: the user owns it now.
    if (box && val > 0) delete box.dataset.autoChecked;
    if (box && val <= 0 && box.checked) { box.checked = false; box.dispatchEvent(new Event("change", { bubbles: true })); }
    else if (box && val > 0 && !box.checked) { box.checked = true; box.dispatchEvent(new Event("change", { bubbles: true })); }
  }
  if (e.target.closest("#category-filters")) {
    saveFilterState();
  }
  if (e.target.closest?.("#category-filters") || e.target.id === "enable-cat-weights") refreshCategorySummary();
});

document.addEventListener("click", (e) => {
  const exp = e.target.closest("#category-filters .cat-expand");
  if (!exp) return;
  e.preventDefault();
  e.stopPropagation();
  const node = exp.closest(".cat-node");
  const list = node?.querySelector(":scope > .cat-children");
  if (list) _catExpand(node, list.classList.contains("hidden"));
});

// ── CATEGORY GUI ─────────────────────────────────────────────────────────────
// The launcher (#sec-categories, under Mode and Difficulty) opens #cat-ovl, the
// full category / subcategory / alternate tree plus the weight settings. #cat-ovl
// lives INSIDE #filters-panel on purpose (see index.html): it travels with every
// panel borrow (multiplayer, coach, flashcards, packet builder…), and category
// events keep bubbling through the panel's capture listeners (clearPrefetch,
// multiplayer's onAnyFilterChange). Remote multiplayer changes are written into
// this same tree, so an open GUI updates live. Never portal it to <body>.
// Function declarations only: updateModeFields runs from earlier call sites.
function isPacketModeSelected() {
  const v = $("#mode-select")?.value;
  return v === "set" || v === "custom";
}
function isCatOverlayOpen() {
  const o = document.getElementById("cat-ovl");
  // getClientRects: multiplayer can hand the panel back to a HIDDEN practice
  // screen without a screen change; an "open" but invisible GUI must not keep
  // swallowing hotkeys. (offsetParent is always null for position:fixed.)
  return !!o && !o.classList.contains("hidden") && o.getClientRects().length > 0;
}
function openCategoryOverlay() {
  const b = document.getElementById("btn-open-categories"), o = document.getElementById("cat-ovl");
  if (!b || !o || b.disabled || isPacketModeSelected()) return;
  o.classList.remove("hidden");
  if (!needsAccount()) tipInto(o.querySelector(".cat-modal"), "cat-presets", null, document.getElementById("cat-picker"));
  practicePicker().open();
  refreshCategorySummary();
  try { o.querySelector(".cat-modal")?.focus({ preventScroll: true }); } catch (e) {}
}
function closeCategoryOverlay() {
  const o = document.getElementById("cat-ovl");
  if (!o || o.classList.contains("hidden")) return false;
  o.classList.add("hidden");
  return true;
}

// ═══ CATEGORY PICKER — two panes: the 12 roots on the left (tick / focus /
// share bar / weight), the focused root's subcategories on the right as
// sections of pills (+n opens deeper levels in place), a Find box, presets and
// the weights switch. It is a VIEW over a model:
//  • practice: the hidden #category-filters checkbox tree (source of truth —
//    saving, prefetch invalidation and multiplayer sync all hang off its
//    change events, so every edit here dispatches one);
//  • search: an in-memory set of whole-subtree units.
const CAT_PRESET_LS = "qb-cat-presets";
const ACF_DISTRIBUTION = { "Literature": 40, "History": 40, "Science and Math": 40, "Fine Arts": 30, "Mythology": 10, "Theology": 10, "Philosophy": 10, "Social Science": 10, "Geography": 5, "Current Events": 3, "Miscellaneous": 2 };
// Presets live in the profile's data (plugin-data "core / cat-presets"), so they
// sync with an account between the app and the website; localStorage keeps a
// copy (and is where older versions kept them — moved over on first load).
let _catPresetsMem = null;
function _catPresetsLocal() { try { return JSON.parse(localStorage.getItem(CAT_PRESET_LS) || "{}") || {}; } catch (e) { return {}; } }
function catPresetsLoad(kind) { const m = _catPresetsMem || _catPresetsLocal(); return Array.isArray(m[kind]) ? m[kind] : []; }
function catPresetsSave(kind, list) {
  const m = { ...(_catPresetsMem || _catPresetsLocal()) };
  m[kind] = list.slice(0, 30);
  _catPresetsMem = m;
  try { localStorage.setItem(CAT_PRESET_LS, JSON.stringify(m)); } catch (e) {}
  API.post("/api/plugin-data", { plugin: "core", key: "cat-presets", value: m }).catch(() => {});
}
async function catPresetsSync() {
  try {
    const d = await API.get("/api/plugin-data?plugin=core&key=cat-presets");
    const v = d && (d.value !== undefined ? d.value : d.data);
    if (v && typeof v === "object") { _catPresetsMem = v; try { localStorage.setItem(CAT_PRESET_LS, JSON.stringify(v)); } catch (e) {} }
    else { const local = _catPresetsLocal(); if (Object.keys(local).length) { _catPresetsMem = local; API.post("/api/plugin-data", { plugin: "core", key: "cat-presets", value: local }).catch(() => {}); } }
  } catch (e) {}
}

function CatPicker(model) {
  const v = { focus: 0, expand: null, find: "", findHi: 0, hl: null, saving: false, tree: null };
  const self = { model, v };
  const host = () => model.host();
  const root = () => (v.tree && v.tree.roots[v.focus]) || null;
  const fmt = (n) => Number(n || 0).toLocaleString();
  const box = (id, label) => {
    const st = model.state(id);
    return `<button type="button" class="cp-box${st === "on" ? " on" : st === "partial" ? " partial" : ""}" data-cp="toggle" data-id="${escapeHtml(id)}" aria-pressed="${st === "on" ? "true" : st === "partial" ? "mixed" : "false"}" aria-label="Include ${escapeHtml(label)}">${st === "on" ? ic("check", 13, ' style="stroke-width:3"') : ""}</button>`;
  };
  function selectedCount(n) {
    const st = model.state(n.id);
    if (st === "on") return n.count;
    if (st === "off") return 0;
    return (n.children || []).reduce((a, k) => a + selectedCount(k), 0);
  }
  function pill(n) {
    const st = model.state(n.id);
    const open = v.expand === n.id || (v.expand && v.tree.byId.get(v.expand) && v.tree.byId.get(v.expand).path.startsWith(n.path + " > "));
    const more = (n.children || []).filter((k) => k.count > 0).length;
    return `<span class="cp-pillgrp"><button type="button" class="cp-pill${st === "on" ? " on" : st === "partial" ? " partial" : ""}${more ? " has-more" : ""}${v.hl === n.id ? " hl" : ""}" data-cp="toggle" data-id="${escapeHtml(n.id)}" aria-pressed="${st === "on"}" title="${escapeHtml(n.definition || n.path.replace(/ > /g, " \u203a "))}">${st === "on" ? ic("check", 12, ' style="stroke-width:3"') : ""}<span class="t">${escapeHtml(n.name)}</span><span class="n">${fmt(n.count)}</span></button>` +
      (more ? `<button type="button" class="cp-more${open ? " open" : ""}" data-cp="expand" data-id="${escapeHtml(n.id)}" aria-expanded="${!!open}" aria-label="Open ${escapeHtml(n.name)}">+${more}</button>` : "") + "</span>";
  }
  function stepper(n, pct, wTotal) {
    if (!model.supportsWeights || !model.weightsOn()) return "";
    const st = model.state(n.id); if (st === "off") return "";
    const w = model.weight(n.id);
    const label = pct ? Math.round(100 * w / (wTotal || 1)) + "%" : "\u00d7" + w;
    return `<span class="cp-stepper"><button type="button" data-cp="w" data-id="${escapeHtml(n.id)}" data-d="-2" aria-label="Less ${escapeHtml(n.name)}">\u2212</button><span>${label}</span><button type="button" data-cp="w" data-id="${escapeHtml(n.id)}" data-d="2" aria-label="More ${escapeHtml(n.name)}">+</button></span>`;
  }
  function render() {
    const h = host(); if (!h) return;
    v.tree = model.tree();
    if (!v.tree || !v.tree.roots.length) { h.innerHTML = '<div class="cp-empty">' + (v.tree ? "No categories" : "Loading categories\u2026") + "</div>"; return; }
    if (v.focus >= v.tree.roots.length) v.focus = 0;
    // keep scroll + find focus across the rebuild
    const sc = h.querySelector(".cp-scroll"), lf = h.querySelector(".cp-left");
    const keep = { top: sc ? sc.scrollTop : 0, lt: lf ? lf.scrollTop : 0, ll: lf ? lf.scrollLeft : 0, findFocus: document.activeElement && document.activeElement.classList.contains("cp-find-in") };
    const wOn = model.supportsWeights && model.weightsOn();
    const rootsOn = v.tree.roots.filter((r) => model.state(r.id) !== "off");
    const wTotal = rootsOn.reduce((a, r) => a + model.weight(r.id), 0);
    const tiles = v.tree.roots.map((r, i) => {
      const pct = Math.round(100 * selectedCount(r) / Math.max(1, r.count));
      const col = ROOT_COLOR[r.name] || "#8b949e";
      return `<div class="cp-tile${i === v.focus ? " focus" : ""}">${box(r.id, r.name)}<button type="button" class="cp-tile-main" data-cp="focus" data-i="${i}"><span class="cp-tile-top"><span class="dot" style="background:${col}"></span><span class="cp-tile-name">${escapeHtml(r.name)}</span><span class="tile-n">${fmt(r.count)}</span></span><span class="cp-share"><span style="width:${pct}%;background:${col}"></span></span></button>${stepper(r, true, wTotal)}</div>`;
    }).join("");
    const rt = root();
    const secs = (rt.children || []).filter((n) => n.count > 0).map((l2) => {
      let sub = "";
      const ex = v.expand && v.tree.byId.get(v.expand);
      if (ex && (ex.id === l2.id || ex.path.startsWith(l2.path + " > ")) && ex.depth >= 3) {
        const chain = []; let q = ex;
        while (q && q.depth >= 3) { chain.unshift(q); q = q.parentId ? v.tree.byId.get(q.parentId) : null; }
        sub = `<div class="cp-sub"><div class="cp-crumbs">` + chain.map((c, j) => (j ? '<span aria-hidden="true">\u203a</span>' : "") + `<button type="button" data-cp="expand-to" data-id="${escapeHtml(c.id)}" aria-current="${j === chain.length - 1}">${escapeHtml(c.name)}</button>`).join("") +
          `<span class="spacer"></span><button type="button" class="btn btn-ghost btn-icon btn-sm" data-cp="expand-to" data-id="" aria-label="Close">${ic("x", 14)}</button></div><div class="cp-pills">${(ex.children || []).filter((k) => k.count > 0).map(pill).join("")}</div></div>`;
      }
      const kids = (l2.children || []).filter((k) => k.count > 0);
      return `<div class="cp-sec"><div class="cp-sec-head">${box(l2.id, l2.name)}<span class="cp-sec-name${v.hl === l2.id ? " hl" : ""}">${escapeHtml(l2.name)}</span><span class="cp-sec-n">${fmt(l2.count)}</span>${wOn && model.state(l2.id) !== "off" ? '<span class="spacer"></span>' + stepper(l2, false) : ""}</div>` +
        (kids.length ? `<div class="cp-pills">${kids.map(pill).join("")}</div>` : "") + sub + "</div>";
    }).join("");
    const q = v.find.trim().toLowerCase();
    let hits = [];
    if (q.length >= 2) hits = v.tree.all.filter((n) => n.depth > 1 && n.count > 0 && n.name.toLowerCase().includes(q)).sort((a, b) => (a.name.toLowerCase().startsWith(q) ? 0 : 1) - (b.name.toLowerCase().startsWith(q) ? 0 : 1) || b.count - a.count).slice(0, 8);
    self._hits = hits;
    const findPop = q.length >= 2 ? `<div class="cp-find-pop" role="listbox">${hits.length ? hits.map((n, i) => `<button type="button" class="cp-hit${i === v.findHi ? " hi" : ""}" data-cp="reveal" data-id="${escapeHtml(n.id)}"><span class="r1"><b>${escapeHtml(n.name)}</b><span class="tile-n">${fmt(n.count)}</span></span><span class="r2">${escapeHtml(String(n.path).split(" > ").slice(0, -1).join(" \u203a "))}</span></button>`).join("") : '<div class="sugg-empty">No topic matches</div>'}</div>` : "";
    const units = model.unitCount();
    const head = units ? `${fmt(model.total())} ${model.noun} \u00b7 ${units} ${units === 1 ? "pick" : "picks"}` : "Everything";
    const presets = model.presets();
    const presetHtml = presets.map((p, i) => `<button type="button" class="chip${p.active ? " on" : ""}" data-cp="preset" data-i="${i}">${escapeHtml(p.name)}${p.user ? `<span class="cp-preset-x" data-cp="preset-del" data-i="${i}" title="Delete preset" aria-label="Delete preset">\u00d7</span>` : ""}</button>`).join("");
    const saveHtml = v.saving
      ? `<span class="ifield" style="flex:none;width:200px;height:32px"><input class="cp-save-in" type="text" maxlength="40" placeholder="Preset name" aria-label="Preset name"></span>`
      : `<button type="button" class="chip" data-cp="preset-save" style="border-style:dashed;color:var(--muted)" title="Save these picks as a preset">+ Save</button>`;
    h.innerHTML =
      `<div class="modal-head"><h2>Categories</h2><span class="tile-n cp-headn">${escapeHtml(model.headLabel ? model.headLabel() : "")}</span><span class="spacer"></span><span class="num" style="color:var(--muted);font-size:12.5px">${escapeHtml(head)}</span><button type="button" class="btn btn-ghost btn-icon" data-cp="close" aria-label="Close">${ic("x")}</button></div>` +
      `<div class="cp-body"><nav class="cp-left${wOn ? " weights" : ""}" aria-label="Categories">${tiles}</nav>` +
      `<section class="cp-right" aria-label="${escapeHtml(rt.name)}"><div class="cp-head"><div class="cp-title"><h3>${escapeHtml(rt.name)}</h3><p class="num">${fmt(rt.count)} ${model.noun} \u00b7 ${(rt.children || []).filter((n) => n.count > 0).length} subcategories</p></div>` +
        `<button type="button" class="btn btn-sm" data-cp="toggle-root" data-id="${escapeHtml(rt.id)}">${model.state(rt.id) === "on" ? "Deselect all" : "Select all"}</button>` +
        `<div class="cp-find"><label class="field">${ic("search", 15)}<input class="cp-find-in" type="text" value="${escapeHtml(v.find)}" placeholder="Find a topic\u2026" aria-label="Find a topic" autocomplete="off" spellcheck="false"></label>${findPop}</div></div>` +
        `<div class="cp-scroll">${secs || '<div class="cp-empty">No subcategories</div>'}</div></section></div>` +
      `<div class="cp-foot"><div class="foot-left" role="group" aria-label="Presets"><span style="flex:none;display:inline-flex;color:var(--muted)" title="Presets">${ic("bookmark", 17)}</span>${presetHtml}${saveHtml}</div>` +
        `<div class="foot-right">${model.supportsWeights ? `<label class="cp-weights-lbl"><input type="checkbox" class="switch" data-cp="weights"${wOn ? " checked" : ""} aria-label="Weights">Weights</label>` : ""}` +
        `<button type="button" class="btn" data-cp="clear">Clear</button><button type="button" class="btn btn-primary" data-cp="close">Done</button></div></div>`;
    const sc2 = h.querySelector(".cp-scroll"); if (sc2) sc2.scrollTop = keep.top;
    const lf2 = h.querySelector(".cp-left"); if (lf2) { lf2.scrollTop = keep.lt; lf2.scrollLeft = keep.ll; }
    if (keep.findFocus) { const f = h.querySelector(".cp-find-in"); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }
    if (v.saving) { const si = h.querySelector(".cp-save-in"); if (si) si.focus(); }
  }
  function reveal(id) {
    const n = v.tree.byId.get(id); if (!n) return;
    const rootName = n.path.split(" > ")[0];
    v.focus = Math.max(0, v.tree.roots.findIndex((r) => r.name === rootName));
    v.expand = n.depth >= 4 ? n.parentId : null;
    if (model.state(id) !== "on") model.toggle(id);
    v.find = ""; v.hl = id;
    render();
    setTimeout(() => { const el = host()?.querySelector(".cp-pill.hl, .cp-sec-name.hl"); if (el) el.scrollIntoView({ block: "center" }); }, 0);
  }
  function wire() {
    const h = host(); if (!h || h._cpWired) return;
    h._cpWired = true;
    h.addEventListener("click", (e) => {
      const t = e.target.closest("[data-cp]"); if (!t || !h.contains(t)) return;
      const a = t.dataset.cp, id = t.dataset.id;
      e.preventDefault(); e.stopPropagation();
      if (a === "toggle") { v.hl = null; model.toggle(id); render(); }
      else if (a === "toggle-root") { v.hl = null; model.toggle(id); render(); }
      else if (a === "focus") { v.focus = +t.dataset.i; v.expand = null; v.hl = null; render(); h.querySelector(".cp-scroll") && (h.querySelector(".cp-scroll").scrollTop = 0); }
      else if (a === "expand") { v.expand = v.expand === id ? null : id; render(); }
      else if (a === "expand-to") { v.expand = id || null; render(); }
      else if (a === "w") { model.setWeight(id, Math.max(0, model.weight(id) + (+t.dataset.d))); render(); }
      else if (a === "clear") { v.hl = null; model.clear(); render(); }
      else if (a === "close") model.close();
      else if (a === "reveal") reveal(id);
      else if (a === "preset") { const p = model.presets()[+t.dataset.i]; if (p) { p.apply(); v.hl = null; render(); } }
      else if (a === "preset-del") { model.deletePreset(+t.dataset.i); render(); }
      else if (a === "preset-save") { if (accountGate("Sign in to save category presets.")) return; v.saving = true; render(); }
    });
    h.addEventListener("change", (e) => {
      const t = e.target.closest('[data-cp="weights"]');
      if (t) { e.stopPropagation(); model.setWeightsOn(t.checked); render(); }
    });
    h.addEventListener("input", (e) => {
      if (e.target.classList.contains("cp-find-in")) { e.stopPropagation(); v.find = e.target.value; v.findHi = 0; render(); }
    });
    h.addEventListener("keydown", (e) => {
      if (e.target.classList.contains("cp-find-in")) {
        const hits = self._hits || [];
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); v.findHi = Math.max(0, Math.min(hits.length - 1, v.findHi + (e.key === "ArrowDown" ? 1 : -1))); render(); }
        else if (e.key === "Enter") { e.preventDefault(); if (hits[v.findHi]) reveal(hits[v.findHi].id); }
        else if (e.key === "Escape" && v.find) { e.preventDefault(); e.stopPropagation(); v.find = ""; render(); }
      } else if (e.target.classList.contains("cp-save-in")) {
        if (e.key === "Enter") { e.preventDefault(); const name = e.target.value.trim(); if (name) model.savePreset(name); v.saving = false; render(); }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); v.saving = false; render(); }
      }
    });
    h.addEventListener("focusout", (e) => {
      if (e.target.classList.contains("cp-save-in") && v.saving) setTimeout(() => { if (v.saving && !h.contains(document.activeElement)) { v.saving = false; render(); } }, 0);
    });
  }
  self.open = () => { v.find = ""; v.hl = null; v.saving = false; wire(); render(); };
  self.render = () => { if (host() && host().isConnected) render(); };
  return self;
}

// index for a fetched tree: byId, flat list with parentId (fetchCatTree adds parentId)
function catTreeView(tree) {
  if (!tree) return null;
  if (!tree.all) { const all = []; const walk = (n) => { all.push(n); (n.children || []).forEach(walk); }; tree.roots.forEach(walk); tree.all = all; }
  return tree;
}

document.querySelector("#cat-ovl .cat-modal")?.addEventListener("keydown", (e) => { if (e.key !== "Escape") e.stopPropagation(); });

// ── practice model: the hidden checkbox tree ──
let _practicePicker = null;
function practicePicker() {
  if (_practicePicker) return _practicePicker;
  const nodeEl = (id) => document.querySelector(`#category-filters .cat-node[data-id="${CSS.escape(id)}"]`);
  const fireTree = () => document.getElementById("category-filters")?.dispatchEvent(new Event("change", { bubbles: true }));
  const model = {
    noun: "questions",
    host: () => document.getElementById("cat-picker"),
    tree: () => { const t = catTreeView(_catIndex); if (t) model.noun = filtersMode() === "bonuses" ? "bonuses" : "tossups"; return t; },
    headLabel: () => (filtersMode() === "bonuses" ? "Bonuses" : "Tossups"),
    state(id) {
      const el = nodeEl(id); const cb = _catRowBox(el);
      if (!cb || !cb.checked) return "off";
      return _catUnits(el).whole ? "on" : "partial";
    },
    toggle(id) {
      const el = nodeEl(id); const cb = _catRowBox(el); if (!cb) return;
      cb.checked = model.state(id) !== "on";
      cb.dispatchEvent(new Event("change", { bubbles: true }));
    },
    clear() { clearAllCategories(); },
    supportsWeights: true,
    weightsOn: () => !!document.getElementById("enable-cat-weights")?.checked,
    setWeightsOn(on) { const ew = document.getElementById("enable-cat-weights"); if (ew && ew.checked !== !!on) { ew.checked = !!on; ew.dispatchEvent(new Event("change", { bubbles: true })); } },
    weight(id) { const el = nodeEl(id); const w = parseFloat(_catW(el)?.value); return Number.isFinite(w) ? w : 10; },
    setWeight(id, val) { const el = nodeEl(id); const w = _catW(el); if (!w) return; w.value = String(val); w.dispatchEvent(new Event("change", { bubbles: true })); },
    unitCount: () => catSelectedUnits().length,
    total() { const t = _catIndex; return catSelectedUnits().reduce((a, el) => a + ((t && t.byId.get(el.dataset.id)?.count) || 0), 0); },
    presets() {
      const kind = "practice-" + filtersMode();
      const cur = JSON.stringify(catStateFromDom().ids.slice().sort());
      const out = [{ name: "All", apply: () => { clearAllCategories(); model.setWeightsOn(false); }, active: !catSelectedUnits().length }];
      if (_catIndex && !_catIndex.v1) out.push({ name: "ACF distribution", apply: () => applyAcfPreset() });
      if (!needsAccount()) catPresetsLoad(kind).forEach((p, i) => out.push({ name: p.name, user: true, idx: i, active: JSON.stringify((p.state.ids || []).slice().sort()) === cur, apply: () => { applyCatState(catStateForTree(p.state)); model.setWeightsOn(!!p.useWeights); fireTree(); } }));
      return out;
    },
    savePreset(name) {
      const kind = "practice-" + filtersMode();
      const list = catPresetsLoad(kind).filter((p) => p.name !== name);
      list.push({ name, state: catStateFromDom(), useWeights: model.weightsOn() });
      catPresetsSave(kind, list);
    },
    deletePreset(i) {
      const p = model.presets()[i]; if (!p || !p.user) return;
      const kind = "practice-" + filtersMode();
      const list = catPresetsLoad(kind); list.splice(p.idx, 1); catPresetsSave(kind, list);
    },
    close() { closeCategoryOverlay(); },
  };
  function applyAcfPreset() {
    const t = _catIndex; if (!t) return;
    const ids = [], weights = {};
    const tickWhole = (n) => { ids.push(n.id); (n.children || []).forEach(tickWhole); };
    t.roots.forEach((r) => { const w = ACF_DISTRIBUTION[r.name]; if (w) { tickWhole(r); weights[r.id] = w; } });
    applyCatState({ v: 1, ids, auto: [], weights });
    model.setWeightsOn(true);
    fireTree();
  }
  _practicePicker = CatPicker(model);
  return _practicePicker;
}
// Live redraw when the tree changes underneath (multiplayer mirror, clear…).
function refreshCatPicker() {
  try { if (_practicePicker && isCatOverlayOpen()) _practicePicker.render(); } catch (e) {}
  try { if (_searchPicker && document.getElementById("cat-ovl-search") && !document.getElementById("cat-ovl-search").classList.contains("hidden")) _searchPicker.render(); } catch (e) {}
}

// ── units pickers: whole-subtree picks held in memory. Database → Search and
//    Frequency use the same picker, tree (_dbCatTree) and saved presets. ──
let _searchPicker = null, _freqPicker = null;
let _dbCatUnits = [];
let _dbCatTree = null;
function unitsSummary(units) {
  const t = _dbCatTree; if (!t || !units.length) return "All";
  const names = units.map((id) => t.byId.get(id)?.name).filter(Boolean);
  return !names.length ? "All" : names.length <= 2 ? names.join(", ") : names.slice(0, 2).join(", ") + " +" + (names.length - 2);
}
function dbUnitsSummary() { return unitsSummary(_dbCatUnits); }
// cfg: { overlayId, get() -> ids, set(ids), changed(), tree() -> view (default the
//        Database tree), presetKind (saved presets bucket; null = none) }
function makeUnitsPicker(cfg) {
  const T = () => (cfg.tree ? cfg.tree() : _dbCatTree);
  const presetKind = cfg.presetKind === undefined ? "search" : cfg.presetKind;
  const U = () => new Set(cfg.get());
  const anc = (id) => { const t = T(); const out = []; let n = t && t.byId.get(id); while (n && n.parentId) { out.push(n.parentId); n = t.byId.get(n.parentId); } return out; };
  const isOn = (id) => { const u = U(); return u.has(id) || anc(id).some((a) => u.has(a)); };
  const commit = (ids) => { cfg.set(ids); cfg.changed(); };
  const model = {
    noun: "questions",
    host: () => document.querySelector("#" + cfg.overlayId + " .cat-picker"),
    tree: () => catTreeView(T()),
    headLabel: () => "",
    state(id) {
      if (isOn(id)) return "on";
      const t = T(), n = t && t.byId.get(id);
      return n && cfg.get().some((u) => { const un = t.byId.get(u); return un && un.path.startsWith(n.path + " > "); }) ? "partial" : "off";
    },
    toggle(id) {
      const t = T(); if (!t) return;
      const u = U();
      const n = t.byId.get(id); if (!n) return;
      if (isOn(id)) {
        if (u.has(id)) u.delete(id);
        else {
          // a covered descendant: split the covering unit into its other branches
          let a = anc(id).find((x) => u.has(x));
          u.delete(a);
          let node = t.byId.get(a);
          while (node && node.id !== id) {
            const next = (node.children || []).find((k) => k.id === id || n.path.startsWith(k.path + " > "));
            (node.children || []).forEach((k) => { if (k !== next && k.count > 0) u.add(k.id); });
            node = next;
          }
        }
      } else {
        [...u].forEach((x) => { const xn = t.byId.get(x); if (xn && xn.path.startsWith(n.path + " > ")) u.delete(x); });
        u.add(id);
        let node = n;
        while (node && node.parentId) {
          const par = t.byId.get(node.parentId);
          const kids = (par.children || []).filter((k) => k.count > 0);
          if (kids.every((k) => u.has(k.id))) { kids.forEach((k) => u.delete(k.id)); u.add(par.id); node = par; } else break;
        }
      }
      commit([...u]);
    },
    clear() { commit([]); },
    supportsWeights: false, weightsOn: () => false, setWeightsOn() {}, weight: () => 10, setWeight() {},
    unitCount: () => cfg.get().length,
    total() { const t = T(); return cfg.get().reduce((a, id) => a + ((t && t.byId.get(id)?.count) || 0), 0); },
    presets() {
      const cur = JSON.stringify(cfg.get().slice().sort());
      const out = [{ name: "All", apply: () => commit([]), active: !cfg.get().length }];
      if (presetKind) catPresetsLoad(presetKind).forEach((p, i) => out.push({ name: p.name, user: true, idx: i, active: JSON.stringify((p.units || []).slice().sort()) === cur, apply: () => { const t = T(); commit((p.units || []).filter((id) => t && t.byId.has(id))); } }));
      return out;
    },
    savePreset(name) { if (!presetKind) return; const list = catPresetsLoad(presetKind).filter((p) => p.name !== name); list.push({ name, units: cfg.get().slice() }); catPresetsSave(presetKind, list); },
    deletePreset(i) { const p = model.presets()[i]; if (!p || !p.user || !presetKind) return; const list = catPresetsLoad(presetKind); list.splice(p.idx, 1); catPresetsSave(presetKind, list); },
    close() { document.getElementById(cfg.overlayId)?.classList.add("hidden"); },
  };
  return CatPicker(model);
}
function searchPicker() {
  return _searchPicker || (_searchPicker = makeUnitsPicker({
    overlayId: "cat-ovl-search", get: () => _dbCatUnits, set: (ids) => { _dbCatUnits = ids; },
    changed: () => { const b = document.getElementById("db-cat-btn-val"); if (b) b.textContent = dbUnitsSummary(); dbSearchSoon(true); },
  }));
}
function freqPicker() {
  // Rebuilding a frequency list takes a moment, so it runs once the window closes.
  return _freqPicker || (_freqPicker = makeUnitsPicker({
    overlayId: "cat-ovl-freq", get: () => _freqUnits, set: (ids) => { _freqUnits = ids; },
    changed: () => { const b = document.getElementById("freq-cat-val"); if (b) b.textContent = unitsSummary(_freqUnits); },
  }));
}
async function openUnitsPicker(overlayId, pk, onClose, loadTree) {
  let o = document.getElementById(overlayId);
  if (!o) {
    o = document.createElement("div");
    o.id = overlayId;
    o.className = "qb-overlay settings-ovl cat-ovl hidden";
    o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Categories");
    o.innerHTML = '<div class="settings-modal cat-modal" tabindex="-1"><div class="cat-picker"></div></div>';
    document.getElementById("app").appendChild(o);
    o.querySelector(".cat-modal").addEventListener("keydown", (e) => { if (e.key !== "Escape") e.stopPropagation(); });
    // closing by backdrop, Esc or Done all just add .hidden
    new MutationObserver(() => { if (o.classList.contains("hidden") && o._onClose) { const f = o._onClose; o._onClose = null; f(); } }).observe(o, { attributes: true, attributeFilter: ["class"] });
  }
  if (loadTree) { try { await loadTree(); } catch (e) {} }
  else { try { _dbCatTree = catTreeView(await fetchCatTree("tossups")); } catch (e) { _dbCatTree = null; } }
  o._onClose = onClose || null;
  o.classList.remove("hidden");
  if (!pk.model._noun) pk.model.noun = "tossups";
  pk.open();
  try { o.querySelector(".cat-modal").focus({ preventScroll: true }); } catch (e) {}
}
function openSearchCategories() { return openUnitsPicker("cat-ovl-search", searchPicker()); }
function openFreqCategories() {
  const before = JSON.stringify(_freqUnits.slice().sort());
  return openUnitsPicker("cat-ovl-freq", freqPicker(), () => {
    if (JSON.stringify(_freqUnits.slice().sort()) !== before) { _freqPage = 0; runFrequency(); }
  });
}

// ── CategoryButton: the one category selector, for every screen and plugin
//    (host.categoryPicker). A button that reads "Categories  All ▾" (or the
//    picks) and opens the two-pane picker. Picks are whole subtrees: node ids
//    of the question category tree, or of a caller's own tree.
// opts: { selected: [ids], onChange(ids), live (report every toggle; default:
//         once, when the window closes), tree: [{id, name, count, children}]
//         (own tree; default the question tree), type: "tossups"|"bonuses"
//         (counts), label ("Categories"), noun, presets (bucket name, or false) }
// returns { el, get(), set(ids), paths(), matches(path), open(), summary(), tree(), ready }
let _catBtnSeq = 0;
function normCatTree(roots) {
  const byId = new Map(), byPath = new Map(), all = [];
  const walk = (n, parent, depth) => {
    const node = { id: String(n.id), name: String(n.name || n.id), count: Number(n.count) || 0, definition: n.definition || "", depth };
    node.path = parent ? parent.path + " > " + node.name : node.name;
    node.parentId = parent ? parent.id : null;
    byId.set(node.id, node); byPath.set(node.path, node); all.push(node);
    node.children = (n.children || []).map((c) => walk(c, node, depth + 1));
    if (!node.count && node.children.length) node.count = node.children.reduce((a, c) => a + c.count, 0);
    return node;
  };
  const r = (roots || []).map((n) => walk(n, null, 1));
  return { roots: r, byId, byPath, all };
}
function CategoryButton(btn, opts) {
  opts = opts || {};
  const el = btn || document.createElement("button");
  if (!btn) el.type = "button";
  el.classList.add("btn", "cat-launch");
  const id = "cat-ovl-u" + (++_catBtnSeq);
  let units = (opts.selected || []).map(String);
  let view = null;
  const custom = Array.isArray(opts.tree);
  const loadTree = async () => {
    if (view) return view;
    view = custom ? normCatTree(opts.tree) : catTreeView(await fetchCatTree(opts.type === "bonuses" ? "bonuses" : "tossups"));
    return view;
  };
  const summary = () => {
    if (!units.length || !view) return "All";
    const names = units.map((u) => view.byId.get(u)?.name).filter(Boolean);
    return !names.length ? "All" : names.length <= 2 ? names.join(", ") : names.slice(0, 2).join(", ") + " +" + (names.length - 2);
  };
  const label = opts.label != null ? opts.label : "Categories";   // "" = just the picks (a labelled row)
  const paint = () => { el.innerHTML = `${label ? escapeHtml(label) + " " : ""}<span class="accent-val">${escapeHtml(summary())}</span>${ic("down", 14)}`; el.setAttribute("aria-label", "Categories: " + summary()); };
  const fire = () => { try { if (opts.onChange) opts.onChange(units.slice()); } catch (e) { console.error(e); } };
  const pk = makeUnitsPicker({
    overlayId: id, get: () => units, set: (ids) => { units = ids; }, tree: () => view,
    presetKind: opts.presets === false ? null : (opts.presets || (custom ? null : "search")),
    changed: () => { paint(); if (opts.live) fire(); },
  });
  if (opts.noun) { pk.model.noun = opts.noun; pk.model._noun = true; }
  const api = {
    el,
    get: () => units.slice(),
    set(ids) { units = (ids || []).map(String); paint(); },
    summary,
    tree: () => view,
    paths: () => units.map((u) => view && view.byId.get(u)?.path).filter(Boolean),
    // a record's category path lies inside the picks (always true with none)
    matches(path) {
      if (!units.length) return true;
      const p = String(path || "");
      return api.paths().some((u) => p === u || p.startsWith(u + " > "));
    },
    open() {
      const before = JSON.stringify(units.slice().sort());
      return openUnitsPicker(id, pk, () => { paint(); if (!opts.live && JSON.stringify(units.slice().sort()) !== before) fire(); }, loadTree);
    },
  };
  el.addEventListener("click", (e) => { e.preventDefault(); api.open(); });
  paint();
  api.ready = loadTree().then(() => { paint(); return api; }).catch(() => api);
  return api;
}
// Custom lists, sets and packet files decide their own questions.
function categoriesLocked() { return ["custom", "set"].includes($("#mode-select")?.value); }
// The launcher summarizes the selection ("All", up to two names + N, or "Set by
// the mode" when locked) and keeps the tree's weights class in sync.
function refreshCategorySummary() {
  try {
    const tree = document.getElementById("category-filters");
    if (tree) tree.classList.toggle("weights-on", !!document.getElementById("enable-cat-weights")?.checked);
    const sum = document.getElementById("cat-summary");
    if (sum) {
      const locked = categoriesLocked();
      const names = locked ? [] : getSelectedCategoryNames();
      sum.textContent = locked ? "Set by the mode" : !names.length ? "All" : names.length <= 2 ? names.join(", ") : names.slice(0, 2).join(", ") + " +" + (names.length - 2);
    }
    if (typeof refreshCatPicker === "function") refreshCatPicker();
    const b = document.getElementById("btn-open-categories");
    if (!b) return;
    const locked = categoriesLocked();
    b.disabled = locked;   // pointer-events:none alone would still let the keyboard open it
    if (locked) closeCategoryOverlay();
  } catch (e) {}
}
// ONE bubbling change on the container, never per-box dispatches: that single
// event saves (the delegated handler's closest("#category-filters") matches the
// container itself), clears the prefetch and syncs multiplayer through the
// panel's capture listeners — no per-box chat lines, no check-all cascades.
function clearAllCategories() {
  const tree = document.getElementById("category-filters");
  if (!tree) return;
  tree.querySelectorAll(".cat-checkbox").forEach((cb) => { cb.checked = false; delete cb.dataset.autoChecked; });
  tree.querySelectorAll(".cat-weight").forEach((w) => { w.value = "0"; });
  tree.querySelectorAll(".cat-children").forEach((l) => l.classList.add("hidden"));
  tree.querySelectorAll(".cat-expand").forEach((x) => { x.textContent = "\u25B8"; x.classList.remove("open"); });
  tree.dispatchEvent(new Event("change", { bubbles: true }));
}
document.getElementById("btn-open-categories")?.addEventListener("click", openCategoryOverlay);
document.getElementById("btn-cat-clear")?.addEventListener("click", clearAllCategories);
// Both showScreen and QB.showPage emit this AFTER the new screen is active and
// BEFORE any plugin's onShow borrows the panel (their hand-backs are deferred),
// so a Custom display is gone before coach / flashcards / multiplayer read it.
window.QB?.on?.("screen:change", () => {
  closeCategoryOverlay();
  if (!$("#practice-screen")?.classList.contains("active")) removeCustomView();
});
// While the GUI is open no hotkey may fire (Space would buzz, S would start a
// session behind the backdrop). WINDOW capture runs before every document
// listener; a document-capture stopPropagation would not stop the others.
// Escape passes through so the settings-ovl handler closes the GUI, and so do
// the zoom hotkeys (whatever they are bound to). Every other combo is blocked —
// a hotkey rebound to Ctrl/Cmd+K must not start a session behind the backdrop.
// Default actions (typing, copy/paste, Space on a checkbox, menu accelerators)
// are untouched — only propagation stops. Tab wraps inside the modal.
// The open picker window: the practice one (#cat-ovl) or any other category
// picker (Search, Frequency, Stats, Review, plugins — CategoryButton).
function openCatPickerOverlay() {
  if (isCatOverlayOpen()) return document.getElementById("cat-ovl");
  return [...document.querySelectorAll(".cat-ovl:not(.hidden)")].find((o) => o.id !== "cat-ovl" && o.getClientRects().length > 0) || null;
}
window.addEventListener("keydown", (e) => {
  const ovl = e.key === "Escape" ? null : openCatPickerOverlay();
  if (!ovl) return;
  if (["text-bigger", "text-smaller", "text-reset"].some((a) => matchesHotkey(e, a))) return;
  // Keys typed INSIDE the window reach their target (Find box arrows/Enter,
  // the preset name); the modal's own bubble listener below stops them there.
  const modal0 = ovl.querySelector(".cat-modal");
  if (modal0 && modal0.contains(e.target) && e.key !== "Tab") return;
  if (e.key === "Tab") {
    const modal = ovl.querySelector(".cat-modal");
    const f = modal ? [...modal.querySelectorAll("button, input, select")].filter((x) => !x.disabled && x.getClientRects().length) : [];
    if (f.length) {
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    }
  }
  e.stopPropagation();
}, true);

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

// ── Collapsible sections + "Show more" lists ────────────────────────────────
// Markup contract: any element carrying data-coll="<key>" whose FIRST element
// child is its header. initCollapsibles(root) moves everything after the
// header into a .qb-coll-body (+ data-coll-body classes), prepends the shared
// .collapse-chevron, and restores the saved state from localStorage
// "qb-collapsed" ({key: 1 collapsed | 0 open}); an unsaved key falls back to
// data-coll-default="collapsed". Idempotent (skips .qb-coll). Plain
// localStorage on purpose — lsSet would push profile settings on every click.
// This is NOT the filter panel's .collapsible/.collapse-header mechanism
// (that one is reset by collapseFilterSections and must stay unpersisted).
const _COLL_LS = "qb-collapsed";
function _collMap() { try { return JSON.parse(localStorage.getItem(_COLL_LS) || "{}") || {}; } catch (e) { return {}; } }
function _collSave(key, collapsed) {
  const m = _collMap();
  m[key] = collapsed ? 1 : 0;
  try { localStorage.setItem(_COLL_LS, JSON.stringify(m)); } catch (e) {}
}
function initCollapsibles(root) {
  if (!root || !root.querySelectorAll) return;
  const m = _collMap();
  root.querySelectorAll("[data-coll]:not(.qb-coll)").forEach((sec) => {
    const head = sec.firstElementChild;
    if (!head) return;
    const body = document.createElement("div");
    body.className = "qb-coll-body" + (sec.dataset.collBody ? " " + sec.dataset.collBody : "");
    while (head.nextSibling) body.appendChild(head.nextSibling);
    sec.appendChild(body);
    const chev = document.createElement("span");
    chev.className = "collapse-chevron";
    chev.setAttribute("aria-hidden", "true");
    head.insertBefore(chev, head.firstChild);
    head.classList.add("qb-coll-head");
    head.setAttribute("role", "button");
    const key = sec.dataset.coll;
    const shut = key in m ? !!m[key] : sec.dataset.collDefault === "collapsed";
    sec.classList.add("qb-coll");
    sec.classList.toggle("qb-collapsed", shut);
    head.setAttribute("aria-expanded", String(!shut));
  });
}
// One delegated toggle for every data-coll section (base + plugins). Clicks on
// controls INSIDE a header are ignored — the SESSION BREAKDOWN title carries
// two <select>s. Opening fires a bubbling "qb-coll-open" so canvases that were
// drawn while hidden (clientWidth 0 → blank) can redraw.
document.addEventListener("click", (e) => {
  const head = e.target.closest(".qb-coll-head");
  if (!head || e.target.closest("select, input, textarea, button, a, label, .qb-select")) return;
  const sec = head.parentElement;
  if (!sec || !sec.classList.contains("qb-coll") || head !== sec.firstElementChild) return;
  const open = sec.classList.contains("qb-collapsed");
  sec.classList.toggle("qb-collapsed", !open);
  head.setAttribute("aria-expanded", String(open));
  if (sec.dataset.coll) _collSave(sec.dataset.coll, !open);
  if (open) sec.dispatchEvent(new CustomEvent("qb-coll-open", { bubbles: true }));
});

// Long list → the first `first` items plus a "Show N more / Show all" footer.
// Items stay in the DOM (listeners already wired, in-place filters keep
// working); hidden ones get .qb-more-hidden. The footer goes INSIDE a plain
// container (so the caller's next innerHTML rebuild drops it with the list)
// and right AFTER a <table> (it can't live inside one). How many are showing
// is remembered per key for the app's lifetime, so a rebuild (loadStats(true)
// after deleting a session) keeps the list as long as it was.
const _moreShown = new Map();
function limitList(listEl, itemSel, key, first = 10, step = 25) {
  if (!listEl || !listEl.parentNode) return;
  const items = [...listEl.querySelectorAll(itemSel)];
  const isTable = listEl.tagName === "TABLE";
  let foot = isTable ? listEl.nextElementSibling : listEl.lastElementChild;
  if (!foot || !foot.classList.contains("qb-more")) {
    foot = document.createElement("div");
    foot.className = "qb-more";
    if (isTable) listEl.after(foot); else listEl.appendChild(foot);
  }
  const paint = () => {
    const shown = Math.min(items.length, Math.max(first, _moreShown.get(key) || 0));
    items.forEach((it, i) => it.classList.toggle("qb-more-hidden", i >= shown));
    const left = items.length - shown;
    foot.innerHTML = left > 0
      ? `<span class="text-muted">Showing ${shown} of ${items.length}</span>` +
        `<button type="button" class="btn btn-sm btn-ghost" data-more="step">Show ${Math.min(step, left)} more</button>` +
        `<button type="button" class="btn btn-sm btn-ghost" data-more="all">Show all</button>`
      : items.length > first ? `<button type="button" class="btn btn-sm btn-ghost" data-more="less">Show fewer</button>` : "";
    foot.style.display = foot.innerHTML ? "" : "none";
  };
  foot.onclick = (e) => {
    const b = e.target.closest("[data-more]");
    if (!b) return;
    const cur = Math.max(first, _moreShown.get(key) || 0);
    const act = b.dataset.more;
    _moreShown.set(key, act === "all" ? items.length : act === "less" ? first : cur + step);
    paint();
    if (act === "less") foot.scrollIntoView({ block: "nearest" });
  };
  paint();
}


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
  refreshCategorySummary();   // also re-syncs .weights-on with the (silently set) toggle
}

const _MODE_SETTING_IDS = new Set(["opt-allow-rebuzzes", "opt-stop-on-power", "opt-allow-skips", "strictness-slider", "enable-cat-weights", "panel-buzz-timer", "panel-buzz-window", "panel-bonus-timer", "panel-speed-slider", "speed-slider", "opt-bonus-after", "opt-hide-pron", "opt-show-qmeta", "filter-hide-pron", "auto-reveal"]);
let _modeSettingTimer = null;
function scheduleModeSettingSave() {
  clearTimeout(_modeSettingTimer);
  _modeSettingTimer = setTimeout(() => { _modeSettingTimer = null; if ($("#category-filters .category-group")) saveFilterState(); }, 250);
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
$("#btn-hidden-manager")?.addEventListener("click", openHiddenManager);
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


// Jump into practice configured for a set (packetNumber "" = whole set).
// Applied by setMode AFTER the saved filter state restores, so the restore
// can't clobber the selection.
function playSetPacket(setName, packetNumber, asBonuses) {
  state._pendingPacketPlay = { setName, packetNumber: packetNumber == null ? "" : packetNumber };
  showScreen(asBonuses ? "practice-bonuses" : "practice-tossups");
  setMode(asBonuses ? "bonuses" : "tossups");
}

// "Play this packet" from the set browser: applied after filter restore.
function applyPendingPacketPlay() {
  const p = state._pendingPacketPlay;
  if (!p) return;
  if (state.customType) { if (state.sessionActive) endSession(); else endCustom(); }
  state._pendingPacketPlay = null;
  // Values FIRST, change event LAST — the change handler loads the set's
  // packet list and validates the packet number against the CURRENT fields.
  const ms = $("#mode-select");
  const sn = $("#mode-set-name");
  if (sn) { if (![...sn.options].some((o) => o.value === p.setName)) _catAddOpt(sn, p.setName); sn.value = p.setName; }
  const pk = $("#mode-packet");
  if (pk) pk.value = String(p.packetNumber);
  if (ms) { ms.value = "set"; ms.dispatchEvent(new Event("change", { bubbles: true })); }
  if (sn) sn.value = p.setName;
  if (pk) pk.value = String(p.packetNumber);
  state._gameSig = null;
}

function setMode(mode) {
  // FIRST: before loadCategories puts the other type's saved filters in place,
  // or switching Tossups -> Bonuses would leak one bucket into the other.
  removeCustomView();
  if (state.mode && state.mode !== mode && $("#category-filters .category-group")) saveFilterState();
  clearTimeout(_debounceTimer); _debounceTimer = null;   // a pending debounce would save the OLD panel into the NEW mode's bucket
  state.mode = mode;
  state._practiceBase = mode;
  const type = mode === "tossups" ? "tossups" : "bonuses";
  $("#practice-title").textContent = mode === "bonuses" ? "Bonuses" : "Tossups";
  updateTopbar();
  // Two async chains both call restoreFilterState; apply a pending packet-play
  // only after BOTH settle, or the later restore clobbers the selection.
  Promise.all([
    loadSets(),
    loadCategories(type).then(() => {
      const saved = restoreFilterState();
      if (saved) restoreCategorySelections(saved);
      $("#category-filters")?.classList.toggle("weights-on", !!state.settings.useWeights);
      refreshCategorySummary();
    }),
  ]).then(() => { restoreFilterState(); applyPendingPacketPlay(); applyCustomView(); });
  updateModeFields();
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
  setTimeout(() => tipInto(document.getElementById("question-area"), "practice-keys", null, document.getElementById("question-content")), 0);
  if (state.customType && !state.reviewIds && !state.bonusIds) endCustom();   // defensive
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
  // Reset BOTH buckets — a leftover interleaved-bonus history from the previous
  // session must not leak into (or be exported with) this one.
  state.histories = { tossups: [], bonuses: [] };
  state._gameSig = null; state._gameQueue = null; state._gamePaired = null; state._gameIdx = 0;
  state._wantBonus = false; state._pendingPairedBonus = null; state._currentPaired = null;
  state._starredQueue = null; state._starredSig = null; state._starredIdx = 0;

  // Repaint EVERYTHING the reset touched — the score pill and the session
  // history panel otherwise keep showing the previous session until the
  // first answer lands.
  updateSessionStats();
  renderHistoryPanel();
  $("#btn-start-session").innerHTML = state.mode === "tossups"
    ? keyLabelHtml("buzz", "Buzz")
    : keyLabelHtml("start-skip", "Skip");
  qbEmit("session:start", { sessionId: state.sessionId, mode: state.mode });
  syncDrawerStart();
  nextQuestion();
}

// Leaving a practice screen mid-session no longer THROWS AWAY the session —
// it suspends it: every timer stops (nothing may count down or auto-advance
// while you are on another screen) and the question stays on the page, so
// coming back shows exactly where you were instead of the start placeholder.
// Ending a session is now only ever explicit (Esc-Esc, or Start/End session).
function suspendSession() {
  if (!state.sessionActive) return;
  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }
  stopBuzzTimer();
  stopEventTimer();
  // Mid-reading questions come back paused so the clock can't run out while
  // you were away; already-answered ones just sit on their result.
  if (!state.isBuzzed && !state.resultAreaVisible && state.currentQuestion && !state.questionFullyRead) {
    state.isPaused = true;
    $("#question-text")?.classList.add("paused-text");
    if (!document.getElementById("pause-overlay")) {
      const el = document.createElement("div");
      el.className = "pause-overlay";
      el.id = "pause-overlay";
      el.textContent = "PAUSED";
      $("#question-area")?.appendChild(el);
    }
  }
}

function endSession() {
  endCustom();
  state.sessionActive = false;
  state.reviewIds = null;
  state.bonusIds = null;
  state._gameSig = null; state._gameQueue = null; state._gameIdx = 0;
  state._wantBonus = false; state._pendingPairedBonus = null; state._currentPaired = null;
  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }
  $("#btn-start-session").innerHTML = keyLabelHtml("start-skip", "Start Session");
  resetQuestionUI();
  updateLiveStats();
  syncDrawerStart();
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
  state._bonusRecorded = false; state._bonusResult = null; state._bonusOverrides = []; state._bonusJudged = []; state._bonusLastIdx = null;
  state.bonusUserAnswers = [];
  state.resultAreaVisible = false;

  if (state.revealTimer) { cancelAnimationFrame(state.revealTimer); state.revealTimer = null; }

  state._loadingQuestion = true; // cleared by renderQuestion / endOfQueue
  resetQuestionUI();

  const placeholder = $("#question-placeholder");
  placeholder.classList.remove("hidden");
  placeholder.innerHTML = '<div class="placeholder-icon"><svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.4-1.3 1-1.3 1.8v.3"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg></div><p class="text-muted">Loading next question…</p>';

  if (state.reviewIds && state.mode === "tossups") {
    if (!state.reviewIds.length) {
      state.reviewIds = null;
      endOfQueue("Review complete");
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
    if (!state.bonusIds.length) { state.bonusIds = null; endOfQueue("Done — Press Esc to leave."); return; }
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
      if (!b && state._pairPrefetch && state._bonusFromQ && state._pairPrefetch.qid === state._bonusFromQ.id) {
        try { b = await state._pairPrefetch.p; } catch { b = null; }
      }
      state._pairPrefetch = null;
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
  if (_mv === "set") { await serveOrdered(); return; }

  restoreTossupDisplay();

  const filters = getFilters();

  if (filters.starredOnly) { await serveStarredQuestion(filters); return; }

  const endpoint =
    state.mode === "tossups"
      ? "/api/tossups/random"
      : "/api/bonuses/random";

  const params = _randomQuestionParams(filters);

  const qType = state.mode === "tossups" ? "tossup" : "bonus";
  const servable = (q) => q && !isQuestionHidden(q.id, qType) &&
    (!window.QB?.passesQuestionFilters || window.QB.passesQuestionFilters(q, { mode: state.mode }));

  // Serve from the prefetch queue when it has something valid — this is what
  // makes "next" instant. Fall back to a live fetch otherwise.
  let question = null;
  const _plist = state.mode === "tossups" ? _prefetch.tossups : _prefetch.bonuses;
  while (_plist.length && !question) {
    const cand = _plist.shift();
    if (servable(cand)) question = cand;
  }

  // The website: a refill already on its way beats a fresh request queued
  // behind it (each is a round trip to the server).
  if (!question && IS_WEB && _prefetch.filling) {
    for (let i = 0; i < 160 && _prefetch.filling && !_plist.length; i++) await new Promise((r) => setTimeout(r, 25));
    while (_plist.length && !question) {
      const cand = _plist.shift();
      if (servable(cand)) question = cand;
    }
  }

  if (!question) {
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
    question = state.mode === "tossups" ? data.tossup : data.bonus;
    if (data.error) { showError("Error: " + data.error); return; }
    if (!question) {
      showError("No questions match your filters");
      return;
    }
    for (let tries = 0; tries < 8 && !servable(question); tries++) {
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
  setTimeout(refillPrefetch, 0);
}

// ── Question preloading ────────────────────────────────────────────────────
// Random-mode questions are fetched a few ahead in the background so pressing
// "next" renders instantly instead of waiting on the year-filtered random
// query (~150ms). Any filter-panel change empties the queue (a capture-phase
// listener below), and hidden/plugin-filtered questions are re-checked at
// serve time, so a stale entry can never be served.
// The website keeps more in hand and fetches them side by side: each request
// there is a round trip to the server, so a quick run of Nexts would empty a
// queue of 3 refilled one at a time.
const _PREFETCH_TARGET = IS_WEB ? 6 : 3;
const _prefetch = { tossups: [], bonuses: [], gen: 0, filling: false };
function clearPrefetch() {
  _prefetch.tossups.length = 0;
  _prefetch.bonuses.length = 0;
  _prefetch.gen++;
}
document.getElementById("filters-panel")?.addEventListener("change", clearPrefetch, true);
document.getElementById("filters-panel")?.addEventListener("input", clearPrefetch, true);

function _randomQuestionParams(filters) {
  const params = new URLSearchParams();
  if (filters.categories?.length) params.set("categories", filters.categories.join(","));
  if (filters.subcategories?.length) params.set("subcategories", filters.subcategories.join(","));
  if (filters.alternateSubcategories?.length) params.set("alternateSubcategories", filters.alternateSubcategories.join(","));
  if (filters.setIds?.length) params.set("setIds", filters.setIds.join(","));
  else if (filters.setNames?.length) params.set("setNames", filters.setNames.join(","));
  if (filters.packetNumbers?.length) params.set("packetNumbers", filters.packetNumbers.join(","));
  if (filters.difficulties?.length) params.set("difficulties", filters.difficulties.join(","));
  if (filters.standard) params.set("standard", "1");
  if (filters.powermarkOnly) params.set("powermarkOnly", "true");
  if (filters.cleanOnly) params.set("cleanOnly", "1");
  if (filters.starredOnly) params.set("starredOnly", "true");
  if (filters.yearMin) params.set("yearMin", filters.yearMin);
  if (filters.yearMax) params.set("yearMax", filters.yearMax);
  if (filters.tags && filters.tags.length) params.set("tags", JSON.stringify(filters.tags.map((t) => (t.id ? { f: t.f, v: t.v, x: t.x ? 1 : 0, id: t.id } : { f: t.f, v: t.v, x: t.x ? 1 : 0 }))));
  params.set("random", "1");
  return params;
}

function _prefetchEligible() {
  const mv = $("#mode-select")?.value;
  return state.sessionActive && !state.reviewIds && !state.bonusIds && !state._wantBonus &&
    mv !== "set" && mv !== "custom" &&
    !$("#filter-starred")?.checked &&
    (state.mode === "tossups" || state.mode === "bonuses") &&
    (!state._practiceBase || state._practiceBase === state.mode);   // not the bonus-after-correct interlude
}

async function refillPrefetch() {
  if (_prefetch.filling || !_prefetchEligible()) return;
  _prefetch.filling = true;
  const gen = _prefetch.gen;
  const mode = state.mode;
  const list = mode === "tossups" ? _prefetch.tossups : _prefetch.bonuses;
  const endpoint = mode === "tossups" ? "/api/tossups/random" : "/api/bonuses/random";
  try {
    let attempts = 0;
    while (list.length < _PREFETCH_TARGET && attempts < _PREFETCH_TARGET * 3) {
      // Fresh filters per fetch: in weighted mode every question is its own
      // category roll, exactly as if it had been fetched on demand. The whole
      // shortfall is fetched at once (the website), one at a time otherwise.
      const n = IS_WEB ? _PREFETCH_TARGET - list.length : 1;
      attempts += n;
      // each question joins the queue the moment it arrives (a Next waiting on
      // the refill gets the first one, not the slowest)
      const keep = (q) => {
        if (!q || gen !== _prefetch.gen || mode !== state.mode) return;
        const dup = list.some((x) => x && x.id === q.id) || (state.currentQuestion && state.currentQuestion.id === q.id);
        if (!dup) list.push(q);
      };
      const batch = [];
      for (let i = 0; i < n; i++) {
        const filters = getFilters();
        if (filters.starredOnly) break;
        batch.push(API.get(`${endpoint}?${_randomQuestionParams(filters)}`).then((d) => { const q = mode === "tossups" ? d.tossup : d.bonus; keep(q); return q; }, () => null));
      }
      if (!batch.length) break;
      const got = await Promise.all(batch);
      if (gen !== _prefetch.gen || mode !== state.mode) return;   // filters/mode moved on
      if (!got.some(Boolean)) break;
    }
  } finally {
    _prefetch.filling = false;
  }
}

async function skipQuestion() {
  if (!state.currentQuestion || state.resultAreaVisible || state._loadingQuestion) return;
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
      // If a neg was already recorded this reading (rebuzz mode), the attempt
      // is in the books — don't overwrite that row with a 0-point skip.
      if (!state._negRecorded) API.post("/api/check-tossup", {
        questionId: question.id,
        answer: "",
        buzzPosition: displayPosToOriginal(state.buzzPosition || 0),
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
  {
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
  // Skip questions the user has hidden ("never serve again").
  {
    const t = state._practiceBase === "bonuses" ? "bonus" : "tossup";
    while (state._gameIdx < queue.length && queue[state._gameIdx] && isQuestionHidden(queue[state._gameIdx].id, t)) state._gameIdx++;
  }
  if (state._gameIdx >= queue.length) {
    endOfQueue("Packet finished");
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
  // Tree selection: categoryPaths (node ids travel in categories). A question
  // matches when its category path is one of them or lies beneath one.
  if (f.categoryPaths && f.categoryPaths.length) {
    const p = q.category_path || [q.category, q.subcategory, q.alternate_subcategory].filter(Boolean).join(" > ");
    if (!f.categoryPaths.some((x) => p === x || p.startsWith(x + " > "))) return false;
  } else if (f.categories && f.categories.length && q.category && f.categories.indexOf(q.category) < 0) return false;
  if (f.subcategories && f.subcategories.length && q.subcategory && f.subcategories.indexOf(q.subcategory) < 0) return false;
  if (f.alternateSubcategories && f.alternateSubcategories.length && q.alternate_subcategory && f.alternateSubcategories.indexOf(q.alternate_subcategory) < 0) return false;
  if (f.difficulties && f.difficulties.length && q.difficulty != null && f.difficulties.map(String).indexOf(String(q.difficulty)) < 0) return false;
  if (f.yearMin && q.set_year && q.set_year < f.yearMin) return false;
  if (f.yearMax && q.set_year && q.set_year > f.yearMax) return false;
  if (f.tags && f.tags.length) {
    const qt = questionTags(q) || {};
    const path = qPathOf(q);
    for (const t of f.tags) {
      const has = t.f === "subject"
        ? !!(t.p && (path === t.p || path.startsWith(t.p + " > ")))
        : Array.isArray(qt[t.f]) && qt[t.f].includes(t.v);
      if (t.x ? has : !has) return false;
    }
  }
  return true;
}
async function serveStarredQuestion(filters) {
  const type = state.mode === "bonuses" ? "bonus" : "tossup";
  const sig = ["starred", type,
    (filters.categories || []).join(","), (filters.subcategories || []).join(","),
    (filters.alternateSubcategories || []).join(","), (filters.difficulties || []).join(","),
    filters.yearMin, filters.yearMax, JSON.stringify(filters.tags || [])].join("::");
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
  // Hidden questions are never served — skip at serve time so mid-session
  // hides take effect immediately.
  while (state._starredIdx < queue.length && queue[state._starredIdx] && isQuestionHidden(queue[state._starredIdx].id, type)) state._starredIdx++;
  if (!queue.length) { endOfQueue(`No starred ${noun} match these filters`); return; }
  if (state._starredIdx >= queue.length) {
    endOfQueue(`All ${queue.length} starred ${noun} done`);
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
  if ($("#mode-select")?.value === "set") {
    const sn = $("#mode-set-name")?.value;
    const set = sn && (_allSets || []).find((x) => x.name === sn);
    if (set && set.id) params.set("setIds", set.id); else if (sn) params.set("setNames", sn);
  }
  try { const d = await API.get("/api/bonuses/random?" + params.toString()); return d.bonus || null; } catch { return null; }
}

// Start fetching the bonus-after-correct-tossup bonus the moment the tossup is
// judged correct, so it's already here when the player presses next.
function _primePairBonus() {
  if (state._pendingPairedBonus || !state._bonusFromQ) { state._pairPrefetch = null; return; }
  const q = state._bonusFromQ;
  state._pairPrefetch = { qid: q.id, p: fetchMatchingBonus(q).catch(() => null) };
}

function restoreTossupDisplay() {
  if (state._practiceBase === "tossups" && state.mode === "bonuses") {
    switchPracticeType("tossups", "PRACTICE");
  }
}

function switchPracticeType(type, label) {
  state.mode = type;
  $("#practice-title").textContent = type === "bonuses" ? (state._practiceBase === "tossups" ? "Tossups \u00b7 bonus" : "Bonuses") : "Tossups";
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


// Info bar: "Root / Leaf" of the question's category path, the full path in an ⓘ.
function questionCategoryHtml(q) {
  const parts = String(q.category_path || [q.category, q.subcategory, q.alternate_subcategory].filter(Boolean).join(" > ")).split(" > ").filter(Boolean);
  if (!parts.length) return "<span>?</span>";
  const short = parts.length > 1 ? parts[0] + " / " + parts[parts.length - 1] : parts[0];
  return `<span>${escapeHtml(short)}</span>` + (parts.length > 2 ? `<span class="qb-info" data-tip="${escapeHtml(parts.join(" \u203a "))}">i</span>` : "");
}
// Warning-group flags (brief §6) as one "!" hover; review markers stay hidden.
const QUESTION_WARN_CODES = new Set(["DATA_DEFECT", "MERGED_QUESTION_SUSPECTED", "LEADIN_EMPTY", "BONUS_ONE_PART", "BONUS_VALUES_EXCEED_PARTS", "VALUE_LIKELY_PACKET_TYPO", "SOURCE_FIX_NEEDS_REVIEW", "SOURCE_FIX_NOT_APPLIED"]);
function questionWarnings(q) {
  let flags = [];
  try { flags = Array.isArray(q.flags) ? q.flags : JSON.parse(q.flags || "[]"); } catch { flags = []; }
  return flags.filter((f) => f && QUESTION_WARN_CODES.has(f.code)).map((f) => f.detail || f.code);
}
function questionWarnHtml(q) {
  const w = questionWarnings(q);
  return w.length ? `<span class="qb-info qmeta-warn" data-tip="${escapeHtml(w.join(" \u2022 "))}">!</span>` : "";
}
function renderQuestion(question) {
  state._loadingQuestion = false;
  state._negRecorded = false;
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
  // Category, difficulty and year stay hidden while the question is read; the
  // result (renderResultTags) reveals them.
  $("#question-meta").classList.add("qm-reading");
  $("#question-meta").innerHTML = `
    <span class="q-num">Question ${state.questionCount || 1}</span>
    <span class="qm-info">${catBadgeHtml(qPathOf(question))}${questionWarnHtml(question)}
    <span class="badge diff-badge" title="${escapeHtml(DIFF_FULL[parseInt(diffLabel)] || diffName)}">Diff ${escapeHtml(String(diffLabel))}</span>
    ${yearBadgeHtml(question.set_year)}</span>
    <span class="spacer q-spacer"></span>
    <span class="star-btn save-plus" id="save-indicator" title="Save to review / folders">+</span>
    <span class="star-btn" id="star-indicator" data-id="${question.id}" data-type="${isTossup ? "tossup" : "bonus"}" title="Star">
      ${getStarChar(question.id, isTossup ? "tossup" : "bonus")}
    </span>
  `;

  document.getElementById("star-indicator")?.addEventListener("click", toggleStar);
  document.getElementById("save-indicator")?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (state.currentQuestion) openSaveMenu(state.currentQuestion, state.mode === "tossups" ? "tossup" : "bonus", ev.currentTarget);
  });

  checkStarStatus(question.id, isTossup ? "tossup" : "bonus");
  // a new question starts at the top, without the room a long one before it added (followReading)
  const qa = document.getElementById("question-area");
  if (qa) { qa.style.minHeight = ""; qa._followKey = null; }
  if (matchMedia("(max-width: 760px)").matches) { const sc = document.getElementById("practice-screen"); if (sc) sc.scrollTop = 0; }

  if (isTossup) {
    renderTossup(question);
  } else {
    renderBonus(question);
  }

  qbEmit("question:render", { type: isTossup ? "tossup" : "bonus", question });
}

function renderTossup(q) {
  let text = q.question_sanitized || q.question || "";
  text = applyNoteFilter(text, q.question);   // notes first: the HTML locates them in the unstripped text
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
    // Instant reveal still honours "Stop on power": hold at the mark, paused;
    // resuming (P) shows the rest instantly (revealText's own speed-0 path).
    if (state.settings.stopOnPower && state.prePowerEnd > 0) {
      state.revealIndex = state.prePowerEnd;
      state.buzzPosition = state.revealIndex;
      $("#question-text").innerHTML = formatQuestionText(displayText, state.revealIndex, state.prePowerEnd);
      state._stoppedAtPower = true;
      state.isPaused = true;
      const pel = document.createElement("div");
      pel.className = "pause-overlay"; pel.id = "pause-overlay";
      pel.textContent = "PAUSED";
      $("#question-area")?.appendChild(pel);
      return;
    }
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
  leadin = applyNoteFilter(leadin, q.leadin);
  if (state.settings.hidePronunciations) leadin = stripPronunciations(leadin);
  leadin = window.QB?.applyTextTransforms?.(leadin, { type: "bonus-leadin", question: q }) ?? leadin;
  let parts;
  try {
    parts = JSON.parse(q.parts_sanitized || q.parts || "[]");
  } catch {
    parts = ["Error parsing bonus parts"];
  }
  let partsHtml = [];
  try { partsHtml = JSON.parse(q.parts || "[]"); } catch { partsHtml = []; }
  try {
    state.bonusAnswers = JSON.parse(q.answers_sanitized || q.answers || "[]");
  } catch {
    state.bonusAnswers = [];
  }
  try { state.bonusAnswersRaw = JSON.parse(q.answers || "[]"); } catch { state.bonusAnswersRaw = []; }

  $("#power-mark").classList.add("hidden");
  $("#question-text").textContent = leadin;
  state.currentDisplayText = null; // stale tossup text must never resume over a bonus
  state.revealIndex = leadin.length;
  $("#buzz-area").classList.add("hidden");

  const bonusArea = $("#bonus-parts-area");
  bonusArea.classList.remove("hidden");

  state.bonusPartsAnswered = 0;
  state._bonusRecorded = false; state._bonusResult = null; state._bonusOverrides = []; state._bonusJudged = []; state._bonusLastIdx = null;
  state.bonusUserAnswers = [];
  state._bonusPrompted = []; state._bonusPromptFrom = []; state._bonusEval = []; state._bonusDone = [];
  bonusArea.querySelectorAll(".bonus-prompt-banner").forEach((el) => el.remove());

  // A bonus has 1-9 parts (brief §2.3). The page ships three part blocks;
  // more are generated on demand and unused ones stay hidden.
  const nParts = Math.max(1, parts.length);
  state.bonusPartCount = nParts;
  state._bonusOverrides = new Array(nParts).fill(null);
  ensureBonusPartBlocks(nParts);
  const bv = bonusPartValues(q);
  for (let i = 0; i < nParts; i++) {
    const head = $(`#bonus-part-${i} .bonus-part-header`);
    if (head) head.textContent = "PART " + bonusPartLetter(i) + (bv.stated && bv.values[i] !== 10 ? ` [${bv.values[i]}]` : "");
    let partText = parts[i] || `Part ${i + 1}`;
    partText = applyNoteFilter(partText, partsHtml[i]);
    if (state.settings.hidePronunciations) partText = stripPronunciations(partText);
    partText = window.QB?.applyTextTransforms?.(partText, { type: "bonus-part", question: q, part: i }) ?? partText;
    $(`#bonus-text-${i}`).textContent = partText;
    $(`#bonus-input-${i}`).value = "";
    $(`#bonus-part-${i}`).classList.add("hidden");
    $(`#bonus-part-${i}`).classList.remove("bp-done", "bp-collapsed");
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

function bonusPartLetter(i) { return "ABCDEFGHI"[i] || String(i + 1); }
// Part blocks 3..n-1 cloned from the static third block; blocks past n hidden.
function ensureBonusPartBlocks(n) {
  const area = $("#bonus-parts-area"), tmpl = $("#bonus-part-2"), submit = $("#btn-submit-bonus");
  if (!area || !tmpl) return;
  for (let i = 3; i < n; i++) {
    if ($(`#bonus-part-${i}`)) continue;
    const el = tmpl.cloneNode(true);
    el.id = `bonus-part-${i}`;
    el.querySelector(".bonus-part-text").id = `bonus-text-${i}`;
    const inp = el.querySelector(".bonus-answer-input");
    inp.id = `bonus-input-${i}`; inp.placeholder = `answer for part ${bonusPartLetter(i)}...`; inp.value = "";
    el.querySelector(".bonus-part-answer").id = `bonus-answer-${i}`;
    area.insertBefore(el, submit || null);
  }
  for (const el of area.querySelectorAll(".bonus-part")) {
    const i = parseInt(el.id.replace("bonus-part-", ""), 10);
    el.classList.toggle("bonus-part-unused", i >= n);
  }
}
function showBonusNextHint(idx) {
  const el = $("#bonus-next-hint");
  if (!el) return;
  el.innerHTML = keyLabelHtml("next-question", `Reveal Part ${bonusPartLetter(idx)}`);
  el.classList.remove("hidden");
}

// ── On-screen practice controls (#practice-actions) ──
// The same moves as the keys, for phones and anyone who'd rather click: one
// main button (Start → Skip while reading → "Next part" between bonus parts;
// after an answer the result's own Next takes over), Buzz and Pause/Resume.
// Kept in step with the session by a light poll while practice is on screen.
function practiceMain() {
  if (!state.sessionActive) return { label: "Start", key: "start-skip", run: () => startSession() };
  if (state.mode === "bonuses" && state.bonusAwait != null) return { label: "Next part", key: "next-question", run: () => advanceBonusPart() };
  if (!state.resultAreaVisible && state.settings.allowSkips && state.currentQuestion && !state.isBuzzed && !state._loadingQuestion) return { label: "Skip", key: "start-skip", run: () => skipQuestion() };
  // phones: Next rides the bottom bar (the result's own Next button is hidden there, below a long question)
  if (state.resultAreaVisible && state.currentQuestion) return { label: "Next", key: "next-question", next: true, run: () => nextQuestion() };
  return null;
}
// Long questions: keep the line being read on screen (above a bottom bar pinned
// there) while the reader follows along; someone who scrolled away is left alone.
// block: bring a whole box (a bonus part, the result) above the bar, top kept in view.
function followReading(el, key, block) {
  if (!el || !el.isConnected) return;
  // a new question drops the room a previous one added (below)
  const qa = el.closest(".question-area");
  key = String(key != null ? key : el.textContent.slice(0, 40));
  if (qa && qa._followKey !== key) { qa._followKey = key; qa.style.minHeight = ""; followReading._target = null; }
  const rects = el.getClientRects(); if (!rects.length) return;
  let sc = el.parentElement;
  while (sc && sc !== document.body) { const o = getComputedStyle(sc).overflowY; if ((o === "auto" || o === "scroll") && sc.scrollHeight > sc.clientHeight) break; sc = sc.parentElement; }
  if (!sc || sc === document.body) return;
  const box = sc.getBoundingClientRect(), first = rects[0], last = rects[rects.length - 1];
  // a smooth scroll still on its way counts as done (fast reading outran it)
  const pending = followReading._sc === sc && followReading._target != null ? Math.max(0, followReading._target - sc.scrollTop) : 0;
  let limit = box.bottom - 8;
  for (const bar of sc.querySelectorAll(".practice-actions, .mp-actions")) { const r = bar.getBoundingClientRect(); if (r.height && r.top < limit && r.bottom >= box.bottom - 2) limit = r.top - 8; }
  const tip = document.querySelector("#qb-tip-dock .qb-tip:not([hidden])");   // a tip floating over the bottom counts too
  if (tip) { const r = tip.getBoundingClientRect(), er = el.getBoundingClientRect(); if (r.height && r.top < limit && r.left < er.right && r.right > er.left) limit = r.top - 8; }
  const lh = parseFloat(getComputedStyle(el.parentElement).lineHeight) || last.height || 24;
  const over = last.bottom - pending - limit;
  let d = 0;
  if (block) { if (over > 0) d = Math.min(over + 16, first.top - pending - box.top - 12); }
  else if (over > 0 && over < lh * 4) d = over + lh * 3;
  if (d <= 0) return;
  // the question area grows by as much, so a bar pinned to the bottom (sticky, its last
  // item) stays pinned instead of docking mid-screen with the stats showing under it
  if (qa) qa.style.minHeight = Math.ceil(qa.getBoundingClientRect().height + d) + "px";
  followReading._sc = sc; followReading._target = sc.scrollTop + pending + d;
  sc.scrollTo({ top: followReading._target, behavior: "smooth" });
}
window.qbFollowReading = followReading;
function syncPracticeActions() {
  const bar = document.getElementById("practice-actions"); if (!bar) return;
  const set = (el, show, text) => { if (!el) return; if (el.hidden === show) el.hidden = !show; if (text != null && el.firstChild && el.firstChild.nodeValue !== text) el.firstChild.nodeValue = text; };
  const reading = state.sessionActive && !!state.currentQuestion && !state.resultAreaVisible && !state._loadingQuestion;
  const m = practiceMain();
  set(document.getElementById("pa-main"), !!m, m ? m.label : null);
  document.getElementById("pa-main")?.classList.toggle("pa-next", !!(m && m.next));
  const mk = document.querySelector("#pa-main kbd"); if (m && mk) mk.textContent = keyDisplay(m.key);
  set(document.getElementById("pa-buzz"), state.mode === "tossups" && reading && !state.isBuzzed);
  set(document.getElementById("pa-pause"), reading && !state.isBuzzed && state.bonusAwait == null, state.isPaused ? "Resume" : "Pause");
  // phones: once the result shows, the question area lets go of its screen-tall room
  // (Next and the stats follow the result) and the verdict comes into view once
  const ra = document.getElementById("result-area"), shown = !!(state.resultAreaVisible && ra && !ra.classList.contains("hidden"));
  if (shown && !syncPracticeActions._shown && matchMedia("(max-width: 760px)").matches) {
    const qa = document.getElementById("question-area"); if (qa) qa.style.minHeight = "";
    ra.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  syncPracticeActions._shown = shown;
}
(function wirePracticeActions() {
  const on = (id, fn) => document.getElementById(id)?.addEventListener("click", (e) => { e.preventDefault(); e.currentTarget.blur(); fn(); syncPracticeActions(); });
  on("pa-main", () => { const m = practiceMain(); if (m) m.run(); });
  on("pa-buzz", () => { if (state.sessionActive && !state.isBuzzed && state.mode === "tossups") buzz(); });
  on("pa-pause", () => togglePause());
  const main = document.getElementById("pa-main"); if (main && !main.querySelector("kbd")) main.appendChild(Object.assign(document.createElement("kbd"), { textContent: keyDisplay("start-skip") }));
  const pause = document.getElementById("pa-pause"); if (pause && !pause.querySelector("kbd")) pause.appendChild(Object.assign(document.createElement("kbd"), { textContent: keyDisplay("pause-reveal") }));
  setInterval(() => { if (document.querySelector("#practice-screen.active")) syncPracticeActions(); }, 200);
})();

function advanceBonusPart() {
  if (state.mode !== "bonuses" || !state.currentQuestion || state.bonusAwait == null) return false;
  const idx = state.bonusAwait;
  state.bonusAwait = null;
  $("#bonus-next-hint")?.classList.add("hidden");
  startBonusPart(idx);
  return true;
}

function startBonusPart(idx) {
  for (let j = 0; j < idx; j++) if ($(`#bonus-part-${j}`)?.classList.contains("bp-done")) bonusPartCollapse(j, true);
  $(`#bonus-part-${idx}`)?.classList.remove("hidden");
  if (matchMedia("(max-width: 760px)").matches) followReading($(`#bonus-part-${idx}`), state.currentQuestion && state.currentQuestion.id, true);   // phones: the new part, above the bottom bar
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
  if ((state._bonusDone ||= [])[idx]) return;   // Enter and the part timer can both land
  state._bonusDone[idx] = true;
  stopEventTimer();
  state._bonusLastIdx = idx;
  revealBonusPartAnswer(idx);
  if (idx < (state.bonusPartCount || 3) - 1) { state.bonusAwait = idx + 1; showBonusNextHint(idx + 1); }
  else { $("#btn-submit-bonus").classList.add("hidden"); submitBonusAnswers(); }
}

document.addEventListener("keydown", async (e) => {
  if (!e.target?.classList?.contains("bonus-answer-input")) return;
  if (e.key !== "Enter") return;
  e.preventDefault();
  const inp = e.target;
  if (inp.disabled) return;
  const idx = parseInt(inp.id.replace("bonus-input-", ""));
  const answer = inp.value.trim();
  state.bonusUserAnswers[idx] = answer;
  state.bonusPartsAnswered = Math.max(state.bonusPartsAnswered, idx + 1);
  inp.disabled = true;
  // One prompt per part, as on tossups: judge first, and a prompt reopens the
  // input for a more specific answer instead of revealing.
  if (answer && !(state._bonusPrompted || [])[idx]) {
    const q = state.currentQuestion;
    const r = await judgeBonusPart(idx, answer);
    if (state.currentQuestion !== q || state.mode !== "bonuses" || (state._bonusDone || [])[idx]) return;
    if (r && r.status === "prompt") { promptBonusPart(idx, answer, r); return; }
  }
  finalizeBonusPart(idx);
});

// One part judged with the same options check-bonus uses (hidden answers,
// joint pieces); cached per part + answer so reveal and submit reuse it.
async function judgeBonusPart(idx, answer) {
  const q = state.currentQuestion;
  if (!q || !answer) return { status: "reject" };
  const previous = (state._bonusPromptFrom || [])[idx] || null;
  const key = answer + "\u0000" + (previous || "");
  const c = (state._bonusEval || [])[idx];
  if (c && c.key === key) return c.r;
  let r = null;
  try {
    r = await API.post("/api/evaluate-bonus-part", { questionId: q.id, part: idx, answer, strictness: state.settings.strictness, previous });
    if (!r || r.error) r = null;
  } catch { r = null; }
  if (!r) {
    try {
      r = await API.post("/api/evaluate-answer", { answerline: state.bonusAnswersRaw?.[idx] || state.bonusAnswers?.[idx] || "", sanitized: state.bonusAnswers?.[idx] || "", answer, strictness: state.settings.strictness });
    } catch { r = { status: "reject" }; }
  }
  if (state.currentQuestion === q) (state._bonusEval ||= [])[idx] = { key, r };
  return r;
}

function promptBonusPart(idx, firstAnswer, r) {
  const block = $(`#bonus-part-${idx}`), row = block?.querySelector(".bonus-input"), inp = $(`#bonus-input-${idx}`);
  if (!block || !row || !inp) { finalizeBonusPart(idx); return; }
  (state._bonusPrompted ||= [])[idx] = true;
  (state._bonusPromptFrom ||= [])[idx] = firstAnswer;
  let banner = block.querySelector(".bonus-prompt-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.className = "buzz-prompt-banner bonus-prompt-banner";
    row.parentNode.insertBefore(banner, row);
  }
  const ask = (r && r.prompt && r.prompt.ask) || (r && r.antiprompt ? "less specific?" : "");
  banner.innerHTML = `<span class="prompt-tag">PROMPT</span>` + (ask ? " " + escapeHtml(ask) : "");
  inp.value = "";
  inp.disabled = false;
  setTimeout(() => inp.focus(), 30);
  stopEventTimer();
  const t = state.settings.bonusTimer;
  if (t > 0) startEventTimer(t, "Part " + (idx + 1), () => bonusPartTimeUp(idx));
}

// An answered part folds to one line — its letter, your answer, ✓ / ✗ — once the
// next part starts; a tap opens it again (and its header folds it back).
const bpMark = (k) => `<span class="bp-mark ${k}" aria-label="${k === "correct" ? "right" : k === "unsure" ? "unsure" : "wrong"}">${k === "correct" ? "✓" : k === "unsure" ? "?" : "✗"}</span>`;
function bonusPartDone(idx) {
  const part = $(`#bonus-part-${idx}`); if (!part) return;
  part.classList.add("bp-done");
  const h = part.querySelector(".bonus-part-header");
  if (h && !h.querySelector(".collapse-chevron")) h.insertAdjacentHTML("beforeend", '<span class="collapse-chevron" aria-hidden="true"></span>');
}
function bonusPartCollapse(idx, on) { $(`#bonus-part-${idx}`)?.classList.toggle("bp-collapsed", !!on); }
document.addEventListener("click", (e) => {
  const part = e.target.closest?.("#bonus-parts-area .bonus-part.bp-done");
  if (!part || e.target.closest(".bonus-verdict, .qb-info, a, input")) return;
  if (part.classList.contains("bp-collapsed")) part.classList.remove("bp-collapsed");
  else if (e.target.closest(".bonus-part-header")) part.classList.add("bp-collapsed");
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
  $(`#bonus-part-${idx}`)?.querySelector(".bonus-prompt-banner")?.remove();
  const from = (state._bonusPromptFrom || [])[idx];
  const given = userAns ? escapeHtml(userAns) : '<span class="text-muted">(no answer)</span>';
  // .bp-mark repeats the verdict next to your answer: all a collapsed part shows (bonusPartCollapse)
  const yourLine = (mark) => `<div class="bonus-your-answer">Your Answer: <strong>${from ? escapeHtml(from) + " → " + given : given}</strong>${mark || '<span class="bp-mark"></span>'}</div>`;
  const show = (verdict, mark) => { el.innerHTML = `${yourLine(mark)}<div class="bp-ans-line">${verdict}ANSWER: <span class="bonus-answer-text">${answerLineHtml(rawAns, ans)}</span></div>`; el.classList.remove("hidden"); };
  bonusPartDone(idx);
  show("");
  let verdict = '<span class="bonus-verdict incorrect">✗ </span>', mark = bpMark("incorrect");
  if (userAns) {
    // A prompt left standing after the prompt round is not an accept.
    const r = await judgeBonusPart(idx, userAns);
    if (r && r.status === "accept") { verdict = '<span class="bonus-verdict correct">✓ </span>'; mark = bpMark("correct"); }
    else if (r && r.unsure) { verdict = '<span class="bonus-verdict unsure">? </span><span class="qb-info bonus-unsure-tip" data-tip="This answer line accepts equivalents and your answer matched none of the listed ones. Click ? to mark it correct.">i</span> '; mark = bpMark("unsure"); }
  }
  show(verdict, mark);
}

async function submitBonusAnswers() {
  if (!state.currentQuestion || state.mode !== "bonuses") return;
  stopEventTimer();
  const n = state.bonusPartCount || 3;
  for (let i = 0; i < n; i++) revealBonusPartAnswer(i);

  const answers = Array.from({ length: n }, (_, i) => state.bonusUserAnswers[i] || "");

  try {
    const result = await API.post("/api/check-bonus", {
      questionId: state.currentQuestion.id,
      answers,
      sessionId: state.sessionId,
      strictness: state.settings.strictness, // same strictness as the per-part ✓/✗ verdicts
      previous: Array.from({ length: n }, (_, i) => (state._bonusPromptFrom || [])[i] || null),
    });
    state._bonusResult = result;
    state._bonusJudged = (result.parts || []).map((pt) => !!pt.correct);
    state._bonusOverrides = new Array(n).fill(null);
    state._bonusRecorded = true;
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
    // Instant reading still honours "Stop on power": reveal exactly to the
    // power mark and pause there; resuming reveals the rest instantly.
    if (state.settings.stopOnPower && state.prePowerEnd > 0 && !state._stoppedAtPower && state.revealIndex < state.prePowerEnd) {
      state.revealIndex = state.prePowerEnd;
      state.buzzPosition = state.revealIndex;
      $("#question-text").innerHTML = formatQuestionText(text, state.revealIndex, state.prePowerEnd);
      state._stoppedAtPower = true;
      state.isPaused = true;
      const el = document.createElement("div");
      el.className = "pause-overlay"; el.id = "pause-overlay";
      el.textContent = "PAUSED";
      $("#question-area")?.appendChild(el);
      return;
    }
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
      if (state.settings.stopOnPower && state.prePowerEnd > 0 && !state._stoppedAtPower && state.revealIndex < state.prePowerEnd) {
        state.revealIndex = state.prePowerEnd;
        state.buzzPosition = state.revealIndex;
        $("#question-text").innerHTML = formatQuestionText(text, state.revealIndex, state.prePowerEnd);
        state._stoppedAtPower = true;
        state.isPaused = true;
        const el = document.createElement("div");
        el.className = "pause-overlay"; el.id = "pause-overlay";
        el.textContent = "PAUSED";
        $("#question-area")?.appendChild(el);
        return;
      }
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
    followReading($("#question-text .revealed"), state.currentQuestion && state.currentQuestion.id);
    if (state.settings.stopOnPower && state.prePowerEnd > 0 && state.revealIndex >= state.prePowerEnd && !state._stoppedAtPower) {
      state._stoppedAtPower = true;
      state.isPaused = true;
      const el = document.createElement("div");
      el.className = "pause-overlay"; el.id = "pause-overlay";
      el.textContent = "PAUSED";
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
  banner.className = "result-banner dead";
  banner.textContent = "DEAD (0 pts)";
  answerDiv.innerHTML = `<div class="ra-row"><span class="ra-k">Answer</span><span class="actual">${answerLineHtml(state.currentQuestion?.answer, state.currentQuestion?.answer_sanitized || "")}</span></div>`;
  renderResultTags(state.currentQuestion);
  $("#buzz-area").classList.add("hidden");
  state.resultAreaVisible = true;
  state.lastResult = { correct: false, isPower: false, points: 0, celerity: 1, answer: state.currentQuestion?.answer_sanitized, userAnswer: "", questionId: state.currentQuestion?.id, buzzPosition: state.buzzPosition, origBuzzPosition: displayPosToOriginal(state.buzzPosition || 0), category: state.currentQuestion?.category };

  state.sessionHistory.push({
    id: state.currentQuestion?.id, type: "tossup",
    question: state.currentQuestion, userAnswer: "",
    correct: false, isPower: false, points: 0,
    celerity: 1, answer: state.currentQuestion?.answer_sanitized,
    starred: false,
  });
  renderHistoryPanel();

  // If a rebuzz-mode neg was already recorded for this reading, keep that row —
  // an overriding 0-point entry would silently erase the -5.
  if (state.sessionId && state.currentQuestion && !state._negRecorded) {
    API.post("/api/check-tossup", {
      questionId: state.currentQuestion.id,
      answer: "",
      buzzPosition: displayPosToOriginal(state.buzzPosition || 0),
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

// Translate a buzz index in the DISPLAYED text (pron guides stripped, "(*)"
// removed, plugin transforms applied) back into question_sanitized coordinates,
// which is what the backend's read-position and power judging use. The display
// text is a subsequence of the original for our own transforms, so greedy
// character alignment recovers the original index; unknown plugin insertions
// degrade gracefully.
function mapDisplayPosToOriginal(disp, orig, displayPos) {
  disp = String(disp || ""); orig = String(orig || "");
  if (!disp || !orig || disp === orig) return displayPos;
  let oi = 0, di = 0;
  while (di < displayPos && oi < orig.length) {
    if (orig[oi] === disp[di]) { oi++; di++; }
    else oi++;
  }
  return oi;
}
function displayPosToOriginal(displayPos) {
  const orig = state.currentQuestion?.question_sanitized || "";
  const disp = state.currentDisplayText || "";
  if (!disp || !orig || disp === orig) return displayPos;
  let oi = 0, di = 0;
  while (di < displayPos && oi < orig.length) {
    if (orig[oi] === disp[di]) { oi++; di++; }
    else oi++;
  }
  return oi;
}

function resumeReveal() {
  if (!state.sessionActive || state.isBuzzed || state.isPaused) return;
  // Bonuses have no progressive reveal — resuming with the stale tossup text
  // would paint the previous tossup over the bonus and start a buzz window.
  if (state.mode !== "tossups") return;
  const text = state.currentDisplayText || state.currentQuestion?.question_sanitized || "";
  if (state.revealIndex < text.length) {
    revealText(text);
  }
}

// The unread rest of a question as an invisible stand-in: every letter a "·", but
// spaces and the characters a line may break at (hyphens, dashes, slashes) kept,
// so it wraps exactly like the real text and nothing below moves while the
// question reads. The game server sends rooms this shape (mpserver/qtext.mjs lifts it).
function textShape(s) {
  return String(s == null ? "" : s).replace(/[^\s\-\u2010-\u2015\/]/g, "\u00b7");
}
function formatQuestionText(text, revealedUpTo, _prePowerEnd, marks, showPower) {
  const buzzMarks = marks || state.buzzMarks || [];
  // Once the question is over (answered, or read out with nobody buzzing) the
  // pre-power text reads in bold. A question with no power mark gets no bold at
  // all. `rank` orders inserts that land on the same character: the bold closes
  // BEFORE the (*) and any buzz mark there, so those keep their own colours.
  const boldPre = !!showPower && _prePowerEnd > 0;
  function withMarks(segEnd) {
    const inserts = buzzMarks
      .filter((i) => i >= 0 && i <= segEnd)
      .map((i) => ({ i, rank: 1, html: '<span class="buzz-mark">(#)</span>' }));
    if (showPower && _prePowerEnd > 0 && _prePowerEnd <= segEnd) {
      inserts.push({ i: _prePowerEnd, rank: 2, html: '<span class="power-mark-inline">(*)</span>' });
    }
    if (boldPre) {
      inserts.push({ i: 0, rank: -1, html: '<strong class="pre-power">' });
      inserts.push({ i: Math.min(_prePowerEnd, segEnd), rank: 0, html: "</strong>" });
    }
    inserts.sort((a, b) => a.i - b.i || a.rank - b.rank);
    let out = "", last = 0;
    for (const m of inserts) { out += escapeHtml(text.substring(last, m.i)) + m.html; last = m.i; }
    out += escapeHtml(text.substring(last, segEnd));
    return out;
  }
  const pre = withMarks(revealedUpTo);
  const post = escapeHtml(textShape(text.substring(revealedUpTo)));
  return `<span class="revealed">${pre}</span><span class="unrevealed" aria-hidden="true">${post}</span>`;
}


function buzz() {
  if (state.isBuzzed || !state.sessionActive) return;
  // No live question (still loading, or a queue just ran out) — nothing to buzz on.
  if (!state.currentQuestion || state._loadingQuestion) return;
  state.isBuzzed = true;
  state.isPaused = false;
  state.promptActive = false;
  state._promptFrom = null;

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
        buzzPosition: displayPosToOriginal(state.buzzPosition),
        sessionId: state.sessionId,
        fullyRead: !!state.questionFullyRead,
        strictness: state.settings.strictness,
        allowPrompt: !state.promptActive,
        previous: state.promptActive ? state._promptFrom : null,
      });
    if (!result) return;

    if (result.prompted) {
      state.promptActive = true;
      state._promptFrom = answer;
      state.resultAreaVisible = false;
      const ask = (result.prompt && result.prompt.ask) || (result.antiprompt ? "less specific?" : "");
      showPromptBanner(ask);
      const inp = $("#buzz-input");
      if (inp) { inp.value = ""; inp.disabled = false; inp.placeholder = "answer again…"; setTimeout(() => inp.focus(), 30); }
      startBuzzTimer();
      return;
    }
    state.promptActive = false;
    clearPromptBanner();

    if (!result.correct && state.settings.allowRebuzzes && !state.questionFullyRead) {
      updateSessionStats(result);
      // A -5 row is now recorded for this question — a later skip/dead must
      // NOT post an overriding 0-point entry that would rewrite it.
      state._negRecorded = true;
      Sound.incorrect();
      state.isBuzzed = false;
      state.resultAreaVisible = false;
      $("#buzz-area").classList.add("hidden");
      $("#buzz-input").value = "";
      const bm = document.querySelector(".buzz-marker"); if (bm) bm.remove();
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
  // Backend read-position judging uses question_sanitized coordinates.
  const origPos = displayPosToOriginal(state.buzzPosition);
  let verdict;
  try {
    const ev = await API.post("/api/evaluate-tossup", {
      questionId: q.id,
      answer,
      strictness: state.settings.strictness,
      buzzPosition: fullyRead ? null : origPos,
      previous: state.promptActive ? state._promptFrom : null,
    });
    verdict = { status: ev.status, prompt: ev.prompt, antiprompt: !!ev.antiprompt, unsure: !!ev.unsure };
  } catch (e) {
    showError("Failed to check answer");
    return null;
  }

  const ruleCtx = {
    userAnswer: answer,
    question: q,
    buzzPosition: origPos,
    fullyRead,
    strictness: state.settings.strictness,
  };
  verdict = window.QB.applyAnswerRules(verdict, ruleCtx);

  if (verdict.status === "prompt" && state.promptActive) verdict.status = "reject";
  if (verdict.status === "prompt") {
    return { prompted: true, prompt: verdict.prompt || { ask: "be more specific" }, antiprompt: !!verdict.antiprompt, answer: q.answer_sanitized };
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
      buzzPosition: origPos,
      sessionId: state.sessionId,
      overriding: true,
      correct, isPower, points, celerity,
    });
    return { correct, points, isPower, celerity, answer: rec.answer || q.answer_sanitized, unsure: !correct && !!verdict.unsure };
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
    buzzPosition: displayPosToOriginal(state.buzzPosition || 0),
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
    origBuzzPosition: displayPosToOriginal(state.buzzPosition || 0),
    category: state.currentQuestion?.category,
    unsure: !result.correct && !!result.unsure,
  };
  state.resultOverridden = false;

  renderTossupResult();

  if (state.settings.bonusAfter && result.correct && state.mode === "tossups" && state._practiceBase === "tossups" && !state.reviewIds) {
    state._wantBonus = true;
    state._bonusFromQ = state.currentQuestion;
    const _mv = $("#mode-select")?.value;
    state._pendingPairedBonus = _mv === "set" ? (state._currentPaired || null) : null;
    _primePairBonus();
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
  const q = o.question || null;
  const path = o.path || (q ? qPathOf(q) : [o.category, o.subcategory, o.altSub].filter(Boolean).join(" > "));
  const year = o.year != null ? o.year : (q ? q.set_year : null);
  const diff = o.difficulty !== undefined && o.difficulty !== null && o.difficulty !== "" ? o.difficulty : (q ? q.difficulty : null);
  const tags = q ? tagChipsHtml(q, o.tagsWhere || null) : "";
  if (o.titleHtml != null) {
    // Database cards: the answer is the title; category, year, source and tags
    // sit under the text.
    const src = o.src != null ? o.src : (q && q.set_name ? q.set_name : "");
    return `<div class="${cls}"${o.attrs || ""}>
      <div class="qcard-head"><span class="qcard-chev" aria-hidden="true"></span><div class="qcard-title"><span class="qcard-ans">${o.titleHtml}</span>${o.kindHtml ? `<span class="qcard-kind">${o.kindHtml}</span>` : ""}</div><span class="qcard-side">${o.sideHtml || ""}</span></div>
      <div class="qcard-body">${o.bodyHtml || ""}</div>
      <div class="qcard-tags qmeta-row">${catBadgeHtml(path)}${yearBadgeHtml(year)}${src ? `<span class="src">${escapeHtml(src)}</span>` : ""}${tags ? '<span class="vsep" aria-hidden="true"></span>' + tags : ""}</div>
    </div>`;
  }
  const diffBadge = diff !== null && diff !== undefined && diff !== "" ? `<span class="badge diff-badge" title="${escapeHtml(DIFF_FULL[parseInt(diff)] || "")}">Diff ${escapeHtml(String(diff))}</span>` : "";
  return `<div class="${cls}"${o.attrs || ""}>
    <div class="qcard-head">
      <span class="qcard-chev" aria-hidden="true"></span>
      <span class="qcard-meta">${catBadgeHtml(path)}${yearBadgeHtml(year)}${diffBadge}</span>
      <span class="qcard-side">${o.sideHtml || ""}</span>
    </div>
    ${o.answerHtml != null ? `<div class="qcard-answer">${o.answerHtml}</div>` : ""}
    <div class="qcard-body">${o.bodyHtml || ""}</div>
    ${tags ? `<div class="qcard-tags qmeta-row">${tags}</div>` : ""}
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
    blue: ["#58a6ff", "#1f6feb33"],
    gold: ["#dfb347", "#dfb34733"],
    green: ["#3fb950", "#2ea04333"],
    cyan: ["#2dd4bf", "#2dd4bf33"],
    magenta: ["#d65bd6", "#d65bd633"],
    amber: ["#d2991d", "#9e6a0333"],
    red: ["#f85149", "#da363333"],
  },
  // the same accents for the light look: dark enough to read on white
  lightAccent: {
    blue: ["#0969da", "#0969da22"],
    gold: ["#9a6a00", "#9a6a0022"],
    green: ["#1a7f37", "#1a7f3722"],
    cyan: ["#0b7d74", "#0b7d7422"],
    magenta: ["#a432a4", "#a432a422"],
    amber: ["#9a6700", "#9a670022"],
    red: ["#cf222e", "#cf222e22"],
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

// A plugin-added accent has no light variant: darken it until it reads on white.
function lightAccentFor(light, acc) {
  if (!light || !acc || !/^#[0-9a-fA-F]{6}$/.test(acc[0])) return acc;
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(acc[0].slice(i, i + 2), 16));
  for (let k = 0; k < 12 && 0.2126 * r + 0.7152 * g + 0.0722 * b > 115; k++) { r *= 0.88; g *= 0.88; b *= 0.88; }
  const hex = "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  return [hex, hex + "22"];
}

function hexToDim(hex) {
  const h = String(hex || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(h)) return h + "33";
  if (/^#[0-9a-fA-F]{3}$/.test(h)) { return "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] + "33"; }
  return h;
}

function activeTheme() {
  if (IS_WEB) return null;   // the website has no themes (extensions.js never enables one)
  return ((window.QB && window.QB._themes) || []).find((t) => t.enabled) || null;
}
function themeAppearanceMode(theme) {
  const m = theme && theme._manifest && theme._manifest.appearance;
  return (m === "preset" || m === "custom") ? m : null;
}

// APPEARANCE is hidden outright when the active theme opts out of the default
// controls and brings no panel or settings of its own (nothing to show).
function syncAppearanceSection() {
  const sec = $("#appearance-section"); if (!sec) return;
  const def = $("#default-appearance"), host = document.getElementById("theme-appearance-host");
  sec.classList.toggle("hidden", (!def || def.classList.contains("hidden")) && !(host && host.children.length));
}
// Every appearance change (theme on/off, accent, boot) re-derives
// html[data-scheme] and --on-accent from what is now on screen.
function applyDefaultAppearance() { applyDefaultAppearanceVars(); syncScheme(); }
function applyDefaultAppearanceVars() {
  const theme = activeTheme();
  if (window.QB?.hasAppearancePanel?.()) {
    $("#default-appearance")?.classList.add("hidden");
    syncAppearanceSection();
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

  syncAppearanceSection();

  if (mode == null) return;

  const root = document.documentElement.style;
  const rad = DEFAULT_APPEARANCE.radius[state.settings.appRadius];
  if (rad) root.setProperty("--radius", rad); else root.removeProperty("--radius");
  const gap = DEFAULT_APPEARANCE.gap[state.settings.appBtnGap];
  if (gap) root.setProperty("--btn-gap", gap); else root.removeProperty("--btn-gap");

  if (mode === "preset") {
    const light = !theme && uiScheme() === "light";
    const acc = (light && DEFAULT_APPEARANCE.lightAccent[state.settings.appAccent]) || lightAccentFor(light, DEFAULT_APPEARANCE.accent[state.settings.appAccent]);
    if (acc) { root.setProperty("--accent", acc[0]); root.setProperty("--accent-dim", acc[1]); }
    else { root.removeProperty("--accent"); root.removeProperty("--accent-dim"); }
    if (!theme) root.removeProperty("--font");
  } else {
    const hex = state.settings.appCustomAccent || "#58a6ff";
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
  if (k === "blue") return "Blue (default)";
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
window.QB?.on?.("theme:change", () => { applyTheme(); applyDefaultAppearance(); });
rebuildAppearanceOptions();
applyDefaultAppearance();

// opts: { yes, no, title, detail, danger }. Enter confirms, Esc / backdrop cancel.
function confirmDialog(message, onYes, opts) {
  opts = opts || {};
  document.getElementById("confirm-dialog")?.remove();
  const el = document.createElement("div");
  el.id = "confirm-dialog";
  el.className = "qb-overlay confirm-overlay";
  el.setAttribute("role", "alertdialog"); el.setAttribute("aria-modal", "true");
  el.innerHTML = `<div class="confirm-box">${opts.title ? `<div class="confirm-title">${escapeHtml(opts.title)}</div>` : ""}<div class="confirm-msg">${escapeHtml(message)}</div>` +
    (opts.detail ? `<div class="confirm-detail">${escapeHtml(opts.detail)}</div>` : "") +
    `<div class="confirm-actions"><button class="btn btn-ghost" id="cf-no">${escapeHtml(opts.no || "Cancel")}</button>` +
    `<button class="btn ${opts.danger ? "btn-danger" : "btn-primary"}" id="cf-yes">${escapeHtml(opts.yes || "Delete")}</button></div></div>`;
  const close = () => animateRemove(el);
  el.addEventListener("click", (ev) => { if (ev.target === el) close(); });
  document.body.appendChild(el);
  el.querySelector("#cf-yes").onclick = () => { close(); try { onYes(); } catch (e) { console.error(e); } };
  el.querySelector("#cf-no").onclick = close;
}
// A one-line text question ("Name your leaderboard"): Enter or the button
// answers it, Escape / the backdrop / Cancel drops it.
function promptDialog(title, value, onOk, opts) {
  opts = opts || {};
  document.getElementById("prompt-dialog")?.remove();
  const el = document.createElement("div");
  el.id = "prompt-dialog";
  el.className = "qb-overlay confirm-overlay";
  el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
  el.innerHTML = `<form class="confirm-box prompt-box"><div class="confirm-title">${escapeHtml(title)}</div>` +
    `<input class="mode-input" id="pd-in" maxlength="${opts.max || 40}" autocomplete="off" placeholder="${escapeHtml(opts.placeholder || "")}" value="${escapeHtml(value || "")}">` +
    `<div class="confirm-actions"><button type="button" class="btn btn-ghost" id="pd-no">Cancel</button><button type="submit" class="btn btn-primary">${escapeHtml(opts.yes || "OK")}</button></div></form>`;
  const close = () => animateRemove(el);
  el.addEventListener("click", (ev) => { if (ev.target === el) close(); });
  el.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); close(); } });
  document.body.appendChild(el);
  const inp = el.querySelector("#pd-in");
  el.querySelector("form").addEventListener("submit", (ev) => { ev.preventDefault(); const v = inp.value.trim(); if (!v) { inp.focus(); return; } close(); try { onOk(v); } catch (e) { console.error(e); } });
  el.querySelector("#pd-no").onclick = close;
  setTimeout(() => { inp.focus(); inp.select(); }, 30);
}
// Removes an overlay / menu after its closing animation (.qb-leaving), so
// things that are created on open and dropped on close still animate out.
function animateRemove(el) {
  if (!el || !el.isConnected || el.classList.contains("qb-leaving")) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.remove(); return; }
  el.classList.add("qb-leaving");
  el.style.pointerEvents = "none";
  let done = false;
  const fin = () => { if (done) return; done = true; el.remove(); };
  el.addEventListener("animationend", (e) => { if (e.target === el) fin(); });
  setTimeout(fin, 260);
}
// End session asks first (the button and the hotkey); Enter confirms.
function confirmEndSession(after) {
  if (!state.sessionActive) { if (after) after(); return; }
  const heard = (state.sessionHistory || []).length, score = state.totalPoints || 0;
  confirmDialog("End this session?", () => { endSession(); if (after) after(); }, {
    yes: "End session", no: "Keep playing", danger: true,
    detail: heard ? `${heard} ${heard === 1 ? "question" : "questions"} · ${score} ${score === 1 ? "point" : "points"}` : "",
  });
}

function closeSaveMenu() {
  const m = document.getElementById("save-menu");
  if (m) { m.removeAttribute("id"); animateRemove(m); }   // the next menu reuses the id at once
  // Always disarm the click-away closer. With {once:true} alone, choosing a
  // menu item (which stops propagation) left it armed — and it then instantly
  // swallowed the NEXT save menu you tried to open.
  document.removeEventListener("click", closeSaveMenu);
}
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
      // The menu is gone by the time the action runs — hand it the menu's last
      // position so follow-up popups (e.g. "Add to folder…") open in place.
      const r = menu.getBoundingClientRect();
      closeSaveMenu();
      try { await items[+el.dataset.i].fn({ anchorRect: { left: r.left, top: r.top, bottom: r.top } }); } catch (e) { console.error(e); }
    });
  });
  setTimeout(() => document.addEventListener("click", closeSaveMenu), 0);
}
function openSaveMenu(question, type, anchor) {
  closeSaveMenu();
  const items = [];
  items.push({
    label: "Add to Review",
    fn: async () => {
      if (accountGate("Sign in to keep a review list.")) return;
      await API.post("/api/review/manual", { questionId: question.id, add: true, type });
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
  if (arr.some((x) => itemReviewKey(x) === k)) return false;
  arr.push({ kind: it.kind || "item", front: it.front || "", back: it.back || "", meta: it.meta || "", ts: Date.now() });
  itemReviewSave(arr);
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
  if (!cards.length) return;
  try { localStorage.setItem("qb-flashcards-cards", JSON.stringify({ cards, ts: Date.now() })); } catch (e) {}
  if (!(window.QB && window.QB.showPage && window.QB.showPage("flashcards::cards"))) {
    try { localStorage.removeItem("qb-flashcards-cards"); } catch (e) {}
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
          ${list.length && (window.QB?.getActivePages?.() || []).some((p) => p.id === "flashcards::cards") ? '<button class="btn btn-sm btn-primary" id="ir-flash">Review as flashcards</button>' : ""}
          ${list.length ? '<button class="btn btn-sm btn-ghost" id="ir-clear">Clear all</button>' : ""}
          <button class="btn btn-sm btn-ghost" id="ir-close">Close</button>
        </span>
      </div>
      <div class="review-viewer-list">${list.length ? cards : '<div class="text-muted" style="padding:12px">No saved items yet</div>'}</div>
    </div>`;
  el.addEventListener("click", (ev) => { if (ev.target === el) animateRemove(el); });
  document.body.appendChild(el);
  el.querySelector("#ir-close").onclick = () => animateRemove(el);
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
// Remove notes aimed at the MODERATOR/READER/EDITOR, keeping the ones aimed at
// players. That distinction matters: 645 spans in the dump say "Note to
// players: two answers required" and carry the answer requirement, while 837
// moderator/reader and 191 editor/writer notes are reading directions or
// outright spoilers. A blanket "contains the word note" strip would eat
// answerlines ("Notes from the Underground", "hell notes"), so every pattern
// below is anchored to an explicit audience.
const NOTE_AUDIENCE = "(?:moderators?|mods?|readers?|editors?|writers?|authors?|ed)\\.?";
// A moderator-addressed span that ALSO speaks to players carries an answer
// requirement — "[MODERATOR, please read aloud to teams: both type of work and
// composer required]" — so it stays. Found by sweeping the real corpus.
// Merely naming players is not enough — "read the answerline to yourself before
// reading to players" is still a moderator instruction. Keep only spans that
// state an answer REQUIREMENT to the players, or are explicitly to be read out.
function noteMentionsPlayers(span) {
  const aboutPlayers = /\b(players?|teams?)\b/i.test(span);
  const isRequirement = /\b(required|acceptable|needed|prompt(?:able)?|do not accept)\b/i.test(span);
  // "...(do not read aloud to teams)" is the opposite instruction, so the
  // negated form must not count as player-facing.
  const readAloud = /\bread\s+(?:this\s+|the\s+following\s+)?aloud\s+to\b/i.test(span)
    && !/\b(?:do\s+not|don't|never|not)\s+(?:to\s+be\s+)?read\b/i.test(span);
  return (aboutPlayers && isRequirement) || readAloud;
}
function stripModeratorNotes(text) {
  let t = String(text || "");
  const cut = (re) => { t = t.replace(re, (m) => (noteMentionsPlayers(m) ? m : "")); };
  // bracketed / parenthesised / curly / angled, in any of the observed shapes:
  //   [Note to moderator: …]  (Moderator Note: …)  [Ed's note: …]
  //   [NOTE TO READER, NOT TO BE READ ALOUD: …]     [moderator: emphasize here]
  const inner = `(?:notes?\\s+to\\s+(?:the\\s+)?${NOTE_AUDIENCE}(?=[\\s:,\\])>}]|$)|${NOTE_AUDIENCE}(?:'s|s')?\\s+notes?\\b|${NOTE_AUDIENCE}\\s*[:,])`;
  cut(new RegExp(`\\s*\\[\\s*${inner}[^\\]]*\\]`, "gi"));
  cut(new RegExp(`\\s*\\(\\s*${inner}[^)]*\\)`, "gi"));
  cut(new RegExp(`\\s*\\{\\s*${inner}[^}]*\\}`, "gi"));
  cut(new RegExp(`\\s*<\\s*${inner}[^>]*>`, "gi"));
  // Generic "[note: …]" / "(NOTE: …)" spans with no audience prefix are
  // moderator trivia ("not a typo", "spell it out") — strip UNLESS the note
  // states an answer requirement (those speak to the players).
  const keepGeneric = (m) => noteMentionsPlayers(m) || /\b(requir(?:ed|es)?|accept(?:ed|able|s)?|needed|prompt(?:able|ed)?)\b/i.test(m);
  t = t.replace(/\s*[\[(]\s*(?:ed\.?\s+|mod\.?\s+)?notes?\s*:[^\])]*[\])]/gi, (m) => (keepGeneric(m) ? m : ""));
  // No BARE-form rule: a bare "Note to moderator: …" has no provable end in
  // plain text (no final period, or several sentences), and cutting to the
  // first full stop deleted real question text. New-format notes are found
  // from the HTML (applyNoteFilter); an unformatted one is left visible.
  return t.replace(/\s{2,}/g, " ").trim();
}

// ── Question text from the new database (brief §3) ──────────────────────────
// HTML fields carry only <b> <u> <i> <sup>. A moderator / reader note is ONE
// italic run that starts with its label; the plain *_sanitized copy keeps the
// note text but cannot show where it ends, so the run is read from the HTML
// and its folded text is cut from the plain copy. "Note to players:" and
// unlabelled requirement notes are read aloud and never hidden.
const _ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
function decodeEntities(s) {
  return String(s || "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === "#"
    ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    : (_ENT[e.toLowerCase()] ?? m));
}
function htmlStyleRuns(html) {
  const out = [];
  let it = 0, last = 0, m;
  const re = /<\/?([a-z]+)[^>]*>/gi;
  const push = (t) => {
    if (!t) return;
    const prev = out[out.length - 1], ital = it > 0;
    if (prev && prev.italic === ital) prev.text += t; else out.push({ text: t, italic: ital });
  };
  while ((m = re.exec(html))) {
    push(decodeEntities(html.slice(last, m.index)));
    const tag = m[1].toLowerCase();
    if (tag === "i" || tag === "em") it = Math.max(0, it + (m[0][1] === "/" ? -1 : 1));
    last = re.lastIndex;
  }
  push(decodeEntities(html.slice(last)));
  return out;
}
const NOTE_RUN_LABEL = /^\s*(?:note to (?:the )?(?:moderators?|readers?)\b|reader(?:'s)? note\b|moderator(?:'s)? note\b)/i;
function noteRunsFromHtml(html) {
  if (!html || html.indexOf("<") < 0) return [];
  return htmlStyleRuns(String(html)).filter((r) => r.italic && NOTE_RUN_LABEL.test(r.text)).map((r) => r.text.trim());
}
// What QBReader's plain copy does to text: accents folded, curly quotes
// straightened, dashes and ellipses spelled out.
function foldLikeSanitized(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/\u00a0/g, " ");
}
function cutNotesUsingHtml(text, html) {
  let t = String(text || "");
  for (const note of noteRunsFromHtml(html)) {
    for (const cand of [foldLikeSanitized(note), note]) {
      const i = t.indexOf(cand);
      if (i >= 0) { t = t.slice(0, i).replace(/\s+$/, "") + (i > 0 ? " " : "") + t.slice(i + cand.length).replace(/^\s+/, ""); break; }
    }
  }
  return t;
}
// Applied wherever question or answer text is shown, gated on the setting.
// html = the record's HTML field for this text (question / leadin / part).
function applyNoteFilter(text, html) {
  if (!state.settings.hideNotes) return text;
  return stripModeratorNotes(html ? cutNotesUsingHtml(text, html) : text);
}

const PRON_KEEP_WORDS = new Set(("a an the and or but nor so yet of in on at to for with by from as is are was were be been being am " +
  "do does did has have had he she it they them him her his hers its their theirs we us our you your i me my mine " +
  "this that these those who whom which what not no all any some each such than then there when where how why if " +
  "sic blank here ones one").split(" "));

function stripPronunciations(text) {
  let t = String(text || "");
  // Quoted guide in brackets/parens: ("kee-HO-tay"), ['zhawnr']
  t = t.replace(/\s*[\[(]\s*["“'‘][^\])]*?["”'’]\s*[\])]/g, "");
  // Anything that says it's a pronunciation
  t = t.replace(/\s*[\[(][^\])]*pronounc[^\])]*[\])]/gi, "");
  // Moderator / reader instructions in brackets (notes addressed to PLAYERS stay)
  t = t.replace(/\s*\[\s*(?:notes?\s+to\s+(?:the\s+)?(?:moderators?|readers?)\b[^\]]*|moderators?\s+notes?\b[^\]]*|moderators?\s*[:,][^\]]*|emphasi[sz]e[^\]]*|read\s+(?:notes\s+)?slowly[^\]]*|read\s+(?:the\s+)?answerline[^\]]*|pause\b[^\]]*|spell\s+(?:it|out)\b[^\]]*|slowly\s*:?[^\]]*)\]/gi, "");
  // Single-word respellings after a name: "Ceyx [seeks]", "Pepys [peeps]",
  // "Louis XIV [fourteenth]". Quote-edit insertions are protected three ways:
  // they abut the word ("hate[s]" — no space), follow a quotation mark, or
  // are closed-class function words ("feeds [him] bread"); [sic], [blank],
  // [here], [ones] are redactions/placeholders and always stay.
  t = t.replace(/([A-Za-z][A-Za-z'’.()\]]*)(\s+)\[([a-z][a-z'’]{2,25})\]/g, (m, prev, sp, inner, off, whole) => {
    if (PRON_KEEP_WORDS.has(inner)) return m;
    if (/["“”]$/.test(prev)) return m;
    if (!/^[A-Z]/.test(prev.replace(/^["'’(]+/, ""))) return m;
    // Inside an OPEN quotation this is a quote-edit ("Orpheus [leading] the
    // savage race"), never a respelling — check quote parity up to here.
    const before = whole.slice(0, off);
    const straight = (before.match(/"/g) || []).length;
    const curly = ((before.match(/“/g) || []).length) - ((before.match(/”/g) || []).length);
    if (straight % 2 === 1 || curly > 0) return m;
    return prev;
  });
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
  // Unquoted phonetic parentheticals in old-format sets ("(KAH-fka)"), by the
  // same test as the brackets above. (+), (**), (*) and real content such as
  // "(born 1920)" stay: deleting every parenthetical removed power tiers.
  t = t.replace(/\s*\(([^()]{1,80})\)/g, (m, inner) => {
    const tokens = inner.trim().replace(/\s*-\s+|\s+-\s*/g, "-").split(/\s+/);
    if (!tokens.length || tokens.length > 7) return m;
    if (!tokens.every((w) => /^[A-Za-z][A-Za-z'’-]*[.,;:]?$/.test(w))) return m;
    const bare = tokens.map((w) => w.replace(/[.,;:]+$/, ""));
    if (/^(this|these|that|those|his|her|their|its|the|a|an)$/i.test(bare[0])) return m;
    const hyphenated = bare.some((w) => /[A-Za-z]-[A-Za-z]/.test(w));
    const capsSyllable = bare.some((w) => /^[A-Z]{2,}$/.test(w) && !PRON_ACRONYMS.has(w)) && bare.some((w) => /^[a-z]{2,}$/.test(w));
    return hyphenated || capsSyllable ? "" : m;
  });
  // Residue: empty brackets (present in source data or left by inner strips)
  t = t.replace(/\s*\[\s*\]/g, "");
  return t.replace(/  +/g, " ");
}

// (*) keeps the theme's power colour, and everything before it reads in bold —
// the same cue practice shows once a question is over. Text with no power mark
// is left entirely unstyled.
function colorizePowerMarks(escapedHtml) {
  const mark = '<span class="power-mark-inline">(*)</span>';
  const i = escapedHtml.indexOf("(*)");
  if (i < 0) return escapedHtml;
  return '<strong class="pre-power">' + escapedHtml.slice(0, i) + "</strong>" + mark +
    escapedHtml.slice(i + 3).replace(/\(\*\)/g, mark);
}

// Recorded buzz positions index question_sanitized AS STORED, "(*)" included
// (what the server judges and records); cards draw the text without the mark.
function strippedBuzzPos(raw, p) {
  let n = p || 0;
  for (let at = raw.indexOf("(*)"); at >= 0 && at < p; at = raw.indexOf("(*)", at + 3)) n -= Math.min(3, p - at);
  return Math.max(0, n);
}
function historyQuestionHtml(e) {
  const raw = e.question?.question_sanitized || e.question?.leadin_sanitized || "";
  const isTossup = e.type === "tossup";
  const powerIdx = isTossup ? raw.indexOf("(*)") : -1;
  const text = isTossup ? raw.replace(/\(\*\)/g, "") : raw;
  const marks = [];
  const pos = isTossup ? strippedBuzzPos(raw, e.buzzPosition || 0) : 0;
  if (powerIdx >= 0 && powerIdx <= text.length) marks.push({ i: powerIdx, rank: 2, html: '<span class="power-mark-inline">(*)</span>' });
  if (pos > 0 && pos <= text.length) marks.push({ i: pos, rank: 1, html: '<span class="buzz-mark">(#)</span>' });
  // A finished question shows its pre-power text in bold here too (history and
  // review cards). No power mark means no bold.
  if (powerIdx >= 0 && powerIdx <= text.length) {
    marks.push({ i: 0, rank: -1, html: '<strong class="pre-power">' });
    marks.push({ i: powerIdx, rank: 0, html: "</strong>" });
  }
  if (!marks.length) return escapeHtml(text);
  marks.sort((a, b) => a.i - b.i || a.rank - b.rank);
  let out = "", last = 0;
  for (const m of marks) { out += escapeHtml(text.substring(last, m.i)) + m.html; last = m.i; }
  out += escapeHtml(text.substring(last));
  return out;
}

let _histFilter = null;
// When set, the history overlay renders these entries instead of the live solo
// session (see openHistoryOverlay). Cleared whenever the overlay closes.
let _histEntries = null;
// Small inline buzz/power track: where you buzzed vs where power ended —
// visible on every history card without expanding it.
function histTrackHtml(e) {
  if (e.type !== "tossup" || !e.question) return "";
  const raw = e.question.question_sanitized || "";
  if (!raw) return "";
  const len = raw.replace(/\(\*\)/g, "").length || 1;
  const pi = raw.indexOf("(*)");
  const buzz = Math.max(0, Math.min(1, strippedBuzzPos(raw, e.buzzPosition || 0) / len));
  const power = pi >= 0 ? Math.max(0, Math.min(1, pi / len)) : -1;
  return '<span class="hist-track" title="(#) buzz at ' + Math.round(buzz * 100) + "%" + (power >= 0 ? " · (*) power ends at " + Math.round(power * 100) + "%" : "") + '">' +
    (power >= 0 ? '<span class="hist-track-power" style="left:' + (power * 100).toFixed(1) + '%"></span>' : "") +
    (e.buzzPosition > 0 ? '<span class="hist-track-buzz" style="left:' + (buzz * 100).toFixed(1) + '%"></span>' : "") +
    "</span>";
}

function renderHistoryPanel() {
  try { renderSessionMini(); } catch (e) {}
  const panel = document.getElementById("history-panel");
  if (panel) {
    panel.style.display = state.sessionHistory.length ? "" : "none";
    const cnt = document.getElementById("history-count");
    if (cnt) cnt.textContent = String(state.sessionHistory.length);
  }
  // Esc and the backdrop can close the overlay through the generic overlay
  // handler, which never runs our close(); drop a borrowed list whenever the
  // overlay is gone so the next solo open can't inherit it.
  if (_histEntries && !document.getElementById("history-overlay")) _histEntries = null;

  const list = document.getElementById("history-list");
  if (!list) return;

  const source = _histEntries || state.sessionHistory;
  if (source.length === 0) {
    list.innerHTML = "";
    return;
  }

  let entries = [...source].reverse();
  // Overlay filters (result / type / category / text).
  const hf = typeof _histFilter === "object" && _histFilter ? _histFilter : null;
  if (hf && (hf.res || hf.type || hf.cat || hf.q)) {
    entries = entries.filter((e) => {
      if (hf.type && e.type !== hf.type) return false;
      if (hf.cat && !hf.cat.matches(qPathOf(e.question))) return false;
      if (hf.res) {
        const pts = e.points || 0;
        const res = e.isPower ? "power" : (e.correct ? "correct" : pts < 0 ? "neg" : "zero");
        if (res !== hf.res) return false;
      }
      if (hf.q) {
        const hay = ((e.answer || "") + " " + (e.userAnswer || "") + " " + (e.question?.question_sanitized || e.question?.leadin_sanitized || "") + " " + (e.question?.answer_sanitized || "")).toLowerCase();
        if (!hay.includes(hf.q)) return false;
      }
      return true;
    });
  }
  if (!entries.length) { list.innerHTML = '<div class="text-muted" style="padding:16px">No history entries match these filters.</div>'; return; }
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
      question: e.question || null,
      tagsWhere: "history",
      category: e.question?.category,
      subcategory: e.question?.subcategory,
      altSub: e.question?.alternate_subcategory,
      year: e.question?.set_year,
      difficulty: e.question?.difficulty,
      sideHtml: (() => { const st = isStarredLocal(e.id, e.type); return `${celMarker}${badge}<span class="star-btn save-plus hist-save" data-idx="${i}" title="Save to review / folders">+</span><span class="star-toggle${st ? " on" : ""}" data-qid="${e.id}" data-type="${e.type}">${st ? "\u2605" : "\u2606"}</span>`; })(),
      answerHtml: `Answer: <span class="ans">${answer}</span>${histTrackHtml(e)}`,
      bodyHtml: `
        <div class="qcard-text">${historyQuestionHtml(e)}</div>
        <div class="qcard-foot">Your answer:
          <strong style="color:${e.correct ? "var(--green)" : "var(--red)"}">${escapeHtml(yourAnswer || "(no answer)")}</strong>
          ${e.question?.set_name ? `<span class="qcard-note">\u00b7 ${escapeHtml(e.question.set_name)}</span>` : ""}
        </div>`,
    });
  }).join("");

  limitList(list, ":scope > .qcard", "hist", 50, 50);
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
  if (accountGate("Sign in to star questions.")) return;
  const qId = star.dataset.qid, type = star.dataset.type || "tossup";
  if (!qId) return;
  try {
    const result = await API.post("/api/starred/toggle", { questionId: qId, type });
    setStarredLocal(qId, type, result.starred);
    // Keep the Database screen's star cache in sync so re-renders don't show
    // stale stars (and a second click doesn't silently unstar).
    if (_dbStarred) { const k = type + ":" + qId; if (result.starred) _dbStarred.add(k); else _dbStarred.delete(k); }
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
  if (accountGate("Sign in to star questions.")) return;
  try {
    const result = await API.post("/api/starred/toggle", { questionId: qId, type });
    setStarredLocal(qId, type, result.starred);
    if (_dbStarred) { const k = type + ":" + qId; if (result.starred) _dbStarred.add(k); else _dbStarred.delete(k); }
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
  const unsure = r.unsure && !state.resultOverridden;
  const markTip = keyDisplay("mark-correct") + " marks it correct, " + keyDisplay("mark-incorrect") + " marks it incorrect";
  answerDiv.innerHTML = `
    <div class="ra-row"><span class="ra-k">Your answer</span><strong class="ra-you ${r.correct ? "ok" : "bad"}">${escapeHtml(r.userAnswer || "(no answer)")}</strong>${unsure ? ' <span class="result-unsure">UNSURE</span>' : ''}${state.resultOverridden ? ' <span class="ra-over">overridden</span>' : ''}<span class="qb-info" data-tip="${escapeHtml(unsure ? "This answer line accepts equivalents and your answer matched none of the listed ones, so judge it yourself: " + markTip : markTip)}">i</span><span class="ra-keys"><kbd>${escapeHtml(keyDisplay("mark-correct"))}</kbd><kbd>${escapeHtml(keyDisplay("mark-incorrect"))}</kbd> change verdict</span></div>
    <div class="ra-row"><span class="ra-k">Answer</span><span class="actual">${answerLineHtml(state.currentQuestion?.answer, r.answer || state.currentQuestion?.answer_sanitized || "")}</span></div>
    <div class="ra-row ra-cel"><span class="ra-k">Celerity</span><span>${celPct}% remaining</span></div>
  `;
  renderResultTags(state.currentQuestion);

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
      state._pendingPairedBonus = _mv === "set" ? (state._currentPaired || null) : null;
      _primePairBonus();
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
      buzzPosition: r.origBuzzPosition ?? (r.buzzPosition || 0),
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

// ── bonus mark up / mark down ──────────────────────────────────────────────
// After a bonus is recorded, any part's ✓/✗ verdict can be overruled — click
// it, or use the mark-correct/incorrect hotkeys on the last revealed part.
// The re-record goes through /api/check-bonus with an overrides array, which
// upserts the same session row with the recomputed score.
async function applyBonusOverride(idx, force) {
  if (!state._bonusRecorded || !state.currentQuestion || state.mode !== "bonuses") return;
  if (idx == null || idx < 0 || idx >= (state.bonusPartCount || 3)) return;
  if (state._bonusBusy) return;
  const judged = state._bonusJudged || [];
  const shown = state._bonusOverrides[idx] != null ? state._bonusOverrides[idx] : judged[idx];
  const next = force != null ? !!force : !shown;
  if (next === shown) return;
  state._bonusOverrides[idx] = next === !!judged[idx] ? null : next;
  state._bonusBusy = true;
  const prevPts = state._bonusResult ? state._bonusResult.totalPoints : 0;
  let result;
  try {
    result = await API.post("/api/check-bonus", {
      questionId: state.currentQuestion.id,
      answers: Array.from({ length: state.bonusPartCount || 3 }, (_, i) => state.bonusUserAnswers[i] || ""),
      sessionId: state.sessionId,
      strictness: state.settings.strictness,
      overrides: state._bonusOverrides.slice(),
      previous: Array.from({ length: state.bonusPartCount || 3 }, (_, i) => (state._bonusPromptFrom || [])[i] || null),
    });
  } catch (e) {
    state._bonusBusy = false;
    return;
  }
  state._bonusBusy = false;
  state._bonusResult = result;
  state._bonusLastIdx = idx;

  // verdict glyph
  const holder = $("#bonus-answer-" + idx);
  const vs = holder && holder.querySelector(".bonus-verdict");
  if (vs) { vs.className = "bonus-verdict " + (next ? "correct" : "incorrect"); vs.textContent = next ? "✓ " : "✗ "; }
  const mk = holder && holder.querySelector(".bp-mark"); if (mk) mk.outerHTML = bpMark(next ? "correct" : "incorrect");
  holder?.querySelector(".bonus-unsure-tip")?.remove();

  // banner
  const overridden = state._bonusOverrides.some((o) => o != null);
  const banner = $("#result-banner");
  if (banner) {
    banner.className = "result-banner " + bonusBannerClass(result);
    banner.textContent = bonusBannerText(result) + (overridden ? " (overridden)" : "");
  }

  // running score + history entry
  state.totalPoints += result.totalPoints - prevPts;
  const hist = [...state.sessionHistory].reverse().find((e) => e.type === "bonus" && e.id === state.currentQuestion.id);
  if (hist) { hist.points = result.totalPoints; hist.partsCorrect = result.partsCorrect; hist.correct = bonusAllCorrect(result); }
  renderHistoryPanel();
  updateSessionStats();
  Sound.toggle();
}

document.addEventListener("click", (e) => {
  const v = e.target.closest?.("#bonus-parts-area .bonus-verdict");
  if (!v || state.mode !== "bonuses" || !state._bonusRecorded) return;
  const holder = v.closest('[id^="bonus-answer-"]');
  if (!holder) return;
  applyBonusOverride(parseInt(holder.id.replace("bonus-answer-", ""), 10));
});

// Totals are out of the bonus's own maximum (its per-part values; 10 each
// when unstated) and its own part count — not 30 and 3.
function bonusResultMax(result) {
  const n = state.bonusPartCount || (result && result.parts && result.parts.length) || 3;
  const bv = state.currentQuestion ? bonusPartValues(state.currentQuestion) : null;
  return { n, max: bv && bv.parts === n ? bv.max : n * 10 };
}
function bonusAllCorrect(result) { const { n } = bonusResultMax(result); return (result.partsCorrect || 0) >= n && n > 0; }
function bonusBannerClass(result) { return bonusAllCorrect(result) ? "power" : result.totalPoints > 0 ? "correct" : "incorrect"; }
function bonusBannerText(result) { const { n, max } = bonusResultMax(result); return `BONUS: ${result.totalPoints}/${max} pts (${result.partsCorrect}/${n})`; }
function displayBonusResult(result, userAnswers) {
  const banner = $("#result-banner");
  const answerDiv = $("#result-answer");
  const area = $("#result-area");
  area.classList.remove("hidden");
  state.resultAreaVisible = true;

  banner.className = "result-banner";
  banner.classList.add(bonusBannerClass(result));
  banner.textContent = bonusBannerText(result);

  const actualAnswers = result.answers || [];
  answerDiv.innerHTML = "";
  renderResultTags(state.currentQuestion);

  state.sessionHistory.push({
    id: state.currentQuestion?.id,
    type: "bonus",
    question: state.currentQuestion,
    userAnswers,
    correct: bonusAllCorrect(result),
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

  $("#session-score").textContent = `${state.totalPoints}`;
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
  { const rt = document.getElementById("result-tags"); if (rt) rt.innerHTML = ""; }
  showResultActions(false);
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
  try { navigator.clipboard.writeText(t); } catch (e) {}
}
// A copy button that shows it worked: its icon turns into a checkmark with a small
// "Copied" label for a moment. (The clipboard API can be missing — e.g. not https —
// so an old-style copy is the fallback.)
function copyWithCheck(btn, text) {
  const fallback = () => { try { const ta = Object.assign(document.createElement("textarea"), { value: text }); ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch (e) { return false; } };
  const show = () => {
    if (!btn) return;
    if (!btn._qbIcon) btn._qbIcon = btn.innerHTML;
    btn.innerHTML = ic("check", 15, ' style="stroke-width:2.6"');
    btn.classList.add("copied"); btn.setAttribute("data-copied", "Copied");
    clearTimeout(btn._qbCopyT);
    btn._qbCopyT = setTimeout(() => { btn.innerHTML = btn._qbIcon; btn._qbIcon = null; btn.classList.remove("copied"); btn.removeAttribute("data-copied"); }, 1600);
  };
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(show, () => { if (fallback()) show(); }); return; } } catch (e) {}
  if (fallback()) show();
}
window.qbCopyWithCheck = copyWithCheck;

// ── Hidden questions ("this question is bad — never serve it again") ──
function hiddenQs() { try { return JSON.parse(lsGet("qb-hidden-questions") || "{}") || {}; } catch (e) { return {}; } }
function hiddenQsSave(m) { lsSet("qb-hidden-questions", JSON.stringify(m)); }
function isQuestionHidden(id, type) { return !!hiddenQs()[(type || "tossup") + ":" + id]; }
function toggleQuestionHidden(id, type, label) {
  const m = hiddenQs();
  const k = (type || "tossup") + ":" + id;
  if (m[k]) { delete m[k]; } else { m[k] = { label: String(label || "").slice(0, 120), ts: Date.now() }; }
  hiddenQsSave(m);
  const on = !!m[k];
  return on;
}
function openHiddenManager() {
  document.getElementById("hidden-manager")?.remove();
  const el = document.createElement("div");
  el.id = "hidden-manager";
  el.className = "qb-overlay confirm-overlay";
  const render = () => {
    const m = hiddenQs();
    const keys = Object.keys(m).sort((a, b) => (m[b].ts || 0) - (m[a].ts || 0));
    el.innerHTML = `<div class="confirm-box" style="width:min(560px,92vw);max-width:min(560px,92vw)">
      <div class="confirm-msg">Hidden questions (${keys.length})</div>
      <div style="max-height:50vh;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
        ${keys.length ? keys.map((k) => `
          <div style="display:flex;align-items:center;gap:8px;font-size:12px">
            <span class="pill">${k.startsWith("bonus") ? "BO" : "TU"}</span>
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(m[k].label || k.split(":")[1])}</span>
            <button class="btn btn-sm btn-ghost hid-un" data-k="${escapeHtml(k)}">Unhide</button>
          </div>`).join("") : '<div class="text-muted" style="padding:10px">Nothing hidden</div>'}
      </div>
      <div class="confirm-actions">
        ${keys.length ? '<button class="btn btn-ghost" id="hid-clear">Unhide all</button>' : ""}
        <button class="btn btn-primary" id="hid-close">Close</button>
      </div>
    </div>`;
    el.querySelector("#hid-close").onclick = () => animateRemove(el);
    const clr = el.querySelector("#hid-clear");
    if (clr) clr.onclick = () => confirmDialog("Unhide all hidden questions?", () => { hiddenQsSave({}); render(); }, { yes: "Unhide all" });
    el.querySelectorAll(".hid-un").forEach((b) => {
      b.onclick = () => { const m2 = hiddenQs(); delete m2[b.dataset.k]; hiddenQsSave(m2); render(); };
    });
  };
  el.addEventListener("click", (ev) => { if (ev.target === el) animateRemove(el); });
  render();
  document.body.appendChild(el);
}

// A selection only counts for a given element's menu if it actually lies
// INSIDE that element — otherwise a stale highlight elsewhere on the page
// would hijack the menu.
function selectionInside(el) {
  const sel = window.getSelection();
  const text = String(sel || "").trim();
  if (!text || text.length < 2) return "";
  if (el && sel.rangeCount) {
    const n = sel.getRangeAt(0).commonAncestorContainer;
    const node = n.nodeType === 1 ? n : n.parentElement;
    if (node && !el.contains(node)) return "";
  }
  return text.slice(0, 80);
}

// Selection-aware search entries shared by several menus — database searches
// plus cross-plugin jumps (Keyword Frequency, Fact Sheet) when installed.
function selectionMenuItems() {
  const sel = String(window.getSelection() || "").trim();
  if (!sel || sel.length < 2) return [];
  const q = sel.slice(0, 80);
  return selectionTermItems(q);
}

// Right-click any question card (search, packets, history, review, starred)
// for quick actions built from what the card actually contains.
document.addEventListener("contextmenu", (e) => {
  const card = e.target.closest?.(".qcard");
  if (!card || !window.QB?.contextMenu) return;
  // Highlighted text wins: offer actions for WHAT WAS SELECTED, not for the
  // card's answer. The answer menu is what you get when nothing is selected.
  const picked = selectionInside(card);
  if (picked) {
    e.preventDefault();
    const selItems = selectionTermItems(picked).filter((it) => !it.sep);
    window.QB.contextMenu(e.clientX, e.clientY, [
      { label: "Copy", onClick: () => copyToClipboard(picked) },
      { sep: true },
      ...selItems,
    ], { title: "\u201C" + picked.slice(0, 40) + "\u201D" });
    return;
  }
  const items = [];
  const text = card.querySelector(".qcard-text")?.textContent?.trim();
  const ans = card.querySelector(".ans")?.textContent?.trim();
  const cleanAns = ans ? primaryAnswerText(ans) : "";
  const star = card.querySelector(".qb-star[data-qid]");
  const save = card.querySelector(".db-save[data-qid]");
  const compact = card.classList.contains("compact");
  if (cleanAns) items.push({ label: "Find questions with this answer", onClick: () => searchDatabase({ query: cleanAns, field: "answer", exact: false }) });
  items.push({ label: compact ? "Expand card" : "Collapse card", onClick: () => { card.classList.toggle("compact", !compact); card.classList.toggle("expanded", compact); } });
  items.push({ sep: true });
  if (text) items.push({ label: "Copy question", onClick: () => copyToClipboard(text) });
  if (ans) items.push({ label: "Copy answer", onClick: () => copyToClipboard(ans.replace(/^answer:\s*/i, "")) });
  items.push({ sep: true });
  if (star) items.push({ label: star.classList.contains("on") ? "Unstar" : "Star", onClick: () => star.click() });
  if (save) items.push({ label: "Save to review / folders…", onClick: () => save.click() });
  const idEl = save || star;
  if (idEl && idEl.dataset.qid) {
    const qid = idEl.dataset.qid, qtype = idEl.dataset.type || "tossup";
    items.push({
      label: isQuestionHidden(qid, qtype) ? "Unhide question" : "Hide question",
      danger: !isQuestionHidden(qid, qtype),
      onClick: () => toggleQuestionHidden(qid, qtype, ans || text || qid),
    });
  }
  e.preventDefault();
  window.QB.contextMenu(e.clientX, e.clientY, items, { title: cleanAns || (text || "").slice(0, 44) });
});

// Anywhere else: right-click on SELECTED text offers copy + database searches.
// Registered after the specific handlers, so it only fires when none of them
// claimed the event (defaultPrevented).
document.addEventListener("contextmenu", (e) => {
  if (e.defaultPrevented || !window.QB?.contextMenu) return;
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return; // keep the native menu for inputs

  const sel = String(window.getSelection() || "").trim();
  if (sel && sel.length >= 2) {
    const q = sel.slice(0, 80);
    e.preventDefault();
    window.QB.contextMenu(e.clientX, e.clientY, [
      { label: "Copy", onClick: () => copyToClipboard(sel) },
      ...selectionMenuItems(),
    ], { title: "“" + q.slice(0, 40) + "”" });
    return;
  }

  // No selection: if the cursor is over text that is ITSELF interactive
  // (clickable / underlined — the things a left-click already acts on, like
  // the words and answers in the frequency lists), treat that element's text
  // as the term and open the same menu without making the user highlight it.
  const term = interactiveTermAt(e.target);
  if (!term) return;
  e.preventDefault();
  window.QB.contextMenu(e.clientX, e.clientY, [
    { label: "Copy", onClick: () => copyToClipboard(term) },
    ...selectionTermItems(term),
  ], { title: term.length > 40 ? term.slice(0, 39) + "…" : term });
});

// Text that a left-click already does something with, or that is visibly
// underlined, is a "term" the user can act on. Deliberately excludes real
// buttons/inputs (their label is UI chrome, not content) and anything already
// handled by a more specific context menu.
const TERM_SELECTOR = [
  ".kw-word", ".freq-answer", ".bw-kw", ".fs-gram", ".ext-link", ".al-rans",
  ".db-row", ".session-row", ".fo-tile-name", ".qcard-part", ".ans", ".actual",
  "a[href]", "u",
].join(",");
function interactiveTermAt(target) {
  if (!target || !target.closest) return null;
  let el = target.closest(TERM_SELECTOR);
  if (!el) {
    // Fall back to any element the app made clickable (cursor:pointer + own text).
    const cand = target.closest("[data-w],[data-kw],[data-g],[data-answer],[data-sub],[data-set],[data-pkt]");
    if (cand) el = cand;
  }
  if (!el) return null;
  if (el.closest("button, input, select, textarea, .btn, .qb-ctx-menu, .save-menu")) return null;
  const raw = (el.dataset && (el.dataset.w || el.dataset.kw || el.dataset.g || el.dataset.answer)) || el.textContent || "";
  const term = String(raw).replace(/^answer:\s*/i, "").replace(/\s+/g, " ").trim();
  if (!term || term.length < 2 || term.length > 90) return null;
  if (!/[a-zA-Z0-9]/.test(term)) return null;
  return term;
}
// Same entries selectionMenuItems() builds, for an explicit term.
function selectionTermItems(term) {
  const q = String(term).slice(0, 80);
  const items = [
    { sep: true },
    { label: "Search questions for it", onClick: () => searchDatabase({ query: q, field: "question", exact: true }) },
    { label: "Search answers for it", onClick: () => searchDatabase({ query: q, field: "answer", exact: false }) },
  ];
  const pages = window.QB?.getActivePages?.() || [];
  if (pages.some((p) => p.id === "keyword-freq::kwfreq")) {
    items.push({ sep: true });
    items.push({ label: "Top answers for it (Keyword Freq)", onClick: () => { try { localStorage.setItem("qb-kf-handoff", JSON.stringify({ mode: "words", term: q })); } catch (err) {} window.QB.showPage("keyword-freq::kwfreq"); } });
    items.push({ label: "Keywords, treating it as an answer", onClick: () => { try { localStorage.setItem("qb-kf-handoff", JSON.stringify({ mode: "answers", term: q })); } catch (err) {} window.QB.showPage("keyword-freq::kwfreq"); } });
  }
  const factPage = pages.find((p) => p.id.startsWith("fact-sheet::"));
  if (factPage) items.push({ label: "Fact sheet for it", onClick: () => { try { localStorage.setItem("qb-facts-handoff", JSON.stringify({ term: q })); } catch (err) {} window.QB.showPage(factPage.id); } });
  return items;
}

// Right-click the live practice question for the same quick actions.
$("#question-content")?.addEventListener("contextmenu", (e) => {
  if (!state.currentQuestion || !window.QB?.contextMenu) return;
  const q = state.currentQuestion;
  const isBonus = state.mode === "bonuses";
  const revealed = !isBonus && state.resultAreaVisible && q.answer_sanitized;
  const picked = selectionInside($("#question-content"));
  if (picked) {
    e.preventDefault();
    window.QB.contextMenu(e.clientX, e.clientY, [
      { label: "Copy", onClick: () => copyToClipboard(picked) },
      { sep: true },
      ...selectionTermItems(picked).filter((it) => !it.sep),
    ], { title: "\u201C" + picked.slice(0, 40) + "\u201D" });
    return;
  }
  const items = [];
  if (revealed) {
    const pa = primaryAnswerText(q.answer_sanitized);
    if (pa) items.push({ label: "Find questions with this answer", onClick: () => searchDatabase({ query: pa, field: "answer", exact: false }) });
  }
  items.push({ label: "Copy question", onClick: () => copyToClipboard($("#question-text")?.textContent || "") });
  if (revealed) items.push({ label: "Copy answer", onClick: () => copyToClipboard(q.answer_sanitized) });
  items.push({ sep: true });
  items.push({ label: "Star question", onClick: () => toggleStar() });
  items.push({ label: "Save to review / folders…", onClick: () => openSaveMenu(q, isBonus ? "bonus" : "tossup", e.target) });
  const qtype = isBonus ? "bonus" : "tossup";
  items.push({
    label: isQuestionHidden(q.id, qtype) ? "Unhide question" : "Hide question",
    danger: !isQuestionHidden(q.id, qtype),
    onClick: () => toggleQuestionHidden(q.id, qtype, q.answer_sanitized || q.id),
  });
  e.preventDefault();
  window.QB.contextMenu(e.clientX, e.clientY, items, { title: revealed ? primaryAnswerText(q.answer_sanitized) : (isBonus ? "Bonus" : "Tossup") });
});

$("#btn-start-session").addEventListener("click", () => {
  if (!state.sessionActive) startSession();
  else if (state.mode === "tossups" && !state.isBuzzed) buzz();
  else if (state.mode === "bonuses" && state.settings.allowSkips) skipQuestion();
});

$("#btn-end-session").addEventListener("click", () => confirmEndSession(goHome));

function exportSessionHistory() {
  // Export whatever the overlay is currently showing, so a plugin-supplied
  // list exports itself rather than the solo session sitting behind it.
  const src = _histEntries || state.sessionHistory;
  if (!src.length) return;
  const entries = src.map((e) => ({
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

// opts.entries renders the overlay over a supplied list instead of the live solo
// session — that is how the multiplayer plugin gets this exact GUI rather than a
// lookalike. opts.title relabels the header.
function openHistoryOverlay(opts) {
  // Also used directly as a click handler, so `opts` may be a MouseEvent —
  // only an object carrying an entries array counts.
  const o = opts && Array.isArray(opts.entries) ? opts : null;
  _histEntries = o ? o.entries : null;
  const src = _histEntries || state.sessionHistory;
  document.getElementById("history-overlay")?.remove();
  const el = document.createElement("div");
  el.id = "history-overlay";
  el.className = "review-viewer";
  el.innerHTML = `
    <div class="review-viewer-box">
      <div class="review-viewer-head">
        <span class="hotkey-sheet-title" style="margin:0">${escapeHtml((o && o.title) || "SESSION HISTORY")} (${src.length})</span>
        <span style="display:flex;gap:6px">
          <button class="btn btn-sm btn-ghost" id="btn-history-export"${src.length ? "" : " disabled"}>Export</button>
          <button class="btn btn-sm btn-ghost" id="btn-history-compact">Compact all</button>
          <button class="btn btn-sm btn-ghost" id="btn-history-expand">Expand all</button>
          <button class="btn btn-sm btn-ghost" id="btn-history-close">Close</button>
        </span>
      </div>
      <div class="rv-filterbar">
        <select id="hist-fres" class="mode-input"><option value="">All results</option><option value="power">Powers</option><option value="correct">Correct</option><option value="neg">Negs</option><option value="zero">Dead / skipped / wrong</option></select>
        <select id="hist-ftype" class="mode-input"><option value="">Tossups + Bonuses</option><option value="tossup">Tossups</option><option value="bonus">Bonuses</option></select>
        <button type="button" id="hist-fcat-btn"></button>
        <input type="text" id="hist-fq" class="mode-input" placeholder="Search answers / questions" autocomplete="off">
      </div>
      <div class="review-viewer-list history-list" id="history-list"></div>
    </div>`;
  // Closing must drop the borrowed list, or the next solo open would still be
  // showing the plugin's entries.
  const close = () => { _histEntries = null; animateRemove(el); };
  el.addEventListener("click", (ev) => { if (ev.target === el) close(); });
  document.body.appendChild(el);
  _histFilter = { res: "", type: "", cat: null, q: "" };
  _moreShown.delete("hist");
  const hcat = CategoryButton(el.querySelector("#hist-fcat-btn"), { live: true, onChange: () => syncF() });
  const syncF = () => {
    _histFilter = {
      res: el.querySelector("#hist-fres").value,
      type: el.querySelector("#hist-ftype").value,
      cat: hcat.get().length ? hcat : null,
      q: el.querySelector("#hist-fq").value.trim().toLowerCase(),
    };
    renderHistoryPanel();
  };
  ["hist-fres", "hist-ftype"].forEach((id) => el.querySelector("#" + id).addEventListener("change", syncF));
  el.querySelector("#hist-fq").addEventListener("input", syncF);
  el.querySelector("#btn-history-close").onclick = close;
  el.querySelector("#btn-history-export").onclick = exportSessionHistory;
  el.querySelector("#btn-history-compact").onclick = () => { state.viewMode = "compact"; lsSet("qb-viewmode", "compact"); renderHistoryPanel(); };
  el.querySelector("#btn-history-expand").onclick = () => { state.viewMode = "expanded"; lsSet("qb-viewmode", "expanded"); renderHistoryPanel(); };
  renderHistoryPanel();
}

$("#btn-history-open")?.addEventListener("click", openHistoryOverlay);

$("#btn-home").addEventListener("click", goBack);
$("#btn-stats-home").addEventListener("click", goBack);
// One category picker drives the whole Stats page (numbers, graphs, breakdown).
let _statsCat = null;
function statsCatIds() { return _statsCat ? _statsCat.get() : []; }
function initStatsCategories() {
  const b = document.getElementById("stats-cat-btn");
  if (!b || _statsCat) return;
  _statsCat = CategoryButton(b, { onChange: () => loadStats() });
}
$("#stats-period")?.addEventListener("change", (e) => { _statsPeriod = e.target.value; loadStats(); });
$("#btn-settings-home")?.addEventListener("click", goBack);
$("#btn-player-home")?.addEventListener("click", goBack);
$("#btn-ext-home")?.addEventListener("click", goBack);
$("#btn-download-home")?.addEventListener("click", goBack);
$("#btn-friends-home")?.addEventListener("click", goBack);
$("#btn-leaderboards-home")?.addEventListener("click", goBack);
$("#btn-streaks-home")?.addEventListener("click", goBack);

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

// A queue (review / packet / starred) ran out: show the message AND clear all
// question state, so a later Next/Skip can't phantom-skip the stale last
// question (which would overwrite its recorded result via the override path).
function endOfQueue(msg) {
  state.currentQuestion = null;
  state._loadingQuestion = false;
  state._wantBonus = false;
  state._bonusFromQ = null;
  state._pendingPairedBonus = null;
  showError(msg);
}

function showError(msg) {
  showResultActions(false);
  const banner = $("#result-banner");
  const area = $("#result-area");
  area.classList.remove("hidden");
  banner.className = "result-banner incorrect";
  banner.textContent = msg;
}


async function toggleStar() {
  const q = state.currentQuestion;
  if (!q) return;
  if (accountGate("Sign in to star questions.")) return;
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
  // the starred list is loaded at startup and kept current (setStarredLocal),
  // so no round trip per question — one per Next on the website
  if (state.starredIds) { updateStarIndicator(questionId, type, state.starredIds.has((type || "tossup") + ":" + questionId)); return; }
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
  if (!(w > 0 && h > 0)) {
    // No layout box (a collapsed section). Sizing the bitmap to 0x0 erased the
    // aspect ratio height:auto relies on, so the chart stayed 0px tall after
    // expanding. Keep the bitmap and draw into a throwaway context at its own
    // size; the qb-coll-open redraw paints the real canvas.
    const ctx = (setupCanvas._scratch ||= document.createElement("canvas").getContext("2d"));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return { ctx, W: canvas.width / dpr || 300, H: canvas.height / dpr || 150 };
  }
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
  if (entries.length < 2) return emptyChart(canvas, "Not enough data yet");
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

// Session Breakdown difficulty: square toggles, none ticked = every difficulty.
// Kept across Stats re-renders (period / category changes) for the session.
let _bdDiffs = [];
function populateGraphFilters(stats) {
  const box = document.getElementById("graph-filter-diff");
  if (box) box.onchange = () => {
    _bdDiffs = [...box.querySelectorAll("input:checked")].map((i) => +i.value);
    redrawFilteredGraphs();
  };
}

let _breakdownCache = null;
async function redrawFilteredGraphs(breakdown) {
  const cat = "";   // categories: the page's picker (categoryIds)
  const cids = statsCatIds();
  const diff = _bdDiffs.join(",");

  let bd;
  if (breakdown) { _breakdownCache = breakdown; bd = breakdown; }
  else {
    try {
      const params = [diff ? "difficulty=" + encodeURIComponent(diff) : "", cids.length ? "categoryIds=" + encodeURIComponent(cids.join(",")) : ""].filter(Boolean).join("&");
      const res = await API.get("/api/sessions/breakdown" + (params ? "?" + params : ""));
      bd = res.breakdown || [];
    } catch { bd = _breakdownCache || []; }
  }

  // The session list arrives newest-first — charts read left→right in time.
  bd = bd.slice().reverse();
  // The stats time-period select applies here too, not just the number cards.
  const cutoff = statsPeriodCutoff();
  if (cutoff) bd = bd.filter((s) => new Date(s.startedAt).getTime() >= cutoff);

  const cOutcomes = document.getElementById("graph-session-outcomes");
  const cPpg = document.getElementById("graph-ppg");
  const cRates = document.getElementById("graph-rates");
  const cCel = document.getElementById("graph-celerity-detail");

  if (cOutcomes) drawSessionOutcomes(cOutcomes, bd, cat, diff);
  if (cPpg) drawPointsPerTU(cPpg, bd, cat, diff);
  if (cRates) drawRatesGraph(cRates, bd, cat, diff);
  if (cCel) drawCelerityDetail(cCel, bd, cat, diff);
}

// ── windowed session charts ────────────────────────────────────────────────
// Every session is chartable, not just the last 12: each canvas shows a
// WINDOW of whole sessions (so a bar is never cut in half at an edge) and
// pans by whole columns — scroll horizontally / shift+scroll / drag. A slim
// scrollbar at the bottom shows where the window sits; the newest sessions
// are shown by default.
const CHART_COL = 58;
function windowedChart(canvas, items, drawSlice) {
  const cw = canvas.clientWidth || (canvas.getBoundingClientRect().width | 0) || 600;
  const visible = Math.max(3, Math.floor((cw - 66) / CHART_COL));
  const st = canvas.__win || (canvas.__win = { offset: -1, acc: 0, lastLen: -1 });
  st.items = items;
  st.visible = visible;
  st.maxOff = Math.max(0, items.length - visible);
  if (st.lastLen !== items.length) { st.offset = -1; st.lastLen = items.length; }
  if (st.offset < 0 || st.offset > st.maxOff) st.offset = st.maxOff;   // default: newest
  st.drawSlice = drawSlice;
  st.render = () => {
    drawSlice(st.items.slice(st.offset, st.offset + st.visible));
    canvas.style.cursor = st.maxOff > 0 ? "grab" : "";
  };
  st.render();
  if (!canvas.__winWired) {
    canvas.__winWired = true;
    canvas.addEventListener("wheel", (e) => {
      const s = canvas.__win;
      if (!s || s.maxOff <= 0) return;
      const d = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!d) return;   // plain vertical wheel keeps scrolling the page
      e.preventDefault();
      s.acc += d;
      let next = s.offset;
      while (s.acc >= 40) { s.acc -= 40; next++; }
      while (s.acc <= -40) { s.acc += 40; next--; }
      next = Math.max(0, Math.min(s.maxOff, next));
      if (next !== s.offset) { s.offset = next; s.render(); }
    }, { passive: false });
    let drag = null;
    canvas.addEventListener("pointerdown", (e) => {
      const s = canvas.__win;
      if (!s || s.maxOff <= 0) return;
      drag = { x: e.clientX, off: s.offset };
      canvas.style.cursor = "grabbing";
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const s = canvas.__win;
      const next = Math.max(0, Math.min(s.maxOff, drag.off - Math.round((e.clientX - drag.x) / CHART_COL)));
      if (next !== s.offset) { s.offset = next; s.render(); }
    });
    const endDrag = () => { drag = null; const s = canvas.__win; canvas.style.cursor = s && s.maxOff > 0 ? "grab" : ""; };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
  }
}
function statsPeriodCutoff() {
  const p = _statsPeriod;
  if (!p || p === "all") return 0;
  const now = new Date();
  if (p === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = parseInt(p, 10);
  return days ? Date.now() - days * 86400e3 : 0;
}

function drawSessionOutcomes(canvas, breakdown) {
  const t = chartTheme();
  windowedChart(canvas, breakdown || [], (slice) => {
    const groups = slice.map((s) => ({ label: shortDate(s.startedAt), segments: [ { value: s.powers, color: t.accent }, { value: s.tens, color: t.green }, { value: s.deads, color: t.muted }, { value: s.negs, color: t.red } ] }));
    stackedChart(canvas, groups, { title: "Outcomes per Session", empty: "No sessions yet", legend: [ { label: "Power", color: t.accent }, { label: "+10", color: t.green }, { label: "Dead", color: t.muted }, { label: "Neg", color: t.red } ] });
  });
}
function drawPointsPerTU(canvas, breakdown) {
  const t = chartTheme();
  const all = (breakdown || []).filter((s) => s.totalTU > 0);
  windowedChart(canvas, all, (slice) => {
    const bars = slice.map((s) => ({ label: shortDate(s.startedAt), value: Math.round(s.pointsPerTU * 10) / 10, color: s.pointsPerTU >= 0 ? t.green : t.red }));
    barChart(canvas, bars, { title: "Points per Tossup (by session)", fmt: (v) => v.toFixed(1), empty: "No tossup sessions yet" });
  });
}
function drawRatesGraph(canvas, breakdown) {
  const t = chartTheme();
  const all = (breakdown || []).filter((s) => s.totalTU > 0);
  windowedChart(canvas, all, (slice) => {
    const groups = slice.map((s) => ({ label: shortDate(s.startedAt), segments: [ { value: Math.round(s.powerRate * 100), color: t.accent }, { value: Math.round(s.negRate * 100), color: t.red } ] }));
    stackedChart(canvas, groups, { title: "Power vs Neg Rate (by session)", yMax: 100, empty: "No tossup sessions yet", legend: [ { label: "Power %", color: t.accent }, { label: "Neg %", color: t.red } ] });
  });
}
function drawCelerityDetail(canvas, breakdown) {
  const all = (breakdown || []).filter((s) => s.totalTU > 0);
  windowedChart(canvas, all, (slice) => {
    const points = slice.map((s) => ({ x: shortDate(s.startedAt), y: Math.round((s.avgCorrectCelerity || 0) * 100) }));
    lineChart(canvas, points, { title: "Avg Buzz Celerity per Session", fmt: (v) => v + "%", empty: "No tossup sessions yet" });
  });
}


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
  const cat = document.getElementById("stats-cat-btn");
  if (cat) cat.style.display = sid ? "none" : "";
}
function qhDetailHtml(q, type) {
  if (type === "bonus") {
    let answers = [], raws = [], parts = [];
    try { answers = JSON.parse(q.answers_sanitized || "[]"); } catch (e) {}
    try { raws = JSON.parse(q.answers || "[]"); } catch (e) {}
    try { parts = JSON.parse(q.parts_sanitized || "[]"); } catch (e) {}
    return '<div class="qh-qtext">' + escapeHtml(q.leadin_sanitized || "") + "</div>" +
      parts.map((p, k) => '<div class="qh-part">[' + (bonusPartValues(q).values[k] || 10) + '] ' + escapeHtml(p) + '<br><span class="qh-ans">ANSWER: ' + answerLineHtml(raws[k], answers[k] || "") + "</span></div>").join("");
  }
  return '<div class="qh-qtext">' + escapeHtml(q.question_sanitized || "") + "</div>" +
    '<div class="qh-ans">Answer: ' + answerLineHtml(q.answer, q.answer_sanitized || "") + "</div>";
}
let _statsRedraw = null;
async function loadStats(preserveScroll = false) {
  _screenBuilt.add("stats");
  const screen = document.getElementById("stats-screen");
  const keepScroll = preserveScroll && screen ? screen.scrollTop : 0;
  const container = $("#stats-container");
  if (needsAccount()) { container.innerHTML = accountPanelHtml("Sign in to save your stats and see them here."); return; }
  if (!preserveScroll) container.innerHTML = '<div class="text-muted">Loading stats...</div>';

  const sid = state.statsSessionId || null;
  const since = sid ? 0 : statsSinceMs();
  try {
    initStatsCategories();
    const cids = statsCatIds();
    const data = await API.get("/api/stats" + (sid ? "?sessionId=" + encodeURIComponent(sid) : "?since=" + (since || 0) + (cids.length ? "&categoryIds=" + encodeURIComponent(cids.join(",")) : "")));
    const stats = data.stats;

    syncStatsControls(sid);
    if (!stats || stats.totalQuestions === 0) {
      container.innerHTML = `
        ${sid ? '<button class="btn btn-sm btn-ghost" id="stats-back">\u2190 All sessions</button>' : ""}
        <div style="text-align:center;padding:40px;color:var(--text-muted)">
          <div style="font-size:48px;margin-bottom:16px"><svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.4-1.3 1-1.3 1.8v.3"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg></div>
          <p>${sid ? "This session has no recorded questions." : (_statsPeriod !== "all" ? "No questions in " + escapeHtml(statsPeriodLabel().toLowerCase()) : "No statistics yet")}</p>
        </div>
      `;
      document.getElementById("stats-back")?.addEventListener("click", () => { state.statsSessionId = null; loadStats(); });
      return;
    }

    const sessions = await API.get("/api/sessions");
    const sessionList = sessions.sessions || [];

    let sessionEntries = [];
    if (sid) { try { sessionEntries = (await API.get("/api/sessions/entries?sessionId=" + encodeURIComponent(sid))).entries || []; } catch (e) {} }

    // the backend already filtered everything to the picked categories
    const selectedCat = !sid && cids.length && _statsCat ? _statsCat.summary() : "";
    const view = stats;

    let html = "";

    if (sid) {
      html += `<div class="stats-session-head">
        <button class="btn btn-sm btn-ghost" id="stats-back">\u2190 All sessions</button>
        <span class="stats-session-name">SESSION ${escapeHtml(formatSessionTitle(sid))}</span>
      </div>`;
    }

    html += `<div class="stats-section" data-coll="stats:overview">
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
      html += `<div class="stats-section" data-coll="stats:graph">
        <div class="stats-section-title">GRAPH</div>
        <canvas id="stats-graph" class="chart-canvas" width="700" height="300" style="width:100%;max-width:760px"></canvas>
      </div>`;
    }

    html += `<div class="stats-section" data-coll="stats:tossups">
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
      const bd = view.bonusDist || null; // per-category views don't carry a distribution
      html += `<div class="stats-section" data-coll="stats:bonuses">
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
          ${bd ? `<div class="stat-card">
            <div class="stat-card-value">${bd[30] || 0} · ${bd[20] || 0} · ${bd[10] || 0} · ${bd[0] || 0}</div>
            <div class="stat-card-label">30s · 20s · 10s · 0s</div>
          </div>` : ""}
        </div>
      </div>`;
    }

    const categoryData = Object.values(stats.byCategory || {})
      .filter((c) => c.totalQuestions > 0)
      .sort((a, b) => (b.totalPoints / b.totalQuestions) - (a.totalPoints / a.totalQuestions));
    if (categoryData.length > 0) {
      html += `<div class="stats-section" data-coll="stats:by-category">
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
        if (isBonus) { const pc = en.bonus_parts_correct != null ? en.bonus_parts_correct : 0, pn = en.part_count || 3; cls = pc >= pn ? "qh-correct" : en.points > 0 ? "qh-partial" : "qh-miss"; label = pc + "/" + pn; }
        else if (en.points >= 15) { cls = "qh-power"; label = "POWER"; }
        else if (en.correct) { cls = "qh-correct"; label = "CORRECT"; }
        else if (en.points < 0) { cls = "qh-neg"; label = "NEG"; }
        const cel = Math.max(0, Math.min(1, en.celerity == null ? 1 : en.celerity));
        const buzzBar = isBonus ? "" :
          '<div class="qh-buzzbar" title="Buzzed ' + Math.round(cel * 100) + '% into the question">' +
            '<div class="qh-buzzmark" style="left:' + (cel * 100).toFixed(1) + '%"></div></div>';
        const ans = en.given_answer ? escapeHtml(en.given_answer) : '<span class="text-muted">(no answer)</span>';
        const res = isBonus ? ((en.bonus_parts_correct || 0) >= (en.part_count || 3) ? "correct" : en.points > 0 ? "partial" : "miss") : (en.points >= 15 ? "power" : en.correct ? "correct" : en.points < 0 ? "neg" : "miss");
        return '<tr class="qh-row" data-qh="' + i + '" data-qid="' + escapeHtml(en.question_id || "") + '" data-qtype="' + (en.type || "tossup") + '" data-res="' + res + '" data-path="' + escapeHtml(en.category_path || en.category || "") + '" data-ans="' + escapeHtml((en.given_answer || "").toLowerCase()) + '" style="cursor:pointer" title="Show the question & answer">' +
          '<td><span class="qh-chev">▸</span> <span class="qh-badge ' + cls + '">' + label + "</span></td>" +
          "<td>" + escapeHtml(en.category || "") + (en.difficulty != null ? ' <span class="text-muted">d' + en.difficulty + "</span>" : "") + "</td>" +
          "<td>" + ans + "</td>" +
          "<td>" + buzzBar + "</td>" +
          '<td style="text-align:right">' + (en.points > 0 ? "+" : "") + en.points + "</td>" +
        "</tr>" +
        '<tr class="qh-detail hidden" data-qhd="' + i + '"><td colspan="5"><div class="text-muted">Loading…</div></td></tr>';
      }).join("");
      html += '<div class="stats-section" data-coll="stats:question-history">' +
        '<div class="stats-section-title">QUESTION HISTORY (<span id="qh-count">' + sessionEntries.length + "</span>)</div>" +
        '<div class="db-toolbar" style="border:none;background:none;padding:8px 0">' +
          '<select id="qh-fres" class="db-input db-input-sm"><option value="">All results</option><option value="power">Powers</option><option value="correct">Correct</option><option value="neg">Negs</option><option value="miss">Misses</option><option value="partial">Partial bonuses</option></select>' +
          '<select id="qh-ftype" class="db-input db-input-sm"><option value="">Tossups + Bonuses</option><option value="tossup">Tossups</option><option value="bonus">Bonuses</option></select>' +
          '<button type="button" id="qh-fcat-btn"></button>' +
          '<input type="text" id="qh-fq" class="db-input" placeholder="Search your answers…" autocomplete="off" style="max-width:220px">' +
        "</div>" +
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
      html += `<div class="stats-section" data-coll="stats:celerity">
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

    const pickedRoots = selectedCat && _statsCat ? [...new Set(_statsCat.paths().map((p) => p.split(" > ")[0]))] : [];
    if (!sid && sessionList.length > 0) {
      html += `<div class="stats-section" data-coll="stats:sessions">
        <div class="stats-section-title">SESSIONS (${sessionList.length})</div>
        <table class="stats-table stats-sessions-table">
          <thead><tr>
            <th>Session</th><th>Questions</th><th>Points</th><th>Started</th><th></th>
          </tr></thead>
          <tbody>
            ${sessionList
              .map((s) => {
                const outOfPeriod = since && (s.ended_at || s.started_at || 0) < since;
                const sCats = (s.categories || "").split(",").map((c) => c.trim()).filter(Boolean);
                const outOfCat = selectedCat && !sCats.some((c) => pickedRoots.includes(c));
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
      html += `<div class="stats-section" data-coll="stats:by-difficulty">
        <div class="stats-section-title">BY DIFFICULTY</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <canvas id="graph-diff-accuracy" class="chart-canvas" width="420" height="260" style="flex:1;min-width:340px;max-width:520px"></canvas>
          <canvas id="graph-diff-celerity" class="chart-canvas" width="420" height="260" style="flex:1;min-width:340px;max-width:520px"></canvas>
          <canvas id="graph-diff-bonus" class="chart-canvas" width="420" height="260" style="flex:1;min-width:340px;max-width:520px"></canvas>
        </div>
      </div>`;
    }

    if (!sid) html += `<div class="stats-section" data-coll="stats:breakdown">
      <div class="stats-section-title">SESSION BREAKDOWN
        <div class="diff-toggles" id="graph-filter-diff" role="group" aria-label="Difficulty">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => `<label title="${escapeHtml(DIFF_FULL[d] || "")}"><input type="checkbox" value="${d}"${_bdDiffs.includes(d) ? " checked" : ""}><span>${d}</span></label>`).join("")}</div>
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
        const bd = await API.get("/api/sessions/breakdown" + (cids.length ? "?categoryIds=" + encodeURIComponent(cids.join(",")) : ""));
        breakdown = bd.breakdown || [];
      } catch {}
    }

    container.innerHTML = html;
    initCollapsibles(container);
    tipInto(container, "stats");
    limitList(container.querySelector(".stats-sessions-table"), "tbody > tr", "stats:sessions", 10, 25);

    if (!sid) {
      for (const prov of (window.QB?.getStatsProviders?.() || [])) {
        const sec = document.createElement("div");
        sec.className = "stats-section";
        sec.dataset.coll = "stats:plugin:" + (prov.pluginId || "") + ":" + (prov.id || "");
        sec.innerHTML = `<div class="stats-section-title">${escapeHtml(prov.title.toUpperCase())}</div>`;
        const bodyEl = document.createElement("div");
        sec.appendChild(bodyEl);
        container.appendChild(sec);
        initCollapsibles(container);   // wraps bodyEl in .qb-coll-body before the plugin renders into it
        try { await prov.render(bodyEl); } catch { bodyEl.innerHTML = '<div class="text-muted" style="font-size:12px">Failed to load.</div>'; }
      }
    }

    if (preserveScroll && screen) { screen.scrollTop = keepScroll; requestAnimationFrame(() => { screen.scrollTop = keepScroll; }); }

    document.getElementById("stats-back")?.addEventListener("click", () => { state.statsSessionId = null; loadStats(); });

    // Filters: hide non-matching rows (and their detail rows) in place.
    {
      const applyQH = () => {
        const res = container.querySelector("#qh-fres")?.value || "";
        const typ = container.querySelector("#qh-ftype")?.value || "";
        const q = (container.querySelector("#qh-fq")?.value || "").trim().toLowerCase();
        let shown = 0;
        container.querySelectorAll(".qh-row").forEach((row) => {
          const ok = (!res || row.dataset.res === res) && (!typ || row.dataset.qtype === typ) &&
            (!qhCat || qhCat.matches(row.dataset.path || "")) && (!q || (row.dataset.ans || "").includes(q));
          row.style.display = ok ? "" : "none";
          const d = container.querySelector('[data-qhd="' + row.dataset.qh + '"]');
          if (d && !ok) d.classList.add("hidden");
          if (d) d.style.display = ok ? "" : "none";
          if (ok) shown++;
        });
        const cnt = container.querySelector("#qh-count"); if (cnt) cnt.textContent = String(shown);
      };
      const qhBtn = container.querySelector("#qh-fcat-btn");
      const qhCat = qhBtn ? CategoryButton(qhBtn, { live: true, onChange: () => applyQH() }) : null;
      ["qh-fres", "qh-ftype"].forEach((id) => container.querySelector("#" + id)?.addEventListener("change", applyQH));
      container.querySelector("#qh-fq")?.addEventListener("input", applyQH);
    }
    // Eagerly place the (*) power tick on every tossup row's buzz bar — no
    // click needed to see where the power window ended.
    {
      const rows = [...container.querySelectorAll('.qh-row[data-qtype="tossup"][data-qid]')].filter((r) => r.dataset.qid);
      let idx = 0, workers = 0;
      const pump = () => {
        while (workers < 4 && idx < rows.length) {
          const row = rows[idx++];
          workers++;
          API.get("/api/tossups/" + encodeURIComponent(row.dataset.qid)).then((dd) => {
            const q = dd && dd.tossup;
            const bar = row.isConnected && row.querySelector(".qh-buzzbar");
            if (q && bar && !bar.querySelector(".qh-powermark")) {
              const raw = q.question_sanitized || "";
              const pi = raw.indexOf("(*)");
              if (pi >= 0) {
                const len = raw.replace(/\(\*\)/g, "").length || 1;
                const pm = document.createElement("div");
                pm.className = "qh-powermark";
                pm.style.left = (Math.max(0, Math.min(1, pi / len)) * 100).toFixed(1) + "%";
                pm.title = "Power mark";
                bar.appendChild(pm);
              }
            }
          }).catch(() => {}).finally(() => { workers--; pump(); });
        }
      };
      pump();
    }
    container.querySelectorAll(".qh-row").forEach((row) => {
      row.addEventListener("click", async () => {
        const d = container.querySelector('[data-qhd="' + row.dataset.qh + '"]');
        if (!d) return;
        d.classList.toggle("hidden");
        const chev = row.querySelector(".qh-chev"); if (chev) { chev.textContent = d.classList.contains("hidden") ? "▸" : "▾"; chev.classList.toggle("open", !d.classList.contains("hidden")); }
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
      b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const id = b.dataset.session;
        if (!id) return;
        confirmDialog(`Delete the session "${formatSessionTitle(id)}"? Its stats are removed permanently.`, async () => {
          try { await API.delete("/api/sessions/" + encodeURIComponent(id)); } catch (e) {}
          loadStats(true);
        });
      });
    });
    container.querySelectorAll(".session-row").forEach((row) => {
      row.addEventListener("contextmenu", (ev) => {
        const id = row.dataset.session;
        if (!id || !window.QB?.contextMenu) return;
        ev.preventDefault();
        window.QB.contextMenu(ev.clientX, ev.clientY, [
          { label: "Open session stats", onClick: () => { state.statsSessionId = id; loadStats(); } },
          { sep: true },
          { label: "Delete session…", danger: true, onClick: () => confirmDialog(`Delete the session "${formatSessionTitle(id)}"? Its stats are removed permanently.`, async () => { try { await API.delete("/api/sessions/" + encodeURIComponent(id)); } catch (e) {} loadStats(true); }) },
        ], { title: formatSessionTitle(id) });
      });
    });

    populateGraphFilters(stats);

    // Canvases size from clientWidth, so one drawn inside a collapsed section
    // comes out blank — draw now, and again whenever a section is opened.
    const drawCharts = (initial) => {
      const canvas = document.getElementById("stats-graph");
      if (canvas) drawStatsGraph(canvas, stats);
      const c1 = document.getElementById("graph-diff-accuracy");
      const c2 = document.getElementById("graph-diff-celerity");
      const c3 = document.getElementById("graph-diff-bonus");
      if (c1) drawDiffAccuracy(c1, stats);
      if (c2) drawDiffCelerity(c2, stats);
      if (c3) drawDiffBonus(c3, stats);
      // initial: the breakdown fetched above (unless difficulty squares are
      // still ticked from before); later: re-read with the graph filters.
      if (document.getElementById("graph-session-outcomes")) redrawFilteredGraphs(initial && !_bdDiffs.length ? breakdown : undefined);
    };
    _statsRedraw = () => drawCharts(false);
    if (!container.__collWired) {
      container.__collWired = true;
      container.addEventListener("qb-coll-open", (ev) => {
        if (ev.target.querySelector && ev.target.querySelector("canvas") && _statsRedraw) _statsRedraw();
      });
    }
    setTimeout(() => drawCharts(true), 100);
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

function setHideNotes(on) {
  state.settings.hideNotes = on;
  lsSet("qb-hide-notes", on.toString());
  const a = $("#opt-hide-notes"); if (a) a.checked = on;
  const b = $("#filter-hide-notes"); if (b) b.checked = on;
  if (state.currentQuestion) { try { state.mode === "bonuses" ? renderBonus(state.currentQuestion) : renderTossup(state.currentQuestion); } catch (e) {} }
}
$("#opt-hide-notes")?.addEventListener("change", (e) => setHideNotes(e.target.checked));
$("#filter-hide-notes")?.addEventListener("change", (e) => setHideNotes(e.target.checked));
{ const b = $("#filter-hide-notes"); if (b) b.checked = state.settings.hideNotes; }
{ const a = $("#opt-hide-notes"); if (a) a.checked = state.settings.hideNotes; }
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
  _screenBuilt.add("settings");
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
  const aCust = $("#app-custom-accent"); if (aCust) aCust.value = /^#[0-9a-fA-F]{6}$/.test(state.settings.appCustomAccent || "") ? state.settings.appCustomAccent : "#58a6ff";
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
  { const host = document.getElementById("ext-settings-host"), nb = document.getElementById("set-nav-plugins"), pane = document.getElementById("ovl-extensions"); const has = !!(host && host.children.length); if (nb) nb.hidden = !has; if (pane) pane.hidden = !has; }
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

// ── settings section overlays ──────────────────────────────────────────────
// Everything except APPEARANCE lives behind a section button that opens a
// modal. Esc / backdrop / Close all dismiss (capture-phase Esc so the global
// Back never fires while a modal is up; a pending hotkey rebind keeps its own
// Esc-to-cancel).
function openSettingsOverlay(id) { const o = document.getElementById(id); if (o) o.classList.remove("hidden"); }
function closeSettingsOverlays() {
  let any = false;
  document.querySelectorAll(".settings-ovl:not(.hidden)").forEach((o) => { if (_dbLocked && o.id === "settings-modal") return; o.classList.add("hidden"); any = true; });
  return any;
}
document.addEventListener("click", (e) => {
  const nav = e.target.closest?.(".settings-nav-btn");
  if (nav) { openSettingsOverlay(nav.dataset.ovl); return; }
  if (_dbLocked && e.target.closest?.("#settings-modal")) return;   // the lock keeps it open
  if (e.target.classList?.contains("settings-ovl")) e.target.classList.add("hidden");
  else if (e.target.closest?.(".settings-ovl-close")) e.target.closest(".settings-ovl").classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !state.hotkeyRebinding && closeSettingsOverlays()) { e.preventDefault(); e.stopPropagation(); }
}, true);

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
      // Restart prompt is always the standard popup dialog.
      showUpdateDialog({ version: r.version }, { installed: true });
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
    const bg = await API.get("/api/db-update-status").catch(() => null);
    if (bg && ["checking", "downloading", "ready"].includes(bg.state)) {
      renderDbUpdateStatus(bg); watchDbUpdate();
      btn.disabled = false; btn.textContent = "Check for Updates";
      return;
    }
    const info = await API.get("/api/check-update");
    if (info.error) {
      status.textContent = isNetworkErr(info.error)
        ? friendlyUpdateErr(info.error)
        : "Question updates aren't configured for this build.";
    } else if (!info.configured) {
      status.textContent = "Online updates aren't set up in this build.";
    } else if (info.needsAppUpdate) {
      status.textContent = "A newer question database needs an app update first.";
    } else if (!info.available) {
      status.textContent = "Your question database is up to date.";
    } else {
      const mb = info.latest.size ? ` · ${Math.round(info.latest.size / 1048576)} MB` : "";
      status.innerHTML = `<div style="margin-bottom:8px">Update available: <strong>${escapeHtml(info.latest.name)}</strong>${escapeHtml(mb)}</div>`;
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
  _dbManual = true;
  try {
    const r = await API.post("/api/db-update-start", {});
    if (r && r.state === "error") throw new Error(r.error);
    watchDbUpdate();
  } catch (e) {
    status.textContent = "Update failed: " + friendlyUpdateErr(e.message || e);
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
    if (IS_WEB && /^text-(bigger|smaller|reset)$/.test(action)) continue;   // the browser's zoom on the website
    const binding = getHotkey(action) || "Not Set";
    const isRebinding = state.hotkeyRebinding === action;
    const conflict = (binding !== "Not Set" && !!bindingConflict(action, binding)) || state._hotkeyError === action;
    html += `
      <tr class="hotkey-row${conflict ? " conflict" : ""}" data-action="${action}" style="cursor:pointer">
        <td>${escapeHtml(label)}</td>
        <td><span class="hk-scope">${escapeHtml(hotkeyScopeLabel(action))}</span></td>
        <td class="hotkey-binding">
          ${isRebinding ? '<span class="hotkey-listening">Press key…</span>' : state._hotkeyError === action && state._hotkeyErrorBy ? escapeHtml("Used by " + state._hotkeyErrorBy) : escapeHtml(bindingGlyphs(binding))}
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

// Allow-listed inline HTML: <b> <u> <i> <em> <strong> <sup> survive, every
// other "<…>" is text (questions quote pseudo-tags like "<this author>"), and
// entities are decoded once so "&lt;" shows as "<", never as "&lt;".
function safeInlineHtml(src) {
  return String(src || "").split(/(<\/?(?:b|u|i|em|strong|sup)>)/i)
    .map((part, i) => (i % 2 ? part.toLowerCase() : escapeHtml(decodeEntities(part)))).join("");
}
// A record's readable text for plugins and history: notes / guides handled
// exactly like the practice screen (applyNoteFilter, stripPronunciations).
function questionPlainText(q, kind, part) {
  if (!q) return "";
  const arr = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v || "[]"); } catch { return []; } };
  let plain, html;
  if (kind === "leadin") { plain = q.leadin_sanitized || q.leadin || ""; html = q.leadin; }
  else if (kind === "part") { plain = arr(q.parts_sanitized)[part] || arr(q.parts)[part] || ""; html = arr(q.parts)[part]; }
  else { plain = q.question_sanitized || q.question || ""; html = q.question; }
  let t = applyNoteFilter(plain, html);
  if (state.settings.hidePronunciations) t = stripPronunciations(t);
  return t;
}
// Per-part point values. point_values always has one entry per part (10s when
// the record states none: values_stated = 0, brief §2.3).
function bonusPartValues(b) {
  let parts = [];
  try { parts = Array.isArray(b?.parts) ? b.parts : JSON.parse(b?.parts || "[]"); } catch { parts = []; }
  let vals = [];
  try { vals = Array.isArray(b?.point_values) ? b.point_values : JSON.parse(b?.point_values || "[]"); } catch { vals = []; }
  const n = parts.length;
  const values = Array.from({ length: n }, (_, i) => (Number.isFinite(+vals[i]) && +vals[i] > 0 ? +vals[i] : 10));
  return { values, max: values.reduce((a, v) => a + v, 0), stated: b?.values_stated == null ? vals.length === n : !!b.values_stated, parts: n };
}
function answerLineHtml(raw, sanitizedFallback) {
  raw = applyNoteFilter(raw); sanitizedFallback = applyNoteFilter(sanitizedFallback);
  const src = (raw && String(raw).trim()) ? String(raw) : String(sanitizedFallback || "");
  const html = safeInlineHtml(src);
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
  _screenBuilt.add("player");
  const container = $("#player-container");
  if (!container) return;
  if (needsAccount()) { container.innerHTML = accountPanelHtml("Sign in to earn achievements and see your profile."); return; }
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

    const achData = computeAchievementData(stats, apCounts, apClasses, apData.answer_questions || {});
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

    initCollapsibles(container);
    $("#player-avatar")?.addEventListener("click", showAvatarPicker);

    $("#player-username-input")?.addEventListener("input", (e) => {
      state.username = e.target.value.trim();
      lsSet("qb-username", state.username);
      pushAccountName(state.username);
      const w = container.querySelector(".player-welcome");
      if (w) w.textContent = state.username ? `Welcome, ${state.username}` : "Welcome";
    });
    // Flush immediately when leaving the field, so quitting right after a
    // rename can't lose it to the debounce window.
    $("#player-username-input")?.addEventListener("blur", () => { clearTimeout(_profileSyncTimer); pushProfileSettings(); });

  } catch (e) {
    container.innerHTML = `<div class="text-muted">Failed to load player data</div>`;
  }
}

// MUST stay byte-identical to apFold in src/main/index.js: the server keys
// recorded powers with it and this folds the achievement targets. Diacritics
// used to become SPACES ("Brontë" -> "bront"), so an ASCII-spelled answer
// ("Emily Bronte" -> "emily bronte") never matched its own target. Lowercase
// first, NFD strips combining accents, the map covers what NFD leaves.
function apNorm(s) {
  return String(s == null ? "" : s)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/œ/g, "oe").replace(/ø/g, "o").replace(/ð/g, "d").replace(/þ/g, "th").replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, " ").trim();
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
// Class keys are category PATHS ("Mythology > Scandinavian Myth > …"); a main
// process not restarted yet still sends "cat|sub|alt", read as the same path.
function apKeyPath(key) { return key.indexOf("|") >= 0 ? key.split("|").filter(Boolean).join(" > ") : key; }
function apPathOk(key, lock) {
  if (!lock) return true;
  const p = apKeyPath(key);
  return (Array.isArray(lock) ? lock : [lock]).some((l) => p === l || p.startsWith(l + " > "));
}
function apClassCount(classMap, lock) {
  if (!classMap || !lock) return 0;
  let n = 0;
  for (const key in classMap) if (apPathOk(key, lock)) n += classMap[key];
  return n;
}
function computeAchievementData(stats, apCounts, apClasses, apQuestions) {
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
      // ach.path = a category-tree node (any depth), counted over its subtree.
      const catData = ach.path ? (stats.byPath || {})[ach.path] : (stats.byCategory || {})[ach.category];
      progress = catData ? catData.totalQuestions || 0 : 0;
    } else if (ach.type === "daily") {
      const days = stats.questionsByDate || {};
      progress = Math.max(...Object.values(days).map(d => d.questions || 0), 0);
    } else if (ach.type === "streak") {
      progress = streak;
    } else if (ach.type === "answer_power") {
      // A target entry is one name or an ALIAS GROUP (array). The DB spells
      // Freyja "freya" 14× and "freyja" 12×, Kronos three ways, Heimdall mostly
      // "heimdallr" — apMatch is exact per word, so without groups a figure the
      // player powered under the other spelling was silently lost (Norse sat at
      // 4/10 on a profile with 20 powered Norse questions). A group counts ONCE.
      const groups = (Array.isArray(ach.target) ? ach.target : [ach.target])
        .map((t) => (Array.isArray(t) ? t : [t]).map(apNorm).filter(Boolean)).filter((g) => g.length);
      const lock = ach.path || ach.cat || apAchCategory(ach.id) || null;
      const locked = !!lock;
      const cnt = (ans) => (locked ? apClassCount(apClasses[ans], lock) : (apCounts[ans] || 0));
      const matchesAny = (ans, g) => g.some((norm) => apMatch(ans, norm));
      const answers = Object.keys(apCounts);
      if (ach.distinct === "questions") {
        // "N different <topic> QUESTIONS": distinct question ids across every
        // answer matching any alias, class-locked. Ten powers on Thor are ten
        // questions only if they were ten different questions.
        const haveQ = apQuestions && Object.keys(apQuestions).length > 0;
        if (haveQ) {
          const seen = new Set();
          for (const ans of answers) {
            if (!groups.some((g) => matchesAny(ans, g))) continue;
            const byClass = apQuestions[ans] || {};
            for (const ck in byClass) {
              if (locked && !apPathOk(ck, lock)) continue;
              for (const qid of byClass[ck]) seen.add(qid);
            }
          }
          progress = seen.size;
        } else {
          // Renderer updated before the main process restarted (Cmd+R vs
          // Cmd+Q): no per-question data yet — count powers rather than show 0.
          for (const ans of answers) if (groups.some((g) => matchesAny(ans, g))) progress += cnt(ans);
        }
      } else if (ach.distinct && groups.length > 1) {
        for (const g of groups) {
          if (answers.some((ans) => matchesAny(ans, g) && cnt(ans) > 0)) progress++;
        }
      } else {
        for (const ans of answers) {
          if (groups.some((g) => matchesAny(ans, g))) progress += cnt(ans);
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
    const achData = computeAchievementData(stats, apCounts, apClasses, apData.answer_questions || {});
    const pluginAchs = collectPluginAchievements(stats, apCounts);
    maybeShowAchievementPopups(achData, pluginAchs, _rtAchProfileKey);
  } catch (e) {}
}
function scheduleAchievementCheck() {
  if (_rtAchTimer) clearTimeout(_rtAchTimer);
  // 250ms: enough to coalesce a result + an override double-fire, short
  // enough that the popup lands WITH the result — not on the next tossup.
  _rtAchTimer = setTimeout(refreshAchievementsRealtime, 250);
}

// A plugin's icons win (map, then function — e.g. "Achievement Glyphs" brings
// back the Chinese characters); otherwise the built-in line icons
// (achievement-icons.js); the achievement's own glyph is the last resort.
function resolveAchievementIcon(ach) {
  let icon = null;
  try {
    const map = window.QB && window.QB._achievementIcons;
    if (map && map[ach.id] != null && map[ach.id] !== "") icon = map[ach.id];
    else {
      const fn = window.QB && window.QB._achievementIconFn;
      if (typeof fn === "function") { const r = fn(ach); if (r != null && r !== "") icon = r; }
    }
    if (icon == null && window.QB_ACHIEVEMENT_ICONS) icon = window.QB_ACHIEVEMENT_ICONS.iconFor(ach);
  } catch (e) {}
  return icon == null ? ach.icon : icon;
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
  ["ap-sci-", "Science and Math"],
  ["ap-myth-", "Mythology"],
  ["ap-pop-", "Pop Culture Sports"],
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
    return '<div class="text-muted">No achievements yet</div>';
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

  // Each category is a collapsible group (loadPlayer runs initCollapsibles);
  // the ~130 Answer Powers cards start collapsed, everything else open.
  const group = (key, label, list, collapsed) => {
    if (!list.length) return "";
    const earned = list.filter(([, d]) => d && d.earned).length;
    return `<div class="ach-group" data-coll="ach:${escapeHtml(key)}" data-coll-body="achievements-grid"${collapsed ? ' data-coll-default="collapsed"' : ""}>` +
      `<div class="achievement-category">${escapeHtml(label)}<span class="ach-count">${earned}/${list.length}</span></div>` +
      list.map(([a, d]) => renderAchievementCard(a, d)).join("") + "</div>";
  };

  let html = '<div class="achievement-section-title">Global</div>';
  for (const [type, label] of globalSections) {
    const list = ACHIEVEMENT_LIST.filter(a => a.type === type && achData[a.id]).map((a) => [a, achData[a.id]]);
    html += group("g:" + type, label, list, false);
  }

  const apAchs = ACHIEVEMENT_LIST.filter(a => a.type === "answer_power");
  if (apAchs.length) {
    html += '<div class="achievement-section-title">Answer Powers</div>';
    for (const [prefix, label] of AP_CATEGORY_PREFIXES) {
      html += group("ap:" + prefix, label, apAchs.filter(a => a.id.startsWith(prefix)).map((a) => [a, achData[a.id]]), true);
    }
    const known = new Set(AP_CATEGORY_PREFIXES.map(p => p[0]));
    const other = apAchs.filter(a => ![...known].some(p => a.id.startsWith(p)));
    html += group("ap:other", "Other", other.map((a) => [a, achData[a.id]]), true);
  }

  if (Array.isArray(pluginAchs) && pluginAchs.length) {
    const bySource = {};
    for (const p of pluginAchs) {
      const src = p.source || "Plugin";
      (bySource[src] = bySource[src] || []).push(p);
    }
    html += '<div class="achievement-section-title">Plugins</div>';
    for (const src of Object.keys(bySource)) {
      html += group("plugin:" + src, src, bySource[src].map((p) => [p, { earned: p.earned, progress: p.progress }]), false);
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
  { id:"cat3333_History", name:"Keskil Khan", desc:"3333 in History", type:"cat_specific", threshold:3333, icon:"汗", category:"History", path:"History" },
  { id:"cat3333_Literature", name:"Keskil Collector", desc:"3333 in Literature", type:"cat_specific", threshold:3333, icon:"文", category:"Literature", path:"Literature" },
  { id:"cat3333_Science", name:"Keskil Chemist", desc:"3333 in Science and Math", type:"cat_specific", threshold:3333, icon:"科", category:"Science and Math", path:"Science and Math" },
  { id:"cat3333_Fine Arts", name:"Keskil Craftsmen", desc:"3333 in Fine Arts", type:"cat_specific", threshold:3333, icon:"芸", category:"Fine Arts", path:"Fine Arts" },
  { id:"cat3333_Religion", name:"Keskil Kultist", desc:"3333 in Theology", type:"cat_specific", threshold:3333, icon:"宗", category:"Theology", path:"Theology" },
  { id:"cat3333_Mythology", name:"Keskil Legend", desc:"3333 in Mythology", type:"cat_specific", threshold:3333, icon:"神", category:"Mythology", path:"Mythology" },
  { id:"cat3333_Philosophy", name:"Keskil Questioner", desc:"3333 in Philosophy", type:"cat_specific", threshold:3333, icon:"哲", category:"Philosophy", path:"Philosophy" },
  { id:"cat3333_Current Events", name:"Keskil King", desc:"3333 in Current Events", type:"cat_specific", threshold:3333, icon:"王", category:"Current Events", path:"Current Events" },
  { id:"cat3333_Geography", name:"Keskil Cartographer", desc:"3333 in Geography", type:"cat_specific", threshold:3333, icon:"地", category:"Geography", path:"Geography" },
  { id:"cat3333_Math", name:"Keskil Calculator", desc:"3333 in Math", type:"cat_specific", threshold:3333, icon:"数", category:"Science and Math", path:"Science and Math > Math" },
  { id:"cat3333_Computer Science", name:"Keskil claude user", desc:"3333 in Computer Science", type:"cat_specific", threshold:3333, icon:"算", category:"Science and Math", path:"Science and Math > Science > Computer Science" },
  { id:"cat3333_Trash", name:"Keskil's Opps", desc:"3333 in Pop Culture & Sports (Trash)", type:"cat_specific", threshold:3333, icon:"屑", category:"Pop Culture Sports", path:"Pop Culture Sports" },
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
  {id:"ap-lit-twelfth",name:"Twelfth Night",desc:"Power on 12 different Shakespeare works",type:"answer_power",threshold:12,target:["hamlet","macbeth","othello","king lear","romeo and juliet","the tempest","a midsummer night's dream","julius caesar","antony and cleopatra","richard iii",["henry v","henry iv"],"much ado about nothing","twelfth night","the merchant of venice","as you like it","the taming of the shrew","the winter's tale","coriolanus","titus andronicus"],distinct:true,icon:"劇"},
  {id:"ap-hist-wars",name:"Wars of the Three Meanings",desc:"Power on War of the Three Henries, War of the Triple Alliance, and Punic Wars",type:"answer_power",threshold:3,target:["war of the three henries","war of the triple alliance","punic wars"],distinct:true,icon:"戦"},
  {id:"ap-hist-teto",name:"Kasane Teto",desc:"Power on a Tito or Yugoslavia question",type:"answer_power",threshold:1,target:["tito","yugoslavia"],icon:"統"},
  {id:"ap-hist-memento",name:"Memento Mori",desc:"Power on a Goths, Vandals, or Huns question",type:"answer_power",threshold:1,target:["goths","vandals","huns"],icon:"蛮"},
  {id:"ap-hist-alexander",name:"Conqueror of the Known World",desc:"Power on 9 Alexander the Great questions",type:"answer_power",threshold:9,target:"alexander the great",icon:"帝"},
  {id:"ap-hist-grant",name:"Unconditional Surrender Grant",desc:"Power on a Ulysses S. Grant question",type:"answer_power",threshold:1,target:"ulysses s. grant",icon:"将"},
  {id:"ap-hist-luther",name:"Hater of German Serfs",desc:"Power on a Martin Luther question",type:"answer_power",threshold:1,target:"martin luther",icon:"改"},
  {id:"ap-hist-capet",name:"House of Capet",desc:"Power on 16 questions answered Louis",type:"answer_power",threshold:16,target:"louis",icon:"冠"},
  {id:"ap-hist-union",name:"Union Jack",desc:"Power on England, Scotland, Wales, Ireland, and Britain",type:"answer_power",threshold:5,target:["england","scotland","wales","ireland",["britain","great britain","united kingdom"]],distinct:true,icon:"連"},
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
  {id:"ap-geo-stans",name:"Stan(d) Up Comedy",desc:"Power on 5 different -stan countries",type:"answer_power",threshold:5,target:["kazakhstan","uzbekistan","turkmenistan","kyrgyzstan","tajikistan","afghanistan","pakistan"],distinct:true,icon:"邦"},
  {id:"ap-geo-seas",name:"Seven Seas",desc:"Power on 7 oceans and major seas",type:"answer_power",threshold:7,target:["pacific","atlantic","indian","arctic","southern","mediterranean","caribbean","baltic","black","red","caspian","north sea"],distinct:true,icon:"海"},
  {id:"ap-sci-alloys",name:"Too Complicated for Simple Wikipedia",desc:"Power on an alloys question",type:"answer_power",threshold:1,target:"alloys",icon:"合"},
  {id:"ap-sci-mito",name:"Powerhouse of the Cell",desc:"Power on a mitochondria question",type:"answer_power",threshold:1,target:"mitochondria",icon:"粒"},
  {id:"ap-sci-blackhole",name:"Hail Mary",desc:"Power on a black hole question",type:"answer_power",threshold:1,target:"black hole",icon:"孔"},
  {id:"ap-sci-nobel",name:"Nobel Intentions",desc:"Power on a Nobel Prize-winning discovery",type:"answer_power",threshold:1,target:["nobel prize","nobel","penicillin","radioactivity","insulin","transistor","green fluorescent protein","crispr","graphene","prions","superconductivity","photoelectric effect","cosmic microwave background","higgs boson","gravitational waves","nuclear fission","telomeres","ribosome","polymerase chain reaction","quasicrystals","laser"],icon:"賞"},
  {id:"ap-sci-dna",name:"Double Helix",desc:"Power on a DNA question",type:"answer_power",threshold:1,target:"dna",icon:"螺"},
  {id:"ap-sci-gut",name:"Gut Instinct",desc:"Power on a digestive system or enzyme question",type:"answer_power",threshold:1,target:["digestive","enzyme","stomach","intestine"],icon:"腸"},
  {id:"ap-sci-ideal",name:"Ideal Gas",desc:"Power on a thermodynamics question",type:"answer_power",threshold:1,target:"thermodynamics",icon:"熱"},
  {id:"ap-sci-em",name:"Electromagnetism",desc:"Power on an electromagnetism question",type:"answer_power",threshold:1,target:["electromagnetism","electromagnetic","maxwell's equations","faraday's law","gauss's law","ampere's law","coulomb's law","lorentz force","magnetic field","electric field","magnetism","inductance"],icon:"磁"},
  {id:"ap-sci-schrodinger",name:"Schrödinger's Cat",desc:"Power on a quantum mechanics question",type:"answer_power",threshold:1,target:"quantum",icon:"量"},
  {id:"ap-sci-lagrangian",name:"Lagrangian",desc:"Power on a classical mechanics question",type:"answer_power",threshold:1,target:"lagrangian",icon:"力"},
  {id:"ap-sci-selection",name:"Law of the Jungle",desc:"Power on a natural selection question",type:"answer_power",threshold:1,target:"natural selection",icon:"進"},
  {id:"ap-sci-water",name:"Universal Solvent",desc:"Power on a water question",type:"answer_power",threshold:1,target:"water",icon:"水"},
  {id:"ap-sci-standard",name:"Standard Model",desc:"Power on a particle physics question",type:"answer_power",threshold:1,target:["standard model","particle physics"],icon:"粒"},
  {id:"ap-sci-speciation",name:"Speciation",desc:"Power on an evolution or speciation question",type:"answer_power",threshold:1,target:"speciation",icon:"種"},
  {id:"ap-sci-chloroplast",name:"Chloroplast",desc:"Power on a photosynthesis question",type:"answer_power",threshold:1,target:"photosynthesis",icon:"葉"},
  {id:"ap-sci-mendel",name:"Mendelian",desc:"Power on a genetics question",type:"answer_power",threshold:1,target:["genetics","mendel","gregor mendel","chromosomes","chromosome","alleles","allele","meiosis","genome","dna","genes","gene"],icon:"遺"},
  {id:"ap-sci-aero",name:"Curious",desc:"Power on an aerospace or aerodynamics question",type:"answer_power",threshold:1,target:["aerospace","aerodynamics","airfoil","bernoulli","lift","drag","reynolds number","boundary layer","navier stokes","turbulence","mach","supersonic","airplanes","jet engine","flight"],icon:"翼"},
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
  {id:"ap-sci-periodic",name:"Periodic Table",desc:"Power on 7 different element questions",type:"answer_power",threshold:7,target:["hydrogen","helium","lithium","beryllium","boron","carbon","nitrogen","oxygen","fluorine","neon","sodium","magnesium",["aluminium","aluminum"],"silicon","phosphorus",["sulfur","sulphur"],"chlorine","argon","potassium","calcium","iron","copper","zinc","silver","gold","mercury","lead","uranium","platinum","titanium","nickel","cobalt","manganese","chromium","vanadium","bromine","iodine","strontium","barium","radium","thorium"],distinct:true,icon:"元"},
  {id:"ap-sci-spectroscopy",name:"Spectroscopy",desc:"Power on NMR, IR, UV-Vis, mass spec, and X-ray crystallography",type:"answer_power",threshold:5,target:["nmr","ir","uv-vis","mass spectrometry","x-ray crystallography"],distinct:true,icon:"光"},
  {id:"ap-sci-solvay",name:"Solvay Conference",desc:"Power on Einstein, Bohr, Heisenberg, Dirac, Pauli, Curie, and Schrödinger",type:"answer_power",threshold:7,target:["einstein","bohr","heisenberg","dirac","pauli","curie","schrödinger"],distinct:true,icon:"学"},
  {id:"ap-sci-spacerace",name:"Space Race",desc:"Power on 5 different space missions or observatories",type:"answer_power",threshold:5,target:["apollo","gemini","mercury","soyuz","space shuttle","hubble","voyager","international space station","cassini","kepler","james webb","new horizons","curiosity","sputnik","vostok"],distinct:true,icon:"宙"},
  {id:"ap-myth-lightning",name:"God of Lightning",desc:"Power on Thor, Zeus, and Indra",type:"answer_power",threshold:3,target:["thor","zeus","indra"],distinct:true,icon:"雷"},
  {id:"ap-myth-freaky",name:"Freaky Deaky",desc:"Power on an Oedipus Rex question",type:"answer_power",threshold:1,target:"oedipus",icon:"眼"},
  {id:"ap-myth-underworld",name:"Underworld",desc:"Power on Anubis, Hades, and Osiris",type:"answer_power",threshold:3,target:["anubis","hades","osiris"],distinct:true,icon:"冥"},
  {id:"ap-myth-monkey",name:"Great Sage Equal to Heaven",desc:"Power on a Monkey King or Journey to the West question",type:"answer_power",threshold:1,target:["monkey king","journey to the west","sun wukong"],icon:"猿"},
  {id:"ap-myth-trickster",name:"Trickster God",desc:"Power on Loki and Coyote",type:"answer_power",threshold:2,target:["loki","coyote"],distinct:true,icon:"狡"},
  {id:"ap-myth-gilgamesh",name:"Uuudreeeeeeeaaaa",desc:"Power on a Gilgamesh question",type:"answer_power",threshold:1,target:"gilgamesh",icon:"王"},
  {id:"ap-myth-ragnarok",name:"Ragnarök",desc:"Power on a Norse apocalypse question",type:"answer_power",threshold:1,target:"ragnarök",icon:"滅"},
  {id:"ap-myth-shinto",name:"Shinto Shrine",desc:"Power on a Japanese mythology question",type:"answer_power",threshold:1,target:["japanese myth","amaterasu","susanoo","izanagi","izanami","shinto","kami","raijin","hachiman","jimmu"],icon:"社"},
  {id:"ap-myth-morrigan",name:"The Morrigan",desc:"Power on a Celtic mythology question",type:"answer_power",threshold:1,target:["celtic","morrigan","cu chulainn","dagda","lugh","fionn","finn maccool","danu","fomorians","oisin"],icon:"巫"},
  {id:"ap-myth-genesis",name:"Genesis",desc:"Power on a creation myth question",type:"answer_power",threshold:1,target:"creation myth",icon:"創"},
  {id:"ap-myth-quetzal",name:"Feathered Serpent",desc:"Power on a Quetzalcoatl question",type:"answer_power",threshold:1,target:"quetzalcoatl",icon:"蛇"},
  {id:"ap-myth-labours",name:"The Labours",desc:"Power on a Heracles or Hercules question",type:"answer_power",threshold:1,target:"heracles",icon:"獅"},
  {id:"ap-myth-theogony",name:"Theogony",desc:"Power on 12 different Greek deities or Titans",type:"answer_power",threshold:12,target:["zeus","hera","poseidon","demeter",["athena","athene"],"apollo","artemis","ares",["hephaestus","hephaistos","vulcan"],"aphrodite","hermes",["dionysus","dionysos","bacchus"],["hades","pluto"],"hestia",["persephone","proserpina"],["cronus","kronos","cronos"],"rhea",["gaia","gaea"],["uranus","ouranos"],"eros","pan","helios","selene","eos","nike","iris","nemesis","hecate","asclepius","hebe","nyx","hypnos","thanatos","morpheus","tyche","eris","oceanus","tethys","hyperion","theia","coeus","phoebe","mnemosyne","themis","crius","iapetus","atlas","prometheus","epimetheus"],distinct:true,icon:"神"},
  {id:"ap-myth-iliad",name:"Iliad Heroes",desc:"Power on Achilles, Hector, Agamemnon, Odysseus, Ajax, Diomedes, and Patroclus",type:"answer_power",threshold:7,target:["achilles","hector","agamemnon","odysseus","ajax","diomedes","patroclus"],distinct:true,icon:"英"},
  {id:"ap-myth-allfather",name:"Allfather's Blessing",desc:"Power on 10 different Norse mythology questions",type:"answer_power",threshold:10,target:["odin","thor","loki","freyja","freya","freyr","baldr","balder","baldur","tyr","heimdall","heimdallr","frigg","frigga","hel","jörmungandr","midgard serpent","fenrir","fenris","yggdrasil","valhalla","ragnarök","valkyrie","valkyries","njord","njordr","skadi","mimir","norns","mjolnir","sleipnir","gungnir","bifrost","asgard","aesir","vanir","idunn","idun","bragi","sif","huginn","muninn","draupnir","gjallarhorn","kvasir","ymir","audhumla","nidhogg","norse","norse mythology","jotunheim","midgard","gleipnir","fafnir","sigurd","brunhild","brynhildr","volsung","nine worlds","einherjar"],distinct:"questions",icon:"北"},
  {id:"ap-pop-kanye",name:"I Guess We'll Never Know",desc:"Power on a Kanye West question",type:"answer_power",threshold:1,target:"kanye",icon:"韻"},
  {id:"ap-pop-mj",name:"King of Pop",desc:"Power on a Michael Jackson question",type:"answer_power",threshold:1,target:"michael jackson",icon:"舞"},
  {id:"ap-pop-starwars",name:"Skywalker",desc:"Power on a Star Wars question",type:"answer_power",threshold:1,target:"star wars",icon:"星"},
  {id:"ap-pop-minecraft",name:"Master of the Craft",desc:"Power on a Minecraft question",type:"answer_power",threshold:1,target:"minecraft",icon:"塊"},
  {id:"ap-pop-nba",name:"Point Guard",desc:"Power on an NBA question",type:"answer_power",threshold:1,target:"nba",icon:"球"},
  {id:"ap-pop-lebron",name:"LeSunshine",desc:"Power on a LeBron James question",type:"answer_power",threshold:1,target:"lebron james",icon:"覇"},
  {id:"ap-pop-zelda",name:"Hyrule",desc:"Power on a Legend of Zelda question",type:"answer_power",threshold:1,target:"zelda",icon:"剣"},
  {id:"ap-pop-fortnite",name:"Battle Royale",desc:"Power on a Fortnite or battle royale question",type:"answer_power",threshold:1,target:["fortnite","battle royale"],icon:"闘"},
  {id:"ap-pop-harry",name:"Wizarding World",desc:"Power on a Harry Potter question",type:"answer_power",threshold:1,target:["harry potter","hogwarts","hermione","dumbledore","quidditch","rowling"],icon:"杖"},
  {id:"ap-pop-lol",name:"Get a Life",desc:"Power on a League of Legends question",type:"answer_power",threshold:1,target:"league of legends",icon:"戯"},
  {id:"ap-pop-nfl",name:"Touchdown",desc:"Power on an NFL question",type:"answer_power",threshold:1,target:["nfl","super bowl","tom brady","patrick mahomes","new england patriots","dallas cowboys","green bay packers","kansas city chiefs","peyton manning","philadelphia eagles","bill belichick","quarterback"],icon:"突"},
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
  const wrap = document.getElementById("db-plugtools"), menu = document.getElementById("db-plugtools-menu");
  if (!wrap || !menu) return;
  const provs = window.QB?.getStarredProviders?.() || [];
  wrap.hidden = !provs.length;
  menu.innerHTML = provs.map((p) => `<button type="button" class="pop-item" role="menuitem" data-prov="${escapeHtml(p.id)}">${ic("puzzle", 15)}<span>${escapeHtml(String(p.title || p.id).replace(/^STARRED\s+/i, ""))}</span></button>`).join("");
  syncDbTabActive();
}

// Re-mark the active Database tab after the provider tabs are rebuilt, without
// re-rendering the tab body (a Back entry keeps its filters/results).
function syncDbTabActive() {
  const tab = state.dbTab || "search";
  document.querySelectorAll(".db-tabs .db-tab[data-tab]").forEach((x) => { x.classList.toggle("active", x.dataset.tab === tab); x.setAttribute("aria-selected", String(x.dataset.tab === tab)); });
  const pb = document.getElementById("db-plugtools-btn");
  if (pb) pb.classList.toggle("active", tab.startsWith("prov:"));
}

function loadDatabase() {
  _screenBuilt.add("database");
  // A fresh entry starts a new search history — reviveScreen (the Back path)
  // does not call this, so stepping back through searches still works.
  _dbSearchStack = [];
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
    document.querySelectorAll(".db-tabs .db-tab[data-tab]").forEach((t) => {
      t.addEventListener("click", () => {
        _dbTabFrom = null; // an explicit tab pick replaces any remembered origin
        state.dbTab = t.dataset.tab;
        syncDbTabActive();
        renderDbTab();
      });
    });
    const pb = document.getElementById("db-plugtools-btn"), pm = document.getElementById("db-plugtools-menu");
    pb?.addEventListener("click", (e) => { e.stopPropagation(); const open = pm.hidden; closeAllPops(); pm.hidden = !open; pb.setAttribute("aria-expanded", String(open)); });
    pm?.addEventListener("click", (e) => {
      const it = e.target.closest("[data-prov]"); if (!it) return;
      pm.hidden = true; pb.setAttribute("aria-expanded", "false");
      _dbTabFrom = null;
      state.dbTab = "prov:" + it.dataset.prov;
      syncDbTabActive();
      renderDbTab();
    });
  }
  // Mark the tab strip too — rendering the body alone left every tab
  // unselected when you returned to the Database after leaving it.
  syncDbTabActive();
  renderDbTab();
}

function renderDbTab() {
  const tab = state.dbTab || "search";
  if (IS_WEB) window.qbWebPathSync();   // /search, /sets, /frequency, /starred
  // another tab starts at its top (Frequency used to open scrolled down to where Search was)
  if (renderDbTab._last !== tab) { const sc = document.getElementById("db-content"); if (sc) sc.scrollTop = 0; }
  renderDbTab._last = tab;
  if (tab.startsWith("prov:")) return renderProviderTab(tab.slice(5));
  if (tab === "search") renderSearchTab();
  else if (tab === "sets") renderSetsTab();
  else if (tab === "frequency") renderFrequencyTab();
  else renderStarredTab();
}

async function renderProviderTab(id) {
  const c = document.getElementById("db-content"); if (!c) return;
  const p = (window.QB?.getStarredProviders?.() || []).find((x) => x.id === id);
  c.innerHTML = '<div class="db-page"><div class="search-results" id="db-results"></div></div>';
  const host = document.getElementById("db-results");
  if (!p) { host.innerHTML = '<div class="db-empty">This section’s plugin is disabled.</div>'; return; }
  try { await p.render(host); }
  catch { host.innerHTML = '<div class="db-empty">Failed to load.</div>'; }
}

let _dbTimer = null;
const DIFFICULTY_NAMES = ["Unrated", "Middle School", "Easy HS", "Regular HS", "Hard HS", "National HS", "Easy College", "Medium College", "Regionals College", "Nationals College", "Open"];
function renderSearchTab() {
  const c = document.getElementById("db-content"); if (!c) return;
  setTimeout(() => tipInto(c.querySelector(".db-page"), "search-tags", null, c.querySelector("#db-searchbar")), 0);
  const q = _dbq;
  const diffs = DIFFICULTY_NAMES.map((name, i) =>
    `<label title="${escapeHtml(DIFF_FULL[i] || name)}"><input type="checkbox" class="db-diff-cb" value="${i}"${q.diffs.includes(String(i)) ? " checked" : ""}><span>${i}</span></label>`).join("");
  const seg = [["all", "All"], ["tossup", "Tossups"], ["bonus", "Bonuses"]].map(([v, l]) => `<button type="button" data-qtype="${v}" aria-pressed="${q.qtype === v}">${l}</button>`).join("");
  const opt = (v, l, cur) => `<option value="${v}"${cur === v ? " selected" : ""}>${l}</option>`;
  c.innerHTML =
    '<div class="db-page db-search">' +
      '<div id="db-searchbar" class="db-searchbar"></div>' +
      '<div class="qrow">' +
        `<button type="button" class="btn" id="db-cat-btn">Categories <span class="accent-val" id="db-cat-btn-val">${escapeHtml(dbUnitsSummary())}</span>${ic("down", 14)}</button>` +
        `<div class="diff-toggles" id="db-diffs" role="group" aria-label="Difficulty"><span class="dt-lbl">Difficulty</span>${diffs}</div>` +
        `<div class="pop-wrap"><button type="button" class="btn" id="db-years-btn" aria-expanded="false" aria-controls="db-years-pop">Years <span class="accent-val num" id="db-years-val">${escapeHtml(dbYearsLabel())}</span>${ic("down", 14)}</button>` +
          `<div class="pop left years-pop" id="db-years-pop" hidden><form id="db-years-form"><div class="yrow"><label class="ifield"><span>From</span><input id="db-year-from" inputmode="numeric" autocomplete="off" value="${q.yearMin || 2000}" aria-label="From year"></label><label class="ifield"><span>To</span><input id="db-year-to" inputmode="numeric" autocomplete="off" value="${q.yearMax || 2026}" aria-label="To year"></label></div>` +
          `<div class="yrow"><button type="button" class="btn btn-sm" id="db-years-any" style="flex:1">Any year</button><button type="submit" class="btn btn-sm btn-primary" style="flex:1">Apply</button></div></form></div></div>` +
        '<span class="spacer"></span>' +
        `<button type="button" class="btn" id="db-more-toggle" aria-expanded="${_dbMoreOpen}" aria-controls="db-more">${ic("sliders", 16)}Filters<span class="count-badge num db-more-count" id="db-more-count"></span></button>` +
      "</div>" +
      `<section class="drawer-panel" id="db-more"${_dbMoreOpen ? "" : " hidden"} aria-label="More filters">` +
        `<label class="f"><span>Match</span><select id="db-match" title="How the words must match">${opt("phrase", "Exact phrase", q.match)}${opt("all", "All words", q.match)}${opt("any", "Any word", q.match)}</select></label>` +
        `<label class="f"><span>Exclude words</span><input type="text" id="db-exclude" class="mode-input" autocomplete="off" value="${escapeHtml(q.exclude)}" aria-label="Exclude words"></label>` +
        '<label class="f"><span>Set</span><select id="db-set-filter"><option value="">All sets</option></select></label>' +
        '<label class="f"><span>Packet</span><select id="db-packet-filter" disabled><option value="">All packets</option></select></label>' +
        '<div class="checks">' +
          `<label class="checkbox-row"><input type="checkbox" id="db-standard"${q.standard ? " checked" : ""}> Standard sets only</label>` +
          `<label class="checkbox-row" id="db-powermark-lbl" title="Tossups that have a power mark (*)"><input type="checkbox" id="db-powermark"${q.powermark ? " checked" : ""}> Powermarked tossups</label>` +
          `<label class="checkbox-row"><input type="checkbox" id="db-starred"${q.starred ? " checked" : ""}> Starred only</label>` +
          `<label class="checkbox-row" title="Match word beginnings: symphon matches symphony, symphonies"><input type="checkbox" id="db-prefix"${q.prefix ? " checked" : ""}> Word starts</label>` +
          `<label class="checkbox-row"><input type="checkbox" id="db-hide-ans"${q.hideAns ? " checked" : ""}> Hide answers</label>` +
        "</div>" +
      "</section>" +
      `<div class="rhead" id="db-rhead"><span class="total num" id="db-total"></span><select id="db-sort" title="Result order">${opt("relevance", "Best match", q.sort)}${opt("newest", "Newest first", q.sort)}${opt("oldest", "Oldest first", q.sort)}${opt("easiest", "Easiest first", q.sort)}${opt("hardest", "Hardest first", q.sort)}</select><span class="spacer"></span><span id="db-pager-top"></span></div>` +
      '<div class="results search-results" id="db-results"></div>' +
      '<div class="rfoot" id="db-pager-bottom"></div>' +
    "</div>";

  _searchTagField = TagField({
    host: document.getElementById("db-searchbar"), icon: "search", ariaLabel: "Search questions", chips: q.tags, textValue: q.text,
    placeholder: (chips) => (chips.length ? "Add words" : "Search questions"),
    rightHtml: `<div class="sbar-right"><div class="seg" id="db-qtype-seg" role="group" aria-label="Question type">${seg}</div><select id="db-search-type" title="All text also matches category, subcategory and set names">${opt("all", "Question & answer", q.field)}${opt("question", "Question only", q.field)}${opt("answer", "Answer only", q.field)}</select></div>`,
    onChange: (chips) => { _dbq.tags = chips; dbSearchSoon(true); },
    onText: (t) => { _dbq.text = t; dbSearchSoon(true); },
  });
  _searchTagField.input.id = "db-search-input";
  _searchTagField.input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(_dbTimer); performDbSearch({ page: 0 }); } });

  const g = (id) => document.getElementById(id);
  _dbPacketsFor = null;
  const syncPm = () => { const off = _dbq.qtype === "bonus"; const pm = g("db-powermark"), lbl = g("db-powermark-lbl"); if (pm) pm.disabled = off; if (lbl) lbl.classList.toggle("is-disabled", off); };
  syncPm();
  g("db-qtype-seg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-qtype]"); if (!b) return;
    _dbq.qtype = b.dataset.qtype;
    g("db-qtype-seg").querySelectorAll("[data-qtype]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    syncPm(); dbSearchSoon(true);
  });
  g("db-search-type").addEventListener("change", (e) => { _dbq.field = e.target.value; dbSearchSoon(true); });
  g("db-cat-btn").addEventListener("click", openSearchCategories);
  g("db-diffs").addEventListener("change", () => { _dbq.diffs = [...document.querySelectorAll(".db-diff-cb:checked")].map((cb) => cb.value); dbSearchSoon(true); });
  const yb = g("db-years-btn"), yp = g("db-years-pop");
  yb.addEventListener("click", (e) => { e.stopPropagation(); const open = yp.hidden; closeAllPops(); yp.hidden = !open; yb.setAttribute("aria-expanded", String(open)); if (open) { const f = g("db-year-from"); f && f.focus(); f && f.select(); } });
  g("db-years-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const a = parseInt(g("db-year-from").value, 10), b = parseInt(g("db-year-to").value, 10);
    if (a && b) { _dbq.yearMin = Math.max(2000, Math.min(a, b)); _dbq.yearMax = Math.min(2026, Math.max(a, b)); if (_dbq.yearMin <= 2000 && _dbq.yearMax >= 2026) { _dbq.yearMin = _dbq.yearMax = null; } }
    yp.hidden = true; yb.setAttribute("aria-expanded", "false");
    g("db-years-val").textContent = dbYearsLabel();
    performDbSearch({ page: 0 });
  });
  g("db-years-any").addEventListener("click", () => { _dbq.yearMin = _dbq.yearMax = null; yp.hidden = true; g("db-years-val").textContent = dbYearsLabel(); performDbSearch({ page: 0 }); });
  const more = g("db-more"), mt = g("db-more-toggle");
  mt.addEventListener("click", () => {
    _dbMoreOpen = more.hidden;
    more.hidden = !_dbMoreOpen; mt.setAttribute("aria-expanded", String(_dbMoreOpen));
    // plain localStorage: lsSet would schedule a profile push for a UI toggle
    try { localStorage.setItem("qb-db-more", _dbMoreOpen ? "1" : "0"); } catch (e) {}
  });
  g("db-match").addEventListener("change", (e) => { _dbq.match = e.target.value; dbSearchSoon(true); });
  g("db-exclude").addEventListener("input", (e) => { _dbq.exclude = e.target.value; dbSearchSoon(true); });
  g("db-set-filter").addEventListener("change", (e) => { _dbq.set = e.target.value; _dbq.packet = ""; dbSearchSoon(true); });
  g("db-packet-filter").addEventListener("change", (e) => { _dbq.packet = e.target.value; dbSearchSoon(true); });
  [["db-standard", "standard"], ["db-powermark", "powermark"], ["db-starred", "starred"], ["db-prefix", "prefix"]].forEach(([id, key]) => g(id).addEventListener("change", (e) => { _dbq[key] = e.target.checked; dbSearchSoon(true); }));
  // Hiding answers is instant — a CSS cover over each answer, no re-query.
  g("db-hide-ans").addEventListener("change", (e) => {
    _dbq.hideAns = e.target.checked;
    g("db-results")?.classList.toggle("db-hide-ans", e.target.checked);
    document.querySelectorAll("#db-results .ans-toggle.shown").forEach((t) => t.classList.remove("shown"));
    dbMoreCount();
  });
  g("db-sort").addEventListener("change", (e) => { _dbq.sort = e.target.value; dbSearchSoon(true); });
  getDbSets().then((s) => {
    const sel = g("db-set-filter");
    if (!sel || sel.options.length > 1) return;   // two quick renders must not append twice
    const seen = new Set();
    sel.insertAdjacentHTML("beforeend", s.filter((x) => x.name && !seen.has(x.name) && seen.add(x.name))
      .map((x) => '<option value="' + escapeHtml(x.name) + '">' + escapeHtml(x.name) + "</option>").join(""));
    if (_dbq.set) sel.value = _dbq.set;
    _syncSel(sel);
  });
  wireDbPagers(c.querySelector(".db-page"), (p) => performDbSearch({ page: p }));
  dbMoreCount();
  performDbSearch(_dbPage ? { page: _dbPage } : undefined);
}

// Google-style highlighting: wrap search-term matches in <mark> inside the
// results container. DOM-walks text nodes so existing markup stays intact.
function highlightTerms(container, terms, opts) {
  const clean = (terms || []).map((t) => String(t || "").trim()).filter((t) => t.length >= 2);
  if (!clean.length || !container) return;
  const prefix = !!(opts && opts.prefix);   // "Word starts": highlight the whole word
  const re = new RegExp("(" + clean.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")" + (prefix ? "[\\p{L}\\p{N}]*" : ""), prefix ? "giu" : "gi");
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
      re.lastIndex = 0;   // a /g regex carries lastIndex between .test() calls and skipped nodes
      if (!re.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (!p || p.closest("mark, script, style, .pill, .qb-star, .star-btn, .db-count, .db-pager, .qtag, .badge, .qcard-kind, .qmeta-row")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    let last = 0;
    const text = node.nodeValue;
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const mk = document.createElement("mark");
      mk.className = "db-hl";
      mk.textContent = m[0];
      frag.appendChild(mk);
      last = m.index + m[0].length;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });
}

// Indeterminate loading bar used wherever a query/scan takes noticeable time.
// Keep the two thumbs of a dual range apart: without this either handle can be
// dragged past the other and they stack on one end, which reads as a single
// broken slider.
function clampDualRange(lo, hi) {
  if (!lo || !hi) return;
  const apply = (moved) => {
    let a = parseFloat(lo.value), b = parseFloat(hi.value);
    if (a >= b) {
      if (moved === lo) { a = Math.min(a, b - (parseFloat(lo.step) || 1)); lo.value = String(Math.max(parseFloat(lo.min), a)); }
      else { b = Math.max(b, a + (parseFloat(hi.step) || 1)); hi.value = String(Math.min(parseFloat(hi.max), b)); }
    }
  };
  lo.addEventListener("input", () => apply(lo));
  hi.addEventListener("input", () => apply(hi));
}

function loadingBarHtml(label) {
  return `<div class="qb-loading"><div class="qb-loadbar"><div class="qb-loadbar-fill"></div></div><span>${escapeHtml(label || "Loading…")}</span></div>`;
}

let _dbPage = 0;
const DB_PAGE_SIZE = 25;
// Database → Search query (the tab re-renders from it; Back restores it).
function dbQueryDefaults() {
  return { text: "", field: "all", qtype: "all", match: "phrase", prefix: false, exclude: "", hideAns: false, tags: [], diffs: [], yearMin: null, yearMax: null, set: "", packet: "", sort: "relevance", standard: false, powermark: false, starred: false };
}
const _dbq = dbQueryDefaults();
let _dbMoreOpen = (() => { try { return localStorage.getItem("qb-db-more") === "1"; } catch (e) { return false; } })();
let _searchTagField = null;
function dbSearchSoon(resetPage) {
  clearTimeout(_dbTimer);
  _dbTimer = setTimeout(() => performDbSearch(resetPage ? { page: 0 } : undefined), 300);
}
function dbYearsLabel() {
  const a = _dbq.yearMin, b = _dbq.yearMax;
  if (!a && !b) return "Any";
  return (a || 2000) + "\u2013" + (b || 2026);
}
function dbMoreCount() {
  const q = _dbq;
  const n = [q.set, q.packet, String(q.exclude || "").trim(), q.standard, q.powermark && q.qtype !== "bonus", q.starred, q.prefix, q.hideAns, q.match !== "phrase"].filter(Boolean).length;
  const el = document.getElementById("db-more-count"); if (el) el.textContent = n ? String(n) : "";
}
// One open popover at a time; a click anywhere else closes it.
function closeAllPops(except) {
  document.querySelectorAll(".pop:not([hidden])").forEach((p) => {
    if (except && (p === except || p.contains(except))) return;
    p.hidden = true;
    const w = p.closest(".pop-wrap"); const b = w && w.querySelector("[aria-expanded]"); if (b) b.setAttribute("aria-expanded", "false");
  });
}
document.addEventListener("mousedown", (e) => {
  if (e.target.closest?.(".pop, .pop-wrap > button")) return;
  closeAllPops();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = document.querySelector(".pop:not([hidden])");
  if (open) { e.preventDefault(); e.stopPropagation(); closeAllPops(); }
}, true);

// ── pager: ‹ [scrollable page strip] [Page n of N ▾] › ──
function dbPagerHtml(where, page, pages) {
  if (pages <= 1) return "";
  const lo = Math.max(0, page - 60), hi = Math.min(pages - 1, page + 60);
  let strip = "";
  const d4 = (i) => (i + 1 >= 1000 ? ' class="d4"' : "");   // four-digit pages use a smaller font
  for (let i = lo; i <= hi; i++) strip += `<button type="button" data-page="${i}"${d4(i)}${i === page ? ' aria-current="page"' : ""}>${i + 1}</button>`;
  const glo = pages <= 400 ? 0 : Math.max(0, page - 100), ghi = pages <= 400 ? pages - 1 : Math.min(pages - 1, page + 100);
  let grid = "";
  for (let i = glo; i <= ghi; i++) grid += `<button type="button" data-page="${i}"${d4(i)}${i === page ? ' aria-current="page"' : ""}>${i + 1}</button>`;
  return `<nav class="pager db-pager" aria-label="Pages">` +
    `<button type="button" class="btn btn-icon" data-page="${page - 1}" aria-label="Previous page"${page <= 0 ? " disabled" : ""}>${ic("left", 16)}</button>` +
    `<div class="pager-strip" data-strip>${strip}</div>` +
    `<div class="pop-wrap"><button type="button" class="btn" data-jump aria-expanded="false" aria-haspopup="dialog">Page <b class="num" style="color:var(--strong)">${page + 1}</b> of <span class="num">${pages.toLocaleString()}</span>${ic("down", 14)}</button>` +
      `<div class="pop right jump${where === "bottom" ? " up" : ""}" role="dialog" aria-label="Go to page" hidden><form data-jump-form><label class="ifield"><span>Page</span><input inputmode="numeric" autocomplete="off" aria-label="Page number"><span>/ ${pages.toLocaleString()}</span></label><button class="btn btn-primary" type="submit">Go</button></form><div class="jump-grid">${grid}</div></div></div>` +
    `<button type="button" class="btn btn-icon" data-page="${page + 1}" aria-label="Next page"${page >= pages - 1 ? " disabled" : ""}>${ic("right", 16)}</button>` +
  `</nav>`;
}
// go(page) loads a page and returns a promise; a click on the BOTTOM pager
// scrolls back up to the results header once it lands.
function wireDbPagers(root, go) {
  if (!root) return;
  root._pagerGo = go || ((p) => performDbSearch({ page: p }));
  if (root._pagersWired) return;
  root._pagersWired = true;
  root.addEventListener("click", (e) => {
    const pg = e.target.closest(".pager [data-page], .jump-grid [data-page]");
    if (pg && !pg.disabled) {
      const fromBottom = !!pg.closest(".rfoot");
      closeAllPops();
      Promise.resolve(root._pagerGo(+pg.dataset.page)).then(() => { if (fromBottom) root.querySelector(".rhead")?.scrollIntoView({ block: "start" }); });
      return;
    }
    const j = e.target.closest("[data-jump]");
    if (j) {
      e.stopPropagation();
      const pop = j.parentElement.querySelector(".pop");
      const open = pop.hidden;
      closeAllPops();
      pop.hidden = !open; j.setAttribute("aria-expanded", String(open));
      if (open) { const cur = pop.querySelector('[aria-current="page"]'); if (cur) cur.scrollIntoView({ block: "nearest" }); const i = pop.querySelector("input"); if (i) i.focus(); }
    }
  });
  root.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-jump-form]"); if (!f) return;
    e.preventDefault();
    const n = parseInt(f.querySelector("input").value, 10);
    if (n >= 1) { closeAllPops(); root._pagerGo(n - 1); }
  });
}
// Keep the current page centred in each strip; fade only the side with more.
function positionPagerStrips() {
  document.querySelectorAll("[data-strip]").forEach((strip) => {
    const cur = strip.querySelector('[aria-current="page"]');
    if (cur) { strip.style.scrollBehavior = "auto"; strip.scrollLeft = cur.offsetLeft - strip.clientWidth / 2 + cur.offsetWidth / 2; strip.style.scrollBehavior = ""; }
    pagerStripFade(strip);
    strip.onscroll = () => pagerStripFade(strip);
  });
}
function pagerStripFade(strip) {
  strip.classList.toggle("fade-l", strip.scrollLeft > 2);
  strip.classList.toggle("fade-r", strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 2);
}
// The mouse wheel scrolls a page strip sideways.
document.addEventListener("wheel", (ev) => {
  const strip = ev.target.closest && ev.target.closest(".pager-strip");
  if (!strip || Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
  ev.preventDefault();
  strip.style.scrollBehavior = "auto"; strip.scrollLeft += ev.deltaY; strip.style.scrollBehavior = "";
}, { passive: false });

// Fetched result pages, so Back / revisiting a page / the prefetched next page
// render at once. Keyed by the search signature + page; starred-only searches
// are never cached (starring changes them).
const _dbPageCache = new Map();
function dbFetchPage(key, urls) {
  const none = Promise.resolve({ rows: [], total: 0 });
  if (key && _dbPageCache.has(key)) { const hit = _dbPageCache.get(key); _dbPageCache.delete(key); _dbPageCache.set(key, hit); return hit; }
  const t0 = performance.now();
  const entry = { t: urls.t ? API.get(urls.t) : none, b: urls.b ? API.get(urls.b) : none, ms: null };
  Promise.all([entry.t, entry.b]).then(() => { entry.ms = performance.now() - t0; }, () => { if (key) _dbPageCache.delete(key); });
  if (key) {
    _dbPageCache.set(key, entry);
    while (_dbPageCache.size > 30) _dbPageCache.delete(_dbPageCache.keys().next().value);
  }
  return entry;
}
let _dbSearchSeq = 0;
// The request a search makes for query q: its signature, every page's URLs and
// the page-cache key (null for starred-only, whose results change as you star).
// performDbSearch and the start-up prefetch share it, so a prefetched page is
// exactly the page the Search tab asks for.
function dbSearchPlan(q, sets, pkt) {
  const query = String(q.text || "").trim();
  const qtype = q.qtype || "all";
  const textType = q.field || "all";
  const match = q.match || "phrase";
  const prefix = !!q.prefix;
  const diffs = q.diffs.slice();
  const yearMin = q.yearMin || 2000, yearMax = q.yearMax || 2026;
  const sort = q.sort || "relevance";
  const std = !!q.standard;
  const pm = !!q.powermark && qtype !== "bonus";
  const starred = !!q.starred;
  const setRaw = q.set || "";
  const tagsQ = (q.tags || []).length ? JSON.stringify(q.tags.map((t) => (t.id ? { f: t.f, v: t.v, x: t.x ? 1 : 0, id: t.id } : { f: t.f, v: t.v, x: t.x ? 1 : 0 }))) : "";
  const tokens = query ? (query.match(/[\p{L}\p{N}]+/gu) || []) : [];   // phrase mode + highlighting
  const qWords = dbFtsWords(query);
  const exclRaw = String(q.exclude || "").trim();
  const excl = dbFtsWords(exclRaw);
  const sig = JSON.stringify([query, qtype, textType, match, prefix, excl, _dbCatUnits, tagsQ, diffs, yearMin, yearMax, setRaw, pkt, sort, std, pm, starred]);
  const setsOn = !!setRaw && sets.n > 0;
  // Search shows every record, the unplayable ones too (marked on the card).
  const common =
    `limit=${DB_PAGE_SIZE}&offset=0&includeUnplayable=1` +
    (_dbCatUnits.length ? `&categoryIds=${encodeURIComponent(_dbCatUnits.join(","))}` : "") +
    (diffs.length ? `&difficulties=${diffs.join(",")}` : "") +
    (yearMin > 2000 ? `&yearMin=${yearMin}` : "") +
    (yearMax < 2026 ? `&yearMax=${yearMax}` : "") +
    // setIds, never setNames: names are comma-split on both transports, so
    // "2023 Planes, Trains, and Automobiles" matched nothing.
    (setsOn ? `&setIds=${sets.ids.map(encodeURIComponent).join(",")}` : "") +
    (pkt ? `&packetNumbers=${encodeURIComponent(pkt)}` : "") +
    (std ? "&standard=1" : "") +   // never standard=0: that means NON-standard only
    (pm ? "&powermarkOnly=true" : "") +
    (starred ? "&starredOnly=true" : "") +
    (tagsQ ? `&tags=${encodeURIComponent(tagsQ)}` : "") +
    (sort !== "relevance" ? `&sort=${encodeURIComponent(sort)}` : "");
  // With search text the exclusion rides inside the FTS query (NOT); without it
  // FTS has nothing to NOT against, so the backend applies it as its own filter.
  const exclQS = excl.length ? `&exclude=${encodeURIComponent(exclRaw)}&excludeIn=${encodeURIComponent(textType)}` : "";
  const wantT = qtype !== "bonus", wantB = qtype !== "tossup" && !pm;
  const expr = tokens.length ? dbFtsExpr(tokens, qWords, excl, match, prefix) : "";
  const urlsFor = (page) => {
    const cq = common.replace(/offset=\d+/, "offset=" + page * DB_PAGE_SIZE);
    return tokens.length
      ? { t: wantT ? `/api/tossups/search?query=${encodeURIComponent(dbFtsFor(expr, textType, false))}&${cq}` : null, b: wantB ? `/api/bonuses/search?query=${encodeURIComponent(dbFtsFor(expr, textType, true))}&${cq}` : null }
      : { t: wantT ? `/api/tossups/query?${cq}${exclQS}` : null, b: wantB ? `/api/bonuses/query?${cq}${exclQS}` : null };
  };
  const keyFor = (page) => (starred ? null : sig + "|" + page);
  return { sig, tokens, match, prefix, sort, wantT, wantB, setRaw, urlsFor, keyFor };
}
// Pages already known for a search signature, so a page change can show its
// number in the pager at once (the rows follow when they land).
let _dbPagesKnown = { sig: null, pages: 0 };
async function performDbSearch(opts) {
  // Sequence token: only the LATEST invocation may write results — kills the
  // race where an earlier (e.g. empty-input) query resolves last and clobbers.
  const seq = ++_dbSearchSeq;
  const g = (id) => document.getElementById(id);
  const q = _dbq;
  const container = g("db-results");
  if (!container) return;
  container.classList.toggle("db-hide-ans", !!q.hideAns);

  const sets = await dbResolveSets();
  if (seq !== _dbSearchSeq) return;
  dbSyncPackets(sets.single);   // not awaited: fills the packet list when exactly one set matches
  const pkt = q.packet && g("db-packet-filter") && !g("db-packet-filter").disabled ? q.packet : "";
  const plan = dbSearchPlan(q, sets, pkt);
  const { sig, tokens, match, prefix, sort, wantT, wantB, setRaw, urlsFor, keyFor } = plan;

  // Page rule: an explicit page wins; otherwise only a CHANGED search resets to
  // page 1. Late debounced calls after a Back restore used to reset the page.
  if (opts && opts.page != null) _dbPage = Math.max(0, opts.page);
  else if (sig !== _dbLastSig) _dbPage = 0;
  _dbLastSig = sig;
  dbMoreCount();

  const total = g("db-total"), pt = g("db-pager-top"), pb = g("db-pager-bottom");
  if (setRaw && sets.n === 0) {
    container.innerHTML = '<div class="db-empty">No set matches "' + escapeHtml(setRaw) + '"</div>';
    if (total) total.textContent = ""; if (pt) pt.innerHTML = ""; if (pb) pb.innerHTML = "";
    return;
  }
  // Same search, another page: the pager shows the new page number right away
  // (it used to wait for BOTH tossups and bonuses, so it lagged behind the rows).
  if (_dbPagesKnown.sig === sig && _dbPagesKnown.pages > 1) {
    if (pt) pt.innerHTML = dbPagerHtml("top", _dbPage, _dbPagesKnown.pages);
    if (pb && pb.innerHTML) pb.innerHTML = dbPagerHtml("bottom", _dbPage, _dbPagesKnown.pages);
    positionPagerStrips();
  }

  const entry = dbFetchPage(keyFor(_dbPage), urlsFor(_dbPage));
  // A cached page renders at once; otherwise show the bar only if it takes a moment.
  const barT = entry.ms != null ? null : setTimeout(() => { if (seq === _dbSearchSeq) container.innerHTML = loadingBarHtml(tokens.length ? "Searching…" : "Loading questions…"); }, 90);
  if (entry.ms == null) container.classList.add("db-loading");
  const hl = (el) => { if (tokens.length) highlightTerms(el, match === "phrase" ? [tokens.join(" "), ...tokens] : tokens, { prefix }); };
  // Tossups and bonuses are separate queries: unless a sort mixes them, the
  // tossup section shows as soon as it lands and the bonuses follow it.
  const mixed = wantT && wantB && Object.hasOwn(DB_SORT_CMP, sort);
  let early = false;
  if (wantT && wantB && !mixed) {
    entry.t.then((t) => {
      if (seq !== _dbSearchSeq || early === null || !(t.rows || []).length) return;
      clearTimeout(barT);
      container.classList.remove("db-loading");
      container.innerHTML = '<div class="db-sec" data-sec="t">' + t.rows.map((r) => renderSearchResult(r, "search")).join("") + "</div>" +
        '<div class="db-sec db-sec-wait" data-sec="b">' + loadingBarHtml("Loading bonuses…") + "</div>";
      hl(container.querySelector('[data-sec="t"]'));
      early = true;
    }, () => {});
  }
  try {
    const [t, b] = await Promise.all([entry.t, entry.b]);
    clearTimeout(barT);
    if (seq !== _dbSearchSeq) return;
    container.classList.remove("db-loading");
    const rows = [...(t.rows || []), ...(b.rows || [])];
    // Tossups and bonuses come from separate queries; a chosen order is applied
    // to the merged page (bm25 relevance can't be compared across tables).
    if (mixed) rows.sort(DB_SORT_CMP[sort]);
    const totT = wantT ? (t.total || 0) : 0, totB = wantB ? (b.total || 0) : 0;
    const pages = Math.max(1, Math.ceil(Math.max(totT, totB) / DB_PAGE_SIZE));
    if (_dbPage > pages - 1 && (totT || totB)) { early = null; performDbSearch({ page: pages - 1 }); return; }
    _dbPagesKnown = { sig, pages };
    const sum = totT + totB;
    if (total) {
      total.textContent = sum.toLocaleString() + (sum === 1 ? " result" : " results");
      total.title = [wantT ? `${totT.toLocaleString()} tossup${totT === 1 ? "" : "s"}` : null, wantB ? `${totB.toLocaleString()} bonus${totB === 1 ? "" : "es"}` : null].filter(Boolean).join(" · ");
    }
    if (pt) pt.innerHTML = sum ? dbPagerHtml("top", _dbPage, pages) : "";
    if (pb) pb.innerHTML = sum && rows.length > 3 ? dbPagerHtml("bottom", _dbPage, pages) : "";
    positionPagerStrips();
    if (!rows.length) {
      container.innerHTML = '<div class="db-empty">' + (tokens.length ? "No results" : "No questions match these filters") + "</div>";
    } else if (early === true) {
      const wait = container.querySelector(".db-sec-wait");
      if (wait) { wait.classList.remove("db-sec-wait"); wait.innerHTML = (b.rows || []).map((r) => renderSearchResult(r, "search")).join(""); hl(wait); }
    } else {
      container.innerHTML = rows.map((r) => renderSearchResult(r, "search")).join("");
      hl(container);
    }
    early = null;
    // The next page is fetched as soon as this one shows, so Next is instant
    // (clicking it while it is still on its way waits for that same request).
    if (_dbPage + 1 < pages && keyFor(_dbPage + 1)) {
      const next = _dbPage + 1;
      setTimeout(() => { if (seq === _dbSearchSeq) dbFetchPage(keyFor(next), urlsFor(next)); }, 50);
    }
  } catch (e) {
    clearTimeout(barT);
    early = null;
    if (seq === _dbSearchSeq) { container.classList.remove("db-loading"); container.innerHTML = '<div class="db-empty">Search failed: ' + escapeHtml(e.message || "something went wrong") + ' <button type="button" class="acct-link" data-db-retry>Try again</button></div>'; container.querySelector("[data-db-retry]")?.addEventListener("click", () => performDbSearch({ page: _dbPage })); if (pt) pt.innerHTML = ""; if (pb) pb.innerHTML = ""; }
  }
}

// Unplayable records (never served in practice) get "✕", warning-group ones "!".
const QUESTION_EXCLUDE_CODES = new Set(["QUESTION_EMPTY", "QUESTION_TRUNCATED", "ANSWER_EMPTY", "NO_PARTS", "LEADIN_AND_PARTS_EMPTY", "PARTS_ANSWERS_MISMATCH", "BONUS_PARTS_MERGED", "BONUS_STORED_AS_TOSSUP"]);
function questionFlagMark(q) {
  if (q && q.playable === 0) {
    let flags = [];
    try { flags = Array.isArray(q.flags) ? q.flags : JSON.parse(q.flags || "[]"); } catch { flags = []; }
    const why = flags.filter((f) => f && QUESTION_EXCLUDE_CODES.has(f.code)).map((f) => f.detail || f.code);
    return `<span class="qb-info qcard-unplayable" data-tip="${escapeHtml("Not served in practice: " + (why.join(" \u2022 ") || "flagged"))}">\u2715</span>`;
  }
  return questionWarnHtml(q || {});
}
function renderSearchResult(q, where) {
  const isTossup = q.question_sanitized != null;
  const type = isTossup ? "tossup" : "bonus";
  const starred = _dbStarred && _dbStarred.has(type + ":" + q.id);
  const star = `<span class="qb-star${starred ? " on" : ""}" data-qid="${q.id}" data-type="${type}" title="Star">${starred ? "★" : "☆"}</span>`;
  let title, kind, body;
  const diff = q.difficulty != null ? ` · Diff ${q.difficulty}` : "";
  if (isTossup) {
    title = escapeHtml(primaryAnswerText(q.answer_sanitized || "") || "?");
    kind = "Tossup" + diff;
    body = `<div class="qcard-text">${colorizePowerMarks(escapeHtml(q.question_sanitized || ""))}</div>` +
      `<div class="qcard-answer"><span class="ra-k">Answer</span> <span class="ans-toggle"><span class="ans">${answerLineHtml(q.answer, q.answer_sanitized || "?")}</span></span></div>`;
  } else {
    let parts = [], answers = [], rawAnswers = [];
    try { parts = JSON.parse(q.parts_sanitized || "[]"); } catch {}
    try { answers = JSON.parse(q.answers_sanitized || "[]"); } catch {}
    try { rawAnswers = JSON.parse(q.answers || "[]"); } catch {}
    title = answers.map((a) => escapeHtml(primaryAnswerText(a))).filter(Boolean).join(" / ") || "?";
    kind = `Bonus · ${parts.length} part${parts.length === 1 ? "" : "s"}` + diff;
    body = `<div class="qcard-text">${escapeHtml(q.leadin_sanitized || "")}</div>` +
      parts.map((p, i) =>
        `<div class="qcard-part">[${bonusPartValues(q).values[i] || 10}] ${escapeHtml(p)}<br><span class="ans-toggle"><span class="ans">ANSWER: ${answerLineHtml(rawAnswers[i], answers[i] || "")}</span></span></div>`).join("");
  }
  const src = q.set_name ? q.set_name + (q.packet_number ? " · packet " + q.packet_number : "") : "";
  return qcardHtml({
    compact: state.viewMode === "compact",
    question: q,
    titleHtml: `<span class="ans-toggle"><span class="ans">${title}</span></span>`,
    kindHtml: kind,
    src,
    tagsWhere: where || "search",
    sideHtml: `${questionFlagMark(q)}<span class="star-btn save-plus db-save" data-qid="${escapeHtml(q.id)}" data-type="${type}" title="Save to review / folders">+</span>${star}`,
    bodyHtml: body,
  });
}

let _dbSets = null;
async function getDbSets() {
  if (!_dbSets) { try { _dbSets = (await API.get("/api/sets")).sets || []; } catch (e) { _dbSets = []; } }
  return _dbSets;
}
// The picked set name -> its id(s) (a name can repeat across ids).
async function dbResolveSets() {
  const name = _dbq.set || "";
  if (!name) return { ids: [], n: 0, single: null };
  const list = (await getDbSets()).filter((s) => s.name === name);
  return { ids: list.map((s) => s.id), n: list.length, single: list.length ? name : null };
}
// FTS expression from [\p{L}\p{N}]+ tokens only, so quoting can never produce a
// syntax error (the backend fallback would turn NOT/OR into literal words).
// Prefix * only on tokens of 3+ chars: very short prefixes are slow, and the
// query runs synchronously in the Electron main process.
//  • phrase: every token joined with FTS5's "+" (same as one quoted phrase), so
//    Word starts applies to EVERY word — `"a b"*` only prefixed the last one;
//  • all / any / exclude: one phrase per whitespace-separated WORD. Splitting
//    Ophelia's / T-cell into lone tokens OR-ed or NOT-ed a bare "s" / "t", which
//    matches most of the database.
function dbFtsWords(str) {
  return String(str || "").split(/\s+/).map((w) => (w.match(/[\p{L}\p{N}]+/gu) || []).join(" ")).filter(Boolean);
}
function dbFtsExpr(tokens, words, excl, match, prefix) {
  const star = (w) => (prefix && w.split(" ").pop().length >= 3 ? "*" : "");   // a phrase's * prefixes its LAST token
  const base = match === "phrase" ? tokens.map((t) => `"${t}"` + star(t)).join(" + ")
    : words.map((w) => `"${w}"` + star(w)).join(match === "any" ? " OR " : " ");
  return excl.length ? `(${base}) NOT (${excl.map((w) => `"${w}"`).join(" OR ")})` : base;
}
function dbFtsFor(expr, field, isBonus) {
  if (field === "answer") return `${isBonus ? "answers_sanitized" : "answer_sanitized"} : (${expr})`;
  if (field === "question") return `${isBonus ? "{leadin_sanitized parts_sanitized}" : "question_sanitized"} : (${expr})`;
  return expr;
}
const DB_SORT_CMP = {   // client merge of the tossup + bonus page (Array#sort is stable)
  newest: (a, b) => (b.set_year || 0) - (a.set_year || 0),
  oldest: (a, b) => (a.set_year || 0) - (b.set_year || 0),
  easiest: (a, b) => ((a.difficulty === 0) - (b.difficulty === 0)) || (a.difficulty || 0) - (b.difficulty || 0),
  hardest: (a, b) => (b.difficulty || 0) - (a.difficulty || 0),
};
let _dbLastSig = null, _dbRestoring = false, _dbPacketsFor = null;
// Packet picker: enabled only when exactly one set matches. The reset runs
// synchronously before the await so a stale fetch can't refill it.
async function dbSyncPackets(name) {
  const sel = document.getElementById("db-packet-filter");
  if (!sel || name === _dbPacketsFor) return;
  _dbPacketsFor = name;
  sel.innerHTML = '<option value="">All packets</option>';
  _catSetDisabled(sel, !name);
  _syncSel(sel);
  if (!name) return;
  let nums = [];
  try { nums = (await API.get(`/api/set-packets?setName=${encodeURIComponent(name)}`)).packets || []; } catch (e) {}
  if (_dbPacketsFor !== name) return;
  nums.forEach((n) => _catAddOpt(sel, String(typeof n === "object" && n ? (n.number ?? n.packet_number ?? "") : n)));
  _catSetDisabled(sel, !nums.length);
  if (_dbq.packet && [...sel.options].some((o) => o.value === _dbq.packet)) sel.value = _dbq.packet;
  _syncSel(sel);
}
// Where the sets browser is drilled to — back steps up one level (packet →
// set → set list) instead of leaving the Database screen.
let _dbBrowse = null;
// Which Database tab a search was launched FROM. Clicking an answer in the
// Frequency list jumps to the Search tab inside the SAME screen, and the nav
// stack only tracks screens (recordNav no-ops on a same-screen navigation), so
// without this Back would pop straight past the Database to whatever opened it.
let _dbTabFrom = null;
// Searching again FROM the search tab (right-click → "Search answers for it")
// is a same-screen transition, so the nav stack never sees it and Back would
// jump past the Database entirely. Remember each previous search instead.
let _dbSearchStack = [];
function currentSearchState() {
  if (!document.getElementById("db-search-input")) return null;
  return { ...JSON.parse(JSON.stringify(_dbq)), query: _dbq.text, cats: _dbCatUnits.slice(), page: _dbPage };
}
// Restore a saved search into the rebuilt controls, then run ONE search. Selects
// dispatch change so their QBSelect labels follow; the cascade waits for its
// options exactly like applyFrequencySelection.
// Restore a saved search into the tab, then run ONE search.
async function applySearchState(s) {
  if (!s) return;
  Object.assign(_dbq, dbQueryDefaults(), {
    text: s.query != null ? s.query : (s.text || ""), field: s.field || "all", qtype: s.qtype || "all",
    match: s.match || (s.exact === false ? "all" : "phrase"), prefix: !!s.prefix, exclude: s.exclude || "", hideAns: !!s.hideAns,
    tags: Array.isArray(s.tags) ? s.tags : [], diffs: (s.diffs || []).map(String),
    yearMin: s.yearMin && +s.yearMin > 2000 ? +s.yearMin : null, yearMax: s.yearMax && +s.yearMax < 2026 ? +s.yearMax : null,
    set: s.set || "", packet: s.packet || "", sort: s.sort || "relevance", standard: !!s.standard, powermark: !!s.powermark, starred: !!s.starred,
  });
  _dbCatUnits = Array.isArray(s.cats) ? s.cats.slice() : [];
  _dbPage = s.page || 0;
  _dbLastSig = null;
  clearTimeout(_dbTimer);
  renderSearchTab();
  performDbSearch({ page: s.page || 0 });
}
function dbBrowseBack() {
  // Step back through earlier searches before leaving the screen.
  if (_dbSearchStack.length && document.querySelector("#database-screen.active") && (state.dbTab || "search") === "search") {
    applySearchState(_dbSearchStack.pop());
    return true;
  }
  if (_dbTabFrom && document.querySelector("#database-screen.active")) {
    const from = _dbTabFrom;
    _dbTabFrom = null;
    state.dbTab = from.tab;
    syncDbTabActive();
    if (from.tab === "frequency" && from.freq) {
      renderFrequencyTab(from.freq);
    } else {
      renderDbTab();
    }
    return true;
  }
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
  c.innerHTML = '<div class="db-page">' + loadingBarHtml("Loading sets…") + "</div>";
  if (!_dbSets) { try { _dbSets = (await API.get("/api/sets")).sets || []; } catch { _dbSets = []; } }
  c.innerHTML =
    '<div class="db-page">' +
      `<div class="db-toolbar"><label class="ifield" style="max-width:420px">${ic("search", 15)}<input type="text" id="db-set-search" placeholder="Filter sets…" autocomplete="off" aria-label="Filter sets"></label><span class="spacer"></span><span class="tile-n" id="db-set-n"></span></div>` +
      '<div class="list db-browse" id="db-set-list"></div>' +
    "</div>";
  tipInto(c.querySelector(".db-page"), "sets");
  // every set is listed (~700 rows); content-visibility keeps it cheap to draw
  const render = () => {
    const term = (document.getElementById("db-set-search").value || "").toLowerCase();
    const list = _dbSets.filter((s) => !term || (s.name || "").toLowerCase().includes(term));
    const n = document.getElementById("db-set-n"); if (n) n.textContent = list.length.toLocaleString() + " sets";
    document.getElementById("db-set-list").innerHTML = list.map((s) =>
      `<div class="list-row clickable db-row" data-set="${escapeHtml(s.name)}"><span class="lr-name">${escapeHtml(s.name)}</span>${yearBadgeHtml(s.year)}<span class="lr-diff">${escapeHtml(DIFF_FULL[s.difficulty] || "")}</span><span class="lr-std">${s.standard ? '<span class="qtag">standard</span>' : '<span class="qtag" style="opacity:.6">non-standard</span>'}</span></div>`
    ).join("") || '<div class="db-empty" style="border:0">No sets</div>';
    document.querySelectorAll("#db-set-list .db-row").forEach((r) => {
      r.addEventListener("click", () => openSet(r.dataset.set));
      r.addEventListener("contextmenu", (ev) => {
        if (!window.QB?.contextMenu) return;
        ev.preventDefault();
        const s = r.dataset.set;
        window.QB.contextMenu(ev.clientX, ev.clientY, [
          { label: "Open set", onClick: () => openSet(s) },
          { sep: true },
          { label: "Play tossups (whole set)", onClick: () => playSetPacket(s, "", false) },
          { label: "Play bonuses (whole set)", onClick: () => playSetPacket(s, "", true) },
        ], { title: s });
      });
    });
  };
  document.getElementById("db-set-search").addEventListener("input", render);
  render();
}

async function openSet(setName) {
  _dbBrowse = { set: setName };
  const c = document.getElementById("db-content");
  const s = (_dbSets || []).find((x) => x.name === setName) || {};
  c.innerHTML = `<div class="db-page"><div class="db-crumb"><button class="ext-link" id="db-back-sets">${ic("left", 14)} Sets</button><span aria-hidden="true">/</span><strong>${escapeHtml(setName)}</strong>${yearBadgeHtml(s.year)}<span class="db-pkt-view"><button class="btn btn-sm btn-primary" id="db-set-play-tu">${ic("play", 13)}Play tossups</button><button class="btn btn-sm" id="db-set-play-bo">Play bonuses</button></span></div><div class="list db-browse" id="db-packet-list">${loadingBarHtml("Loading packets…")}</div></div>`;
  document.getElementById("db-back-sets").addEventListener("click", renderSetsTab);
  document.getElementById("db-set-play-tu").addEventListener("click", () => playSetPacket(setName, "", false));
  document.getElementById("db-set-play-bo").addEventListener("click", () => playSetPacket(setName, "", true));
  let packets = [], err = "";
  try {
    const res = await API.get("/api/packets-for-set?setName=" + encodeURIComponent(setName));
    packets = (res && (res.packets || (Array.isArray(res) ? res : []))) || [];
  } catch (e) { err = e.message || String(e); }
  document.getElementById("db-packet-list").innerHTML = packets.length
    ? packets.map((p) => `<div class="list-row clickable db-row" data-pkt="${p.packet_number}"><span class="lr-name">Packet ${p.packet_number}${p.packet_name && p.packet_name !== String(p.packet_number) ? " — " + escapeHtml(p.packet_name) : ""}</span>${ic("right", 16, ' style="color:var(--muted)"')}</div>`).join("")
    : `<div class="db-empty" style="border:0">${err ? "Couldn't load packets: " + escapeHtml(err) : "No packets in this set."}</div>`;
  document.querySelectorAll("#db-packet-list .db-row").forEach((r) => {
    r.addEventListener("click", () => openPacket(setName, parseInt(r.dataset.pkt)));
    r.addEventListener("contextmenu", (ev) => {
      if (!window.QB?.contextMenu) return;
      ev.preventDefault();
      const n = parseInt(r.dataset.pkt);
      window.QB.contextMenu(ev.clientX, ev.clientY, [
        { label: "Open packet", onClick: () => openPacket(setName, n) },
        { sep: true },
        { label: "Play tossups", onClick: () => playSetPacket(setName, n, false) },
        { label: "Play bonuses", onClick: () => playSetPacket(setName, n, true) },
      ], { title: setName + " — packet " + n });
    });
  });
}

async function openPacket(setName, packetNumber) {
  _dbBrowse = { set: setName, pkt: packetNumber };
  const c = document.getElementById("db-content");
  c.innerHTML =
    `<div class="db-page"><div class="db-crumb"><button class="ext-link" id="db-back-sets">${ic("left", 14)} Sets</button><span aria-hidden="true">/</span><button class="ext-link" id="db-back-set">${escapeHtml(setName)}</button><span aria-hidden="true">/</span><strong>Packet ${packetNumber}</strong>` +
    `<span class="db-pkt-view">` +
      `<button class="btn btn-sm btn-primary" id="db-play-tu" title="Read this packet's tossups in order">${ic("play", 13)}Play tossups</button>` +
      `<button class="btn btn-sm" id="db-play-bo" title="Read this packet's bonuses in order">Play bonuses</button>` +
      `<span class="seg" role="group" aria-label="Order"><button type="button" id="db-view-sections">Tossups → Bonuses</button><button type="button" id="db-view-inter">Interleaved</button></span></span></div>` +
    `<div class="results search-results" id="db-pkt-content">${loadingBarHtml("Loading packet…")}</div></div>`;
  document.getElementById("db-back-sets").addEventListener("click", renderSetsTab);
  document.getElementById("db-back-set").addEventListener("click", () => openSet(setName));
  let data = { tossups: [], bonuses: [] }, pErr = "";
  try { data = await API.get(`/api/packet-content?setName=${encodeURIComponent(setName)}&packetNumber=${packetNumber}`); } catch (e) { pErr = e.message || String(e); }
  const el = document.getElementById("db-pkt-content");
  if (pErr) { el.innerHTML = '<div class="db-empty">Couldn\'t load packet: ' + escapeHtml(pErr) + "</div>"; return; }
  const tus = data.tossups || [], bos = data.bonuses || [];
  const render = () => {
    const inter = lsGet("qb-pkt-view") === "interleaved";
    document.getElementById("db-view-sections")?.setAttribute("aria-pressed", String(!inter));
    document.getElementById("db-view-inter")?.setAttribute("aria-pressed", String(inter));
    let html = "";
    if (inter) {
      for (let i = 0; i < Math.max(tus.length, bos.length); i++) {
        if (tus[i]) html += `<div class='db-section-label'>TOSSUP ${i + 1}</div>` + renderSearchResult(tus[i], "sets");
        if (bos[i]) html += `<div class='db-section-label'>BONUS ${i + 1}</div>` + renderSearchResult(bos[i], "sets");
      }
    } else {
      html = "<div class='db-section-label'>TOSSUPS</div>" + tus.map((q) => renderSearchResult(q, "sets")).join("");
      html += "<div class='db-section-label'>BONUSES</div>" + bos.map((b) => renderSearchResult(b, "sets")).join("");
    }
    el.innerHTML = html || '<div class="db-empty">Empty packet</div>';
  };
  document.getElementById("db-view-sections").addEventListener("click", () => { lsSet("qb-pkt-view", "sections"); render(); });
  document.getElementById("db-view-inter").addEventListener("click", () => { lsSet("qb-pkt-view", "interleaved"); render(); });
  document.getElementById("db-play-tu").addEventListener("click", () => playSetPacket(setName, packetNumber, false));
  document.getElementById("db-play-bo").addEventListener("click", () => playSetPacket(setName, packetNumber, true));
  render();
}

function _catAddOpt(sel, v, label) { const o = document.createElement("option"); o.value = v; o.textContent = label != null ? label : v; sel.appendChild(o); }
function _catSetDisabled(sel, dis) { if (!sel) return; sel.disabled = dis; sel.style.opacity = dis ? "0.5" : "1"; sel.title = dis ? "Not applicable for this selection" : ""; }
// ── Frequency: the most-asked answers for any mix of categories (the same
//    picker as Search), paged like search results. The backend builds a
//    selection's whole list once, so every later page is instant. ──
const FREQ_PAGE = 50;
let _freqUnits = [], _freqType = "tossup", _freqPage = 0, _freqSeq = 0;

// Snapshot for Back: returning from an answer's search shows the same list and page.
function currentFrequencySelection() {
  if (!document.getElementById("freq-results")) return null;
  return { units: _freqUnits.slice(), type: _freqType, page: _freqPage };
}

// Polls until an async-filled <select> has the option (plugins and tests use it).
function waitForOption(sel, value, ms = 1500) {
  if (!sel || !value) return Promise.resolve(false);
  const deadline = Date.now() + ms;
  return new Promise((resolve) => {
    const tick = () => {
      if ([...sel.options].some((o) => o.value === value)) return resolve(true);
      if (Date.now() > deadline) return resolve(false);
      setTimeout(tick, 25);
    };
    tick();
  });
}

function applyFrequencySelection(sel) {
  if (!sel) return;
  // a selection saved before 2026-10 is the old 4-level cascade: its deepest pick
  const units = Array.isArray(sel.units) ? sel.units : [sel.deep, sel.alt, sel.sub, sel.cat].filter(Boolean).slice(0, 1);
  _freqUnits = units.map(String);
  if (["tossup", "bonus", "both"].includes(sel.type)) _freqType = sel.type;
  _freqPage = Math.max(0, parseInt(sel.page, 10) || 0);
}

function renderFrequencyTab(restore) {
  if (restore) applyFrequencySelection(restore);
  const c = document.getElementById("db-content"); if (!c) return;
  setTimeout(() => tipInto(c.querySelector(".db-page"), "freq"), 0);
  const seg = [["tossup", "Tossups"], ["bonus", "Bonuses"], ["both", "Both"]]
    .map(([v, l]) => `<button type="button" data-ftype="${v}" aria-pressed="${_freqType === v}">${l}</button>`).join("");
  c.innerHTML =
    '<div class="db-page db-freq">' +
      '<div class="qrow freq-toolbar">' +
        `<button type="button" class="btn" id="freq-cat-btn">Categories <span class="accent-val" id="freq-cat-val">${escapeHtml(unitsSummary(_freqUnits))}</span>${ic("down", 14)}</button>` +
        `<div class="seg" id="freq-type-seg" role="group" aria-label="Question type">${seg}</div>` +
      "</div>" +
      '<div class="rhead" id="freq-rhead"><span class="total num" id="freq-total"></span><span class="spacer"></span><span id="freq-pager-top"></span></div>' +
      '<div id="freq-results" class="search-results"></div>' +
      '<div class="rfoot" id="freq-pager-bottom"></div>' +
    "</div>";
  document.getElementById("freq-cat-btn").addEventListener("click", openFreqCategories);
  document.getElementById("freq-type-seg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ftype]"); if (!b || b.dataset.ftype === _freqType) return;
    _freqType = b.dataset.ftype; _freqPage = 0;
    document.querySelectorAll("#freq-type-seg [data-ftype]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    runFrequency();
  });
  wireDbPagers(c.querySelector(".db-page"), (p) => runFrequency(p));
  // the button names the picks once the tree has loaded
  if (_freqUnits.length && !_dbCatTree) fetchCatTree("tossups").then((t) => { _dbCatTree = catTreeView(t); const v = document.getElementById("freq-cat-val"); if (v) v.textContent = unitsSummary(_freqUnits); }).catch(() => {});
  runFrequency();
}

// Frequency pages come from the read-only question database, so each URL is
// fetched once per launch (LRU): a revisited page, the prefetched next page and
// the start-up prefetch of the default lists (prefetchDefaults) render at once.
const _freqPageCache = new Map();
function freqUrl(qtype, page, units) {
  return `/api/frequent-answers?limit=${FREQ_PAGE}&offset=${page * FREQ_PAGE}&qtype=${qtype}` + (units.length ? `&nodeIds=${encodeURIComponent(units.join(","))}` : "");
}
function freqFetch(url) {
  let p = _freqPageCache.get(url);
  if (p) { _freqPageCache.delete(url); _freqPageCache.set(url, p); return p; }
  p = API.get(url);
  _freqPageCache.set(url, p);
  p.catch(() => { if (_freqPageCache.get(url) === p) _freqPageCache.delete(url); });
  while (_freqPageCache.size > 40) _freqPageCache.delete(_freqPageCache.keys().next().value);
  return p;
}
async function runFrequency(page) {
  if (page != null) _freqPage = Math.max(0, page);
  const el = document.getElementById("freq-results"); if (!el) return;
  const seq = ++_freqSeq;
  const qtype = _freqType;
  const bar = setTimeout(() => { if (seq === _freqSeq) el.innerHTML = loadingBarHtml(_freqPage ? "Loading…" : "Building frequency list…"); }, 90);
  try {
    const units = _freqUnits.slice();
    const data = await freqFetch(freqUrl(qtype, _freqPage, units));
    clearTimeout(bar);
    if (seq !== _freqSeq) return;
    const rows = (data && data.answers) || [];
    const totalN = data && typeof data.total === "number" ? data.total : rows.length;
    const pages = Math.max(1, Math.ceil(totalN / FREQ_PAGE));
    if (_freqPage > pages - 1 && totalN) return runFrequency(pages - 1);
    if (_freqPage + 1 < pages) { const next = _freqPage + 1; setTimeout(() => freqFetch(freqUrl(qtype, next, units)), 50); }
    const t = document.getElementById("freq-total"); if (t) t.textContent = totalN ? totalN.toLocaleString() + (totalN === 1 ? " answer" : " answers") : "";
    const pt = document.getElementById("freq-pager-top"), pb = document.getElementById("freq-pager-bottom");
    if (pt) pt.innerHTML = dbPagerHtml("top", _freqPage, pages);
    if (pb) pb.innerHTML = rows.length > 10 ? dbPagerHtml("bottom", _freqPage, pages) : "";
    positionPagerStrips();
    if (!rows.length) { el.innerHTML = '<div class="db-empty">No answers found for this selection.</div>'; return; }
    const max = (data && data.max) || rows[0].count || 1;
    const off = _freqPage * FREQ_PAGE;
    el.innerHTML = '<div class="list freq-list">' +
      rows.map((r, i) => `<div class="list-row"><span class="lr-rank">${(off + i + 1).toLocaleString()}</span><span class="lr-ans freq-answer" data-answer="${escapeHtml(r.answer)}" title="Search for ${escapeHtml(r.answer)}">${escapeHtml(r.answer)}</span><span class="freq-bar"><span style="width:${Math.max(1, Math.round(100 * r.count / max))}%"></span></span><span class="lr-count">${r.count.toLocaleString()}</span></div>`).join("") +
      "</div>";
    el.querySelectorAll(".freq-answer").forEach((td) => td.addEventListener("click", () => searchFromFrequency(td.dataset.answer, qtype)));
  } catch (e) {
    clearTimeout(bar);
    if (seq === _freqSeq) el.innerHTML = '<div class="db-empty">Failed to load: ' + escapeHtml(e.message || String(e)) + "</div>";
  }
}

// Start-up: what the Database tabs open on first — Search's results as they
// stand (pages 1 and 2) and the default frequency lists for tossups, bonuses and
// both (pages 1 and 2) — is fetched while the app sits idle, one request at a
// time, so opening any of them is instant. In the app each request runs in the
// main process, so it pauses while a practice session is running.
async function prefetchDefaults() {
  const settle = (p) => Promise.resolve(p).then(() => {}, () => {});
  const calm = async () => {
    for (let i = 0; i < 600 && state.sessionActive && !IS_WEB; i++) await new Promise((r) => setTimeout(r, 1000));
    await new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 1500 }) : setTimeout(r, 200)));
  };
  const search = (page) => {
    if (_dbq.set || _dbq.starred) return null;
    const plan = dbSearchPlan(_dbq, { ids: [], n: 0 }, "");
    const e = dbFetchPage(plan.keyFor(page), plan.urlsFor(page));
    return Promise.all([e.t, e.b]);
  };
  const freq = (qtype, page) => (_freqUnits.length ? null : freqFetch(freqUrl(qtype, page, [])));
  const steps = [() => search(0), () => freq("tossup", 0), () => freq("bonus", 0), () => freq("both", 0),
    () => search(1), () => freq("tossup", 1), () => freq("bonus", 1), () => freq("both", 1)];
  for (const step of steps) { await calm(); await settle(step()); }
  window.__qbPrefetched = true;   // (tests wait for it)
}

// Jump to Database → Search pre-filled and run it. Usable from anywhere in the
// app AND from plugins (exposed as host.searchDatabase): field is
// "answer" | "question" | "all"; qtype "tossup" | "bonus" | "all".
// Jump to Database → Search pre-filled and run it. Usable from anywhere in the
// app AND from plugins (exposed as host.searchDatabase): field is
// "answer" | "question" | "all"; qtype "tossup" | "bonus" | "all";
// tags [{f, v, x}] fills the search bar's tag chips.
function searchDatabase(opts) {
  opts = opts || {};
  // Coming from another Database tab (Frequency, Starred, a provider tab)?
  // Remember it — and, for Frequency, the exact selection — so Back returns to
  // that list instead of leaving the screen. Must be read before dbTab is
  // overwritten below.
  const fromTab = state.dbTab || "search";
  const onDb = !!document.querySelector("#database-screen.active");
  const _prevSearch = onDb && fromTab === "search" ? currentSearchState() : null;
  _dbTabFrom = onDb && fromTab !== "search"
    ? { tab: fromTab, freq: fromTab === "frequency" ? currentFrequencySelection() : null }
    : null;
  // A fresh jump is a fresh search: no leftover tags, categories or filters.
  Object.assign(_dbq, dbQueryDefaults(), {
    text: String(opts.query || ""),
    field: opts.field === "answer" ? "answer" : opts.field === "question" ? "question" : "all",
    qtype: opts.qtype === "bonus" ? "bonus" : opts.qtype === "tossup" ? "tossup" : "all",
    match: opts.exact != null ? (opts.exact ? "phrase" : "all") : "phrase",
    tags: Array.isArray(opts.tags) ? cleanTagList(opts.tags) : [],
  });
  _dbCatUnits = [];
  _dbPage = 0; _dbLastSig = null;
  // Tab FIRST — loadDatabase renders state.dbTab, and a stale async tab
  // renderer (e.g. Starred) would otherwise clobber the search UI after us.
  state.dbTab = "search";
  closeSettingsOverlays();
  showScreen("database");
  loadDatabase();
  // Re-push after the rebuild so Back steps through earlier searches.
  if (_prevSearch && (_prevSearch.query || (_prevSearch.tags || []).length)) {
    _dbSearchStack.push(_prevSearch);
    if (_dbSearchStack.length > 20) _dbSearchStack.shift();
  }
  syncDbTabActive();
}
// The primary part of a rendered answer line ("Ibsen, Henrik [or …]" → "Ibsen, Henrik").
function primaryAnswerText(s) {
  return String(s || "").replace(/^answer:\s*/i, "").split(/[\[(]/)[0].trim().replace(/[;:,.]+$/, "");
}

function searchFromFrequency(answer, qtype) {
  searchDatabase({ query: answer, field: "answer", qtype: qtype === "bonus" ? "bonus" : qtype === "both" ? "all" : "tossup" });
}

async function renderStarredTab() {
  const c = document.getElementById("db-content"); if (!c) return;
  if (needsAccount()) { c.innerHTML = '<div class="db-page">' + accountPanelHtml("Sign in to star questions and find them here.") + "</div>"; return; }
  c.innerHTML = '<div class="db-page"><div class="search-results">' + loadingBarHtml("Loading starred…") + "</div></div>";
  let items = [];
  try { items = (await API.get("/api/starred")).starred || []; } catch {}
  const actions = (window.QB && window.QB.getStarredActions) ? window.QB.getStarredActions() : [];
  // The registered starred actions (Flashcards, Coach) play tossups only.
  const hasTossups = items.some((it) => (it.type || "tossup") === "tossup");
  const actionBtns = actions.map((a, i) => '<button class="btn btn-sm" data-star-action="' + i + '"' + (hasTossups ? "" : " disabled") + ">" + escapeHtml(a.label) + "</button>").join("");
  c.innerHTML =
    '<div class="db-page">' +
      '<div class="db-toolbar">' +
        `<button class="btn btn-primary" id="db-practice-starred"${hasTossups ? "" : " disabled"}>${ic("play", 14)}Practice starred tossups</button>` +
        actionBtns +
        `<span class="spacer"></span><span class="tile-n">${items.length.toLocaleString()} starred</span>` +
      "</div>" +
      '<div class="results search-results" id="db-results"></div>' +
    "</div>";
  document.getElementById("db-practice-starred")?.addEventListener("click", () => {
    if (state.customType && state.sessionActive) endSession();   // a suspended list would be served first
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
      if (a && typeof a.run === "function") {
        try { a.run(items); b.classList.remove("is-failed"); b.removeAttribute("title"); }
        catch (e) { console.error(e); b.classList.add("is-failed"); b.title = "Failed: " + (e.message || e); }
      }
    });
  });
  const container = document.getElementById("db-results");
  if (items.length === 0) { container.innerHTML = '<div class="db-empty">No starred questions yet</div>'; return; }
  container.innerHTML = items.filter((it) => it.question).map((it) => renderSearchResult(it.question, "starred")).join("");
  limitList(container, ":scope > .qcard", "db:starred", 50, 50);
}


// Boot shows nothing but the theme's background until the app is ready — no
// logo, no animation. The cover is already in the HTML (so it owns the first
// frame); this just starts the app and fades it away.
function startSplash() {
  const cover = document.getElementById("boot-cover");
  document.getElementById("splash-screen")?.classList.add("hidden");
  initApp();
  if (!cover) return;
  const done = () => {
    cover.style.transition = "opacity 220ms ease";
    cover.style.opacity = "0";
    setTimeout(() => cover.remove(), 260);
  };
  // Wait for a painted frame so the themed screen is in place behind it,
  // with a hard cap so a slow start can never leave the cover stuck.
  // Remember the resolved background so the NEXT boot can paint the right
  // colour before any theme has loaded.
  try {
    const bg = getComputedStyle(document.body).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)") localStorage.setItem("qb-boot-bg", bg);
  } catch (e) {}
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 120)));
  setTimeout(done, 4000);
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
  setTimeout(() => prefetchDefaults().catch(() => {}), IS_WEB ? 600 : 2500);
  checkMpReachable();
  catPresetsSync();
  // the website has no name prompt: an account's display name, or "unregistered" in multiplayer
  if (!IS_WEB && !localStorage.getItem("qb-setup-done") && !state.username) {
    showSetupOverlay();
  }
}

function renderPluginNav() {
  // Plugin pages live on the Plugins page now (Open tab), not on the home.
  if (document.getElementById("extensions-screen")?.classList.contains("active")) window.QB?.renderScreen?.();
  updateTopbar();
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
        account: Account.user ? { handle: Account.user.handle, displayName: Account.user.displayName || Account.user.handle } : null,
        web: IS_WEB,
        mode: state.mode,
        sessionActive: state.sessionActive,
        sessionId: state.sessionId,
        currentQuestion: state.currentQuestion,
        isBuzzed: state.isBuzzed,
        questionCount: state.questionCount,
        totalPoints: state.totalPoints,
        avatar: state.avatar,
        username: state.username,
        // how this player reads questions (a server-run multiplayer room reads
        // its questions the way its first player does)
        hideNotes: !!state.settings.hideNotes,
        hidePronunciations: !!state.settings.hidePronunciations,
      }),
      showScreen,
      goHome,
      refreshTopbar: () => updateTopbar(),
      setReadingHold: (v) => { ttsHold = !!v; },
      // A plugin that must not be interrupted by a page reload (multiplayer in a
      // room) marks itself busy; the question-database switch waits for it.
      setBusy: (key, on) => { if (on) _busyFlags.add(String(key)); else { _busyFlags.delete(String(key)); maybeSwitchDb(); } },
      getActiveFilters: () => getActiveFilters({ real: true }),
      ensureFiltersLoaded: () => { if (!document.querySelector("#category-filters .category-group")) setMode(state.mode || "tossups"); },
      resetPracticeFilters: () => resetPracticeFiltersToDefaults(),
      // Lossless panel-selection mirror (multiplayer keeps every player's
      // category panel in sync through this pair).
      getFilterSelectionSnapshot: () => getFilterSelectionSnapshot(),
      applyFilterSelectionSnapshot: (snap) => applyFilterSelectionSnapshot(snap),
      // The user's REAL practice mode. While a custom list shows, #mode-select
      // holds the "custom" placeholder — never read it directly from a plugin.
      getPracticeMode: () => (_customView ? _customView.prevMode : ($("#mode-select")?.value || "random")),
      getPracticeConfig: () => ({
        mode: _customView ? _customView.prevMode : ($("#mode-select")?.value || "random"),
        filters: getActiveFilters({ real: true }),
        strictness: parseInt($("#strictness-slider")?.value || "10"),
        revealSpeed: state.settings.revealSpeed,
        hidePron: !!state.settings.hidePronunciations,
        stopOnPower: !!state.settings.stopOnPower,
        allowSkips: state.settings.allowSkips !== false,
        filterSummary: describeActiveFilters({ real: true }),
      }),
      stripPronunciations: (t) => stripPronunciations(t),
      // ── new question database helpers (category tree, text, N-part bonuses) ──
      // Nested category tree [{id,name,path,label,depth,leaf,count,definition,children}].
      getCategoryTree: (type) => fetchCatTree(type === "bonuses" ? "bonuses" : "tossups").then((t) => t.roots),
      // The app's category selector for plugins: turns a <button> (or makes one)
      // into the "Categories ▾" launcher with the two-pane picker. Picks are
      // whole-subtree node ids — send them as categoryIds=a,b (questions) or
      // nodeIds=a,b (/api/frequent-answers); handle.matches(path) filters local
      // records by category_path. opts.tree = a plugin's own [{id,name,count,
      // children}] tree instead. See CategoryButton in app.js for every option.
      categoryPicker: (btn, opts) => CategoryButton(btn || null, opts || {}),
      // true while the app is locked on Settings → Updates for the required database
      isLocked: () => _dbLocked,
      // A record's text as the practice screen reads it: moderator notes hidden
      // (from the HTML) and pronunciation guides stripped per the user's
      // settings. kind: "question" (tossup), "leadin", or "part" with part index.
      questionText: (q, kind, part) => questionPlainText(q, kind, part),
      // Per-part point values (10 each when the record states none), and the max.
      bonusValues: (b) => bonusPartValues(b),
      // A buzz index in a DISPLAYED (notes/guides-stripped, (*)-free) text ->
      // the index in the record's plain text, which the server judges against.
      mapDisplayPos: (displayText, originalText, pos) => mapDisplayPosToOriginal(displayText, originalText, pos),
      recordNav: (name) => recordNav(name),
      saveScreenScroll: () => saveScreenScroll(),
      restoreScreenScroll: (el) => restoreScreenScroll(el),
      collapseFilterSections: () => collapseFilterSections(),
      initCollapsibles: (root) => initCollapsibles(root),
      limitList: (listEl, itemSel, key, first, step) => limitList(listEl, itemSel, key, first, step),
      syncAppearanceSection: () => syncAppearanceSection(),
      searchDatabase: (opts) => searchDatabase(opts),
      playSetPacket: (setName, packetNumber, asBonuses) => playSetPacket(setName, packetNumber, asBonuses),
      keyDisplay: (action) => keyDisplay(action),
      confirm: (message, onYes, opts) => confirmDialog(message, onYes, opts),
      // accounts (website gates; multiplayer names)
      needsAccount: () => needsAccount(),
      tip: (container, id, text, ref) => tipInto(container, id, text, ref),
      accountPanelHtml: (reason) => accountPanelHtml(reason),
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
          return false;
        }
        return true;
      },
      getImportedPacket: () => null,   // packet files were removed (14.38); kept for older plugins
      // path = the category-tree prefix an achievement counts within (cat kept for older plugins)
      getAchievementList: () => ACHIEVEMENT_LIST.map((a) => { const cat = a.cat || (a.type === "answer_power" ? apAchCategory(a.id) : undefined); return { ...a, cat, path: a.path || cat || undefined }; }),
      // Open the app's own session-history overlay over a supplied list, so a
      // plugin gets the real GUI — filters, compact/expand, buzz track, star
      // and save actions — instead of a hand-rolled imitation.
      // Entry shape: { id, type, points, correct, isPower, celerity, buzzPosition,
      //   userAnswer, answer, question: { question_sanitized, answer, answer_sanitized,
      //   category, subcategory, alternate_subcategory, difficulty, set_name, set_year } }
      openSessionHistory: (entries, opts) =>
        openHistoryOverlay({ entries: Array.isArray(entries) ? entries : [], title: (opts && opts.title) || "SESSION HISTORY" }),
      // Earned/progress state for every achievement (base + plugin), computed
      // from the same data the Player screen uses. Plugins can't derive this
      // themselves — the thresholds and answer-power classes live in app.js.
      getEarnedAchievements: async () => {
        const [statsData, apData] = await Promise.all([
          API.get("/api/stats").catch(() => ({ stats: {} })),
          API.get("/api/answer-powers").catch(() => ({ answer_counts: {} })),
        ]);
        const stats = statsData.stats || {};
        const achData = computeAchievementData(stats, apData.answer_counts || {}, apData.answer_classes || {}, apData.answer_questions || {});
        const out = ACHIEVEMENT_LIST.map((a) => ({
          id: a.id, name: a.name, desc: a.desc, threshold: a.threshold,
          earned: !!(achData[a.id] && achData[a.id].earned),
          progress: (achData[a.id] && achData[a.id].progress) || 0,
        }));
        for (const p of collectPluginAchievements(stats, apData.answer_counts || {}) || []) {
          out.push({ id: p.id, name: p.name, desc: p.desc, threshold: p.threshold, earned: !!p.earned, progress: p.progress || 0, source: p.source });
        }
        return out;
      },
      normalizeAnswerPower: (s) => apNorm(s),
      matchAnswerPower: (a, b) => apMatch(apNorm(a), apNorm(b)),
      extractPrimaryAnswer: (raw, sani) => { try { return apPrimary(raw, sani); } catch (e) { return ""; } },
    });
  }
  if (IS_WEB) handleAccountLinks().then(refreshAccount); else refreshAccount();
  // the website opened at a page's address (a link, a bookmark, a reload)
  if (IS_WEB) setTimeout(() => { if (location.pathname !== "/") webRoute(location.pathname); else webTitleSync(); }, 0);
  // the website runs on the server's (current) question database and has no app to update
  if (!IS_WEB) {
    enforceRequiredDb();
    applyStagedPluginUpdates().then(maybeAutoCheckAppUpdate).then(() => { if (!_dbLocked) maybeAutoDbUpdate(); });
  }
  startSplash();
}

// ── Accounts (web/accounts.mjs on the server) ──
// One onlinequiz account for the website and the app. On the website the
// account's data IS the server copy (cookie sign-in). In the app, index.js
// forwards these same /api/account/* and /api/friends* calls to the server with
// the profile's token, and keeps the profile synced into the account
// (/api/cloud/sync → userData.js exportChanges / applyChanges).
// With accounts required (website, /api/account/me says so), stars, stats,
// achievements and review need a signed-in account: a signed-out visitor gets
// the account window, or a sign-in panel where the screen would be. Signing in
// or out reloads the page — every user-scoped list comes from the new account.
const Account = { available: false, user: null, required: false, app: false, google: false, lastSync: null, syncError: null, offline: false, known: false };
const needsAccount = () => IS_WEB && Account.required && !Account.user;
const myTz = () => -new Date().getTimezoneOffset();
function accountGate(reason) {
  if (!needsAccount()) return false;
  openAccount("signin", { reason });
  return true;
}
function accountPanelHtml(reason) {
  return `<div class="acct-panel"><div class="acct-panel-ico">${ic("user", 26)}</div><p>${escapeHtml(reason)}</p>` +
    '<div class="acct-panel-btns"><button type="button" class="btn btn-primary" data-acct="signin">Sign in</button><button type="button" class="btn" data-acct="signup">Create account</button></div></div>';
}
document.addEventListener("click", (e) => { const b = e.target.closest("[data-acct]"); if (b) { e.preventDefault(); openAccount(b.dataset.acct); } });
async function refreshAccount(opts) {
  opts = opts || {};
  try {
    const d = await API.get("/api/account/me");
    Account.available = !!(d && d.available); Account.user = (d && d.user) || null; Account.required = !!(d && d.required);
    Account.app = !!(d && d.app); Account.lastSync = (d && d.lastSync) || null; Account.syncError = (d && d.syncError) || null; Account.offline = !!(d && d.offline);
    Account.google = !!(d && d.google);
  } catch (e) {}
  Account.known = true;
  _cloudOn = Account.app && !!Account.user;
  renderAccountMenu();
  applyAccountName();
  // website: plugins (the Store and running them) need an account when accounts are required
  try { window.QB?.setPluginsAllowed?.(!needsAccount()); } catch (e) {}
  if (document.querySelector("#extensions-screen.active")) window.QB?.renderScreen?.();
  // signed in (e.g. with Google) without a username yet: finish setting up
  if (!opts.noPrompt && Account.user && !Account.user.handle && !document.getElementById("account-ovl") && !refreshAccount._asked) { refreshAccount._asked = true; openAccount("profile"); }
  syncLbPublicRow();
  friendPoll();
  // the account's time zone dates its day streak for friends
  if (Account.user && !Account.offline && Account.user.tz !== myTz()) API.post("/api/account/profile", { tz: myTz() }).then((r) => { if (r && r.user) Account.user = r.user; }).catch(() => {});
  if (_cloudOn) cloudSyncSoon(1500);
  // screens drawn before we knew: redraw the gated ones
  if (needsAccount()) {
    if (document.querySelector("#stats-screen.active")) loadStats();
    if (document.querySelector("#player-screen.active")) loadPlayer();
    if (document.querySelector("#database-screen.active") && state.dbTab === "starred") renderStarredTab();
  }
  if (document.querySelector("#friends-screen.active")) renderFriends();
}
function renderAccountMenu() {
  if (!Account.available) return;   // accounts not open yet: the menu keeps "Account · Soon"
  const b = document.getElementById("tbm-account");
  if (b) {
    b.disabled = false; b.removeAttribute("aria-disabled");
    b.innerHTML = ic("user", 17) + (Account.user ? "Account" : "Sign in");
    b.onclick = () => openAccount(Account.user ? "account" : "signin");
  }
  const fr = document.getElementById("tbm-friends"); if (fr) fr.hidden = false;
  const lbBtn = document.getElementById("tb-leaderboards"); if (lbBtn) lbBtn.hidden = false;
  const head = document.querySelector("#tb-profile-menu .tbm-who");
  if (head) {
    let em = head.querySelector(".tbm-email");
    if (!em) { em = document.createElement("small"); em.className = "tbm-email"; head.appendChild(em); }
    em.textContent = Account.user ? (Account.user.handle ? "@" + Account.user.handle : Account.user.email) : "";
    const nm = head.querySelector("b"); if (nm && Account.user && IS_WEB) nm.textContent = Account.user.displayName || Account.user.handle || "Player";
    em.hidden = !Account.user;
  }
}
// Links into the site: ?verify=… (the confirm email), ?reset=… (the password
// email), ?applink=… (the app signing in through the browser), and the Google
// sign-in's way back (?google=error|off, ?welcome=1 → finish setting up).
async function handleAccountLinks() {
  const q = new URLSearchParams(location.search);
  const clean = (...keys) => { const u = new URL(location.href); (keys.length ? keys : ["verify", "reset", "google", "why", "welcome"]).forEach((k) => u.searchParams.delete(k)); history.replaceState(null, "", u.pathname + u.search + u.hash); };
  let note = "";
  try { note = sessionStorage.getItem("qb-acct-note") || ""; sessionStorage.removeItem("qb-acct-note"); } catch (e) {}
  if (q.get("verify")) {
    const r = await API.post("/api/account/verify", { token: q.get("verify") }).catch(() => ({ error: "Couldn't reach the server — try the link again." }));
    clean("verify");
    if (r && r.ok) { try { sessionStorage.setItem("qb-acct-note", "confirmed"); } catch (e) {} location.reload(); return; }
    openAccount("signin", { error: (r && r.error) || "This link has expired or was already used.", offerResend: true });
    return;
  }
  if (q.get("reset")) { const token = q.get("reset"); clean("reset"); openAccount("reset", { token }); return; }
  if (q.get("google") === "error" || q.get("google") === "off") {
    const g = q.get("google"), why = q.get("why");
    clean("google", "why");
    if (g === "off") openAccount("signin", { error: "Google sign-in isn't available yet — use your email for now." });
    else openAccount("signin", { error: why || "Google sign-in didn't finish — try again." });
    return;
  }
  if (q.get("welcome")) clean("welcome");
  if (q.get("applink")) {
    const code = q.get("applink");
    await refreshAccount({ noPrompt: true });
    // the app's "Continue with Google": signed out here → straight to Google, then back to connect
    if (!Account.user && q.get("google") === "1" && Account.google) { location.href = "/auth/google?next=" + encodeURIComponent("/?applink=" + code); return; }
    // a brand-new account (Google) picks its username first, then connects the app
    if (Account.user && !Account.user.handle) openAccount("profile", { then: () => openAccount("applink", { code }) });
    else openAccount("applink", { code });
    return;
  }
  if (note === "confirmed") { await refreshAccount(); openAccount("account", { note: "Your email is confirmed — you're signed in." }); }
}
const relTime = (t) => {
  if (!t) return "never";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.round(s / 60) + " min ago";
  if (s < 86400) return Math.round(s / 3600) + " h ago";
  const d = Math.round(s / 86400);
  return d === 1 ? "yesterday" : d + " days ago";
};
function syncLineText() {
  if (_syncBusy) return "Syncing…";
  if (Account.syncError) return Account.syncError;
  return Account.lastSync ? "Synced " + relTime(Account.lastSync) : "Not synced yet";
}
const GOOGLE_G = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
// The account window: sign in, create an account, Google, password reset,
// username + display name, the account itself, and (website) connecting the
// app. Every password box gets a show/hide eye (passwordEyes below).
function openAccount(mode, opts) {
  opts = opts || {};
  document.getElementById("account-ovl")?.remove();
  try { closeAllPops(); } catch (e) {}
  const el = document.createElement("div");
  el.id = "account-ovl";
  el.className = "qb-overlay confirm-overlay account-ovl";
  el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "acct-h");
  document.body.appendChild(el);
  let pollTimer = null;
  const close = () => { clearTimeout(pollTimer); pollTimer = null; animateRemove(el); };
  el.addEventListener("click", (e) => { if (e.target === el) close(); });
  el.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } });
  let email = opts.email || "", handle = "", display = "";
  const field = (id, type, label, auto, value, extra) => `<label class="acct-field"><span>${label}</span><input id="${id}" class="mode-input" type="${type}" autocomplete="${auto}" spellcheck="false" autocapitalize="off" value="${escapeHtml(value || "")}"${extra || ""}></label>`;
  const link = (to, text) => `<button type="button" class="acct-link" data-to="${to}">${text}</button>`;
  const handleField = (v) => field("acct-handle", "text", 'Username <span class="qb-info" data-tip="Friends add you by it. 3–20 lowercase letters and numbers.">i</span>', "username", v, ' maxlength="20" inputmode="latin"');
  const displayField = (v) => field("acct-display", "text", 'Display name <span class="qb-info" data-tip="Shown to friends and on leaderboards. It can be anything — it doesn\'t have to match your username.">i</span>', "nickname", v, ' maxlength="32"');
  const googleBtn = () => Account.google ? `<button type="button" class="btn btn-md acct-google" data-to="google">${GOOGLE_G}Continue with Google</button><div class="acct-or"><span>or</span></div>` : "";
  const render = (m, o) => {
    o = o || {};
    clearTimeout(pollTimer); pollTimer = null;
    const head = (title, sub) => `<div class="acct-head"><div class="acct-ico">${ic("user", 22)}</div><h2 id="acct-h">${title}</h2></div>` + (sub ? `<p class="acct-sub">${sub}</p>` : "");
    const err = o.error ? `<div class="acct-err" role="alert">${escapeHtml(o.error)}${o.offerResend ? " " + link("resend", "Send a new link") : ""}</div>` : "";
    const okLine = o.note ? `<div class="acct-ok">${escapeHtml(o.note)}</div>` : "";
    const u = Account.user || {};
    let html = "";
    if (m === "signin") html = head("Sign in", o.reason ? escapeHtml(o.reason) : (Account.app ? "Your onlinequiz account: your stats and stars sync between this app and the website." : "")) + okLine + googleBtn() +
      `<form class="acct-form">${field("acct-email", "email", "Email", "email", email)}${field("acct-pass", "password", "Password", "current-password")}${err}<button type="submit" class="btn btn-primary btn-md">Sign in</button></form>` +
      `<div class="acct-links">${link("forgot", "Forgot password?")}${link("signup", "Create an account")}</div>`;
    else if (m === "syncing") html = head("Signing in", "Syncing your stats and stars…") + `<div class="qb-loading"><div class="qb-loadbar"><div class="qb-loadbar-fill"></div></div></div>`;
    else if (m === "browser") html = head("Finish in your browser", `Your browser opened onlinequiz.net — sign in there${o.google ? " with Google" : ""} and press <b>Connect app</b>. This window signs in by itself.`) +
      `<div class="acct-code">Code <b>${escapeHtml(o.code || "")}</b></div>` + err + `<div class="acct-actions"><button type="button" class="btn" data-to="reopen">Open the page again</button><button type="button" class="btn" data-to="signin">Cancel</button></div>`;
    else if (m === "signup") html = head("Create an account", o.reason ? escapeHtml(o.reason) : "") + googleBtn() +
      `<form class="acct-form">${field("acct-email", "email", "Email", "email", email)}${handleField(handle)}${displayField(display)}${field("acct-pass", "password", "Password (8+ characters)", "new-password")}${field("acct-pass2", "password", "Confirm password", "new-password")}${err}<button type="submit" class="btn btn-primary btn-md">Create account</button></form>` +
      `<div class="acct-links">${link("signin", "Already have an account? Sign in")}</div>`;
    else if (m === "sent") html = head("Check your email", `We sent a link to <b>${escapeHtml(email)}</b>. Open it to confirm your account${Account.app ? ", then sign in here" : ""}.`) + okLine + err + `<div class="acct-actions"><button type="button" class="btn" data-to="resend">Resend email</button><button type="button" class="btn btn-primary" data-to="signin">Sign in</button></div>`;
    else if (m === "forgot") html = head("Reset your password") + `<form class="acct-form">${field("acct-email", "email", "Email", "email", email)}${err}<button type="submit" class="btn btn-primary btn-md">Send reset link</button></form><div class="acct-links">${link("signin", "Back to sign in")}</div>`;
    else if (m === "forgot-sent") html = head("Check your email", `If there's an account for <b>${escapeHtml(email)}</b>, we sent it a link to set a new password.`) + `<div class="acct-actions"><button type="button" class="btn btn-primary" data-to="signin">Back to sign in</button></div>`;
    else if (m === "reset") html = head("Set a new password") + `<form class="acct-form">${field("acct-pass", "password", "New password (8+ characters)", "new-password")}${field("acct-pass2", "password", "Confirm password", "new-password")}${err}<button type="submit" class="btn btn-primary btn-md">Save password</button></form>` + (o.expired ? `<div class="acct-links">${link("forgot", "Send a new link")}</div>` : "");
    else if (m === "profile") html = head(u.handle ? "Edit profile" : "Finish setting up", u.handle ? "" : "Choose a username — friends add you by it.") +
      `<form class="acct-form">${handleField(o.keepHandle != null ? o.keepHandle : (u.handle || ""))}${displayField(o.keepDisplay != null ? o.keepDisplay : (u.displayName || ""))}${err}<button type="submit" class="btn btn-primary btn-md">Save</button></form>` + (u.handle ? `<div class="acct-links">${link("account", "Back")}</div>` : "");
    else if (m === "applink") html = Account.user
      ? head("Connect the OfflineQuiz app", `Sign the app in as <b>${escapeHtml(u.displayName || u.handle || u.email || "")}</b>${u.handle ? " (@" + escapeHtml(u.handle) + ")" : ""}? Its stats and stars will sync with this account.`) + err +
        `<div class="acct-actions"><button type="button" class="btn" data-to="close">Not now</button><button type="button" class="btn btn-primary" data-to="approve">Connect app</button></div>`
      : head("Connect the OfflineQuiz app", "Sign in first — then connect the app.") + googleBtn() + `<div class="acct-actions"><button type="button" class="btn" data-to="signup">Create account</button><button type="button" class="btn btn-primary" data-to="signin">Sign in</button></div>`;
    else if (m === "applinked") html = head("The app is signed in", "You can go back to OfflineQuiz — it syncs with this account from now on.") + `<div class="acct-actions"><button type="button" class="btn btn-primary" data-to="close">Done</button></div>`;
    else if (m === "account") html = head("Account") + okLine + err +
      `<div class="acct-rows"><div class="acct-row"><span class="fr-av">${escapeHtml(String(u.displayName || u.handle || "?")[0].toUpperCase())}</span><span class="acct-v"><b>${escapeHtml(u.displayName || u.handle || "")}</b>${u.handle ? `<small>@${escapeHtml(u.handle)}</small>` : '<small class="text-muted">No username yet</small>'}</span><button type="button" class="btn btn-sm" data-to="profile">Edit</button></div>` +
      `<div class="acct-row">${ic("user", 16)}<span class="acct-v">${escapeHtml(u.email || "")}${u.google ? '<small>Signs in with Google</small>' : ""}</span></div>` +
      (Account.app ? `<div class="acct-row">${ic("review", 16)}<span class="acct-v" id="acct-sync-line">${escapeHtml(syncLineText())}</span><button type="button" class="btn btn-sm" id="acct-sync-now">Sync now</button></div>` : "") +
      `</div><div class="acct-actions"><button type="button" class="btn" id="acct-logout">Sign out</button><button type="button" class="btn" data-to="leaderboards">Leaderboards</button><button type="button" class="btn" data-to="friends">Friends</button><button type="button" class="btn btn-primary" data-to="close">Done</button></div>`;
    el.innerHTML = `<div class="confirm-box acct-box">${html}</div>`;
    mode = m;
    el.querySelectorAll("[data-to]").forEach((b) => b.addEventListener("click", () => go(b.dataset.to)));
    const form = el.querySelector("form");
    if (form) form.addEventListener("submit", (e) => { e.preventDefault(); submit(form); });
    const lo = el.querySelector("#acct-logout");
    if (lo) lo.onclick = async () => { lo.disabled = true; await API.post("/api/account/logout", {}).catch(() => {}); location.reload(); };
    const sn = el.querySelector("#acct-sync-now");
    if (sn) sn.onclick = async () => { sn.disabled = true; await cloudSyncNow(); sn.disabled = false; };
    const hIn = el.querySelector("#acct-handle");
    if (hIn) hIn.addEventListener("input", () => { const v = hIn.value.toLowerCase().replace(/[^a-z0-9]/g, ""); if (v !== hIn.value) hIn.value = v; });
    const first = el.querySelector("input:not([value]), input[value='']") || el.querySelector("input") || el.querySelector(".btn-primary");
    setTimeout(() => first && first.focus(), 30);
    if (m === "browser") pollBrowser(o);
  };
  // the app, signing in through the browser: poll until the page approves it
  const pollBrowser = (o) => {
    const started = Date.now();
    const tick = async () => {
      if (mode !== "browser" || !el.isConnected) return;
      const r = await API.post("/api/account/app-link/poll", { tz: myTz() }).catch(() => null);
      if (mode !== "browser" || !el.isConnected) return;
      if (r && r.ok) { render("syncing", {}); _cloudOn = true; await API.post("/api/cloud/sync", {}, 600000).catch(() => {}); location.reload(); return; }
      if ((r && r.expired) || Date.now() - started > 10 * 60e3) { render("signin", { error: "That browser sign-in expired — try again." }); return; }
      pollTimer = setTimeout(tick, 2000);
    };
    pollTimer = setTimeout(tick, 2000);
  };
  const go = async (to) => {
    if (to === "close") { close(); return; }
    if (to === "friends") { close(); goTo("friends"); return; }
    if (to === "leaderboards") { close(); goTo("leaderboards"); return; }
    if (to === "google") {
      if (Account.app) {   // the app: Google signs in in the person's own browser
        const r = await API.post("/api/account/app-link/start", { google: true }).catch(() => ({ error: "Couldn't reach onlinequiz.net — check your internet connection." }));
        if (!r || !r.ok) { render("signin", { error: (r && r.error) || "Couldn't start the sign-in." }); return; }
        render("browser", { code: r.code, google: true, url: r.url });
        el._linkUrl = r.url;
        return;
      }
      const here = location.pathname + location.search;
      location.href = "/auth/google?next=" + encodeURIComponent(here);
      return;
    }
    if (to === "reopen") { if (el._linkUrl) API.post("/api/cloud/open", { url: el._linkUrl }).catch(() => {}); return; }
    if (to === "approve") {
      const r = await API.post("/api/account/app-link/approve", { code: opts.code }).catch(() => ({ error: "Couldn't reach the server — try again." }));
      if (r && r.ok) { render("applinked", {}); history.replaceState(null, "", location.pathname); return; }
      render("applink", { error: (r && r.error) || "Couldn't connect the app." });
      return;
    }
    if (to === "resend") {
      const e2 = (el.querySelector("#acct-email") || {}).value || email;
      if (!e2) { render("signin", { error: "Enter your email above, then send a new link." }); return; }
      email = e2.trim();
      const r = await API.post("/api/account/resend", { email }).catch(() => ({ error: "Couldn't reach the server." }));
      render("sent", r && r.error ? { error: r.error } : { note: "Sent a new link." });
      return;
    }
    const e3 = el.querySelector("#acct-email"); if (e3) email = e3.value.trim();
    const h3 = el.querySelector("#acct-handle"); if (h3) handle = h3.value.trim();
    const d3 = el.querySelector("#acct-display"); if (d3) display = d3.value.trim();
    render(to, {});
  };
  const submit = async (form) => {
    const btn = form.querySelector("button[type=submit]");
    const v = (id) => ((form.querySelector("#" + id) || {}).value || "");
    email = v("acct-email").trim() || email;
    handle = v("acct-handle").trim().toLowerCase() || handle;
    display = v("acct-display").trim() || display;
    const post = (path, body) => API.post(path, body).catch(() => ({ error: "Couldn't reach the server — try again." }));
    if ((mode === "signup" || mode === "reset") && v("acct-pass") !== v("acct-pass2")) {
      render(mode, { error: "The two passwords don't match.", reason: opts.reason, expired: false });
      return;
    }
    btn.disabled = true;
    let r;
    if (mode === "signin") {
      r = await post("/api/account/login", { email, password: v("acct-pass"), tz: myTz(), avatar: state.avatar || null });
      if (r && r.ok) {
        if (Account.app) {   // merge this profile into the account before showing it
          render("syncing", {});
          _cloudOn = true;
          await API.post("/api/cloud/sync", {}, 600000).catch(() => {});
        }
        location.reload(); return;
      }
      render("signin", { error: r && r.error, offerResend: !!(r && r.unverified), reason: opts.reason });
    } else if (mode === "signup") {
      r = await post("/api/account/signup", { email, password: v("acct-pass"), handle, displayName: display || handle });
      if (r && r.ok) { render("sent", {}); return; }
      if (r && r.exists) { render("signin", { error: r.error }); return; }
      render("signup", { error: r && r.error, reason: opts.reason });
    } else if (mode === "forgot") {
      r = await post("/api/account/forgot", { email });
      if (r && r.ok) { render("forgot-sent", {}); return; }
      render("forgot", { error: r && r.error });
    } else if (mode === "reset") {
      r = await post("/api/account/reset", { token: opts.token, password: v("acct-pass") });
      if (r && r.ok) { location.reload(); return; }
      render("reset", { error: r && r.error, expired: !!(r && r.expired) });
    } else if (mode === "profile") {
      r = await post("/api/account/profile", { handle, displayName: display || handle });
      if (r && r.ok) {
        Account.user = r.user; renderAccountMenu(); applyAccountName();
        if (document.querySelector("#friends-screen.active")) renderFriends();
        if (document.querySelector("#leaderboards-screen.active")) renderLeaderboards();
        if (typeof opts.then === "function") { close(); opts.then(); return; }
        render("account", { note: "Saved." }); return;
      }
      render("profile", { error: r && r.error, keepHandle: handle, keepDisplay: display });
    }
  };
  render(mode, opts);
}
// The website shows the account's display name (greeting, avatar, multiplayer):
// it has no name prompt of its own.
// The shown name follows the account's display name: on the website always, in
// the app while it's signed in — so a name set on the website, in the app or in
// another tab shows everywhere (accountFresh: on focus and every minute). A name
// typed in the app goes to the account (pushAccountName).
function applyAccountName() {
  const dn = Account.user ? (Account.user.displayName || Account.user.handle || "") : "";
  if (IS_WEB) state.username = dn;
  else {
    if (!dn || Account.offline || state.username === dn || pushAccountName._t) return;   // a typed name on its way wins
    state.username = dn; lsSet("qb-username", dn);
    try { pushProfileSettings(); } catch (e) {}
    const inp = document.getElementById("set-username"); if (inp && document.activeElement !== inp) inp.value = dn;
  }
  renderGreeting(); renderTopbarProfile();
  try { if (document.querySelector("#player-screen.active")) { const w = document.querySelector(".player-welcome"); if (w) w.textContent = state.username ? `Welcome, ${state.username}` : "Welcome"; } } catch (e) {}
}
function pushAccountName(name) {
  name = String(name || "").trim();
  if (IS_WEB || !Account.user || Account.offline || !name || (Account.user.displayName || "") === name) return;
  clearTimeout(pushAccountName._t);
  pushAccountName._t = setTimeout(async () => {
    try { const r = await API.post("/api/account/profile", { displayName: name }); if (r && r.user) { Account.user = r.user; renderAccountMenu(); } } catch (e) {}
    pushAccountName._t = null;
  }, 700);
}
// A friend request not looked at yet: a blue dot on the avatar and on Friends in
// its menu, until Friends is opened (the requests seen: localStorage "qb-fr-seen").
// Checked at sign-in, every minute and whenever the window comes back.
const FR_SEEN = "qb-fr-seen";
let _frIncoming = [];
function friendDots() {
  let seen = []; try { seen = JSON.parse(lsGet(FR_SEEN) || "[]") || []; } catch (e) {}
  const unseen = _frIncoming.some((h) => !seen.includes(h));
  document.getElementById("tb-profile")?.classList.toggle("has-dot", unseen);
  document.getElementById("tbm-friends")?.classList.toggle("has-dot", unseen);
  const badge = document.getElementById("tbm-friends-n");
  if (badge) { badge.hidden = !_frIncoming.length; badge.textContent = String(_frIncoming.length); }
}
function friendsSeen() { lsSet(FR_SEEN, JSON.stringify(_frIncoming.slice(0, 200))); friendDots(); }
async function friendPoll() {
  if (!Account.user || !Account.user.handle || Account.offline) { _frIncoming = []; friendDots(); return; }
  try { const d = await API.get("/api/friends"); if (d && Array.isArray(d.incoming)) { _frIncoming = d.incoming.map((f) => f.handle); friendDots(); } } catch (e) {}
}
setInterval(() => { if (!document.hidden && Account.user) friendPoll(); }, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden && Account.user) friendPoll(); });

// The account as the server has it now — a username or name set in the app or
// another tab shows up here without a reload (Friends, Leaderboards, focus, every minute).
async function accountFresh() {
  try {
    const d = await API.get("/api/account/me");
    if (!d || d.available === false) return;
    Account.user = d.user || null; Account.google = !!d.google;
    renderAccountMenu(); applyAccountName(); syncLbPublicRow();
  } catch (e) {}
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && Account.known && Account.user) accountFresh(); });
setInterval(() => { if (!document.hidden && Account.known && Account.user) accountFresh(); }, 60000);
// Settings → Profile: "Show me on the global leaderboard" (signed in only)
function syncLbPublicRow() {
  const row = document.getElementById("row-lb-public"), sw = document.getElementById("opt-lb-public");
  if (row) row.hidden = !Account.user;
  if (sw && Account.user) sw.checked = Account.user.onLeaderboard !== false;
}
document.getElementById("opt-lb-public")?.addEventListener("change", async (e) => {
  const r = await API.post("/api/account/profile", { onLeaderboard: e.target.checked }).catch(() => null);
  if (r && r.user) Account.user = r.user; else e.target.checked = !e.target.checked;
});

// Every password box gets a show/hide eye (the account window, plugins…).
(function passwordEyes() {
  const EYE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="M4 4l16 16"/></svg>';
  const add = (inp) => {
    if (inp._qbEye || !inp.parentNode) return;
    inp._qbEye = true;
    const w = document.createElement("span");
    w.className = "pw-wrap";
    inp.parentNode.insertBefore(w, inp);
    w.appendChild(inp);
    const b = document.createElement("button");
    b.type = "button"; b.className = "pw-eye"; b.tabIndex = -1;
    b.setAttribute("aria-label", "Show password"); b.title = "Show password";
    b.innerHTML = EYE;
    b.addEventListener("mousedown", (e) => e.preventDefault());   // keep the caret in the box
    b.addEventListener("click", () => {
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      b.classList.toggle("on", show);
      b.setAttribute("aria-label", show ? "Hide password" : "Show password"); b.title = show ? "Hide password" : "Show password";
    });
    w.appendChild(b);
  };
  const scan = (root) => { if (root.matches && root.matches('input[type="password"]')) add(root); if (root.querySelectorAll) root.querySelectorAll('input[type="password"]').forEach(add); };
  new MutationObserver((muts) => { for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) scan(n); }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.body) scan(document.body); else document.addEventListener("DOMContentLoaded", () => scan(document.body));
})();

// ── App: keep this profile synced with its account ──
// After any write to the profile's data (an answer, a star, review, settings,
// plugin data) a sync runs half a minute later; also at start, every 5 minutes
// and from Account → Sync now. What another device or the website changed shows
// up here as it arrives (stars, stats).
var _cloudOn = false, _syncTimer = null, _syncBusy = false;   // var: API.post's hook may run before this line
function cloudDirty() { if (_cloudOn) cloudSyncSoon(30000); }
function cloudSyncSoon(ms) { if (!_cloudOn) return; clearTimeout(_syncTimer); _syncTimer = setTimeout(cloudSyncNow, ms); }
async function cloudSyncNow() {
  if (!_cloudOn || _syncBusy) return;
  _syncBusy = true; clearTimeout(_syncTimer);
  const line = () => { const l = document.getElementById("acct-sync-line"); if (l) l.textContent = syncLineText(); };
  line();
  try {
    const r = await API.post("/api/cloud/sync", {}, 600000);
    if (r && r.ok) {
      Account.lastSync = r.lastSync; Account.syncError = null;
      if (r.pulled) {
        loadStarredIds();
        if (document.querySelector("#stats-screen.active")) loadStats();
        if (document.querySelector("#player-screen.active")) loadPlayer();
      }
    } else if (r) {
      Account.syncError = r.offline ? "Offline — it syncs when you're back online." : (r.error || "The sync didn't finish.");
      if (r.signedOut) { Account.user = null; _cloudOn = false; renderAccountMenu(); }
    }
  } catch (e) {}
  _syncBusy = false;
  line();
}
setInterval(() => { if (_cloudOn && !document.hidden) cloudSyncNow(); }, 5 * 60e3);

// ── The app offline: Multiplayer greys out ──
// Rooms need the game server (or, failing that, the relay). Without either —
// no internet, or a network that blocks them — the home's Multiplayer button
// stays where it is but can't be clicked; it comes back by itself.
async function mpReachable() {
  if (navigator.onLine === false) return false;
  const probe = (url) => fetch(url, { mode: "no-cors", cache: "no-store", signal: AbortSignal.timeout(6000) }).then(() => true, () => false);
  let custom = "";
  try { const o = localStorage.getItem("qb-mp-server"); if (o && o !== "off") custom = o.replace(/\/+$/, ""); } catch (e) {}
  if (custom) return probe(custom + "/health");   // a chosen server (tests, development): that one only
  return (await probe("https://mp.onlinequiz.net/health")) || (await probe("https://offlinequiz-mp-relay.warren2028045.workers.dev/"));
}
function setMpAvailable(ok) {
  document.querySelectorAll('[data-go="multiplayer"]').forEach((b) => {
    b.disabled = !ok; b.classList.toggle("mp-offline", !ok);
    b.setAttribute("aria-description", ok ? "" : "Multiplayer needs an internet connection");
  });
}
async function checkMpReachable() { if (IS_WEB) return; setMpAvailable(await mpReachable()); }
if (!IS_WEB) {
  window.addEventListener("online", () => checkMpReachable());
  window.addEventListener("offline", () => setMpAvailable(false));
  setInterval(() => { if (document.querySelector("#title-screen.active")) checkMpReachable(); }, 30000);
}

// ── Tips ──
// A "Tip" box above a feature the first time someone opens it (old users
// trying something new included). It stays — across visits — until its × is
// pressed; then it never comes back on this device (localStorage "qb-tips").
const TOUCH = matchMedia("(hover: none) and (pointer: coarse)").matches;
const TIPS = {
  "search-tags": "Narrow a search with tags: type \\ in the search box (or press the tag button) and pick an era, a place, a kind of answer… Click a tag to switch it between required and skipped.",
  "freq": "Click any answer to see every question that answers it. Categories and Tossups / Bonuses / Both change the list.",
  "sets": "Open a set to read its packets in order — or play a whole set from Setup → Mode.",
  "setup": "Your setup is remembered. Tags narrow the questions further (an era, a place…), and Categories can be weighted.",
  "practice-keys": TOUCH ? "Use the buttons along the bottom to buzz, skip and pause." : "Space buzzes, S skips, P pauses and N moves on — or click the buttons under the question.",
  "stats": "Click a session to see every question in it. Categories narrows all of these numbers.",
  "mp-lobby": IS_WEB ? "Type a room code to join, or leave it empty for a new room. In a room, the copy button copies its link — friends open it to join." : "Type a room code to join, or leave it empty for a new room — then share the code with friends.",
  "store": "Get adds a plugin and turns it on; switch it off or on any time, here or under Manage.",
  "friends": "Share your username — friends add you by it. The board shows everyone's last 7 days.",
  "leaderboards": "Make your own leaderboard with + New leaderboard and invite friends to race each week.",
  "streaks": "Each square is a day — the bluer it is, the more you practiced. Tap one to see that day.",
  "cat-presets": "Save the categories you picked as a preset (the bookmark row at the bottom) to switch back in one click.",
};
const _TIPS_LS = "qb-tips";
function _tipsMap() { try { return JSON.parse(localStorage.getItem(_TIPS_LS) || "{}") || {}; } catch (e) { return {}; } }
function tipSeen(id) { return !!_tipsMap()[id]; }
function tipDone(id) { const m = _tipsMap(); m[id] = Date.now(); try { localStorage.setItem(_TIPS_LS, JSON.stringify(m)); } catch (e) {} }
// put tip `id` into `container` before `ref` (default: at the top), once
// Tips float in a corner dock (#qb-tip-dock: bottom-left; on phones along the
// bottom, lifted over any bar or footer there) — never inside the page, so they
// move nothing. Each belongs to its feature's element (container) and shows only
// while that is on screen (and not under someone else's dialog); one at a time,
// the newest. ref is kept for plugins that pass it (no longer used).
function tipDock() {
  let d = document.getElementById("qb-tip-dock");
  if (!d) { d = document.createElement("div"); d.id = "qb-tip-dock"; d.setAttribute("aria-live", "polite"); document.body.appendChild(d); }
  return d;
}
function tipInto(container, id, text, ref) {
  if (!container || !(id in TIPS || text) || tipSeen(id)) return null;
  const dock = tipDock();
  let el = dock.querySelector(`.qb-tip[data-tip-id="${id}"]`);
  if (el) { el._owner = container; tipSync(); return el; }   // re-rendered: the same tip follows the new element
  el = document.createElement("div");
  el.className = "qb-tip"; el.dataset.tipId = id; el.setAttribute("role", "note"); el.hidden = true;
  el.innerHTML = `<span class="qb-tip-ico">${ic("bulb", 18)}</span><div class="qb-tip-body"><b>Tip</b><p>${escapeHtml(text || TIPS[id])}</p></div><button type="button" class="qb-tip-x" aria-label="Close tip" title="Close">×</button>`;
  el.querySelector(".qb-tip-x").addEventListener("click", (e) => { e.stopPropagation(); tipDone(id); animateRemove(el); setTimeout(tipSync, 200); });
  el._owner = container;
  dock.appendChild(el);
  tipSync();
  return el;
}
const tipOwnerShown = (o) => {
  if (!o || !o.isConnected || !o.getClientRects().length) return false;
  const st = getComputedStyle(o); if (st.visibility === "hidden") return false;
  // a dialog on top: only its own tips
  const ovl = [...document.querySelectorAll(".qb-overlay:not(.hidden), .settings-ovl:not(.hidden)")].filter((x) => x.getClientRects().length).pop();
  if (ovl && !ovl.contains(o)) return false;
  const panel = document.querySelector(".filters-panel.open");
  if (panel && !panel.contains(o) && matchMedia("(max-width: 760px)").matches) return false;   // phones: Setup covers the page
  return true;
};
function tipSync() {
  const dock = document.getElementById("qb-tip-dock"); if (!dock) return;
  const tips = [...dock.querySelectorAll(".qb-tip:not(.qb-leaving)")];
  for (const t of tips) if (!t._owner || !t._owner.isConnected) t.remove();   // its page re-renders it when it comes back
  const live = [...dock.querySelectorAll(".qb-tip:not(.qb-leaving)")];
  const show = live.filter((t) => tipOwnerShown(t._owner)).pop() || null;
  for (const t of live) if ((t === show) === t.hidden) t.hidden = t !== show;
  if (!show) return;
  // stay clear of what's along the bottom: the practice / room bar, Setup's footer, a dialog's footer
  const W = innerWidth, H = innerHeight, phone = matchMedia("(max-width: 760px)").matches;
  const left = phone ? 12 : 16, right = phone ? W - 12 : Math.min(W - 16, 16 + 360);
  let lift = 0;
  for (const b of document.querySelectorAll(".practice-actions, .mp-actions, .filters-panel.open .fp-foot, .qb-overlay:not(.hidden) .modal-foot, .cat-modal .cp-foot")) {
    const r = b.getBoundingClientRect();
    if (!r.height || r.bottom < H - 140 || r.right < left || r.left > right) continue;
    lift = Math.max(lift, H - r.top + 8);
  }
  dock.style.setProperty("--tip-lift", lift + "px");
}
setInterval(tipSync, 400);
window.addEventListener("resize", tipSync);

// ── Streaks ──
// A year of practice as squares, one per day (bluer = more questions), this
// week's days, the current and longest day streak; tap a day for its numbers.
// Days are the viewer's own (/api/activity?tz=, userData.activityDays).
const _stk = { range: "year", sel: null, data: null };
const STK_DAY = 864e5;
const stkUtc = (iso) => Date.parse(iso + "T00:00:00Z");
const stkIso = (t) => new Date(t).toISOString().slice(0, 10);
const STK_FLAME = '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>';
const stkFlame = (n) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${STK_FLAME}</svg>`;
async function fetchActivity() {
  return API.get("/api/activity?tz=" + (-new Date().getTimezoneOffset()));
}
// the top bar's day streak: the viewer's own days; an older backend falls back to the stats count
async function streakNow() {
  try { const d = await fetchActivity(); if (d && typeof d.streak === "number") return d.streak; } catch (e) {}
  try { const sd = await API.get("/api/stats"); return computeDailyStreak(sd.stats?.questionsByDate); } catch (e) { return 0; }
}
async function renderStreaks() {
  const c = document.getElementById("streaks-container"); if (!c) return;
  if (needsAccount()) { c.innerHTML = '<div class="stk-page">' + accountPanelHtml("Sign in to keep your streak and see the days you practiced.") + "</div>"; return; }
  if (!c.querySelector(".stk-page")) c.innerHTML = loadingBarHtml("Loading your activity…");
  let d = null;
  try { d = await fetchActivity(); } catch (e) { d = null; }
  if (!d || !Array.isArray(d.days)) { c.innerHTML = '<div class="db-empty">Couldn\'t load your activity.</div>'; return; }
  _stk.data = d;
  if (!_stk.sel) _stk.sel = d.today;
  renderStreak(d.streak);
  paintStreaks(c);
}
function paintStreaks(c) {
  const d = _stk.data, byDate = new Map(d.days.map((x) => [x.date, x]));
  const today = stkUtc(d.today), dow = (t) => new Date(t).getUTCDay();
  const years = [...new Set(d.days.map((x) => x.date.slice(0, 4)))].sort().reverse();
  if (_stk.range !== "year" && !years.includes(_stk.range)) _stk.range = "year";
  // the range: the past year (53 weeks to today) or one calendar year, Sunday-first weeks
  let from, to;
  if (_stk.range === "year") { to = today; from = today - dow(today) * STK_DAY - 52 * 7 * STK_DAY; }
  else { const y = +_stk.range; from = Date.UTC(y, 0, 1); to = Math.min(Date.UTC(y, 11, 31), today); from -= dow(from) * STK_DAY; }
  const inRange = d.days.filter((x) => { const t = stkUtc(x.date); return t >= from && t <= to; });
  const max = Math.max(1, ...inRange.map((x) => x.q));
  const level = (q) => !q ? 0 : Math.max(1, Math.min(4, Math.ceil((4 * q) / max)));
  const fmtDay = (t, long) => new Date(t).toLocaleDateString(undefined, long ? { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" } : { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const plural = (n, w) => n.toLocaleString() + " " + (n === 1 ? w : w === "bonus" ? "bonuses" : w + "s");
  // the squares, one column per week
  let cells = "", months = "", lastMonth = -1, col = 0;
  const cols = Math.floor((to - from) / (7 * STK_DAY)) + 1;
  for (let w = from; w <= to; w += 7 * STK_DAY, col++) {
    let label = "";
    for (let k = 0; k < 7; k++) {
      const t = w + k * STK_DAY, iso = stkIso(t);
      if (t > to) { cells += '<span class="stk-cell stk-void"></span>'; continue; }
      // a month's name over the first week starting in it (the first column too, given room before the next)
      if (k === 0) { const m = new Date(t).getUTCMonth(), dt = new Date(t).getUTCDate(); if (col < cols - 2 && ((dt <= 7 && m !== lastMonth) || (col === 0 && dt <= 14))) { label = new Date(t).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" }); lastMonth = m; } }
      const x = byDate.get(iso), q = x ? x.q : 0;
      cells += `<button type="button" class="stk-cell l${level(q)}${iso === d.today ? " stk-today" : ""}${iso === _stk.sel ? " stk-sel" : ""}" data-day="${iso}" data-tip="${escapeHtml(fmtDay(t) + ": " + (q ? plural(q, "question") : "no practice"))}" aria-label="${escapeHtml(fmtDay(t) + ", " + (q ? plural(q, "question") : "no practice"))}"></button>`;
    }
    months += `<span class="stk-mon">${label}</span>`;
  }
  // this week, Duolingo style: a flame on each day you practiced
  const wk0 = today - dow(today) * STK_DAY;
  const week = Array.from({ length: 7 }, (_, k) => {
    const t = wk0 + k * STK_DAY, x = byDate.get(stkIso(t)), future = t > today;
    const name = new Date(t).toLocaleDateString(undefined, { weekday: "narrow", timeZone: "UTC" });
    return `<span class="stk-wd${x ? " on" : ""}${t === today ? " now" : ""}${future ? " future" : ""}"><small>${name}</small><span class="stk-dot">${x ? stkFlame(16) : ""}</span></span>`;
  }).join("");
  const practicedToday = byDate.has(d.today);
  const sub = d.streak ? (practicedToday ? "You practiced today — see you tomorrow." : "Practice today to keep it going.") : "Answer a question to start one.";
  const qIn = inRange.reduce((a, x) => a + x.q, 0);
  const rangeName = _stk.range === "year" ? "in the past year" : "in " + _stk.range;
  const ranges = years.length ? `<div class="seg stk-ranges" role="group" aria-label="Range">${[["year", "Past year"], ...years.map((y) => [y, y])].map(([k, l]) => `<button type="button" data-stk-range="${k}" aria-pressed="${_stk.range === k}">${l}</button>`).join("")}</div>` : "";
  // the picked day's numbers
  const sx = byDate.get(_stk.sel);
  const stat = (n, l) => `<span class="fr-stat"><b class="num">${n}</b><small>${l}</small></span>`;
  const dayBox = `<div class="stk-day"><b>${escapeHtml(fmtDay(stkUtc(_stk.sel), true))}</b>` + (sx
    ? `<div class="stk-day-stats">${stat(sx.q.toLocaleString(), sx.q === 1 ? "question" : "questions")}${stat(sx.pts.toLocaleString(), "points")}` +
      (sx.tu ? stat(Math.round((100 * sx.cor) / sx.tu) + "%", "tossups right") + stat(sx.pw, sx.pw === 1 ? "power" : "powers") + stat(sx.neg, sx.neg === 1 ? "neg" : "negs") : "") +
      (sx.bo ? stat(sx.bpc, "bonus parts") : "") + `</div><small class="stk-day-mix">${plural(sx.tu, "tossup")} · ${plural(sx.bo, "bonus")}</small>`
    : `<p>${_stk.sel === d.today ? "Nothing yet today." : "No practice this day."}</p>`) + "</div>";
  const wdLbl = ["", "Mon", "", "Wed", "", "Fri", ""].map((x) => `<span>${x}</span>`).join("");
  c.innerHTML = `<div class="stk-page">
    <div class="stk-cards">
      <div class="fr-card stk-now${d.streak ? " lit" : ""}"><div class="stk-big">${stkFlame(30)}<span><b class="num">${d.streak}</b> ${d.streak === 1 ? "day" : "days"}</span></div><small>Current streak · ${escapeHtml(sub)}</small><div class="stk-week" aria-label="This week">${week}</div></div>
      <div class="fr-card stk-stat"><b class="num">${d.best}</b><small>best streak</small></div>
      <div class="fr-card stk-stat"><b class="num">${inRange.length.toLocaleString()}</b><small>days practiced</small></div>
      <div class="fr-card stk-stat"><b class="num">${qIn.toLocaleString()}</b><small>questions</small></div>
    </div>
    <div class="fr-card stk-chart">
      <div class="stk-chart-head"><h2>${plural(qIn, "question")} ${rangeName}</h2>${ranges}</div>
      <div class="stk-cal"><div class="stk-wdl" aria-hidden="true">${wdLbl}</div><div class="stk-scroll"><div class="stk-months" aria-hidden="true">${months}</div><div class="stk-grid">${cells}</div></div></div>
      <div class="stk-legend"><span>Less</span>${[0, 1, 2, 3, 4].map((l) => `<span class="stk-cell l${l}"></span>`).join("")}<span>More</span></div>
      ${dayBox}
    </div>
  </div>`;
  // the weekday names line up with the rows (the squares size to the width)
  const cell = c.querySelector(".stk-grid .stk-cell"); if (cell) c.querySelector(".stk-cal").style.setProperty("--stk-c", cell.getBoundingClientRect().height + "px");
  const sc = c.querySelector(".stk-scroll"); if (sc) sc.scrollLeft = sc.scrollWidth;   // phones: the latest weeks in view
  c.querySelectorAll("[data-stk-range]").forEach((b) => b.onclick = () => { _stk.range = b.dataset.stkRange; paintStreaks(c); });
  c.querySelector(".stk-grid")?.addEventListener("click", (e) => { const b = e.target.closest("[data-day]"); if (!b) return; const keep = sc ? sc.scrollLeft : 0; _stk.sel = b.dataset.day; paintStreaks(c); const s2 = c.querySelector(".stk-scroll"); if (s2) s2.scrollLeft = keep; });
  tipInto(c.querySelector(".stk-page"), "streaks", null, c.querySelector(".stk-cards"));
}

// ── Leaderboards ──
// Global: everyone with an account who shows on it (Settings → Profile → "Show me
// on the global leaderboard"), ranked by points. Your own leaderboards: make one, invite
// friends (they accept), and race them. Periods: the last 7 days, 30 days, all
// time. The numbers come from each account's synced practice (server lb_stats).
const _lb = { tab: "global", period: "week", friends: null };
async function renderLeaderboards(note) {
  const c = document.getElementById("lb-container"); if (!c) return;
  if (!note) await accountFresh();
  if (!Account.available) { c.innerHTML = `<div class="acct-panel"><div class="acct-panel-ico">${ic("chart", 26)}</div><p>Leaderboards need onlinequiz accounts, which aren't open yet.</p></div>`; return; }
  if (!c.querySelector(".lb-page")) c.innerHTML = loadingBarHtml("Loading leaderboards…");
  if (_cloudOn) await cloudSyncNow();   // the app: your own numbers include what you just did
  const per = "period=" + _lb.period;
  let d, board = null;
  try { d = await API.get("/api/leaderboards?" + per); } catch (e) { d = null; }
  if (!d || d.error) { c.innerHTML = `<div class="db-empty">${escapeHtml((d && d.error) || "Couldn't reach onlinequiz.net — check your internet connection.")}</div>`; return; }
  if (_lb.tab !== "global" && !(d.boards || []).some((b) => b.id === _lb.tab)) _lb.tab = "global";
  if (_lb.tab !== "global") { try { board = await API.get("/api/leaderboards/board?id=" + encodeURIComponent(_lb.tab) + "&" + per); } catch (e) { board = null; } if (!board || board.error) { _lb.tab = "global"; board = null; } }
  if (!document.querySelector("#leaderboards-screen.active") && !note) return;
  const tabs = [["global", "Global"], ...(d.boards || []).map((b) => [b.id, b.name])].map(([k, l]) => `<button type="button" class="db-tab${_lb.tab === k ? " active" : ""}" data-lb-tab="${escapeHtml(k)}">${escapeHtml(l)}</button>`).join("") +
    (d.signedIn ? '<button type="button" class="db-tab lb-new" data-lb-new>+ New leaderboard</button>' : "");
  const periods = [["week", "This week"], ["month", "This month"], ["all", "All time"]].map(([k, l]) => `<button type="button" data-lb-period="${k}" aria-pressed="${_lb.period === k}">${l}</button>`).join("");
  const av = (h) => `<span class="fr-av">${escapeHtml(String(h || "?")[0].toUpperCase())}</span>`;
  const row = (r, removable) => `<div class="lb-row${r.you ? " lb-you" : ""}"><span class="lb-rank num">${r.rank}</span>${av(r.displayName || r.handle)}` +
    `<span class="fr-name"><b>${escapeHtml(r.displayName || r.handle)}</b>${r.you ? '<span class="badge">You</span>' : ""}<small>@${escapeHtml(r.handle)}</small></span>` +
    `<span class="fr-stat"><b class="num">${Number(r.points || 0).toLocaleString()}</b><small>points</small></span>` +
    `<span class="fr-stat"><b class="num">${Number(r.questions || 0).toLocaleString()}</b><small>questions</small></span>` +
    `<span class="fr-stat"><b class="num">${Number(r.powers || 0).toLocaleString()}</b><small>powers</small></span>` +
    `<span class="fr-stat"><b class="num">${r.accuracy == null ? "—" : r.accuracy + "%"}</b><small>accuracy</small></span>` +
    `<span class="fr-act">${removable && !r.you ? `<button type="button" class="btn btn-ghost btn-icon btn-sm" data-lb-remove="${escapeHtml(r.handle)}" title="Remove from this leaderboard" aria-label="Remove @${escapeHtml(r.handle)}">${ic("trash", 15)}</button>` : ""}</span></div>`;
  const invites = (d.invites || []).map((i) => `<div class="fr-req">${av(i.name)}<span class="fr-name"><b>${escapeHtml(i.name)}</b><small>${i.from ? escapeHtml(i.from.displayName) + " invited you · " : ""}${i.members} ${i.members === 1 ? "member" : "members"}</small></span><button type="button" class="btn btn-sm" data-lb-decline="${escapeHtml(i.id)}">Decline</button><button type="button" class="btn btn-sm btn-primary" data-lb-join="${escapeHtml(i.id)}">Join</button></div>`).join("");
  let body;
  if (!board) {
    const rows = d.global || [], me = d.me && !rows.some((r) => r.you) ? d.me : null;
    body = (rows.length ? `<div class="fr-list lb-board">${rows.map((r) => row(r, false)).join("")}${me ? '<div class="lb-gap">…</div>' + row(me, false) : ""}</div>` : '<div class="db-empty">No one is on the leaderboard yet — practice to be the first.</div>') +
      (d.signedIn ? "" : `<p class="fr-empty">${ic("user", 14)} <button type="button" class="acct-link" data-acct="signin">Sign in</button> to appear here and to make leaderboards with your friends.</p>`);
  } else {
    const b = board.board;
    // friends as they are now (one made since the page opened must be invitable)
    try { const f = await API.get("/api/friends"); _lb.friends = (f && Array.isArray(f.friends)) ? f.friends : (_lb.friends || []); } catch (e) { _lb.friends = _lb.friends || []; }
    const onBoard = new Set([...board.rows.map((r) => r.handle), ...(board.invited || []).map((r) => r.handle)]);
    const canInvite = _lb.friends.filter((f) => !onBoard.has(f.handle));
    body = `<div class="lb-head"><div class="lb-title"><b>${escapeHtml(b.name)}</b><small>${b.owner ? "Made by " + escapeHtml(b.owner.displayName) : ""} · ${board.rows.length} ${board.rows.length === 1 ? "member" : "members"}</small></div>` +
      (b.mine ? `<button type="button" class="btn btn-sm" data-lb-rename>Rename</button><button type="button" class="btn btn-sm" data-lb-delete>Delete</button>` : `<button type="button" class="btn btn-sm" data-lb-leave>Leave</button>`) + `</div>` +
      `<div class="fr-list lb-board">${board.rows.map((r) => row(r, b.mine)).join("")}</div>` +
      `<section class="fr-card lb-invite"><h2 class="eyebrow">Invite friends</h2>` +
        (canInvite.length ? `<div class="lb-invite-row"><select id="lb-invite-who" class="mode-input">${canInvite.map((f) => `<option value="${escapeHtml(f.handle)}">${escapeHtml(f.displayName || f.handle)} (@${escapeHtml(f.handle)})</option>`).join("")}</select><button type="button" class="btn btn-primary" data-lb-invite>Invite</button></div>`
          : `<p class="fr-empty" style="margin:0">${(_lb.friends || []).length ? "All your friends are on it or invited." : 'Add friends first — <button type="button" class="acct-link" data-go="friends">Friends</button>.'}</p>`) +
        ((board.invited || []).length ? `<p class="fr-empty">Invited: ${board.invited.map((x) => "@" + escapeHtml(x.handle)).join(", ")}</p>` : "") +
      `</section>`;
  }
  c.innerHTML = `<div class="lb-page">` +
    (invites ? `<section class="fr-sec"><h2 class="eyebrow">Invites</h2><div class="fr-list">${invites}</div></section>` : "") +
    `<div class="lb-bar"><div class="db-tabs lb-tabs">${tabs}</div><div class="seg lb-periods" role="group" aria-label="Period">${periods}</div></div>` +
    `<div class="fr-msg" id="lb-msg" role="status">${note ? escapeHtml(note) : ""}</div>` + body + `</div>`;
  if (d.signedIn) tipInto(c.querySelector(".lb-page"), "leaderboards");
  const msg = (t, err) => { const m = document.getElementById("lb-msg"); if (m) { m.textContent = t; m.classList.toggle("err", !!err); } };
  const act = async (path, bodyObj, okNote) => {
    const r = await API.post(path, bodyObj).catch(() => ({ error: "Couldn't reach onlinequiz.net." }));
    if (r && r.error) { msg(r.error, true); return null; }
    _lb.friends = null; renderLeaderboards(okNote || ""); return r;
  };
  c.querySelectorAll("[data-lb-tab]").forEach((b) => b.onclick = () => { _lb.tab = b.dataset.lbTab; renderLeaderboards(); });
  c.querySelectorAll("[data-lb-period]").forEach((b) => b.onclick = () => { _lb.period = b.dataset.lbPeriod; renderLeaderboards(); });
  c.querySelectorAll("[data-lb-join]").forEach((b) => b.onclick = async () => { const r = await act("/api/leaderboards/respond", { id: b.dataset.lbJoin, accept: true }, "Joined."); if (r) { _lb.tab = b.dataset.lbJoin; renderLeaderboards("Joined."); } });
  c.querySelectorAll("[data-lb-decline]").forEach((b) => b.onclick = () => act("/api/leaderboards/respond", { id: b.dataset.lbDecline, accept: false }));
  c.querySelector("[data-lb-new]")?.addEventListener("click", () => promptDialog("Name your leaderboard", "", async (name) => { const r = await act("/api/leaderboards/create", { name }, "Made it — now invite your friends."); if (r && r.id) { _lb.tab = r.id; renderLeaderboards("Made it — now invite your friends."); } }, { placeholder: "e.g. Varsity practice", yes: "Create" }));
  c.querySelector("[data-lb-rename]")?.addEventListener("click", () => promptDialog("Rename the leaderboard", board.board.name, (name) => act("/api/leaderboards/rename", { id: _lb.tab, name }, "Renamed."), { yes: "Save" }));
  c.querySelector("[data-lb-delete]")?.addEventListener("click", () => confirmDialog("Delete " + board.board.name + " for everyone on it?", async () => { const r = await act("/api/leaderboards/delete", { id: _lb.tab }); if (r) { _lb.tab = "global"; renderLeaderboards(); } }, { yes: "Delete" }));
  c.querySelector("[data-lb-leave]")?.addEventListener("click", () => confirmDialog("Leave " + board.board.name + "?", async () => { const r = await act("/api/leaderboards/leave", { id: _lb.tab }); if (r) { _lb.tab = "global"; renderLeaderboards(); } }, { yes: "Leave" }));
  c.querySelector("[data-lb-invite]")?.addEventListener("click", () => { const h = document.getElementById("lb-invite-who")?.value; if (h) act("/api/leaderboards/invite", { id: _lb.tab, handle: h }, "Invited @" + h + " — they'll see it under Leaderboards."); });
  c.querySelectorAll("[data-lb-remove]").forEach((b) => b.onclick = () => confirmDialog("Remove @" + b.dataset.lbRemove + " from this leaderboard?", () => act("/api/leaderboards/remove", { id: _lb.tab, handle: b.dataset.lbRemove }), { yes: "Remove" }));
}

// ── Friends ──
// Add friends by username; the list is this week's leaderboard (you included):
// questions in the last 7 days, tossup accuracy, today's count and the day
// streak, from each account's synced practice (server: activitySummary).
async function renderFriends(note) {
  const c = document.getElementById("friends-container"); if (!c) return;
  if (!note) await accountFresh();
  if (!Account.available) { c.innerHTML = `<div class="acct-panel"><div class="acct-panel-ico">${ic("user", 26)}</div><p>Friends need an onlinequiz account. Accounts aren't open yet.</p></div>`; return; }
  if (!Account.user) { c.innerHTML = accountPanelHtml("Sign in to add friends and see how they're practicing."); return; }
  if (!Account.user.handle) {
    c.innerHTML = `<div class="acct-panel"><div class="acct-panel-ico">${ic("user", 26)}</div><p>Choose a username first — friends add you by it.</p><div class="acct-panel-btns"><button type="button" class="btn btn-primary" id="fr-choose">Choose a username</button></div></div>`;
    document.getElementById("fr-choose").onclick = () => openAccount("handle");
    return;
  }
  if (!c.querySelector(".fr-page")) c.innerHTML = loadingBarHtml("Loading friends…");
  if (_cloudOn) await cloudSyncNow();   // the app: your own numbers include what you just did
  let d;
  try { d = await API.get("/api/friends"); } catch (e) { d = { error: "Couldn't reach onlinequiz.net." }; }
  if (!document.querySelector("#friends-screen.active") && !note) return;
  if (!d || d.error) { c.innerHTML = `<div class="db-empty">${escapeHtml((d && d.error) || "Couldn't load friends.")}</div>`; return; }
  const me = d.me || {};
  const av = (h) => `<span class="fr-av">${escapeHtml(String(h || "?")[0].toUpperCase())}</span>`;
  const rows = [{ ...me, you: true }, ...(d.friends || [])].sort((a, b) => ((b.summary || {}).week || {}).questions - ((a.summary || {}).week || {}).questions || String(a.handle).localeCompare(String(b.handle)));
  const num = (v) => (v == null ? "—" : Number(v).toLocaleString());
  const board = rows.map((f, i) => {
    const s = f.summary || {}, w = s.week || {};
    const nm = f.you ? (Account.user && Account.user.displayName) || f.handle : f.displayName || f.handle;
    return `<div class="fr-row${f.you ? " fr-you" : ""}"><span class="fr-rank num">${i + 1}</span>${av(nm)}<span class="fr-name"><b>${escapeHtml(nm || "")}</b>${f.you ? '<span class="badge">You</span>' : ""}<small>@${escapeHtml(f.handle || "")} · ${s.lastActive ? "active " + escapeHtml(relTime(s.lastActive)) : "no practice yet"}</small></span>` +
      `<span class="fr-stat"><b class="num">${num(w.questions)}</b><small>this week</small></span>` +
      `<span class="fr-stat"><b class="num">${w.accuracy == null ? "—" : w.accuracy + "%"}</b><small>accuracy</small></span>` +
      `<span class="fr-stat"><b class="num">${num(s.today)}</b><small>today</small></span>` +
      `<span class="fr-stat"><b class="num">${num(s.streak)}</b><small>day streak</small></span>` +
      (f.you ? '<span class="fr-act"></span>' : `<span class="fr-act"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-fr-remove="${escapeHtml(f.handle)}" title="Remove friend" aria-label="Remove @${escapeHtml(f.handle)}">${ic("trash", 15)}</button></span>`) + "</div>";
  }).join("");
  const reqs = (d.incoming || []).map((f) => `<div class="fr-req">${av(f.displayName || f.handle)}<span class="fr-name"><b>${escapeHtml(f.displayName || f.handle)}</b><small>@${escapeHtml(f.handle)} wants to be friends</small></span><button type="button" class="btn btn-sm" data-fr-decline="${escapeHtml(f.handle)}">Decline</button><button type="button" class="btn btn-sm btn-primary" data-fr-accept="${escapeHtml(f.handle)}">Accept</button></div>`).join("");
  const sent = (d.outgoing || []).map((f) => `<div class="fr-req">${av(f.displayName || f.handle)}<span class="fr-name"><b>${escapeHtml(f.displayName || f.handle)}</b><small>@${escapeHtml(f.handle)} · request sent</small></span><button type="button" class="btn btn-sm" data-fr-remove="${escapeHtml(f.handle)}">Cancel</button></div>`).join("");
  c.innerHTML = `<div class="fr-page">` +
    `<section class="fr-card fr-top"><div class="fr-me">Your username <b>@${escapeHtml(me.handle || "")}</b><button type="button" class="btn btn-ghost btn-icon btn-sm" id="fr-copy" title="Copy your username" aria-label="Copy your username">${ic("copy", 15)}</button></div>` +
      `<form class="fr-add" id="fr-add"><input class="mode-input" id="fr-handle" placeholder="Friend's username" autocomplete="off" spellcheck="false" autocapitalize="off" maxlength="21"><button type="submit" class="btn btn-primary">Add friend</button></form>` +
      `<div class="fr-msg" id="fr-msg" role="status">${note ? escapeHtml(note) : ""}</div></section>` +
    (reqs ? `<section class="fr-sec"><h2 class="eyebrow">Requests</h2><div class="fr-list">${reqs}</div></section>` : "") +
    `<section class="fr-sec"><h2 class="eyebrow">This week</h2><div class="fr-list fr-board">${board}</div>` +
      (d.friends && d.friends.length ? "" : '<p class="fr-empty">No friends yet — add one by their username above.</p>') + `</section>` +
    (sent ? `<section class="fr-sec"><h2 class="eyebrow">Sent</h2><div class="fr-list">${sent}</div></section>` : "") +
  `</div>`;
  tipInto(c.querySelector(".fr-page"), "friends");
  _frIncoming = (d.incoming || []).map((f) => f.handle); friendsSeen();   // looked at: the dots go
  const act = async (path, body, okNote) => {
    const r = await API.post(path, body).catch(() => ({ error: "Couldn't reach onlinequiz.net." }));
    if (r && r.error) { const m = document.getElementById("fr-msg"); if (m) { m.textContent = r.error; m.classList.add("err"); } return; }
    renderFriends(okNote || "");
  };
  document.getElementById("fr-add").addEventListener("submit", (e) => {
    e.preventDefault();
    const h = document.getElementById("fr-handle").value.trim().replace(/^@/, "");
    if (!h) return;
    act("/api/friends/request", { handle: h }, "Request sent to @" + h + ".");
  });
  document.getElementById("fr-copy").onclick = (e) => copyWithCheck(e.currentTarget, me.handle || "");
  c.querySelectorAll("[data-fr-accept]").forEach((b) => b.onclick = () => act("/api/friends/respond", { handle: b.dataset.frAccept, accept: true }, "You and @" + b.dataset.frAccept + " are friends."));
  c.querySelectorAll("[data-fr-decline]").forEach((b) => b.onclick = () => act("/api/friends/respond", { handle: b.dataset.frDecline, accept: false }));
  c.querySelectorAll("[data-fr-remove]").forEach((b) => b.onclick = () => {
    const h = b.dataset.frRemove, pending = !!b.closest(".fr-req");
    if (pending) { act("/api/friends/remove", { handle: h }); return; }
    confirmDialog("Remove @" + h + " from your friends?", () => act("/api/friends/remove", { handle: h }), { yes: "Remove" });
  });
}

// ── Download page (website only) ──
// /download/latest.json sits next to the installers on the server
// (scripts/publish-mirror.mjs --installers):
//   { name, version, minMacOS, builds: [{ os: mac|windows|linux, arch, kind, file, size }] }
// The visitor's own system comes first; the rest are listed under it.
const DL_OS = { mac: "Mac", windows: "Windows", linux: "Linux" };
function dlVisitorOs() {
  const p = String((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "").toLowerCase();
  if (/android|iphone|ipad|cros/.test(navigator.userAgent.toLowerCase())) return "other";
  return /mac/.test(p) ? "mac" : /win/.test(p) ? "windows" : /linux/.test(p) ? "linux" : "other";
}
function dlLabel(b) {
  if (b.os === "mac") return b.arch === "x64" ? "Mac (Intel)" : "Mac (Apple silicon)";
  if (b.os === "windows") return "Windows";
  return b.kind === "deb" ? "Linux (.deb)" : "Linux (AppImage)";
}
function dlSteps(os, info) {
  if (os === "mac") return [
    "Open the downloaded <b>.dmg</b> and drag <b>OfflineQuiz</b> into <b>Applications</b>.",
    "Open OfflineQuiz. The first time, macOS stops it because it isn't from the App Store.",
    "Open <b>System Settings → Privacy &amp; Security</b>, scroll down and click <b>Open Anyway</b>.",
  ];
  if (os === "windows") return [
    "Run the downloaded <b>.exe</b> and follow the installer.",
    "If Windows shows <b>Windows protected your PC</b>, click <b>More info → Run anyway</b>.",
  ];
  if (os === "linux") return [
    "<b>AppImage</b>: make it executable (<b>chmod +x</b>) and open it.",
    "<b>.deb</b> (Ubuntu, Debian, ChromeOS Linux): open it with Software Install, or <b>sudo apt install ./</b>file.",
  ];
  return [];
}
async function renderDownload() {
  const host = $("#download-container");
  if (!host) return;
  let info = null;
  try { const r = await fetch("/download/latest.json", { cache: "no-store" }); if (r.ok) info = await r.json(); } catch (e) {}
  // older latest.json: a single Apple-silicon installer
  const builds = info ? (Array.isArray(info.builds) ? info.builds : info.file ? [{ os: "mac", arch: "arm64", kind: "dmg", file: info.file, size: info.size }] : []) : [];
  const mine = dlVisitorOs();
  const order = ["mac", "windows", "linux"].sort((a, b) => (b === mine) - (a === mine));
  const mb = (n) => (n ? Math.round(n / 1048576) + " MB" : "");
  const btn = (b, primary) => `<a class="btn ${primary ? "btn-lg btn-primary" : "btn-md"} dl-btn" href="/download/${encodeURIComponent(b.file)}" download>${ic("download", primary ? 18 : 16)}${escapeHtml(dlLabel(b))}<span class="dl-size">${escapeHtml(mb(b.size))}</span></a>`;
  const card = (os, primary) => {
    const list = builds.filter((b) => b.os === os);
    if (!list.length) return "";
    const req = os === "mac" ? (info && info.minMacOS ? "macOS " + info.minMacOS + " or later" : "") : os === "windows" ? "Windows 10 or later, 64-bit" : "64-bit";
    return `
      <section class="dl-card${primary ? " dl-mine" : ""}">
        <div class="dl-ico" aria-hidden="true">${ic("monitor", 28)}</div>
        <div class="dl-main">
          <h2>OfflineQuiz for ${escapeHtml(DL_OS[os])}</h2>
          <div class="dl-meta">${[info && info.version ? "Version " + info.version : "", req].filter(Boolean).map(escapeHtml).join('<span class="dot-sep">·</span>')}</div>
        </div>
        <div class="dl-btns">${list.map((b, i) => btn(b, primary && i === 0)).join("")}</div>
      </section>`;
  };
  const steps = dlSteps(mine === "other" ? "mac" : mine, info);
  host.innerHTML = `
    <div class="dl-page">
      ${builds.length ? order.map((os, i) => card(os, i === 0 && os === mine)).join("") : '<section class="dl-card"><div class="dl-main"><h2>OfflineQuiz</h2><div class="dl-meta">Not available right now</div></div></section>'}
      ${mine !== "other" && steps.length && builds.some((b) => b.os === mine) ? `
      <section class="dl-steps">
        <h3>Opening it the first time</h3>
        <ol>${steps.map((t) => "<li>" + t + "</li>").join("")}</ol>
      </section>` : ""}
    </div>`;
}

async function applyStagedPluginUpdates() {
  try {
    const info = await API.get("/api/app-update-plugins");
    if (!info || !info.plugins || !info.plugins.length) return;
    const applied = localStorage.getItem("qb-overlay-plugins-applied") || "0";
    if (cmpVer(info.version, applied) <= 0) return; // dotted-version aware
    for (const p of info.plugins) {
      if (!window.QB?._plugins?.some?.((x) => x.id === p.id)) continue;
      try {
        const bytes = Uint8Array.from(atob(p.base64), (c) => c.charCodeAt(0));
        await window.QB.installZipBytes(bytes);
      } catch (e) { console.error("plugin update failed", p.id, e); }
    }
    if (info.complete !== false) localStorage.setItem("qb-overlay-plugins-applied", String(info.version));
  } catch {}
}

// ── question-database updates ──
// On launch (desktop app, "Check on launch" on) a newer published database
// downloads in the background while this one keeps serving. The app switches to
// it the next time it sits on the title screen with nothing running (a practice
// session, a dialog, or a plugin that marked itself busy — multiplayer while in a
// room), or at the next launch. Settings shows the progress and "Switch now".
const _busyFlags = new Set();
let _dbPoll = null, _dbReady = false, _dbSwitching = false, _dbManual = false;
function appIdleForDbSwitch() {
  // overlays stay in the DOM while closed (Categories window, settings panels)
  const dialogOpen = [...document.querySelectorAll(".qb-overlay")].some((o) => !o.classList.contains("hidden") && getComputedStyle(o).display !== "none");
  return !!document.querySelector("#title-screen.active") && !state.sessionActive && !_busyFlags.size && !dialogOpen;
}
async function maybeSwitchDb(force) {
  if (_dbLocked) force = true;
  if (!_dbReady || _dbSwitching || (!force && !appIdleForDbSwitch())) return;
  _dbSwitching = true;
  try {
    const r = await API.post("/api/db-update-commit", {});
    if (r && r.ok) {
      setProgress("db-upd", 100, `Updated — ${(r.result?.tossups || 0).toLocaleString()} tossups, ${(r.result?.bonuses || 0).toLocaleString()} bonuses. Reloading…`);
      // category tree, sets, counts and every cache come from the database
      setTimeout(() => location.reload(), force ? 1200 : 0);
      return;
    }
  } catch {}
  _dbSwitching = false;
}
function renderDbUpdateStatus(s) {
  const status = $("#update-status");
  if (!status || !s) return;
  if (s.state === "checking" || s.state === "downloading") {
    if (!document.getElementById("db-upd-fill")) status.innerHTML = progressBarHtml("db-upd", s.label || "Starting…");
    setProgress("db-upd", s.pct || 0, s.label || "");
  } else if (s.state === "ready") {
    if (document.getElementById("db-upd-now")) return;
    status.innerHTML = `<div style="margin-bottom:8px"><strong>${escapeHtml(s.name || "New question database")}</strong> · Ready</div>`;
    const b = document.createElement("button");
    b.className = "btn btn-sm btn-primary"; b.id = "db-upd-now"; b.textContent = "Switch now";
    b.addEventListener("click", () => { b.disabled = true; status.insertAdjacentHTML("beforeend", progressBarHtml("db-upd", "Switching…")); maybeSwitchDb(true); });
    status.appendChild(b);
  } else if (s.state === "error" && _dbManual) {
    status.textContent = "Update failed: " + friendlyUpdateErr(s.error || "");
  }
}
async function pollDbUpdate() {
  let s = null;
  try { s = await API.get("/api/db-update-status"); } catch {}
  renderDbUpdateStatus(s);
  if (s && (s.state === "checking" || s.state === "downloading")) { _dbPoll = setTimeout(pollDbUpdate, 1500); return; }
  _dbPoll = null;
  if (s && s.state === "ready") { _dbReady = true; maybeSwitchDb(_dbManual); return; }
  if (_dbLocked) dbLockShowError(s && s.state === "error" ? (s.error || "failed") : s && s.needsAppUpdate ? "the new database needs a newer app" : "");
}
function watchDbUpdate() { if (!_dbPoll) pollDbUpdate(); }
async function maybeAutoDbUpdate() {
  if (!isElectron || localStorage.getItem("qb-app-autoupdate") === "false") return;
  try { await API.post("/api/db-update-start", {}); } catch { return; }
  watchDbUpdate();
}
window.QB?.on?.("screen:change", (e) => { if (e && e.name === "title" && _dbReady) setTimeout(() => maybeSwitchDb(), 500); });

// ── Required question database. This version is built for the 2026-10
//    database (schema 2: the category tree, tags, N-part bonuses). Until that
//    database is open the app is LOCKED on Settings → Updates: the download
//    starts by itself, the page shows its progress (or the error and Retry),
//    and the app switches to it and reloads the moment it is ready. Nothing
//    else can be opened: no closing the window, no other section, no screen,
//    no plugin page, no hotkey. ──
const REQUIRED_DB_BUILT = 1791275706103;   // db-1791275706103 on the updates repo
var _dbLocked = false;   // var: guards above may run before this line during load
function isDbLocked() { return _dbLocked; }
async function enforceRequiredDb() {
  // Only an app that can fetch the database locks: a desktop install whose
  // backend predates the database updater could never leave the lock.
  if (isElectron && !(window.qbreader && window.qbreader.dbUpdateStart && window.qbreader.dbUpdateStatus && window.qbreader.getDbInfo)) return;
  let info = null;
  try { info = await API.get("/api/db-info"); } catch (e) {}
  if (!info) return;                       // can't tell: never lock on a failed read
  if ((info.schema || 1) >= 2 && Number(info.built || 0) >= REQUIRED_DB_BUILT) return;
  lockForDbUpdate();
}
function lockForDbUpdate() {
  if (_dbLocked) return;
  try { if (state.sessionActive) endSession(); } catch (e) {}
  try { closeSetupDrawer(); closeAllPops(); closeSettingsOverlays(); } catch (e) {}
  document.querySelectorAll("#confirm-dialog, #review-menu, #review-viewer, #history-overlay, #hotkey-sheet, #save-menu").forEach((x) => x.remove());
  try { if (!document.querySelector("#title-screen.active")) showScreen("title"); } catch (e) {}
  _dbLocked = true;
  document.body.classList.add("db-locked");
  const pane = document.getElementById("ovl-updates");
  if (pane && !document.getElementById("db-lock")) {
    pane.insertAdjacentHTML("afterbegin",
      '<div class="db-lock" id="db-lock" role="status"><span class="db-lock-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6.5c0 1.66 3.58 3 8 3s8-1.34 8-3V5.5"/><path d="M4 12v6.5c0 1.66 3.58 3 8 3s8-1.34 8-3V12"/></svg></span>' +
      '<div class="db-lock-txt"><h3>New question database</h3><p>This version of OfflineQuiz needs it. It opens as soon as the download finishes.</p></div></div>');
    const st = document.getElementById("update-status");
    (st || pane).insertAdjacentHTML(st ? "afterend" : "beforeend", '<div class="db-lock-retry" id="db-lock-retry" hidden><button type="button" class="btn btn-primary" id="db-lock-retry-btn">Download</button></div>');
    document.getElementById("db-lock-retry-btn").addEventListener("click", () => dbLockStart());
  }
  openSettings("updates");
  _dbManual = true;   // ready → switch at once (maybeSwitchDb(true)), then reload
  dbLockStart();
}
async function dbLockStart() {
  const retry = document.getElementById("db-lock-retry");
  if (retry) retry.hidden = true;
  const status = document.getElementById("update-status");
  let s = null;
  try { s = await API.get("/api/db-update-status"); } catch (e) {}
  if (!(s && ["checking", "downloading", "ready"].includes(s.state))) {
    if (status) status.innerHTML = progressBarHtml("db-upd", "Checking…");
    try {
      const r = await API.post("/api/db-update-start", {});
      if (r && r.state === "error") throw new Error(r.error || "failed");
    } catch (e) { dbLockShowError(e.message || String(e)); return; }
  }
  watchDbUpdate();
}
function dbLockShowError(msg) {
  const status = document.getElementById("update-status");
  if (status) status.textContent = msg ? "Download failed: " + friendlyUpdateErr(msg) : "The download did not start.";
  const retry = document.getElementById("db-lock-retry");
  if (retry) { retry.hidden = false; const b = retry.querySelector("button"); if (b) b.textContent = "Try again"; }
}
// Locked: every key stops here (window capture, before every other handler)
// except moving through and pressing the window's own buttons, and zoom.
window.addEventListener("keydown", (e) => {
  if (!_dbLocked) return;
  if (["text-bigger", "text-smaller", "text-reset"].some((a) => matchesHotkey(e, a))) return;
  // the lock window, plus what may sit over it (first-launch name, an app-update
  // offer, a confirm): typing and their buttons work; Esc never closes anything
  const allowed = e.target && e.target.closest && e.target.closest("#settings-modal, #player-setup, #update-dialog, #confirm-dialog");
  if (allowed && e.key !== "Escape") {
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName) && !/^(checkbox|radio|range)$/.test(e.target.type || "")) return;
    if (e.key === "Tab" || e.key === "Enter" || e.key === " ") { e.stopImmediatePropagation(); return; }
  }
  e.preventDefault();
  e.stopImmediatePropagation();
}, true);

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
    <div id="update-dialog-status"></div>
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

// ─────────────────────────────────────────────────────────────────────────
// Custom select
//
// Native <select> renders an OS-drawn menu that no stylesheet or theme can
// touch. This wraps each one in markup the app (and any theme) can style,
// while keeping the real <select> in the DOM as the source of truth — every
// existing `.value` read and `change` listener keeps working untouched, and
// the enhancement dispatches a normal `change` event when the user picks.
//
// Screens rebuild via innerHTML, so new selects are picked up by an observer
// rather than a one-shot pass at startup.
// ─────────────────────────────────────────────────────────────────────────
const QBSelect = (() => {
  let openInstance = null;

  function labelOf(sel) {
    const o = sel.options[sel.selectedIndex];
    return o ? o.textContent : "";
  }

  function build(sel) {
    if (sel.dataset.qbsel === "1" || sel.multiple || sel.size > 1) return;
    // Opt-out hook for a select that must stay native.
    if (sel.closest("[data-no-qbselect]")) return;
    sel.dataset.qbsel = "1";

    const cs = getComputedStyle(sel);
    const wrap = document.createElement("div");
    wrap.className = "qb-select";
    // Inherit the select's own sizing so inserting the wrapper cannot change
    // any layout it sits in.
    // Carry the select's own sizing as CUSTOM PROPERTIES rather than inline
    // width/flex. An inline width cannot be overridden by a stylesheet, which
    // left themes unable to widen a cramped filter row; a property default can.
    wrap.style.setProperty("--qbsel-flex", cs.flex);
    wrap.style.setProperty("--qbsel-w", cs.width);
    wrap.style.setProperty("--qbsel-minw", cs.minWidth);
    if (sel.id) wrap.dataset.for = sel.id;

    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "qb-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = '<span class="qb-select-value"></span><span class="qb-select-icon" aria-hidden="true"></span>';

    const popup = document.createElement("div");
    popup.className = "qb-select-popup";
    popup.setAttribute("role", "listbox");
    popup.hidden = true;

    wrap.appendChild(trigger);
    wrap.appendChild(popup);

    const valueEl = trigger.querySelector(".qb-select-value");
    const sync = () => {
      valueEl.textContent = labelOf(sel);
      trigger.disabled = sel.disabled;
      wrap.classList.toggle("disabled", !!sel.disabled);
      // Hiding the select (class, attribute or inline style) hides the wrapper.
      const hide = sel.hidden || sel.classList.contains("hidden") || sel.style.display === "none";
      wrap.style.display = hide ? "none" : "";
      if (hide) close();
    };
    // A plain `sel.value = …` changes no attribute, so the MutationObserver never
    // sees it and the label goes stale. Programmatic writers call _syncSel(sel).
    sel._qbSync = sync;

    const renderItems = () => {
      popup.innerHTML = [...sel.options].map((o, i) =>
        '<div class="qb-select-item" role="option" data-i="' + i + '"' +
        (o.selected ? ' data-selected="true" aria-selected="true"' : ' aria-selected="false"') +
        (o.disabled ? ' data-disabled="true"' : "") +
        '><span class="qb-select-check" aria-hidden="true"></span><span class="qb-select-label"></span></div>'
      ).join("");
      // Option text is set as textContent, never interpolated into HTML.
      [...popup.children].forEach((el, i) => {
        el.querySelector(".qb-select-label").textContent = sel.options[i].textContent;
      });
    };

    const close = () => {
      if (popup.hidden) return;
      popup.hidden = true;
      wrap.dataset.open = "false";
      trigger.setAttribute("aria-expanded", "false");
      if (openInstance === api) openInstance = null;
    };

    const open = () => {
      if (sel.disabled) return;
      if (openInstance && openInstance !== api) openInstance.close();
      renderItems();
      popup.hidden = false;
      wrap.dataset.open = "true";
      trigger.setAttribute("aria-expanded", "true");
      openInstance = api;
      // Flip above the trigger when there is not room below.
      const r = trigger.getBoundingClientRect();
      wrap.classList.toggle("up", r.bottom + 240 > window.innerHeight && r.top > 240);
      const cur = popup.querySelector('[data-selected="true"]');
      if (cur) { cur.classList.add("active"); cur.scrollIntoView({ block: "nearest" }); }
    };

    // A MOUSE pick hands focus back to the page: a focused trigger turned the
    // next hotkey (S to start, Space to buzz) into dropdown input. Keyboard
    // picks keep focus on the trigger.
    const pick = (i, byMouse) => {
      const o = sel.options[i];
      if (!o || o.disabled) return;
      if (sel.selectedIndex !== i) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event("input", { bubbles: true }));
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
      sync();
      close();
      if (byMouse) trigger.blur(); else trigger.focus();
    };

    const move = (delta) => {
      const items = [...popup.querySelectorAll(".qb-select-item:not([data-disabled])")];
      if (!items.length) return;
      let idx = items.findIndex((x) => x.classList.contains("active"));
      idx = idx < 0 ? 0 : Math.max(0, Math.min(items.length - 1, idx + delta));
      items.forEach((x) => x.classList.remove("active"));
      items[idx].classList.add("active");
      items[idx].scrollIntoView({ block: "nearest" });
    };

    const highlight = (i) => {
      const it = popup.querySelector('.qb-select-item[data-i="' + i + '"]');
      if (!it) return;
      popup.querySelectorAll(".qb-select-item").forEach((x) => x.classList.remove("active"));
      it.classList.add("active");
      it.scrollIntoView({ block: "nearest" });
    };
    // Type-ahead while the list is OPEN, with a short buffer: "2025 ac" or
    // "acf" (prefix first, then contains — set names all start with a year)
    // moves the highlight; Enter picks it. Repeating one letter cycles.
    let typed = "", typedAt = 0;
    const typeAhead = (key) => {
      const now = Date.now();
      typed = (now - typedAt < 800 ? typed : "") + key.toLowerCase();
      typedAt = now;
      const opts = [...sel.options];
      const txt = (o) => (o.textContent || "").trim().toLowerCase();
      const ok = (o) => !o.disabled;
      let i = -1;
      if ([...typed].every((c) => c === typed[0])) {
        const act = popup.hidden ? null : popup.querySelector(".qb-select-item.active");
        const from = (act ? +act.dataset.i : sel.selectedIndex) + 1;
        for (let n = 0; n < opts.length && i < 0; n++) {
          const k = (from + n) % opts.length;
          if (ok(opts[k]) && txt(opts[k]).startsWith(typed[0])) i = k;
        }
      }
      if (typed.length > 1 && (i < 0 || ![...typed].every((c) => c === typed[0]))) {
        i = opts.findIndex((o) => ok(o) && txt(o).startsWith(typed));
        if (i < 0) i = opts.findIndex((o) => ok(o) && txt(o).includes(typed));
      }
      if (i < 0) return;
      highlight(i);
    };
    const typing = () => Date.now() - typedAt < 800 && typed.length > 0;

    const api = { close, open, sync, wrap };

    trigger.addEventListener("click", (e) => { e.preventDefault(); popup.hidden ? open() : close(); });
    popup.addEventListener("mousedown", (e) => {
      const it = e.target.closest(".qb-select-item");
      if (!it) return;
      e.preventDefault();
      pick(+it.dataset.i, true);
    });
    popup.addEventListener("mousemove", (e) => {
      const it = e.target.closest(".qb-select-item");
      if (!it) return;
      popup.querySelectorAll(".qb-select-item").forEach((x) => x.classList.remove("active"));
      it.classList.add("active");
    });
    // Every key the dropdown consumes stops here: page and plugin hotkeys
    // (S start, Q end, T star, Space buzz, arrows mark correct/incorrect) all
    // listen on document and treat a focused BUTTON as "not typing".
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); e.stopPropagation();
        if (popup.hidden) { open(); return; }
        move(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" || (e.key === " " && !typing())) {
        e.stopPropagation();
        if (popup.hidden) { e.preventDefault(); open(); return; }
        e.preventDefault();
        const act = popup.querySelector(".qb-select-item.active");
        if (act) pick(+act.dataset.i);
      } else if (e.key === "Escape") {
        if (!popup.hidden) { e.preventDefault(); e.stopPropagation(); close(); }
      } else if (e.key === "Home" || e.key === "End") {
        if (!popup.hidden) { e.preventDefault(); e.stopPropagation(); move(e.key === "Home" ? -999 : 999); }
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && !popup.hidden) {
        e.preventDefault(); e.stopPropagation();
        typeAhead(e.key);
      }
    });

    // Code elsewhere sets `.value` directly and dispatches change; mirror that.
    sel.addEventListener("change", sync);
    // …but plenty of code mutates a select WITHOUT dispatching anything —
    // the category cascade calls `sel.disabled = false` and rewrites the
    // <option> list in place. Watch the element itself so the trigger cannot
    // be left showing a stale label, or stuck disabled after being re-enabled.
    const mo = new MutationObserver(() => { sync(); if (!popup.hidden) renderItems(); });
    mo.observe(sel, { attributes: true, attributeFilter: ["disabled", "style", "class", "hidden"], childList: true, subtree: true });
    sync();
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.tagName === "SELECT") build(root);
    root.querySelectorAll && root.querySelectorAll("select").forEach(build);
  }

  document.addEventListener("mousedown", (e) => {
    if (openInstance && !e.target.closest(".qb-select")) openInstance.close();
  });
  window.addEventListener("blur", () => { if (openInstance) openInstance.close(); });

  return {
    start() {
      scan(document.body);
      new MutationObserver((recs) => {
        for (const r of recs) for (const n of r.addedNodes) scan(n);
      }).observe(document.body, { childList: true, subtree: true });
    },
    refresh(root) { scan(root || document.body); },
  };
})();
window.QBSelect = QBSelect;

init();
QBSelect.start();
