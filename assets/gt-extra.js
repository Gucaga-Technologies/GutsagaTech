/* mark document when external CSS loaded (disables inline zip-preview fallback) */
(function(){try{
  var d=document.createElement('div');d.className='gtx-crumbs';d.style.position='absolute';d.style.visibility='hidden';
  document.documentElement.appendChild(d);
  var fs=parseFloat(getComputedStyle(d).fontSize);
  document.documentElement.removeChild(d);
  if(fs && fs<15) document.documentElement.classList.add('gtx-cssok');
}catch(e){}})();
/* GT site interactions (added after de-static-ing) */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll reveal ---------- */
  var targets = document.querySelectorAll('.gtx-card, .gtx-issue, .gtx-quote, .gtx-metric, .gtx-news, .gtx-num, .gtx-cta');
  targets.forEach(function (el) { el.classList.add('gtx-reveal'); });
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('gtx-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.gtx-reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.gtx-reveal').forEach(function (el) { el.classList.add('gtx-in'); });
  }

  /* ---------- Elementor nested tabs (Horizon / Assortment / Dashboards) ---------- */
  document.querySelectorAll('.e-n-tabs').forEach(function (tabs) {
    var titles = tabs.querySelectorAll('.e-n-tab-title');
    var content = tabs.querySelector('.e-n-tabs-content');
    if (!titles.length || !content) return;
    var panes = Array.prototype.filter.call(content.children, function (c) { return c.nodeType === 1; });
    function activate(i) {
      titles.forEach(function (t, j) { t.classList.toggle('gtx-active', i === j); t.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
      panes.forEach(function (p, j) { p.classList.toggle('gtx-active', i === j); });
    }
    titles.forEach(function (t, i) { t.addEventListener('click', function () { activate(i); }); });
    activate(0);
  });

  /* ---------- Industries dropdown in main menu ---------- */
  var INDUSTRIES = [
    ['pharmacy', 'Pharmacy Chains'], ['pharma-wholesale', 'Pharma Distribution'],
    ['fmcg', 'FMCG & Food Retail'], ['food-production', 'Food & Beverage Production'],
    ['beverages', 'Beverages Distribution'], ['automotive', 'Automotive & Moto Parts'],
    ['construction', 'Construction Materials'], ['hardware-diy', 'Hardware, Tools & DIY'],
    ['beauty', 'Beauty & Cosmetics'], ['fashion', 'Fashion & Footwear'],
    ['electronics', 'Electronics & Appliances'], ['pet', 'Pet Supplies'],
    ['garden', 'Garden & Agriculture'], ['toys', 'Toys & Children’s Goods'],
    ['sporting', 'Sporting Goods'], ['furniture', 'Furniture & Home'],
    ['books-office', 'Books, Stationery & Office'], ['medical-optics', 'Medical Devices & Optics'],
    ['industrial', 'Industrial Supplies & MRO'], ['distribution', 'Distribution & Wholesale'],
    ['ecommerce', 'E-commerce & Omnichannel']
  ];
  document.querySelectorAll('a[href$="industries/index.html"]').forEach(function (a) {
    var li = a.closest('li');
    if (!li || li.classList.contains('gtx-dd')) return;
    var base = a.getAttribute('href').replace(/index\.html$/, '');
    li.classList.add('gtx-dd');
    var panel = document.createElement('div');
    panel.className = 'gtx-dd-panel';
    var all = document.createElement('a');
    all.href = base + 'index.html';
    all.className = 'gtx-dd-all';
    all.textContent = 'All industries →';
    panel.appendChild(all);
    INDUSTRIES.forEach(function (it) {
      var l = document.createElement('a');
      l.href = base + it[0] + '.html';
      l.textContent = it[1];
      panel.appendChild(l);
    });
    li.appendChild(panel);
  });

  /* ---------- contact forms (formsubmit.co) ---------- */
  document.querySelectorAll('form.gtx-form').forEach(function (f) {
    f.addEventListener('submit', function () {
      var b = f.querySelector('button[type="submit"]');
      if (b) { b.textContent = 'Sending…'; b.disabled = true; }
    });
  });
})();

/* v3: rotate wpr advanced sliders (static export) */
(function(){
  document.querySelectorAll('.wpr-advanced-slider').forEach(function(sl){
    var items=sl.querySelectorAll('.wpr-slider-item');
    if(!items.length) return;
    var i=0; items[0].classList.add('gtx-on');
    if(items.length>1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      setInterval(function(){
        items[i].classList.remove('gtx-on');
        i=(i+1)%items.length;
        items[i].classList.add('gtx-on');
      },5200);
    }
  });
})();

