// hr_tracker.js — Homeroom Class Tracker
"use strict";

var KEY = "hr_tracker";
var GROUPS = {
  "Sight Words": {icon:"\uD83D\uDD35", cls:"sw", desc:"VALSS At Risk"},
  "Fluency": {icon:"\uD83D\uDFE0", cls:"fl", desc:"VALSS Some Risk"},
  "Comprehension": {icon:"\uD83D\uDFE2", cls:"cp", desc:"VALSS Low Risk"}
};
var RISK_MAP = {"At Risk":"Sight Words","Some Risk":"Fluency","Low Risk":"Comprehension"};

function uid(){ return Date.now().toString(36)+Math.random().toString(36).substr(2,5); }
function load(){ try { return JSON.parse(localStorage.getItem(KEY))||{}; } catch(e){ return {}; } }
function save(d){ try { localStorage.setItem(KEY,JSON.stringify(d)); } }

var _hrid = null;

var HR_STATION_META = {
  'Sight Words': {icon:'\uD83D\uDD35', cls:'sw', scoreType:'mastery', goal:80, goalLabel:'80% Mastery'},
  'Fluency': {icon:'\uD83D\uDFE0', cls:'fl', scoreType:'wpm', goal:90, goalLabel:'90 WPM'},
  'Comprehension': {icon:'\uD83D\uDFE2', cls:'cp', scoreType:'dok', goal:80, goalLabel:'80% DOK'}
};

var HR_DOLCH = {
  pre:['a','and','away','big','blue','can','come','down','find','for','funny','go','help','here','I','in','is','it','jump','little','look','make','me','my','not','one','play','red','run','said','see','the','three','to','two','up','we','where','yellow','you'],
  primer:['all','am','are','at','ate','be','black','brown','but','came','did','do','eat','four','get','good','have','he','into','like','must','new','no','now','on','our','out','please','pretty','ran','ride','saw','say','she','so','soon','that','there','they','this','too','under','want','was','well','went','what','white','who','will','with','yes'],
  g1:['after','again','an','any','as','ask','by','could','every','fly','from','give','going','had','has','her','him','his','how','just','know','let','live','may','of','old','once','open','over','put','round','some','stop','take','thank','them','think','walk','were','when'],
  g2:['always','around','because','been','before','best','both','buy','call','cold','does',"don't",'fast','first','five','found','gave','goes','green','its','made','many','off','or','pull','read','right','sing','sit','sleep','tell','their','these','those','upon','us','use','very','wash','which','why','wish','work','would','write','your'],
  g3:['about','better','bring','carry','clean','cut','done','draw','drink','eight','fall','far','full','got','grow','hold','hot','hurt','if','keep','kind','laugh','light','long','much','myself','never','nine','only','own','pick','seven','shall','show','six','small','start','ten','today','together','try','warm']
};

