/* Hidden-ending artwork reliability hotfix: uses embedded text asset to avoid stale/broken binary caches. */
(function(){
  'use strict';
  if (typeof window === 'undefined') return;

  const BADGE_KEY = 'schoolEscapeWatcherBadge';
  const IMAGE_PART = 'assets/hidden-ending-inline.b64?v=20260905-4';
  let hiddenImagePromise = null;
  let hiddenAudio = null;
  let hiddenTypingTimer = null;

  function loadHiddenImage(){
    if (!hiddenImagePromise) {
      hiddenImagePromise = fetch(IMAGE_PART, {cache:'no-store'})
        .then(r => { if(!r.ok) throw new Error('hidden image data '+r.status); return r.text(); })
        .then(s => 'data:image/webp;base64,' + s.replace(/\s+/g,''));
    }
    return hiddenImagePromise;
  }

  function ensureOverlay(){
    let el = document.getElementById('storyArtOverlay');
    if (el) return el;
    const style = document.createElement('style');
    style.textContent = '#storyArtOverlay{position:fixed;inset:0;z-index:10000;background:rgba(2,6,12,.95);display:grid;place-items:center;padding:18px}#storyArtOverlay.hidden{display:none!important}.story-art-card{width:min(1160px,96vw);max-height:96vh;overflow:auto;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:#070d15;padding:14px;text-align:center}.story-art-frame{border-radius:18px;overflow:hidden;background:#02060a}.story-art-frame img{display:block;width:100%;max-height:70vh;object-fit:contain}.story-art-copy{padding:16px 14px 8px}.story-art-kicker{font-size:11px;letter-spacing:.18em;color:#88cdef;font-weight:900}.story-art-title{font-size:clamp(26px,4vw,44px);margin:6px 0 8px}.story-art-text{min-height:48px;color:#d5e0ea;line-height:1.75;white-space:pre-wrap}.story-art-actions{display:flex;justify-content:center;gap:9px}.story-art-actions button{min-width:170px}';
    document.head.appendChild(style);
    el = document.createElement('section');
    el.id = 'storyArtOverlay';
    el.className = 'hidden';
    el.innerHTML = '<div class="story-art-card"><div class="story-art-frame"><img id="storyArtImage" alt="히든 엔딩 감시자 일러스트"></div><div class="story-art-copy"><div id="storyArtKicker" class="story-art-kicker"></div><h2 id="storyArtTitle" class="story-art-title"></h2><p id="storyArtText" class="story-art-text"></p><div id="storyArtActions" class="story-art-actions"></div></div></div>';
    document.body.appendChild(el);
    return el;
  }

  function stopTyping(){ if(hiddenTypingTimer){ clearTimeout(hiddenTypingTimer); hiddenTypingTimer=null; } }
  function typeText(el,text,speed,done){
    stopTyping(); el.textContent=''; let i=0;
    const tick=()=>{
      const ch=text[i]||''; el.textContent=text.slice(0,++i);
      if(i<text.length) hiddenTypingTimer=setTimeout(tick,speed+(/[.!?…]/.test(ch)?65:(ch===','?28:0)));
      else { hiddenTypingTimer=null; if(done) done(); }
    };
    tick();
  }

  function stopMusic(){
    if(!hiddenAudio) return;
    try{ clearInterval(hiddenAudio.timer); }catch{}
    try{ hiddenAudio.nodes.forEach(n=>n.stop&&n.stop()); }catch{}
    try{ hiddenAudio.master.disconnect(); }catch{}
    hiddenAudio=null;
  }

  function startMusic(){
    stopMusic();
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx) return;
    const ctx=window.__hiddenEndingAudioCtx||(window.__hiddenEndingAudioCtx=new Ctx());
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});
    const master=ctx.createGain(); master.gain.value=.17; master.connect(ctx.destination); const nodes=[];
    const chords=[[87.31,130.81,174.61],[82.41,123.47,164.81],[73.42,116.54,155.56],[77.78,116.54,146.83]];
    let step=0;
    const play=()=>{
      const now=ctx.currentTime+.03, chord=chords[step%chords.length];
      chord.forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type=i===0?'sine':'triangle'; o.frequency.value=f; g.gain.setValueAtTime(.0001,now); g.gain.linearRampToValueAtTime(.11,now+.22); g.gain.exponentialRampToValueAtTime(.0001,now+3.0); o.connect(g); g.connect(master); o.start(now+i*.03); o.stop(now+3.05); nodes.push(o); });
      [261.63,233.08,220].forEach((f,i)=>setTimeout(()=>{ if(!hiddenAudio) return; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.value=.035; o.connect(g); g.connect(master); o.start(); g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.6); o.stop(ctx.currentTime+.62); nodes.push(o); },520+i*570));
      step++;
    };
    play(); const timer=setInterval(play,2850); hiddenAudio={master,nodes,timer};
  }

  function updateBadge(){
    const title=document.querySelector('.title-card'); if(!title) return;
    const has=localStorage.getItem(BADGE_KEY)==='1'; let chip=document.getElementById('watcherBadgeChip');
    if(has&&!chip){ chip=document.createElement('div'); chip.id='watcherBadgeChip'; chip.className='watcher-badge-chip'; chip.textContent='👁 감시자 배지 보유'; title.appendChild(chip); }
  }

  function goHome(){
    stopTyping(); stopMusic();
    const o=document.getElementById('storyArtOverlay'); if(o) o.classList.add('hidden');
    try{ if(typeof save==='function') save(); }catch{}
    try{ if(typeof closeModal==='function') closeModal(); }catch{}
    try{ if(typeof closeDialogue==='function') closeDialogue(); }catch{}
    if(typeof showScreen==='function') showScreen('home'); else location.href='./';
    document.body.classList.remove('game-running'); updateBadge();
  }

  async function showHiddenArt(){
    const o=ensureOverlay();
    const img=document.getElementById('storyArtImage');
    const kicker=document.getElementById('storyArtKicker');
    const title=document.getElementById('storyArtTitle');
    const text=document.getElementById('storyArtText');
    const actions=document.getElementById('storyArtActions');
    kicker.textContent='HIDDEN ENDING'; title.textContent='감시자'; text.textContent='이미지를 불러오는 중…'; actions.innerHTML=''; o.classList.remove('hidden');
    try{
      img.src=await loadHiddenImage();
    }catch(err){
      console.error(err); text.textContent='히든 엔딩 일러스트를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.';
      const b=document.createElement('button'); b.textContent='홈으로 돌아가기'; b.onclick=goHome; actions.appendChild(b); return;
    }
    const story='학교를 망하게 하고 모두를 귀신으로 만든 감시자는 처음부터 ‘나’였다. 거울 속 미소가 학교의 모든 진실을 삼켰다.\n\n🏅 감시자 배지 획득';
    typeText(text,story,16,()=>{ const b=document.createElement('button'); b.className='primary'; b.textContent='홈으로 돌아가기'; b.onclick=goHome; actions.appendChild(b); });
  }

  window.hiddenEnding=function(){
    showDialogue('거울 속 나','🙂','거울 속 얼굴이 네 움직임보다 반 박자 늦게 웃는다.',[
      ['거울에 손을 댄다',()=>{
        closeDialogue(); localStorage.setItem(BADGE_KEY,'1'); updateBadge(); try{save();}catch{}
        startMusic(); showHiddenArt();
      }],
      ['물러난다',()=>closeDialogue()]
    ]);
  };

  loadHiddenImage().catch(()=>{});
  updateBadge();
})();
