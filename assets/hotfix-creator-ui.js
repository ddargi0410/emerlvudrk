/* Character Creator v2 · functional selector UI, no generated assets */
(function(){
  'use strict';
  if(typeof window==='undefined') return;
  const $=id=>document.getElementById(id);
  const qsa=(sel,root=document)=>[...root.querySelectorAll(sel)];

  const defaults={
    gender:'female',skin:'#f3cfb0',eyeColor:'#50382f',eyeStyle:'soft',mouthStyle:'smile',
    hairStyle:'long',hairColor:'#2b211f',clothColor:'#20344d',accentColor:'#9f314c',
    faceShape:'soft',noseStyle:'small',outfitStyle:'uniform'
  };
  const outfitMap={
    uniform:{cloth:'#20344d',accent:'#9f314c'},cardigan:{cloth:'#4a474d',accent:'#8d3046'},
    hoodie:{cloth:'#222c35',accent:'#50677b'},trench:{cloth:'#6c6154',accent:'#3f3029'},
    white:{cloth:'#ddd8d2',accent:'#625a61'}
  };

  function toneColor(field,value){
    const el=$(field); if(!el) return;
    el.value=value; el.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function setField(field,value){
    if(field==='faceShape'){G.faceShape=value;}
    else if(field==='noseStyle'){G.noseStyle=value;}
    else if(field==='outfitStyle'){
      G.outfitStyle=value; const m=outfitMap[value]||outfitMap.uniform;
      toneColor('clothColor',m.cloth); toneColor('accentColor',m.accent);
    } else {
      const id={gender:'gender',skin:'skin',eyeColor:'eyeColor',eyeStyle:'eyeStyle',mouthStyle:'mouthStyle',hairStyle:'hairStyle',hairColor:'hairColor'}[field];
      if(id) toneColor(id,value);
    }
    qsa(`[data-field="${field}"]`).forEach(b=>b.classList.toggle('is-active',b.dataset.value===value));
    try{renderAvatar();}catch{}
  }
  function getCurrent(field){
    if(field==='faceShape') return G.faceShape||defaults.faceShape;
    if(field==='noseStyle') return G.noseStyle||defaults.noseStyle;
    if(field==='outfitStyle') return G.outfitStyle||defaults.outfitStyle;
    const id={gender:'gender',skin:'skin',eyeColor:'eyeColor',eyeStyle:'eyeStyle',mouthStyle:'mouthStyle',hairStyle:'hairStyle',hairColor:'hairColor'}[field];
    return $(id)?.value||defaults[field];
  }
  function syncButtons(){
    ['gender','skin','eyeColor','eyeStyle','mouthStyle','hairStyle','hairColor','faceShape','noseStyle','outfitStyle'].forEach(f=>{
      const v=getCurrent(f); qsa(`[data-field="${f}"]`).forEach(b=>b.classList.toggle('is-active',b.dataset.value===v));
    });
  }
  function randomize(){
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    setField('gender',pick(['female','male']));
    setField('skin',pick(['#f3cfb0','#edc3a7','#ddb28f','#c99372','#aa745b','#8c5d48']));
    setField('eyeColor',pick(['#50382f','#6d5aa8','#3e7570','#477aa2']));
    setField('eyeStyle',pick(['soft','sharp','round','tired','spooky']));
    setField('mouthStyle',pick(['smile','calm','bold']));
    setField('faceShape',pick(['soft','round','oval','sharp']));
    setField('noseStyle',pick(['small','slim','sharp']));
    setField('hairStyle',pick(G.gender==='male'?['short','wave','bob']:['long','bob','twintail','ponytail','wave']));
    setField('hairColor',pick(['#2b211f','#171a20','#6d3543','#9d6b3d']));
    setField('outfitStyle',pick(['uniform','cardigan','hoodie','trench','white']));
    toast('랜덤 캐릭터 완성');
  }
  function resetCreator(){
    Object.entries(defaults).forEach(([k,v])=>setField(k,v));
    if($('charName')){$('charName').value='지우';$('charName').dispatchEvent(new Event('input',{bubbles:true}));}
    toast('기본 설정으로 초기화');
  }

  function makeCharacterSvg(){
    const skin=G.skin||defaults.skin,hair=G.hair||'#2b211f',eye=G.eye||'#50382f',cloth=G.cloth||'#20344d',accent=G.accent||'#9f314c';
    const female=G.gender!=='male',face=G.faceShape||'soft',nose=G.noseStyle||'small',outfit=G.outfitStyle||'uniform',style=G.hairStyle||'long';
    const headPath={soft:'M119 153 Q118 88 210 78 Q302 88 301 153 L296 218 Q287 279 210 298 Q133 279 124 218Z',round:'M120 151 Q123 81 210 80 Q297 81 300 151 L296 215 Q281 276 210 288 Q139 276 124 215Z',oval:'M126 145 Q129 78 210 74 Q291 78 294 145 L291 226 Q276 292 210 306 Q144 292 129 226Z',sharp:'M126 145 Q132 80 210 77 Q288 80 294 145 L288 218 Q272 270 210 306 Q148 270 132 218Z'}[face];
    const eyeWhite=G.eyeStyle==='round'?'<ellipse cx="169" cy="178" rx="28" ry="19" fill="#f7f4f5"/><ellipse cx="251" cy="178" rx="28" ry="19" fill="#f7f4f5"/>':G.eyeStyle==='sharp'?'<path d="M140 181q30-25 58-2-30 16-58 2Z" fill="#f7f4f5"/><path d="M222 179q29-23 58 2-30 16-58-2Z" fill="#f7f4f5"/>':G.eyeStyle==='tired'?'<path d="M141 181q29-17 57 0-27 14-57 1Z" fill="#f7f4f5"/><path d="M223 181q28-17 57 0-27 14-57 1Z" fill="#f7f4f5"/>':'<path d="M140 180q30-25 59 1-29 18-59 0Z" fill="#f7f4f5"/><path d="M221 181q30-26 59-1-29 18-59 1Z" fill="#f7f4f5"/>';
    const spooky=G.eyeStyle==='spooky';
    const pupils=`<ellipse cx="170" cy="179" rx="12" ry="15" fill="${spooky?'#a68cff':eye}"/><ellipse cx="250" cy="179" rx="12" ry="15" fill="${spooky?'#a68cff':eye}"/><ellipse cx="173" cy="174" rx="4" ry="5" fill="#fff"/><ellipse cx="253" cy="174" rx="4" ry="5" fill="#fff"/>${spooky?'<circle cx="170" cy="179" r="17" fill="none" stroke="#aa8fff" opacity=".6"/><circle cx="250" cy="179" r="17" fill="none" stroke="#aa8fff" opacity=".6"/>':''}`;
    const nosePath=nose==='sharp'?'<path d="M209 193q-8 30 4 39 11 2 17-4" fill="none" stroke="#b88372" stroke-width="3.2" stroke-linecap="round"/>':nose==='slim'?'<path d="M211 198q-6 24 3 31 8 1 12-3" fill="none" stroke="#bb8b79" stroke-width="2.5" stroke-linecap="round"/>':'<path d="M207 207q-3 16 4 20 7 2 12-2" fill="none" stroke="#bf927f" stroke-width="2.5" stroke-linecap="round"/>';
    const mouth=G.mouth==='calm'?'<path d="M188 248q22 3 44 0" fill="none" stroke="#a85a68" stroke-width="3" stroke-linecap="round"/>':G.mouth==='bold'?'<path d="M187 246q23 17 46 0-23-8-46 0Z" fill="#af5367"/>':'<path d="M187 245q23 16 46 0" fill="none" stroke="#a85163" stroke-width="3.5" stroke-linecap="round"/>';
    let back='',front='';
    if(style==='long'){back=`<path d="M101 138Q112 45 210 42Q309 48 319 142L330 433Q278 470 211 438Q139 469 90 427Z" fill="${hair}"/>`;front=`<path d="M105 143Q120 58 210 55Q301 63 315 145Q278 110 243 101Q234 134 207 159Q196 124 174 101Q149 132 105 162Z" fill="${hair}"/>`}
    else if(style==='ponytail'){back=`<ellipse cx="319" cy="178" rx="65" ry="116" fill="${hair}" transform="rotate(-14 319 178)"/><path d="M102 139Q116 48 210 46Q304 51 316 143L303 339Q259 371 211 352Q153 371 102 337Z" fill="${hair}"/>`;front=`<path d="M105 142Q121 59 210 56Q298 62 313 144Q279 111 243 101Q234 133 207 158Q195 123 173 102Q150 132 105 160Z" fill="${hair}"/>`}
    else if(style==='twintail'){back=`<ellipse cx="92" cy="225" rx="46" ry="137" fill="${hair}" transform="rotate(10 92 225)"/><ellipse cx="328" cy="225" rx="46" ry="137" fill="${hair}" transform="rotate(-10 328 225)"/><path d="M108 137Q119 50 210 47Q301 52 312 140L302 321Q260 349 210 337Q158 349 108 319Z" fill="${hair}"/>`;front=`<path d="M108 141Q126 60 210 56Q296 61 311 143Q277 111 243 101Q233 132 207 158Q195 122 174 102Q151 131 108 159Z" fill="${hair}"/>`}
    else if(style==='wave'){back=`<path d="M99 138Q112 48 210 44Q307 50 319 142L329 426Q315 444 294 426Q279 455 258 430Q239 457 211 434Q186 460 163 432Q142 452 126 425Q105 444 91 423Z" fill="${hair}"/>`;front=`<path d="M105 143Q121 58 210 55Q299 61 314 144Q279 111 245 101Q233 132 208 158Q197 124 174 102Q151 132 105 160Z" fill="${hair}"/>`}
    else if(style==='bob'){back=`<path d="M102 139Q116 48 210 46Q304 51 316 143L308 320Q267 360 210 347Q152 361 101 318Z" fill="${hair}"/>`;front=`<path d="M105 142Q121 59 210 56Q298 62 313 144Q279 111 243 101Q234 133 207 158Q195 123 173 102Q150 132 105 160Z" fill="${hair}"/>`}
    else {back=`<path d="M105 145Q118 60 208 48Q298 53 316 139L295 250Q256 275 211 267Q164 278 117 248Z" fill="${hair}"/>`;front=`<path d="M103 141L130 75L157 83L174 47L201 70L229 43L240 76L283 58L276 98L316 91L292 165L255 126L231 165L208 121L184 162L158 126L132 160Z" fill="${hair}"/>`}
    const uniform=outfit==='white'?`<path d="M139 347Q210 318 281 347L321 584Q273 615 210 598Q147 616 99 584Z" fill="#e9e3df"/><path d="M148 349L210 407L272 349L257 415L210 444L162 415Z" fill="#f7f5f2"/><path d="M210 408L191 432L210 493L229 432Z" fill="#58505a"/>`:outfit==='trench'?`<path d="M132 340Q210 316 288 340L315 593H105Z" fill="${cloth}"/><path d="M137 344L194 393L170 542M283 344L226 393L249 542" stroke="#aa9e90" stroke-width="7" fill="none"/><path d="M147 456H274" stroke="#4b4039" stroke-width="9"/>`:outfit==='hoodie'?`<path d="M137 347Q210 319 283 347L305 574Q260 602 210 590Q160 603 115 574Z" fill="${cloth}"/><path d="M152 349Q210 391 268 349Q250 325 210 325Q170 325 152 349Z" fill="#111820"/><path d="M210 351V546" stroke="#94a4af" stroke-width="4"/>`:outfit==='cardigan'?`<path d="M136 347Q210 319 284 347L307 581Q258 608 210 593Q160 608 113 581Z" fill="${cloth}"/><path d="M150 349L210 409L270 349L252 419L210 446L168 419Z" fill="#eef1f2"/><path d="M210 402V568" stroke="#2a2729" stroke-width="4"/>`: `<path d="M136 347Q210 319 284 347L307 581Q258 608 210 593Q160 608 113 581Z" fill="${cloth}"/><path d="M150 349L210 409L270 349L252 419L210 446L168 419Z" fill="#eef1f2"/><path d="M210 405L189 432L210 501L231 432Z" fill="${accent}"/>`;
    const skirt=female?`<path d="M140 566H280L304 658H116Z" fill="${outfit==='white'?'#ded8d3':shade(cloth,-8)}"/><path d="M151 580H290M137 613H297" stroke="rgba(255,255,255,.12)" stroke-width="3"/>`:`<path d="M146 566H274L264 700H218L210 609L202 700H156Z" fill="#3c4147"/>`;
    const legs=female?`<path d="M150 650H196L188 735H151Z" fill="${skin}"/><path d="M224 650H270L269 735H232Z" fill="${skin}"/><path d="M148 695H190L185 748H147Z" fill="#20242a"/><path d="M230 695H272L273 748H235Z" fill="#20242a"/>`:`<path d="M156 688H202L198 747H158Z" fill="#30363c"/><path d="M218 688H264L262 747H222Z" fill="#30363c"/>`;
    return `<svg viewBox="0 0 420 760" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="skinGlow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient></defs>${back}<path d="M174 285H246V354Q210 377 174 354Z" fill="${skin}"/>${uniform}${skirt}${legs}<path d="${headPath}" fill="${skin}"/><path d="${headPath}" fill="url(#skinGlow)"/>${front}<path d="M108 155Q108 245 138 295" stroke="${hair}" stroke-width="21" stroke-linecap="round" fill="none"/><path d="M312 155Q312 245 282 295" stroke="${hair}" stroke-width="21" stroke-linecap="round" fill="none"/>${eyeWhite}${pupils}<path d="M145 151q23-10 45 1M230 152q23-11 45 0" stroke="${shade(hair,-12)}" stroke-width="5" fill="none" stroke-linecap="round"/>${nosePath}${mouth}<path d="M139 356Q103 372 83 417L68 535H111L137 434" fill="${cloth}"/><path d="M281 356Q317 372 337 417L352 535H309L283 434" fill="${cloth}"/>${female?'<path d="M318 414q28 42 35 88" stroke="#f0dfaa" stroke-width="12" stroke-linecap="round" opacity=".18"/>':''}<circle cx="345" cy="498" r="15" fill="#d8cbb0" opacity=".85"/><path d="M347 499L389 478" stroke="#d7c697" stroke-width="16" stroke-linecap="round"/><circle cx="395" cy="475" r="20" fill="#2b3137"/><circle cx="395" cy="475" r="13" fill="#eee4be" opacity=".8"/></svg>`;
  }

  function installAvatar(){
    window.svgCharacter=makeCharacterSvg;
    try{svgCharacter=makeCharacterSvg;}catch{}
    G.faceShape=G.faceShape||defaults.faceShape; G.noseStyle=G.noseStyle||defaults.noseStyle; G.outfitStyle=G.outfitStyle||defaults.outfitStyle;
    try{renderAvatar();}catch{}
  }
  function installUI(){
    qsa('#creator [data-field]').forEach(btn=>btn.addEventListener('click',()=>setField(btn.dataset.field,btn.dataset.value)));
    $('creatorRandom')?.addEventListener('click',randomize);
    $('creatorReset')?.addEventListener('click',resetCreator);
    $('charName')?.addEventListener('input',()=>{G.name=$('charName').value||'지우';$('previewName').textContent=G.name;});
    syncButtons();
  }
  installAvatar(); installUI();
  setTimeout(()=>{installAvatar();syncButtons();},50);
})();