var DAYS_OF_WEEK=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function showHrtRoster(el,d){
  var sts = d.students || [],
      todayDay = DAYS_OF_WEEK[new Date().getDay()],
      testToday = sts.filter(function(s){ return s.testDay === todayDay; });
  var h = "<div style='padding:1rem'>";

  // Highlight students testing today
  if(testToday.length){
    h += "<div style='background:#fef9c3;border:1.5px solid #fde047;border-radius:10px;padding:.7rem 1rem;margin-bottom:.8rem'>"+
         "<div style='font-size:.85rem;font-weight:700;color:#713f12;margin-bottom:.35rem'>\uD83D\uDCC5 Test Today ("+todayDay+")</div>";
    testToday.forEach(function(s){
      h += "<span class='hrt-scard' data-sid='"+s.id+"' style='display:inline-flex;align-items:center;gap:.35rem;padding:.22rem .55rem;background:#fff;border-radius:5px;margin:.15rem;cursor:pointer;border:1px solid #fde047;font-size:.82rem;font-weight:600;color:#0f172a'>"+s.name+" \u203a</span>";
    });
    h += "</div>";
  }

  // Add Student form
  h += "<div style='background:#f8faff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.75rem 1rem;margin-bottom:.9rem'>"+
       "<div style='font-size:.88rem;font-weight:700;color:#1e3a8a;margin-bottom:.4rem'>Add Student</div>"+
       "<div style='display:flex;gap:.5rem;flex-wrap:wrap;align-items:flex-end'>"+
       "<div><div style='font-size:.74rem;font-weight:600;color:#475569;margin-bottom:.15rem'>Name</div><input id='hrt-name' type='text' placeholder='First name' style='padding:.3rem .5rem;border:1.5px solid #cbd5e1;border-radius:6px;font-size:.83rem;width:120px'></div>"+
       "<div><div style='font-size:.74rem;font-weight:600;color:#475569;margin-bottom:.15rem'>VALSS Risk</div><select id='hrt-risk' style='padding:.3rem .5rem;border:1.5px solid #cbd5e1;border-radius:6px;font-size:.83rem'><option value=''>-- Select --</option><option value='At Risk'>At Risk</option><option value='Some Risk'>Some Risk</option><option value='Low Risk'>Low Risk</option></select></div>"+
       "<div><div style='font-size:.74rem;font-weight:600;color:#475569;margin-bottom:.15rem'>Testing Day</div><select id='hrt-day' style='padding:.3rem .5rem;border:1.5px solid #cbd5e1;border-radius:6px;font-size:.83rem'><option value=''>-- Select --</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></div>"+
       "<button id='hrt-add-btn' style='padding:.35rem .9rem;background:#1e40af;color:#fff;border:none;border-radius:6px;font-size:.83rem;font-weight:600;cursor:pointer'>+ Add</button></div></div>";

  // Group sections
  [["Sight Words","\uD83D\uDD35","#eff6ff","#bfdbfe","#1e40af"],
   ["Fluency","\uD83D\uDFE0","#fff7ed","#fed7aa","#c2410c"],
   ["Comprehension","\uD83D\uDFE2","#f0fdf4","#bbf7d0","#166534"]].forEach(function(sta){
    var grp = sts.filter(function(s){ return s.group === sta[0]; });
    h += "<div style='background:"+sta[2]+";border:1.5px solid "+sta[3]+";border-radius:10px;padding:.75rem 1rem;margin-bottom:.6rem'>"+
         "<div style='font-size:.85rem;font-weight:700;color:"+sta[4]+";margin-bottom:.4rem'>"+sta[1]+" "+sta[0]+" <span style='font-weight:400;font-size:.77rem;color:#94a3b8'>("+grp.length+")</span></div>";
    if(!grp.length){ h += "<div style='font-size:.77rem;color:#94a3b8;font-style:italic'>No students yet</div>"; }
    grp.forEach(function(s){
      var le = s.entries && s.entries.length ? s.entries[s.entries.length-1] : null,
          sc = "No sessions";
      if(le){
        if(s.group==="Sight Words") sc=(le.score||0)+"% mastery";
        else if(s.group==="Fluency") sc=(le.wpm||0)+" WPM";
        else {
          var dp=(le.d1q1?1:0)+(le.d1q2?1:0)+(le.d2q1?2:0)+(le.d2q2?2:0)+(le.d3q1?3:0)+(le.d3q2?3:0)+(le.d4q1?4:0)+(le.d4q2?4:0);
          sc=dp+"/20";
        }
      }
      var tb = s.testDay ? "<span style='font-size:.68rem;color:#92400e;background:#fef9c3;border-radius:3px;padding:.05rem .25rem;margin-left:.25rem'>"+s.testDay.slice(0,3)+"</span>" : "";
      h += "<div class='hrt-scard' data-sid='"+s.id+"' style='display:flex;justify-content:space-between;align-items:center;padding:.38rem .6rem;background:rgba(255,255,255,.75);border-radius:7px;margin:.2rem 0;cursor:pointer;border:1px solid "+sta[3]+"'><span style='font-size:.85rem;font-weight:600;color:#0f172a'>"+s.name+tb+"</span><span style='font-size:.75rem;color:"+sta[4]+"'>"+sc+" \u203a</span></div>";
    });
    h += "</div>";
  });

  if(!sts.length){ h += "<div style='text-align:center;padding:2rem;color:#94a3b8'>Add your first student above.</div>"; }
  h += "<button id='hrt-pass-btn' style='margin-top:.6rem;font-size:.78rem;padding:.28rem .7rem;border:1.5px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;color:#475569'>\uD83D\uDCDA View / Print Passages</button></div>";

  el.innerHTML = h;

  // Add student handler
  var ab = document.getElementById("hrt-add-btn");
  if(ab) ab.addEventListener("click",function(){
    var nm=(document.getElementById("hrt-name")||{}).value.trim(),
        risk=(document.getElementById("hrt-risk")||{}).value,
        day=(document.getElementById("hrt-day")||{}).value;
    if(!nm){alert("Enter a student name.");return;}
    if(!risk){alert("Select a VALSS risk level.");return;}
    if(!day){alert("Select a testing day.");return;}
    var d2=load(),ns={id:uid(),name:nm,risk:risk,group:RISK_MAP[risk],testDay:day,entries:[]};
    d2.students.push(ns);save(d2);_hrid=ns.id;renderInto(el);
  });

  // Card click + passages button
  el.addEventListener("click",function(e){
    var c=e.target.closest?e.target.closest(".hrt-scard"):null;
    if(c && c.dataset.sid){ _hrid=c.dataset.sid; renderInto(el); }
    if(e.target.id==="hrt-pass-btn"){ renderHrtPassages(el); }
  });
}

