// ============================================================
// NetPrint Console — app logic (vanilla JS, no dependencies)
// ============================================================
(function () {
  "use strict";

  const STORAGE_KEY = "netprint-console-state-v1";

  /* ---------- persisted state ---------- */
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* storage unavailable — fail silently */ }
  }
  const state = loadState();
  state.checklists = state.checklists || {};
  state.theme = state.theme || "dark";
  state.wizard = state.wizard || { topology: null, dhcp: null, count: null, step: 0 };

  /* ===================== THEME ===================== */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const icon = document.getElementById("themeIcon");
    const label = document.getElementById("themeLabel");
    const btn = document.getElementById("themeToggle");
    if (state.theme === "light") {
      icon.textContent = "☀️";
      label.textContent = "Light mode";
      btn.setAttribute("aria-pressed", "true");
    } else {
      icon.textContent = "🌙";
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

  /* ===================== PRINT ===================== */
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

  /* ===================== ROUTING ===================== */
  const routes = Array.from(document.querySelectorAll(".route"));
  const navItems = Array.from(document.querySelectorAll(".nav-item"));

  function goTo(routeName) {
    routes.forEach((r) => {
      r.hidden = r.dataset.route !== routeName;
    });
    navItems.forEach((n) => {
      n.classList.toggle("is-active", n.dataset.route === routeName);
    });
    sidebar.classList.remove("is-open");
    sidebarToggle.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
    if (location.hash !== "#" + routeName) {
      history.replaceState(null, "", "#" + routeName);
    }
    if (routeName === "summary") renderSummaryProgress();
  }

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => goTo(btn.dataset.route));
  });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-goto]");
    if (el) goTo(el.dataset.goto);
  });

  const initialRoute = (location.hash || "#home").slice(1);
  goTo(routes.some((r) => r.dataset.route === initialRoute) ? initialRoute : "home");

  /* ===================== TABS ===================== */
  document.querySelectorAll(".tabs").forEach((group) => {
    const tabs = Array.from(group.querySelectorAll(".tab"));
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelectorAll(`[data-tabpanel]`).forEach((panel) => {
          if (panel.closest(".route").contains(group)) {
            panel.classList.toggle("is-active", panel.dataset.tabpanel === tab.dataset.tab);
          }
        });
      });
    });
  });

  /* ===================== COPY TO CLIPBOARD ===================== */
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

  /* ===================== CHECKLIST PERSISTENCE ===================== */
  document.querySelectorAll("[data-checklist]").forEach((list) => {
    const key = list.dataset.checklist;
    const boxes = Array.from(list.querySelectorAll('input[type="checkbox"]'));
    const saved = state.checklists[key] || [];
    boxes.forEach((box, i) => {
      box.checked = !!saved[i];
      box.addEventListener("change", () => {
        const values = boxes.map((b) => b.checked);
        state.checklists[key] = values;
        saveState(state);
        if (!document.getElementById("route-summary").hidden) renderSummaryProgress();
      });
    });
  });

  function renderSummaryProgress() {
    const host = document.getElementById("summaryProgress");
    if (!host) return;
    const lists = Array.from(document.querySelectorAll("[data-checklist]"));
    host.innerHTML = "";
    lists.forEach((list) => {
      const key = list.dataset.checklist;
      const boxes = Array.from(list.querySelectorAll('input[type="checkbox"]'));
      const total = boxes.length;
      const done = boxes.filter((b) => b.checked).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const row = document.createElement("div");
      row.className = "summary-bar-row";
      row.innerHTML = `
        <span class="label">${labelFor(key)}</span>
        <div class="summary-bar-track"><div class="summary-bar-fill" style="width:${pct}%"></div></div>
        <span>${done}/${total}</span>`;
      host.appendChild(row);
    });
    if (!lists.length) host.textContent = "No checklists completed yet.";
  }
  function labelFor(key) {
    return { overview: "Setup overview", verify: "Network verification" }[key] || key;
  }

  /* ===================== IP VALIDATION ===================== */
  function isValidIPv4(value) {
    const parts = value.trim().split(".");
    if (parts.length !== 4) return false;
    return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
  }

  document.querySelectorAll("[data-editable-table]").forEach((table) => {
    const inputs = Array.from(table.querySelectorAll(".ip-input"));
    function revalidate() {
      const seen = {};
      inputs.forEach((inp) => {
        const v = inp.value.trim();
        seen[v] = (seen[v] || 0) + 1;
      });
      inputs.forEach((inp) => {
        const v = inp.value.trim();
        const valid = isValidIPv4(v);
        inp.classList.toggle("is-invalid", !valid);
        inp.classList.toggle("is-duplicate", valid && seen[v] > 1);
        // keep adjacent copy button in sync
        const row = inp.closest("tr");
        const copyBtn = row && row.querySelector(".copy-btn");
        if (copyBtn) copyBtn.dataset.copy = v;
      });
    }
    inputs.forEach((inp) => inp.addEventListener("input", revalidate));
    revalidate();
  });

  /* ===================== SEARCH ===================== */
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  // Build a lightweight search index from headings + list items + paragraphs across routes.
  function buildIndex() {
    const index = [];
    routes.forEach((route) => {
      const routeName = route.dataset.route;
      const routeTitle = route.querySelector("h1") ? route.querySelector("h1").textContent : routeName;
      const blocks = route.querySelectorAll("h2, h3, li, summary, p");
      blocks.forEach((el) => {
        const text = el.textContent.replace(/\s+/g, " ").trim();
        if (text.length > 10) {
          index.push({ text, routeName, routeTitle, el });
        }
      });
    });
    return index;
  }
  const searchIndex = buildIndex();

  function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      return;
    }
    const matches = searchIndex
      .filter((item) => item.text.toLowerCase().includes(q))
      .slice(0, 8);
    searchResults.innerHTML = "";
    if (!matches.length) {
      searchResults.hidden = false;
      const div = document.createElement("div");
      div.style.padding = "10px 14px";
      div.style.color = "var(--muted)";
      div.textContent = "No matches found.";
      searchResults.appendChild(div);
      return;
    }
    matches.forEach((m) => {
      const btn = document.createElement("button");
      const idx = m.text.toLowerCase().indexOf(q);
      const before = escapeHtml(m.text.slice(Math.max(0, idx - 30), idx));
      const match = escapeHtml(m.text.slice(idx, idx + q.length));
      const after = escapeHtml(m.text.slice(idx + q.length, idx + q.length + 50));
      btn.innerHTML = `${idx > 30 ? "…" : ""}${before}<mark>${match}</mark>${after}…
        <span class="res-route">in ${escapeHtml(m.routeTitle)}</span>`;
      btn.addEventListener("click", () => {
        goTo(m.routeName);
        searchResults.hidden = true;
        searchInput.value = "";
        setTimeout(() => {
          if (m.el.tagName === "SUMMARY") m.el.parentElement.open = true;
          const target = m.el.closest(".tab-panel");
          if (target && !target.classList.contains("is-active")) {
            const tabName = target.dataset.tabpanel;
            const tabBtn = document.querySelector(`.tab[data-tab="${tabName}"]`);
            if (tabBtn) tabBtn.click();
          }
          m.el.scrollIntoView({ behavior: "smooth", block: "center" });
          m.el.style.outline = "2px solid var(--accent)";
          setTimeout(() => (m.el.style.outline = ""), 1600);
        }, 60);
      });
      searchResults.appendChild(btn);
    });
    searchResults.hidden = false;
  }
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  searchInput.addEventListener("input", () => runSearch(searchInput.value));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) searchResults.hidden = true;
  });

  /* ===================== SETUP WIZARD ===================== */
  const wizardSteps = [
    {
      id: "topology",
      field: "topology",
      title: "What does your network look like?",
      render: () => optionGrid("topology", [
        { value: "single", title: "Single printer, direct", desc: "One printer wired straight to the laptop." },
        { value: "multi", title: "Multiple printers, switch only", desc: "Several printers, no router on site." },
        { value: "router", title: "Router-based network", desc: "Printers join the office router/LAN." },
      ]),
    },
    {
      id: "count",
      field: "count",
      title: "How many printers are you setting up?",
      skip: () => state.wizard.topology === "single",
      render: () => optionGrid("count", [
        { value: "2-3", title: "2–3 printers", desc: "Small till or counter setup." },
        { value: "4+", title: "4 or more printers", desc: "Larger floor — plan IPs carefully." },
      ]),
    },
    {
      id: "dhcp",
      field: "dhcp",
      title: "Does your router support DHCP reservations?",
      skip: () => state.wizard.topology !== "router",
      render: () => optionGrid("dhcp", [
        { value: "yes", title: "Yes", desc: "I can reserve a fixed IP per device in the router." },
        { value: "no", title: "Not sure / no", desc: "I'll assign static IPs on each printer instead." },
      ]),
    },
    {
      id: "result",
      title: "Your tailored walkthrough",
      render: renderWizardResult,
      isFinal: true,
    },
  ];

  function optionGrid(field, options) {
    const wrap = document.createElement("div");
    wrap.className = "option-grid";
    options.forEach((opt) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "option-card" + (state.wizard[field] === opt.value ? " is-selected" : "");
      card.innerHTML = `<strong>${opt.title}</strong><span>${opt.desc}</span>`;
      card.addEventListener("click", () => {
        state.wizard[field] = opt.value;
        if (field === "topology") {
          state.wizard.count = null;
          state.wizard.dhcp = null;
        }
        saveState(state);
        renderWizardStep();
      });
      wrap.appendChild(card);
    });
    return wrap;
  }

  function renderWizardResult() {
    const wrap = document.createElement("div");
    const topo = state.wizard.topology;
    let html = "";
    if (topo === "single") {
      html = `
        <div class="callout">Direct connection — no router or switch needed.</div>
        <ol class="steps">
          <li>Wire the printer to your laptop with an Ethernet cable.</li>
          <li>Print a self-test page (hold <kbd>FEED</kbd> while powering on) to read its IP, subnet and gateway.</li>
          <li>Browse to that IP. If it won't load, set your laptop's adapter to IP 192.168.192.169 / 255.255.255.0 / gateway 192.168.192.1 / DNS 8.8.8.8.</li>
          <li>In ePOS Proxy, click <strong>+ Add Network Printer</strong>, enter the IP, click <strong>Add</strong>.</li>
        </ol>
        <button class="btn btn-ghost" data-goto="network">Open full Network Setup guide →</button>`;
    } else if (topo === "multi") {
      html = `
        <div class="callout callout-warn">Configure every printer one at a time before wiring them all to the switch — they likely share a default IP.</div>
        <ol class="steps">
          <li>Connect one printer at a time, set a unique static IP (e.g. 192.168.1.11, .12, .13…) with subnet 255.255.255.0 and gateway 192.168.1.10.</li>
          <li>Set your laptop's Ethernet adapter to 192.168.1.10 / 255.255.255.0, DNS 8.8.8.8.</li>
          <li>Wire the laptop and all configured printers into the switch, then power everything on.</li>
          <li>Add each printer's IP in ePOS Proxy via <strong>+ Add Network Printer</strong>.</li>
        </ol>
        <button class="btn btn-ghost" data-goto="network">Open full Network Setup guide →</button>`;
    } else if (topo === "router") {
      const dhcp = state.wizard.dhcp;
      html = `
        ${dhcp === "yes"
          ? `<div class="callout">Use DHCP reservations: pair each printer's MAC address to a fixed IP in the router's settings — no printer-side changes needed.</div>`
          : `<div class="callout callout-warn">Assign static IPs by hand: configure one printer at a time on its Network Settings page before connecting it to the router.</div>`}
        <ol class="steps">
          <li>Note each printer's self-test IP and reserve/assign addresses inside the router's range (e.g. 192.168.1.11, .12…).</li>
          <li>Use subnet 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8 throughout.</li>
          <li>Connect the laptop and all printers to the router (add a switch if you run out of ports).</li>
          <li>Add each printer's IP in ePOS Proxy.</li>
        </ol>
        <button class="btn btn-ghost" data-goto="router">Open full Router Configuration guide →</button>`;
    } else {
      html = `<p>Pick a topology in step 1 to see your tailored walkthrough.</p>`;
    }
    wrap.innerHTML = html;
    return wrap;
  }

  function activeWizardSteps() {
    return wizardSteps.filter((s) => !(s.skip && s.skip()));
  }

  function renderWizardStep() {
    const steps = activeWizardSteps();
    if (state.wizard.step >= steps.length) state.wizard.step = steps.length - 1;
    if (state.wizard.step < 0) state.wizard.step = 0;
    const step = steps[state.wizard.step];
    const host = document.getElementById("wizardStepHost");
    host.innerHTML = "";
    const section = document.createElement("div");
    section.className = "wizard-step";
    const h2 = document.createElement("h2");
    h2.textContent = step.title;
    section.appendChild(h2);
    section.appendChild(step.render());
    host.appendChild(section);

    const pct = Math.round(((state.wizard.step + 1) / steps.length) * 100);
    document.getElementById("wizardProgressFill").style.width = pct + "%";
    document.getElementById("wizardProgressTrack").setAttribute("aria-valuenow", String(pct));
    document.getElementById("wizardProgressLabel").textContent =
      `Step ${state.wizard.step + 1} of ${steps.length}`;

    document.getElementById("wizardPrev").disabled = state.wizard.step === 0;
    const nextBtn = document.getElementById("wizardNext");
    nextBtn.textContent = step.isFinal ? "Restart wizard" : "Next →";
    saveState(state);
  }

  document.getElementById("wizardPrev").addEventListener("click", () => {
    state.wizard.step = Math.max(0, state.wizard.step - 1);
    renderWizardStep();
  });
  document.getElementById("wizardNext").addEventListener("click", () => {
    const steps = activeWizardSteps();
    const step = steps[state.wizard.step];
    if (step.isFinal) {
      state.wizard = { topology: null, dhcp: null, count: null, step: 0 };
      saveState(state);
      renderWizardStep();
      return;
    }
    if (step.field && !state.wizard[step.field]) return;
    state.wizard.step = Math.min(steps.length - 1, state.wizard.step + 1);
    renderWizardStep();
  });

  renderWizardStep();
})();