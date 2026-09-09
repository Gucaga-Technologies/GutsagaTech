(function(){
  'use strict';
  const NS='pharmabook.web.ru.v1.';
  const html=document.documentElement;
  const safeGet=(k)=>{try{return localStorage.getItem(NS+k)}catch(_){return null}};
  const safeSet=(k,v)=>{try{localStorage.setItem(NS+k,v)}catch(_){}};
  const theme=document.querySelector('[data-theme-select]');
  const font=document.querySelector('[data-font-select]');
  if(theme){ theme.value=html.dataset.theme||'system'; theme.addEventListener('change',()=>{html.dataset.theme=theme.value; safeSet('theme',theme.value);}); }
  if(font){ font.value=html.dataset.fontSize||'default'; font.addEventListener('change',()=>{html.dataset.fontSize=font.value; safeSet('fontSize',font.value);}); }

  const route=html.dataset.route||location.pathname;
  // Book root resolved from this script's own URL, so routes work from a web
  // server and from a local folder (file://) alike.
  const _as=document.currentScript||document.querySelector('script[src$="app.js"]');
  const bookRoot=_as?new URL('../',_as.src).href:(html.dataset.basePath||'/');
  const basePath=(html.dataset.basePath||'/').replace(/\/$/,'');
  // Key stored in localStorage: page path relative to the book root.
  const routeKey=(route.startsWith(basePath+'/')?route.slice(basePath.length+1):route.replace(/^\//,''))||'';
  const toUrl=(key)=>{ try{return new URL(key,bookRoot).href;}catch(_){return key;} };
  let storedLastRoute=safeGet('lastRoute')||'';
  if(storedLastRoute.startsWith(basePath+'/')) storedLastRoute=storedLastRoute.slice(basePath.length+1);
  storedLastRoute=storedLastRoute.replace(/^\//,'');
  const storedLastScroll=safeGet('lastScroll');
  const isReadingRoute=routeKey.startsWith('read/') || /about-author\/?$/.test(routeKey);
  const progress=document.querySelector('[data-progress-bar]');
  let raf=0;
  function updateProgress(){
    raf=0;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const pct=Math.max(0,Math.min(100,scrollY/max*100));
    if(progress){ progress.style.width=pct+'%'; progress.parentElement?.setAttribute('aria-valuenow',String(Math.round(pct))); }
    if(isReadingRoute){ safeSet('lastRoute',routeKey); safeSet('lastScroll',String(Math.round(scrollY))); safeSet('storageVersion','1'); }
  }
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(updateProgress)},{passive:true});
  updateProgress();
  const cont=document.querySelector('[data-continue]');
  if(cont && storedLastRoute && storedLastRoute!==routeKey){ const u=toUrl(storedLastRoute); cont.href=u+(u.includes('?')?'&':'?')+'continue=1'; cont.hidden=false; }
  if(isReadingRoute && storedLastRoute===routeKey && storedLastScroll && new URLSearchParams(location.search).has('continue')){
    requestAnimationFrame(()=>scrollTo(0,Math.max(0,Number(storedLastScroll)||0)));
  }

  const mobile=document.getElementById('mobile-toc');
  const menu=document.querySelector('[data-menu-button]');
  if(mobile && menu && typeof mobile.showModal==='function'){
    menu.addEventListener('click',()=>{ menu.setAttribute('aria-expanded','true'); mobile.showModal(); const first=mobile.querySelector('a,button'); first?.focus(); });
    mobile.addEventListener('close',()=>{menu.setAttribute('aria-expanded','false'); menu.focus();});
    mobile.addEventListener('click',(e)=>{ if(e.target===mobile) mobile.close(); });
    mobile.querySelector('[data-dialog-close]')?.addEventListener('click',()=>mobile.close());
  }

  const figDialog=document.getElementById('figure-dialog');
  const figImg=figDialog?.querySelector('img');
  let zoomTrigger=null;
  document.querySelectorAll('[data-zoom-src]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!figDialog || !figImg || typeof figDialog.showModal!=='function') return;
    zoomTrigger=btn; figImg.src=btn.dataset.zoomSrc||''; figImg.alt=btn.dataset.zoomAlt||''; figDialog.showModal(); figDialog.querySelector('[data-dialog-close]')?.focus();
  }));
  if(figDialog){
    figDialog.querySelector('[data-dialog-close]')?.addEventListener('click',()=>figDialog.close());
    figDialog.addEventListener('close',()=>zoomTrigger?.focus());
    figDialog.addEventListener('click',(e)=>{if(e.target===figDialog)figDialog.close();});
  }

  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
    if(a.hash && a.hash.length>1) history.replaceState(null,'',location.pathname+location.search+a.hash);
  }));
})();
