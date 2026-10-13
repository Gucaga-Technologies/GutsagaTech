/* gutsaga.tech: on narrow screens, scale any book figure or table that is wider than
   the column down to fit (like a PDF viewer). Book text and layout are not changed. */
(function(){
  function fit(){
    var done=[];
    document.querySelectorAll('[data-gtx-fit]').forEach(function(e){e.style.zoom='';e.removeAttribute('data-gtx-fit');});
    var main=document.querySelector('main')||document.body;
    var all=main.querySelectorAll('*');
    for(var i=0;i<all.length;i++){
      var e=all[i], p=e.parentElement; if(!p) continue;
      var skip=false; for(var j=0;j<done.length;j++){ if(done[j].contains(e)){skip=true;break;} } if(skip) continue;
      var cs=getComputedStyle(p), avail=p.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
      var w=Math.max(e.offsetWidth||0, e.scrollWidth||0);
      if(avail>0 && w>avail+1 && getComputedStyle(e).position!=='absolute'){
        e.style.zoom=(avail/w).toFixed(4); e.setAttribute('data-gtx-fit','1'); done.push(e);
      }
    }
  }
  var t; function later(){clearTimeout(t);t=setTimeout(fit,120);}
  if(document.readyState==='complete') fit(); else window.addEventListener('load',fit);
  window.addEventListener('resize',later);
})();
