function startCleanGame(){
 closeDialogue();showModal(`<h2>🧽 책상 청소</h2><p><span class="timer-big" id="cleanTimer">14.0</span>초 안에 얼룩을 모두 닦아내세요.</p><div class="clean-board" id="cleanBoard"></div>`);
 let remain=8,end=performance.now()+14000;for(let i=0;i<8;i++){const s=document.createElement("div");s.className="stain";s.style.left=(8+Math.random()*82)+"%";s.style.top=(8+Math.random()*75)+"%";s.onclick=()=>{s.remove();remain--;if(!remain){G.flags.clean=true;closeModal();toast("과학선생 귀신: 기특하구나. 물약 두 개를 두고 간다.");checkScience()}};$("cleanBoard").appendChild(s)}
 const timer=setInterval(()=>{if(!$("cleanTimer"))return clearInterval(timer);let t=(end-performance.now())/1000;$("cleanTimer").textContent=Math.max(0,t).toFixed(1);if(t<=0){clearInterval(timer);closeModal();toast("청소 실패. 다시 도전 가능.")}},60)
}
function startSkeletonPaint(){
 closeDialogue();showModal(`<h2>💀 해골 위장</h2><p>얼굴에서 빛나는 4곳을 순서대로 칠해 동족처럼 보이게 하세요.</p><div id="paintFace" style="width:260px;height:300px;margin:15px auto;position:relative;border-radius:48% 48% 44% 44%;background:${G.skin};border:7px solid #1a2026">${[[27,31],[65,31],[46,55],[46,73]].map((p,i)=>`<button class="paintSpot" data-i="${i}" style="position:absolute;left:${p[0]}%;top:${p[1]}%;width:52px;height:52px;border-radius:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,.18)">?</button>`).join("")}</div>`);
 let done=0;document.querySelectorAll(".paintSpot").forEach(b=>b.onclick=()=>{if(+b.dataset.i!==done)return toast("순서가 어긋났다!");b.textContent="☠";b.style.background="#d8d4c8";done++;if(done===4){G.flags.skeleton=true;closeModal();toast("해골귀신: 동족이군. 열쇠 조각을 받아.");checkScience()}})
}
function checkScience(){if(G.flags.organ&&G.flags.clean&&G.flags.skeleton){G.flags.scienceClear=true;G.keyCount=1;G.weapon="금빛 열쇠";G.friend=G.gender==="male"?"서아":"민호";updateHud();toast(`금빛 열쇠 완성! ${G.friend}이(가) 일행이 되었다.`)}}
function clearNormal(){if(!G.flags.scienceClear)return toast("금빛 열쇠가 필요하다.");G.flags.normalClear=true;save();toast("일반 난이도 클리어!");enterZone("hub")}
function startEnglish(){
 if(G.flags.english){toast("영어교실은 이미 통과했다.");return}
 showModal(`<h2>English Class</h2><p>영어 선생님 귀신: <b>“How are you feeling right now?”</b><br>문장을 직접 입력하세요.</p><input id="englishInput" class="typing-input" placeholder="I am ..."><button id="englishSubmit" class="primary" style="margin-top:10px">대답하기</button>`);
 $("englishSubmit").onclick=()=>{const v=$("englishInput").value.trim().toLowerCase();if(v.includes("i am")&&v.length>8){G.flags.english=true;closeModal();toast("파란 조각 +1")}else toast("영어 문장으로 직접 대답해봐.")}
}
function startStairGame(){
 if(!G.flags.english){toast("영어교실의 파란 조각을 먼저 얻어야 한다.");return}
 showModal(`<h2>🏚 부서진 계단</h2><p>포인트가 <b>초록 구간</b> 안에 있을 때 SPACE를 누르세요.<br><b>2번</b> 성공하면 통과합니다. 이전보다 성공 구간을 훨씬 넓혔어.</p><div class="timing-wrap"><div class="timing-track"><div class="safe-zone"></div><div class="timing-dot" id="timingDot"></div></div><div class="timing-score"><span>성공 <b id="jumpGood">0</b>/2</span><span>실패 <b id="jumpBad">0</b>/4</span></div><div class="space-hint">SPACE</div></div>`);
 let pos=0,dir=1,good=0,bad=0,prev=performance.now(),active=true;
 const tick=now=>{if(!active)return;const dt=now-prev;prev=now;pos+=dir*dt*0.105;if(pos>=97){pos=97;dir=-1}if(pos<=1){pos=1;dir=1}const dot=$("timingDot");if(dot)dot.style.left=`calc(${pos}% - 7px)`;requestAnimationFrame(tick)};requestAnimationFrame(tick);
 const handler=e=>{if(e.code!=="Space"||!active)return;e.preventDefault();const ok=pos>=31&&pos<=69;if(ok){good++;$("jumpGood").textContent=good;toast("착지 성공!");if(good>=2){active=false;document.removeEventListener("keydown",handler,true);closeModal();enterZone("challenge2");toast("2층 도착!")}}else{bad++;$("jumpBad").textContent=bad;G.hp=Math.max(1,G.hp-10);updateHud();toast("발을 헛디뎠다!");if(bad>=4){active=false;document.removeEventListener("keydown",handler,true);closeModal();G.px-=80}}};document.addEventListener("keydown",handler,true)
}
function startMathGame(){
 if(G.flags.math){toast("수학교실을 통과했다.");return}
 const seq=Array.from({length:7},()=>["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"][Math.floor(Math.random()*4)]);
 showModal(`<h2>➗ 수학선생 귀신 · 협동 회피</h2><p>${G.friend||"친구"}가 전설의 검을 건넨다. 표시되는 방향을 순서대로 빠르게 입력!</p><div class="sequence" id="seq">${seq.map(k=>`<div class="seq-key">${({ArrowLeft:"←",ArrowRight:"→",ArrowUp:"↑",ArrowDown:"↓"})[k]}</div>`).join("")}</div><p>남은 시간 <b id="seqTime">7.0</b>초</p>`);
 let idx=0,end=performance.now()+7000,active=true;const nodes=[...document.querySelectorAll(".seq-key")];
 const h=e=>{if(!active)return;if(!seq.includes(e.key))return;if(e.key===seq[idx]){nodes[idx].classList.add("done");idx++;if(idx===seq.length){active=false;cleanup();G.flags.math=true;G.weapon="전설의 검";G.atk=90;updateHud();closeModal();toast("수학선생 귀신 격퇴! 칠판에서 진짜 파란 조각을 찾았다.")}}else{nodes[idx].classList.add("bad");G.hp=Math.max(1,G.hp-10);updateHud()}};document.addEventListener("keydown",h,true);
 const tm=setInterval(()=>{if(!$("seqTime"))return clearInterval(tm);let t=(end-performance.now())/1000;$("seqTime").textContent=Math.max(0,t).toFixed(1);if(t<=0&&active){active=false;cleanup();closeModal();toast("회피 실패. 다시 도전!")}},50);
 function cleanup(){document.removeEventListener("keydown",h,true);clearInterval(tm)}
}
function goThird(){if(!G.flags.math)return toast("수학교실을 먼저 통과해야 한다.");enterZone("challenge3")}
function startGym(){
 if(G.flags.gym){toast("동그란 초록 조각을 이미 얻었다.");return}
 showModal(`<h2>🏃 체육교실 반응 게임</h2><p>“안 내면 진다, 가위바위보!” 글자가 <b>지금!</b>으로 바뀌는 순간 주먹 버튼을 누르세요.</p><div id="rpsWord" style="font-size:46px;text-align:center;margin:22px">준비…</div><button id="rockBtn" class="primary" style="width:100%">✊ 주먹</button>`);
 const delay=1200+Math.random()*1700;let ready=false,done=false;setTimeout(()=>{if(!$("rpsWord"))return;ready=true;$("rpsWord").textContent="지금!";setTimeout(()=>{if(!done&&$("rpsWord")){$("rpsWord").textContent="늦었어!";ready=false}},650)},delay);
 $("rockBtn").onclick=()=>{if(done)return;if(!ready){toast("너무 빨랐어! 다시.");closeModal();return}done=true;G.flags.gym=true;closeModal();toast("승리! 초록 동그라미 조각 +1")}
}
function goRoof(){if(!G.flags.gym)return toast("체육교실 조각이 필요하다.");enterZone("rooftop")}
function roofDialogue(){if(G.flags.roof)return;showDialogue("난간의 학생","😢","“아무도 나를 기억하지 못할 거야…”",[["나는 지금 네 이야기를 듣고 있어. 같이 내려가자.",()=>{G.flags.roof=true;closeDialogue();finalEscape()}],["말없이 옆에 앉는다.",()=>{G.flags.roof=true;closeDialogue();finalEscape()}]])}
function finalEscape(){showModal(`<h2>🖼 빈 액자</h2><p>조각들이 맞춰지며 숨겨진 계단이 생겼다. 마지막 문을 5초 안에 30번 두드려라!</p><button id="mashBtn" class="primary" style="width:100%;font-size:22px">문 두드리기 <span id="mashCount">0</span>/30</button><p>남은 시간 <b id="mashTime">5.0</b></p>`);let n=0,end=performance.now()+5000;const b=$("mashBtn");b.onclick=()=>{n++;$("mashCount").textContent=n;if(n>=30){closeModal();ending("TRUE ENDING · 현실로",`${G.friend||"친구"}와 함께 빛 속으로 뛰어들었다. 학교의 문이 뒤에서 조용히 닫힌다.`)}};const t=setInterval(()=>{if(!$("mashTime"))return clearInterval(t);let s=(end-performance.now())/1000;$("mashTime").textContent=Math.max(0,s).toFixed(1);if(s<=0){clearInterval(t);closeModal();toast("문이 사라졌다. 다시 액자를 조사해 도전할 수 있다.");G.flags.roof=false}},50)}
function showDialogue(sp,portrait,text,choices=[]){$("speaker").textContent=sp;$("dialoguePortrait").textContent=portrait;$("dialogueText").innerHTML=text;$("dialogueChoices").innerHTML="";choices.forEach(([label,fn])=>{const b=document.createElement("button");b.textContent=label;b.onclick=fn;$("dialogueChoices").appendChild(b)});$("dialogue").classList.remove("hidden")}
function closeDialogue(){$("dialogue").classList.add("hidden")}
function showModal(html){$("modalCard").innerHTML=html;$("modalLayer").classList.remove("hidden")}
function closeModal(){$("modalLayer").classList.add("hidden");$("modalCard").innerHTML=""}
function ending(title,desc){save();showModal(`<h2>${title}</h2><p>${desc}</p><div style="display:flex;gap:8px"><button id="endLobby">로비로</button><button id="endHome">메인화면</button></div>`);$("endLobby").onclick=()=>{closeModal();enterZone("hub")};$("endHome").onclick=()=>{closeModal();showScreen("home")}}