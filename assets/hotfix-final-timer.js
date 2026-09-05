/* Hotfix 2026-09-05: final door mash timer 10 seconds / 30 clicks. */
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
})();
