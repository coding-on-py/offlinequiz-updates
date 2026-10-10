import { contextBridge, ipcRenderer, webFrame } from "electron";

contextBridge.exposeInMainWorld("qbreader", {
  getSets: () => ipcRenderer.invoke("get-sets"),

  getCategories: (type) => ipcRenderer.invoke("get-categories", { type }),

  getSubcategories: (type, category) =>
    ipcRenderer.invoke("get-subcategories", { type, category }),

  getAlternateSubcategories: (type, category, subcategory) =>
    ipcRenderer.invoke("get-alternate-subcategories", { type, category, subcategory }),

  getDifficultyRange: (type) =>
    ipcRenderer.invoke("get-difficulty-range", { type }),

  getCount: (type, filters) =>
    ipcRenderer.invoke("get-count", { type, filters }),

  getRandomTossup: (filters) =>
    ipcRenderer.invoke("get-random-tossup", { filters }),

  getRandomBonus: (filters) =>
    ipcRenderer.invoke("get-random-bonus", { filters }),

  searchTossups: (query, filters) =>
    ipcRenderer.invoke("search-tossups", { query, filters }),

  searchBonuses: (query, filters) =>
    ipcRenderer.invoke("search-bonuses", { query, filters }),

  queryTossups: (filters) =>
    ipcRenderer.invoke("query-tossups", { filters }),
  buzzwords: (filters, clue) =>
    ipcRenderer.invoke("analysis-buzzwords", { filters, clue }),

  queryBonuses: (filters) =>
    ipcRenderer.invoke("query-bonuses", { filters }),

  getTossup: (id) => ipcRenderer.invoke("get-tossup", { id }),

  getBonus: (id) => ipcRenderer.invoke("get-bonus", { id }),

  checkTossup: (questionId, answer, buzzPosition, sessionId, extra = {}) =>
    ipcRenderer.invoke("check-tossup", { questionId, answer, buzzPosition, sessionId, ...extra }),

  checkBonus: (questionId, answers, sessionId, strictness, overrides, previous, skipped) =>
    ipcRenderer.invoke("check-bonus", { questionId, answers, sessionId, strictness, overrides, previous, skipped }),

  evaluateBonusPart: (questionId, part, answer, strictness, previous) =>
    ipcRenderer.invoke("evaluate-bonus-part", { questionId, part, answer, strictness, previous }),
  evaluateTossup: (questionId, answer, strictness, buzzPosition, previous) =>
    ipcRenderer.invoke("evaluate-tossup", { questionId, answer, strictness, buzzPosition, previous }),

  evaluateAnswerLine: (answerline, sanitized, answer, strictness, previous) =>
    ipcRenderer.invoke("evaluate-answer", { answerline, sanitized, answer, strictness, previous }),
  parseAnswerline: (answerline, sanitized) =>
    ipcRenderer.invoke("parse-answerline", { answerline, sanitized }),
  getProfileSettings: () => ipcRenderer.invoke("get-profile-settings"),
  saveProfileSettings: (settings) => ipcRenderer.invoke("save-profile-settings", { settings }),
  getReviewDue: (opts) => ipcRenderer.invoke("get-review-due", opts || {}),
  reviewManual: (questionId, add, type) => ipcRenderer.invoke("review-manual", { questionId, add, type }),
  clearReview: () => ipcRenderer.invoke("clear-review"),
  dismissReview: (questionId) => ipcRenderer.invoke("dismiss-review", { questionId }),
  getPluginData: (plugin, key) => ipcRenderer.invoke("get-plugin-data", { plugin, key }),
  setPluginData: (plugin, key, value) => ipcRenderer.invoke("set-plugin-data", { plugin, key, value }),
  pluginSql: (plugin, sql, params) => ipcRenderer.invoke("plugin-sql", { plugin, sql, params }),

  toggleStar: (questionId, type) =>
    ipcRenderer.invoke("toggle-star", { questionId, type }),

  getStarred: (type) => ipcRenderer.invoke("get-starred", { type }),

  checkStarred: (questionId, type) =>
    ipcRenderer.invoke("check-starred", { questionId, type }),

  getStats: (sessionId, since, categoryIds) => ipcRenderer.invoke("get-stats", { sessionId, since, categoryIds }),
  getActivity: (tz) => ipcRenderer.invoke("get-activity", { tz }),

  getSessions: () => ipcRenderer.invoke("get-sessions"),

  getSessionBreakdown: (category, difficulty, categoryIds) => ipcRenderer.invoke("get-session-breakdown", { category, difficulty, categoryIds }),

  getSessionEntries: (sessionId) => ipcRenderer.invoke("get-session-entries", { sessionId }),

  getAllSessionEntries: (opts) => ipcRenderer.invoke("get-all-session-entries", opts || {}),

  getAnswerPowers: () => ipcRenderer.invoke("get-answer-powers"),

  pruneSessions: (days) => ipcRenderer.invoke("prune-sessions", { days }),

  importQuestions: (sets, tossups, bonuses) =>
    ipcRenderer.invoke("import-questions", { sets, tossups, bonuses }),

  readArtFile: (name) => ipcRenderer.invoke("read-art-file", { name }),

  deleteSession: (id) => ipcRenderer.invoke("delete-session", { id }),

  getProfiles: () => ipcRenderer.invoke("get-profiles"),

  getActiveProfile: () => ipcRenderer.invoke("get-active-profile"),

  createProfile: (name) => ipcRenderer.invoke("create-profile", { name }),

  setActiveProfile: (id) => ipcRenderer.invoke("set-active-profile", { id }),

  deleteProfile: (id) => ipcRenderer.invoke("delete-profile", { id }),

  getSetPackets: (setName) => ipcRenderer.invoke("get-set-packets", { setName }),

  getPacketsForSet: (setName) => ipcRenderer.invoke("get-packets-for-set", { setName }),

  getPacketContent: (setName, packetNumber) => ipcRenderer.invoke("get-packet-content", { setName, packetNumber }),

  getFrequentAnswers: (category, subcategory, alternateSubcategory, limit, qtype, nodeId, offset, nodeIds) => ipcRenderer.invoke("get-frequent-answers", { category, subcategory, alternateSubcategory, limit, qtype, nodeId, offset, nodeIds }),

  getCategoryTree: (type) => ipcRenderer.invoke("get-category-tree", { type }),

  getDbInfo: () => ipcRenderer.invoke("get-db-info"),
  cloud: (method, path, body) => ipcRenderer.invoke("cloud", { method, path, body }),
  getTagVocab: () => ipcRenderer.invoke("get-tag-vocab"),
  getTagFacets: (type, query, filters) => ipcRenderer.invoke("get-tag-facets", { type, query, filters }),

  checkUpdate: () => ipcRenderer.invoke("check-update"),
  dbUpdateStatus: () => ipcRenderer.invoke("db-update-status"),
  dbUpdateStart: () => ipcRenderer.invoke("db-update-start"),
  dbUpdateCommit: () => ipcRenderer.invoke("db-update-commit"),

  applyUpdate: (folderId) => ipcRenderer.invoke("apply-update", { folderId }),

  onUpdateProgress: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on("update-progress", handler);
    return () => ipcRenderer.removeListener("update-progress", handler);
  },

  // in-app CODE updater (renderer + plugins overlay)
  appUpdateInfo: () => ipcRenderer.invoke("app-update-info"),
  appUpdateCheck: () => ipcRenderer.invoke("app-update-check"),
  appUpdatePeek: () => ipcRenderer.invoke("app-update-peek"),
  appUpdatePlugins: () => ipcRenderer.invoke("app-update-plugins"),
  onAppUpdateDownloaded: (cb) => {
    const handler = (_e, info) => cb(info);
    ipcRenderer.on("app-update-downloaded", handler);
    return () => ipcRenderer.removeListener("app-update-downloaded", handler);
  },
  onAppUpdateProgress: (cb) => {
    const handler = (_e, info) => cb(info);
    ipcRenderer.on("app-update-progress", handler);
    return () => ipcRenderer.removeListener("app-update-progress", handler);
  },
  relaunchApp: () => ipcRenderer.invoke("app-relaunch"),
  // Real Chromium page zoom — scales layout, vh/vw and canvases coherently,
  // exactly like a browser's Cmd+/- (CSS zoom does not).
  setZoomFactor: (f) => { try { webFrame.setZoomFactor(Number(f) || 1); } catch {} },
});
