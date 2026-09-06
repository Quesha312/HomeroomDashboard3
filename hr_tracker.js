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
    var d=load();
    if(!_hrid){showHrtRoster(el,d);return;}
    var hrtS=null;for(var i=0;i<d.students.length;i++){if(d.students[i].id===_hrid){hrtS=d.students[i];break;}}
    if(!hrtS){_hrid=null;showHrtRoster(el,d);return;}
    showHrtStudentFile(el,d,hrtS);
  }

  function __legacy_renderInto_dead(el,cn,students,groups){
    var h="";
    // Class name header
    h += "<div class='hrt-hd'>";
    h += "<div class='hrt-class-row'><span class='hrt-lbl'>Class:</span>";
    h += "<input class='hrt-class-inp' id='hrt-class' value='" + cn.replace(/'/g,"&#39;") + "' placeholder='e.g. Class 3B'>";
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
    h += "<div style='padding:.35rem .75rem .85rem;text-align:center'><button id='hrt-pass-btn' class='hrt-btn-sm' style='font-size:.78rem'>&#128218; Print Student Passages</button></div>";
    el.innerHTML = h;
    wireHRT(el);
    var _pb=document.getElementById("hrt-pass-btn");
    if(_pb) _pb.addEventListener("click",function(){ renderHrtPassages(el); });
  }

  function wireHRT(el,sel,students){
    var back=document.getElementById("hrt-back");
    if(back)back.addEventListener("click",function(){_hrid=null;renderInto(el);});
    if(sel&&sel.group==="Sight Words"){
      var swLvl=document.getElementById("hrt-sw-lvl"),swGrid=document.getElementById("hrt-sw-grid"),swScore=document.getElementById("hrt-sw-score");
      if(swLvl&&swGrid)swLvl.addEventListener("change",function(){
        var words=HR_DOLCH[swLvl.value]||[];
        var gs="";words.forEach(function(w){gs+="<span class='trk-sw-word' data-word='"+w+"' data-state='0' style='display:inline-block;padding:.2rem .45rem;margin:.15rem;border:1.5px solid #cbd5e1;border-radius:5px;font-size:.8rem;cursor:pointer;background:#fff'>"+w+"</span>";});
        swGrid.innerHTML=gs;
        swGrid.addEventListener("click",function(e){
          var sp=e.target.closest?e.target.closest(".trk-sw-word"):null;if(!sp)return;
          var st=parseInt(sp.dataset.state||"0");
          if(st===0){sp.dataset.state="1";sp.style.background="#dcfce7";sp.style.borderColor="#86efac";}else if(st===1){sp.dataset.state="2";sp.style.background="#fee2e2";sp.style.borderColor="#fca5a5";}else{sp.dataset.state="0";sp.style.background="#fff";sp.style.borderColor="#cbd5e1";}
          var all=swGrid.querySelectorAll(".trk-sw-word"),cor=0,tot=0;
          all.forEach(function(x){if(x.dataset.state==="1"){cor++;tot++;}else if(x.dataset.state==="2")tot++;});
          if(swScore)swScore.textContent="Tested: "+tot+"/"+words.length+" \u2014 Correct: "+cor+" ("+Math.round(cor/Math.max(tot,1)*100)+"%)";
        });
      });
    }
    if(sel&&sel.group==="Fluency"){
      var stF=document.getElementById("hrt-story"),flW=document.getElementById("hrt-fl-words");
      if(stF)stF.addEventListener("change",function(){
        var story=HR_STORIES.find(function(s){return s.id===parseInt(stF.value,10);});
        if(!story||!flW)return;
        var words=story.p.split(" ");
        var wh="<div style='line-height:2.2;padding:.3rem 0'>";
        words.forEach(function(w,i){wh+="<span class='hrt-fw' data-idx='"+i+"' data-state='0' style='margin:.1rem;padding:.15rem .3rem;border-radius:4px;cursor:pointer;font-size:.86rem'>"+w+"</span> ";});
        wh+="</div>";flW.innerHTML=wh;flW.style.display="";
        flW.addEventListener("click",function(e){
          var sp=e.target.closest?e.target.closest(".hrt-fw"):null;if(!sp)return;
          var st=sp.dataset.state||"0";
          if(st==="0"){flW.querySelectorAll(".hrt-fw").forEach(function(x){if(x.dataset.state==="1"){x.dataset.state="0";x.style.background="";x.style.color="";}});sp.dataset.state="1";sp.style.background="#dcfce7";sp.style.color="#15803d";}
          else if(st==="1"){sp.dataset.state="2";sp.style.background="#fee2e2";sp.style.color="#dc2626";}
          else{sp.dataset.state="0";sp.style.background="";sp.style.color="";}
        });
      });
    }
    if(sel&&sel.group==="Comprehension"){
      var stC=document.getElementById("hrt-story"),ca=document.getElementById("hrt-cp-area");
      if(stC)stC.addEventListener("change",function(){
        var story=HR_STORIES.find(function(s){return s.id===parseInt(stC.value,10);});
        if(!story||!ca)return;
        ca.style.display="";
        var ch="<p style='font-size:.8rem;color:#334155;line-height:1.6;background:#f8faff;padding:.5rem .65rem;border-radius:6px;margin-bottom:.4rem'>"+story.p+"</p><div class='trk-dok-box'>";
        story.dok.forEach(function(dq){ch+="<div class='trk-dok-lvl'><div style='font-size:.77rem;font-weight:600;color:#475569;margin:.3rem 0'><span class='trk-dok-badge trk-dok-l"+dq.lvl+"'>DOK "+dq.lvl+" ("+dq.pts+"pt)</span></div><label class='trk-dok-q'><input type='checkbox' id='hrt-d"+dq.lvl+"q1'> "+dq.q1+"</label><label class='trk-dok-q'><input type='checkbox' id='hrt-d"+dq.lvl+"q2'> "+dq.q2+"</label></div>";});
        ch+="</div>";ca.innerHTML=ch;
      });
    }
    var logBtn=document.getElementById("hrt-log");
    if(logBtn&&sel)logBtn.addEventListener("click",function(){
      var d2=load(),stu=d2.students.find(function(s){return s.id===sel.id;});
      if(!stu)return;
      var dt=(document.getElementById("hrt-date")||{}).value||new Date().toISOString().slice(0,10);
      var notes=(document.getElementById("hrt-notes")||{}).value||"";
      var entry={id:uid(),date:dt,notes:notes};
      if(stu.group==="Sight Words"){var sg=document.getElementById("hrt-sw-grid"),sl2=document.getElementById("hrt-sw-lvl");var all2=sg?sg.querySelectorAll(".trk-sw-word"):[];var cor2=[],tot2=[];all2.forEach(function(x){if(x.dataset.state==="1"){cor2.push(x.dataset.word);tot2.push(x.dataset.word);}else if(x.dataset.state==="2")tot2.push(x.dataset.word);});entry.swLevel=sl2?sl2.value:"";entry.swCorrect=cor2;entry.swTested=tot2;entry.score=tot2.length?Math.round(cor2.length/tot2.length*100):0;}
      else if(stu.group==="Fluency"){var stEl2=document.getElementById("hrt-story"),flW2=document.getElementById("hrt-fl-words");var stopW=flW2?flW2.querySelector("[data-state='1']"):null;var redW=flW2?Array.from(flW2.querySelectorAll("[data-state='2']")).map(function(x){return x.textContent.trim();}):[];entry.storyId=stEl2?parseInt(stEl2.value,10):null;var st2=entry.storyId?HR_STORIES.find(function(s){return s.id===entry.storyId;}):null;entry.storyTitle=st2?st2.t:"";entry.stoppedIdx=stopW?parseInt(stopW.dataset.idx,10):0;entry.redWords=redW;var tm2=parseFloat((document.getElementById("hrt-time")||{}).value)||1;entry.wpm=Math.round(Math.max(0,(entry.stoppedIdx+1-redW.length)/Math.max(tm2,0.1)));entry.score=entry.wpm;}
      else{var stEl3=document.getElementById("hrt-story");entry.storyId=stEl3?parseInt(stEl3.value,10):null;var st3=entry.storyId?HR_STORIES.find(function(s){return s.id===entry.storyId;}):null;entry.storyTitle=st3?st3.t:"";var tm3=parseFloat((document.getElementById("hrt-time")||{}).value)||0;entry.timeMins=tm3;["d1q1","d1q2","d2q1","d2q2","d3q1","d3q2","d4q1","d4q2"].forEach(function(k){var el2=document.getElementById("hrt-"+k);entry[k]=!!(el2&&el2.checked);});var rp=(entry.d1q1?1:0)+(entry.d1q2?1:0)+(entry.d2q1?2:0)+(entry.d2q2?2:0)+(entry.d3q1?3:0)+(entry.d3q2?3:0)+(entry.d4q1?4:0)+(entry.d4q2?4:0);entry.rawPts=rp;entry.score=Math.round(rp/20*100);}
      stu.entries=stu.entries||[];stu.entries.push(entry);save(d2);renderInto(el);
    });
    el.querySelectorAll(".hrt-del").forEach(function(btn){btn.addEventListener("click",function(){if(!confirm("Remove this student?"))return;var d3=load();d3.students=d3.students.filter(function(s){return s.id!==btn.dataset.del;});save(d3);_hrid=null;renderInto(el);});});
    el.querySelectorAll(".hrt-del-e").forEach(function(btn){btn.addEventListener("click",function(){var d4=load(),stu2=d4.students.find(function(s){return s.id===btn.dataset.sid;});if(stu2)stu2.entries=(stu2.entries||[]).filter(function(e){return e.id!==btn.dataset.eid;});save(d4);renderInto(el);});});
    return; // old class-name/add/del handlers below are dead code
    var sc_dead = document.getElementById("hrt-save-class"); // keeps old var to avoid parse error
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

  var HR_STORIES=[
    {id:1,t:"The Lost Kitten",wc:118,p:"Max was determined to finish watering the garden before dinner. As he carried the heavy watering can, he heard a faint sound coming from the bushes. Curious, he leaned closer and discovered a tiny, shivering kitten tangled in the branches. Its fur was damp, and its eyes looked frightened. Max carefully untangled the kitten and carried it inside. He managed to dry it with a soft towel and poured warm milk into a small bowl. At first, the kitten refused to drink, but Max patiently encouraged it. Finally, the kitten began to sip, and its tail flicked with relief. Max realized that helping the kitten required more than kindness — it demanded patience and responsibility.",dok:[{lvl:1,pts:1,q1:"Who found the kitten?",a1:"Max",q2:"Where was the kitten hiding?",a2:"Under a big green bush"},{lvl:2,pts:2,q1:"Why was the kitten wet?",a1:"It was outside in wet weather",q2:"What did Max do to help it?",a2:"Dried it and gave it warm milk"},{lvl:3,pts:3,q1:"How does Max show kindness? Use two text details.",a1:"He dried the kitten with a towel and gave it warm milk",q2:"What does the kitten purring tell us?",a2:"It felt safe and cared for"},{lvl:4,pts:4,q1:"What responsibilities come with caring for a stray animal?",a1:"Open-ended",q2:"Compare caring for a stray pet to another act of kindness.",a2:"Open-ended"}]},
    {id:2,t:"The Red Kite",wc:100,p:"Lily loved Saturdays because they meant time with her grandmother. One breezy afternoon, her grandmother handed her a bright red kite with a long ribbon tail. Lily ran across the yard, and the wind lifted the kite high into the sky. Suddenly, the string tangled, and the kite dipped dangerously. Lily felt frustrated but remembered her grandmother's advice: 'Dreams fly higher when you don't give up.' She untangled the string carefully and tried again. This time, the kite soared even higher, dancing against the clouds. Lily realized that persistence was the key to success, whether with kites or with dreams.",dok:[{lvl:1,pts:1,q1:"What color was Lily's kite?",a1:"Red",q2:"When did Lily fly her kite?",a2:"Saturday afternoon"},{lvl:2,pts:2,q1:"Why did Lily hold the string tight?",a1:"The wind was strong and the kite flew very high",q2:"What happened when the kite flew in the strong wind?",a2:"It flew high past the trees and touched the clouds"},{lvl:3,pts:3,q1:"What details tell you it was a very windy day?",a1:"Wind blew hard; kite flew past trees and touched clouds",q2:"How do you know Lily was having fun?",a2:"She held the string tight watching the kite fly high"},{lvl:4,pts:4,q1:"Why might flying a kite be a good outdoor activity?",a1:"Open-ended",q2:"Compare kite flying to another activity that uses wind.",a2:"Open-ended"}]},
    {id:3,t:"Fresh Apples",wc:96,p:"Sam's father owned a small orchard filled with apple trees. One crisp autumn morning, Sam was asked to gather apples for a pie. He carefully picked five shiny red apples and placed them in a basket. As he walked back, one apple slipped out and rolled across the grass. Sam chased it, laughing, and returned with all five. His mother praised his effort and began slicing the apples. The sweet smell of cinnamon filled the kitchen, and Sam felt proud that his work contributed to the family's meal. He realized that even small tasks could bring joy and connection.",dok:[{lvl:1,pts:1,q1:"How many apples did Sam pick?",a1:"Five",q2:"What did Sam want to make with his mom?",a2:"A pie"},{lvl:2,pts:2,q1:"Why did Sam use a ladder?",a1:"The apples were on the top branches",q2:"How do you know the apples were hard to reach?",a2:"Sam had to climb a ladder to get them"},{lvl:3,pts:3,q1:"What can you infer about Sam and his mom from this story?",a1:"They enjoy doing activities together",q2:"How do you know Sam worked hard to get the apples?",a2:"He climbed a ladder to reach the top branches"},{lvl:4,pts:4,q1:"Name two things you could make with apples besides pie.",a1:"Open-ended",q2:"Why might homegrown apples be more special than store-bought ones?",a2:"Open-ended"}]},
    {id:4,t:"The Little Frog",wc:77,p:"A small green frog sat on a wet log near the pond. It watched a fly buzzing close by. The frog leapt forward, but the fly escaped. Determined, the frog waited patiently until another fly came near. This time, it snapped its tongue out quickly and caught the insect. The frog's belly was full, and it croaked happily. The pond echoed with sounds of frogs, crickets, and splashing fish. The frog realized that patience and timing were just as important as strength.",dok:[{lvl:1,pts:1,q1:"Where was the frog sitting?",a1:"On a wet log near the pond",q2:"What did the frog eat for lunch?",a2:"A tiny black fly"},{lvl:2,pts:2,q1:"How does the frog catch its food?",a1:"With its long sticky tongue",q2:"Why is a long sticky tongue useful for a frog?",a2:"It can reach and catch fast insects quickly"},{lvl:3,pts:3,q1:"What would happen if the frog had no sticky tongue?",a1:"It could not catch flies and might go hungry",q2:"What does the frog's speed tell us about it as a hunter?",a2:"It is fast and well-adapted to catching prey"},{lvl:4,pts:4,q1:"Why do animals need special body parts for catching food?",a1:"Open-ended",q2:"Compare how the frog catches food to another animal's hunting method.",a2:"Open-ended"}]},
    {id:5,t:"Baking Sweet Cookies",wc:92,p:"Ben loved baking with his grandmother. One rainy afternoon, they decided to make chocolate chip cookies. Ben measured the flour carefully, but when he scooped sugar, some spilled onto the counter. His grandmother smiled and said, 'Mistakes happen; we just clean them up.' Together, they mixed butter, sugar, and chocolate chips until the dough was ready. The oven filled the kitchen with a warm, sweet smell. When the cookies were done, Ben proudly shared them with his family. He realized that baking was not only about food but also about patience, teamwork, and joy.",dok:[{lvl:1,pts:1,q1:"Who is baking?",a1:"Ben",q2:"What did the kitchen smell like at the end?",a2:"Warm chocolate chips"},{lvl:2,pts:2,q1:"What did Ben do before baking the cookies?",a1:"Mixed ingredients and scooped dough onto the baking sheet",q2:"Why did Ben scoop dough in round shapes?",a2:"To make round cookie shapes for baking"},{lvl:3,pts:3,q1:"How do you know the cookies were almost done?",a1:"The kitchen smelled like warm chocolate chips",q2:"What steps did Ben follow to make the cookies?",a2:"Mix ingredients, scoop dough, then bake"},{lvl:4,pts:4,q1:"What life skill is Ben practicing by baking?",a1:"Open-ended",q2:"How does baking teach patience and following instructions?",a2:"Open-ended"}]},
    {id:6,t:"The Busy Ants",wc:80,p:"On a warm summer day, a colony of ants worked together near a dirt hill. Some ants carried crumbs twice their size, while others dug tunnels to make the hill stronger. A few ants stood guard, watching for danger. As the food pile grew, the ants moved quickly and efficiently, never stopping to rest. Their teamwork made the colony stronger, and each ant played an important role. The ants showed that cooperation and persistence could achieve more than one ant alone.",dok:[{lvl:1,pts:1,q1:"What color are the ants?",a1:"Brown",q2:"Where are they carrying the bread crumbs?",a2:"Back to their small dirt hill"},{lvl:2,pts:2,q1:"Why do the ants work together?",a1:"To carry food back and build a large food pile",q2:"What happened because the ants worked all afternoon?",a2:"Their food pile grew very big"},{lvl:3,pts:3,q1:"What does working together mean for the ants? Use text evidence.",a1:"All ants carry food at once making the pile grow bigger",q2:"What would happen if only one ant worked instead of the whole line?",a2:"The food pile would grow much more slowly"},{lvl:4,pts:4,q1:"How is teamwork in an ant colony like teamwork in your class?",a1:"Open-ended",q2:"Why is it important for groups to divide tasks fairly?",a2:"Open-ended"}]},
    {id:7,t:"The Lost Key",wc:74,p:"Anna loved exploring her grandmother's attic. One afternoon, she discovered a small wooden box with a rusty lock. She searched the attic until she found an old key on the kitchen table. Excited, Anna unlocked the box and found letters, seashells, and a faded photograph. Her grandmother explained that these were treasures from her childhood. Anna realized that the box held memories more valuable than gold. She felt proud to have uncovered a piece of family history."},dok:[{lvl:1,pts:1,q1:"What was Anna looking for?",a1:"Her shiny silver key",q2:"Where did she find it at last?",a2:"On top of the kitchen table"},{lvl:2,pts:2,q1:"Why would someone check coat pockets for a lost item?",a1:"Keys are often placed in pockets when coming home",q2:"What does it tell us that Anna checked many places?",a2:"She was thorough in her search"},{lvl:3,pts:3,q1:"How did Anna feel before and after finding the key? Use evidence.",a1:"Frustrated before — searched everywhere; relieved after",q2:"What problem-solving strategy did Anna use?",a2:"She checked all the usual places where keys are kept"},{lvl:4,pts:4,q1:"What strategy do you use when you lose something?",a1:"Open-ended",q2:"Why is it important to keep important items in the same place?",a2:"Open-ended"}]},
    {id:8,t:"Swimming Pool Fun",wc:72,p:"Leo and his sister spent the afternoon at the community pool. They splashed, played with a beach ball, and raced each other across the water. After an hour, Leo noticed his fingers were wrinkled. His sister laughed and said it meant he had been swimming too long. They climbed out, dried off, and enjoyed popsicles together. Leo realized that swimming was not just fun but also a way to bond with his sister.",dok:[{lvl:1,pts:1,q1:"What item did Leo play with in the pool?",a1:"A bright beach ball",q2:"Why did Leo jump into the pool?",a2:"The summer sun was hot"},{lvl:2,pts:2,q1:"Why did Leo jump into the pool?",a1:"The summer sun was hot",q2:"What does the wrinkled raisins detail tell us about Leo?",a2:"He had been swimming for a very long time"},{lvl:3,pts:3,q1:"What does it mean that his fingers looked like wrinkled raisins?",a1:"He was in the water so long his skin wrinkled up",q2:"How do you know Leo and his sister were having fun?",a2:"He splashed her and they played with the beach ball together"},{lvl:4,pts:4,q1:"Why might parents remind children to take breaks from swimming?",a1:"Open-ended",q2:"How does playing in water on a hot day make you feel? Why?",a2:"Open-ended"}]},
    {id:9,t:"Planting Seeds",wc:67,p:"Maya wanted to grow a sunflower in her backyard. She dug a small hole with a shovel, placed a seed inside, and covered it with soil. Every day, she watered the spot and waited patiently. Weeks later, a green sprout appeared, and soon a tall sunflower bloomed with golden petals. Maya felt proud of her effort and realized that patience and care were needed to help things grow.",dok:[{lvl:1,pts:1,q1:"What kind of seed did Maya plant?",a1:"A sunflower seed",q2:"How often did she water the seed?",a2:"Every morning"},{lvl:2,pts:2,q1:"Why does Maya water the seed every morning?",a1:"So it will grow",q2:"What tool did Maya use to plant the seed?",a2:"A shiny metal shovel"},{lvl:3,pts:3,q1:"What does the word gently tell you about how Maya handled the seed?",a1:"She was careful and caring with it",q2:"What does watering every morning tell us about Maya's character?",a2:"She is responsible and patient"},{lvl:4,pts:4,q1:"What does growing a plant teach about patience and responsibility?",a1:"Open-ended",q2:"Compare caring for a plant to caring for a pet.",a2:"Open-ended"}]},
    {id:10,t:"The Train Ride",wc:59,p:"Mark loved traveling by train. One afternoon, he sat by the window as the train sped past trees, rivers, and small towns. He imagined adventures waiting in each place. The rhythmic sound of the train wheels made him feel excited and curious. Mark realized that journeys were not only about reaching a destination but also about enjoying the ride itself.",dok:[{lvl:1,pts:1,q1:"Where did Mark sit?",a1:"Next to a clear window",q2:"What noise did the train make?",a2:"It blew its loud horn"},{lvl:2,pts:2,q1:"Why do you think Mark sat by a window?",a1:"To watch the scenery as the train moved",q2:"What could Mark see outside the window?",a2:"Green trees rushing past"},{lvl:3,pts:3,q1:"Name three details the author gives about the train.",a1:"Big, black, blew a loud horn",q2:"How do you know Mark was excited about the train ride?",a2:"He paid attention to everything outside the window"},{lvl:4,pts:4,q1:"How would this trip be different traveling by car?",a1:"Open-ended",q2:"Why do some people prefer train travel over other kinds?",a2:"Open-ended"}]},
    {id:11,t:"The Missing Homework",wc:71,p:"Jake rushed into class, realizing he had left his homework on his desk at home. His stomach twisted with worry as the teacher asked for assignments. Jake explained honestly, and the teacher gave him an extra page to complete during recess. Though disappointed, Jake worked hard and finished the task. When he handed it in, the teacher praised his determination. Jake learned that mistakes can be fixed with effort and honesty.",dok:[{lvl:1,pts:1,q1:"What assignment did Jake lose?",a1:"His math paper",q2:"Where did he leave his homework?",a2:"On his desk at home"},{lvl:2,pts:2,q1:"Why did the teacher give Jake an extra page?",a1:"So he could still finish the work",q2:"When did Jake complete the extra page?",a2:"During lunch"},{lvl:3,pts:3,q1:"How do you know Jake had already completed the original homework?",a1:"He remembered leaving it completed on his desk",q2:"What does the teacher giving Jake another chance tell us about her?",a2:"She is kind and wants Jake to succeed"},{lvl:4,pts:4,q1:"What strategies could Jake use to avoid forgetting homework?",a1:"Open-ended",q2:"Why is it important to have a set place for keeping school items?",a2:"Open-ended"}]},
    {id:12,t:"Camping at Night",wc:59,p:"One summer evening, a family set up tents near a quiet lake. They roasted marshmallows over a fire, told stories, and sang songs under the stars. The night air was cool, and crickets chirped nearby. As the fire dimmed, the family huddled together, feeling peaceful and safe. Camping reminded them that simple moments outdoors could bring joy and closeness.",dok:[{lvl:1,pts:1,q1:"What food did Dad roast over the fire?",a1:"Sweet marshmallows",q2:"Where was the family camping?",a2:"In the dark woods"},{lvl:2,pts:2,q1:"Why was the campfire important to the family?",a1:"It gave light, warmth, and a place to gather",q2:"What did the family see when they looked up?",a2:"Millions of bright stars shining in the dark sky"},{lvl:3,pts:3,q1:"How does the word glowing help you picture the campfire?",a1:"Creates an image of soft, warm, steady light",q2:"What details tell you the family felt peaceful?",a2:"The woods were quiet and they looked at stars together"},{lvl:4,pts:4,q1:"Why do many families enjoy camping together?",a1:"Open-ended",q2:"Compare camping at night to spending a night at home.",a2:"Open-ended"}]},
    {id:13,t:"The New Library Book",wc:56,p:"Elena visited the library and chose a book about dinosaurs. She flipped through pages filled with colorful illustrations and facts. Some dinosaurs looked frightening, but Elena was fascinated by their size and strength. She borrowed the book and read it at home, eager to learn more. Elena realized that books could open doors to new worlds and ideas.",dok:[{lvl:1,pts:1,q1:"What topic was Elena's book about?",a1:"Dinosaurs",q2:"When did she read the book?",a2:"During recess"},{lvl:2,pts:2,q1:"Why did Elena read during recess?",a1:"She checked the book out to read on her own time",q2:"What did Elena think of the T-Rex pictures?",a2:"They were scary but cool"},{lvl:3,pts:3,q1:"What can you infer about Elena based on what she does at recess?",a1:"She loves reading and is curious about dinosaurs",q2:"Why did Elena choose a book about dinosaurs?",a2:"She found them interesting and exciting to learn about"},{lvl:4,pts:4,q1:"What topic would you choose for a library book? Explain why.",a1:"Open-ended",q2:"Why is it important to find topics you love when reading?",a2:"Open-ended"}]},
    {id:14,t:"A Puppy in the Rain",wc:62,p:"A small brown puppy wandered onto the porch during a storm. Its fur was soaked, and it shivered from the cold. When the rain stopped, the puppy shook itself dry and chased a butterfly across the yard. The family watching smiled, realizing the puppy had found comfort and joy after fear. The storm reminded them that challenges can lead to brighter moments.",dok:[{lvl:1,pts:1,q1:"What color was the puppy?",a1:"Brown",q2:"Where did it hide from the rain?",a2:"Under the wooden porch"},{lvl:2,pts:2,q1:"Why did the puppy run under the porch?",a1:"To stay dry and safe from the rain",q2:"What did the puppy do when it reached the porch?",a2:"Shook its wet fur and waited safely"},{lvl:3,pts:3,q1:"How did the author show the puppy felt safe under the porch?",a1:"It waited safely — the word safely shows it felt protected",q2:"What does the puppy shaking its fur tell us about animal instincts?",a2:"Animals naturally try to dry themselves after getting wet"},{lvl:4,pts:4,q1:"How do people and animals both look for shelter during storms?",a1:"Open-ended",q2:"Why is finding shelter an important survival skill?",a2:"Open-ended"}]},
    {id:15,t:"The Winter Snowman",wc:55,p:"Tom loved winter snow. One morning, he rolled three large snowballs and stacked them to build a snowman. He added a carrot for the nose and buttons for the eyes. When his family came outside, they admired his creation. Tom felt proud of his creativity and effort. The snowman stood tall as a symbol of joy and imagination.",dok:[{lvl:1,pts:1,q1:"What did Tom use for the snowman's nose?",a1:"A sharp orange carrot",q2:"How many snowballs did Tom stack?",a2:"Three"},{lvl:2,pts:2,q1:"Why did Tom stack three snowballs instead of one?",a1:"A snowman is made of three stacked sections",q2:"What did Tom use for the snowman's eyes?",a2:"Two black buttons"},{lvl:3,pts:3,q1:"What time of year is it? What details show this?",a1:"Winter — cold white snow fell all morning",q2:"What does it mean that Tom felt proud of his creation?",a2:"He worked hard and felt satisfied with what he made"},{lvl:4,pts:4,q1:"What does building a snowman teach about creativity and planning?",a1:"Open-ended",q2:"How is building a snowman like creating any other art project?",a2:"Open-ended"}]},
    {id:16,t:"The Art Project",wc:65,p:"Kim loved creating art in school. For her project, she decided to build a spaceship from cardboard. She painted stars on the sides and glued shiny paper to make windows. Using scissors and glue, she carefully shaped the rocket. When she presented it to the class, everyone admired her creativity. Kim realized that art was more than colors and shapes — it was imagination brought to life.",dok:[{lvl:1,pts:1,q1:"What was Kim making?",a1:"A spaceship",q2:"What did she paint in the background?",a2:"Yellow stars"},{lvl:2,pts:2,q1:"What tools and materials did Kim use?",a1:"Scissors, paper, blue cardboard, and paint",q2:"What colors did Kim choose for her project?",a2:"Red paper, blue cardboard, and yellow stars"},{lvl:3,pts:3,q1:"How did Kim show creativity? Use text details.",a1:"She chose specific colors and shapes and added painted stars",q2:"What does the finished project tell us about Kim's imagination?",a2:"She created a detailed space scene with multiple art techniques"},{lvl:4,pts:4,q1:"Why is art an important part of learning and school?",a1:"Open-ended",q2:"How does choosing colors and materials affect what an art project communicates?",a2:"Open-ended"}]},
    {id:17,t:"Feeding the Ducks",wc:60,p:"Mia carried a bag of bread to the pond. Four ducks swam quickly toward her, quacking loudly. She tossed pieces of bread, and the ducks gobbled them up. Mia laughed, enjoying the connection with the animals. Feeding the ducks made her feel peaceful and happy. She realized that small acts of kindness could bring joy to both people and animals.",dok:[{lvl:1,pts:1,q1:"How many ducks swam over?",a1:"Four white ducks",q2:"Who went to the lake with Mia?",a2:"Her Grandpa"},{lvl:2,pts:2,q1:"Why might Mia and Grandpa use stale bread to feed ducks?",a1:"Stale bread is better for ducks and uses up old bread",q2:"How did the ducks react when bread was thrown in the water?",a2:"They swam over quickly and ate with loud quacking sounds"},{lvl:3,pts:3,q1:"What words show the ducks were excited for the food?",a1:"They swam over quickly and made loud quacking sounds",q2:"What does this activity tell us about Mia's relationship with her grandpa?",a2:"They enjoy spending peaceful outdoor time together"},{lvl:4,pts:4,q1:"Why is spending time with older family members important?",a1:"Open-ended",q2:"Compare feeding ducks to another simple outdoor activity families can share.",a2:"Open-ended"}]},
    {id:18,t:"The Lost Hat",wc:55,p:"Lucas wore his favorite birthday hat while walking outside. Suddenly, a strong wind blew it off his head. The hat rolled across the grass, and Lucas chased after it. He used a stick to reach it from under a bush. Relieved, he placed it back on his head. Lucas realized that determination helped him recover something important.",dok:[{lvl:1,pts:1,q1:"What happened to Lucas's hat?",a1:"The wind blew it off his head",q2:"What tool did he use to get it down?",a2:"A long stick"},{lvl:2,pts:2,q1:"Why couldn't Lucas just reach up and grab the hat?",a1:"It landed high in thick branches, out of reach",q2:"What does Lucas using a stick tell us about him?",a2:"He found a creative solution using what was nearby"},{lvl:3,pts:3,q1:"What does this story tell you about how Lucas solves problems?",a1:"He finds a creative solution using what is around him",q2:"How did Lucas feel when he finally got his hat back?",a2:"Relieved — the hat was important enough to work hard to retrieve"},{lvl:4,pts:4,q1:"Describe a time you solved a problem using what was nearby.",a1:"Open-ended",q2:"Why is it important to stay calm and think creatively when facing challenges?",a2:"Open-ended"}]},
    {id:19,t:"The Birthday Surprise",wc:51,p:"Nina's friends planned a surprise party. They hid behind the sofa with balloons and a chocolate cake. When Nina walked in, everyone shouted, 'Surprise!' She laughed with joy and hugged her friends. The party was filled with games and laughter. Nina realized that friendship was the best gift of all.",dok:[{lvl:1,pts:1,q1:"Where were Nina's friends hiding?",a1:"Behind the sofa",q2:"What kind of cake did she see?",a2:"A giant chocolate cake"},{lvl:2,pts:2,q1:"Why was the living room dark?",a1:"Her friends kept the lights off to surprise her",q2:"What did Nina's friends shout when she turned on the light?",a2:"Surprise"},{lvl:3,pts:3,q1:"How do you think Nina felt when everyone jumped out? Use evidence.",a1:"Surprised and happy — her friends planned a party with cake",q2:"What details show her friends put effort into the surprise?",a2:"They hid behind the sofa and kept the lights off until she arrived"},{lvl:4,pts:4,q1:"Why are surprise parties special ways to celebrate someone?",a1:"Open-ended",q2:"How does a well-planned surprise show that you care about someone?",a2:"Open-ended"}]},
    {id:20,t:"The Beach Shells",wc:52,p:"Leo walked along the sandy beach, searching for shells. He found three colorful shells and placed them in his bucket. Each shell reminded him of summer days filled with sunshine and laughter. As the waves rolled in, Leo felt connected to the ocean's beauty. Collecting shells taught him to appreciate nature's small treasures.",dok:[{lvl:1,pts:1,q1:"What did Leo collect at the beach?",a1:"Three shiny pink shells",q2:"Where was Leo walking?",a2:"Along the beach near the water"},{lvl:2,pts:2,q1:"Why did Leo put the shells in a bucket?",a1:"To carry them home safely",q2:"How does the text describe the shells Leo found?",a2:"Shiny pink shells"},{lvl:3,pts:3,q1:"What details help you picture the setting?",a1:"Ocean waves crashing, warm sand, walking along the water",q2:"Why did Leo walk slowly? What does this tell us about him?",a2:"He was looking carefully — he wanted to find something special"},{lvl:4,pts:4,q1:"Why might collecting something from nature be a meaningful memory?",a1:"Open-ended",q2:"How do natural objects connect us to special experiences?",a2:"Open-ended"}]},
    {id:21,t:"Bird House Builders",wc:58,p:"Ella wanted to build a birdhouse with her father. They gathered wood, nails, and paint. Together, they measured and hammered until the small house was complete. Ella painted it bright blue and hung it on a tree branch. Soon, a bird flew inside, chirping happily. Ella felt proud of her success and realized that teamwork made projects more meaningful.",dok:[{lvl:1,pts:1,q1:"What did Ella and her dad build?",a1:"A small wooden birdhouse",q2:"Where did they hang it?",a2:"On a tree branch"},{lvl:2,pts:2,q1:"What steps did they take to finish the birdhouse?",a1:"Built it, painted it blue, hung it on a tree branch",q2:"What happened after they hung the birdhouse?",a2:"A tiny bird flew inside to build a nest"},{lvl:3,pts:3,q1:"How do you know the birdhouse was a success? Use text evidence.",a1:"A tiny bird flew inside to build a nest",q2:"What does it tell us that Ella and her dad worked together?",a2:"They enjoy spending time on meaningful projects together"},{lvl:4,pts:4,q1:"What can building something with a family member teach you?",a1:"Open-ended",q2:"Why is creating something real and useful more rewarding than other activities?",a2:"Open-ended"}]},
    {id:22,t:"The Evening Bike Ride",wc:63,p:"Ryan loved riding his bike in the evening. He strapped on his helmet and pedaled down the quiet street. The sunset painted the sky orange and pink, and stars began to appear. The cool breeze brushed his face, and he felt free and peaceful. Ryan realized that evening rides gave him time to reflect and enjoy the beauty of the world around him.",dok:[{lvl:1,pts:1,q1:"What safety gear did Ryan wear?",a1:"A black helmet",q2:"When did Ryan go on his bike ride?",a2:"In the evening when the sun started to set"},{lvl:2,pts:2,q1:"Why is wearing a helmet important when riding a bike?",a1:"To protect your head in case of a fall",q2:"What did Ryan feel as he sped up?",a2:"The cool night air felt nice on his face"},{lvl:3,pts:3,q1:"How does the author create a peaceful feeling?",a1:"Setting sun, cool air, riding down a quiet street",q2:"What does Ryan choosing to ride in the evening tell us about him?",a2:"He enjoys peaceful, quiet activities at the end of the day"},{lvl:4,pts:4,q1:"Why is wearing safety gear important for outdoor activities?",a1:"Open-ended",q2:"Compare riding a bike in the evening to riding during the day.",a2:"Open-ended"}]}
  ];
  window.HR_STORIES = HR_STORIES; // expose for hr_stories.js compatibility
  function printStudentCopyHR(id){
    var s=null; for(var i=0;i<HR_STORIES.length;i++){if(HR_STORIES[i].id===id){s=HR_STORIES[i];break;}} if(!s)return;
    var h="<!DOCTYPE html><html><head><meta charset='UTF-8'><style>body{font-family:Georgia,serif;max-width:620px;margin:2.5rem auto;padding:0 1.5rem;font-size:13pt;line-height:1.75;}h1{font-size:1.1rem;font-weight:700;margin-bottom:.2rem;}h2{font-size:.88rem;color:#555;margin:0 0 1.25rem;}.ps{margin-bottom:1.75rem;border-bottom:1px solid #ccc;padding-bottom:1.5rem;}.ql{font-weight:700;font-size:.93rem;display:flex;gap:.4rem;margin-bottom:.25rem;}.dk{font-size:.75rem;background:#ede9fe;color:#6d28d9;border-radius:10px;padding:.1rem .4rem;font-weight:700;flex-shrink:0;}.al{border-bottom:1px solid #bbb;min-height:1.3rem;margin:.15rem 0 .5rem;}.pb{background:#166534;color:#fff;border:none;border-radius:6px;padding:.4rem 1rem;cursor:pointer;margin-top:.5rem;}@media print{.pb{display:none!important;}}</style></head><body>"
      +"<h1>Story "+s.id+": "+s.t+"</h1><h2>"+s.wc+" words &bull; Name: ______________________________ &bull; Date: _____________</h2>"
      +"<div class='ps'>"+s.p+"</div><div>";
    s.dok.forEach(function(dq){h+="<div class='ql'><span class='dk'>DOK "+dq.lvl+" ("+dq.pts+" pt each)</span></div>";h+="<div class='ql'><span>1. "+dq.q1+"</span></div><div class='al'></div><div class='al'></div>";h+="<div class='ql'><span>2. "+dq.q2+"</span></div><div class='al'></div><div class='al'></div>";});
    h+="</div><button class='pb' onclick='window.print()'>&#128438; Print Student Copy</button></body></html>";
    var w=window.open("","_blank","width=720,height=900"); if(w){w.document.write(h);w.document.close();}
  }
  var _hrid=null;
  var HR_STATION_META={'Sight Words':{icon:'\uD83D\uDD35',cls:'sw',scoreType:'mastery',goal:80,goalLabel:'80% Mastery'},'Fluency':{icon:'\uD83D\uDFE0',cls:'fl',scoreType:'wpm',goal:90,goalLabel:'90 WPM'},'Comprehension':{icon:'\uD83D\uDFE2',cls:'cp',scoreType:'dok',goal:80,goalLabel:'80% DOK'}};
  var HR_DOLCH={'pre':['a','and','away','big','blue','can','come','down','find','for','funny','go','help','here','I','in','is','it','jump','little','look','make','me','my','not','one','play','red','run','said','see','the','three','to','two','up','we','where','yellow','you'],'primer':['all','am','are','at','ate','be','black','brown','but','came','did','do','eat','four','get','good','have','he','into','like','must','new','no','now','on','our','out','please','pretty','ran','ride','saw','say','she','so','soon','that','there','they','this','too','under','want','was','well','went','what','white','who','will','with','yes'],'g1':['after','again','an','any','as','ask','by','could','every','fly','from','give','going','had','has','her','him','his','how','just','know','let','live','may','of','old','once','open','over','put','round','some','stop','take','thank','them','think','walk','were','when'],'g2':['always','around','because','been','before','best','both','buy','call','cold','does',"don't",'fast','first','five','found','gave','goes','green','its','made','many','off','or','pull','read','right','sing','sit','sleep','tell','their','these','those','upon','us','use','very','wash','which','why','wish','work','would','write','your'],'g3':['about','better','bring','carry','clean','cut','done','draw','drink','eight','fall','far','full','got','grow','hold','hot','hurt','if','keep','kind','laugh','light','long','much','myself','never','nine','only','own','pick','seven','shall','show','six','small','start','ten','today','together','try','warm']};
  var DAYS_OF_WEEK=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function getHrtScore(e,station){if(!e)return 0;if(station==='Sight Words')return e.score||0;if(station==='Fluency')return e.wpm||0;return e.score||0;}
  function drawHrtChart(stu,meta){var cv=document.getElementById('hrt-canvas');if(!cv)return;var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,pad={t:24,r:16,b:36,l:48};var ent=stu.entries.slice().sort(function(a,b){return new Date(a.date)-new Date(b.date);});if(!ent.length)return;ctx.clearRect(0,0,W,H);ctx.fillStyle='#f8faff';ctx.fillRect(0,0,W,H);var sc=ent.map(function(e){return getHrtScore(e,stu.group);});var goal=meta.goal,maxV=Math.max(goal*1.2,Math.max.apply(null,sc)*1.1,30),minV=Math.max(0,Math.min.apply(null,sc)-10);function xp(i){return pad.l+(i/Math.max(ent.length-1,1))*(W-pad.l-pad.r);}function yp(v){return pad.t+(1-(v-minV)/(maxV-minV))*(H-pad.t-pad.b);}ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;for(var g=0;g<=4;g++){var gv=minV+(g/4)*(maxV-minV),gy=yp(gv);ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(W-pad.r,gy);ctx.stroke();ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='right';ctx.fillText(Math.round(gv)+(meta.scoreType!=='wpm'?'%':''),pad.l-4,gy+4);}ctx.strokeStyle='#f59f00';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(pad.l,yp(goal));ctx.lineTo(W-pad.r,yp(goal));ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#3b5bdb';ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.beginPath();ent.forEach(function(e,i){var s=getHrtScore(e,stu.group);i===0?ctx.moveTo(xp(i),yp(s)):ctx.lineTo(xp(i),yp(s));});ctx.stroke();ent.forEach(function(e,i){var s=getHrtScore(e,stu.group);ctx.fillStyle='#3b5bdb';ctx.beginPath();ctx.arc(xp(i),yp(s),5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1e293b';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(Math.round(s)+(meta.scoreType!=='wpm'?'%':''),xp(i),yp(s)-9);});}

  function showHrtRoster(el,d){
    var sts=d.students||[],todayDay=DAYS_OF_WEEK[new Date().getDay()],testToday=sts.filter(function(s){return s.testDay===todayDay;});
    var h="<div style='padding:1rem'>";
    if(testToday.length){h+="<div style='background:#fef9c3;border:1.5px solid #fde047;border-radius:10px;padding:.7rem 1rem;margin-bottom:.8rem'><div style='font-size:.85rem;font-weight:700;color:#713f12;margin-bottom:.35rem'>\uD83D\uDCC5 Test Today ("+todayDay+")</div>";testToday.forEach(function(s){h+="<span class='hrt-scard' data-sid='"+s.id+"' style='display:inline-flex;align-items:center;gap:.35rem;padding:.22rem .55rem;background:#fff;border-radius:5px;margin:.15rem;cursor:pointer;border:1px solid #fde047;font-size:.82rem;font-weight:600;color:#0f172a'>"+s.name+" \u203a</span>";});h+="</div>";}
    h+="<div style='background:#f8faff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.75rem 1rem;margin-bottom:.9rem'><div style='font-size:.88rem;font-weight:700;color:#1e3a8a;margin-bottom:.4rem'>Add Student</div><div style='display:flex;gap:.5rem;flex-wrap:wrap;align-items:flex-end'>";
    h+="<div><div style='font-size:.74rem;font-weight:600;color:#475569;margin-bottom:.15rem'>Name</div><input id='hrt-name' type='text' placeholder='First name' style='padding:.3rem .5rem;border:1.5px solid #cbd5e1;border-radius:6px;font-size:.83rem;width:120px'></div>";
    h+="<div><div style='font-size:.74rem;font-weight:600;color:#475569;margin-bottom:.15rem'>VALLSS Risk</div><select id='hrt-risk' style='padding:.3rem .5rem;border:1.5px solid #cbd5e1;border-radius:6px;font-size:.83rem'><option value=''>-- Select --</option><option value='At Risk'>At Risk</option><option value='Some Risk'>Some Risk</option><option value='Low Risk'>Low Risk</option></select></div>";
    h+="<div><div style='font-size:.74rem;font-weight:600;color:#475569;margin-bottom:.15rem'>Testing Day</div><select id='hrt-day' style='padding:.3rem .5rem;border:1.5px solid #cbd5e1;border-radius:6px;font-size:.83rem'><option value=''>-- Select --</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></div>";
    h+="<button id='hrt-add-btn' style='padding:.35rem .9rem;background:#1e40af;color:#fff;border:none;border-radius:6px;font-size:.83rem;font-weight:600;cursor:pointer'>+ Add</button></div></div>";
    [['Sight Words','\uD83D\uDD35','#eff6ff','#bfdbfe','#1e40af'],['Fluency','\uD83D\uDFE0','#fff7ed','#fed7aa','#c2410c'],['Comprehension','\uD83D\uDFE2','#f0fdf4','#bbf7d0','#166534']].forEach(function(sta){
      var grp=sts.filter(function(s){return s.group===sta[0];});
      h+="<div style='background:"+sta[2]+";border:1.5px solid "+sta[3]+";border-radius:10px;padding:.75rem 1rem;margin-bottom:.6rem'><div style='font-size:.85rem;font-weight:700;color:"+sta[4]+";margin-bottom:.4rem'>"+sta[1]+" "+sta[0]+" <span style='font-weight:400;font-size:.77rem;color:#94a3b8'>("+grp.length+")</span></div>";
      if(!grp.length){h+="<div style='font-size:.77rem;color:#94a3b8;font-style:italic'>No students yet</div>";}
      grp.forEach(function(s){
        var le=s.entries&&s.entries.length?s.entries[s.entries.length-1]:null,sc="No sessions";
        if(le){if(s.group==="Sight Words")sc=(le.score||0)+"% mastery";else if(s.group==="Fluency")sc=(le.wpm||0)+" WPM";else{var dp=(le.d1q1?1:0)+(le.d1q2?1:0)+(le.d2q1?2:0)+(le.d2q2?2:0)+(le.d3q1?3:0)+(le.d3q2?3:0)+(le.d4q1?4:0)+(le.d4q2?4:0);sc=dp+"/20";}}
        var tb=s.testDay?"<span style='font-size:.68rem;color:#92400e;background:#fef9c3;border-radius:3px;padding:.05rem .25rem;margin-left:.25rem'>"+s.testDay.slice(0,3)+"</span>":"";
        h+="<div class='hrt-scard' data-sid='"+s.id+"' style='display:flex;justify-content:space-between;align-items:center;padding:.38rem .6rem;background:rgba(255,255,255,.75);border-radius:7px;margin:.2rem 0;cursor:pointer;border:1px solid "+sta[3]+"'><span style='font-size:.85rem;font-weight:600;color:#0f172a'>"+s.name+tb+"</span><span style='font-size:.75rem;color:"+sta[4]+"'>"+sc+" \u203a</span></div>";
      });
      h+="</div>";
    });
    if(!sts.length){h+="<div style='text-align:center;padding:2rem;color:#94a3b8'>Add your first student above.</div>";}
    h+="<button id='hrt-pass-btn' style='margin-top:.6rem;font-size:.78rem;padding:.28rem .7rem;border:1.5px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;color:#475569'>\uD83D\uDCDA View / Print Passages</button></div>";
    el.innerHTML=h;
    var ab=document.getElementById("hrt-add-btn");
    if(ab)ab.addEventListener("click",function(){
      var nm=(document.getElementById("hrt-name")||{}).value.trim(),risk=(document.getElementById("hrt-risk")||{}).value,day=(document.getElementById("hrt-day")||{}).value;
      if(!nm){alert("Enter a student name.");return;}if(!risk){alert("Select a VALLSS risk level.");return;}if(!day){alert("Select a testing day.");return;}
      var d2=load(),ns={id:uid(),name:nm,risk:risk,group:RISK_MAP[risk],testDay:day,entries:[]};
      d2.students.push(ns);save(d2);_hrid=ns.id;renderInto(el);
    });
    el.addEventListener("click",function(e){
      var c=e.target.closest?e.target.closest(".hrt-scard"):null;
      if(c&&c.dataset.sid){_hrid=c.dataset.sid;renderInto(el);}
      if(e.target.id==="hrt-pass-btn"){renderHrtPassages(el);}
    });
  }
  function showHrtStudentFile(el,d,sel){
    var m2=HR_STATION_META[sel.group];
    var h="<div style='padding:.75rem 1rem'><div style='display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem'>";
    h+="<button id='hrt-back' style='font-size:.77rem;padding:.27rem .6rem;border-radius:6px;border:1px solid #e2e8f0;background:#f8faff;color:#1e3a8a;cursor:pointer'>\u2190 All Students</button>";
    h+="<h2 style='margin:0;font-size:.98rem;color:#0f172a'>"+sel.name+"</h2>";
    h+="<span style='background:"+(m2.cls==="sw"?"#eff6ff":m2.cls==="fl"?"#fff7ed":"#f0fdf4")+";color:"+(m2.cls==="sw"?"#1e40af":m2.cls==="fl"?"#c2410c":"#166534")+";padding:.18rem .55rem;border-radius:12px;font-size:.74rem;font-weight:700'>"+m2.icon+" "+sel.group+"</span>";
    if(sel.testDay)h+="<span style='background:#fef9c3;color:#713f12;padding:.15rem .45rem;border-radius:10px;font-size:.73rem'>\uD83D\uDCC5 "+sel.testDay+"</span>";
    h+="<button class='hrt-del' data-del='"+sel.id+"' style='font-size:.76rem;padding:.25rem .55rem;border-radius:5px;border:1px solid #fca5a5;background:#fff;color:#dc2626;cursor:pointer;margin-left:auto'>Remove</button></div>";
    h+="<div style='background:#f8faff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem'><div style='font-size:.85rem;font-weight:700;color:#0f172a;margin-bottom:.35rem'>Log Session</div><div class='hrt-frow'><label>Date<input id='hrt-date' type='date' class='hrt-inp-sm' value='"+new Date().toISOString().slice(0,10)+"'></label>";
    if(sel.group==="Sight Words"){
      h+="<label>Dolch Level<select id='hrt-sw-lvl' class='hrt-sel'><option value='pre'>Pre-Primer (40)</option><option value='primer'>Primer (52)</option><option value='g1'>1st Grade (41)</option><option value='g2'>2nd Grade (46)</option><option value='g3'>3rd Grade (41)</option></select></label></div><div id='hrt-sw-grid' style='padding:.35rem 0;min-height:28px'></div><div id='hrt-sw-score' style='font-size:.78rem;color:#1d4ed8;padding:.2rem 0;font-weight:600'>Select a level to load words</div>";
    }else if(sel.group==="Fluency"){
      h+="<label>Passage<select id='hrt-story' class='hrt-sel'><option value=''>\u2014 Select \u2014</option>";
      HR_STORIES.forEach(function(s){h+="<option value='"+s.id+"'>Story "+s.id+": "+s.t+" ("+s.wc+" words)</option>";});
      h+="</select></label><label>Time (min)<input id='hrt-time' type='number' step='0.5' min='0.5' max='10' class='hrt-inp-sm' placeholder='1.5'></label></div><div id='hrt-fl-words' style='display:none;margin:.4rem 0'></div>";
    }else{
      h+="<label>Passage<select id='hrt-story' class='hrt-sel'><option value=''>\u2014 Select \u2014</option>";
      HR_STORIES.forEach(function(s){h+="<option value='"+s.id+"'>Story "+s.id+": "+s.t+" ("+s.wc+" words)</option>";});
      h+="</select></label><label>Read time<input id='hrt-time' type='number' step='0.5' min='0.5' max='20' class='hrt-inp-sm' placeholder='3.5'></label></div><div id='hrt-cp-area' style='display:none;margin:.4rem 0'></div>";
    }
    h+="<div class='hrt-frow'><label>Notes<input id='hrt-notes' class='hrt-inp-sm' placeholder='Optional'></label><button id='hrt-log' class='hrt-btn-pri' data-sid='"+sel.id+"'>Log Session</button></div></div>";
    var sl=m2.scoreType==="wpm"?"WPM":m2.scoreType==="mastery"?"Mastery %":"DOK %";
    h+="<div class='trk-chart-box'><canvas id='hrt-canvas' width='540' height='200'></canvas><div class='trk-legend'><span class='trk-leg-line'></span> "+sl+" <span class='trk-leg-goal'></span> Goal ("+m2.goalLabel+")</div></div>";
    h+="<div class='trk-hist-box'><div class='trk-hist-title'>Score History</div>";
    if(!sel.entries||!sel.entries.length){h+="<p class='trk-empty-s'>No sessions yet.</p>";}
    else{
      var sorted=sel.entries.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date);});
      h+="<table class='trk-tbl'><thead><tr><th>Date</th><th>Score</th><th>Notes</th><th></th></tr></thead><tbody>";
      sorted.forEach(function(e){
        var sc="";if(sel.group==="Sight Words")sc=(e.score||0)+"% mastery";else if(sel.group==="Fluency")sc=(e.wpm||0)+" WPM";else{var dp2=(e.d1q1?1:0)+(e.d1q2?1:0)+(e.d2q1?2:0)+(e.d2q2?2:0)+(e.d3q1?3:0)+(e.d3q2?3:0)+(e.d4q1?4:0)+(e.d4q2?4:0);sc=dp2+"/20 ("+(e.score||Math.round(dp2/20*100))+"%)";};
        h+="<tr><td>"+e.date+"</td><td><strong>"+sc+"</strong></td><td style='font-size:.8rem;color:#64748b'>"+(e.notes||"")+"</td><td><button class='hrt-del-e' data-sid='"+sel.id+"' data-eid='"+(e.id||"")+"'>&times;</button></td></tr>";
      });
      h+="</tbody></table>";
    }
    h+="</div></div>";
    el.innerHTML=h;
    if(sel.entries&&sel.entries.length){drawHrtChart(sel,m2);}
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
    var pb=document.getElementById("hrt-pb-back");
    if(pb) pb.addEventListener("click",function(){renderInto(el);});
    el.querySelectorAll(".hrt-stucopy").forEach(function(btn){
      btn.addEventListener("click",function(){printStudentCopyHR(parseInt(this.dataset.sid,10));});
    });
  }
  window.HR_TRACKER = { render: renderInto };
}());
