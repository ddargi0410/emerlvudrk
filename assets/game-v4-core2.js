function selectDifficulty(d){
 G.difficulty=d;
 if(d==="easy"){G.maxHp=G.hp=1000;G.lives=5;G.atk=62;G.armor=100;G.keyCount=1;G.weapon="퇴마봉";enterZone("easy")}
 if(d==="normal"){G.maxHp=G.hp=500;G.lives=3;G.atk=46;G.armor=50;G.keyCount=0;G.weapon="못 박힌 빗자루";G.dog=prompt("갈색 말티푸 안내견 이름","몽이")||"몽이";enterZone("normal");toast(`${G.dog}: 멍! 가까이 가면 위험한 곳을 알려줄게.`)}
 if(d==="challenge"){G.maxHp=G.hp=100;G.lives=2;G.atk=55;G.armor=0;G.weapon="없음";startKerberos()}
 updateHud()
}
function startKerberos(){
 showModal(`<h2>🐕‍🦺 지옥문 수문장 케르베로스</h2><p>60초 안에 세 답을 직접 입력하세요. 세 머리가 동시에 입을 벌린다.</p><label>1. 세상에서 가장 시끄러운 물놀이는?<input id="k1" class="typing-input" placeholder="정답"></label><label style="display:block;margin-top:9px">2. 아침 4발, 점심 2발, 저녁 3발로 걷는 동물은?<input id="k2" class="typing-input" placeholder="정답"></label><label style="display:block;margin-top:9px">3. 먹을 수 있는 제비는?<input id="k3" class="typing-input" placeholder="정답"></label><div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><b id="kTime">60</b><button id="kSubmit" class="primary">답 제출</button></div>`);
 let end=performance.now()+60000;
 const timer=setInterval(()=>{if(!$("kTime"))return clearInterval(timer);const t=Math.ceil((end-performance.now())/1000);$("kTime").textContent=Math.max(0,t);if(t<=0){clearInterval(timer);closeModal();toast("시간 초과! 케르베로스가 길을 막았다.")}},250);
 $("kSubmit").onclick=()=>{if($("k1").value.trim()==="사물놀이"&&$("k2").value.trim()==="사람"&&$("k3").value.trim()==="수제비"){clearInterval(timer);closeModal();enterZone("challenge1");toast("케르베로스가 길을 비켰다.")}else toast("한 머리가 으르렁거린다. 답을 다시 확인해!")};
}
function openKeypad(){
 showModal(`<h2>🔒 교문 자물쇠</h2><p>4자리 암호를 입력하세요.</p><div class="code-display" id="codeDisplay"></div><div class="keypad">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button data-num="${n}">${n}</button>`).join("")}</div><div style="display:flex;gap:8px;margin-top:10px"><button id="codeClear">지우기</button><button class="primary" id="codeSubmit">열기</button></div>`);
 let c="";const d=$("codeDisplay");document.querySelectorAll("[data-num]").forEach(b=>b.onclick=()=>{if(c.length<4)c+=b.dataset.num;d.textContent=c});$("codeClear").onclick=()=>{c="";d.textContent=""};$("codeSubmit").onclick=()=>{if(c==="4444"){closeModal();G.flags.gate=true;enterZone("hub");toast("철컥—교문이 열렸다.")}else{c="";d.textContent="";toast("암호가 틀렸다.")}}
}
function openCafeteria(){
 if(G.flags.nutritionResolved){toast("급식실 문은 안쪽에서 잠겨 있다.");return}
 G.px=910;G.py=300;G.objective="얼굴 없는 영양사에게 들키지 말고 기억의 급식판을 조사";toast("급식실 안… 영양사가 천천히 고개를 든다.");
 spawnEnemy("nutrition",1080,300,9999,5000);
 maps.easy.hot.push({id:"memoryTray",x:760,y:250,w:70,h:55,label:"낡은 급식판"});
 window._memoryActive=true;
}
function startToiletFight(){if(G.flags.toiletDead){toast("세면대에는 피 묻은 자국만 남아 있다.");return}closeModal();G.px=270;G.py=330;G.objective="처녀귀신을 Q로 공격하고 SPACE로 손 공격을 피하라";G.enemies=[];spawnEnemy("toiletGhost",620,310,95,50);toast("쾅! 변기에서 손이 튀어나왔다!")}
function hiddenEnding(){showDialogue("거울 속 나","🙂","거울 속 얼굴이 네 움직임보다 반 박자 늦게 웃는다.",[["거울에 손을 댄다",()=>ending("HIDDEN ENDING · 감시자","학교를 망하게 한 감시자는 처음부터 ‘나’였다.<br><br>🏅 감시자 배지 획득")],["물러난다",closeDialogue]])}
function clearEasy(){if(!G.flags.toiletDead)return toast("문을 열 수 있는 열쇠가 부족하다.");G.flags.easyClear=true;save();toast("쉬움 난이도 클리어!");enterZone("hub")}
function startPrincipalFight(){if(G.flags.principalClear){toast("교장실은 조용하다.");return}G.objective="세 귀신을 실제 전투로 한 명씩 처치";G.enemies=[];spawnEnemy("principal",760,340,150,50);spawnEnemy("vice",900,430,120,50);spawnEnemy("classLeader",640,240,100,50);toast("교장실의 세 시선이 동시에 너를 향한다.")}
function openScience(){if(!G.flags.principalClear){toast("과학실 문이 잠겨 있다. 교장실 열쇠가 필요하다.");return}if(G.flags.scienceClear){toast("금빛 열쇠를 이미 완성했다.");return}showDialogue("과학실","🧪","선택지 대신 직접 세 작업을 완료해야 한다.",[["개구리 내장 찾기",startOrganHunt],["더러운 책상 청소",startCleanGame],["해골 위장하기",startSkeletonPaint]])}
function startOrganHunt(){closeDialogue();showModal(`<h2>🐸 개구리 해부대</h2><p>흩어진 내장 3개를 직접 찾아 클릭하세요.</p><div class="clean-board" id="organBoard"></div>`);const pos=[[15,62],[66,18],[47,71]];let got=0;pos.forEach((p,i)=>{const x=document.createElement("button");x.textContent=["🫀","🫁","🧠"][i];x.style.cssText=`position:absolute;left:${p[0]}%;top:${p[1]}%;font-size:30px;background:transparent;border:0`;x.onclick=()=>{x.remove();got++;if(got===3){G.flags.organ=true;closeModal();toast("개구리 귀신이 조각을 남겼다.");checkScience()}};$("organBoard").appendChild(x)})}