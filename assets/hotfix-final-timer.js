/* Hotfix 2026-09-06: final door timer + mobile SPACE bridge + reliable BGM engine. */
(function(){
  if (typeof window === 'undefined') return;

  window.finalEscape = function(){
    showModal(`<h2>🖼 빈 액자</h2><p>조각들이 맞춰지며 숨겨진 계단이 생겼다. 마지막 문을 <b>10초 안에 30번</b> 두드려라!</p><button id="mashBtn" class="primary" style="width:100%;font-size:22px">문 두드리기 <span id="mashCount">0</span>/30</button><p>남은 시간 <b id="mashTime">10.0</b></p>`);
    let n=0,end=performance.now()+10000;
    const b=$("mashBtn");
    b.onclick=()=>{
      n++;
      $("mashCount").textContent=n;
      if(n>=30){
        closeModal();
        ending("TRUE ENDING · 현실로",`${G.friend||"친구"}와 함께 빛 속으로 뛰어들었다. 학교의 문이 뒤에서 조용히 닫힌다.`);
      }
    };
    const t=setInterval(()=>{
      if(!$("mashTime")) return clearInterval(t);
      let s=(end-performance.now())/1000;
      $("mashTime").textContent=Math.max(0,s).toFixed(1);
      if(s<=0){
        clearInterval(t);
        closeModal();
        toast("문이 사라졌다. 다시 액자를 조사해 도전할 수 있다.");
        G.flags.roof=false;
      }
    },50);
  };

  // Mobile has no physical SPACE key. Make the on-screen JUMP button behave
  // exactly like SPACE during timing mini-games, and like a harmless jump elsewhere.
  const mobileSpace = document.querySelector('#mobileControls [data-action="dodge"]');
  if(mobileSpace){
    mobileSpace.textContent = 'JUMP';
    mobileSpace.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();

      if(document.getElementById('timingDot')){
        const down = new KeyboardEvent('keydown', {
          key: ' ', code: 'Space', bubbles: true, cancelable: true
        });
        document.dispatchEvent(down);
        const up = new KeyboardEvent('keyup', {
          key: ' ', code: 'Space', bubbles: true, cancelable: true
        });
        setTimeout(()=>document.dispatchEvent(up), 0);
        return;
      }

      if(typeof window.dodge === 'function') window.dodge();
      else if(typeof dodge === 'function') dodge();
    };
  }

  /* ---------------------------------------------------------------------
     BGM v2
     - Explicitly unlocks Web Audio on the first tap/click/key press.
     - Gives the whole game ambient music, not only the ending screens.
     - Detects rooftop / hidden ending / true ending and changes the theme.
     - Suspends the older tiny synth contexts so two tracks do not overlap.
     --------------------------------------------------------------------- */
  const BGM_KEY='schoolEscapeBgmEnabled';
  const BGM={
    ctx:null, master:null, timer:null, nodes:new Set(), mode:null,
    enabled:localStorage.getItem(BGM_KEY)!=='0', unlocked:false, button:null,
    patterns:{
      menu:{interval:3400,chords:[[196,246.94,293.66],[174.61,220,261.63],[164.81,207.65,246.94],[174.61,233.08,293.66]],melody:[392,349.23,329.63,293.66],wave:'triangle',level:.42,note:.12},
      ambient:{interval:3200,chords:[[98,146.83,196],[92.5,138.59,185],[87.31,130.81,174.61],[82.41,123.47,164.81]],melody:[246.94,220,196,220],wave:'sine',level:.39,note:.13},
      sad:{interval:3000,chords:[[220,261.63,329.63],[196,246.94,293.66],[174.61,220,261.63],[196,246.94,329.63]],melody:[392,349.23,329.63,293.66],wave:'triangle',level:.48,note:.15},
      hidden:{interval:3100,chords:[[65.41,98,130.81],[61.74,92.5,123.47],[58.27,87.31,116.54],[55,82.41,110]],melody:[174.61,164.81,155.56,146.83],wave:'sine',level:.52,note:.16},
      true:{interval:2800,chords:[[261.63,329.63,392],[220,329.63,440],[196,293.66,392],[246.94,329.63,392]],melody:[523.25,587.33,659.25,587.33],wave:'triangle',level:.5,note:.15}
    }
  };

  function addBgmStyle(){
    if(document.getElementById('bgmV2Style'))return;
    const s=document.createElement('style');
    s.id='bgmV2Style';
    s.textContent=`#bgmV2Btn{position:fixed;right:18px;bottom:70px;z-index:12000;padding:9px 13px;border-radius:12px;border:1px solid rgba(137,211,255,.3);background:rgba(8,19,30,.9);color:#eaf8ff;font-size:12px;font-weight:850;box-shadow:0 10px 28px rgba(0,0,0,.35);backdrop-filter:blur(10px)}#bgmV2Btn.off{opacity:.68;border-color:rgba(255,255,255,.15)}#bgmV2Btn.need-unlock{animation:bgmPulse 1.25s ease-in-out infinite}@keyframes bgmPulse{50%{box-shadow:0 0 0 5px rgba(105,201,255,.12),0 10px 28px rgba(0,0,0,.35)}}@media(max-width:700px){#bgmV2Btn{right:9px;bottom:62px;padding:8px 10px;font-size:11px}}`;
    document.head.appendChild(s);
  }

  function addBgmButton(){
    if(document.getElementById('bgmV2Btn')){BGM.button=document.getElementById('bgmV2Btn');return;}
    const b=document.createElement('button');
    b.id='bgmV2Btn'; b.type='button'; b.title='배경음악 켜기/끄기';
    b.addEventListener('click',async e=>{
      e.preventDefault(); e.stopPropagation();
      if(!BGM.enabled){
        BGM.enabled=true; localStorage.setItem(BGM_KEY,'1');
        await unlockAudio(); syncBgm(true);
      }else if(!BGM.unlocked){
        await unlockAudio(); syncBgm(true);
      }else{
        BGM.enabled=false; localStorage.setItem(BGM_KEY,'0'); stopBgm(); silenceLegacy(); updateBgmButton();
      }
    });
    document.body.appendChild(b); BGM.button=b; updateBgmButton();
  }

  function updateBgmButton(){
    const b=BGM.button;if(!b)return;
    b.classList.toggle('off',!BGM.enabled);
    b.classList.toggle('need-unlock',BGM.enabled&&!BGM.unlocked);
    b.textContent=!BGM.enabled?'🔇 BGM OFF':(!BGM.unlocked?'🔊 BGM 시작':'🔊 BGM ON');
  }

  function silenceLegacy(){
    ['__storyAudioCtx','__hiddenEndingAudioCtx'].forEach(k=>{
      const c=window[k];
      if(c&&c!==BGM.ctx&&c.state==='running') c.suspend().catch(()=>{});
    });
  }

  async function unlockAudio(){
    if(!BGM.enabled)return false;
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx){updateBgmButton();return false;}
    if(!BGM.ctx){
      BGM.ctx=new Ctx();
      window.__bgmV2Ctx=BGM.ctx;
      const comp=BGM.ctx.createDynamicsCompressor();
      comp.threshold.value=-22;comp.knee.value=16;comp.ratio.value=3;comp.attack.value=.02;comp.release.value=.32;
      BGM.master=BGM.ctx.createGain();BGM.master.gain.value=.5;BGM.master.connect(comp);comp.connect(BGM.ctx.destination);
    }
    try{if(BGM.ctx.state!=='running')await BGM.ctx.resume();}catch{}
    BGM.unlocked=BGM.ctx.state==='running';
    if(BGM.unlocked)silenceLegacy();
    updateBgmButton();
    return BGM.unlocked;
  }

  function stopBgm(){
    if(BGM.timer){clearInterval(BGM.timer);BGM.timer=null;}
    BGM.nodes.forEach(n=>{try{n.stop();}catch{}});BGM.nodes.clear();BGM.mode=null;
  }

  function voice(freq,when,dur,type,gain){
    const c=BGM.ctx;if(!c||c.state!=='running')return;
    const o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,when);
    g.gain.setValueAtTime(.0001,when);
    g.gain.linearRampToValueAtTime(gain,when+.12);
    g.gain.exponentialRampToValueAtTime(.0001,when+dur);
    o.connect(g);g.connect(BGM.master);o.start(when);o.stop(when+dur+.04);
    BGM.nodes.add(o);o.onended=()=>BGM.nodes.delete(o);
  }

  function playBar(mode,step){
    const p=BGM.patterns[mode]||BGM.patterns.ambient,c=BGM.ctx;if(!c||c.state!=='running')return;
    const now=c.currentTime+.035,ch=p.chords[step%p.chords.length];
    ch.forEach((f,i)=>voice(f,now+i*.025,2.75,p.wave,p.note*(i===0?1.1:.85)));
    voice(ch[0]/2,now,2.1,'sine',p.note*.6);
    const m=p.melody[step%p.melody.length];
    voice(m,now+.58,.65,'sine',p.note*.52);
    voice(mode==='hidden'?m*.9439:m*1.12246,now+1.36,.58,mode==='hidden'?'sawtooth':'sine',p.note*.29);
  }

  async function playBgm(mode,force=false){
    if(!BGM.enabled)return;
    if(!BGM.unlocked){updateBgmButton();return;}
    if(BGM.mode===mode&&!force)return;
    stopBgm();silenceLegacy();BGM.mode=mode;
    const p=BGM.patterns[mode]||BGM.patterns.ambient;
    BGM.master.gain.setTargetAtTime(p.level,BGM.ctx.currentTime,.18);
    let step=0;playBar(mode,step++);
    BGM.timer=setInterval(()=>{silenceLegacy();playBar(mode,step++);},p.interval);
  }

  function detectedMode(){
    const overlay=document.getElementById('storyArtOverlay');
    if(overlay&&!overlay.classList.contains('hidden')){
      const title=(document.getElementById('storyArtTitle')?.textContent||'')+' '+(document.getElementById('storyArtKicker')?.textContent||'');
      if(/옥상의 학생|ROOFTOP/i.test(title))return 'sad';
      if(/감시자|HIDDEN/i.test(title))return 'hidden';
      if(/현실로|TRUE/i.test(title))return 'true';
    }
    if(document.getElementById('game')?.classList.contains('active'))return 'ambient';
    if(document.getElementById('creator')?.classList.contains('active'))return 'menu';
    if(document.getElementById('home')?.classList.contains('active'))return 'menu';
    return 'menu';
  }

  function syncBgm(force=false){
    updateBgmButton();
    if(!BGM.enabled){stopBgm();return;}
    if(!BGM.unlocked)return;
    const mode=detectedMode();
    if(force||BGM.mode!==mode)playBgm(mode,force);
    else silenceLegacy();
  }

  async function gestureUnlock(){
    if(!BGM.enabled||BGM.unlocked)return;
    await unlockAudio();
    if(BGM.unlocked)syncBgm(true);
  }

  ['pointerdown','touchstart','click','keydown'].forEach(ev=>document.addEventListener(ev,gestureUnlock,{capture:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){if(BGM.ctx&&BGM.ctx.state==='running')BGM.ctx.suspend().catch(()=>{});}
    else if(BGM.enabled&&BGM.unlocked){BGM.ctx.resume().then(()=>syncBgm(true)).catch(()=>{});}
  });
  setInterval(syncBgm,300);

  addBgmStyle();addBgmButton();updateBgmButton();
  window.__BGMV2={unlock:unlockAudio,play:playBgm,stop:stopBgm,sync:syncBgm,state:BGM};
})();
