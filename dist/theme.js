(function(){
  var K='ls-theme', T='ls-theme-at', TTL=4*60*60*1000, root=document.documentElement;
  function set(t){ root.setAttribute('data-theme',t);
    try{localStorage.setItem(K,t);localStorage.setItem(T,String(Date.now()));}catch(e){} }
  function byHour(){ var h=new Date().getHours(); return (h>=19||h<7) ? 'dark' : 'light'; }
  var saved=null, at=0;
  try{ saved=localStorage.getItem(K); at=parseInt(localStorage.getItem(T)||'0',10)||0; }catch(e){}
  if(saved && (Date.now()-at) > TTL){ saved=null; try{localStorage.removeItem(K);localStorage.removeItem(T);}catch(e){} }
  root.setAttribute('data-theme', saved || byHour());
  if(!window.__lsThemeWired){
    window.__lsThemeWired=1;
    document.addEventListener('click',function(e){
      var b=e.target.closest && e.target.closest('#ls-theme-toggle,#tmode,.ls-theme-toggle,.tmode');
      if(!b) return;
      set(root.getAttribute('data-theme')==='dark' ? 'light' : 'dark');
    });
  }
})();