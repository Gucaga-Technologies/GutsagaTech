(function(){
  try {
    const ns='pharmabook.web.ru.v1.';
    const t=localStorage.getItem(ns+'theme');
    const f=localStorage.getItem(ns+'fontSize');
    if(t) document.documentElement.dataset.theme=t;
    if(f) document.documentElement.dataset.fontSize=f;
  } catch (_) {}
})();
