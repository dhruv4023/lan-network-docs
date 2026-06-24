// ============================================================
// NetPrint Console — core state, theme, clipboard, route registry
// ============================================================
(function () {
  "use strict";

  const STORAGE_KEY = "netprint-console-state-v1";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveState(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {}
  }
  const state = loadState();
  state.checklists = state.checklists || {};
  state.theme = state.theme || "dark";
  state.wizard = state.wizard || { topology: null, dhcp: null, count: null, step: 0 };
  state.routeTabs = state.routeTabs || { network: "single" };

  /* ===================== THEME ===================== */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const icon = document.getElementById("themeIcon");
    const label = document.getElementById("themeLabel");
    const btn = document.getElementById("themeToggle");
    if (state.theme === "light") {
      icon.textContent = "\u2600\uFE0F";
      label.textContent = "Light mode";
      btn.setAttribute("aria-pressed", "true");
    } else {
      icon.textContent = "\uD83C\uDF19";
      label.textContent = "Dark mode";
      btn.setAttribute("aria-pressed", "false");
    }
  }
  document.getElementById("themeToggle").addEventListener("click", function () {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState(state);
    applyTheme();
  });
  applyTheme();

  document.getElementById("printBtn").addEventListener("click", function () {
    window.print();
  });

  /* ===================== SIDEBAR (mobile) ===================== */
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  sidebarToggle.addEventListener("click", function () {
    const open = sidebar.classList.toggle("is-open");
    sidebarToggle.setAttribute("aria-expanded", String(open));
  });

  /* ===================== CLIPBOARD ===================== */
  function copyText(text, triggerEl) {
    const done = () => {
      if (!triggerEl) return;
      const original = triggerEl.textContent;
      triggerEl.classList.add("copied");
      if (triggerEl.tagName === "BUTTON") triggerEl.textContent = "Copied!";
      setTimeout(() => {
        triggerEl.classList.remove("copied");
        if (triggerEl.tagName === "BUTTON") triggerEl.textContent = original;
      }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-copy]");
    if (!el) return;
    copyText(el.dataset.copy, el);
  });

  /* ===================== ROUTE REGISTRY ===================== */
  window.NetPrint = {
    state: state,
    saveState: saveState,
    routes: {},
    addRoute: function (name, html) {
      window.NetPrint.routes[name] = html;
    },
  };
})();