function showHrtStudentFile(el,d,sel){
  var m2 = HR_STATION_META[sel.group];
  var h = "<div style='padding:.75rem 1rem'><div style='display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem'>";
  h += "<button id='hrt-back' style='font-size:.77rem;padding:.27rem .6rem;border-radius:6px;border:1px solid #e2e8f0;background:#f8faff;color:#1e3a8a;cursor:pointer'>\u2190 All Students</button>";
  h += "<h2 style='margin:0;font-size:.98rem;color:#0f172a'>"+sel.name+"</h2>";
  h += "<span style='background:"+(m2.cls==="sw"?"#eff6ff":m2.cls==="fl"?"#fff7ed":"#f0fdf4")+";color:"+(m2.cls==="sw"?"#1e40af":m2.cls==="fl"?"#c2410c":"#166534")+";padding:.18rem .55rem;border-radius:12px;font-size:.74rem;font-weight:700'>"+m2.icon+" "+sel.group+"</span>";
  if(sel.testDay) h += "<span style='background:#fef9c3;color:#713f12;padding:.15rem .45rem;border-radius:10px;font-size:.73rem'>\uD83D\uDCC5 "+sel.testDay+"</span>";
  h += "<button class='hrt-del' data-del='"+sel.id+"' style='font-size:.76rem;padding:.25rem .55rem;border-radius:5px;border:1px solid #fca5a5;background:#fff;color:#dc2626;cursor:pointer;margin-left:auto'>Remove</button></div>";

  // Log Session form
  h += "<div style='background:#f8faff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem'><div style='font-size:.85rem;font-weight:700;color:#0f172a;margin-bottom:.35rem'>Log Session</div><div class='hrt-frow'><label>Date<input id='hrt-date' type='date' class='hrt-inp-sm' value='"+new Date().toISOString().slice(0,10)+"'></label>";

  if(sel.group==="Sight Words"){
    h += "<label>Dolch Level<select id='hrt-sw-lvl' class='hrt-sel'><option value='pre'>Pre-Primer (40)</option><option value='primer'>Primer (52)</option><option value='g1'>1st Grade (41)</option><option value='g2'>2nd Grade (46)</option><option value='g3'>3rd Grade (41)</option></select></label></div><div id='hrt-sw-grid' style='padding:.35rem 0;min-height:28px'></div><div id='hrt-sw-score' style='font-size:.78rem;color:#1d4ed8;padding:.2rem 0;font-weight:600'>Select a level to load words</div>";
  } else if(sel.group==="Fluency"){
    h += "<label>Passage<select id='hrt-story' class='hrt-sel'><option value=''>\u2014 Select \u2014</option>";
    HR_STORIES.forEach(function(s){ h += "<option value='"+s.id+"'>Story "+s.id+": "+s.t+" ("+s.wc+" words)</option>"; });
    h += "</select></label><label>Time (min)<input id='hrt-time' type='number' step='0.5' min='0.5' max='10' class='hrt-inp-sm' placeholder='1.5'></label></div><div id='hrt-fl-words' style='display:none;margin:.4rem 0'></div>";
  } else {
    h += "<label>Passage<select id='hrt-story' class='hrt-sel'><option value=''>\u2014 Select \u2014</option>";
    HR_STORIES.forEach(function(s){ h += "<option value='"+s.id+"'>Story "+s.id+": "+s.t+" ("+s.wc+" words)</option>"; });
    h += "</select></label><label>Read time<input id='hrt-time' type='number' step='0.5' min='0.5' max='20' class='hrt-inp-sm' placeholder='3.5'></label></div><div id='hrt-cp-area' style='display:none;margin:.4rem 0'></div>";
  }

  h += "<div class='hrt-frow'><label>Notes<input id='hrt-notes' class='hrt-inp-sm' placeholder='Optional'></label><button id='hrt-log' class='hrt-btn-pri' data-sid='"+sel.id+"'>Log Session</button></div></div>";

  // Chart + history
  var sl = m2.scoreType==="wpm"?"WPM":m2.scoreType==="mastery"?"Mastery %":"DOK %";
  h += "<div class='trk-chart-box'><canvas id='hrt-canvas' width='540' height='200'></canvas><div class='trk-legend'><span class='trk-leg-line'></span> "+sl+" <span class='trk-leg-goal'></span> Goal ("+m2.goalLabel+")</div></div>";
  h += "<div class='trk-hist-box'><div class='trk-hist-title'>Score History</div>";

  if(!sel.entries || !sel.entries.length){
    h += "<p class='trk-empty-s'>No sessions yet.</p>";
  } else {
    var sorted = sel.entries.slice().sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
    h += "<table class='trk-tbl'><thead><tr><th>Date</th><th>Score</th><th>Notes</th><th></th></tr></thead><tbody>";
    sorted.forEach(function(e){
      var sc="";
      if(sel.group==="Sight Words") sc=(e.score||0)+"% mastery";
      else if(sel.group==="Fluency") sc=(e.wpm||0)+" WPM";
      else {
        var dp2=(e.d1q1?1:0)+(e.d1q2?1:0)+(e.d2q1?2:0)+(e.d2q2?2:0)+(e.d3q1?3:0)+(e.d3q2?3:0)+(e.d4q1?4:0)+(e.d4q2?4:0);
        sc=dp2+"/20 ("+(e.score||Math.round(dp2/20*100))+"%)";
      }
      h += "<tr><td>"+e.date+"</td><td><strong>"+sc+"</strong></td><td style='font-size:.8rem;color:#64748b'>"+(e.notes||"")+"</td><td><button class='hrt-del-e' data-sid='"+sel.id+"' data-eid='"+(e.id||"")+"'>&times;</button></td></tr>";
    });
    h += "</tbody></table>";
  }

  h += "</div></div>";
  el.innerHTML = h;

  if(sel.entries && sel.entries.length){ drawHrtChart(sel,m2); }
  wireHRT(el,sel,d.students);
}

