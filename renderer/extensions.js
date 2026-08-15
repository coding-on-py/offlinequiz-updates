



















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

  // Right-click context menu. items: [{label, onClick, danger, hint}] plus
  // {sep: true} separators; opts.title renders a truncated header. Closes on
  // click-away / Esc. Plugins get it via ctx.contextMenu.
  QB.contextMenu = (x, y, items, opts) => {
    document.getElementById("qb-ctx-menu")?.remove();
    const list = (items || []).filter((it) => it && (it.sep || (it.label && typeof it.onClick === "function")));
    while (list.length && list[0].sep) list.shift();
    while (list.length && list[list.length - 1].sep) list.pop();
    if (!list.filter((it) => !it.sep).length) return;
    const el = document.createElement("div");
    el.id = "qb-ctx-menu";
    el.className = "qb-ctx-menu";
    const close = (ev) => { if (!el.contains(ev.target)) { el.remove(); cleanup(); } };
    const onKey = (ev) => { if (ev.key === "Escape") { el.remove(); cleanup(); ev.stopPropagation(); } };
    const cleanup = () => { document.removeEventListener("mousedown", close, true); document.removeEventListener("keydown", onKey, true); };
    if (opts && opts.title) {
      const h = document.createElement("div");
      h.className = "qb-ctx-title";
      h.textContent = String(opts.title).length > 46 ? String(opts.title).slice(0, 45) + "…" : String(opts.title);
      el.appendChild(h);
    }
    let lastSep = true;
    list.forEach((it) => {
      if (it.sep) {
        if (lastSep) return;
        const s = document.createElement("div");
        s.className = "qb-ctx-sep";
        el.appendChild(s);
        lastSep = true;
        return;
      }
      lastSep = false;
      const b = document.createElement("button");
      b.className = "qb-ctx-item" + (it.danger ? " danger" : "");
      b.textContent = it.label;
      if (it.hint) {
        const sp = document.createElement("span");
        sp.className = "qb-ctx-hint";
        sp.textContent = it.hint;
        b.appendChild(sp);
      }
      b.addEventListener("click", () => { el.remove(); cleanup(); try { it.onClick(); } catch (e) { console.error("[QB] ctx item", e); } });
      el.appendChild(b);
    });
    document.body.appendChild(el);
    const r = el.getBoundingClientRect();
    el.style.left = Math.min(x, window.innerWidth - r.width - 8) + "px";
    el.style.top = Math.min(y, window.innerHeight - r.height - 8) + "px";
    requestAnimationFrame(() => el.classList.add("open"));
    setTimeout(() => { document.addEventListener("mousedown", close, true); document.addEventListener("keydown", onKey, true); }, 0);
  };

  // ── Themed color picker ─────────────────────────────────────────────────
  // Replaces the OS color dialog with an in-app popover that follows the
  // active theme. Every input[type=color] anywhere (app, plugins, themes) is
  // upgraded automatically; add data-native-picker to an input to opt out.
  QB.pickColor = (opts) => {
    opts = opts || {};
    document.getElementById("qb-color-pop")?.remove();
    const hexToRgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || "").trim()); if (!m) return null; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const rgbToHex = (r, g, b) => "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
    const rgbToHsv = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      let h = 0;
      if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
      return [h, mx ? d / mx : 0, mx];
    };
    const hsvToRgb = (h, s, v) => {
      const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
      return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    };
    let hsv = (() => { const rgb = hexToRgb(opts.value) || [88, 166, 255]; return rgbToHsv(rgb[0], rgb[1], rgb[2]); })();
    const hex = () => { const rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]); return rgbToHex(rgb[0], rgb[1], rgb[2]); };

    const el = document.createElement("div");
    el.id = "qb-color-pop";
    el.className = "qb-color-pop";
    const cs = getComputedStyle(document.documentElement);
    const presets = [...new Set(["--accent", "--green", "--red", "--yellow", "--star", "--text", "--bg-tertiary"]
      .map((v) => (cs.getPropertyValue(v) || "").trim().toLowerCase())
      .filter((v) => hexToRgb(v)).concat(["#ffffff", "#000000"]))].slice(0, 9);
    el.innerHTML =
      '<div class="qb-cp-sv"><div class="qb-cp-sv-white"></div><div class="qb-cp-sv-black"></div><div class="qb-cp-thumb"></div></div>' +
      '<div class="qb-cp-hue"><div class="qb-cp-hue-thumb"></div></div>' +
      '<div class="qb-cp-row"><span class="qb-cp-preview"></span><input class="qb-cp-hex" spellcheck="false" maxlength="7" aria-label="Hex color">' +
      '<button class="qb-cp-done" type="button">Done</button></div>' +
      '<div class="qb-cp-presets">' + presets.map((p) => '<span class="qb-cp-pre" data-c="' + p + '" style="background:' + p + '"></span>').join("") + "</div>";
    document.body.appendChild(el);
    const r = (opts.anchor && opts.anchor.getBoundingClientRect) ? opts.anchor.getBoundingClientRect() : { left: innerWidth / 2 - 110, bottom: innerHeight / 3 };
    const pr = el.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(r.left, innerWidth - pr.width - 8)) + "px";
    el.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - pr.height - 8)) + "px";
    requestAnimationFrame(() => el.classList.add("open"));

    const sv = el.querySelector(".qb-cp-sv"), thumb = el.querySelector(".qb-cp-thumb");
    const hue = el.querySelector(".qb-cp-hue"), hueThumb = el.querySelector(".qb-cp-hue-thumb");
    const prev = el.querySelector(".qb-cp-preview"), hexIn = el.querySelector(".qb-cp-hex");
    const paint = (fire) => {
      sv.style.backgroundColor = "hsl(" + hsv[0] + ",100%,50%)";
      thumb.style.left = (hsv[1] * 100) + "%";
      thumb.style.top = ((1 - hsv[2]) * 100) + "%";
      hueThumb.style.left = (hsv[0] / 360 * 100) + "%";
      const h = hex();
      prev.style.background = h;
      if (document.activeElement !== hexIn) hexIn.value = h;
      if (fire && typeof opts.onChange === "function") { try { opts.onChange(h); } catch (e) {} }
    };
    const drag = (surface, apply) => {
      surface.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        surface.setPointerCapture && surface.setPointerCapture(e.pointerId);
        const move = (ev) => {
          const b = surface.getBoundingClientRect();
          apply(Math.max(0, Math.min(1, (ev.clientX - b.left) / b.width)), Math.max(0, Math.min(1, (ev.clientY - b.top) / b.height)));
          paint(true);
        };
        const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        move(e);
      });
    };
    drag(sv, (x, y) => { hsv[1] = x; hsv[2] = 1 - y; });
    drag(hue, (x) => { hsv[0] = Math.min(359.9, x * 360); });
    hexIn.addEventListener("change", () => { const rgb = hexToRgb(hexIn.value); if (rgb) { hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]); paint(true); } });
    hexIn.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); hexIn.dispatchEvent(new Event("change")); finish(); } e.stopPropagation(); });
    el.querySelectorAll(".qb-cp-pre").forEach((p) => p.addEventListener("click", () => { const rgb = hexToRgb(p.dataset.c); if (rgb) { hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]); paint(true); } }));
    const finish = () => { cleanup(); el.remove(); if (typeof opts.onDone === "function") { try { opts.onDone(hex()); } catch (e) {} } };
    const away = (ev) => { if (!el.contains(ev.target)) finish(); };
    const onKey = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); finish(); } };
    const cleanup = () => { document.removeEventListener("mousedown", away, true); document.removeEventListener("keydown", onKey, true); };
    setTimeout(() => { document.addEventListener("mousedown", away, true); document.addEventListener("keydown", onKey, true); }, 0);
    el.querySelector(".qb-cp-done").addEventListener("click", finish);
    paint(false);
  };
  document.addEventListener("click", (e) => {
    const inp = e.target && e.target.closest && e.target.closest('input[type="color"]');
    if (!inp || inp.dataset.nativePicker != null || inp.disabled) return;
    e.preventDefault();
    QB.pickColor({
      anchor: inp,
      value: inp.value,
      onChange: (v) => { inp.value = v; inp.dispatchEvent(new Event("input", { bubbles: true })); },
      onDone: (v) => { inp.value = v; inp.dispatchEvent(new Event("change", { bubbles: true })); },
    });
  }, true);

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
      contextMenu(x, y, items, opts) { QB.contextMenu(x, y, items, opts); },
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
    } catch (e) {
      console.error(e); QB.toast("Plugin '" + (p.name || id) + "' failed: " + e.message, "error");
      // Unwind whatever the failed onEnable managed to register, so a retry
      // can't stack duplicate hooks.
      if (p._ctx) { p._ctx._unsub?.forEach?.((u) => { try { u(); } catch {} }); p._ctx = null; }
      p.enabled = false; savePlugins();
    }
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
  // Fire the outgoing plugin page's onHide whenever the active screen changes
  // away from it — plugins rely on this for cleanup (timers, borrowed panel).
  QB._lastActivePage = null;
  QB.on("screen:change", () => {
    const prev = QB._lastActivePage;
    if (prev && (!prev.screenEl || !prev.screenEl.classList.contains("active"))) {
      QB._lastActivePage = null;
      try { if (typeof prev.onHide === "function") prev.onHide(); } catch (e) { console.error("[QB] onHide", e); }
    }
    const now = QB._pages.find((p) => p.screenEl && p.screenEl.classList.contains("active"));
    if (now) QB._lastActivePage = now;
  });

  QB.showPage = (combined, opts) => {
    const rec = QB._pages.find((p) => p.pluginId + "::" + p.id === combined);
    if (!rec) return false;
    const back = !!(opts && opts.back);
    // Snapshot the outgoing screen's scroll while it is still visible.
    try { QB._host.saveScreenScroll && QB._host.saveScreenScroll(); } catch (err) {}
    try { QB._host.recordNav && QB._host.recordNav(combined); } catch (err) {}
    // Fresh entries open with the borrowed panel collapsed; Back hands the
    // page back exactly as it was left.
    if (!back) { try { QB._host.collapseFilterSections && QB._host.collapseFilterSections(); } catch (err) {} }
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    rec.screenEl.classList.add("active");
    QB._emit("screen:change", { name: combined, back });
    if (typeof rec.onShow === "function") {
      try { rec.onShow(rec.body, { back, first: !rec._shown }); } catch (e) { console.error(e); }
    }
    rec._shown = true;
    try { QB._host.restoreScreenScroll && QB._host.restoreScreenScroll(rec.screenEl); } catch (err) {}
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

  // A brand-new install ships with the default theme already applied. Guarded by
  // a one-shot marker so this only ever happens on the very first launch — a
  // user who later removes every theme keeps the bare look they chose.
  const DEFAULT_THEME_KEY = "qb-default-theme-installed";
  function installDefaultThemeOnce() {
    let done = null;
    try { done = localStorage.getItem(DEFAULT_THEME_KEY); } catch (e) { return; }
    if (done || QB._themes.length) return;
    try {
      localStorage.setItem(DEFAULT_THEME_KEY, "1");
      const t = QB.installTheme(DEFAULT_THEME_FILE, STARTER_THEME);
      // installTheme stores it disabled; mark it active so boot's normal path
      // picks it up below and the first screen the user sees is themed.
      if (t) { t.enabled = true; saveThemes(); }
    } catch (e) {}
  }

  QB.boot = (host) => {
    QB.connect(host);
    QB._plugins = loadStore(PLUGINS_KEY).filter((p) => p.code);
    QB._themes = loadStore(THEMES_KEY).filter((t) => t.code);
    installDefaultThemeOnce();
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

  // The theme a fresh install ships with, embedded so first launch needs no
  // file access. Swapping the default means replacing this source AND the
  // DEFAULT_THEME_FILE name below.
  const DEFAULT_THEME_FILE = "daylight-cards-studio.js";
  const STARTER_THEME = String.raw`
/**
 * Daylight Cards Studio — a copy of "Daylight Cards" that takes over the WHOLE
 * Appearance settings section with a custom UI (ctx.registerAppearancePanel),
 * instead of the standard select/toggle controls. The base preset/custom pickers
 * are hidden; everything you see in Appearance is built by this theme.
 */
QB.registerTheme({
  id: "daylight-cards-studio",
  name: "Daylight Cards Studio",
  version: "1.3.0",
  author: "OfflineQuiz",
  description: "Light card-based restyle with a fully CUSTOM Appearance panel: palette cards, a live accent picker, font + layout buttons, and a shadow toggle — all built by the theme via registerAppearancePanel.",
  // Settings still exist (defaults + persistence) but are NOT auto-rendered —
  // location:"hidden" keeps them out of every section so our panel owns the UI.
  settings: [
    { key: "palette", type: "hidden", default: "paper" },
    { key: "accentOverride", type: "hidden", default: "" },
    { key: "font", type: "hidden", default: "sans" },
    { key: "panelSide", type: "hidden", default: "right" },
    { key: "shadows", type: "hidden", default: true },
    { key: "custom", type: "hidden", default: "" },
  ],
  onEnable: function (ctx) {
    var palettes = {
      paper:    { label: "Paper",    accent: "#2563eb", bg: "#f4f6fb", sec: "#ffffff", ter: "#eef1f7", text: "#1c2433", text2: "#475569", muted: "#94a3b8", border: "#d8dee9", border2: "#e5e9f2", green: "#15803d", red: "#dc2626", yellow: "#b45309" },
      sepia:    { label: "Sepia",    accent: "#9a3412", bg: "#f6efe3", sec: "#fffaf0", ter: "#efe6d4", text: "#3b2f23", text2: "#6b5b48", muted: "#a3937d", border: "#ddd0b8", border2: "#e8ddc9", green: "#3f6212", red: "#b91c1c", yellow: "#92600a" },
      slate:    { label: "Slate",    accent: "#0e7490", bg: "#eceff3", sec: "#f8fafc", ter: "#e2e8f0", text: "#0f172a", text2: "#475569", muted: "#8b9bb0", border: "#cbd5e1", border2: "#dbe3ec", green: "#047857", red: "#be123c", yellow: "#a16207" },
      midnight: { label: "Midnight", accent: "#5b8cff", bg: "#0f1522", sec: "#161e30", ter: "#1d2740", text: "#e8edf7", text2: "#aab6cf", muted: "#5f6c87", border: "#2b3650", border2: "#222c44", green: "#3ecf8e", red: "#ff6b7a", yellow: "#e8b339" },
    };
    var fonts = {
      sans: "'Avenir Next','Segoe UI','Helvetica Neue',system-ui,sans-serif",
      serif: "Georgia,'Iowan Old Style','Times New Roman',serif",
    };
    function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

    // Every themable part, its CSS variable, and where its palette default
    // comes from. "dim" parts also get a translucent -dim companion.
    var PARTS = [
      { v: "--bg", label: "Background", of: "bg" },
      { v: "--bg-secondary", label: "Cards", of: "sec" },
      { v: "--bg-tertiary", label: "Panels & inputs", of: "ter" },
      { v: "--text", label: "Text", of: "text" },
      { v: "--text-secondary", label: "Secondary text", of: "text2" },
      { v: "--text-muted", label: "Muted text", of: "muted" },
      { v: "--border", label: "Borders", of: "border" },
      { v: "--border-light", label: "Light borders", of: "border2" },
      { v: "--green", label: "Correct", of: "green", dim: true },
      { v: "--red", label: "Wrong", of: "red", dim: true },
      { v: "--yellow", label: "Warning", of: "yellow", dim: true },
      { v: "--star", label: "Stars", of: "accent" },
      { v: "--power-mark", label: "Power mark", of: "accent" },
    ];
    function customMap() {
      try { var m = JSON.parse(ctx.getSetting("custom") || "{}"); return m && typeof m === "object" ? m : {}; }
      catch (e) { return {}; }
    }
    function apply() {
      var p = palettes[ctx.getSetting("palette")] || palettes.paper;
      var accent = ctx.getSetting("accentOverride") || p.accent;
      var custom = customMap();
      ctx.setVar("--accent", accent); ctx.setVar("--accent-dim", accent + "22");
      ctx.setVar("--bg", p.bg); ctx.setVar("--bg-secondary", p.sec); ctx.setVar("--bg-tertiary", p.ter);
      ctx.setVar("--text", p.text); ctx.setVar("--text-secondary", p.text2); ctx.setVar("--text-muted", p.muted);
      ctx.setVar("--border", p.border); ctx.setVar("--border-light", p.border2);
      ctx.setVar("--green", p.green); ctx.setVar("--green-dim", p.green + "22");
      ctx.setVar("--red", p.red); ctx.setVar("--red-dim", p.red + "22");
      ctx.setVar("--yellow", p.yellow); ctx.setVar("--yellow-dim", p.yellow + "22");
      ctx.setVar("--star", accent); ctx.setVar("--power-mark", accent);
      ctx.setVar("--buzz-mark-self", p.green); ctx.setVar("--buzz-mark-other", p.yellow);
      PARTS.forEach(function (part) {
        var c = custom[part.v];
        if (!c || !/^#[0-9a-fA-F]{6}$/.test(c)) return;
        ctx.setVar(part.v, c);
        if (part.dim) ctx.setVar(part.v + "-dim", c + "22");
      });
      ctx.setVar("--font", fonts[ctx.getSetting("font")] || fonts.sans);
      ctx.setVar("--radius", "12px");
      var d = document.documentElement;
      d.setAttribute("data-dls", "1");
      d.setAttribute("data-dls-side", ctx.getSetting("panelSide") || "right");
      d.toggleAttribute("data-dls-shadow", ctx.getSetting("shadows") !== false);
      d.setAttribute("data-dls-art", "1");
    }
    apply();

    // ── The same card re-layout as Daylight Cards (data-dls scoped) ──
    ctx.addCSS(
      "[data-dls][data-dls-side='right'] .practice-layout{flex-direction:row-reverse}" +
      "[data-dls] .top-bar{margin:10px 14px 4px;border:1px solid var(--border);border-radius:14px;background:var(--bg-secondary);padding:10px 16px}" +
      "[data-dls] .filters-panel,[data-dls] .stats-panel{background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;margin:8px}" +
      "[data-dls-shadow] .filters-panel,[data-dls-shadow] .stats-panel,[data-dls-shadow] .top-bar,[data-dls-shadow] .qcard,[data-dls-shadow] .history-panel,[data-dls-shadow] .stats-section,[data-dls-shadow] .question-content{box-shadow:0 2px 10px rgba(15,23,42,.06)}" +
      "[data-dls] .question-area{padding:24px 28px}" +
      "[data-dls] .question-content{background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:18px 20px}" +
      "[data-dls] .history-panel,[data-dls] .stats-section{background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:14px}" +
      "[data-dls] .btn{border-radius:10px}[data-dls] .btn-primary{box-shadow:none}" +
      "[data-dls] input[type=text],[data-dls] input[type=number],[data-dls] select{border-radius:8px}" +
      // ── "Remove ASCII art" → Daylight Cards title screen: hide the art, show a
      //    styled wordmark, and lay the menu out as a 2-column card grid. Scoped to
      //    [data-dls-art] so toggling the setting brings the ASCII art back. ──
      "[data-dls][data-dls-art] #title-screen{flex-direction:column;align-items:center;overflow:hidden;padding:18px 0 8px}" +
      "[data-dls][data-dls-art] #title-screen .title-left,[data-dls][data-dls-art] #title-screen.sidebar .title-left,[data-dls][data-dls-art] #title-screen.stacked .title-left{width:100%;max-width:860px;flex:1 1 auto;min-height:0;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:10px 28px;border:none;background:transparent;overflow:hidden}" +
      "[data-dls][data-dls-art] .title-art,[data-dls][data-dls-art] .title-art-stacked-spot,[data-dls][data-dls-art] .settings-art-panel,[data-dls][data-dls-art] .art-frame{display:none!important}" +
      "[data-dls][data-dls-art] .settings-container{max-width:none;padding:24px 48px}" +
      "[data-dls][data-dls-art] .title-logo{display:flex;flex-direction:column;align-items:center;flex:0 0 auto}" +
      "[data-dls][data-dls-art] .title-logo pre{display:none}" +
      "[data-dls][data-dls-art] .title-logo::before{content:'OfflineQuiz';display:block;font-size:52px;font-weight:800;letter-spacing:-0.5px;color:var(--text);line-height:1.1}" +
      "[data-dls][data-dls-art] .title-logo::after{content:'';display:block;width:64px;height:4px;border-radius:2px;background:var(--accent);margin:10px auto 0}" +
      "[data-dls][data-dls-art] .title-greeting,[data-dls][data-dls-art] .title-streak{min-height:0;width:100%;text-align:center;flex:0 0 auto}" +
      "[data-dls][data-dls-art] .title-menu{display:grid;grid-template-columns:repeat(2,minmax(240px,1fr));gap:10px;margin-top:14px;width:100%;flex:0 1 auto;min-height:0;overflow-y:auto;padding:2px}" +
      "[data-dls][data-dls-art] .menu-item{display:flex;align-items:center;gap:10px;height:48px;margin:0;padding:0 16px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;text-align:left;font-size:13px}" +
      "[data-dls][data-dls-art] .menu-item:hover{border-color:var(--accent);background:var(--accent-dim);transform:none}" +
      "[data-dls][data-dls-art] .menu-item .key{flex:0 0 auto;font-size:11px;color:var(--accent);background:var(--accent-dim);border-radius:6px;padding:2px 7px}" +
      "[data-dls][data-dls-art] #title-extra-menu{grid-column:1 / -1;display:grid;grid-template-columns:repeat(2,minmax(240px,1fr));gap:10px}" +
      "[data-dls][data-dls-art] #title-extra-menu .title-extra-label{grid-column:1 / -1;font-size:10px;font-weight:700;letter-spacing:1px;color:var(--text-muted);text-align:left;margin:2px 2px 0}" +
      "[data-dls][data-dls-art] .title-status{width:100%;text-align:center;margin-top:10px;font-size:11px;color:var(--text-muted);flex:0 0 auto}" +
      // ── Styling for our custom appearance panel ──
      ".dls-panel{display:flex;flex-direction:column;gap:16px;align-items:stretch}" +
      ".dls-cols{display:flex;flex-wrap:wrap;gap:16px 48px;align-items:flex-start}" +
      ".dls-h{font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px}" +
      ".dls-pals{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}" +
      ".dls-pal{display:flex;align-items:center;gap:10px;padding:10px;border:2px solid var(--border);border-radius:12px;background:var(--bg-tertiary);cursor:pointer;transition:border-color 120ms,transform 120ms}" +
      ".dls-pal:hover{transform:translateY(-1px)}" +
      ".dls-pal.sel{border-color:var(--accent)}" +
      ".dls-dots{display:flex;gap:4px}.dls-dot{width:16px;height:16px;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.12)}" +
      ".dls-pal-name{font-size:13px;font-weight:600;color:var(--text)}" +
      ".dls-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".dls-seg{display:inline-flex;border:1px solid var(--border);border-radius:10px;overflow:hidden}" +
      ".dls-seg button{border:none;background:var(--bg-tertiary);color:var(--text-secondary);padding:6px 14px;font-size:12px;cursor:pointer}" +
      ".dls-seg button.sel{background:var(--accent);color:#fff}" +
      ".dls-accent{display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".dls-accent input[type=color]{width:42px;height:28px;border:1px solid var(--border);border-radius:8px;background:var(--bg-tertiary);cursor:pointer;padding:0;flex:0 0 auto}" +
      ".dls-sw{flex:0 0 auto;width:24px;height:24px;border-radius:50%;border:2px solid transparent;box-shadow:0 0 0 1px var(--border);cursor:pointer}" +
      ".dls-sw.sel{border-color:var(--text)}" +
      ".dls-btn{font-size:12px;color:var(--text);background:var(--bg-tertiary);border:1px solid var(--border);border-radius:8px;padding:5px 12px;cursor:pointer;flex:0 0 auto}" +
      ".dls-btn:hover{border-color:var(--accent);color:var(--accent)}" +
      ".dls-toggle{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text)}" +
      ".dls-more{border:1px solid var(--border);border-radius:12px;background:var(--bg-tertiary);padding:10px 14px}" +
      ".dls-more summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px}" +
      ".dls-more summary::-webkit-details-marker{display:none}" +
      ".dls-more summary::before{content:'';width:0;height:0;border-left:5px solid var(--text-muted);border-top:4px solid transparent;border-bottom:4px solid transparent;transition:transform 120ms}" +
      ".dls-more[open] summary::before{transform:rotate(90deg)}" +
      ".dls-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px 18px;margin:12px 0}"
      + ".dls-crow{display:flex;align-items:center;gap:8px}.dls-crow label{flex:1}" +
      ".dls-grid label{font-size:12px;color:var(--text-secondary)}" +
      ".dls-grid input[type=color]{width:38px;height:26px;border:1px solid var(--border);border-radius:7px;background:var(--bg-secondary);cursor:pointer;padding:0}" +
      ".dls-clear{width:22px;height:22px;border:none;border-radius:6px;background:none;color:var(--text-muted);cursor:pointer;font-size:13px;line-height:1}" +
      ".dls-clear:hover{color:var(--red)}" +
      ".dls-clear:disabled{opacity:.25;cursor:default}"
    );

    // ── TAKE OVER the Appearance section with a fully custom UI ──
    var ACCENTS = ["#2563eb", "#7c3aed", "#0e7490", "#15803d", "#b45309", "#dc2626", "#db2777", "#0f172a"];
    ctx.registerAppearancePanel(function (el) {
      var moreOpen = false;
      function g(k) { return ctx.getSetting(k); }
      function build() {
        var pal = g("palette"), accentOv = g("accentOverride") || "", font = g("font"), side = g("panelSide"), shadow = g("shadows") !== false;
        var p0 = palettes[pal] || palettes.paper;
        var custom = customMap();
        var palCards = Object.keys(palettes).map(function (k) {
          var p = palettes[k];
          return '<div class="dls-pal' + (pal === k ? " sel" : "") + '" data-pal="' + k + '">' +
            '<div class="dls-dots"><span class="dls-dot" style="background:' + p.accent + '"></span>' +
            '<span class="dls-dot" style="background:' + p.bg + '"></span>' +
            '<span class="dls-dot" style="background:' + p.text + '"></span></div>' +
            '<span class="dls-pal-name">' + esc(p.label) + "</span></div>";
        }).join("");
        var swatches = ACCENTS.map(function (c) {
          return '<span class="dls-sw' + (accentOv === c ? " sel" : "") + '" data-acc="' + c + '" style="background:' + c + '" title="' + c + '"></span>';
        }).join("");
        var rows = PARTS.map(function (part) {
          var cur = custom[part.v] || p0[part.of] || "#888888";
          var overridden = !!custom[part.v];
          return '<div class="dls-crow"><label>' + esc(part.label) + (overridden ? " •" : "") + '</label>' +
            '<input type="color" data-var="' + part.v + '" value="' + esc(cur) + '">' +
            '<button class="dls-clear" data-clearvar="' + part.v + '" title="Back to palette color"' + (overridden ? "" : " disabled") + '>&times;</button></div>';
        }).join("");
        el.innerHTML =
          '<div class="dls-panel">' +
            '<div><div class="dls-h">Palette</div><div class="dls-pals">' + palCards + "</div></div>" +
            '<div class="dls-cols">' +
              '<div><div class="dls-h">Accent</div><div class="dls-accent">' +
                swatches +
                '<input type="color" id="dls-color" value="' + esc(/^#[0-9a-fA-F]{6}$/.test(accentOv) ? accentOv : p0.accent) + '">' +
                '<button class="dls-btn" id="dls-reset"' + (accentOv ? "" : " disabled") + '>Use palette accent</button>' +
              "</div></div>" +
              '<div><div class="dls-h">Font</div><div class="dls-seg" id="dls-font">' +
                '<button data-font="sans" class="' + (font === "sans" ? "sel" : "") + '">Sans</button>' +
                '<button data-font="serif" class="' + (font === "serif" ? "sel" : "") + '">Serif</button></div></div>' +
              '<div><div class="dls-h">Filters panel side</div><div class="dls-seg" id="dls-side">' +
                '<button data-side="left" class="' + (side === "left" ? "sel" : "") + '">Left</button>' +
                '<button data-side="right" class="' + (side === "right" ? "sel" : "") + '">Right</button></div></div>' +
              '<div><div class="dls-h">Effects</div><label class="dls-toggle"><input type="checkbox" id="dls-shadow"' + (shadow ? " checked" : "") + "> Card shadows</label></div>" +
            "</div>" +
            '<details class="dls-more" id="dls-more"' + (moreOpen ? " open" : "") + '>' +
              '<summary><span class="dls-h" style="margin:0">More settings — colors</span></summary>' +
              '<div class="dls-grid">' + rows + "</div>" +
              '<button class="dls-btn" id="dls-clearall">Reset all custom colors</button>' +
            "</details>" +
          "</div>";
        wire();
      }
      function setCustom(v, val) {
        var m = customMap();
        if (val == null) delete m[v]; else m[v] = val;
        ctx.setSetting("custom", Object.keys(m).length ? JSON.stringify(m) : "");
      }
      function wire() {
        el.querySelectorAll("[data-pal]").forEach(function (b) { b.onclick = function () { ctx.setSetting("palette", b.dataset.pal); build(); }; });
        el.querySelectorAll("[data-acc]").forEach(function (b) { b.onclick = function () { ctx.setSetting("accentOverride", b.dataset.acc); build(); }; });
        var col = el.querySelector("#dls-color"); if (col) { col.oninput = function () { ctx.setSetting("accentOverride", col.value); }; col.onchange = function () { build(); }; }
        var rst = el.querySelector("#dls-reset"); if (rst) rst.onclick = function () { ctx.setSetting("accentOverride", ""); build(); };
        el.querySelectorAll("#dls-font button").forEach(function (b) { b.onclick = function () { ctx.setSetting("font", b.dataset.font); build(); }; });
        el.querySelectorAll("#dls-side button").forEach(function (b) { b.onclick = function () { ctx.setSetting("panelSide", b.dataset.side); build(); }; });
        var sh = el.querySelector("#dls-shadow"); if (sh) sh.onchange = function () { ctx.setSetting("shadows", sh.checked); };
        var more = el.querySelector("#dls-more"); if (more) more.ontoggle = function () { moreOpen = more.open; };
        el.querySelectorAll(".dls-grid input[type=color]").forEach(function (inp) {
          inp.oninput = function () { setCustom(inp.dataset.var, inp.value); };
          inp.onchange = function () { build(); };
        });
        el.querySelectorAll("[data-clearvar]").forEach(function (b) {
          b.onclick = function () { setCustom(b.dataset.clearvar, null); build(); };
        });
        var ca = el.querySelector("#dls-clearall"); if (ca) ca.onclick = function () { ctx.setSetting("custom", ""); build(); };
      }
      build();
    }, { title: "Daylight Studio — Appearance" });

    // Re-apply the palette whenever any setting changes.
    ctx.onSetting(function () { apply(); });
  },
  onDisable: function () {
    var d = document.documentElement;
    d.removeAttribute("data-dls"); d.removeAttribute("data-dls-side"); d.removeAttribute("data-dls-shadow"); d.removeAttribute("data-dls-art");
  },
});

`;

  QB.installStarterTheme = () => { QB.installTheme(DEFAULT_THEME_FILE, STARTER_THEME); QB.renderScreen(); };

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
