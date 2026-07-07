



















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
    _saveActions: [],
    _pages: [],
    _starredProviders: [],
    _starredActions: [],
    _statsProviders: [],
    _textTransforms: [],
    _questionFilters: [],
    _resultPanels: [],
    _answerRules: [],
    _scoringRules: [],
    _settingsSections: [],
    _assets: {},
    _pluginAchievements: [],
    _achievementIcons: {},
    _achievementIconFn: null,
    _achIconContributors: [],
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  QB._registerAssets = (id, map) => { QB._assets[id] = Object.assign(QB._assets[id] || {}, map || {}); };
  function assetUrl(id, name) {
    const m = QB._assets[id]; if (!m || !name) return "";
    return m[name] || m[String(name).split("/").pop()] || "";
  }
  function resolveAssetCss(id, css) {
    if (!css || String(css).indexOf("asset:") < 0) return css;
    return String(css).replace(/asset:([^\s"')]+)/g, (m, name) => assetUrl(id, name.trim()) || m);
  }
  function loadStore(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
  function saveStore(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error("[QB] save failed", e); } }
  const persistFields = (x) => ({ id: x.id, name: x.name, version: x.version, author: x.author, description: x.description, filename: x.filename, code: x.code, enabled: x.enabled });
  function savePlugins() { saveStore(PLUGINS_KEY, QB._plugins.map(persistFields)); }
  function saveThemes() { saveStore(THEMES_KEY, QB._themes.map(persistFields)); }
  function findExt(id) { return QB._plugins.find((p) => p.id === id) || QB._themes.find((t) => t.id === id); }

  QB.on = (ev, fn) => { (QB._events[ev] = QB._events[ev] || []).push(fn); return () => QB.off(ev, fn); };
  QB.off = (ev, fn) => { if (QB._events[ev]) QB._events[ev] = QB._events[ev].filter((f) => f !== fn); };
  QB._emit = (ev, data) => { (QB._events[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error("[QB] handler", ev, e); } }); };

  QB.connect = (host) => { QB._host = host || {}; };

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

  // Shared indeterminate loading bar (CSS lives in the base app's style.css).
  QB.loadingBarHtml = (label) => {
    const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<div class="qb-loading"><div class="qb-loadbar"><div class="qb-loadbar-fill"></div></div><span>${esc(label || "Loading…")}</span></div>`;
  };

  // Right-click context menu: items = [{label, onClick, danger}] — closes on
  // click-away / Esc. Plugins get it via ctx.contextMenu.
  QB.contextMenu = (x, y, items) => {
    document.getElementById("qb-ctx-menu")?.remove();
    const list = (items || []).filter((it) => it && it.label && typeof it.onClick === "function");
    if (!list.length) return;
    const el = document.createElement("div");
    el.id = "qb-ctx-menu";
    el.className = "qb-ctx-menu";
    list.forEach((it) => {
      const b = document.createElement("button");
      b.className = "qb-ctx-item" + (it.danger ? " danger" : "");
      b.textContent = it.label;
      b.addEventListener("click", () => { el.remove(); try { it.onClick(); } catch (e) { console.error("[QB] ctx item", e); } });
      el.appendChild(b);
    });
    document.body.appendChild(el);
    const r = el.getBoundingClientRect();
    el.style.left = Math.min(x, window.innerWidth - r.width - 8) + "px";
    el.style.top = Math.min(y, window.innerHeight - r.height - 8) + "px";
    const close = (ev) => { if (!el.contains(ev.target)) { el.remove(); cleanup(); } };
    const onKey = (ev) => { if (ev.key === "Escape") { el.remove(); cleanup(); ev.stopPropagation(); } };
    const cleanup = () => { document.removeEventListener("mousedown", close, true); document.removeEventListener("keydown", onKey, true); };
    setTimeout(() => { document.addEventListener("mousedown", close, true); document.addEventListener("keydown", onKey, true); }, 0);
  };

  QB.registerPlugin = (m) => { QB._pendingManifest = m; };
  QB.registerTheme = (m) => { QB._pendingTheme = m; };

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
      setVar(name, val) {
        document.documentElement.style.setProperty(name, val);
        this._setVars = this._setVars || new Set();
        if (!this._setVars.has(name)) {
          this._setVars.add(name);
          subs.push(() => document.documentElement.style.removeProperty(name));
        }
      },
      addCSS(css) {
        const st = document.createElement("style");
        st.dataset.ext = ext.id;
        st.textContent = resolveAssetCss(ext.id, css);
        document.head.appendChild(st);
        subs.push(() => st.remove());
        return st;
      },
      asset(name) { return assetUrl(ext.id, name); },
      addStyle(css) { return this.addCSS(css); },
      registerArt(id, art) {
        art = art || {};
        try {
          window.ART = window.ART || {};
          if (art.text) window.ART[id] = art.text;
          let image = art.image || null;
          if (image && /^asset:/.test(image)) image = assetUrl(ext.id, image.slice(6)) || null;
          QB._themeArts = QB._themeArts || {};
          QB._themeArts[id] = { id, name: art.name || id, text: art.text || "", layout: art.layout || "stacked", image };
          QB._activeThemeArt = QB._themeArts[id];
          if (QB._host && QB._host.refreshArt) QB._host.refreshArt();
          subs.push(() => {
            if (QB._activeThemeArt && QB._activeThemeArt.id === id) QB._activeThemeArt = null;
            if (QB._host && QB._host.refreshArt) QB._host.refreshArt();
          });
        } catch (e) {  }
      },
      extendAppearance(opts) {
        try {
          if (QB._host && QB._host.addAppearanceOptions) {
            const remove = QB._host.addAppearanceOptions(opts);
            if (typeof remove === "function") subs.push(remove);
            return remove;
          }
        } catch (e) {}
        return () => {};
      },
      registerSettingsSection(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, location: p.location || "appearance", title: p.title, render: p.render };
        QB._settingsSections.push(rec);
        subs.push(() => { QB._settingsSections = QB._settingsSections.filter((x) => x !== rec); });
        return rec;
      },
      registerAppearancePanel(render, opts) {
        opts = opts || {};
        const rec = { pluginId: ext.id, id: ext.id + "-appearance", location: "appearance", render, _fullAppearance: true };
        if ("title" in opts) rec.title = opts.title;
        QB._settingsSections.push(rec);
        subs.push(() => { QB._settingsSections = QB._settingsSections.filter((x) => x !== rec); });
        QB._emit("theme:change", null);
        return rec;
      },
      mount(el) { document.body.appendChild(el); subs.push(() => el.remove()); return el; },
      storage: {
        get(k) { try { return JSON.parse(localStorage.getItem("qb-pl-" + ext.id + "-" + k)); } catch { return null; } },
        set(k, v) { localStorage.setItem("qb-pl-" + ext.id + "-" + k, JSON.stringify(v)); },
      },
      getSetting(k) { return QB.getSetting(ext.id, k); },
      setSetting(k, v) { QB.setSetting(ext.id, k, v); },
      onSetting(fn) { subs.push(QB.on("ext:setting", (e) => { if (e.id === ext.id) fn(e.key, e.val); })); },
      onHotkey(id, fn) { const action = ext.id + ":" + id; QB._hotkeyHandlers[action] = fn; subs.push(() => { delete QB._hotkeyHandlers[action]; }); },
      onBack(fn) { const rec = { pluginId: ext.id, fn }; QB._backHandlers.push(rec); subs.push(() => { QB._backHandlers = QB._backHandlers.filter((r) => r !== rec); }); },
      registerSaveAction(fn) {
        const rec = { pluginId: ext.id, fn };
        QB._saveActions.push(rec);
        subs.push(() => { QB._saveActions = QB._saveActions.filter((r) => r !== rec); });
        return rec;
      },
      keyLabel(id) {
        try { return (QB._host.keyDisplay && QB._host.keyDisplay(ext.id + ":" + id)) || "?"; } catch { return "?"; }
      },
      contextMenu(x, y, items) { QB.contextMenu(x, y, items); },
      loadingBarHtml(label) { return QB.loadingBarHtml(label); },
      registerPage(page) { const rec = QB._createPage(ext, page); subs.push(() => QB._removePage(rec)); return rec; },
      registerTextTransform(t) {
        const rec = { pluginId: ext.id, apply: typeof t === "function" ? t : t.apply };
        QB._textTransforms.push(rec);
        subs.push(() => { QB._textTransforms = QB._textTransforms.filter((x) => x !== rec); });
        return rec;
      },
      registerQuestionFilter(fn) {
        const rec = { pluginId: ext.id, fn };
        QB._questionFilters.push(rec);
        subs.push(() => { QB._questionFilters = QB._questionFilters.filter((x) => x !== rec); });
        return rec;
      },
      registerResultPanel(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, render: p.render };
        QB._resultPanels.push(rec);
        subs.push(() => { QB._resultPanels = QB._resultPanels.filter((x) => x !== rec); });
        return rec;
      },
      transformText(text, context) { return QB.applyTextTransforms(text, context); },
      registerAnswerRule(fn) {
        const rec = { pluginId: ext.id, fn };
        rec.remove = () => { QB._answerRules = QB._answerRules.filter((x) => x !== rec); };
        QB._answerRules.push(rec);
        subs.push(rec.remove);
        return rec;
      },
      registerScoringRule(fn) {
        const rec = { pluginId: ext.id, fn };
        rec.remove = () => { QB._scoringRules = QB._scoringRules.filter((x) => x !== rec); };
        QB._scoringRules.push(rec);
        subs.push(rec.remove);
        return rec;
      },
      db: {
        table(name) { return "plug_" + ext.id.replace(/[^a-zA-Z0-9_-]/g, "") + "__" + String(name).replace(/[^a-zA-Z0-9_]/g, ""); },
        async exec(sql, params) {
          const r = await QB._host.api.post("/api/plugin-sql", { plugin: ext.id, sql, params: params || [] });
          if (r && r.error) throw new Error(r.error);
          return r;
        },
      },
      profileStorage: {
        async get(k) {
          try { return (await QB._host.api.get("/api/plugin-data?plugin=" + encodeURIComponent(ext.id) + "&key=" + encodeURIComponent(k))).value; }
          catch { return null; }
        },
        async set(k, v) {
          try { await QB._host.api.post("/api/plugin-data", { plugin: ext.id, key: k, value: v }); } catch {}
        },
      },
      registerStatsProvider(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, title: p.title || ext.name, render: p.render };
        QB._statsProviders.push(rec);
        subs.push(() => { QB._statsProviders = QB._statsProviders.filter((x) => x !== rec); });
        return rec;
      },
      registerStarredProvider(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, title: p.title || ext.name, render: p.render };
        QB._starredProviders.push(rec);
        subs.push(() => { QB._starredProviders = QB._starredProviders.filter((x) => x !== rec); });
        return rec;
      },
      registerStarredAction(a) {
        const rec = { pluginId: ext.id, id: a.id || (ext.id + "-act"), label: a.label || ext.name, run: a.run };
        QB._starredActions.push(rec);
        subs.push(() => { QB._starredActions = QB._starredActions.filter((x) => x !== rec); });
        return rec;
      },
      registerAchievements(defs) {
        const list = Array.isArray(defs) ? defs : [defs];
        const recs = [];
        for (const d of list) {
          if (!d || !d.id) continue;
          const rec = Object.assign({ pluginId: ext.id, source: ext.name || ext.id }, d);
          QB._pluginAchievements.push(rec);
          recs.push(rec);
        }
        subs.push(() => { QB._pluginAchievements = QB._pluginAchievements.filter((x) => recs.indexOf(x) === -1); });
        return recs;
      },
      registerAchievementIcons(mapOrFn) {
        if (typeof mapOrFn === "function") {
          const prev = QB._achievementIconFn;
          QB._achievementIconFn = mapOrFn;
          const contrib = { pluginId: ext.id, kind: "fn", value: mapOrFn };
          QB._achIconContributors.push(contrib);
          subs.push(() => {
            QB._achIconContributors = QB._achIconContributors.filter((x) => x !== contrib);
            if (QB._achievementIconFn === mapOrFn) QB._achievementIconFn = prev || null;
          });
          return;
        }
        if (mapOrFn && typeof mapOrFn === "object") {
          const contrib = { pluginId: ext.id, kind: "map", value: Object.assign({}, mapOrFn) };
          QB._achIconContributors.push(contrib);
          Object.assign(QB._achievementIcons, contrib.value);
          subs.push(() => {
            QB._achIconContributors = QB._achIconContributors.filter((x) => x !== contrib);
            const rebuilt = {};
            for (const c of QB._achIconContributors) { if (c.kind === "map") Object.assign(rebuilt, c.value); }
            QB._achievementIcons = rebuilt;
          });
        }
      },
      setBackground(value) {
        try {
          if (!value) { document.body.style.background = ""; return; }
          let css;
          if (/^(https?:|data:image|blob:|\.?\/)/.test(value) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)) {
            css = `url("${value}") center/cover no-repeat fixed, var(--bg)`;
          } else {
            css = value;
          }
          document.body.style.background = css;
          if (!ext._bgSubbed) {
            ext._bgSubbed = true;
            subs.push(() => { document.body.style.background = ""; ext._bgSubbed = false; });
          }
        } catch (e) {}
      },
      playSound(name) { try { QB._host.playSound && QB._host.playSound(name); } catch (e) {} },
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
    new Function("QB", code)(QB);
    return { plugin: QB._pendingManifest, theme: QB._pendingTheme };
  }

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
  QB.getPluginSetting = QB.getSetting;
  QB.setPluginSetting = QB.setSetting;

  function finalizePlugin(filename, code, manifest) {
    if (!manifest || !manifest.id) { QB.toast("Plugin must call QB.registerPlugin({ id, ... })", "error"); return null; }
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
  QB.isPluginEnabled = (id) => { const p = QB._plugins.find((x) => x.id === id); return !!(p && p._enabledRuntime); };
  QB.getEnabledPlugins = () => QB._plugins.filter((p) => p._enabledRuntime).map((p) => p.id);

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
    // Pages that borrow the filters panel always open with its sections collapsed.
    try { QB._host.collapseFilterSections && QB._host.collapseFilterSections(); } catch (err) {}
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    rec.screenEl.classList.add("active");
    QB._emit("screen:change", { name: combined });
    if (typeof rec.onShow === "function") { try { rec.onShow(rec.body); } catch (e) { console.error(e); } }
    return true;
  };

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
    QB._emit("theme:change", null);
  };
  QB.removeTheme = (id) => { QB.disableTheme(id); QB._themes = QB._themes.filter((t) => t.id !== id); saveThemes(); };

  function declarativeThemeCode(mf, cssText) {
    const D = {
      id: mf.id, name: mf.name || mf.id, version: mf.version || "1.0",
      author: mf.author || "unknown", description: mf.description || "",
      settings: Array.isArray(mf.settings) ? mf.settings : [],
      appearance: mf.appearance, vars: mf.vars || null, css: cssText || "",
    };
    return "(function(){var D=" + JSON.stringify(D) + ";QB.registerTheme({" +
      "id:D.id,name:D.name,version:D.version,author:D.author,description:D.description," +
      "settings:D.settings,appearance:D.appearance,onEnable:function(ctx){" +
      "if(D.css)ctx.addCSS(D.css);" +
      "if(D.vars)for(var k in D.vars)ctx.setVar(k,D.vars[k]);" +
      "function ap(){for(var i=0;i<D.settings.length;i++){var s=D.settings[i];var v=ctx.getSetting(s.key);" +
      "if(s.var){if(v!=null&&v!=='')ctx.setVar(s.var,v);if(s.varDim&&/^#[0-9a-fA-F]{6}$/.test(v))ctx.setVar(s.varDim,v+'33');continue;}" +
      "var a='data-t-'+s.key;" +
      "if(s.type==='toggle')document.documentElement.toggleAttribute(a,!!v);" +
      "else document.documentElement.setAttribute(a,v==null?'':String(v));}}" +
      "ap();ctx.onSetting(function(){ap();});" +
      "ctx._unsub.push(function(){for(var i=0;i<D.settings.length;i++)document.documentElement.removeAttribute('data-t-'+D.settings[i].key);});" +
      "}});})();";
  }

  function assetPreamble(id, fileMap) {
    if (!id) return "";
    const assets = {};
    for (const p of Object.keys(fileMap)) { const v = fileMap[p]; if (typeof v === "string" && v.slice(0, 5) === "data:") assets[p.split("/").pop()] = v; }
    return Object.keys(assets).length ? "QB._registerAssets(" + JSON.stringify(id) + "," + JSON.stringify(assets) + ");\n" : "";
  }

  QB.installPackage = (fileMap) => {
    const paths = Object.keys(fileMap);
    let entry = null, manifest = null;
    const mfPath = paths.find((p) => /(^|\/)(theme|plugin|manifest)\.json$/i.test(p));
    if (mfPath) { try { manifest = JSON.parse(fileMap[mfPath]); if (manifest.entry) entry = manifest.entry; } catch (e) { QB.toast("Bad manifest JSON: " + e.message, "error"); return null; } }
    const resolvePath = (name) => paths.find((p) => p.endsWith("/" + name) || p === name);

    // Multifile packages: manifest.files is an ordered list of .js files that
    // are combined into one script sharing a single top-level scope.
    let code = null, filename = null;
    if (manifest && Array.isArray(manifest.files) && manifest.files.length) {
      const parts = [];
      for (const f of manifest.files) {
        const p = resolvePath(f);
        if (!p) { QB.toast("Package is missing a file listed in its manifest: " + f, "error"); return null; }
        const body = fileMap[p];
        if (typeof body !== "string" || body.slice(0, 5) === "data:") { QB.toast("manifest.files entry is not a script: " + f, "error"); return null; }
        parts.push(body);
      }
      code = parts.join("\n;\n");
      filename = String(entry || manifest.files[manifest.files.length - 1]).split("/").pop();
    } else {
      const codePath =
        (entry && resolvePath(entry)) ||
        paths.find((p) => /(^|\/)(theme|plugin)\.js$/i.test(p)) ||
        paths.find((p) => /\.js$/i.test(p));
      if (!codePath) {
        const styleList = manifest && manifest.style ? (Array.isArray(manifest.style) ? manifest.style : [manifest.style]) : [];
        const cssPaths = styleList.map(resolvePath).filter((p) => p && typeof fileMap[p] === "string");
        const cssText = cssPaths.length
          ? cssPaths.map((p) => fileMap[p]).join("\n")
          : (() => { const p = paths.find((x) => /\.css$/i.test(x)); return p ? fileMap[p] : ""; })();
        const isTheme = manifest && manifest.id && (cssText || manifest.vars || manifest.type === "theme" || /(^|\/)theme\.json$/i.test(mfPath || ""));
        if (isTheme) {
          const dcode = assetPreamble(manifest.id, fileMap) + declarativeThemeCode(manifest, cssText);
          let r; try { r = runEntry(dcode); } catch (e) { QB.toast("Invalid theme: " + e.message, "error"); return null; }
          if (r.theme) return finalizeTheme(manifest.id + ".theme.js", dcode, r.theme);
        }
        QB.toast("No .js entry or theme CSS found in the package", "error");
        return null;
      }
      code = fileMap[codePath];
      filename = codePath.split("/").pop();
    }

    // manifest.style: one CSS file or an ordered list, auto-attached on enable
    // (works for plugins and themes alike).
    let extraCss = "";
    if (manifest && manifest.style) {
      const styles = Array.isArray(manifest.style) ? manifest.style : [manifest.style];
      const cssParts = [];
      for (const s of styles) {
        const sp = resolvePath(s);
        if (sp && typeof fileMap[sp] === "string") cssParts.push(fileMap[sp]);
      }
      extraCss = cssParts.join("\n");
    }
    const finalCode = assetPreamble(manifest && manifest.id, fileMap) + (extraCss ? wrapWithCss(code, extraCss) : code);
    let r;
    try { r = runEntry(finalCode); } catch (e) { QB.toast("Invalid package: " + e.message, "error"); return null; }
    if (r.theme) return finalizeTheme(filename, finalCode, r.theme);
    if (r.plugin) return finalizePlugin(filename, finalCode, r.plugin);
    QB.toast("Package didn't call QB.registerPlugin or QB.registerTheme", "error");
    return null;
  };

  function wrapWithCss(code, cssText) {
    return "(function(){var __css=" + JSON.stringify(cssText) + ";var __ot=QB.registerTheme;var __op=QB.registerPlugin;" +
      "function __wrap(m){var oe=m.onEnable;m.onEnable=function(ctx){try{ctx.addCSS(__css);}catch(e){}if(oe)return oe.call(this,ctx);};return m;}" +
      "QB.registerTheme=function(m){return __ot.call(QB,__wrap(m));};" +
      "QB.registerPlugin=function(m){return __op.call(QB,__wrap(m));};" +
      "try{\n" + code + "\n}finally{QB.registerTheme=__ot;QB.registerPlugin=__op;}})();";
  }

  QB.boot = (host) => {
    QB.connect(host);
    QB._plugins = loadStore(PLUGINS_KEY).filter((p) => p.code);
    QB._themes = loadStore(THEMES_KEY).filter((t) => t.code);
    const t = QB._themes.find((x) => x.enabled);
    QB._themes.forEach((x) => { x._enabledRuntime = false; });
    if (t && t.code) QB.enableTheme(t.id);
    QB._plugins.forEach((p) => { p._enabledRuntime = false; if (p.enabled) QB.enablePlugin(p.id); });
  };

  function readArrayBuffer(file) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsArrayBuffer(file); });
  }
  async function inflateRaw(bytes) {
    const ds = new DecompressionStream("deflate-raw");
    const ab = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
    return new Uint8Array(ab);
  }
  const IMG_EXT = /\.(png|jpe?g|gif|webp|bmp|ico|avif|svg)$/i;
  function mimeOf(name) {
    const e = (name.split(".").pop() || "").toLowerCase();
    return { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
      webp: "image/webp", bmp: "image/bmp", ico: "image/x-icon", avif: "image/avif",
      svg: "image/svg+xml" }[e] || "application/octet-stream";
  }
  function bytesToBase64(bytes) {
    let bin = ""; const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return btoa(bin);
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
        try {
          const data = method === 0 ? comp : method === 8 ? await inflateRaw(comp) : null;
          if (data) files[name] = IMG_EXT.test(name) ? ("data:" + mimeOf(name) + ";base64," + bytesToBase64(data)) : dec.decode(data);
        } catch (e) {}
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

  QB.installZipBytes = async (bytes) => {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const files = await unzip(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength));
    if (!Object.keys(files).length) throw new Error("empty archive");
    return QB.installPackage(files);
  };

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
    } else if (def.type === "swatches") {
      let opts = typeof def.options === "function" ? def.options() : (def.options || []);
      if (!Array.isArray(opts)) opts = [];
      const sw = opts.map((o) => {
        const v = o && o.value != null ? o.value : o;
        const l = o && o.label != null ? o.label : v;
        return '<button type="button" class="ext-swatch' + (val == v ? " sel" : "") + '"' + idAttr +
          ' data-swatch="' + esc(v) + '" style="background:' + esc(v) + '" title="' + esc(l) + '"></button>';
      }).join("");
      const custom = def.custom === false ? "" :
        '<label class="ext-swatch-custom">Custom<input type="color" class="ext-setting-color"' + idAttr +
        ' value="' + esc(/^#[0-9a-fA-F]{6}$/.test(val || "") ? val : "#000000") + '"></label>';
      control = '<div class="ext-swatches">' + sw + custom + "</div>";
    } else {
      const t = def.type === "number" ? "number" : def.type === "password" ? "password" : "text";
      control = '<input type="' + t + '" class="ext-setting-input"' + idAttr + ' value="' + esc(val != null ? val : "") + '"' + (def.placeholder ? ' placeholder="' + esc(def.placeholder) + '"' : "") + ' autocomplete="off" spellcheck="false">';
    }
    return '<div class="ext-setting-row"><span class="ext-setting-label">' + esc(def.label) + "</span>" + control + "</div>";
  }
  function settingsHtml(ext, location) {
    const defs = ((ext._manifest && ext._manifest.settings) || []).filter((d) => d.type !== "hidden" && (d.location || "card") === location);
    if (!ext.enabled || !defs.length) return "";
    return defs.map((d) => settingControl(ext.id, d)).join("");
  }
  function wireSettingControls(root) {
    if (!root) return;
    root.querySelectorAll("input[data-setting-key],select[data-setting-key],textarea[data-setting-key]").forEach((el) => {
      const id = el.dataset.extId, key = el.dataset.settingKey;
      const evt = el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "input";
      el.addEventListener(evt, () => {
        const v = el.type === "checkbox" ? el.checked : (el.type === "number" ? parseFloat(el.value) : el.value);
        QB.setSetting(id, key, v);
      });
    });
    root.querySelectorAll(".ext-swatch[data-setting-key]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.extId, key = btn.dataset.settingKey;
        QB.setSetting(id, key, btn.dataset.swatch);
        root.querySelectorAll('.ext-swatch[data-setting-key="' + key + '"]').forEach((b) => b.classList.toggle("sel", b === btn));
      });
    });
    (QB._settingsSections || []).forEach((rec) => {
      if (!rec || typeof rec.render !== "function") return;
      const host = root.querySelector('[data-settings-section="' + rec.pluginId + ":" + rec.id + '"]');
      if (host) { try { rec.render(host); } catch (e) { console.error("[QB] settings section", rec.pluginId, e); } }
    });
  }

  function renderSettingsInto(container, location) {
    if (!container) return;
    const exts = QB._themes.filter((t) => t.enabled).concat(QB._plugins.filter((p) => p.enabled));
    let html = "";
    const fullPanels = location === "appearance" ? (QB._settingsSections || []).filter((s) => s._fullAppearance) : [];
    fullPanels.forEach((s) => {
      html += (s.title ? '<div class="ext-settings-group-title">' + esc(s.title) + "</div>" : "") +
        '<div class="ext-appearance-panel" data-settings-section="' + esc(s.pluginId + ":" + s.id) + '"></div>';
    });
    exts.forEach((ext) => {
      const inner = settingsHtml(ext, location);
      const sections = (QB._settingsSections || []).filter((s) => s.pluginId === ext.id && (s.location || "appearance") === location && !s._fullAppearance);
      const sectionHtml = sections.map((s) =>
        (s.title ? '<div class="ext-setting-label">' + esc(s.title) + "</div>" : "") +
        '<div data-settings-section="' + esc(ext.id + ":" + s.id) + '"></div>'
      ).join("");
      if (inner || sectionHtml) html += '<div class="ext-settings-group"><div class="ext-settings-group-title">' + esc(ext.name) + "</div>" + (inner || "") + sectionHtml + "</div>";
    });
    container.innerHTML = html;
    container.style.display = html ? "" : "none";
    wireSettingControls(container);
  }
  QB.hasAppearancePanel = () => (QB._settingsSections || []).some((s) => s._fullAppearance);
  QB.renderSettingsSections = (container) => {
    renderSettingsInto(container, "settings");
    const sec = container && container.closest(".stats-section");
    if (sec) sec.style.display = container && container.children.length ? "" : "none";
  };
  QB.renderPracticeSettings = (container) => renderSettingsInto(container, "practice");
  QB.renderAppearanceSettings = (container) => {
    renderSettingsInto(container, "appearance");
    const hint = document.getElementById("appearance-empty");
    if (hint) hint.style.display = container && container.children.length ? "none" : "";
  };

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
        '<div class="ext-section-head"><span class="ext-section-title">Themes</span></div>' +
        '<div class="ext-dropzone" id="ext-drop-theme">' + UPLOAD_ICON +
          "<div>Drag a theme <strong>.zip</strong> here</div>" +
          '<div class="ext-drop-sub"><button class="ext-link" id="ext-browse-theme">Browse</button></div>' +
          '<input type="file" id="ext-file-theme" accept=".zip" multiple hidden></div>' +
        '<div class="ext-list">' + themesHtml + "</div>" +
      "</div>" +
      '<div class="ext-section">' +
        '<div class="ext-section-head"><span class="ext-section-title">Plugins</span>' +
          (QB._plugins.length ? '<span class="ext-bulk"><button class="btn btn-sm" id="ext-enable-all">Enable all</button><button class="btn btn-sm" id="ext-disable-all">Disable all</button></span>' : "") +
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
