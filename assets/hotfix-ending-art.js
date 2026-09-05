/* Hotfix 2026-09-05: rooftop illustration/BGM, hidden-ending art+BGM+typewriter,
   persistent Watcher badge, true-ending art, and emergency home reset. */
(function(){
  'use strict';
  if (typeof window === 'undefined') return;

  const ASSET = {
    rooftop: 'assets/rooftop-student.webp?v=20260905-1',
    hidden: 'assets/hidden-ending.webp?v=20260905-1',
    trueEnding: 'assets/true-ending.webp?v=20260905-1'
  };
  const BADGE_KEY = 'schoolEscapeWatcherBadge';
  let storyAudio = null;
  let typingTimer = null;

  function injectStyle(){
    if(document.getElementById('endingArtHotfixStyle')) return;
    const s=document.createElement('style');
    s.id='endingArtHotfixStyle';
    s.textContent=`
      #storyArtOverlay{position:fixed;inset:0;z-index:10000;background:rgba(2,6,12,.94);display:grid;place-items:center;padding:18px;backdrop-filter:blur(10px)}
      #storyArtOverlay.hidden{display:none!important}
      .story-art-card{width:min(1160px,96vw);max-height:96vh;overflow:auto;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:linear-gradient(180deg,rgba(9,17,27,.96),rgba(4,9,15,.98));box-shadow:0 28px 90px rgba(0,0,0,.65);padding:14px;text-align:center}
      .story-art-frame{border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.09);background:#02060a}
      .story-art-frame img{display:block;width:100%;max-height:70vh;object-fit:contain;background:#02060a}
      .story-art-copy{padding:16px 14px 8px}.story-art-kicker{font-size:11px;letter-spacing:.18em;color:#88cdef;font-weight:900}.story-art-title{margin:6px 0 8px;font-size:clamp(25px,4vw,44px)}
      .story-art-text{min-height:48px;margin:0 auto 14px;max-width:900px;color:#d5e0ea;line-height:1.75;font-size:15px;white-space:pre-wrap}.story-art-actions{display:flex;justify-content:center;gap:9px;flex-wrap:wrap}
      .story-art-actions button{min-width:155px}.watcher-badge-chip{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:8px 13px;border-radius:999px;background:linear-gradient(135deg,rgba(77,48,106,.92),rgba(28,24,49,.96));border:1px solid rgba(205,168,255,.36);color:#f4eaff;font-size:12px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.22)}
      #emergencyHomeBtn{position:fixed;right:18px;bottom:18px;z-index:9000;padding:11px 15px;border-radius:13px;background:rgba(119,35,53,.92);border:1px solid rgba(255,135,158,.36);color:#fff;font-weight:850;box-shadow:0 12px 35px rgba(0,0,0,.38);display:none}
      body.game-running #emergencyHomeBtn{display:block}
      @media(max-width:700px){.story-art-card{padding:8px}.story-art-copy{padding:12px 8px}.story-art-frame img{max-height:59vh}#emergencyHomeBtn{right:9px;bottom:9px}}
    `;
    document.head.appendChild(s);
  }

  function ensureOverlay(){
    let el=document.getElementById('storyArtOverlay');
    if(el) return el;
    el=document.createElement('section');
    el.id='storyArtOverlay';
    el.className='hidden';
    el.innerHTML=`<div class="story-art-card"><div class="story-art-frame"><img id="storyArtImage" alt="스토리 일러스트"></div><div class="story-art-copy"><div id="storyArtKicker" class="story-art-kicker"></div><h2 id="storyArtTitle" class="story-art-title"></h2><p id="storyArtText" class="story-art-text"></p><div id="storyArtActions" class="story-art-actions"></div></div></div>`;
    document.body.appendChild(el);
    return el;
  }

  function typeText(el,text,speed=18,done){
    clearTimeout(typingTimer); typingTimer=null; el.textContent=''; let i=0;
    const tick=()=>{
      el.textContent=text.slice(0,i+1); const ch=text[i]||''; i++;
      if(i<text.length){ typingTimer=setTimeout(tick,speed+(/[.!?…]/.test(ch)?65:(ch===','?28:0))); }
      else { typingTimer=null; if(done) done(); }
    };
    if(!text){ if(done)done(); return; } tick();
  }

  function showArt({image,kicker,title,text,buttons,typewriter=false}){
    const o=ensureOverlay();
    document.getElementById('storyArtImage').src=image;
    document.getElementById('storyArtKicker').textContent=kicker||'';
    document.getElementById('storyArtTitle').textContent=title||'';
    const txt=document.getElementById('storyArtText');
    const actions=document.getElementById('storyArtActions'); actions.innerHTML='';
    const paintButtons=()=>{
      actions.innerHTML='';
      (buttons||[]).forEach((b,i)=>{ const btn=document.createElement('button'); btn.className=i===0?'primary':''; btn.textContent=b.label; btn.onclick=()=>{ stopTyping(); b.onClick(); }; actions.appendChild(btn); });
    };
    o.classList.remove('hidden');
    if(typewriter) typeText(txt,text||'',16,paintButtons); else {txt.textContent=text||'';paintButtons();}
  }
  function hideArt(){ const o=document.getElementById('storyArtOverlay'); if(o)o.classList.add('hidden'); stopTyping(); }
  function stopTyping(){ if(typingTimer){clearTimeout(typingTimer);typingTimer=null;} }

  function stopMusic(){
    if(!storyAudio) return;
    try{clearInterval(storyAudio.timer);}catch{}
    try{storyAudio.nodes.forEach(n=>n.stop&&n.stop());}catch{}
    try{storyAudio.master.disconnect();}catch{}
    storyAudio=null;
  }
  function startMusic(kind){
    stopMusic();
    let Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
    const ctx=window.__storyAudioCtx||(window.__storyAudioCtx=new Ctx());
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const master=ctx.createGain();master.gain.value=kind==='hidden'?.18:(kind==='sad'?.16:.19);master.connect(ctx.destination);
    const nodes=[];
    const progressions={
      sad:[[220,261.63,329.63],[196,246.94,293.66],[174.61,220,261.63],[196,246.94,329.63]],
      hidden:[[87.31,130.81,174.61],[82.41,123.47,164.81],[73.42,116.54,155.56],[77.78,116.54,146.83]],
      true:[[261.63,329.63,392],[220,329.63,440],[196,293.66,392],[246.94,329.63,392]]
    };
    let step=0;
    const play=()=>{
      const chord=progressions[kind][step%4]; const now=ctx.currentTime+.03;
      chord.forEach((f,i)=>{
        const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='hidden'?'sine':'triangle';o.frequency.value=f;
        g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(kind==='hidden'?.13:.12,now+.18);g.gain.exponentialRampToValueAtTime(.0001,now+2.7);
        o.connect(g);g.connect(master);o.start(now+i*.025);o.stop(now+2.8);nodes.push(o);
      });
      const melody=kind==='hidden'?[261.63,233.08,220]:kind==='sad'?[392,349.23,329.63]:[523.25,587.33,659.25];
      melody.forEach((f,i)=>setTimeout(()=>{if(!storyAudio)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(master);o.start();g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.55);o.stop(ctx.currentTime+.57);nodes.push(o);},450+i*520));
      step++;
    };
    play(); const timer=setInterval(play,2700); storyAudio={ctx,master,nodes,timer,kind};
  }

  function updateBadge(){
    const title=document.querySelector('.title-card'); if(!title)return;
    const has=localStorage.getItem(BADGE_KEY)==='1';
    let chip=document.getElementById('watcherBadgeChip');
    if(has&&!chip){chip=document.createElement('div');chip.id='watcherBadgeChip';chip.className='watcher-badge-chip';chip.textContent='👁 감시자 배지 보유';title.appendChild(chip);}
    if(!has&&chip)chip.remove();
  }

  function goHome(){
    stopMusic();hideArt();
    try{if(typeof save==='function')save();}catch{}
    try{if(typeof closeModal==='function')closeModal();}catch{}
    try{if(typeof closeDialogue==='function')closeDialogue();}catch{}
    if(typeof showScreen==='function')showScreen('home');
    document.body.classList.remove('game-running');updateBadge();
  }

  function addEmergencyHome(){
    if(document.getElementById('emergencyHomeBtn'))return;
    const b=document.createElement('button');b.id='emergencyHomeBtn';b.textContent='🏠 홈';b.title='문제가 생기면 메인 화면으로 돌아가기';
    b.onclick=()=>{if(confirm('현재 진행을 저장하고 홈으로 돌아갈까요?'))goHome();};document.body.appendChild(b);
  }

  setInterval(()=>{
    const game=document.getElementById('game');document.body.classList.toggle('game-running',!!game&&game.classList.contains('active'));
    updateBadge();
  },600);

  function refineCreatorFace(){
    if(typeof window.svgCharacter!=='function' || window.__faceRefined) return;
    const original=window.svgCharacter;
    window.svgCharacter=function(){
      let s=original();
      s=s.replace('M104 140q-10 67 4 118 12 72 72 79 60-7 72-79 14-51 4-118-32-47-76-47-44 0-76 47Z','M98 142q-7 56 7 99 14 58 75 68 61-10 75-68 14-43 7-99-32-44-82-44-50 0-82 44Z');
      s=s.replace(/cx="139" cy="206" rx="10\.5" ry="14"/g,'cx="137" cy="199" rx="11.5" ry="15"');
      s=s.replace(/cx="221" cy="206" rx="10\.5" ry="14"/g,'cx="223" cy="199" rx="11.5" ry="15"');
      s=s.replace(/cx="142" cy="201" rx="3\.8" ry="5\.5"/g,'cx="140" cy="194" rx="4" ry="5.7"');
      s=s.replace(/cx="224" cy="201" rx="3\.8" ry="5\.5"/g,'cx="226" cy="194" rx="4" ry="5.7"');
      s=s.replace('M177 221q-7 24 3 31 8 2 13-2','M177 214q-6 20 3 27 8 2 13-2');
      s=s.replace('M161 276q19 4 38 0','M161 258q19 4 38 0');
      s=s.replace('M158 275q22 17 44 0-22-7-44 0Z','M158 257q22 16 44 0-22-7-44 0Z');
      s=s.replace('M159 273q21 16 42 0','M159 255q21 15 42 0');
      return s;
    };
    window.__faceRefined=true;
    try{renderAvatar();}catch{}
  }

  window.roofDialogue=function(){
    if(G.flags.roof)return;
    startMusic('sad');
    showArt({image:ASSET.rooftop,kicker:'ROOFTOP MEMORY',title:'옥상의 학생',text:'달빛 아래, 난간에 기대 선 학생의 눈가가 젖어 있다. 바람에 흩날리는 목소리가 마지막으로 누군가 자신의 이야기를 들어주길 바라는 듯하다.',typewriter:true,buttons:[{label:'학생에게 다가간다',onClick:()=>{
      hideArt();
      showDialogue('난간의 학생','😢','“아무도 나를 기억하지 못할 거야…”',[
        ['나는 지금 네 이야기를 듣고 있어. 같이 내려가자.',()=>{G.flags.roof=true;closeDialogue();stopMusic();finalEscape();}],
        ['말없이 옆에 앉는다.',()=>{G.flags.roof=true;closeDialogue();stopMusic();finalEscape();}]
      ]);
    }}]});
  };

  window.hiddenEnding=function(){
    showDialogue('거울 속 나','🙂','거울 속 얼굴이 네 움직임보다 반 박자 늦게 웃는다.',[
      ['거울에 손을 댄다',()=>{
        closeDialogue();localStorage.setItem(BADGE_KEY,'1');updateBadge();try{save();}catch{}
        startMusic('hidden');
        showArt({image:ASSET.hidden,kicker:'HIDDEN ENDING',title:'감시자',text:'학교를 망하게 하고 모두를 귀신으로 만든 감시자는 처음부터 ‘나’였다. 거울 속 미소가 학교의 모든 진실을 삼켰다.\n\n🏅 감시자 배지 획득',typewriter:true,buttons:[{label:'홈으로 돌아가기',onClick:goHome}]});
      }],
      ['물러난다',()=>closeDialogue()]
    ]);
  };

  window.finalEscape=function(){
    showModal(`<h2>🖼 빈 액자</h2><p>조각들이 맞춰지며 숨겨진 계단이 생겼다. 마지막 문을 <b>10초 안에 30번</b> 두드려라!</p><button id="mashBtn" class="primary" style="width:100%;font-size:22px">문 두드리기 <span id="mashCount">0</span>/30</button><p>남은 시간 <b id="mashTime">10.0</b></p>`);
    let n=0,end=performance.now()+10000,done=false;const b=document.getElementById('mashBtn');
    b.onclick=()=>{if(done)return;n++;document.getElementById('mashCount').textContent=n;if(n>=30){done=true;clearInterval(t);closeModal();startMusic('true');showArt({image:ASSET.trueEnding,kicker:'TRUE ENDING',title:'현실로',text:`${G.friend||'친구'}와 함께 학교를 빠져나와 현실로 돌아왔다. 끝이라고 생각했던 밤은, 다시 시작되는 우리의 이야기가 되었다.`,typewriter:true,buttons:[{label:'홈으로 돌아가기',onClick:goHome},{label:'다른 모드 도전',onClick:()=>{stopMusic();hideArt();enterZone('hub');}}]});}};
    const t=setInterval(()=>{const el=document.getElementById('mashTime');if(!el||done)return clearInterval(t);const s=(end-performance.now())/1000;el.textContent=Math.max(0,s).toFixed(1);if(s<=0){done=true;clearInterval(t);closeModal();toast('문이 사라졌다. 다시 액자를 조사해 도전할 수 있다.');G.flags.roof=false;}},50);
  };

  window.addEventListener('error',()=>{if(!document.getElementById('storyArtOverlay')?.classList.contains('hidden'))return;toast('오류가 발생했어. 오른쪽 아래 🏠 홈 버튼으로 복귀할 수 있어.');});

  injectStyle();ensureOverlay();addEmergencyHome();updateBadge();refineCreatorFace();
})();