/* v38: value calculator.
   - asks annual sales instead of inventory turns (days of stock is derived)
   - "usual replenishment time" instead of "reorder every ... days"
   - ordering hours are PER PERSON per day, so the labour saving no longer
     depends on how the visitor read the label
   - every input is clamped, so no entry can push the output out of range */
(function(){
  var root=document.getElementById('gtx-vc2'); if(!root) return;
  /* id -> [default, min, max] */
  var DEF={rate:[8,0,25],n:[100,1,100000],sales:[60000000,1000,1e13],inv:[75000,100,1e11],
           freq:[7,1,90],margin:[30,1,90],avail:[96,50,99.4],salary:[2000,100,200000],
           hours:[5,.25,8],people:[25,1,100000]};
  var F={};
  function clamp(x,a,b){return Math.min(Math.max(x,a),b);}
  function fmt(x){return '$'+Math.round(x).toLocaleString('en-US');}
  function fmtA(x){ /* approximate: 2 significant digits */
    if(x>=1e12) return '~$'+(Math.round(x/1e11)/10).toFixed(1).replace(/\.0$/,'')+'T';
    if(x>=1e9) return '~$'+(Math.round(x/1e8)/10).toFixed(1).replace(/\.0$/,'')+'B';
    if(x>=1e6) return '~$'+(Math.round(x/1e5)/10).toFixed(1).replace(/\.0$/,'')+'M';
    if(x>=1e4) return '~$'+Math.round(x/1e3).toLocaleString('en-US')+'k';
    if(x>=1e3) return '~$'+(Math.round(x/100)/10).toFixed(1).replace(/\.0$/,'')+'k';
    return '~$'+Math.round(x/10)*10;
  }
  function read(){
    for(var k in DEF){
      var d=DEF[k], el=document.getElementById('vc2-'+k);
      var v=el?parseFloat(el.value):NaN;
      /* empty or non-positive means "not filled in" -> fall back to the example
         value rather than silently keeping whatever was there before */
      F[k]=(isNaN(v)||v<=0)?d[0]:clamp(v,d[1],d[2]);
    }
  }
  function calc(){
    read();
    var rate=F.rate/100, m=F.margin/100, av=Math.min(F.avail,99.4)/100;
    var gap=Math.max(0.5,99-Math.min(F.avail,99.4));
    /* per location, per year */
    var sales=F.sales/F.n, cogs=sales*(1-m), profit=sales-cogs;
    /* days of stock, derived — this is what used to be asked as "inventory turns" */
    var daysRaw=F.inv*365/cogs, days=clamp(daysRaw,3,400), odd=Math.abs(daysRaw-days)>0.5;
    /* if the entered sales and stock cannot both be true, work from the clamped
       days so the model stays internally consistent instead of freeing more
       money than the company owns */
    var inv=odd?cogs*days/365:F.inv;
    var base=30+F.freq, ratio=days/base;
    var ratioP=F.people/F.n;
    var manual=ratioP>=0.5, partly=ratioP>=0.15&&ratioP<0.5, auto=ratioP<0.15;
    var highFill=F.avail>=95.5, oos=F.avail<95.5, os=ratio>1.15;
    var goodTurns=ratio<=1.1;
    var dv=document.getElementById('vc2-days-out');
    if(dv){
      dv.innerHTML='From your sales, margin and stock: <b>'+days.toFixed(0)+' days of stock</b> '
        +'('+(365/days).toFixed(1)+' turns a year).'
        +(odd?' &#8212; check the numbers, this looks unusual.':'');
    }
    var fl=document.getElementById('vc2-flags');
    if(fl){
      var msg=[];
      if(os)  msg.push('overstock &#8212; '+days.toFixed(0)+' days of stock against a '+F.freq+'-day replenishment cycle points to excess sitting in the network');
      if(oos) msg.push('lost sales &#8212; ~'+(100-F.avail).toFixed(0)+'% of demand meets an empty shelf');
      if(manual) msg.push('manual ordering &#8212; roughly one order manager per location');
      else if(partly) msg.push('semi-manual ordering &#8212; '+F.people+' people for '+F.n+' locations');
      fl.innerHTML = msg.length? '<b>Likely issues we see in your numbers:</b> '+msg.join(' &#183; ')
        : (auto? 'Ordering already looks automated &#8212; your gains will come from stock, availability and assortment.'
               : 'Your numbers look healthy &#8212; the diagnostic usually still finds hidden imbalance between locations.');
      fl.style.display='block';
    }
    /* stock reduction: scales with excess over the replenishment rhythm;
       high fill rate -> 10-20% is always available;
       many stockouts + already good turns -> almost nothing to cut */
    var optRed=clamp(8+(ratio-1)*25,6,40)/100, pessRed=optRed*0.4;
    if(ratio<=1){ /* stock is already lean for this replenishment rhythm —
                     there is very little left to cut, whatever the fill rate */
      optRed=Math.min(optRed,.10); pessRed=optRed*0.4;
    } else if(highFill){optRed=Math.max(optRed,.20); pessRed=Math.max(pessRed,.10);}
    else if(oos && goodTurns){optRed=Math.min(optRed,.08); pessRed=optRed*0.4;}
    var hrP=manual?.30:partly?.20:.05, hrO=manual?.85:partly?.60:.25;
    var S={pess:{av:clamp(.22*gap,.3,2.5), tu:pessRed, hr:hrP, ah:0.5},
           opt:{av:clamp(.55*gap+.35,1,6), tu:optRed, hr:hrO, ah:1.0}};
    if(oos){S.pess.av=clamp(S.pess.av*1.3,.3,3.5);S.opt.av=clamp(S.opt.av*1.3,1,7);}
    /* ordering payroll: hours are per person per day, out of an 8-hour day */
    var share=clamp(F.hours/8,0,1);
    var ocChain=F.people*F.salary*12*share, oc=ocChain/F.n;
    ['pess','opt'].forEach(function(s){
      var c=S[s];
      var avF=Math.min(av+c.av/100,.995), avG=(avF-av)*100;
      var salesChg=clamp(avG*(2+0.4*avG)/100,0,.20);
      var mGain=clamp(.1+c.tu*100*.03,0,.8)/100;
      var daysF=days*(1-c.tu);
      var salesF=sales*(1+salesChg), cogsF=salesF*(1-m-mGain), profitF=salesF-cogsF;
      var invF=cogsF*daysF/365;
      /* never claim more than the 40% we publish anywhere else */
      var freed=clamp(inv-invF,0,inv*0.40), redPct=freed/inv*100;
      var dO=oc*c.hr, dP=profitF-profit, dB=freed*rate, tot=dP+dB+dO;
      function q(id,html){var e=document.getElementById('vc2-'+s+'-'+id);if(e)e.innerHTML=html;}
      q('sales','<b>+'+(salesChg*100).toFixed(1)+'% &#183; '+fmtA(sales*salesChg*F.n)+'</b><small>'+fmtA(sales*salesChg)+' per location</small>');
      q('over','<b>&minus;'+redPct.toFixed(0)+'% &#183; '+fmtA(freed*F.n)+' freed</b><small>'+days.toFixed(0)+'&rarr;'+daysF.toFixed(0)+' days &#183; '+fmtA(freed)+' per location</small>');
      q('time','<b>&minus;'+(c.hr*100).toFixed(0)+'% &#183; '+fmt(dO*F.n)+'</b><small>of '+fmt(ocChain)+'/yr ordering payroll &#183; '+fmt(dO)+' per location</small>');
      q('total','<b>'+fmtA(tot*F.n).replace('~','')+'</b><small>'+fmtA(tot)+' per location</small>');
      q('asm','availability +'+avG.toFixed(1)+'pp &#183; assortment head +'+c.ah+'% / tail &minus;'+c.ah+'%');
    });
  }
  root.querySelectorAll('input').forEach(function(i){i.addEventListener('input',calc);i.addEventListener('change',calc);});
  calc();
})();

