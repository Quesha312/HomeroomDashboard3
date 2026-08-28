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
  var state = { unit:0, week:0, tab:0, bpDay:0, section:"lesson" };

  function saveState() { try { localStorage.setItem("hr_nav", JSON.stringify({u:state.unit,w:state.week,t:state.tab,d:state.bpDay,s:state.section})); } catch(e) {} }
  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem("hr_nav") || "{}");
      if (typeof s.u === "number" && s.u < UNITS.length) state.unit = s.u;
      if (typeof s.w === "number" && s.w < UNITS[state.unit].weeks.length) state.week = s.w;
      if (typeof s.t === "number" && s.t < TABS.length) state.tab = s.t;
      if (typeof s.d === "number" && s.d < 5) state.bpDay = s.d;
      if (typeof s.s === "string") state.section = s.s;
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
    html += "<button class='trk-sidebar-btn" + (state.section==="tracker" ? " active" : "") + "' data-section='tracker'>\uD83D\uDCCA Class Tracker</button>";
    document.getElementById("sidebar").innerHTML = html;
  }

  function renderTabs() {
    var tabsEl = document.getElementById("tabs");
    if (state.section === "tracker") { tabsEl.innerHTML = ""; tabsEl.style.display = "none"; return; }
    tabsEl.style.display = "";
    var html = "";
    for (var i = 0; i < TABS.length; i++) {
      html += "<button class=\"tab-btn" + (i === state.tab ? " active" : "") +
              "\" data-tab=\"" + i + "\">" + TABS[i] + "</button>";
    }
    tabsEl.innerHTML = html;
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
    var DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
    var SHORT = ["Mon","Tue","Wed","Thu","Fri"];
    var day = state.bpDay;
    var bpKey = "hr_bp_u" + state.unit + "_w" + state.week + "_d" + day;

    // Day-specific schedules — each day has genuinely different content
    var SCHED = [
      [ // Monday — Build Knowledge + Introduce Anchor Text
        {t:"0\u201310",l:"WARM UP",c:"bp-warmup",x:"Word Study preview \u2022 <strong>"+W.word+"</strong> \u2022 Background knowledge activation"},
        {t:"10\u201335",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Build Knowledge:</strong> Weekly Launch activity \u2022 Introduce Weekly Question: <em>"+W.wq+"</em>"},
        {t:"35\u201355",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Begin Anchor Text Read-Aloud:</strong> <em>"+W.text+"</em> \u2022 Read first half \u2022 Model comprehension strategy"},
        {t:"55\u201375",l:"SMALL GROUPS",c:"bp-small",x:"<strong>Below Level:</strong> Preview decodable with teacher \u2022 <strong>On Level:</strong> Preview anchor text vocabulary independently"},
        {t:"75\u201390",l:"WRAP-UP",c:"bp-wrapup",x:"Talk About It \u2022 Initial response to Weekly Question \u2022 Preview vocabulary for tomorrow"}
      ],
      [ // Tuesday — Finish Text + Vocabulary + Skill Introduction
        {t:"0\u201310",l:"WARM UP",c:"bp-warmup",x:"<strong>Vocabulary Preview:</strong> "+W.vocab+" \u2022 Academic word cards, partner discussion"},
        {t:"10\u201335",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Finish Anchor Text:</strong> <em>"+W.text+"</em> \u2022 Discuss character, events, or main ideas"},
        {t:"35\u201355",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Comprehension Skill Introduction:</strong> "+W.comp+" \u2022 Model with text evidence from anchor text"},
        {t:"55\u201375",l:"SMALL GROUPS",c:"bp-small",x:"<strong>Below Level:</strong> "+W.belowRes+" \u2022 <strong>On Level:</strong> Apply comprehension skill with partner"},
        {t:"75\u201390",l:"WRAP-UP",c:"bp-wrapup",x:"Write to Sources \u2022 Sentence frame response using comprehension skill"}
      ],
      [ // Wednesday — Skill Practice + Word Study + Differentiated Groups
        {t:"0\u201310",l:"WARM UP",c:"bp-warmup",x:"<strong>Academic Vocabulary Review:</strong> "+W.vocab+" \u2022 Partner vocabulary practice"},
        {t:"10\u201335",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Comprehension Skill Practice:</strong> "+W.comp+" \u2022 Guided practice with a new text example"},
        {t:"35\u201355",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Word Study Introduction:</strong> "+W.word+" \u2022 Model pattern, word sort and practice together"},
        {t:"55\u201375",l:"SMALL GROUPS",c:"bp-small",x:"<strong>Teacher \u2192 Below Level:</strong> comprehension skill focus \u2022 <strong>On Level:</strong> independent skill practice"},
        {t:"75\u201390",l:"WRAP-UP",c:"bp-wrapup",x:"Share comprehension skill application \u2022 Add to anchor chart"}
      ],
      [ // Thursday — Author's Craft + Writing Response
        {t:"0\u201310",l:"WARM UP",c:"bp-warmup",x:"<strong>Word Study Practice:</strong> "+W.word+" \u2022 Word sort, spelling practice"},
        {t:"10\u201335",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Author's Craft:</strong> "+W.craft+" \u2022 Find examples in anchor text \u2022 Model analysis"},
        {t:"35\u201355",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Write to Sources:</strong> Draft 2\u20133 sentence response with text evidence \u2022 Model planning and drafting"},
        {t:"55\u201375",l:"SMALL GROUPS",c:"bp-small",x:"<strong>Peer Editing + Teacher Conferences:</strong> Students share drafts \u2022 Below Level gets sentence frame scaffold"},
        {t:"75\u201390",l:"WRAP-UP",c:"bp-wrapup",x:"Author's Craft share-out \u2022 Build class anchor chart with examples"}
      ],
      [ // Friday — Wrap-Up + Reflect + Preview
        {t:"0\u201310",l:"WARM UP",c:"bp-warmup",x:"<strong>Spiral Word Study Review:</strong> "+W.word+" \u2022 Quick practice / assessment prep"},
        {t:"10\u201335",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Revisit Weekly Question:</strong> <em>"+W.wq+"</em> \u2022 Connect anchor text to unit theme"},
        {t:"35\u201355",l:"WHOLE GROUP",c:"bp-whole",x:"<strong>Academic Vocabulary Wrap-Up:</strong> "+W.vocab+" \u2022 Vocabulary journal or review game"},
        {t:"55\u201375",l:"SMALL GROUPS",c:"bp-small",x:"<strong>Independent Reading at Level</strong> \u2022 Students read leveled text \u2022 Teacher reteach group if needed"},
        {t:"75\u201390",l:"WRAP-UP",c:"bp-wrapup",x:"Exit ticket \u2022 Reflect on Weekly Question \u2022 Preview next week"}
      ]
    ];

    // (rest of function continues with same structure — see below)
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(bpKey) || "{}"); } catch(e) {}

    function bpRow(time, lbl, cls, content) {
      return "<div class='bp-row " + cls + "'><div class='bp-time'>" + time + "</div>" +
             "<div class='bp-lbl'>" + lbl + "</div><div class='bp-cnt'>" + content + "</div></div>";
    }

    var h = "<div class='bp-wrap'>";

    // Header
    h += "<div class='bp-hd'>";
    h += "<div class='bp-title'>\uD83D\uDCCB 5-Day Block Plan \u2014 Week " + W.w + "</div>";
    h += "<div class='bp-sub'><em>" + W.text + "</em>";
    if (W.author) h += " <span style='font-weight:400'>" + W.author + "</span>";
    h += "</div><div class='bp-eq'>" + U.eq + "</div></div>";

    // Day selector tabs
    h += "<div class='bp-day-tabs'>";
    for (var d = 0; d < 5; d++) {
      h += "<button class='bp-day-btn" + (d === day ? " active" : "") + "' data-day='" + d + "'>" + SHORT[d] + "</button>";
    }
    h += "</div>";

    h += "<div class='bp-day-hd'>" + DAYS[day] + " \u2014 90-Minute Block</div>";

    // Schedule
    h += "<div class='bp-sched'>";
    SCHED[day].forEach(function(row){ h += bpRow(row.t, row.l, row.c, row.x); });
    h += "</div>";

    // Pull-out section (per-day)
    h += "<div class='bp-pullout'>";
    h += "<div class='bp-po-hd'>\uD83D\uDD00 Pull-Out Window <span class='bp-po-hint'>(" + DAYS[day] + " \u2014 optional, saves per day)</span></div>";
    h += "<div class='bp-po-grid'>";
    h += "<label class='bp-field'>Start<input class='bp-inp' id='bp-start' value='" + (saved.start||"") + "' placeholder='e.g. 10:55 AM'></label>";
    h += "<label class='bp-field'>End<input class='bp-inp' id='bp-end' value='" + (saved.end||"") + "' placeholder='e.g. 11:15 AM'></label>";
    h += "<label class='bp-field'>Who Pulls<input class='bp-inp' id='bp-who' value='" + (saved.who||"ELL Teacher") + "'></label>";
    h += "</div>";
    h += "<label class='bp-field' style='display:block;margin-top:.55rem'>Students Pulled<textarea class='bp-ta' id='bp-students'>" + (saved.students||"") + "</textarea></label>";
    h += "<label class='bp-field' style='display:block;margin-top:.4rem'>Notes<textarea class='bp-ta' id='bp-notes'>" + (saved.notes||"") + "</textarea></label>";
    h += "<div style='margin-top:.75rem;display:flex;gap:.6rem;align-items:center'>";
    h += "<button class='bp-save-btn' id='bp-save' data-key='" + bpKey + "'>Save " + DAYS[day] + "</button>";
    h += "<span id='bp-ok' style='color:#16a34a;font-size:.82rem;display:none'>Saved \u2713</span></div></div>";

    // Wrap-up
    h += "<div class='bp-sched'>";
    h += bpRow("75\u201390 min", "WRAP-UP", "bp-wrapup",
      "Independent reading \u2022 Writing response \u2022 Share out \u2022 Exit ticket");
    h += "</div></div>";

    var el = document.getElementById("lesson-content");
    el.innerHTML = h;

    // Wire save button
    var sb = document.getElementById("bp-save");
    if (sb) sb.addEventListener("click", function() {
      var p = { start:document.getElementById("bp-start").value.trim(),
                end:document.getElementById("bp-end").value.trim(),
                who:document.getElementById("bp-who").value.trim(),
                students:document.getElementById("bp-students").value.trim(),
                notes:document.getElementById("bp-notes").value.trim() };
      try { localStorage.setItem(sb.dataset.key, JSON.stringify(p)); } catch(e) {}
      var ok = document.getElementById("bp-ok");
      if (ok) { ok.style.display="inline"; setTimeout(function(){ ok.style.display="none"; },2500); }
    });

    // Wire day tabs
    var btns = document.querySelectorAll(".bp-day-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function() {
        state.bpDay = parseInt(this.dataset.day, 10);
        renderBlockPlan(W, U);
      });
    }
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

  function render() {
    renderSidebar(); renderTabs();
    if (state.section === "tracker") {
      if (window.HR_TRACKER) { HR_TRACKER.render(document.getElementById("lesson-content")); }
      else { document.getElementById("lesson-content").innerHTML = "<div style='padding:2rem;color:#b91c1c'>hr_tracker.js not loaded — add &lt;script src=\"hr_tracker.js\"&gt;&lt;/script&gt; before app.js.</div>"; }
    } else { renderLesson(); }
    saveState();
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.classList.contains("unit-title")) {
      var ug = t.parentElement;
      if (ug && ug.dataset.unit !== undefined) { state.unit = parseInt(ug.dataset.unit,10); state.week = 0; state.tab = 0; state.section = "lesson"; render(); }
    } else if (t.classList.contains("week-item")) {
      state.unit = parseInt(t.dataset.unit,10); state.week = parseInt(t.dataset.week,10); state.tab = 0; state.section = "lesson"; render();
    } else if (t.classList.contains("tab-btn")) {
      state.tab = parseInt(t.dataset.tab,10); render();
    } else if (t.dataset && t.dataset.section) {
      state.section = t.dataset.section; render();
    } else if (t.id === "print-btn") { window.print(); }
  });

  loadState();
  render();
}());
