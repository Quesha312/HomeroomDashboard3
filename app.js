// app.js — Homeroom Savvas Dashboard
(function () {
  "use strict";
  if (!window.HR_UNITS || window.HR_UNITS.length < 5) {
    document.getElementById("app").innerHTML =
      "<div class=\"error-banner\"><h2>&#9888; Dashboard Error</h2>" +
      "<p>One or more data files failed to load. Confirm that data_u1.js through data_u5.js are in the same folder as index.html and that all five script tags appear before app.js.</p></div>";
    return;
  }
  var UNITS = window.HR_UNITS;
  var TABS  = ["Weekly Overview", "Below Level", "On Level"];
  var state = { unit:0, week:0, tab:0 };

  function saveState() { try { localStorage.setItem("hr_nav", JSON.stringify({u:state.unit,w:state.week,t:state.tab})); } catch(e) {} }
  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem("hr_nav") || "{}");
      if (typeof s.u === "number" && s.u < UNITS.length) state.unit = s.u;
      if (typeof s.w === "number" && s.w < UNITS[state.unit].weeks.length) state.week = s.w;
      if (typeof s.t === "number" && s.t < TABS.length) state.tab = s.t;
    } catch(e) {}
  }

  function renderSidebar() {
    var html = "";
    for (var u = 0; u < UNITS.length; u++) {
      var active = (u === state.unit);
      html += "<div class=\"unit-group" + (active ? " active" : "") + "\" data-unit=\"" + u + "\">";
      html += "<div class=\"unit-title\">" + UNITS[u].title + "</div>";
      if (active) {
        html += "<ul class=\"week-list\">";
        for (var w = 0; w < UNITS[u].weeks.length; w++) {
          var wk = UNITS[u].weeks[w];
          var isProj = (wk.genre && wk.genre.indexOf("Project") !== -1);
          html += "<li class=\"week-item" + (w === state.week ? " active" : "") + (isProj ? " project" : "") +
                  "\" data-unit=\"" + u + "\" data-week=\"" + w + "\">" +
                  "Week " + wk.w + ": " + wk.text + "</li>";
        }
        html += "</ul>";
      }
      html += "</div>";
    }
    document.getElementById("sidebar").innerHTML = html;
  }

  function renderTabs() {
    var html = "";
    for (var i = 0; i < TABS.length; i++) {
      html += "<button class=\"tab-btn" + (i === state.tab ? " active" : "") +
              "\" data-tab=\"" + i + "\">" + TABS[i] + "</button>";
    }
    document.getElementById("tabs").innerHTML = html;
  }

  function chip(label, value) {
    return "<div class=\"ov-card\"><div class=\"ov-card-label\">" + label + "</div><div class=\"ov-card-value\">" + value + "</div></div>";
  }

  function lessonPanel(L, cls, label) {
    if (!L) return "<p style=\"color:var(--text-muted);font-style:italic;margin-top:1rem;\">No " + label + " lesson available for this week.</p>";
    var chips = [L.id, "F&P "+L.fp, L.lex, "WIDA "+L.wida, L.format, "Group "+L.size, L.dur+" min"]
      .map(function(c){return "<span class=\"info-chip\">" + c + "</span>";}).join("");
    var steps = "";
    if (L.proc && L.proc.length) {
      steps = "<ol class=\"step-list\">";
      for (var i = 0; i < L.proc.length; i++) steps += "<li>" + L.proc[i] + "</li>";
      steps += "</ol>";
    }
    return "<div class=\"lesson-box " + cls + "\">" +
      "<h3>" + label + " Lesson \u2014 " + L.skill + "</h3>" +
      "<div class=\"info-row\">" + chips + "</div>" +
      "<div class=\"field-label\">Materials</div><div class=\"field-value\">" + L.materials + "</div>" +
      "<div class=\"field-label\">Procedure</div>" + steps +
      "<div class=\"field-label\">EL Scaffolds</div><div class=\"field-value\">" + L.scaffolds + "</div>" +
      "<div class=\"field-label\">Progress Monitoring</div><div class=\"field-value\">" + L.monitor + "</div>" +
      "<div class=\"field-label\">Notes</div><div class=\"field-value\">" + L.notes + "</div>" +
      "</div>";
  }

  function renderLesson() {
    var U = UNITS[state.unit];
    var W = U.weeks[state.week];
    var isProj = (W.genre && W.genre.indexOf("Project") !== -1);
    var h = "<div class=\"lesson-header\">";
    h += "<h2>Week " + W.w + " \u2014 " + W.text + "</h2>";
    if (W.author) h += "<div class=\"lesson-meta\" style=\"font-style:italic;margin-bottom:.35rem;\">" + W.author + "</div>";
    h += "<div class=\"lesson-meta\"><span>" + W.genre + "</span><span>" + U.eq + "</span></div></div>";
    if (state.tab === 0) {
      h += "<div class=\"overview-grid\">";
      h += chip("Weekly Question", W.wq);
      h += chip("Comprehension Skill", W.comp);
      h += chip("Vocabulary Focus", W.vocab);
      h += chip("Word Study", W.word);
      h += chip("Author's Craft", W.craft);
      h += chip("Below-Level Resources", W.belowRes);
      h += "</div>";
    } else if (state.tab === 1) {
      if (isProj) h += "<div class=\"project-note\"><strong>Week 6 \u2014 Project-Based Inquiry:</strong> " + W.wq + "<br><br>Below-Level group: use the leveled research articles listed in Weekly Overview for a simplified read-and-sort activity.</div>";
      h += lessonPanel(W.below, "below", "Below Level");
    } else {
      if (isProj) h += "<div class=\"project-note\"><strong>Week 6 \u2014 Project-Based Inquiry:</strong> On-Level group joins the whole-class research project directly.</div>";
      h += lessonPanel(W.on, "on", "On Level");
    }
    document.getElementById("lesson-content").innerHTML = h;
  }

  function render() { renderSidebar(); renderTabs(); renderLesson(); saveState(); }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.classList.contains("unit-title")) {
      var ug = t.parentElement;
      if (ug && ug.dataset.unit !== undefined) { state.unit = parseInt(ug.dataset.unit,10); state.week = 0; state.tab = 0; render(); }
    } else if (t.classList.contains("week-item")) {
      state.unit = parseInt(t.dataset.unit,10); state.week = parseInt(t.dataset.week,10); state.tab = 0; render();
    } else if (t.classList.contains("tab-btn")) {
      state.tab = parseInt(t.dataset.tab,10); render();
    } else if (t.id === "print-btn") { window.print(); }
  });

  loadState();
  render();
}());
