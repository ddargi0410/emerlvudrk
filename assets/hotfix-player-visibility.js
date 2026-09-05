/* Hotfix 2026-09-05: keep the player visible during the three-ghost principal-room fight. */
(function(){
  if (typeof window === 'undefined') return;

  window.startPrincipalFight = function(){
    if(G.flags.principalClear){ toast('교장실은 조용하다.'); return; }

    // Any remaining locker-hide/flicker state made the player look as if they vanished.
    G.hidden = 0;
    G.invuln = 1.4;
    G.px = 640;
    G.py = 560;
    G.objective = '세 귀신을 실제 전투로 한 명씩 처치';
    G.enemies = [];

    // Spread the ghosts out and stagger their first movement so all three do not pile onto the player at once.
    spawnEnemy('principal', 520, 260, 150, 50);
    spawnEnemy('vice', 760, 250, 120, 50);
    spawnEnemy('classLeader', 930, 365, 100, 50);
    if(G.enemies[0]) G.enemies[0].stun = 1.0;
    if(G.enemies[1]) G.enemies[1].stun = 1.7;
    if(G.enemies[2]) G.enemies[2].stun = 2.4;

    updateHud();
    toast('교장실의 세 시선이 동시에 너를 향한다. 발밑 표시를 보고 움직여!');
  };

  window.drawPlayer = function(){
    ctx.save();
    ctx.translate(G.px, G.py);

    // Keep combat visibility high. Invulnerability is indicated by a gold ring instead of heavy blinking.
    ctx.globalAlpha = G.hidden > 0 ? 0.34 : (G.invuln > 0 ? 0.92 : 1);

    ctx.save();
    ctx.globalAlpha = G.hidden > 0 ? 0.38 : 0.95;
    ctx.strokeStyle = G.invuln > 0 ? '#ffd86f' : '#82dcff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 42, 25, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = G.invuln > 0 ? '#ffd86f' : '#dff7ff';
    ctx.beginPath();
    ctx.moveTo(0, -58);
    ctx.lineTo(-7, -47);
    ctx.lineTo(7, -47);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = G.hair;
    ctx.beginPath(); ctx.ellipse(0,-19,19,24,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = G.skin;
    ctx.beginPath(); ctx.arc(0,-17,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = G.hair;
    ctx.beginPath();
    ctx.moveTo(-15,-30); ctx.quadraticCurveTo(0,-43,17,-29); ctx.lineTo(12,-17); ctx.quadraticCurveTo(0,-26,-14,-15); ctx.fill();
    ctx.fillStyle = G.cloth;
    ctx.beginPath(); ctx.roundRect(-16,-4,32,38,10); ctx.fill();
    ctx.fillStyle = G.accent; ctx.fillRect(-3,0,6,19);
    ctx.fillStyle = '#111'; ctx.fillRect(-12,29,8,21); ctx.fillRect(4,29,8,21);
    ctx.restore();
  };
})();
