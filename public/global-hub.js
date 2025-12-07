// global-hub.js
// Handles accent, theme, background, tab cloaking — without breaking layout.

(function () {
  const ACCENT_KEY = "s0laceAccent";
  const CLOAK_KEY = "s0laceTabCloak";
  const THEME_KEY = "s0laceTheme";
  const BG_MODE_KEY = "s0laceBgMode";
  const BG_URL_KEY = "s0laceBgUrl";

  const STAR_GIF = "https://img.itch.zone/aW1hZ2UvMzA5NTQ4LzE1MjE4MTcuZ2lm/original/HRZI0o.gif";

  const ACCENTS = {
    green: { accent: "#00ff7f", soft: "rgba(0,255,127,0.12)" },
    violet: { accent: "#a855f7", soft: "rgba(168,85,247,0.12)" },
    amber: { accent: "#fbbf24", soft: "rgba(251,191,36,0.12)" },
    white: { accent: "#ffffff", soft: "rgba(255,255,255,0.18)" }
  };

  function setVar(n, v) {
    document.documentElement.style.setProperty(n, v);
  }

  // ACCENT ======================================================
  function applyAccent(key, save = true) {
    const a = ACCENTS[key] || ACCENTS.green;
    setVar("--accent", a.accent);
    setVar("--accent-soft", a.soft);
    if (save) localStorage.setItem(ACCENT_KEY, key);
  }

  function loadAccent() {
    const key = localStorage.getItem(ACCENT_KEY) || "green";
    applyAccent(key, false);
    return key;
  }

  // TAB CLOAK ===================================================
  function faviconEl() {
    return (
      document.querySelector('link[rel="icon"]') ||
      document.querySelector('link[rel="shortcut icon"]') ||
      (() => {
        const l = document.createElement("link");
        l.rel = "icon";
        document.head.appendChild(l);
        return l;
      })()
    );
  }

  function applyTabCloak(cfg, save = true) {
    if (!cfg?.enabled) return;
    document.title = cfg.title || document.title;
    if (cfg.iconHref) faviconEl().href = cfg.iconHref;
    if (save) localStorage.setItem(CLOAK_KEY, JSON.stringify(cfg));
  }

  function clearTabCloak(save = true) {
    const og = document.documentElement.dataset.originalTitle;
    if (og) document.title = og;
    if (save) localStorage.removeItem(CLOAK_KEY);
  }

  function loadTabCloak() {
    const raw = localStorage.getItem(CLOAK_KEY);
    if (!raw) return;
    const cfg = JSON.parse(raw);
    if (cfg.enabled) applyTabCloak(cfg, false);
  }

  // THEME =======================================================
  function applyTheme(theme, save = true) {
    document.documentElement.setAttribute("data-theme", theme);
    if (save) localStorage.setItem(THEME_KEY, theme);
  }

  function loadTheme() {
    const t = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(t, false);
    return t;
  }

  // BACKGROUND ===================================================
  function applyBackground(mode, url, save = true) {
    const b = document.body;

    // Reset nothing except background-image — we keep CRT grid intact
    b.style.backgroundImage = "";
    b.style.backgroundSize = "";
    b.style.backgroundAttachment = "";

    if (mode === "gif-stars") {
      b.style.backgroundImage = `url("${STAR_GIF}")`;
      b.style.backgroundSize = "cover";
      b.style.backgroundAttachment = "fixed";
    }

    if (mode === "custom" && url) {
      b.style.backgroundImage = `url("${url}")`;
      b.style.backgroundSize = "cover";
      b.style.backgroundAttachment = "fixed";
    }

    if (save) {
      localStorage.setItem(BG_MODE_KEY, mode);
      if (mode === "custom") localStorage.setItem(BG_URL_KEY, url || "");
      else localStorage.removeItem(BG_URL_KEY);
    }
  }

  function loadBackground() {
    const mode = localStorage.getItem(BG_MODE_KEY) || "default";
    const url = localStorage.getItem(BG_URL_KEY) || "";
    applyBackground(mode, url, false);
    return { mode, url };
  }

  // INIT ========================================================
  function boot() {
    document.documentElement.dataset.originalTitle = document.title;

    const accent = loadAccent();
    const theme = loadTheme();
    const bg = loadBackground();
    loadTabCloak();

    window.dispatchEvent(
      new CustomEvent("s0lace:settingsLoaded", {
        detail: { accent, theme, bgMode: bg.mode, bgUrl: bg.url }
      })
    );
  }

  document.addEventListener("DOMContentLoaded", boot);

  // Export API
  window.S0LACE = {
    applyAccent,
    applyTabCloak,
    clearTabCloak,
    applyTheme,
    applyBackground
  };
})();
