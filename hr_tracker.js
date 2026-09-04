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
    h += "<div style='padding:.35rem .75rem .85rem;text-align:center'><button id='hrt-pass-btn' class='hrt-btn-sm' style='font-size:.78rem'>&#128218; Print Student Passages</button></div>";
    el.innerHTML = h;
    wireHRT(el);
    var _pb=document.getElementById("hrt-pass-btn");
    if(_pb) _pb.addEventListener("click",function(){ renderHrtPassages(el); });
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

  var HR_STORIES=[
    {id:1,t:"The Lost Kitten",wc:36,p:"Max found a tiny, wet kitten hiding under a big green bush in his backyard. He brought it inside, dried it with a soft yellow towel, and gave it some warm milk. The kitten began to purr loudly.",dok:[{lvl:1,pts:1,q1:"Who found the kitten?",a1:"Max",q2:"Where was the kitten hiding?",a2:"Under a big green bush"},{lvl:2,pts:2,q1:"Why was the kitten wet?",a1:"It was outside in wet weather",q2:"What did Max do to help it?",a2:"Dried it and gave it warm milk"},{lvl:3,pts:3,q1:"How does Max show kindness? Use two text details.",a1:"He dried the kitten with a towel and gave it warm milk",q2:"What does the kitten purring tell us?",a2:"It felt safe and cared for"},{lvl:4,pts:4,q1:"What responsibilities come with caring for a stray animal?",a1:"Open-ended",q2:"Compare caring for a stray pet to another act of kindness.",a2:"Open-ended"}]},
    {id:2,t:"The Red Kite",wc:37,p:"The wind blew hard on Saturday afternoon. Lily took her new red kite to the open park. It flew high past the tall oak trees and touched the white clouds. She held the string tight.",dok:[{lvl:1,pts:1,q1:"What color was Lily's kite?",a1:"Red",q2:"When did Lily fly her kite?",a2:"Saturday afternoon"},{lvl:2,pts:2,q1:"Why did Lily hold the string tight?",a1:"The wind was strong and the kite flew very high",q2:"What happened when the kite flew in the strong wind?",a2:"It flew high past the trees and touched the clouds"},{lvl:3,pts:3,q1:"What details tell you it was a very windy day?",a1:"Wind blew hard; kite flew past trees and touched clouds",q2:"How do you know Lily was having fun?",a2:"She held the string tight watching the kite fly high"},{lvl:4,pts:4,q1:"Why might flying a kite be a good outdoor activity?",a1:"Open-ended",q2:"Compare kite flying to another activity that uses wind.",a2:"Open-ended"}]},
    {id:3,t:"Fresh Apples",wc:36,p:"Sam climbed up the old wooden ladder to reach the top branches of the tree. He picked five juicy red apples and put them in his basket. He wanted to make a pie with his mom.",dok:[{lvl:1,pts:1,q1:"How many apples did Sam pick?",a1:"Five",q2:"What did Sam want to make with his mom?",a2:"A pie"},{lvl:2,pts:2,q1:"Why did Sam use a ladder?",a1:"The apples were on the top branches",q2:"How do you know the apples were hard to reach?",a2:"Sam had to climb a ladder to get them"},{lvl:3,pts:3,q1:"What can you infer about Sam and his mom from this story?",a1:"They enjoy doing activities together",q2:"How do you know Sam worked hard to get the apples?",a2:"He climbed a ladder to reach the top branches"},{lvl:4,pts:4,q1:"Name two things you could make with apples besides pie.",a1:"Open-ended",q2:"Why might homegrown apples be more special than store-bought ones?",a2:"Open-ended"}]},
    {id:4,t:"The Little Frog",wc:35,p:"A green frog sat on a wet log near the pond. It saw a tiny black fly buzzing in the air. The frog shot out its long sticky tongue and caught the bug for lunch.",dok:[{lvl:1,pts:1,q1:"Where was the frog sitting?",a1:"On a wet log near the pond",q2:"What did the frog eat for lunch?",a2:"A tiny black fly"},{lvl:2,pts:2,q1:"How does the frog catch its food?",a1:"With its long sticky tongue",q2:"Why is a long sticky tongue useful for a frog?",a2:"It can reach and catch fast insects quickly"},{lvl:3,pts:3,q1:"What would happen if the frog had no sticky tongue?",a1:"It could not catch flies and might go hungry",q2:"What does the frog's speed tell us about it as a hunter?",a2:"It is fast and well-adapted to catching prey"},{lvl:4,pts:4,q1:"Why do animals need special body parts for catching food?",a1:"Open-ended",q2:"Compare how the frog catches food to another animal's hunting method.",a2:"Open-ended"}]},
    {id:5,t:"Baking Sweet Cookies",wc:37,p:"Ben mixed sweet sugar, creamy butter, and white flour in a large blue bowl. He dropped round scoops of dough onto a flat baking sheet. Soon, the kitchen smelled like warm chocolate chips.",dok:[{lvl:1,pts:1,q1:"Who is baking?",a1:"Ben",q2:"What did the kitchen smell like at the end?",a2:"Warm chocolate chips"},{lvl:2,pts:2,q1:"What did Ben do before baking the cookies?",a1:"Mixed ingredients and scooped dough onto the baking sheet",q2:"Why did Ben scoop dough in round shapes?",a2:"To make round cookie shapes for baking"},{lvl:3,pts:3,q1:"How do you know the cookies were almost done?",a1:"The kitchen smelled like warm chocolate chips",q2:"What steps did Ben follow to make the cookies?",a2:"Mix ingredients, scoop dough, then bake"},{lvl:4,pts:4,q1:"What life skill is Ben practicing by baking?",a1:"Open-ended",q2:"How does baking teach patience and following instructions?",a2:"Open-ended"}]},
    {id:6,t:"The Busy Ants",wc:38,p:"A line of tiny brown ants marched across the hot sidewalk. They carried heavy crumbs of bread back to their small dirt hill. Working together all afternoon made their food pile grow very big.",dok:[{lvl:1,pts:1,q1:"What color are the ants?",a1:"Brown",q2:"Where are they carrying the bread crumbs?",a2:"Back to their small dirt hill"},{lvl:2,pts:2,q1:"Why do the ants work together?",a1:"To carry food back and build a large food pile",q2:"What happened because the ants worked all afternoon?",a2:"Their food pile grew very big"},{lvl:3,pts:3,q1:"What does working together mean for the ants? Use text evidence.",a1:"All ants carry food at once making the pile grow bigger",q2:"What would happen if only one ant worked instead of the whole line?",a2:"The food pile would grow much more slowly"},{lvl:4,pts:4,q1:"How is teamwork in an ant colony like teamwork in your class?",a1:"Open-ended",q2:"Why is it important for groups to divide tasks fairly?",a2:"Open-ended"}]},
    {id:7,t:"The Lost Key",wc:35,p:"Anna looked everywhere for her shiny silver key. She checked under the soft rug and inside her deep coat pockets. Finally, she found it sitting on top of the dark kitchen table.",dok:[{lvl:1,pts:1,q1:"What was Anna looking for?",a1:"Her shiny silver key",q2:"Where did she find it at last?",a2:"On top of the kitchen table"},{lvl:2,pts:2,q1:"Why would someone check coat pockets for a lost item?",a1:"Keys are often placed in pockets when coming home",q2:"What does it tell us that Anna checked many places?",a2:"She was thorough in her search"},{lvl:3,pts:3,q1:"How did Anna feel before and after finding the key? Use evidence.",a1:"Frustrated before — searched everywhere; relieved after",q2:"What problem-solving strategy did Anna use?",a2:"She checked all the usual places where keys are kept"},{lvl:4,pts:4,q1:"What strategy do you use when you lose something?",a1:"Open-ended",q2:"Why is it important to keep important items in the same place?",a2:"Open-ended"}]},
    {id:8,t:"Swimming Pool Fun",wc:36,p:"The summer sun was hot, so Leo jumped into the cool blue pool water. He splashed his little sister and played with a bright beach ball until his fingers looked like wrinkled raisins.",dok:[{lvl:1,pts:1,q1:"What item did Leo play with in the pool?",a1:"A bright beach ball",q2:"Why did Leo jump into the pool?",a2:"The summer sun was hot"},{lvl:2,pts:2,q1:"Why did Leo jump into the pool?",a1:"The summer sun was hot",q2:"What does the wrinkled raisins detail tell us about Leo?",a2:"He had been swimming for a very long time"},{lvl:3,pts:3,q1:"What does it mean that his fingers looked like wrinkled raisins?",a1:"He was in the water so long his skin wrinkled up",q2:"How do you know Leo and his sister were having fun?",a2:"He splashed her and they played with the beach ball together"},{lvl:4,pts:4,q1:"Why might parents remind children to take breaks from swimming?",a1:"Open-ended",q2:"How does playing in water on a hot day make you feel? Why?",a2:"Open-ended"}]},
    {id:9,t:"Planting Seeds",wc:38,p:"Maya dug a small hole in the rich dark dirt with her shiny metal shovel. She dropped a tiny sunflower seed inside and covered it gently. Every morning, she poured clean water over the spot.",dok:[{lvl:1,pts:1,q1:"What kind of seed did Maya plant?",a1:"A sunflower seed",q2:"How often did she water the seed?",a2:"Every morning"},{lvl:2,pts:2,q1:"Why does Maya water the seed every morning?",a1:"So it will grow",q2:"What tool did Maya use to plant the seed?",a2:"A shiny metal shovel"},{lvl:3,pts:3,q1:"What does the word gently tell you about how Maya handled the seed?",a1:"She was careful and caring with it",q2:"What does watering every morning tell us about Maya's character?",a2:"She is responsible and patient"},{lvl:4,pts:4,q1:"What does growing a plant teach about patience and responsibility?",a1:"Open-ended",q2:"Compare caring for a plant to caring for a pet.",a2:"Open-ended"}]},
    {id:10,t:"The Train Ride",wc:37,p:"The big black train blew its loud horn as it pulled into the busy station. Mark stepped inside and sat next to a clear window. He watched the green trees rush past as they started moving.",dok:[{lvl:1,pts:1,q1:"Where did Mark sit?",a1:"Next to a clear window",q2:"What noise did the train make?",a2:"It blew its loud horn"},{lvl:2,pts:2,q1:"Why do you think Mark sat by a window?",a1:"To watch the scenery as the train moved",q2:"What could Mark see outside the window?",a2:"Green trees rushing past"},{lvl:3,pts:3,q1:"Name three details the author gives about the train.",a1:"Big, black, blew a loud horn",q2:"How do you know Mark was excited about the train ride?",a2:"He paid attention to everything outside the window"},{lvl:4,pts:4,q1:"How would this trip be different traveling by car?",a1:"Open-ended",q2:"Why do some people prefer train travel over other kinds?",a2:"Open-ended"}]},
    {id:11,t:"The Missing Homework",wc:39,p:"Jake opened his heavy backpack, but his math paper was gone. He remembered leaving it completed on his desk at home. His friendly teacher gave him an extra page so he could finish it during lunch.",dok:[{lvl:1,pts:1,q1:"What assignment did Jake lose?",a1:"His math paper",q2:"Where did he leave his homework?",a2:"On his desk at home"},{lvl:2,pts:2,q1:"Why did the teacher give Jake an extra page?",a1:"So he could still finish the work",q2:"When did Jake complete the extra page?",a2:"During lunch"},{lvl:3,pts:3,q1:"How do you know Jake had already completed the original homework?",a1:"He remembered leaving it completed on his desk",q2:"What does the teacher giving Jake another chance tell us about her?",a2:"She is kind and wants Jake to succeed"},{lvl:4,pts:4,q1:"What strategies could Jake use to avoid forgetting homework?",a1:"Open-ended",q2:"Why is it important to have a set place for keeping school items?",a2:"Open-ended"}]},
    {id:12,t:"Camping at Night",wc:36,p:"The dark woods were quiet as the family sat around the glowing campfire. Dad roasted sweet marshmallows on a long stick. They looked up and saw millions of bright stars shining in the dark sky.",dok:[{lvl:1,pts:1,q1:"What food did Dad roast over the fire?",a1:"Sweet marshmallows",q2:"Where was the family camping?",a2:"In the dark woods"},{lvl:2,pts:2,q1:"Why was the campfire important to the family?",a1:"It gave light, warmth, and a place to gather",q2:"What did the family see when they looked up?",a2:"Millions of bright stars shining in the dark sky"},{lvl:3,pts:3,q1:"How does the word glowing help you picture the campfire?",a1:"Creates an image of soft, warm, steady light",q2:"What details tell you the family felt peaceful?",a2:"The woods were quiet and they looked at stars together"},{lvl:4,pts:4,q1:"Why do many families enjoy camping together?",a1:"Open-ended",q2:"Compare camping at night to spending a night at home.",a2:"Open-ended"}]},
    {id:13,t:"The New Library Book",wc:39,p:"Elena walked into the school library and picked a thick book about massive dinosaurs. She checked it out at the front desk and read it during recess. The pictures of the T-Rex were scary but cool.",dok:[{lvl:1,pts:1,q1:"What topic was Elena's book about?",a1:"Dinosaurs",q2:"When did she read the book?",a2:"During recess"},{lvl:2,pts:2,q1:"Why did Elena read during recess?",a1:"She checked the book out to read on her own time",q2:"What did Elena think of the T-Rex pictures?",a2:"They were scary but cool"},{lvl:3,pts:3,q1:"What can you infer about Elena based on what she does at recess?",a1:"She loves reading and is curious about dinosaurs",q2:"Why did Elena choose a book about dinosaurs?",a2:"She found them interesting and exciting to learn about"},{lvl:4,pts:4,q1:"What topic would you choose for a library book? Explain why.",a1:"Open-ended",q2:"Why is it important to find topics you love when reading?",a2:"Open-ended"}]},
    {id:14,t:"A Puppy in the Rain",wc:36,p:"Heavy raindrops began to fall from the gray clouds. A small brown puppy ran fast to hide under the wooden porch. It shook its wet fur and waited safely until the storm passed away.",dok:[{lvl:1,pts:1,q1:"What color was the puppy?",a1:"Brown",q2:"Where did it hide from the rain?",a2:"Under the wooden porch"},{lvl:2,pts:2,q1:"Why did the puppy run under the porch?",a1:"To stay dry and safe from the rain",q2:"What did the puppy do when it reached the porch?",a2:"Shook its wet fur and waited safely"},{lvl:3,pts:3,q1:"How did the author show the puppy felt safe under the porch?",a1:"It waited safely — the word safely shows it felt protected",q2:"What does the puppy shaking its fur tell us about animal instincts?",a2:"Animals naturally try to dry themselves after getting wet"},{lvl:4,pts:4,q1:"How do people and animals both look for shelter during storms?",a1:"Open-ended",q2:"Why is finding shelter an important survival skill?",a2:"Open-ended"}]},
    {id:15,t:"The Winter Snowman",wc:39,p:"Cold white snow fell from the sky all morning long. Tom rolled three large snowballs and stacked them high. He used a sharp orange carrot for a nose and two black buttons for eyes.",dok:[{lvl:1,pts:1,q1:"What did Tom use for the snowman's nose?",a1:"A sharp orange carrot",q2:"How many snowballs did Tom stack?",a2:"Three"},{lvl:2,pts:2,q1:"Why did Tom stack three snowballs instead of one?",a1:"A snowman is made of three stacked sections",q2:"What did Tom use for the snowman's eyes?",a2:"Two black buttons"},{lvl:3,pts:3,q1:"What time of year is it? What details show this?",a1:"Winter — cold white snow fell all morning",q2:"What does it mean that Tom felt proud of his creation?",a2:"He worked hard and felt satisfied with what he made"},{lvl:4,pts:4,q1:"What does building a snowman teach about creativity and planning?",a1:"Open-ended",q2:"How is building a snowman like creating any other art project?",a2:"Open-ended"}]},
    {id:16,t:"The Art Project",wc:37,p:"Kim cut bright red paper shapes with her small silver scissors. She glued them onto a large piece of blue cardboard to make a spaceship. She painted yellow stars all around the background.",dok:[{lvl:1,pts:1,q1:"What was Kim making?",a1:"A spaceship",q2:"What did she paint in the background?",a2:"Yellow stars"},{lvl:2,pts:2,q1:"What tools and materials did Kim use?",a1:"Scissors, paper, blue cardboard, and paint",q2:"What colors did Kim choose for her project?",a2:"Red paper, blue cardboard, and yellow stars"},{lvl:3,pts:3,q1:"How did Kim show creativity? Use text details.",a1:"She chose specific colors and shapes and added painted stars",q2:"What does the finished project tell us about Kim's imagination?",a2:"She created a detailed space scene with multiple art techniques"},{lvl:4,pts:4,q1:"Why is art an important part of learning and school?",a1:"Open-ended",q2:"How does choosing colors and materials affect what an art project communicates?",a2:"Open-ended"}]},
    {id:17,t:"Feeding the Ducks",wc:35,p:"Grandpa and Mia walked down to the calm lake. They threw small pieces of stale bread into the water. Four white ducks swam over quickly and ate the food with loud quacking sounds.",dok:[{lvl:1,pts:1,q1:"How many ducks swam over?",a1:"Four white ducks",q2:"Who went to the lake with Mia?",a2:"Her Grandpa"},{lvl:2,pts:2,q1:"Why might Mia and Grandpa use stale bread to feed ducks?",a1:"Stale bread is better for ducks and uses up old bread",q2:"How did the ducks react when bread was thrown in the water?",a2:"They swam over quickly and ate with loud quacking sounds"},{lvl:3,pts:3,q1:"What words show the ducks were excited for the food?",a1:"They swam over quickly and made loud quacking sounds",q2:"What does this activity tell us about Mia's relationship with her grandpa?",a2:"They enjoy spending peaceful outdoor time together"},{lvl:4,pts:4,q1:"Why is spending time with older family members important?",a1:"Open-ended",q2:"Compare feeding ducks to another simple outdoor activity families can share.",a2:"Open-ended"}]},
    {id:18,t:"The Lost Hat",wc:35,p:"A strong gust of wind blew Lucas's favorite blue hat right off his head. It landed high up in the thick branches of a bush. He had to use a long stick to get it back.",dok:[{lvl:1,pts:1,q1:"What happened to Lucas's hat?",a1:"The wind blew it off his head",q2:"What tool did he use to get it down?",a2:"A long stick"},{lvl:2,pts:2,q1:"Why couldn't Lucas just reach up and grab the hat?",a1:"It landed high in thick branches, out of reach",q2:"What does Lucas using a stick tell us about him?",a2:"He found a creative solution using what was nearby"},{lvl:3,pts:3,q1:"What does this story tell you about how Lucas solves problems?",a1:"He finds a creative solution using what is around him",q2:"How did Lucas feel when he finally got his hat back?",a2:"Relieved — the hat was important enough to work hard to retrieve"},{lvl:4,pts:4,q1:"Describe a time you solved a problem using what was nearby.",a1:"Open-ended",q2:"Why is it important to stay calm and think creatively when facing challenges?",a2:"Open-ended"}]},
    {id:19,t:"The Birthday Surprise",wc:38,p:"Nina walked into the dark living room and flipped on the light switch. Suddenly, her friends jumped out from behind the sofa and shouted surprise. She saw a giant chocolate cake sitting on the counter.",dok:[{lvl:1,pts:1,q1:"Where were Nina's friends hiding?",a1:"Behind the sofa",q2:"What kind of cake did she see?",a2:"A giant chocolate cake"},{lvl:2,pts:2,q1:"Why was the living room dark?",a1:"Her friends kept the lights off to surprise her",q2:"What did Nina's friends shout when she turned on the light?",a2:"Surprise"},{lvl:3,pts:3,q1:"How do you think Nina felt when everyone jumped out? Use evidence.",a1:"Surprised and happy — her friends planned a party with cake",q2:"What details show her friends put effort into the surprise?",a2:"They hid behind the sofa and kept the lights off until she arrived"},{lvl:4,pts:4,q1:"Why are surprise parties special ways to celebrate someone?",a1:"Open-ended",q2:"How does a well-planned surprise show that you care about someone?",a2:"Open-ended"}]},
    {id:20,t:"The Beach Shells",wc:36,p:"Ocean waves crashed against the warm sand. Leo walked slowly along the water and looked down. He picked up three shiny pink shells and put them safely inside his deep bucket to take home.",dok:[{lvl:1,pts:1,q1:"What did Leo collect at the beach?",a1:"Three shiny pink shells",q2:"Where was Leo walking?",a2:"Along the beach near the water"},{lvl:2,pts:2,q1:"Why did Leo put the shells in a bucket?",a1:"To carry them home safely",q2:"How does the text describe the shells Leo found?",a2:"Shiny pink shells"},{lvl:3,pts:3,q1:"What details help you picture the setting?",a1:"Ocean waves crashing, warm sand, walking along the water",q2:"Why did Leo walk slowly? What does this tell us about him?",a2:"He was looking carefully — he wanted to find something special"},{lvl:4,pts:4,q1:"Why might collecting something from nature be a meaningful memory?",a1:"Open-ended",q2:"How do natural objects connect us to special experiences?",a2:"Open-ended"}]},
    {id:21,t:"Bird House Builders",wc:37,p:"Inside the garage, Ella and her dad built a small wooden birdhouse. They painted it bright blue and hung it up on a tree branch. Soon, a tiny bird flew inside to build a nest.",dok:[{lvl:1,pts:1,q1:"What did Ella and her dad build?",a1:"A small wooden birdhouse",q2:"Where did they hang it?",a2:"On a tree branch"},{lvl:2,pts:2,q1:"What steps did they take to finish the birdhouse?",a1:"Built it, painted it blue, hung it on a tree branch",q2:"What happened after they hung the birdhouse?",a2:"A tiny bird flew inside to build a nest"},{lvl:3,pts:3,q1:"How do you know the birdhouse was a success? Use text evidence.",a1:"A tiny bird flew inside to build a nest",q2:"What does it tell us that Ella and her dad worked together?",a2:"They enjoy spending time on meaningful projects together"},{lvl:4,pts:4,q1:"What can building something with a family member teach you?",a1:"Open-ended",q2:"Why is creating something real and useful more rewarding than other activities?",a2:"Open-ended"}]},
    {id:22,t:"The Evening Bike Ride",wc:38,p:"The bright sun started to set behind the hills. Ryan put on his black helmet and rode his red bicycle down the street. The cool night air felt nice on his face as he sped up.",dok:[{lvl:1,pts:1,q1:"What safety gear did Ryan wear?",a1:"A black helmet",q2:"When did Ryan go on his bike ride?",a2:"In the evening when the sun started to set"},{lvl:2,pts:2,q1:"Why is wearing a helmet important when riding a bike?",a1:"To protect your head in case of a fall",q2:"What did Ryan feel as he sped up?",a2:"The cool night air felt nice on his face"},{lvl:3,pts:3,q1:"How does the author create a peaceful feeling?",a1:"Setting sun, cool air, riding down a quiet street",q2:"What does Ryan choosing to ride in the evening tell us about him?",a2:"He enjoys peaceful, quiet activities at the end of the day"},{lvl:4,pts:4,q1:"Why is wearing safety gear important for outdoor activities?",a1:"Open-ended",q2:"Compare riding a bike in the evening to riding during the day.",a2:"Open-ended"}]}
  ];
  function printStudentCopyHR(id){
    var s=null; for(var i=0;i<HR_STORIES.length;i++){if(HR_STORIES[i].id===id){s=HR_STORIES[i];break;}} if(!s)return;
    var h="<!DOCTYPE html><html><head><meta charset='UTF-8'><style>body{font-family:Georgia,serif;max-width:620px;margin:2.5rem auto;padding:0 1.5rem;font-size:13pt;line-height:1.75;}h1{font-size:1.1rem;font-weight:700;margin-bottom:.2rem;}h2{font-size:.88rem;color:#555;margin:0 0 1.25rem;}.ps{margin-bottom:1.75rem;border-bottom:1px solid #ccc;padding-bottom:1.5rem;}.ql{font-weight:700;font-size:.93rem;display:flex;gap:.4rem;margin-bottom:.25rem;}.dk{font-size:.75rem;background:#ede9fe;color:#6d28d9;border-radius:10px;padding:.1rem .4rem;font-weight:700;flex-shrink:0;}.al{border-bottom:1px solid #bbb;min-height:1.3rem;margin:.15rem 0 .5rem;}.pb{background:#166534;color:#fff;border:none;border-radius:6px;padding:.4rem 1rem;cursor:pointer;margin-top:.5rem;}@media print{.pb{display:none!important;}}</style></head><body>"
      +"<h1>Story "+s.id+": "+s.t+"</h1><h2>"+s.wc+" words &bull; Name: ______________________________ &bull; Date: _____________</h2>"
      +"<div class='ps'>"+s.p+"</div><div>";
    s.dok.forEach(function(dq){h+="<div class='ql'><span class='dk'>DOK "+dq.lvl+" ("+dq.pts+" pt each)</span></div>";h+="<div class='ql'><span>1. "+dq.q1+"</span></div><div class='al'></div><div class='al'></div>";h+="<div class='ql'><span>2. "+dq.q2+"</span></div><div class='al'></div><div class='al'></div>";});
    h+="</div><button class='pb' onclick='window.print()'>&#128438; Print Student Copy</button></body></html>";
    var w=window.open("","_blank","width=720,height=900"); if(w){w.document.write(h);w.document.close();}
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
        +"<strong style='font-size:.87rem'>Story "+s.id+": "+s.t+"</strong>"
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
