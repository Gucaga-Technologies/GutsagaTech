(function(){
  'use strict';
  const form=document.querySelector('[data-search-form]');
  const input=document.querySelector('[data-search-input]');
  const list=document.querySelector('[data-search-results]');
  const status=document.querySelector('[data-search-status]');
  const _s=document.querySelector('script[src$="search.js"]');
  const base=_s?new URL('../',_s.src).href:(document.documentElement.dataset.basePath||'/');
  const basePath=(document.documentElement.dataset.basePath||'/').replace(/\/$/,'');
  // Turn an index route into a URL that works from a web server and from a
  // local folder (file://) alike.
  function routeUrl(route){
    let k=String(route||'');
    if(basePath && k.startsWith(basePath+'/')) k=k.slice(basePath.length+1);
    else if(basePath && k===basePath) k='';
    k=k.replace(/^\//,'');
    if(k===''||k.endsWith('/')) k+='index.html';
    try{ return new URL(k,base).href; }catch(_){ return route; }
  }
  let index=[];
  const normalize=s=>(s||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/\s+/g,' ').trim();
  // Preferred source: assets/search-index.js (a plain script, so it also loads
  // from file://, where fetch() of a local JSON file is blocked). Falls back to
  // search-index.json when served over http(s).
  const load=new Promise(res=>{
    if(window.__PB_SEARCH_INDEX__){ index=window.__PB_SEARCH_INDEX__.records||[]; return res(); }
    const s=document.createElement('script');
    s.src=base.replace(/\/$/,'/')+'assets/search-index.js';
    s.onload=()=>{ index=(window.__PB_SEARCH_INDEX__||{}).records||[]; res(); };
    s.onerror=()=>{ fetch(base.replace(/\/$/,'/')+'search-index.json',{cache:'force-cache'}).then(r=>r.json()).then(d=>index=d.records||[]).catch(()=>index=[]).then(res); };
    document.head.appendChild(s);
  });
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function run(q){
    const terms=normalize(q).split(' ').filter(Boolean);
    list.innerHTML='';
    if(!terms.length){status.textContent='Введите запрос.'; return;}
    const hits=index.filter(r=>terms.every(t=>normalize(r.text).includes(t))).slice(0,50);
    status.textContent=hits.length?`Найдено: ${hits.length}`:'Ничего не найдено.';
    for(const r of hits){
      const li=document.createElement('li'); const h=document.createElement('h2'); const a=document.createElement('a');
      a.href=routeUrl(r.route); a.textContent=r.title; h.appendChild(a); li.appendChild(h);
      const p=document.createElement('p'); p.textContent=r.excerpt; li.appendChild(p); list.appendChild(li);
    }
  }
  form?.addEventListener('submit',async e=>{e.preventDefault(); await load; const q=input.value; const u=new URL(location.href); if(q)u.searchParams.set('q',q); else u.searchParams.delete('q'); history.replaceState(null,'',u); run(q);});
  load.then(()=>{const q=new URL(location.href).searchParams.get('q')||''; if(input)input.value=q; if(q)run(q);});
})();