function renderHrtPassages(el){
  var h="<div style='padding:1rem 1.25rem'>"
    +"<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem'>"
    +"<strong>&#128218; Reading Passages</strong>"
    +"<button id='hrt-pb-back' class='hrt-btn-sm'>&#8592; Back</button></div>"
    +"<div style='font-size:.78rem;color:#64748b;margin-bottom:.7rem'>22 passages &bull; DOK 1&#8211;4 &bull; Student copies print without answers</div>";

  HR_STORIES.forEach(function(s){
    h+="<div style='background:#fff;border:1px solid var(--border);border-radius:8px;padding:.7rem .9rem;margin-bottom:.5rem'>"
      +"<div style='display:flex;justify-content:space-between;align-items:center;gap:.5rem'>"
      +"<strong style='font-size:.87rem'>Story "+s.id+": "+s.t+"</strong> <span style='font-size:.74rem;color:#64748b;font-weight:400'>("+s.wc+" words)</span>"
      +"<button class='hrt-stucopy' data-sid='"+s.id+"' style='font-size:.73rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;padding:.2rem .55rem;cursor:pointer;white-space:nowrap;flex-shrink:0'>&#128438; Student Copy</button></div>"
      +"<p style='font-size:.8rem;color:#475569;margin:.3rem 0 .3rem;line-height:1.55'>"+s.p+"</p>"
      +"<div style='font-size:.74rem;line-height:1.6'>";
    s.dok.forEach(function(dq){
      h+="<span style='background:#f1f5f9;border-radius:3px;padding:.05rem .3rem;margin:.1rem .2rem .1rem 0;display:inline-block'>DOK "+dq.lvl+" ("+dq.pts+"pt)</span><br>";
      h+="<strong>1.</strong> "+dq.q1+" <em style='color:#94a3b8'>&#8594; "+dq.a1+"</em><br>";
      h+="<span style='padding-left:.8rem'><strong>2.</strong> "+dq.q2+" <em style='color:#94a3b8'>&#8594; "+dq.a2+"</em></span><br>";
    });
    h+="</div></div>";
  });

  h+="</div>";
  el.innerHTML=h;

  // Back button
  var pb=document.getElementById("hrt-pb-back");
  if(pb) pb.addEventListener("click",function(){ renderInto(el); });

  // Student Copy buttons
  el.querySelectorAll(".hrt-stucopy").forEach(function(btn){
    btn.addEventListener("click",function(){
      printStudentCopyHR(parseInt(this.dataset.sid,10));
    });
  });
}

// --- Export tracker globally ---
el.querySelectorAll(".hrt-stucopy").forEach(function(btn){
    btn.addEventListener("click",function(){
      printStudentCopyHR(parseInt(this.dataset.sid,10));
    });
  });
}
