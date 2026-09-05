/* Hotfix 2026-09-05: player visibility, safe SPACE controls, and Duolingo-style English mini-game. */
(function(){
  if (typeof window === 'undefined') return;

  // --- Player visibility during the three-ghost fight ---
  window.startPrincipalFight = function(){
    if(G.flags.principalClear){ toast('교장실은 조용하다.'); return; }
    G.hidden = 0;
    G.invuln = 1.4;
    G.px = 640;
    G.py = 560;
    G.objective = '세 귀신을 실제 전투로 한 명씩 처치';
    G.enemies = [];
    spawnEnemy('principal', 520, 260, 150, 50);
    spawnEnemy('vice', 760, 250, 120, 50);
    spawnEnemy('classLeader', 930, 365, 100, 50);
    if(G.enemies[0]) G.enemies[0].stun = 1.0;
    if(G.enemies[1]) G.enemies[1].stun = 1.7;
    if(G.enemies[2]) G.enemies[2].stun = 2.4;
    updateHud();
    toast('교장실의 세 시선이 동시에 너를 향한다. 발밑 표시를 보고 움직여!');
  };

  // --- SPACE is jump, never a displacement/dodge ---
  // Direct calls (including the mobile SPACE button) become a visual hop only.
  window.dodge = function(){
    G.jumpUntil = performance.now() + 300;
  };

  // Let text fields receive every letter normally. Stop the old global WASD handler
  // only after the input itself has received the event, so typing still works.
  document.addEventListener('keydown', function(e){
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if(typing){
      e.stopPropagation();
      return;
    }

    if(e.code === 'Space' && G.screen === 'game'){
      // During the stair timing game its capture listener handles SPACE first.
      // If the successful press closes the modal, this bubble listener then blocks
      // the old dodge handler from launching the player off-screen.
      const timingGameStillOpen = !!document.getElementById('timingDot');
      if(!timingGameStillOpen){
        e.preventDefault();
        e.stopPropagation();
        G.jumpUntil = performance.now() + 300;
      }
    }
  }, false);

  // Recover old saves that may already contain an off-screen player position.
  setInterval(function(){
    if(typeof G === 'undefined' || G.screen !== 'game' || !maps || !maps[G.zone]) return;
    const oldX = G.px, oldY = G.py;
    G.px = Math.max(82, Math.min(1198, Number.isFinite(G.px) ? G.px : maps[G.zone].spawn[0]));
    G.py = Math.max(82, Math.min(638, Number.isFinite(G.py) ? G.py : maps[G.zone].spawn[1]));
    if((oldX !== G.px || oldY !== G.py) && !G._positionRecovered){
      G._positionRecovered = true;
      toast('캐릭터 위치를 안전 구역으로 복구했어.');
    }
  }, 80);

  // Update the visible control guide without changing the main HTML bundle.
  const keyStrip = document.querySelector('.key-strip');
  if(keyStrip) keyStrip.innerHTML = '<b>WASD</b> 이동 · <b>E</b> 조사 · <b>SPACE</b> 점프 · <b>Q</b> 공격 · <b>F</b> 손전등 · <b>0</b> 시점';
  const miniGuide = document.querySelector('.controls-mini');
  if(miniGuide) miniGuide.textContent = 'WASD 이동 · E 조사 · SPACE 점프 · Q 공격 · F 손전등';
  const spaceSlot = document.querySelector('[data-item="dodge"]');
  if(spaceSlot){ spaceSlot.innerHTML = '⬆️<span>SPACE</span>'; spaceSlot.dataset.item = 'jump'; }
  const mobileSpace = document.querySelector('#mobileControls [data-action="dodge"]');
  if(mobileSpace){ mobileSpace.textContent = 'JUMP'; }

  // --- Duolingo-style English conversation ---
  window.startEnglish = function(){
    if(G.flags.english){ toast('영어교실은 이미 통과했다.'); return; }

    const rounds = [
      {
        q:'영어 선생님 귀신: “How are you feeling right now?”',
        words:['I','am','scared','but','I','will','keep','going'],
        answer:'I am scared but I will keep going'
      },
      {
        q:'영어 선생님 귀신: “Will you give up?”',
        words:['No,','I','will','not','give','up'],
        answer:'No, I will not give up'
      }
    ];
    let round = 0;

    const shuffle = a => {
      const x = a.map((word,i)=>({word,id:i}));
      for(let i=x.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; }
      return x;
    };

    function renderRound(){
      const r = rounds[round];
      const bank = shuffle(r.words);
      let chosen = [];
      showModal(`
        <h2>🇬🇧 영어교실 · 문장 만들기 ${round+1}/${rounds.length}</h2>
        <p>${r.q}</p>
        <p style="font-size:12px;color:#91a9bb">듀오링고처럼 단어를 올바른 순서대로 눌러 문장을 완성하세요.</p>
        <div id="englishSentence" style="min-height:64px;padding:12px;margin:14px 0;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:#07111a;display:flex;gap:7px;flex-wrap:wrap;align-items:center"></div>
        <div id="englishBank" style="display:flex;gap:8px;flex-wrap:wrap"></div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button id="englishUndo">한 단어 취소</button>
          <button id="englishReset">다시 놓기</button>
          <button id="englishCheck" class="primary">확인</button>
        </div>
      `);
      const bankEl = document.getElementById('englishBank');
      const sentenceEl = document.getElementById('englishSentence');

      function paintSentence(){
        sentenceEl.innerHTML = chosen.length ? chosen.map(x=>`<span style="padding:8px 11px;border-radius:10px;background:#1b3447;border:1px solid rgba(137,215,255,.25)">${x.word}</span>`).join('') : '<span style="color:#657d90">단어를 눌러 문장을 만드세요…</span>';
      }
      paintSentence();

      bank.forEach(item=>{
        const b=document.createElement('button');
        b.textContent=item.word;
        b.dataset.id=item.id;
        b.onclick=()=>{
          if(b.disabled) return;
          b.disabled=true;
          b.style.opacity='.35';
          chosen.push(item);
          paintSentence();
        };
        bankEl.appendChild(b);
      });

      document.getElementById('englishUndo').onclick=()=>{
        const last=chosen.pop();
        if(last){
          const b=[...bankEl.querySelectorAll('button')].find(x=>+x.dataset.id===last.id);
          if(b){b.disabled=false;b.style.opacity='1';}
          paintSentence();
        }
      };
      document.getElementById('englishReset').onclick=()=>{
        chosen=[];
        bankEl.querySelectorAll('button').forEach(b=>{b.disabled=false;b.style.opacity='1'});
        paintSentence();
      };
      document.getElementById('englishCheck').onclick=()=>{
        const sentence=chosen.map(x=>x.word).join(' ');
        if(sentence===r.answer){
          if(round < rounds.length-1){ round++; toast('좋아! 다음 대화로 넘어간다.'); renderRound(); }
          else { G.flags.english=true; closeModal(); toast('영어 대화 성공! 파란 조각 +1'); }
        }else{
          toast('단어 순서가 달라. 다시 맞춰봐!');
          chosen=[];
          bankEl.querySelectorAll('button').forEach(b=>{b.disabled=false;b.style.opacity='1'});
          paintSentence();
        }
      };
    }
    renderRound();
  };

  // Player draw: always visible, plus a harmless visual hop for SPACE.
  window.drawPlayer = function(){
    ctx.save();
    const now = performance.now();
    const left = Math.max(0, (G.jumpUntil || 0) - now);
    const hop = left > 0 ? Math.sin((1 - left/300) * Math.PI) * 15 : 0;
    ctx.translate(G.px, G.py - hop);
    ctx.globalAlpha = G.hidden > 0 ? 0.34 : (G.invuln > 0 ? 0.92 : 1);

    ctx.save();
    ctx.globalAlpha = G.hidden > 0 ? 0.38 : 0.95;
    ctx.strokeStyle = G.invuln > 0 ? '#ffd86f' : '#82dcff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 42 + hop, 25, 10, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = G.invuln > 0 ? '#ffd86f' : '#dff7ff';
    ctx.beginPath(); ctx.moveTo(0,-58); ctx.lineTo(-7,-47); ctx.lineTo(7,-47); ctx.closePath(); ctx.fill();
    ctx.restore();

    ctx.fillStyle = G.hair; ctx.beginPath(); ctx.ellipse(0,-19,19,24,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = G.skin; ctx.beginPath(); ctx.arc(0,-17,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = G.hair; ctx.beginPath(); ctx.moveTo(-15,-30); ctx.quadraticCurveTo(0,-43,17,-29); ctx.lineTo(12,-17); ctx.quadraticCurveTo(0,-26,-14,-15); ctx.fill();
    ctx.fillStyle = G.cloth; ctx.beginPath(); ctx.roundRect(-16,-4,32,38,10); ctx.fill();
    ctx.fillStyle = G.accent; ctx.fillRect(-3,0,6,19);
    ctx.fillStyle = '#111'; ctx.fillRect(-12,29,8,21); ctx.fillRect(4,29,8,21);
    ctx.restore();
  };
})();