/* youtube facades: thumbnail + play, iframe on click */
(function(){
  document.querySelectorAll('.gtx-yt').forEach(function(el){
    var id=el.getAttribute('data-yt'), t=el.getAttribute('data-t')||'';
    el.innerHTML='<img src="https://img.youtube.com/vi/'+id+'/hqdefault.jpg" alt="'+t+'" loading="lazy"/><span class="gtx-play"></span><span class="gtx-yt-t">'+t+' &#183; YouTube</span>';
    el.addEventListener('click',function(){
      el.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1" title="'+t+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    },{once:true});
  });
})();

/* sync tab side-images with active tab (static export lacks Elementor JS) */
(function(){
  document.querySelectorAll('.e-n-tabs').forEach(function(tabs){
    var scope=tabs.closest('.e-con.e-parent')||tabs.parentElement;
    if(!scope) return;
    var imgs=[].filter.call(scope.querySelectorAll('img'),function(im){return !tabs.contains(im)&&im.width!==34;});
    if(imgs.length<2) return;
    var titles=tabs.querySelectorAll('.e-n-tab-title');
    function show(i){imgs.forEach(function(im,j){im.style.display=(i===j||j>=titles.length)?'':'none';});}
    titles.forEach(function(tt,i){tt.addEventListener('click',function(){show(i);});});
    show(0);
  });
})();

/* v29: rebuild + open/close the mobile menu (Elementor's own JS is not in the static export) */
(function(){
  var wrap=document.querySelector('#masthead .wpr-mobile-nav-menu-container');
  if(!wrap) return;
  var btn=wrap.querySelector('.wpr-mobile-toggle');
  var ul=wrap.querySelector('.wpr-mobile-nav-menu');
  var src=document.querySelector('#masthead ul.wpr-nav-menu');
  if(src && ul){
    ul.innerHTML='';
    Array.prototype.forEach.call(src.children,function(li){
      var a=li.querySelector('a'); if(!a) return;
      var n=document.createElement('li');
      n.className='menu-item'+(li.classList.contains('gtx-nav-li')?' gtx-nav-li':'');
      var na=document.createElement('a');
      na.className='wpr-mobile-menu-item';
      na.setAttribute('href',a.getAttribute('href'));
      na.textContent=(a.textContent||'').trim();
      n.appendChild(na); ul.appendChild(n);
    });
  }
  if(!btn || !ul) return;
  btn.setAttribute('role','button');
  btn.setAttribute('tabindex','0');
  btn.setAttribute('aria-label','Menu');
  btn.setAttribute('aria-expanded','false');
  function toggle(){
    var open=ul.classList.toggle('gtx-open');
    btn.setAttribute('aria-expanded',open?'true':'false');
  }
  btn.addEventListener('click',function(e){e.preventDefault();toggle();});
  btn.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
  });
})();

