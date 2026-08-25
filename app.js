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
  var TABS  = ["Weekly Overview", "Below Level", "On Level", " Block Plan"];
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

  function renderBlockPlan(W, U) {
    var bpKey = "hr_block_u" + state.unit + "_w" + state.week;
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(bpKey) || "{}"); } catch(e) {}

    function bpRow(time, lbl, cls, content) {
      return "<div class='bp-row " + cls + "'><div class='bp-time'>" + time + "</div>" +
             "<div class='bp-lbl'>" + lbl + "</div><div class='bp-cnt'>" + content + "</div></div>";
    }

    var h = "<div class='bp-wrap'>";
    h += "<div class='bp-hd'><h2 class='bp-title'>\uD83D\uDCCB 90-Minute Block Plan</h2>";
    h += "<div class='bp-sub'>Week " + W.w + " \u2014 <em>" + W.text + "</em>";
    if (W.author) h += " <span style='font-weight:400;font-style:italic'>" + W.author + "</span>";
    h += "</div><div class='bp-eq'>" + U.eq + "</div></div>";

    h += "<div class='bp-sched'>";
    h += bpRow("0\u201310 min", "WARM UP", "bp-warmup",
      "Morning meeting \u2022 Spiral review \u2022 <strong>Word Study preview:</strong> " + W.word);
    h += bpRow("10\u201335 min", "WHOLE GROUP", "bp-whole",
      "<strong>Build Knowledge + Read-Aloud:</strong> <em>" + W.text + "</em><br>" +
      "<strong>Weekly Question:</strong> " + W.wq + "<br>" +
      "<strong>Author\u2019s Craft:</strong> " + W.craft);
    h += bpRow("35\u201355 min", "WHOLE GROUP", "bp-whole",
      "<strong>Skill Instruction:</strong> " + W.comp + "<br>" +
      "<strong>Vocabulary:</strong> " + W.vocab);
    h += bpRow("55\u201375 min", "SMALL GROUPS", "bp-small",
      "<strong>Teacher \u2192 Below Level:</strong> " + W.belowRes + "<br>" +
      "<strong>Partner/Station \u2192 On Level:</strong> independent skill practice");
    h += "</div>";

    h += "<div class='bp-pullout'>";
    h += "<div class='bp-po-hd'>\uD83D\uDD00 Pull-Out Window <span class='bp-po-hint'>(optional \u2014 edit & save)</span></div>";
    h += "<div class='bp-po-grid'>";
    h += "<label class='bp-field'>Start Time<input class='bp-inp' id='bp-start' placeholder='e.g. 10:55 AM' value='" + (saved.start||"" )+ "'></label>";
    h += "<label class='bp-field'>End Time<input class='bp-inp' id='bp-end' placeholder='e.g. 11:15 AM' value='" + (saved.end||"") + "'></label>";
    h += "<label class='bp-field'>Who Pulls<input class='bp-inp' id='bp-who' placeholder='ELL Teacher' value='" + (saved.who||"ELL Teacher") + "'></label>";
    h += "</div>";
    h += "<label class='bp-field' style='display:block;margin-top:.55rem'>Students Pulled<textarea class='bp-ta' id='bp-students' placeholder='Maria, Jose, Aiden'>" + (saved.students||"") + "</textarea></label>";
    h += "<label class='bp-field' style='display:block;margin-top:.4rem'>Notes / Materials<textarea class='bp-ta' id='bp-notes' placeholder='e.g. bring decodable cards'>" + (saved.notes||"") + "</textarea></label>";
    h += "<div style='margin-top:.75rem;display:flex;gap:.6rem;align-items:center'>";
    h += "<button class='bp-save-btn' id='bp-save' data-key='" + bpKey + "'>Save Pull-Out Info</button>";
    h += "<span id='bp-ok' style='color:#16a34a;font-size:.82rem;display:none'>Saved \u2713</span></div></div>";

    h += "<div class='bp-sched'>";
    h += bpRow("75\u201390 min", "WRAP-UP", "bp-wrapup",
      "Independent reading \u2022 Writing response \u2022 Share out \u2022 Exit ticket");
    h += "</div></div>";

    var el = document.getElementById("lesson-content");
    el.innerHTML = h;

    var sb = document.getElementById("bp-save");
    if (sb) sb.addEventListener("click", function() {
      var p = { start:document.getElementById("bp-start").value.trim(),
                end:document.getElementById("bp-end").value.trim(),
                who:document.getElementById("bp-who").value.trim(),
                students:document.getElementById("bp-students").value.trim(),
                notes:document.getElementById("bp-notes").value.trim() };
      try { localStorage.setItem(sb.dataset.key, JSON.stringify(p)); } catch(e) {}
      var ok = document.getElementById("bp-ok");
      if (ok) { ok.style.display="inline"; setTimeout(function(){ ok.style.display="none"; }, 2500); }
    });
  }

  function renderLesson() {
    var U = UNITS[state.unit];
    var W = U.weeks[state.week];
    if (state.tab === 3) { renderBlockPlan(W, U); return; }
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
