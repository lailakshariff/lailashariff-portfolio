(function(){
  var K='ls-theme', root=document.documentElement;
  function set(t){ root.setAttribute('data-theme',t); try{localStorage.setItem(K,t);}catch(e){} }
  var saved=null; try{saved=localStorage.getItem(K);}catch(e){}
  set(saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
  if(!window.__lsThemeWired){
    window.__lsThemeWired=1;
    document.addEventListener('click',function(e){
      var b=e.target.closest && e.target.closest('#ls-theme-toggle,#tmode,.ls-theme-toggle,.tmode');
      if(!b) return;
      set(root.getAttribute('data-theme')==='dark' ? 'light' : 'dark');
    });
  }
})();