/* v30: Free Demo nav item opens a small panel with the Audit page next to it */
(function(){
  var nav=document.querySelector('#masthead ul.wpr-nav-menu'); if(!nav) return;
  var a=nav.querySelector('a[href$="demo/index.html"]'); if(!a) return;
  var li=a.closest('li'); if(!li || li.classList.contains('gtx-dd')) return;
  var base=a.getAttribute('href').replace(/demo\/index\.html$/,'');
  li.classList.add('gtx-dd');
  var panel=document.createElement('div');
  panel.className='gtx-dd-panel gtx-dd-small';
  [['demo/index.html','Free demo','Reports on your data + a diagnostic of your history. Free, up to 2 months.'],
   ['audit/index.html','Inventory audit','On site with your management: the root causes behind out-of-stocks and overstock.']]
  .forEach(function(it){
    var l=document.createElement('a');
    l.href=base+it[0];
    l.innerHTML='<b>'+it[1]+'</b><span>'+it[2]+'</span>';
    panel.appendChild(l);
  });
  li.appendChild(panel);
})();

/* v38: Knowledge nav item opens a two-column panel — problem guides + the
   pharmacy long-read series, so the depth of the section is visible from the menu */
(function(){
  var nav=document.querySelector('#masthead ul.wpr-nav-menu'); if(!nav) return;
  var a=nav.querySelector('a[href$="knowledge/index.html"]'); if(!a) return;
  var li=a.closest('li'); if(!li || li.classList.contains('gtx-dd')) return;
  var base=a.getAttribute('href').replace(/index\.html$/,'');
  var root=base.replace(/knowledge\/$/,'');
  li.classList.add('gtx-dd');

  var GUIDES=[
    ['reduce-overstock.html','Reduce overstock'],
    ['prevent-stockouts.html','Prevent stockouts'],
    ['automate-manual-ordering.html','Automate manual ordering'],
    ['expiration-control.html','Expiration &amp; obsolete stock'],
    ['redistribution.html','Redistribution between locations'],
    ['promotion-stock-planning.html','Promotion stock planning'],
    ['glossary.html','Glossary of terms'],
    ['horizon-vs-alternatives.html','Horizon vs the alternatives']
  ];
  var SERIES=[
    ['availability-as-a-financial-metric.html','1 &#183; Availability is a financial number'],
    ['cost-of-high-availability.html','2 &#183; What high availability costs'],
    ['one-policy-hundred-pharmacies.html','3 &#183; A hundred pharmacies, one policy'],
    ['central-warehouse-less-stock.html','4 &#183; Adding a warehouse, less stock'],
    ['cheaper-purchase-price.html','5 &#183; Does buying cheaper earn more?']
  ];

  var panel=document.createElement('div');
  panel.className='gtx-dd-panel gtx-dd-know';

  var all=document.createElement('a');
  all.href=base+'index.html';
  all.className='gtx-dd-all';
  all.innerHTML='All knowledge &rarr;';
  panel.appendChild(all);

  function col(title,items,note){
    var d=document.createElement('div');
    var h=document.createElement('div');
    h.className='gtx-dd-h'; h.innerHTML=title; d.appendChild(h);
    items.forEach(function(it){
      var l=document.createElement('a');
      l.href=base+it[0]; l.innerHTML=it[1]; d.appendChild(l);
    });
    if(note){
      var n=document.createElement('a');
      n.href=root+'book/index.html'; n.className='gtx-dd-note';
      n.innerHTML=note; d.appendChild(n);
    }
    return d;
  }
  panel.appendChild(col('Problem guides',GUIDES));
  panel.appendChild(col('Pharmacy chains, stage by stage',SERIES,
    'From our founder&#8217;s book &rarr;'));
  li.appendChild(panel);
})();

