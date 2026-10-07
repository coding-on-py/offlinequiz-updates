/**
 * Main-process RUNTIME (over-the-air updatable).
 *
 * electron-main.js is a thin bootstrap frozen into the DMG; everything that
 * actually builds the window and registers IPC lives HERE, alongside the rest
 * of src/main — so it ships in the SIGNED main bundle and can be updated
 * without a new DMG. Window options, new IPC channels, menus and the dock icon
 * are all changeable over the air.
 *
 * It must never `import "electron"`: every Electron API arrives through the
 * `env` object the bootstrap passes in, so this file resolves cleanly whether
 * it is loaded from inside the asar or from the overlay directory.
 */
import { join } from "node:path";
import { pickDbPath } from "./updater.js";
import { readFileSync } from "node:fs";

export async function start(env) {
  const { app, BrowserWindow, ipcMain, Menu, dialog, appUpdater, isDev, App, paths } = env;
  const { appDir, overlayDir: OVERLAY_DIR, bundledIndex: BUNDLED_INDEX, dbPath, userDbPath } = paths;
  const __dirname = appDir;

  let mainWindow = null;
  let qbApp = null;

  // A question database downloaded by the in-app updater lives in userData
  // (writable, survives reinstalling the app) and is used over the copy
  // bundled with the app when it is newer. Dev keeps the repo's data/ copy.
  async function initApp() {
    const dbInstallPath = isDev ? dbPath : join(app.getPath("userData"), "questions.db");
    let openPath = dbPath;
    try { openPath = pickDbPath(dbPath, dbInstallPath); } catch { openPath = dbPath; }
    qbApp = new App({ dbPath: openPath, userDbPath, dbInstallPath }).init();
  }

  // Load the signature-verified overlay preload when present — it ships with
  // the signed main bundle and must match the overlay backend's IPC surface.
  function safeOverlayPreload() {
    try { return appUpdater.preloadOverride(OVERLAY_DIR); } catch { return null; }
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      fullscreen: true,
      title: "OfflineQuiz",
      backgroundColor: "#0d1117",
      webPreferences: {
        preload: (!isDev && safeOverlayPreload()) || join(__dirname, "src", "main", "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    // A relaunch ("Restart now to apply") can come back windowed: macOS
    // restores the previous window state, and quitting out of a fullscreen
    // space makes the constructor flag unreliable. Enforce it once the window
    // is actually ready, and again after the page loads.
    const goFullScreen = () => {
      try { if (mainWindow && !mainWindow.isFullScreen()) mainWindow.setFullScreen(true); } catch (e) {}
    };
    try { mainWindow.once("ready-to-show", goFullScreen); } catch (e) {}
    try { mainWindow.webContents.once("did-finish-load", goFullScreen); } catch (e) {}

    let indexPath = BUNDLED_INDEX;
    try { if (!isDev) indexPath = appUpdater.overlayRendererIndex(OVERLAY_DIR) || BUNDLED_INDEX; } catch { indexPath = BUNDLED_INDEX; }
    mainWindow.loadFile(indexPath);
  }


  function parseFilters(data) {
    const f = {};
    if (data.categories?.length) f.categories = data.categories;
    if (data.subcategories?.length) f.subcategories = data.subcategories;
    if (data.alternateSubcategories?.length) f.alternateSubcategories = data.alternateSubcategories;
    if (data.categoryIds?.length) f.categoryIds = Array.isArray(data.categoryIds) ? data.categoryIds : String(data.categoryIds).split(",").filter(Boolean);
    if (data.includeUnplayable === true || data.includeUnplayable === "true" || data.includeUnplayable === "1") f.includeUnplayable = true;
    if (data.cleanOnly === true || data.cleanOnly === "true" || data.cleanOnly === "1") f.cleanOnly = true;
    if (data.difficulties?.length) f.difficulties = data.difficulties;
    if (data.setIds?.length) f.setIds = data.setIds;
    if (data.setNames?.length) f.setNames = data.setNames;
    if (data.packetNumbers) f.packetNumbers = String(data.packetNumbers).split(",").map(Number).filter((n) => !isNaN(n));
    if (data.standard !== undefined && data.standard !== null) f.standard = data.standard;
    if (data.limit) f.limit = data.limit;
    if (data.offset) f.offset = data.offset;
    if (data.random) f.random = true;
    if (data.powermarkOnly === true || data.powermarkOnly === "true") f.powermarkOnly = true;
    if (data.starredOnly === true || data.starredOnly === "true") f.starredOnly = true;
    if (data.yearMin !== undefined && data.yearMin !== null && data.yearMin !== "") {
      const y = parseInt(data.yearMin);
      if (!isNaN(y)) f.yearMin = y;
    }
    if (data.yearMax !== undefined && data.yearMax !== null && data.yearMax !== "") {
      const y = parseInt(data.yearMax);
      if (!isNaN(y)) f.yearMax = y;
    }
    // Keep in lockstep with server.js parseFilters (dual-transport parity).
    if (typeof data.sort === "string" && data.sort) f.sort = data.sort;   // whitelisted in database.js
    if (typeof data.exclude === "string" && data.exclude) f.exclude = data.exclude;   // words; database.js builds the FTS
    if (typeof data.excludeIn === "string" && data.excludeIn) f.excludeIn = data.excludeIn;
    // tags: JSON string (query-string form) or array — database.js normalizes it
    if ((typeof data.tags === "string" && data.tags) || (Array.isArray(data.tags) && data.tags.length)) f.tags = data.tags;
    return f;
  }

  function registerIpc() {
    ipcMain.handle("get-sets", () => {
      return { sets: qbApp.getSets() };
    });

    ipcMain.handle("get-categories", (_e, { type }) => {
      return { categories: qbApp.getCategories(type || "tossups") };
    });

    ipcMain.handle("get-subcategories", (_e, { type, category }) => {
      return { subcategories: qbApp.getSubcategories(type || "tossups", category || null) };
    });

    ipcMain.handle("get-alternate-subcategories", (_e, { type, category, subcategory }) => {
      return { alternateSubcategories: qbApp.getAlternateSubcategories(type || "tossups", category || null, subcategory || null) };
    });

    ipcMain.handle("get-difficulty-range", (_e, { type }) => {
      return qbApp.questionDb.getDifficultyRange(type || "tossups");
    });

    ipcMain.handle("get-count", (_e, { type, filters }) => {
      return { count: qbApp.getCount(type || "tossups", parseFilters(filters || {})) };
    });

    ipcMain.handle("get-random-tossup", (_e, { filters }) => {
      const tossup = qbApp.getRandomTossup(parseFilters(filters || {}));
      return { tossup };
    });

    ipcMain.handle("get-random-bonus", (_e, { filters }) => {
      const bonus = qbApp.getRandomBonus(parseFilters(filters || {}));
      return { bonus };
    });

    ipcMain.handle("search-tossups", (_e, { query, filters }) => {
      return qbApp.searchTossups(query, parseFilters(filters || {}));
    });

    ipcMain.handle("search-bonuses", (_e, { query, filters }) => {
      return qbApp.searchBonuses(query, parseFilters(filters || {}));
    });

    ipcMain.handle("query-tossups", (_e, { filters }) => {
      return qbApp.queryTossups(parseFilters(filters || {}));
    });

    ipcMain.handle("query-bonuses", (_e, { filters }) => {
      return qbApp.queryBonuses(parseFilters(filters || {}));
    });

    ipcMain.handle("get-tossup", (_e, { id }) => {
      return { tossup: qbApp.getTossup(id) };
    });

    ipcMain.handle("get-bonus", (_e, { id }) => {
      return { bonus: qbApp.getBonus(id) };
    });

    ipcMain.handle("check-tossup", (_e, { questionId, answer, buzzPosition, sessionId, fullyRead, strictness, overriding, allowPrompt, record, previous, correct: ovrCorrect, isPower: ovrPower, points: ovrPoints, celerity: ovrCelerity }) => {
      const tossup = qbApp.getTossup(questionId);
      if (!tossup) return { error: "Question not found" };

      if (!overriding && allowPrompt !== false) {
        const ev = qbApp.evaluateTossup(answer, tossup, strictness, fullyRead ? null : buzzPosition, previous || null);
        if (ev.status === "prompt") {
          return { prompted: true, prompt: ev.prompt, antiprompt: !!ev.antiprompt, answer: tossup.answer_sanitized };
        }
      }

      let result;
      if (overriding) {
        result = {
          isCorrect: ovrCorrect,
          isPower: ovrPower,
          points: ovrPoints,
          celerity: ovrCelerity != null ? ovrCelerity : 0,
          buzzPosition: buzzPosition || 0,
        };
      } else {
        result = qbApp.scoreTossupResult(answer, tossup, buzzPosition || 0, fullyRead, strictness, previous || null);
      }

      if (record !== false) {
        const entry = {
          session_id: sessionId || "default",
          type: "tossup",
          question_id: questionId,
          category: tossup.category,
          subcategory: tossup.subcategory,
          difficulty: tossup.difficulty,
          correct: result.isCorrect ? 1 : 0,
          points: result.points,
          celerity: result.celerity,
          buzz_position: result.buzzPosition,
          given_answer: answer || "",
        };
        if (overriding) qbApp.recordOverride(entry); else qbApp.addSessionEntry(entry);
      }

      return {
        correct: result.isCorrect,
        points: result.points,
        isPower: result.isPower,
        celerity: result.celerity,
        answer: tossup.answer_sanitized,
        unsure: !!result.unsure,
      };
    });

    ipcMain.handle("evaluate-bonus-part", (_e, { questionId, part, answer, strictness, previous }) => {
      const bonus = qbApp.getBonus(questionId);
      if (!bonus) return { error: "Question not found" };
      const ev = qbApp.evaluateBonusPart(answer, bonus, Number(part), strictness, previous || null);
      if (!ev) return { error: "No such part" };
      return { status: ev.status, prompt: ev.prompt, antiprompt: !!ev.antiprompt, unsure: !!ev.unsure };
    });
    ipcMain.handle("evaluate-tossup", (_e, { questionId, answer, strictness, buzzPosition, previous }) => {
      const tossup = qbApp.getTossup(questionId);
      if (!tossup) return { error: "Question not found" };
      const ev = qbApp.evaluateTossup(answer, tossup, strictness, buzzPosition ?? null, previous || null);
      return { status: ev.status, prompt: ev.prompt, antiprompt: !!ev.antiprompt, unsure: !!ev.unsure, answer: tossup.answer_sanitized, answerRaw: tossup.answer };
    });

    ipcMain.handle("evaluate-answer", (_e, { answerline, sanitized, answer, strictness, previous }) => {
      const ev = qbApp.evaluateAnswerLine(answer, answerline || "", sanitized || "", strictness, previous || null);
      return { status: ev.status, prompt: ev.prompt, antiprompt: !!ev.antiprompt, unsure: !!ev.unsure };
    });

    ipcMain.handle("parse-answerline", (_e, { answerline, sanitized }) => {
      return qbApp.parseAnswerline(answerline, sanitized);
    });

    ipcMain.handle("get-profile-settings", () => ({ settings: qbApp.getProfileSettings() }));
    ipcMain.handle("save-profile-settings", (_e, { settings }) => qbApp.saveProfileSettings(settings || {}));
    ipcMain.handle("get-review-due", (_e, opts) => qbApp.getReviewQueue(opts || {}));
    ipcMain.handle("get-plugin-data", (_e, { plugin, key }) => ({ value: qbApp.getPluginData(plugin || "", key || "") }));
    ipcMain.handle("plugin-sql", (_e, { plugin, sql, params }) => {
      try { return qbApp.pluginSql(plugin, sql, params); }
      catch (err) { return { error: err.message }; }
    });
    ipcMain.handle("set-plugin-data", (_e, { plugin, key, value }) => qbApp.setPluginData(plugin || "", key || "", value));
    ipcMain.handle("dismiss-review", (_e, { questionId }) => qbApp.dismissReview(questionId));
    ipcMain.handle("clear-review", () => qbApp.clearReview());
    ipcMain.handle("review-manual", (_e, { questionId, add, type }) => (add === false ? qbApp.removeReviewManual(questionId) : qbApp.addReviewManual(questionId, type)));

    ipcMain.handle("check-bonus", (_e, { questionId, answers, sessionId, strictness, overrides, previous }) => {
      const bonus = qbApp.getBonus(questionId);
      if (!bonus) return { error: "Question not found" };

      const result = qbApp.scoreBonusResult(answers || [], bonus, parseInt(strictness) || 10, overrides, previous);

      qbApp.addSessionEntry({
        session_id: sessionId || "default",
        type: "bonus",
        question_id: questionId,
        category: bonus.category,
        subcategory: bonus.subcategory,
        difficulty: bonus.difficulty,
        correct: result.totalPoints > 0 ? 1 : 0,
        points: result.totalPoints,
        bonus_parts_correct: result.partsCorrect,
      });

      return {
        totalPoints: result.totalPoints,
        partsCorrect: result.partsCorrect,
        parts: result.parts,
        answers: JSON.parse(bonus.answers_sanitized || "[]"),
      };
    });

    ipcMain.handle("toggle-star", (_e, { questionId, type }) => {
      if (qbApp.isStarred(questionId, type)) {
        qbApp.unstarQuestion(questionId, type);
        return { starred: false };
      } else {
        qbApp.starQuestion(questionId, type);
        return { starred: true };
      }
    });

    ipcMain.handle("get-starred", (_e, { type }) => {
      return { starred: qbApp.getStarredItems(type || null) };
    });

    ipcMain.handle("check-starred", (_e, { questionId, type }) => {
      return { starred: qbApp.isStarred(questionId, type) };
    });

    ipcMain.handle("get-profiles", () => {
      return { profiles: qbApp.getProfiles() };
    });

    ipcMain.handle("get-active-profile", () => {
      return { profile: qbApp.getActiveProfile() };
    });

    ipcMain.handle("create-profile", (_e, { name }) => {
      return { profile: qbApp.createProfile(name) };
    });

    ipcMain.handle("set-active-profile", (_e, { id }) => {
      qbApp.setActiveProfile(id);
      return { ok: true };
    });

    ipcMain.handle("delete-profile", (_e, { id }) => {
      qbApp.deleteProfile(id);
      return { ok: true };
    });

    ipcMain.handle("get-stats", (_e, { sessionId, since, categoryIds }) => {
      if (sessionId) {
        return { stats: qbApp.getSessionStats(sessionId) };
      }
      return { stats: qbApp.getOverallStats(parseInt(since) || 0, categoryIds || "") };
    });

    ipcMain.handle("get-sessions", () => {
      return { sessions: qbApp.getSessionList() };
    });

    ipcMain.handle("get-session-breakdown", (_e, { category, difficulty, categoryIds } = {}) => {
      return { breakdown: qbApp.getSessionBreakdown(category, difficulty, categoryIds || "") };
    });

    ipcMain.handle("get-session-entries", (_e, { sessionId } = {}) => {
      return { entries: qbApp.getSessionEntries(sessionId) };
    });

    ipcMain.handle("get-all-session-entries", (_e, opts = {}) => {
      return { entries: qbApp.getAllSessionEntries(opts || {}) };
    });

    ipcMain.handle("get-answer-powers", () => {
      return qbApp.getAnswerPowers();
    });

    ipcMain.handle("prune-sessions", (_e, { days } = {}) => {
      const r = qbApp.deleteSessionsOlderThan(days);
      return { deleted: (r && r.changes) || 0 };
    });

    ipcMain.handle("import-questions", (_e, { sets, tossups, bonuses }) => {
      return qbApp.importQuestions(sets, tossups, bonuses);
    });

    ipcMain.handle("read-art-file", (_e, { name }) => {
      try {
        const filePath = join(__dirname, "src", "renderer", "art", name + ".txt");
        return { text: readFileSync(filePath, "utf-8") };
      } catch { return { text: "" }; }
    });

    ipcMain.handle("delete-session", (_e, { id }) => {
      qbApp.deleteSession(id);
      return { ok: true };
    });

    ipcMain.handle("get-set-packets", (_e, { setName }) => {
      return { packets: qbApp.getSetPackets(setName || "") };
    });

    ipcMain.handle("get-packets-for-set", (_e, { setName }) => {
      return { packets: qbApp.getPacketsForSet(setName || "") };
    });

    ipcMain.handle("get-packet-content", (_e, { setName, packetNumber }) => {
      return qbApp.getPacketContent(setName || "", packetNumber);
    });

    ipcMain.handle("get-frequent-answers", (_e, args) => qbApp.frequentAnswersApi(args || {}));

    ipcMain.handle("get-category-tree", (_e, { type } = {}) => {
      return { tree: qbApp.getCategoryTree(type || "tossups") };
    });

    ipcMain.handle("get-db-info", () => qbApp.getDbInfo());
    ipcMain.handle("get-tag-vocab", () => (qbApp.getTagVocab ? qbApp.getTagVocab() : { tags: {} }));
    ipcMain.handle("get-tag-facets", (_e, { type, query, filters } = {}) =>
      (qbApp.getTagFacets ? qbApp.getTagFacets(type || "tossups", query || "", parseFilters(filters || {})) : { facets: [] }));

    ipcMain.handle("db-update-status", () => qbApp.dbUpdateStatus());
    ipcMain.handle("db-update-start", () => qbApp.startDbUpdate());
    ipcMain.handle("db-update-commit", () => {
      try { return qbApp.commitDbUpdate(); }
      catch (e) { return { ok: false, error: e.message }; }
    });

    ipcMain.handle("check-update", async () => {
      try { return await qbApp.checkForUpdate(); }
      catch (e) { return { error: e.message }; }
    });

    ipcMain.handle("app-update-info", () => {
      try { return appUpdater.overlayInfo(OVERLAY_DIR); }
      catch (e) { return { configured: appUpdater.isConfigured(), active: false, version: 0 }; }
    });
    ipcMain.handle("app-update-check", async () => {
      try {
        const onProgress = (pct) => { if (mainWindow) mainWindow.webContents.send("app-update-progress", { pct: Math.round(pct * 100) }); };
        return await appUpdater.checkAndDownload(OVERLAY_DIR, onProgress);
      }
      catch (e) { return { error: e.message || String(e) }; }
    });
    ipcMain.handle("app-update-peek", async () => {
      try { return await appUpdater.checkOnly(OVERLAY_DIR); }
      catch (e) { return { error: e.message || String(e) }; }
    });
    ipcMain.handle("app-relaunch", () => { app.relaunch(); app.exit(0); });
    ipcMain.handle("app-update-plugins", () => {
      try { return appUpdater.stagedPlugins(OVERLAY_DIR); }
      catch (e) { return { version: 0, plugins: [] }; }
    });

    ipcMain.handle("apply-update", async (_e, { folderId } = {}) => {
      try {
        const onProgress = (msg) => { if (mainWindow) mainWindow.webContents.send("update-progress", msg); };
        const result = await qbApp.applyUpdate(folderId, onProgress);
        return { ok: true, result };
      } catch (e) {
        return { error: e.message };
      }
    });
  }


  // The bootstrap already waited for app.whenReady(), so start directly. Any
  // throw propagates to the bootstrap, which shows the error dialog and (via
  // its crash breadcrumb) falls back to the bundled runtime next launch.
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { role: "editMenu" },
    { role: "windowMenu" },
  ]));
  await initApp();
  registerIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  app.on("window-all-closed", () => {
    if (qbApp) qbApp.close();
    app.quit();
  });
}
