/**
 * OfflineQuiz — Extensions runtime (plugins + themes)
 *
 * Loaded BEFORE app.js so `window.QB` exists when the app boots.
 *
 * Everything is a `.zip` package containing a manifest (plugin.json / theme.json
 * with an "entry" .js, default plugin.js / theme.js) and that entry script.
 *
 *   - Plugins call QB.registerPlugin({ id, name, settings, onEnable, onDisable })
 *   - Themes  call QB.registerTheme({ id, name, settings, onEnable, onDisable })
 *
 * Both run in the renderer's isolated world (DOM + web APIs only). A theme is an
 * appearance/GUI package: in onEnable it uses ctx.setVar()/ctx.addCSS() (and can
 * restructure the DOM) and may declare its own settings. Only one theme is active
 * at a time. Settings can appear on the extension's card, in the [5] Settings
 * screen (location:"settings"), or in the practice panel (location:"practice").
 *
 * State is persisted in localStorage, so it behaves the same in the packaged app
 * and in `npm run dev`.
 */
(function () {
  "use strict";

  const PLUGINS_KEY = "qb-ext-plugins";
  const THEMES_KEY = "qb-ext-themes";

  const QB = {
    version: "2.0.0",
    _events: {},
    _host: {},
    _plugins: [],
    _themes: [],
    _pendingManifest: null,
    _pendingTheme: null,
    _hotkeyHandlers: {},
    _backHandlers: [],
    _saveActions: [], // "pluginId:hotkeyId" -> fn
    _pages: [],
    _starredProviders: [],
    _starredActions: [],    // {pluginId, id, label, run(questions)} — buttons on the Starred screen
    _statsProviders: [],
    _textTransforms: [],    // {pluginId, apply(text, context)} — reading text
    _questionFilters: [],   // {pluginId, fn(question, context) -> keep?}
    _resultPanels: [],      // {pluginId, render(el, resultCtx)} — result area
    _answerRules: [],       // {pluginId, fn(verdict, context) -> verdict'}
    _scoringRules: [],      // {pluginId, fn(points, context) -> points'}
  };

  // ── utils ──────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function loadStore(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
  function saveStore(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error("[QB] save failed", e); } }
  const persistFields = (x) => ({ id: x.id, name: x.name, version: x.version, author: x.author, description: x.description, filename: x.filename, code: x.code, enabled: x.enabled });
  function savePlugins() { saveStore(PLUGINS_KEY, QB._plugins.map(persistFields)); }
  function saveThemes() { saveStore(THEMES_KEY, QB._themes.map(persistFields)); }
  function findExt(id) { return QB._plugins.find((p) => p.id === id) || QB._themes.find((t) => t.id === id); }

  // ── event bus ──────────────────────────────────────────
  QB.on = (ev, fn) => { (QB._events[ev] = QB._events[ev] || []).push(fn); return () => QB.off(ev, fn); };
  QB.off = (ev, fn) => { if (QB._events[ev]) QB._events[ev] = QB._events[ev].filter((f) => f !== fn); };
  QB._emit = (ev, data) => { (QB._events[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error("[QB] handler", ev, e); } }); };

  QB.connect = (host) => { QB._host = host || {}; };

  // ── toasts ─────────────────────────────────────────────
  QB.toast = (msg, type) => {
    let host = document.getElementById("qb-toast-host");
    if (!host) { host = document.createElement("div"); host.id = "qb-toast-host"; document.body.appendChild(host); }
    const el = document.createElement("div");
    el.className = "qb-toast" + (type ? " qb-toast-" + type : "");
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 2800);
  };

  // ── registration ───────────────────────────────────────
  QB.registerPlugin = (m) => { QB._pendingManifest = m; };
  QB.registerTheme = (m) => { QB._pendingTheme = m; };

  // ── shared extension context ───────────────────────────
  function makeCtx(ext) {
    const subs = [];
    return {
      on(ev, fn) { subs.push(QB.on(ev, fn)); },
      off: QB.off,
      emit: QB._emit,
      getState: () => (QB._host.getState ? QB._host.getState() : {}),
      api: QB._host.api,
      host: QB._host,
      showScreen: (name) => QB._host.showScreen && QB._host.showScreen(name),
      toast: QB.toast,
      // appearance helpers (used by themes; available to plugins too)
      setVar(name, val) {
        document.documentElement.style.setProperty(name, val);
        subs.push(() => document.documentElement.style.removeProperty(name));
      },
      addCSS(css) {
        const st = document.createElement("style");
        st.dataset.ext = ext.id;
        st.textContent = css;
        document.head.appendChild(st);
        subs.push(() => st.remove());
        return st;
      },
      addStyle(css) { return this.addCSS(css); },
      mount(el) { document.body.appendChild(el); subs.push(() => el.remove()); return el; },
      storage: {
        get(k) { try { return JSON.parse(localStorage.getItem("qb-pl-" + ext.id + "-" + k)); } catch { return null; } },
        set(k, v) { localStorage.setItem("qb-pl-" + ext.id + "-" + k, JSON.stringify(v)); },
      },
      getSetting(k) { return QB.getSetting(ext.id, k); },
      setSetting(k, v) { QB.setSetting(ext.id, k, v); },
      onSetting(fn) { subs.push(QB.on("ext:setting", (e) => { if (e.id === ext.id) fn(e.key, e.val); })); },
      // declarative hotkeys: handler for a hotkey id declared in manifest.hotkeys
      onHotkey(id, fn) { const action = ext.id + ":" + id; QB._hotkeyHandlers[action] = fn; subs.push(() => { delete QB._hotkeyHandlers[action]; }); },
      // Esc/back: fn() should return true when it consumed the back action
      // (e.g. an in-page drill-down was popped); false lets the app navigate.
      onBack(fn) { const rec = { pluginId: ext.id, fn }; QB._backHandlers.push(rec); subs.push(() => { QB._backHandlers = QB._backHandlers.filter((r) => r !== rec); }); },
      // Contribute entries to the + save menu next to the star.
      // fn(question, type) -> [{ label, onClick }]
      registerSaveAction(fn) {
        const rec = { pluginId: ext.id, fn };
        QB._saveActions.push(rec);
        subs.push(() => { QB._saveActions = QB._saveActions.filter((r) => r !== rec); });
        return rec;
      },
      // Current binding for one of this plugin's hotkeys (live, rebind-aware).
      keyLabel(id) {
        try { return (QB._host.keyDisplay && QB._host.keyDisplay(ext.id + ":" + id)) || "?"; } catch { return "?"; }
      },
      // register a full app page (adds a nav button under "Extra:")
      registerPage(page) { const rec = QB._createPage(ext, page); subs.push(() => QB._removePage(rec)); return rec; },
      // ── practice-loop hooks (all auto-removed on disable) ──
      // Transform question text as it's READ (practice, and any plugin that
      // calls ctx.transformText) — e.g. censoring, annotations, translation.
      registerTextTransform(t) {
        const rec = { pluginId: ext.id, apply: typeof t === "function" ? t : t.apply };
        QB._textTransforms.push(rec);
        subs.push(() => { QB._textTransforms = QB._textTransforms.filter((x) => x !== rec); });
        return rec;
      },
      // Veto questions before they're served in practice (return false to
      // skip; the app refetches). Keep these FAST and side-effect free.
      registerQuestionFilter(fn) {
        const rec = { pluginId: ext.id, fn };
        QB._questionFilters.push(rec);
        subs.push(() => { QB._questionFilters = QB._questionFilters.filter((x) => x !== rec); });
        return rec;
      },
      // Render a panel under every practice result (the AI-explainer pattern,
      // formalized): render(el, { type, result, question, userAnswer }).
      registerResultPanel(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, render: p.render };
        QB._resultPanels.push(rec);
        subs.push(() => { QB._resultPanels = QB._resultPanels.filter((x) => x !== rec); });
        return rec;
      },
      // Run the registered text-transform chain (plugins reading questions
      // themselves — Coach, Flashcards, Packet Builder — should use this).
      transformText(text, context) { return QB.applyTextTransforms(text, context); },
      // ── judging hooks: edit the answer checker's RULES and the SCORING ──
      // Answer rule: fn(verdict, context) where verdict = {status, prompt?,
      // antiprompt?} and context = {userAnswer, question, buzzPosition,
      // fullyRead, strictness}. Return a new status string ("accept"/"prompt"/
      // "reject") or a verdict object to change the call; anything else keeps it.
      registerAnswerRule(fn) {
        const rec = { pluginId: ext.id, fn };
        rec.remove = () => { QB._answerRules = QB._answerRules.filter((x) => x !== rec); };
        QB._answerRules.push(rec);
        subs.push(rec.remove);
        return rec;
      },
      // Scoring rule: fn(points, context) -> number. context = {correct,
      // isPower, fullyRead, celerity, buzzPosition, question, userAnswer}.
      // Chained in registration order over the base 15/10/0/-5.
      registerScoringRule(fn) {
        const rec = { pluginId: ext.id, fn };
        rec.remove = () => { QB._scoringRules = QB._scoringRules.filter((x) => x !== rec); };
        QB._scoringRules.push(rec);
        subs.push(rec.remove);
        return rec;
      },
      // ── ctx.db: the plugin's OWN tables in user_data.db ──
      // table("decks") -> "plug_<id>__decks"; exec runs guarded SQL (SELECT
      // returns {rows}, writes return {changes}); only plug_<id>__* tables are
      // reachable — core tables are blocked server-side.
      db: {
        table(name) { return "plug_" + ext.id.replace(/[^a-zA-Z0-9_-]/g, "") + "__" + String(name).replace(/[^a-zA-Z0-9_]/g, ""); },
        async exec(sql, params) {
          const r = await QB._host.api.post("/api/plugin-sql", { plugin: ext.id, sql, params: params || [] });
          if (r && r.error) throw new Error(r.error);
          return r;
        },
      },
      // Per-PROFILE persistent storage backed by user_data.db (async). Unlike
      // ctx.storage (localStorage, per machine), this follows the profile.
      profileStorage: {
        async get(k) {
          try { return (await QB._host.api.get("/api/plugin-data?plugin=" + encodeURIComponent(ext.id) + "&key=" + encodeURIComponent(k))).value; }
          catch { return null; }
        },
        async set(k, v) {
          try { await QB._host.api.post("/api/plugin-data", { plugin: ext.id, key: k, value: v }); } catch {}
        },
      },
      // contribute a section to the STATISTICS screen ({ id, title, render(el) });
      // shown only while this plugin is enabled.
      registerStatsProvider(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, title: p.title || ext.name, render: p.render };
        QB._statsProviders.push(rec);
        subs.push(() => { QB._statsProviders = QB._statsProviders.filter((x) => x !== rec); });
        return rec;
      },
      // contribute a section to Database → Starred ({ id, title, render(el) });
      // shown only while this plugin is enabled.
      registerStarredProvider(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, title: p.title || ext.name, render: p.render };
        QB._starredProviders.push(rec);
        subs.push(() => { QB._starredProviders = QB._starredProviders.filter((x) => x !== rec); });
        return rec;
      },
      // Contribute an action BUTTON to the base "Starred" screen. a = { id?,
      // label, run(questions) } where questions = [{type, q:{id,...}}, …]. Lets a
      // plugin add features (e.g. "Run as Flashcards") without a base edit.
      registerStarredAction(a) {
        const rec = { pluginId: ext.id, id: a.id || (ext.id + "-act"), label: a.label || ext.name, run: a.run };
        QB._starredActions.push(rec);
        subs.push(() => { QB._starredActions = QB._starredActions.filter((x) => x !== rec); });
        return rec;
      },
      // Play a base sound effect by name (buzz/correct/incorrect/power/skip/star/…).
      playSound(name) { try { QB._host.playSound && QB._host.playSound(name); } catch (e) {} },
      // Launch Flashcards/Coach over specific question ids. target: "flashcards"|"coach".
      launchQuestions(target, ids) { try { return QB._host.launchQuestions ? QB._host.launchQuestions(target, ids) : false; } catch (e) { return false; } },
      goHome() { if (QB._host.goHome) QB._host.goHome(); },
      speak(text, opts) { try { const s = window.speechSynthesis; s.cancel(); const u = new SpeechSynthesisUtterance(text); Object.assign(u, opts || {}); s.speak(u); } catch {} },
      cancelSpeech() { try { window.speechSynthesis.cancel(); } catch {} },
      log: (...a) => console.log("[ext:" + ext.id + "]", ...a),
      _unsub: subs,
    };
  }

  function runEntry(code) {
    QB._pendingManifest = null; QB._pendingTheme = null;
    // eslint-disable-next-line no-new-func
    new Function("QB", code)(QB);
    return { plugin: QB._pendingManifest, theme: QB._pendingTheme };
  }

  // ── settings store (shared by plugins + themes) ────────
  function readSettings(id) { try { return JSON.parse(localStorage.getItem("qb-pl-" + id + "-settings")) || {}; } catch { return {}; } }
  function writeSettings(id, s) { try { localStorage.setItem("qb-pl-" + id + "-settings", JSON.stringify(s)); } catch {} }
  function settingDef(id, key) {
    const ext = findExt(id);
    return ((ext && ext._manifest && ext._manifest.settings) || []).find((d) => d.key === key);
  }
  QB.getSetting = (id, key) => {
    const s = readSettings(id);
    if (key in s) return s[key];
    const def = settingDef(id, key);
    return def ? def.default : undefined;
  };
  QB.setSetting = (id, key, val) => { const s = readSettings(id); s[key] = val; writeSettings(id, s); QB._emit("ext:setting", { id, key, val }); };
  // back-compat aliases
  QB.getPluginSetting = QB.getSetting;
  QB.setPluginSetting = QB.setSetting;

  // ── plugins ────────────────────────────────────────────
  function finalizePlugin(filename, code, manifest) {
    if (!manifest || !manifest.id) { QB.toast("Plugin must call QB.registerPlugin({ id, ... })", "error"); return null; }
    // Re-installing (e.g. an in-app update) must keep the user's enabled state.
    const prev = QB._plugins.find((x) => x.id === manifest.id);
    const wasEnabled = !!(prev && prev.enabled);
    if (prev && prev._enabledRuntime) { try { QB.disablePlugin(prev.id); } catch (e) {} }
    QB._plugins = QB._plugins.filter((p) => p.id !== manifest.id);
    const p = {
      id: manifest.id, name: manifest.name || manifest.id, version: manifest.version || "1.0",
      author: manifest.author || "unknown", description: manifest.description || "",
      filename, code, enabled: wasEnabled, _manifest: manifest,
    };
    QB._plugins.push(p);
    savePlugins();
    if (wasEnabled) { try { QB.enablePlugin(p.id); } catch (e) {} }
    QB.toast("Installed plugin: " + p.name);
    return p;
  }
  QB.installPlugin = (filename, code) => {
    try { const r = runEntry(code); return finalizePlugin(filename, code, r.plugin); }
    catch (e) { QB.toast("Invalid plugin: " + e.message, "error"); return null; }
  };
  QB.enablePlugin = (id) => {
    const p = QB._plugins.find((x) => x.id === id);
    if (!p || p._enabledRuntime) return;
    try {
      if (!p._manifest) p._manifest = runEntry(p.code).plugin;
      const ctx = makeCtx(p); p._ctx = ctx;
      if (typeof p._manifest.onEnable === "function") p._manifest.onEnable(ctx);
      p._enabledRuntime = true; p.enabled = true; savePlugins();
      QB._emit("plugins:changed");
    } catch (e) { console.error(e); QB.toast("Plugin '" + (p.name || id) + "' failed: " + e.message, "error"); p.enabled = false; savePlugins(); }
  };
  QB.disablePlugin = (id) => {
    const p = QB._plugins.find((x) => x.id === id); if (!p) return;
    try { if (p._manifest && typeof p._manifest.onDisable === "function" && p._ctx) p._manifest.onDisable(p._ctx); } catch (e) { console.error(e); }
    if (p._ctx) p._ctx._unsub.forEach((u) => { try { u(); } catch {} });
    p._ctx = null; p._enabledRuntime = false; p.enabled = false; savePlugins();
    QB._emit("plugins:changed");
  };
  QB.togglePlugin = (id, on) => (on ? QB.enablePlugin(id) : QB.disablePlugin(id));
  QB.removePlugin = (id) => { QB.disablePlugin(id); QB._plugins = QB._plugins.filter((p) => p.id !== id); savePlugins(); };

  // ── plugin hotkeys ─────────────────────────────────────
  QB.getActiveHotkeys = () => {
    const out = [];
    QB._plugins.forEach((p) => {
      if (!p.enabled) return;
      ((p._manifest && p._manifest.hotkeys) || []).forEach((hk) => {
        out.push({ action: p.id + ":" + hk.id, label: "[" + p.name + "] " + (hk.label || hk.id), default: hk.default || "", pluginId: p.id });
      });
    });
    return out;
  };
  QB.fireHotkey = (action) => { const fn = QB._hotkeyHandlers[action]; if (fn) { try { fn(); } catch (e) { console.error(e); } } };
  QB.getSaveActions = (question, type) => {
    const out = [];
    for (const r of QB._saveActions) {
      try { (r.fn(question, type) || []).forEach((a) => { if (a && a.label && typeof a.onClick === "function") out.push(a); }); }
      catch (e) { console.error("[QB] save action", r.pluginId, e); }
    }
    return out;
  };
  QB.handleBack = () => {
    for (const r of QB._backHandlers) {
      try { if (r.fn() === true) return true; } catch (e) { console.error("[QB] back handler", r.pluginId, e); }
    }
    return false;
  };

  // ── plugin pages ───────────────────────────────────────
  QB._createPage = (ext, page) => {
    const screenId = "ext-page-" + ext.id + "-" + page.id;
    let el = document.getElementById(screenId);
    if (!el) {
      el = document.createElement("div");
      el.id = screenId; el.className = "screen";
      el.innerHTML =
        '<div class="top-bar"><div class="top-bar-left"><span class="top-bar-title">' +
        esc(page.title || page.navLabel || ext.name) + '</span></div>' +
        '<div class="top-bar-right"><button class="btn btn-sm btn-ghost ext-page-home">Home</button></div></div>' +
        '<div class="ext-page-body"></div>';
      (document.getElementById("app") || document.body).appendChild(el);
      el.querySelector(".ext-page-home").addEventListener("click", () => QB._host.goHome && QB._host.goHome());
    }
    const rec = { id: page.id, pluginId: ext.id, navLabel: page.navLabel, title: page.title, screenEl: el, body: el.querySelector(".ext-page-body"), onShow: page.onShow, onHide: page.onHide };
    QB._pages = QB._pages.filter((p) => !(p.pluginId === ext.id && p.id === page.id));
    QB._pages.push(rec);
    QB._emit("plugins:changed");
    return rec;
  };
  QB._removePage = (rec) => { QB._pages = QB._pages.filter((p) => p !== rec); if (rec.screenEl) rec.screenEl.remove(); QB._emit("plugins:changed"); };
  QB.getActivePages = () => QB._pages.map((p) => ({ id: p.pluginId + "::" + p.id, navLabel: p.navLabel, title: p.title }));
  QB.getStarredProviders = () => QB._starredProviders.slice();
  QB.getStarredActions = () => QB._starredActions.slice();
  QB.getStatsProviders = () => QB._statsProviders.slice();
  QB.getResultPanels = () => QB._resultPanels.slice();
  QB.hasJudgingRules = () => QB._answerRules.length > 0 || QB._scoringRules.length > 0;
  // Chain the answer rules over a verdict (string status or object accepted).
  QB.applyAnswerRules = (verdict, context) => {
    let v = Object.assign({}, verdict);
    for (const r of QB._answerRules) {
      try {
        const out = r.fn(Object.assign({}, v), context || {});
        if (typeof out === "string") v.status = out;
        else if (out && typeof out === "object" && out.status) v = Object.assign({}, v, out);
      } catch (e) { console.error("[QB] answer rule", r.pluginId, e); }
    }
    return v;
  };
  QB.applyScoringRules = (points, context) => {
    let p = points;
    for (const r of QB._scoringRules) {
      try {
        const out = r.fn(p, context || {});
        if (typeof out === "number" && isFinite(out)) p = Math.round(out);
      } catch (e) { console.error("[QB] scoring rule", r.pluginId, e); }
    }
    return p;
  };
  // Apply every registered text transform in registration order; a transform
  // that throws or returns a non-string is skipped.
  QB.applyTextTransforms = (text, context) => {
    let out = String(text == null ? "" : text);
    for (const t of QB._textTransforms) {
      try {
        const r = t.apply(out, context || {});
        if (typeof r === "string") out = r;
      } catch (e) { console.error("[QB] text transform", t.pluginId, e); }
    }
    return out;
  };
  // True unless some enabled plugin's filter vetoes this question.
  QB.passesQuestionFilters = (question, context) => {
    for (const f of QB._questionFilters) {
      try { if (f.fn(question, context || {}) === false) return false; }
      catch (e) { console.error("[QB] question filter", f.pluginId, e); }
    }
    return true;
  };
  QB.showPage = (combined) => {
    const rec = QB._pages.find((p) => p.pluginId + "::" + p.id === combined);
    if (!rec) return false;
    try { QB._host.recordNav && QB._host.recordNav(combined); } catch (err) {}
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    rec.screenEl.classList.add("active");
    QB._emit("screen:change", { name: combined });
    if (typeof rec.onShow === "function") { try { rec.onShow(rec.body); } catch (e) { console.error(e); } }
    return true;
  };

  // ── themes (one active at a time) ──────────────────────
  function finalizeTheme(filename, code, manifest) {
    if (!manifest || !manifest.id) { QB.toast("Theme must call QB.registerTheme({ id, ... })", "error"); return null; }
    QB._themes = QB._themes.filter((t) => t.id !== manifest.id);
    const t = {
      id: manifest.id, name: manifest.name || manifest.id, version: manifest.version || "1.0",
      author: manifest.author || "unknown", description: manifest.description || "",
      filename, code, enabled: false, _manifest: manifest,
    };
    QB._themes.push(t);
    saveThemes();
    QB.toast("Installed theme: " + t.name);
    return t;
  }
  QB.installTheme = (filename, code) => {
    try { const r = runEntry(code); return finalizeTheme(filename, code, r.theme); }
    catch (e) { QB.toast("Invalid theme: " + e.message, "error"); return null; }
  };
  QB.enableTheme = (id) => {
    QB._themes.forEach((t) => { if (t.id !== id && t._enabledRuntime) QB.disableTheme(t.id); });
    const t = QB._themes.find((x) => x.id === id); if (!t) return;
    try {
      if (!t._manifest) t._manifest = runEntry(t.code).theme;
      const ctx = makeCtx(t); t._ctx = ctx;
      if (typeof t._manifest.onEnable === "function") t._manifest.onEnable(ctx);
      t._enabledRuntime = true; t.enabled = true;
      QB._themes.forEach((x) => { if (x.id !== id) x.enabled = false; });
      saveThemes();
      QB._emit("theme:change", t);
    } catch (e) { console.error(e); QB.toast("Theme '" + (t.name || id) + "' failed: " + e.message, "error"); }
  };
  QB.disableTheme = (id) => {
    const t = QB._themes.find((x) => x.id === id); if (!t) return;
    try { if (t._manifest && typeof t._manifest.onDisable === "function" && t._ctx) t._manifest.onDisable(t._ctx); } catch (e) { console.error(e); }
    if (t._ctx) t._ctx._unsub.forEach((u) => { try { u(); } catch {} });
    t._ctx = null; t._enabledRuntime = false; t.enabled = false; saveThemes();
    QB._emit("theme:change", null); // listeners refresh appearance UI
  };
  QB.removeTheme = (id) => { QB.disableTheme(id); QB._themes = QB._themes.filter((t) => t.id !== id); saveThemes(); };

  // ── package install (zip → auto-detect plugin vs theme) ─
  QB.installPackage = (fileMap) => {
    const paths = Object.keys(fileMap);
    let entry = null;
    const mfPath = paths.find((p) => /(^|\/)(theme|plugin|manifest)\.json$/i.test(p));
    if (mfPath) { try { const mf = JSON.parse(fileMap[mfPath]); if (mf.entry) entry = mf.entry; } catch (e) { QB.toast("Bad manifest JSON: " + e.message, "error"); return null; } }
    const codePath =
      (entry && paths.find((p) => p.endsWith("/" + entry) || p === entry)) ||
      paths.find((p) => /(^|\/)(theme|plugin)\.js$/i.test(p)) ||
      paths.find((p) => /\.js$/i.test(p));
    if (!codePath) { QB.toast("No .js entry found in the package", "error"); return null; }
    const code = fileMap[codePath];
    const filename = codePath.split("/").pop();
    let r;
    try { r = runEntry(code); } catch (e) { QB.toast("Invalid package: " + e.message, "error"); return null; }
    if (r.theme) return finalizeTheme(filename, code, r.theme);
    if (r.plugin) return finalizePlugin(filename, code, r.plugin);
    QB.toast("Package didn't call QB.registerPlugin or QB.registerTheme", "error");
    return null;
  };

  // ── boot ───────────────────────────────────────────────
  QB.boot = (host) => {
    QB.connect(host);
    QB._plugins = loadStore(PLUGINS_KEY).filter((p) => p.code);
    QB._themes = loadStore(THEMES_KEY).filter((t) => t.code); // drop legacy (pre-package) themes
    const t = QB._themes.find((x) => x.enabled);
    QB._themes.forEach((x) => { x._enabledRuntime = false; });
    if (t && t.code) QB.enableTheme(t.id);
    QB._plugins.forEach((p) => { p._enabledRuntime = false; if (p.enabled) QB.enablePlugin(p.id); });
  };

  // ── zip reading ────────────────────────────────────────
  function readArrayBuffer(file) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsArrayBuffer(file); });
  }
  async function inflateRaw(bytes) {
    const ds = new DecompressionStream("deflate-raw");
    const ab = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
    return new Uint8Array(ab);
  }
  async function unzip(arrayBuffer) {
    const u8 = new Uint8Array(arrayBuffer);
    const dv = new DataView(arrayBuffer);
    let eocd = -1;
    for (let i = u8.length - 22; i >= 0; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error("not a valid .zip");
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    const files = {};
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const compSize = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extraLen = dv.getUint16(off + 30, true);
      const commentLen = dv.getUint16(off + 32, true);
      const localOff = dv.getUint32(off + 42, true);
      const name = dec.decode(u8.subarray(off + 46, off + 46 + nameLen));
      const lNameLen = dv.getUint16(localOff + 26, true);
      const lExtraLen = dv.getUint16(localOff + 28, true);
      const dataStart = localOff + 30 + lNameLen + lExtraLen;
      const comp = u8.subarray(dataStart, dataStart + compSize);
      if (!name.endsWith("/") && !name.startsWith("__MACOSX/") && !name.endsWith(".DS_Store")) {
        try { const data = method === 0 ? comp : method === 8 ? await inflateRaw(comp) : null; if (data) files[name] = dec.decode(data); } catch (e) {}
      }
      off += 46 + nameLen + extraLen + commentLen;
    }
    return files;
  }
  async function handleZips(fileList) {
    for (const f of fileList) {
      if (!/\.zip$/i.test(f.name)) { QB.toast("Import a .zip package", "error"); continue; }
      try {
        const files = await unzip(await readArrayBuffer(f));
        if (!Object.keys(files).length) throw new Error("empty archive");
        QB.installPackage(files);
      } catch (e) { QB.toast("Could not read " + f.name + ": " + e.message, "error"); }
    }
    QB.renderScreen();
  }

  // Programmatic install from raw zip bytes (used by the in-app updater to
  // refresh plugin/theme packages). Preserves each package's enabled state.
  QB.installZipBytes = async (bytes) => {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const files = await unzip(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength));
    if (!Object.keys(files).length) throw new Error("empty archive");
    return QB.installPackage(files);
  };

  // ── starter theme (one-click; same content as the example zip) ──
  const STARTER_THEME = String.raw`
QB.registerTheme({
  id: "neon-hud",
  name: "Neon HUD",
  version: "2.0.0",
  author: "OfflineQuiz",
  description: "A GUI/HUD restyle: pick a HUD layout, choose from several color palettes, fonts, rounded corners, and a neon glow.",
  settings: [
    { key: "hud", label: "HUD layout", type: "select", location: "appearance", default: "default", options: [
      { value: "default", label: "Default" },
      { value: "compact", label: "Compact (slim panels)" },
      { value: "focus", label: "Focus (hide side stats)" } ] },
    { key: "palette", label: "Color palette", type: "select", location: "appearance", default: "synthwave", options: [
      { value: "synthwave", label: "Synthwave" },
      { value: "matrix", label: "Matrix Green" },
      { value: "amber", label: "Amber Terminal" },
      { value: "ice", label: "Ice Blue" },
      { value: "mono", label: "Monochrome" } ] },
    { key: "font", label: "Font", type: "select", location: "appearance", default: "sans", options: [
      { value: "sans", label: "Sans-serif" }, { value: "mono", label: "Monospace" }, { value: "serif", label: "Serif" } ] },
    { key: "rounded", label: "Rounded corners", type: "toggle", location: "appearance", default: true },
    { key: "glow", label: "Neon glow", type: "toggle", location: "appearance", default: true },
  ],
  onEnable: function (ctx) {
    // Each palette only changes colors; the theme's primary job is the HUD layout.
    var palettes = {
      synthwave: { accent: "#ff5dd2", bg: "#1b1035", sec: "#241246", ter: "#2e1857", text: "#f5e6ff", text2: "#c9a7ff", muted: "#7c6aa6", border: "#4a2f7a", border2: "#3a2562", green: "#36f9c3", red: "#ff5b79", yellow: "#ffd86b" , star: "#ff5dd2" },
      matrix:    { accent: "#36f9c3", bg: "#06120a", sec: "#0a1f14", ter: "#0e2a1b", text: "#d7ffe9", text2: "#7fdfb0", muted: "#4f8c6e", border: "#1a4733", border2: "#123524", green: "#36f9c3", red: "#ff6b6b", yellow: "#d8ff6b" , star: "#36f9c3" },
      amber:     { accent: "#ffb000", bg: "#160f02", sec: "#211705", ter: "#2c1f08", text: "#ffeccb", text2: "#e3b873", muted: "#8c6f3e", border: "#5a4218", border2: "#3f2f12", green: "#9bd14a", red: "#ff7a3d", yellow: "#ffd86b" , star: "#ffb000" },
      ice:       { accent: "#5dd2ff", bg: "#08131f", sec: "#0d1f30", ter: "#102840", text: "#e6f6ff", text2: "#a7d8ff", muted: "#5e84a0", border: "#234a6a", border2: "#1a3650", green: "#4af0c0", red: "#ff6b8a", yellow: "#ffe07a" , star: "#5dd2ff" },
      mono:      { accent: "#dddddd", bg: "#0d0d0d", sec: "#161616", ter: "#1e1e1e", text: "#f0f0f0", text2: "#bdbdbd", muted: "#7a7a7a", border: "#3a3a3a", border2: "#2a2a2a", green: "#cccccc", red: "#999999", yellow: "#eeeeee" , star: "#eeeeee" },
    };
    var fonts = { sans: "'Avenir Next','Segoe UI','Helvetica Neue',system-ui,sans-serif", mono: "'SF Mono','Menlo','Monaco',monospace", serif: "Georgia,'Times New Roman',serif" };
    function apply() {
      var p = palettes[ctx.getSetting("palette")] || palettes.synthwave;
      ctx.setVar("--accent", p.accent); ctx.setVar("--accent-dim", p.accent + "33");
      ctx.setVar("--bg", p.bg); ctx.setVar("--bg-secondary", p.sec); ctx.setVar("--bg-tertiary", p.ter);
      ctx.setVar("--text", p.text); ctx.setVar("--text-secondary", p.text2); ctx.setVar("--text-muted", p.muted);
      ctx.setVar("--border", p.border); ctx.setVar("--border-light", p.border2);
      ctx.setVar("--green", p.green); ctx.setVar("--green-dim", p.green + "33");
      ctx.setVar("--red", p.red); ctx.setVar("--red-dim", p.red + "33");
      ctx.setVar("--yellow", p.yellow); ctx.setVar("--yellow-dim", p.yellow + "33");
      ctx.setVar("--star", p.star || p.yellow);
      ctx.setVar("--power-mark", p.star || p.yellow);
      ctx.setVar("--font", fonts[ctx.getSetting("font")] || fonts.sans);
      ctx.setVar("--radius", ctx.getSetting("rounded") ? "12px" : "2px");
      document.documentElement.toggleAttribute("data-sw-glow", !!ctx.getSetting("glow"));
      document.documentElement.setAttribute("data-sw-hud", ctx.getSetting("hud") || "default");
    }
    apply();
    // Neon glow effect (the "coloring" exception the spec allows).
    ctx.addCSS("[data-sw-glow] .btn-primary{box-shadow:0 0 16px var(--accent-dim)} [data-sw-glow] .top-bar-title,[data-sw-glow] .title-logo pre{text-shadow:0 0 10px var(--accent-dim)} [data-sw-glow] .pill{box-shadow:0 0 8px var(--accent-dim)} [data-sw-glow] .stat-value{text-shadow:0 0 8px var(--accent-dim)}");
    // HUD layouts — the theme's main feature is changing the GUI/HUD layout.
    ctx.addCSS("[data-sw-hud='compact'] .filters-panel{width:180px;padding:8px;gap:10px} [data-sw-hud='compact'] .stats-panel{width:104px} [data-sw-hud='compact'] .top-bar{padding-top:6px;padding-bottom:6px} [data-sw-hud='focus'] .stats-panel{display:none} [data-sw-hud='focus'] .question-area{padding:32px 12%}");
    ctx.onSetting(function () { apply(); });
  },
  onDisable: function () { var d = document.documentElement; d.removeAttribute("data-sw-glow"); d.removeAttribute("data-sw-hud"); },
});
`;

  QB.installStarterTheme = () => { QB.installTheme("neon-hud.js", STARTER_THEME); QB.renderScreen(); };

  // ── settings controls ──────────────────────────────────
  function settingControl(extId, def) {
    const val = QB.getSetting(extId, def.key);
    const idAttr = ' data-ext-id="' + esc(extId) + '" data-setting-key="' + esc(def.key) + '"';
    let control = "";
    if (def.type === "toggle") {
      control = '<label class="ext-switch ext-switch-sm"><input type="checkbox"' + idAttr + (val ? " checked" : "") + '><span class="ext-slider"></span></label>';
    } else if (def.type === "select") {
      let opts = typeof def.options === "function" ? def.options() : (def.options || []);
      if (!Array.isArray(opts)) opts = [];
      control = '<select class="ext-setting-input"' + idAttr + ">" +
        opts.map((o) => { const v = o.value != null ? o.value : o; const l = o.label != null ? o.label : o; return '<option value="' + esc(v) + '"' + (val == v ? " selected" : "") + ">" + esc(l) + "</option>"; }).join("") + "</select>";
    } else if (def.type === "color") {
      control = '<input type="color" class="ext-setting-color"' + idAttr + ' value="' + esc(val || "#000000") + '">';
    } else {
      const t = def.type === "number" ? "number" : def.type === "password" ? "password" : "text";
      control = '<input type="' + t + '" class="ext-setting-input"' + idAttr + ' value="' + esc(val != null ? val : "") + '"' + (def.placeholder ? ' placeholder="' + esc(def.placeholder) + '"' : "") + ' autocomplete="off" spellcheck="false">';
    }
    return '<div class="ext-setting-row"><span class="ext-setting-label">' + esc(def.label) + "</span>" + control + "</div>";
  }
  function settingsHtml(ext, location) {
    const defs = ((ext._manifest && ext._manifest.settings) || []).filter((d) => (d.location || "card") === location);
    if (!ext.enabled || !defs.length) return "";
    return defs.map((d) => settingControl(ext.id, d)).join("");
  }
  function wireSettingControls(root) {
    if (!root) return;
    root.querySelectorAll("[data-setting-key]").forEach((el) => {
      const id = el.dataset.extId, key = el.dataset.settingKey;
      const evt = el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "input";
      el.addEventListener(evt, () => {
        const v = el.type === "checkbox" ? el.checked : (el.type === "number" ? parseFloat(el.value) : el.value);
        QB.setSetting(id, key, v);
      });
    });
  }

  // ── render: [5] Settings + practice panel ──────────────
  function renderSettingsInto(container, location) {
    if (!container) return;
    const exts = QB._themes.filter((t) => t.enabled).concat(QB._plugins.filter((p) => p.enabled));
    let html = "";
    exts.forEach((ext) => {
      const inner = settingsHtml(ext, location);
      if (inner) html += '<div class="ext-settings-group"><div class="ext-settings-group-title">' + esc(ext.name) + "</div>" + inner + "</div>";
    });
    container.innerHTML = html;
    container.style.display = html ? "" : "none";
    wireSettingControls(container);
  }
  QB.renderSettingsSections = (container) => {
    renderSettingsInto(container, "settings");
    // Hide the whole EXTENSIONS settings section when no enabled plugin/theme
    // contributes any controls (otherwise it's just an empty header).
    const sec = container && container.closest(".stats-section");
    if (sec) sec.style.display = container && container.children.length ? "" : "none";
  };
  QB.renderPracticeSettings = (container) => renderSettingsInto(container, "practice");
  // Theme-defined appearance settings, shown in the [5] APPEARANCE section.
  QB.renderAppearanceSettings = (container) => {
    renderSettingsInto(container, "appearance");
    // Show the "enable a theme" hint only when no theme contributes controls.
    const hint = document.getElementById("appearance-empty");
    if (hint) hint.style.display = container && container.children.length ? "none" : "";
  };

  // ── Extensions screen ──────────────────────────────────
  function card(ext, kind) {
    const idAttr = kind === "theme" ? "data-theme-id" : "data-plugin-id";
    const removeAttr = kind === "theme" ? "data-remove-theme" : "data-remove-plugin";
    const badge = kind === "theme" ? "theme" : "plugin";
    const onLabel = kind === "theme" ? "active" : "enabled";
    return (
      '<div class="ext-card' + (ext.enabled ? " active" : "") + '">' +
        '<div class="ext-card-row">' +
          '<div class="ext-card-main">' +
            '<div class="ext-card-title">' + esc(ext.name) +
              ' <span class="ext-badge">' + badge + "</span>" +
              (kind === "plugin" ? ' <span class="ext-ver">v' + esc(ext.version) + "</span>" : "") +
              (ext.enabled ? ' <span class="ext-badge on">' + onLabel + "</span>" : "") +
            "</div>" +
            '<div class="ext-card-desc">' + esc(ext.description || "No description") + "</div>" +
            '<div class="ext-card-meta">by ' + esc(ext.author) + (ext.filename ? " · " + esc(ext.filename) : "") + "</div>" +
          "</div>" +
          '<div class="ext-card-actions">' +
            '<label class="ext-switch"><input type="checkbox" ' + idAttr + '="' + esc(ext.id) + '"' + (ext.enabled ? " checked" : "") + '><span class="ext-slider"></span></label>' +
            '<button class="ext-remove" ' + removeAttr + '="' + esc(ext.id) + '" title="Remove">&times;</button>' +
          "</div>" +
        "</div>" +
        (settingsHtml(ext, "card") ? '<div class="ext-settings">' + settingsHtml(ext, "card") + "</div>" : "") +
        (ext.enabled && settingsHtml(ext, "settings") ? '<div class="ext-card-note">More options in Settings [5]</div>' : "") +
      "</div>"
    );
  }

  const UPLOAD_ICON =
    '<svg class="ext-drop-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 15V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>';

  QB.renderScreen = () => {
    const container = document.getElementById("extensions-container");
    if (!container) return;
    const hasTheme = QB._themes.some((t) => t.id === "synthwave84");
    const themesHtml = QB._themes.length ? QB._themes.map((t) => card(t, "theme")).join("") : '<div class="ext-empty">No themes installed yet.</div>';
    const pluginsHtml = QB._plugins.length ? QB._plugins.map((p) => card(p, "plugin")).join("") : '<div class="ext-empty">No plugins installed yet.</div>';

    container.innerHTML =
      '<div class="ext-section">' +
        '<div class="ext-section-head"><span class="ext-section-title">Themes</span><span class="ext-hint">One active at a time. .zip packages only.</span></div>' +
        '<div class="ext-dropzone" id="ext-drop-theme">' + UPLOAD_ICON +
          "<div>Drag a theme <strong>.zip</strong> here</div>" +
          '<div class="ext-drop-sub"><button class="ext-link" id="ext-browse-theme">Browse</button></div>' +
          '<input type="file" id="ext-file-theme" accept=".zip" multiple hidden></div>' +
        '<div class="ext-list">' + themesHtml + "</div>" +
      "</div>" +
      '<div class="ext-section">' +
        '<div class="ext-section-head"><span class="ext-section-title">Plugins</span><span class="ext-hint">.zip packages only.</span>' +
          (QB._plugins.length ? '<span class="ext-bulk"><button class="ext-link" id="ext-enable-all">Enable all</button><button class="ext-link" id="ext-disable-all">Disable all</button></span>' : "") +
        "</div>" +
        '<div class="ext-dropzone" id="ext-drop-plugin">' + UPLOAD_ICON +
          "<div>Drag a plugin <strong>.zip</strong> here</div>" +
          '<div class="ext-drop-sub"><button class="ext-link" id="ext-browse-plugin">Browse</button></div>' +
          '<input type="file" id="ext-file-plugin" accept=".zip" multiple hidden></div>' +
        '<div class="ext-list">' + pluginsHtml + "</div>" +
      "</div>";
    wireScreen();
  };

  function wireDropzone(zoneId, inputId, browseId) {
    const zone = document.getElementById(zoneId), input = document.getElementById(inputId), browse = document.getElementById(browseId);
    if (!zone || !input) return;
    browse && browse.addEventListener("click", () => input.click());
    // Snapshot the FileList FIRST — clearing input.value empties the live list
    // while the async installer is still iterating (only the first file
    // installed otherwise).
    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      input.value = "";
      if (files.length) handleZips(files);
    });
    ["dragenter", "dragover"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("dragging"); }));
    ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("dragging"); }));
    zone.addEventListener("drop", (e) => { const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []); if (files.length) handleZips(files); });
  }

  function wireScreen() {
    wireDropzone("ext-drop-theme", "ext-file-theme", "ext-browse-theme");
    wireDropzone("ext-drop-plugin", "ext-file-plugin", "ext-browse-plugin");
    wireSettingControls(document.getElementById("extensions-container"));
    document.querySelectorAll("#extensions-container [data-theme-id]").forEach((cb) => {
      cb.addEventListener("change", () => { if (cb.checked) QB.enableTheme(cb.dataset.themeId); else QB.disableTheme(cb.dataset.themeId); QB.renderScreen(); });
    });
    document.querySelectorAll("#extensions-container [data-plugin-id]").forEach((cb) => {
      cb.addEventListener("change", () => { QB.togglePlugin(cb.dataset.pluginId, cb.checked); QB.renderScreen(); });
    });
    document.querySelectorAll("#extensions-container [data-remove-theme]").forEach((b) => {
      b.addEventListener("click", () => { QB.removeTheme(b.dataset.removeTheme); QB.renderScreen(); });
    });
    document.querySelectorAll("#extensions-container [data-remove-plugin]").forEach((b) => {
      b.addEventListener("click", () => { QB.removePlugin(b.dataset.removePlugin); QB.renderScreen(); });
    });
    const enAll = document.getElementById("ext-enable-all");
    if (enAll) enAll.addEventListener("click", () => { QB._plugins.slice().forEach((p) => { if (!p.enabled) QB.enablePlugin(p.id); }); QB.renderScreen(); });
    const disAll = document.getElementById("ext-disable-all");
    if (disAll) disAll.addEventListener("click", () => { QB._plugins.slice().forEach((p) => { if (p.enabled) QB.disablePlugin(p.id); }); QB.renderScreen(); });
  }

  window.QB = QB;
})();