/* v32: hero motion — autoplay muted, manual toggle, respects reduced motion */
(function(){
  var mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  document.querySelectorAll('.gtx-motion').forEach(function(fig){
    var v=fig.querySelector('video'), b=fig.querySelector('.gtx-motion-toggle');
    if(!v) return;
    function sync(){
      if(!b) return;
      var t=v.paused?'Play animation':'Pause animation';
      b.textContent=t; b.setAttribute('aria-label',t);
    }
    v.addEventListener('play',sync); v.addEventListener('pause',sync);
    if(b) b.addEventListener('click',function(){ if(v.paused){ v.play().catch(sync); } else { v.pause(); } });
    if(mq){ mq.addEventListener('change',function(){ if(mq.matches) v.pause(); }); }
    if(!(mq&&mq.matches)) v.play().catch(sync);
    sync();
  });
})();

/* v34: book self-check — works for any language, all labels come from the form */
(function(){
  var form=document.getElementById('gtx-selfcheck'); if(!form) return;
  var res=document.getElementById('gtx-sc-result');
  var D=JSON.parse(form.getAttribute('data-labels')||'{}');
  function pct(){
    var s={},n={},answered=0,qs=form.querySelectorAll('.gtx-q');
    qs.forEach(function(q){
      var d=q.getAttribute('data-dimension');
      s[d]=s[d]||0; n[d]=(n[d]||0)+1;
      var picked=q.querySelector('input:checked');
      if(picked){ s[d]+=Number(picked.value); answered++; }
    });
    if(answered<qs.length) return null;
    var out={}; for(var k in s) out[k]=Math.round(s[k]/(n[k]*2)*100);
    return out;
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var p=pct();
    if(!p){
      var w=document.getElementById('gtx-sc-warn');
      if(w){ w.style.display='block'; w.scrollIntoView({behavior:'smooth',block:'center'}); }
      return;
    }
    var wv=document.getElementById('gtx-sc-warn'); if(wv) wv.style.display='none';
    var weakest=Object.keys(p).sort(function(a,b){return p[a]-p[b];})[0];
    var f=document.getElementById('gtx-sc-focus'); if(f) f.textContent=(D[weakest]&&D[weakest].cap)||'';
    var parts=[];
    Object.keys(p).forEach(function(k){
      var el=document.getElementById('gtx-sc-'+k); if(el) el.textContent=p[k]+'%';
      var bar=document.getElementById('gtx-scbar-'+k); if(bar) bar.style.width=p[k]+'%';
      parts.push(((D[k]&&D[k].label)||k)+': '+p[k]+'%');
    });
    res.setAttribute('data-summary',(D._focus||'')+' '+((D[weakest]&&D[weakest].cap)||'')+'. '+parts.join('; ')+'.');
    res.classList.add('gtx-sc-show');
    res.scrollIntoView({behavior:'smooth',block:'center'});
  });
  var rst=document.getElementById('gtx-sc-reset');
  if(rst) rst.addEventListener('click',function(){
    form.reset(); res.classList.remove('gtx-sc-show');
    var w=document.getElementById('gtx-sc-warn'); if(w) w.style.display='none';
  });
  var cp=document.getElementById('gtx-sc-copy');
  if(cp) cp.addEventListener('click',function(){
    var t=res.getAttribute('data-summary')||'';
    var done=function(){ var o=cp.textContent; cp.textContent=D._copied||'Copied';
      setTimeout(function(){cp.textContent=o;},1600); };
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done,function(){alert(t);}); }
    else { alert(t); }
  });
})();
