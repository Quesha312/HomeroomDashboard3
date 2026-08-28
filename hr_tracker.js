// hr_tracker.js — Homeroom Class Tracker
// Placement via prior 2nd-grade VALLSS scores:
// At Risk → Sight Words | Some Risk → Fluency | Low Risk → Comprehension
(function () {
  "use strict";
  var KEY = "hr_tracker_v1";
  var GROUPS = {
    "Sight Words":   {icon:"\uD83D\uDD35", cls:"sw", desc:"VALLSS At Risk — intensive foundational & decoding support"},
    "Fluency":       {icon:"\uD83D\uDFE0", cls:"fl", desc:"VALLSS Some Risk — strategic fluency & word study support"},
    "Comprehension": {icon:"\uD83D\uDFE2", cls:"cp", desc:"VALLSS Low Risk — grade-level, comprehension deepening"}
  };
  var RISK_MAP = {"At Risk":"Sight Words","Some Risk":"Fluency","Low Risk":"Comprehension"};
  function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY))||{className:"",students:[]}; } catch(e) { return {className:"",students:[]}; } }
  function save(d) { try { localStorage.setItem(KEY,JSON.stringify(d)); } catch(e) {} }

  function renderInto(el) {
    var data = load();
    var cn = data.className||"";
    var students = data.students||[];
    var groups = {"Sight Words":[],"Fluency":[],"Comprehension":[]};
    students.forEach(function(s){ if(groups[s.group]) groups[s.group].push(s); });

    var h = "<div class='hrt-wrap'>";

    // Class name header
    h += "<div class='hrt-hd'>";
    h += "<div class='hrt-class-row'><span class='hrt-lbl'>Class:</span>";
    h += "<input class='hrt-class-inp' id='hrt-class' value='" + cn.replace(/'/g,"&#39;") + "' placeholder='e.g. 3B \u2014 Ms. Crosby'>";
    h += "<button class='hrt-btn-sm' id='hrt-save-class'>Save</button></div>";
    h += "<div class='hrt-sub'>Prior 2nd-grade VALLSS scores &nbsp;\u00B7&nbsp; At Risk = Sight Words &nbsp;\u00B7&nbsp; Some Risk = Fluency &nbsp;\u00B7&nbsp; Low Risk = Comprehension</div>";
    h += "</div>";

    // Add student panel
    h += "<div class='hrt-add-panel'>";
    h += "<div class='hrt-add-top'><span class='hrt-add-title'>Students ("+students.length+")</span>";
    h += "<button class='hrt-btn-pri' id='hrt-toggle-form'>+ Add Student</button></div>";
    h += "<div id='hrt-form' style='display:none' class='hrt-form'>";
    h += "<input class='hrt-inp' id='hrt-name' placeholder='Student first name'>";
    h += "<div class='hrt-frow'>";
    h += "<label class='hrt-fld'>VALLSS Risk Level";
    h += "<select class='hrt-sel' id='hrt-risk'>";
    h += "<option value=''>-- Select --</option>";
    h += "<option value='At Risk'>At Risk</option>";
    h += "<option value='Some Risk'>Some Risk</option>";
    h += "<option value='Low Risk'>Low Risk</option>";
    h += "</select></label>";
    h += "<label class='hrt-fld'>Raw Score (opt.)<input class='hrt-inp-sm' id='hrt-score' type='number' min='0' max='999' placeholder='e.g. 412'></label>";
    h += "</div>";
    h += "<div class='hrt-frow'><button class='hrt-btn-pri' id='hrt-add-btn'>Add</button>";
    h += "<button class='hrt-btn-sm' id='hrt-cancel-btn'>Cancel</button></div></div></div>";

    // Group cards
    h += "<div class='hrt-groups'>";
    ["Sight Words","Fluency","Comprehension"].forEach(function(grpName){
      var g = GROUPS[grpName]; var grp = groups[grpName];
      h += "<div class='hrt-grp-card'>";
      h += "<div class='hrt-grp-hd hrt-"+g.cls+"'>"+g.icon+" "+grpName+" <span class='hrt-count'>("+grp.length+")</span></div>";
      h += "<div class='hrt-grp-desc'>"+g.desc+"</div>";
      if (!grp.length) {
        h += "<div class='hrt-empty'>No students yet</div>";
      } else {
        h += "<div class='hrt-list'>";
        grp.forEach(function(s){
          h += "<div class='hrt-srow'>";
          h += "<span class='hrt-sname'>"+s.name+"</span>";
          h += "<span class='hrt-smeta'>"+s.risk+(s.score?" \u00B7 "+s.score:"")+"</span>";
          h += "<button class='hrt-del' data-del='"+s.id+"' title='Remove'>\u00D7</button>";
          h += "</div>";
        });
        h += "</div>";
      }
      h += "</div>";
    });
    h += "</div>";

    h += "<div class='hrt-summary'>Total: "+students.length+" &nbsp;\u00B7&nbsp; \uD83D\uDD35 "+groups["Sight Words"].length+" &nbsp;\u00B7&nbsp; \uD83D\uDFE0 "+groups["Fluency"].length+" &nbsp;\u00B7&nbsp; \uD83D\uDFE2 "+groups["Comprehension"].length+"</div>";
    h += "</div>";
    el.innerHTML = h;
    wireHRT(el);
  }

  function wireHRT(el) {
    var sc = document.getElementById("hrt-save-class");
    if (sc) sc.addEventListener("click",function(){
      var d=load(); d.className=(document.getElementById("hrt-class").value||"").trim();
      save(d); renderInto(el);
    });
    var tog = document.getElementById("hrt-toggle-form");
    var frm = document.getElementById("hrt-form");
    if (tog&&frm) tog.addEventListener("click",function(){
      frm.style.display = frm.style.display==="none"?"block":"none";
    });
    var can = document.getElementById("hrt-cancel-btn");
    if (can) can.addEventListener("click",function(){ if(frm) frm.style.display="none"; });
    var add = document.getElementById("hrt-add-btn");
    if (add) add.addEventListener("click",function(){
      var name=(document.getElementById("hrt-name").value||"").trim();
      var risk=document.getElementById("hrt-risk").value;
      var scoreEl=document.getElementById("hrt-score");
      var score=scoreEl&&scoreEl.value.trim();
      if(!name){alert("Enter a student name.");return;}
      if(!risk){alert("Select a VALLSS risk level.");return;}
      var d=load();
      d.students.push({id:uid(),name:name,risk:risk,score:score?parseInt(score):null,group:RISK_MAP[risk],added:new Date().toISOString().slice(0,10)});
      save(d); renderInto(el);
    });
    el.querySelectorAll(".hrt-del").forEach(function(btn){
      btn.addEventListener("click",function(){
        if(!confirm("Remove this student?")) return;
        var d=load(); d.students=d.students.filter(function(s){return s.id!==btn.dataset.del;});
        save(d); renderInto(el);
      });
    });
  }

  window.HR_TRACKER = { render: renderInto };
}());
