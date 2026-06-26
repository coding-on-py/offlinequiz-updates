import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("qbreader", {
  getSets: () => ipcRenderer.invoke("get-sets"),

  getCategories: (type) => ipcRenderer.invoke("get-categories", { type }),

  getSubcategories: (type, category) =>
    ipcRenderer.invoke("get-subcategories", { type, category }),

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

  queryBonuses: (filters) =>
    ipcRenderer.invoke("query-bonuses", { filters }),

  getTossup: (id) => ipcRenderer.invoke("get-tossup", { id }),

  getBonus: (id) => ipcRenderer.invoke("get-bonus", { id }),

  checkTossup: (questionId, answer, buzzPosition, sessionId, extra = {}) =>
    ipcRenderer.invoke("check-tossup", { questionId, answer, buzzPosition, sessionId, ...extra }),

  checkBonus: (questionId, answers, sessionId) =>
    ipcRenderer.invoke("check-bonus", { questionId, answers, sessionId }),

  evaluateTossup: (questionId, answer, strictness, buzzPosition) =>
    ipcRenderer.invoke("evaluate-tossup", { questionId, answer, strictness, buzzPosition }),

  evaluateAnswerLine: (answerline, sanitized, answer, strictness) =>
    ipcRenderer.invoke("evaluate-answer", { answerline, sanitized, answer, strictness }),
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

  getStats: (sessionId, since) => ipcRenderer.invoke("get-stats", { sessionId, since }),

  getSessions: () => ipcRenderer.invoke("get-sessions"),

  getSessionBreakdown: (category, difficulty) => ipcRenderer.invoke("get-session-breakdown", { category, difficulty }),

  getSessionEntries: (sessionId) => ipcRenderer.invoke("get-session-entries", { sessionId }),

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

  getFrequentAnswers: (category, subcategory, alternateSubcategory, limit, qtype) => ipcRenderer.invoke("get-frequent-answers", { category, subcategory, alternateSubcategory, limit, qtype }),

  checkUpdate: () => ipcRenderer.invoke("check-update"),

  applyUpdate: (folderId) => ipcRenderer.invoke("apply-update", { folderId }),

  onUpdateProgress: (cb) => {
    const handler = (_e, msg) => cb(msg);
    ipcRenderer.on("update-progress", handler);
    return () => ipcRenderer.removeListener("update-progress", handler);
  },

  // in-app CODE updater (renderer + plugins overlay)
  appUpdateInfo: () => ipcRenderer.invoke("app-update-info"),
  appUpdateCheck: () => ipcRenderer.invoke("app-update-check"),
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
});
