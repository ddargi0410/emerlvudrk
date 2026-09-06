const CACHE='school-escape-v7-creator-20260906';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/icon.svg','./assets/opening-concept.jpg','./assets/game-v4.css','./assets/creator-v2.css','./assets/game-v4-core1.js','./assets/game-v4-core2.js','./assets/game-v4-content.js','./assets/game-v4-engine.js','./assets/hotfix-player-visibility.js','./assets/hotfix-final-timer.js','./assets/hotfix-ending-art.js','./assets/hotfix-hidden-inline.js','./assets/hotfix-creator-ui.js','./assets/hidden-ending-small.b64'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));
    return;
  }
  const url=new URL(e.request.url);
  const fresh=url.pathname.endsWith('/assets/hotfix-hidden-inline.js')||url.pathname.endsWith('/assets/hidden-ending-small.b64')||url.pathname.endsWith('/assets/hotfix-ending-art.js')||url.pathname.endsWith('/assets/hotfix-creator-ui.js')||url.pathname.endsWith('/assets/creator-v2.css');
  if(fresh){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return res;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
    return;
  }
  e.respondWith(fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||caches.match('./index.html'))));
});