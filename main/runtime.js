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
import { join, dirname } from "node:path";
import { pickDbPath } from "./updater.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

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
    qbApp = new App({ dbPath: openPath, userDbPath, dbInstallPath, freqCacheDir: app.getPath("userData") }).init();
    // the renderer files the window runs (an update's, else the bundled ones): Buzzwords' scan
    // reads questions with that app.js's own text rules
    try { qbApp.rendererDir = dirname((!isDev && appUpdater.overlayRendererIndex(OVERLAY_DIR)) || BUNDLED_INDEX); } catch (e) {}
    // Account calls go through Chromium's network stack (the window's session):
    // it trusts the system's certificates, so sign-in and sync also work behind
    // school filters that inspect HTTPS, where Node's own fetch fails.
    qbApp.cloudFetch = (url, opts) => {
      const ses = mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && mainWindow.webContents.session;
      return ses && typeof ses.fetch === "function" ? ses.fetch(url, opts) : fetch(url, opts);
    };
  }

  // Load the signature-verified overlay preload when present — it ships with
  // the signed main bundle and must match the overlay backend's IPC surface.
  function safeOverlayPreload() {
    try { return appUpdater.preloadOverride(OVERLAY_DIR); } catch { return null; }
  }

  // macOS: the rounded icon in the Dock while the app runs (an app installed
  // before the icon changed keeps the old one in Finder until it's reinstalled).
  function setDockIcon() {
    try {
      if (process.platform !== "darwin" || !app.dock || !DOCK_ICON_PNG) return;
      const png = join(app.getPath("userData"), "dock-icon.png");
      const buf = Buffer.from(DOCK_ICON_PNG, "base64");
      if (!existsSync(png) || readFileSync(png).length !== buf.length) writeFileSync(png, buf);
      app.dock.setIcon(png);
    } catch (e) {}
  }

  function createWindow() {
    setDockIcon();
    // QB_E2E_HIDDEN=1 (automated tests only): the window is never shown
    const hidden = process.env.QB_E2E_HIDDEN === "1";
    // Opens as an ordinary window that fills the screen (maximized — like Blender), not
    // macOS full-screen mode: hidden until it's ready, then maximized and shown, so it
    // never flashes small first.
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      show: false,
      title: "OfflineQuiz",
      backgroundColor: "#0d1117",
      webPreferences: {
        preload: (!isDev && safeOverlayPreload()) || join(__dirname, "src", "main", "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    // Once, at launch (the user may resize it afterwards). macOS can restore a window
    // that was full screen when the app quit: it leaves full screen first, then fills
    // the screen.
    let filled = false;
    const fillScreen = () => {
      if (hidden || filled || !mainWindow) return;
      filled = true;
      try {
        if (mainWindow.isFullScreen()) {
          mainWindow.once("leave-full-screen", () => { try { mainWindow.maximize(); } catch (e) {} });
          mainWindow.setFullScreen(false);
        } else mainWindow.maximize();
        mainWindow.show();
      } catch (e) { try { mainWindow.show(); } catch (e2) {} }
    };
    try { mainWindow.once("ready-to-show", fillScreen); } catch (e) {}
    setTimeout(fillScreen, 4000);   // never left hidden if ready-to-show doesn't come

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

    // Buzzwords' scan, in this process (index.js buzzwordsApi: cached, and it yields while it reads)
    ipcMain.handle("analysis-buzzwords", (_e, { filters, clue }) => qbApp.buzzwordsApi(parseFilters(filters || {}), clue || {}));
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

    ipcMain.handle("check-bonus", (_e, { questionId, answers, sessionId, strictness, overrides, previous, skipped }) => {
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
        ...(skipped ? { given_answer: "(skipped)" } : {}),   // Skip: not an attempt (stats.js isSkipped)
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

    ipcMain.handle("get-activity", (_e, { tz }) => qbApp.getActivity(tz));

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
    // account, friends and sync: forwarded to the account server (index.js cloudRoute)
    ipcMain.handle("cloud", (_e, { method, path, body } = {}) => qbApp.cloudRoute(String(method || "GET"), String(path || ""), body || {}));
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

// scripts/make-icons.py writes this line (the macOS icon, 512 px PNG)
const DOCK_ICON_PNG = "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";
