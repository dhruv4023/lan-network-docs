// ============================================================
// NetPrint Console — routing, components, wizard
// ============================================================
(function () {
  "use strict";

  const state = window.NetPrint.state;
  const saveState = window.NetPrint.saveState;

  /* ===================== INJECT ROUTES ===================== */
  const container = document.getElementById("routeContainer");
  Object.keys(window.NetPrint.routes).forEach(function (name) {
    container.insertAdjacentHTML("beforeend", window.NetPrint.routes[name]);
  });

  /* ===================== ROUTING ===================== */
  const routes = Array.from(document.querySelectorAll(".route"));
  const navItems = Array.from(document.querySelectorAll(".nav-item"));

  function goTo(routeName) {
    routes.forEach(function (r) {
      r.hidden = r.dataset.route !== routeName;
    });
    navItems.forEach(function (n) {
      n.classList.toggle("is-active", n.dataset.route === routeName);
    });
    var sidebar = document.getElementById("sidebar");
    var sidebarToggle = document.getElementById("sidebarToggle");
    sidebar.classList.remove("is-open");
    sidebarToggle.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
    if (location.hash !== "#" + routeName) {
      history.replaceState(null, "", "#" + routeName);
    }
    if (routeName === "summary") renderSummaryProgress();
  }

  navItems.forEach(function (btn) {
    btn.addEventListener("click", function () { goTo(btn.dataset.route); });
  });

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-goto]");
    if (el) goTo(el.dataset.goto);
  });

  var initialRoute = (location.hash || "#home").slice(1);
  goTo(routes.some(function (r) { return r.dataset.route === initialRoute; }) ? initialRoute : "home");

  /* ===================== TABS ===================== */
  document.querySelectorAll(".tabs").forEach(function (group) {
    var tabs = Array.from(group.querySelectorAll(".tab"));
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        document.querySelectorAll("[data-tabpanel]").forEach(function (panel) {
          if (panel.closest(".route").contains(group)) {
            panel.classList.toggle("is-active", panel.dataset.tabpanel === tab.dataset.tab);
          }
        });
      });
    });
  });

  /* ===================== SEARCH ===================== */
  var searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");

  function buildIndex() {
    var index = [];
    routes.forEach(function (route) {
      var routeName = route.dataset.route;
      var routeTitle = route.querySelector("h1") ? route.querySelector("h1").textContent : routeName;
      var blocks = route.querySelectorAll("h2, h3, li, summary, p");
      blocks.forEach(function (el) {
        var text = el.textContent.replace(/\s+/g, " ").trim();
        if (text.length > 10) {
          index.push({ text: text, routeName: routeName, routeTitle: routeTitle, el: el });
        }
      });
    });
    return index;
  }
  var searchIndex = buildIndex();

  function runSearch(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      return;
    }
    var matches = searchIndex
      .filter(function (item) { return item.text.toLowerCase().indexOf(q) !== -1; })
      .slice(0, 8);
    searchResults.innerHTML = "";
    if (!matches.length) {
      searchResults.hidden = false;
      var div = document.createElement("div");
      div.style.padding = "10px 14px";
      div.style.color = "var(--muted)";
      div.textContent = "No matches found.";
      searchResults.appendChild(div);
      return;
    }
    matches.forEach(function (m) {
      var btn = document.createElement("button");
      var idx = m.text.toLowerCase().indexOf(q);
      var before = escapeHtml(m.text.slice(Math.max(0, idx - 30), idx));
      var match = escapeHtml(m.text.slice(idx, idx + q.length));
      var after = escapeHtml(m.text.slice(idx + q.length, idx + q.length + 50));
      btn.innerHTML = (idx > 30 ? "\u2026" : "") + before + "<mark>" + match + "</mark>" + after + "\u2026" +
        '<span class="res-route">in ' + escapeHtml(m.routeTitle) + "</span>";
      btn.addEventListener("click", function () {
        goTo(m.routeName);
        searchResults.hidden = true;
        searchInput.value = "";
        setTimeout(function () {
          if (m.el.tagName === "SUMMARY") m.el.parentElement.open = true;
          var target = m.el.closest(".tab-panel");
          if (target && !target.classList.contains("is-active")) {
            var tabName = target.dataset.tabpanel;
            var tabBtn = document.querySelector('.tab[data-tab="' + tabName + '"]');
            if (tabBtn) tabBtn.click();
          }
          m.el.scrollIntoView({ behavior: "smooth", block: "center" });
          m.el.style.outline = "2px solid var(--accent)";
          setTimeout(function () { m.el.style.outline = ""; }, 1600);
        }, 60);
      });
      searchResults.appendChild(btn);
    });
    searchResults.hidden = false;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  searchInput.addEventListener("input", function () { runSearch(searchInput.value); });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-wrap")) searchResults.hidden = true;
  });

  /* ===================== CHECKLIST PERSISTENCE ===================== */
  document.querySelectorAll("[data-checklist]").forEach(function (list) {
    var key = list.dataset.checklist;
    var boxes = Array.from(list.querySelectorAll('input[type="checkbox"]'));
    var saved = state.checklists[key] || [];
    boxes.forEach(function (box, i) {
      box.checked = !!saved[i];
      box.addEventListener("change", function () {
        var values = boxes.map(function (b) { return b.checked; });
        state.checklists[key] = values;
        saveState(state);
        if (!document.getElementById("route-summary").hidden) renderSummaryProgress();
      });
    });
  });

  function renderSummaryProgress() {
    var host = document.getElementById("summaryProgress");
    if (!host) return;
    var lists = Array.from(document.querySelectorAll("[data-checklist]"));
    host.innerHTML = "";
    lists.forEach(function (list) {
      var key = list.dataset.checklist;
      var boxes = Array.from(list.querySelectorAll('input[type="checkbox"]'));
      var total = boxes.length;
      var done = boxes.filter(function (b) { return b.checked; }).length;
      var pct = total ? Math.round((done / total) * 100) : 0;
      var row = document.createElement("div");
      row.className = "summary-bar-row";
      row.innerHTML =
        '<span class="label">' + labelFor(key) + '</span>' +
        '<div class="summary-bar-track"><div class="summary-bar-fill" style="width:' + pct + '%"></div></div>' +
        "<span>" + done + "/" + total + "</span>";
      host.appendChild(row);
    });
    if (!lists.length) host.textContent = "No checklists completed yet.";
  }

  function labelFor(key) {
    return { overview: "Setup overview", verify: "Network verification" }[key] || key;
  }

  /* ===================== IP VALIDATION ===================== */
  function isValidIPv4(value) {
    var parts = value.trim().split(".");
    if (parts.length !== 4) return false;
    return parts.every(function (p) {
      return /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255;
    });
  }

  document.querySelectorAll("[data-editable-table]").forEach(function (table) {
    var inputs = Array.from(table.querySelectorAll(".ip-input"));
    function revalidate() {
      var seen = {};
      inputs.forEach(function (inp) {
        var v = inp.value.trim();
        seen[v] = (seen[v] || 0) + 1;
      });
      inputs.forEach(function (inp) {
        var v = inp.value.trim();
        var valid = isValidIPv4(v);
        inp.classList.toggle("is-invalid", !valid);
        inp.classList.toggle("is-duplicate", valid && seen[v] > 1);
        var row = inp.closest("tr");
        var copyBtn = row && row.querySelector(".copy-btn");
        if (copyBtn) copyBtn.dataset.copy = v;
      });
    }
    inputs.forEach(function (inp) { inp.addEventListener("input", revalidate); });
    revalidate();
  });

  /* ===================== SETUP WIZARD ===================== */
  var wizardSteps = [
    {
      id: "topology",
      field: "topology",
      title: "What does your network look like?",
      render: function () { return optionGrid("topology", [
        { value: "single", title: "Single printer, direct", desc: "One printer wired straight to the laptop." },
        { value: "multi", title: "Multiple printers, switch only", desc: "Several printers, no router on site." },
        { value: "router", title: "Router-based network", desc: "Printers join the office router/LAN." },
      ]); },
    },
    {
      id: "count",
      field: "count",
      title: "How many printers are you setting up?",
      skip: function () { return state.wizard.topology === "single"; },
      render: function () { return optionGrid("count", [
        { value: "2-3", title: "2\u20133 printers", desc: "Small till or counter setup." },
        { value: "4+", title: "4 or more printers", desc: "Larger floor \u2014 plan IPs carefully." },
      ]); },
    },
    {
      id: "dhcp",
      field: "dhcp",
      title: "Does your router support DHCP reservations?",
      skip: function () { return state.wizard.topology !== "router"; },
      render: function () { return optionGrid("dhcp", [
        { value: "yes", title: "Yes", desc: "I can reserve a fixed IP per device in the router." },
        { value: "no", title: "Not sure / no", desc: "I'll assign static IPs on each printer instead." },
      ]); },
    },
    {
      id: "result",
      title: "Your tailored walkthrough",
      render: renderWizardResult,
      isFinal: true,
    },
  ];

  function optionGrid(field, options) {
    var wrap = document.createElement("div");
    wrap.className = "option-grid";
    options.forEach(function (opt) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "option-card" + (state.wizard[field] === opt.value ? " is-selected" : "");
      card.innerHTML = "<strong>" + opt.title + "</strong><span>" + opt.desc + "</span>";
      card.addEventListener("click", function () {
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
    var wrap = document.createElement("div");
    var topo = state.wizard.topology;
    var html = "";
    if (topo === "single") {
      html =
        '<div class="callout">Direct connection \u2014 no router or switch needed.</div>' +
        '<ol class="steps">' +
          "<li>Wire the printer to your laptop with an Ethernet cable.</li>" +
          "<li>Print a self-test page (hold <kbd>FEED</kbd> while powering on) to read its IP, subnet and gateway.</li>" +
          "<li>Browse to that IP. If it won't load, set your laptop's adapter to IP 192.168.192.169 / 255.255.255.0 / gateway 192.168.192.1 / DNS 8.8.8.8.</li>" +
          '<li>In ePOS Proxy, click <strong>+ Add Network Printer</strong>, enter the IP, click <strong>Add</strong>.</li>' +
        "</ol>" +
        '<button class="btn btn-ghost" data-goto="network">Open full Network Setup guide \u2192</button>';
    } else if (topo === "multi") {
      html =
        '<div class="callout callout-warn">Configure every printer one at a time before wiring them all to the switch \u2014 they likely share a default IP.</div>' +
        '<ol class="steps">' +
          "<li>Connect one printer at a time, set a unique static IP (e.g. 192.168.1.11, .12, .13\u2026) with subnet 255.255.255.0 and gateway 192.168.1.10.</li>" +
          "<li>Set your laptop's Ethernet adapter to 192.168.1.10 / 255.255.255.0, DNS 8.8.8.8.</li>" +
          "<li>Wire the laptop and all configured printers into the switch, then power everything on.</li>" +
          '<li>Add each printer\'s IP in ePOS Proxy via <strong>+ Add Network Printer</strong>.</li>' +
        "</ol>" +
        '<button class="btn btn-ghost" data-goto="network">Open full Network Setup guide \u2192</button>';
    } else if (topo === "router") {
      var dhcp = state.wizard.dhcp;
      html =
        (dhcp === "yes"
          ? '<div class="callout">Use DHCP reservations: pair each printer\'s MAC address to a fixed IP in the router\'s settings \u2014 no printer-side changes needed.</div>'
          : '<div class="callout callout-warn">Assign static IPs by hand: configure one printer at a time on its Network Settings page before connecting it to the router.</div>') +
        '<ol class="steps">' +
          "<li>Note each printer's self-test IP and reserve/assign addresses inside the router's range (e.g. 192.168.1.11, .12\u2026).</li>" +
          "<li>Use subnet 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8 throughout.</li>" +
          "<li>Connect the laptop and all printers to the router (add a switch if you run out of ports).</li>" +
          "<li>Add each printer's IP in ePOS Proxy.</li>" +
        "</ol>" +
        '<button class="btn btn-ghost" data-goto="router">Open full Router Configuration guide \u2192</button>';
    } else {
      html = "<p>Pick a topology in step 1 to see your tailored walkthrough.</p>";
    }
    wrap.innerHTML = html;
    return wrap;
  }

  function activeWizardSteps() {
    return wizardSteps.filter(function (s) { return !(s.skip && s.skip()); });
  }

  function renderWizardStep() {
    var steps = activeWizardSteps();
    if (state.wizard.step >= steps.length) state.wizard.step = steps.length - 1;
    if (state.wizard.step < 0) state.wizard.step = 0;
    var step = steps[state.wizard.step];
    var host = document.getElementById("wizardStepHost");
    host.innerHTML = "";
    var section = document.createElement("div");
    section.className = "wizard-step";
    var h2 = document.createElement("h2");
    h2.textContent = step.title;
    section.appendChild(h2);
    section.appendChild(step.render());
    host.appendChild(section);

    var pct = Math.round(((state.wizard.step + 1) / steps.length) * 100);
    document.getElementById("wizardProgressFill").style.width = pct + "%";
    document.getElementById("wizardProgressTrack").setAttribute("aria-valuenow", String(pct));
    document.getElementById("wizardProgressLabel").textContent =
      "Step " + (state.wizard.step + 1) + " of " + steps.length;

    document.getElementById("wizardPrev").disabled = state.wizard.step === 0;
    var nextBtn = document.getElementById("wizardNext");
    nextBtn.textContent = step.isFinal ? "Restart wizard" : "Next \u2192";
    saveState(state);
  }

  document.getElementById("wizardPrev").addEventListener("click", function () {
    state.wizard.step = Math.max(0, state.wizard.step - 1);
    renderWizardStep();
  });
  document.getElementById("wizardNext").addEventListener("click", function () {
    var steps = activeWizardSteps();
    var step = steps[state.wizard.step];
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
