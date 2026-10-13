/* V19 self-contained reader. No fetch, modules, external calls, or required storage. */
(function(){'use strict';
var root=document.documentElement;
function getSaved(k,fallback){try{return localStorage.getItem('pb19_'+k)||fallback;}catch(e){return fallback;}}
function save(k,v){try{localStorage.setItem('pb19_'+k,v);}catch(e){/* portable storage denied */}}
var theme=getSaved('theme','system'),scale=Math.max(.85,Math.min(1.5,Number(getSaved('font','1'))||1));
function setTheme(t){theme=['system','light','dark'].indexOf(t)>=0?t:'system';if(theme==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',theme);document.querySelectorAll('[data-reader-theme]').forEach(function(el){el.value=theme;});save('theme',theme);}
function setScale(n){scale=Math.round(Math.max(.85,Math.min(1.5,n))*100)/100;root.style.setProperty('--rd-font',String(scale));document.querySelectorAll('[data-font-value]').forEach(function(el){el.textContent=Math.round(scale*100)+'%';});save('font',String(scale));}
function ready(){
 setTheme(theme);setScale(scale);
 var panel=document.getElementById('reader-panel'),screen=document.getElementById('reader-screen'),button=document.querySelector('[data-open-menu]');
 function toggle(state){if(!panel||!button)return;panel.hidden=!state;if(screen)screen.hidden=!state;button.setAttribute('aria-expanded',state?'true':'false');if(state){var search=panel.querySelector('input[type=search]');if(search)search.focus();}else button.focus();}
 if(button)button.addEventListener('click',function(){toggle(panel.hidden);});
 if(screen)screen.addEventListener('click',function(){toggle(false);});
 document.addEventListener('keydown',function(event){if(event.key==='Escape'&&panel&&!panel.hidden){toggle(false);}});
 if(panel)panel.querySelectorAll('a[href]').forEach(function(el){el.addEventListener('click',function(){panel.hidden=true;if(screen)screen.hidden=true;button.setAttribute('aria-expanded','false');});});
 document.querySelectorAll('[data-font-change]').forEach(function(el){el.addEventListener('click',function(){setScale(scale+Number(el.getAttribute('data-font-change')));});});
 document.querySelectorAll('[data-reader-theme]').forEach(function(el){el.addEventListener('change',function(){setTheme(el.value);});});
 var form=document.getElementById('book-search'),results=document.getElementById('search-results'),input=document.getElementById('book-search-input');
 function render(query){if(!results)return;results.textContent='';var q=(query||'').trim().toLocaleLowerCase();if(!q){results.textContent='Type a word or phrase to search all 224 pages.';return;}
 var records=window.PHARMA_BOOK_SEARCH_INDEX||[];var terms=q.split(/\s+/).filter(Boolean);var hits=[];
 records.forEach(function(item){var str=item[3]||'',lower=str.toLocaleLowerCase();if(terms.every(function(t){return lower.indexOf(t)>=0;})){var where=lower.indexOf(q);if(where<0)where=lower.indexOf(terms[0]);hits.push({item:item,where:where});}});
 if(!hits.length){results.textContent='No matches. Try different words.';return;}
 var label=document.createElement('p');label.textContent=hits.length+' pages found';results.appendChild(label);
 hits.slice(0,60).forEach(function(hit){var item=hit.item;var box=document.createElement('article');box.className='search-result';var a=document.createElement('a');a.href=(document.body.classList.contains('home')?'':'../')+item[0];a.textContent=item[2];var meta=document.createElement('small');meta.textContent='Physical page '+item[1];var ctx=document.createElement('p');var start=Math.max(0,hit.where-55),end=Math.min(item[3].length,Math.max(0,hit.where)+115);ctx.textContent=(start?'…':'')+item[3].slice(start,end)+(end<item[3].length?'…':'');box.appendChild(a);box.appendChild(meta);box.appendChild(ctx);results.appendChild(box);});
 if(hits.length>60){var msg=document.createElement('p');msg.textContent='Showing first 60 matching pages. Refine the search to see more.';results.appendChild(msg);}
 }
 if(form)form.addEventListener('submit',function(e){e.preventDefault();render(input.value);});
 if(input)input.addEventListener('input',function(){if(!input.value.trim())render('');});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
