/* Cursor trail: small outline circles, dots and asterisks drop behind the pointer, drift and fade. Desktop pointers only. */
(function(){
  if (!window.matchMedia || !matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv=document.createElement('canvas');
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9998';
  const ctx=cv.getContext('2d');
  let W=0,H=0,dpr=1;
  const fit=()=>{ dpr=Math.min(window.devicePixelRatio||1,2); W=innerWidth; H=innerHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); };
  const STAR=['#a8544a','#7b8fae','#c49a5a','#22201d'], STAR_D=['#d98d7e','#93aecb','#dcae60','#efe4c9'];
  const pal=()=>document.documentElement.getAttribute('data-theme')==='dark'?STAR_D:STAR;
  const P=[]; let lx=null, ly=null, acc=0, raf=0, cols=pal();
  const KINDS=['ring','ring','dot','dot','dot','ast','ast6'];
  function spawn(x,y){
    const k=KINDS[(Math.random()*KINDS.length)|0];
    P.push({x:x+(Math.random()-.5)*14,y:y+(Math.random()-.5)*14,vx:(Math.random()-.5)*.18,vy:.12+Math.random()*.22,k,
      s:k==='dot'?1+Math.random()*1.2:k==='ring'?2.6+Math.random()*2.4:3.4+Math.random()*2.6,c:cols[(Math.random()*cols.length)|0],r:Math.random()*Math.PI,life:0,max:1000+Math.random()*700});
    if(P.length>50) P.shift();
  }
  function draw(p,a){
    ctx.globalAlpha=a; ctx.strokeStyle=p.c; ctx.fillStyle=p.c; ctx.lineWidth=1;
    if(p.k==='dot'){ ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,7); ctx.fill(); return; }
    if(p.k==='ring'){ ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,7); ctx.stroke(); return; }
    const n=p.k==='ast'?3:4; ctx.beginPath();
    for(let i=0;i<n;i++){ const t=p.r+i*Math.PI/n, dx=Math.cos(t)*p.s, dy=Math.sin(t)*p.s; ctx.moveTo(p.x-dx,p.y-dy); ctx.lineTo(p.x+dx,p.y+dy); }
    ctx.stroke();
  }
  let last=performance.now();
  function tick(now){
    const dt=Math.min(50,now-last); last=now;
    ctx.clearRect(0,0,W,H);
    for(let i=P.length-1;i>=0;i--){
      const p=P[i]; p.life+=dt; if(p.life>=p.max){ P.splice(i,1); continue; }
      p.x+=p.vx*dt*.06; p.y+=p.vy*dt*.06; p.r+=.0006*dt;
      const t=p.life/p.max, a=(t<.12?t/.12:1-(t-.12)/.88)*.42;
      draw(p,a);
    }
    ctx.globalAlpha=1;
    raf=P.length?requestAnimationFrame(tick):0;
  }
  function onMove(e){
    if(lx===null){ lx=e.clientX; ly=e.clientY; return; }
    const d=Math.hypot(e.clientX-lx,e.clientY-ly); acc+=d; lx=e.clientX; ly=e.clientY;
    while(acc>46){ acc-=46; spawn(lx,ly); }
    if(!raf){ last=performance.now(); raf=requestAnimationFrame(tick); }
  }
  function boot(){
    fit(); document.body.appendChild(cv);
    addEventListener('resize',fit);
    addEventListener('mousemove',onMove,{passive:true});
    document.addEventListener('mouseleave',()=>{ lx=null; });
    new MutationObserver(()=>{ cols=pal(); }).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
