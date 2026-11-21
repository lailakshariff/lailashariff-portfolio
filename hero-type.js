/* Types out the "Currently working on" line in the homepage header once, after the hero settles. */
(function(){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tries=0;
  function boot(){
    const p=document.querySelector('.ls-hero-current'); const co=p&&p.querySelector('.hx-co');
    if(!co){ if(tries++<80) setTimeout(boot,120); return; }
    if(p.dataset.typed) return; p.dataset.typed='1';
    const wrap=co.parentNode, lead=wrap.firstChild, img=co.querySelector('img');
    const leadTxt=lead.textContent, coNode=[...co.childNodes].find(n=>n.nodeType===3), coTxt=coNode.textContent;
    p.setAttribute('aria-label',(leadTxt+coTxt).trim());
    wrap.setAttribute('aria-hidden','true');
    lead.textContent=''; coNode.textContent=''; img.style.opacity='0'; img.style.transition='opacity .3s ease, transform .35s cubic-bezier(.3,1.4,.5,1)';
    const caret=document.createElement('span'); caret.className='hx-caret'; caret.setAttribute('aria-hidden','true');
    wrap.insertBefore(caret,co);
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    (async()=>{
      await sleep(1300);
      for(const ch of leadTxt){ lead.textContent+=ch; await sleep(ch===' '?26:34+Math.random()*30); }
      co.appendChild(caret);
      img.style.opacity='1'; await sleep(180);
      for(const ch of coTxt){ coNode.textContent+=ch; await sleep(34+Math.random()*30); }
      await sleep(2400); caret.classList.add('is-done');
    })();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
