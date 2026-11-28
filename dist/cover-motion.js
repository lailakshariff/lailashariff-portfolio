/* Scripted, looping product moments for the four Selected Work covers. Calm keynote pacing: one idea per beat, eased moves, generous holds. Pauses off-screen and in background tabs. */
(function(){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const EASE='cubic-bezier(.45,0,.2,1)', OUT='cubic-bezier(.2,.7,.2,1)';
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const ARROW='<svg viewBox="0 0 22 28"><path d="M2 2v20.5l5.4-5.2 3.6 8.4 3.6-1.6-3.5-8.2H18L2 2z" fill="#fff" stroke="#1d1d1f" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  function Stage(card){
    const art=card.querySelector('.wcard-art');
    const st={card,art,vis:false,anims:[]};
    st.gate=async()=>{ while(!st.vis||document.hidden) await sleep(250); };
    st.hold=async ms=>{ const end=performance.now()+ms; while(performance.now()<end){ await st.gate(); await sleep(Math.min(120,end-performance.now())); } };
    st.pt=(el,fx=.5,fy=.5)=>{ const a=art.getBoundingClientRect(), r=el.getBoundingClientRect(); return {x:r.left-a.left+r.width*fx, y:r.top-a.top+r.height*fy}; };
    st.a=(el,frames,opts)=>{ const an=el.animate(frames,{fill:'forwards',easing:OUT,...opts}); st.anims.push(an); return an.finished.catch(()=>{}); };
    st.pointer=kind=>{
      const p=document.createElement('div');
      p.className='cm-pointer '+(kind==='tap'?'cm-tap':'cm-arrow');
      if(kind!=='tap') p.innerHTML=ARROW;
      p.setAttribute('aria-hidden','true');
      art.appendChild(p); st.p=p; st.pos={x:0,y:0}; return p;
    };
    st.place=(x,y)=>{ st.pos={x,y}; st.p.style.transform=`translate(${x}px,${y}px)`; };
    st.move=async(to,ms)=>{
      await st.gate();
      const from=st.pos, d=Math.hypot(to.x-from.x,to.y-from.y);
      const dur=ms||Math.max(520,Math.min(1100,d*2.2));
      const mid={x:(from.x+to.x)/2+(to.y-from.y)*.08, y:(from.y+to.y)/2-(to.x-from.x)*.08};
      await st.a(st.p,[{transform:`translate(${from.x}px,${from.y}px)`},{transform:`translate(${mid.x}px,${mid.y}px)`,offset:.5},{transform:`translate(${to.x}px,${to.y}px)`}],{duration:dur,easing:EASE});
      st.place(to.x,to.y);
    };
    st.show=on=>st.a(st.p,[{opacity:on?0:1},{opacity:on?1:0}],{duration:420});
    st.click=async color=>{
      await st.gate();
      const {x,y}=st.pos;
      const base=`translate(${x}px,${y}px)`;
      st.a(st.p,[{transform:base},{transform:base+' scale(.84)'},{transform:base}],{duration:260,easing:'ease-out'});
      const r=document.createElement('span'); r.className='cm-ripple'; r.style.setProperty('--cm-rip',color||'rgba(0,0,0,.3)');
      art.appendChild(r);
      r.animate([{transform:`translate(${x}px,${y}px) scale(.3)`,opacity:.9},{transform:`translate(${x}px,${y}px) scale(1.5)`,opacity:0}],{duration:620,easing:OUT}).finished.then(()=>r.remove(),()=>r.remove());
      await sleep(220);
    };
    st.reset=()=>{ st.anims.forEach(a=>{try{a.cancel()}catch(e){}}); st.anims=[]; };
    new IntersectionObserver(es=>es.forEach(e=>st.vis=e.isIntersecting),{threshold:.25}).observe(card);
    return st;
  }
  async function run(st,scene){ while(!st.art.clientWidth) await sleep(150); for(;;){ try{ await scene(st); }catch(e){ console.warn('cover motion',e); await sleep(2000); } } }

  // Purple Fabric: open a draft agent, promote it to live, switch tabs and back.
  async function pf(st){
    const cards=st.card.querySelectorAll('.pfui-card'), seg=st.card.querySelectorAll('.pfui-seg i'), grid=st.card.querySelector('.pfui-grid');
    const ar=st.art.getBoundingClientRect();
    const target=[...cards].find(c=>{const b=c.querySelector('.pfui-chip').getBoundingClientRect();return b.bottom<ar.bottom-6&&b.right<ar.right-6})||cards[0], chip=target.querySelector('.pfui-chip');
    const orig={cls:chip.className,txt:chip.textContent};
    chip.className='pfui-chip c-draft'; chip.textContent='Draft';
    const W=st.art.clientWidth, H=st.art.clientHeight;
    st.place(W*.86,H*1.08);
    await st.hold(700); await st.show(true);
    await st.move(st.pt(target,.62,.42));    target.classList.add('cm-sel'); await st.hold(450);
    await st.click('rgba(78,9,115,.45)');
    const swap=async(cls,txt)=>{ await st.a(chip,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-.3em)'}],{duration:180}); chip.className='pfui-chip '+cls; chip.textContent=txt; await st.a(chip,[{opacity:0,transform:'translateY(.3em)'},{opacity:1,transform:'none'}],{duration:260}); };
    await st.hold(300); await swap('c-rev','In review');
    await st.hold(1100); await swap('c-live','Live');
    await st.hold(1300);
    target.classList.remove('cm-sel');
    await st.move(st.pt(seg[1]));
    await st.click('rgba(78,9,115,.45)');
    seg[0].classList.remove('is-on'); seg[1].classList.add('is-on');
    grid.style.opacity='.35'; grid.style.transform='translateY(.4em)';
    await st.hold(1200);
    await st.move(st.pt(seg[0]),560);
    await st.click('rgba(78,9,115,.45)');
    seg[1].classList.remove('is-on'); seg[0].classList.add('is-on');
    grid.style.opacity=''; grid.style.transform='';
    await st.hold(900);
    await st.move({x:W*.9,y:H*1.1},900); await st.show(false);
    chip.className='pfui-chip c-draft'; chip.textContent='Draft';
    st.reset(); st.place(W*.86,H*1.08);
    await st.hold(1600);
  }

  // SayPlay: tap a symbol, the sentence appears and is spoken.
  async function sp(st){
    const tiles=[...st.card.querySelectorAll('.sqt')], words=[...st.card.querySelectorAll('.sqw')], ring=st.card.querySelector('.sqr');
    const W=st.art.clientWidth, H=st.art.clientHeight;
    st.place(W*.94,H*1.1);
    await st.hold(500); await st.show(true);
    for(let i=0;i<tiles.length;i++){
      await st.move(st.pt(tiles[i],.5,.55));
      await st.click('rgba(49,112,107,.5)');
      tiles[i].classList.add('cm-act');
      const w=words[i], lead=w.querySelector('span'), em=w.querySelector('em');
      st.a(w,[{opacity:0},{opacity:1}],{duration:300});
      st.a(lead,[{opacity:0,transform:'translateY(1.4cqh)'},{opacity:1,transform:'none'}],{duration:520});
      st.a(em,[{opacity:0,transform:'translateY(2.4cqh)'},{opacity:1,transform:'none'}],{duration:620,delay:160});
      await st.hold(520);
      st.a(ring,[{opacity:.9,transform:'scale(1)'},{opacity:0,transform:'scale(1.7)'}],{duration:1100,iterations:2});
      await st.hold(1900);
      tiles[i].classList.remove('cm-act');
      await st.a(w,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-1.6cqh)'}],{duration:360});
      st.reset(); w.style.opacity='0';
      await st.hold(220);
    }
    await st.move({x:W*.96,y:H*1.12},800); await st.show(false); st.reset();
    await st.hold(1200);
  }

  // NutriHealth: the phones step past, one at a time, and the centred screen gets a tap.
  async function nh(st){
    const win=st.card.querySelector('.nhwin'), rail=st.card.querySelector('.nhrail'), kids=[...rail.children];
    if(kids.length<4||!kids[0].getBoundingClientRect().width) return st.hold(1000);
    const off=i=>{ const w=win.getBoundingClientRect(), k=kids[i].getBoundingClientRect(), r=rail.getBoundingClientRect(); return (k.left-r.left)+k.width/2-w.width/2; };
    let x=off(1); rail.style.transform=`translateX(${-x}px)`;
    st.place(st.art.clientWidth*.5,st.art.clientHeight*1.15);
    const half=kids.length/2;
    for(let i=1;i<=half+1;i++){
      kids.forEach(k=>k.classList.remove('cm-focus')); kids[i].classList.add('cm-focus');
      await st.hold(500);
      if(i<=half){
        await st.show(true);
        await st.move(st.pt(kids[i],.5,.62),720); await st.click('rgba(28,62,42,.4)');
        await st.hold(1400);
        await st.show(false); st.place(st.art.clientWidth*.5,st.art.clientHeight*1.15);
        const nx=off(i+1);
        await st.a(rail,[{transform:`translateX(${-x}px)`},{transform:`translateX(${-nx}px)`}],{duration:1150,easing:EASE});
        x=nx; rail.style.transform=`translateX(${-x}px)`; st.reset();
      }
    }
    kids.forEach(k=>k.classList.remove('cm-focus'));
    x=off(1); rail.style.transform=`translateX(${-x}px)`; kids[1].classList.add('cm-focus');
  }

  // Spotify Chapters: the month's albums deal in, play through, and one is picked as the chapter.
  async function smr(st){
    const imgs=[...st.card.querySelectorAll('.smrwstrip img')], kick=st.card.querySelector('.smrwkick');
    const W=st.art.clientWidth, H=st.art.clientHeight;
    st.place(W*.5,H*1.15);
    imgs.forEach(im=>im.style.opacity='0');
    await st.hold(500);
    for(let i=0;i<imgs.length;i++){ st.a(imgs[i],[{opacity:0,transform:'translateY(4cqh) scale(.92)'},{opacity:1,transform:'none'}],{duration:700,delay:i*110}); }
    await st.hold(700+imgs.length*110+400);
    imgs.forEach(im=>im.style.opacity='');
    st.reset();
    for(let i=0;i<imgs.length;i++){
      await st.a(imgs[i],[{transform:'none'},{transform:'translateY(-1.6cqh) scale(1.05)'},{transform:'none'}],{duration:620,easing:EASE});
    }
    await st.hold(300);
    await st.show(true);
    await st.move(st.pt(imgs[2],.5,.55),900); await st.click('rgba(30,215,96,.6)');
    imgs.forEach((im,i)=>im.classList.toggle(i===2?'cm-pick':'cm-dim',true));
    st.a(kick,[{opacity:1},{opacity:.35},{opacity:1}],{duration:900});
    await st.hold(600);
    await st.move({x:W*.5,y:H*1.15},900); await st.show(false);
    await st.hold(1600);
    imgs.forEach(im=>im.classList.remove('cm-pick','cm-dim'));
    await st.hold(700);
    for(let i=imgs.length-1;i>=0;i--) st.a(imgs[i],[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(2cqh) scale(.96)'}],{duration:420,delay:(imgs.length-1-i)*60});
    await st.hold(800); st.reset(); imgs.forEach(im=>im.style.opacity='0');
    await st.hold(400);
  }

  let tries=0;

  // Purple Fabric, single-object cover: one agent card goes Draft, In review, Live.
  async function pf2(st){
    const card=st.card.querySelector('.pf2-card'), chip=card.querySelector('.pf2-chip');
    const W=st.art.clientWidth, H=st.art.clientHeight;
    const set=async(cls,txt)=>{ await st.a(chip,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-30%)'}],{duration:200}); chip.className='pf2-chip '+cls; chip.textContent=txt; await st.a(chip,[{opacity:0,transform:'translateY(30%)'},{opacity:1,transform:'none'}],{duration:320}); };
    st.place(W*.82,H*1.1);
    await st.hold(900); await st.show(true);
    await st.move(st.pt(chip,.7,.6),1000);
    card.classList.add('is-sel'); await st.hold(350);
    await st.click('rgba(78,9,115,.4)');
    await st.hold(200); await set('is-rev','In review');
    await st.hold(1300); await set('is-live','Live');
    await st.hold(500);
    await st.move({x:W*.84,y:H*1.12},950); await st.show(false);
    await st.hold(2200);
    card.classList.remove('is-sel');
    await st.hold(600);
    await set('is-draft','Draft');
    st.reset(); st.place(W*.82,H*1.1);
    await st.hold(1200);
  }


  // SayPlay, single-object cover: a large sentence and one symbol; tapping the symbol speaks the next sentence.
  let sp2i=1;
  async function sp2(st){
    const tile=st.card.querySelector('.sp2-tile'), img=tile.querySelector('img'), fox=st.card.querySelector('.sp2-fox'), lead=st.card.querySelector('.sp2-lead'), word=st.card.querySelector('.sp2-word'), wave=st.card.querySelector('.sp2-wave');
    const set=[['assets/sp-sy2-good.png','I feel','good'],['assets/sp-sy2-banana.png','I want a','banana'],['assets/sp-sy2-swim.png','Let\u2019s go','swim']];
    const [src,l,w]=set[sp2i++%set.length];
    const W=st.art.clientWidth, H=st.art.clientHeight;
    st.place(W*.92,H*1.12);
    await st.hold(1400); await st.show(true);
    await st.move(st.pt(tile,.58,.62),1000);
    await st.click('rgba(47,111,105,.35)');
    st.a(tile,[{transform:'none'},{transform:'scale(.96)'},{transform:'none'}],{duration:420,easing:'cubic-bezier(.3,1.3,.5,1)'});
    st.move({x:W*.92,y:H*1.12},950).then(()=>st.show(false));
    await Promise.all([
      st.a(img,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.9)'}],{duration:240}),
      st.a(lead,[{opacity:1},{opacity:0}],{duration:240}),
      st.a(word,[{transform:'none'},{transform:'translateY(-110%)'}],{duration:320,easing:'cubic-bezier(.5,0,.75,0)'})
    ]);
    img.src=src; lead.textContent=l; word.textContent=w;
    st.a(img,[{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'none'}],{duration:420});
    st.a(lead,[{opacity:0},{opacity:1}],{duration:420});
    await st.a(word,[{transform:'translateY(110%)'},{transform:'none'}],{duration:560,easing:'cubic-bezier(.2,.7,.2,1)'});
    wave.classList.add('is-on');
    st.a(fox,[{transform:'none'},{transform:'translateY(-22%) rotate(-4deg)'},{transform:'translateY(-22%) rotate(-4deg)',offset:.75},{transform:'none'}],{duration:2000,easing:'cubic-bezier(.45,0,.2,1)'});
    await st.hold(1700);
    wave.classList.remove('is-on');
    st.reset();
    await st.hold(1600);
  }

  // SayPlay, device cover: the live v2 prototype steps through four states from the case study deck.
  async function sp3(st){
    const scr=st.card.querySelector('.sp3-scr'), frames=[...scr.querySelectorAll('iframe')];
    const fit=()=>{ const k=scr.clientWidth/1180; frames.forEach(f=>f.style.transform='scale('+k+')'); };
    if(!sp3.ro){ sp3.ro=new ResizeObserver(fit); sp3.ro.observe(scr); } fit();
    const W=st.art.clientWidth, H=st.art.clientHeight, home={x:W*.88,y:H*1.12};
    const go=i=>frames.forEach((f,k)=>f.classList.toggle('is-on',k===i));
    const step=async(fx,fy,i)=>{ await st.show(true); await st.move(st.pt(scr,fx,fy),950); await st.click('rgba(47,111,105,.4)'); go(i); await st.hold(350); await st.move(home,900); await st.show(false); await st.hold(2300); };
    st.place(home.x,home.y);
    await st.hold(2200);
    await step(.9,.12,1);
    await step(.07,.42,2);
    await step(.07,.56,3);
    go(0); st.reset(); st.place(home.x,home.y);
    await st.hold(600);
  }

  // Purple Fabric, laptop cover: the redesigned homepage scrolls slowly, pausing on each section.
  async function pf3(st){
    if(st.p) st.p.style.display='none';
    const scr=st.card.querySelector('.pf3-scr'), page=st.card.querySelector('.pf3-page'), imgs=[...page.querySelectorAll('img')];
    await Promise.all(imgs.map(im=>im.complete?0:new Promise(r=>{im.onload=im.onerror=r})));
    const H=scr.clientHeight, max=Math.max(0,page.scrollHeight-H);
    const stops=[0,...imgs.slice(1).map(im=>Math.min(max,im.offsetTop-H*.04)),max].filter((v,k,arr)=>k===0||v>arr[k-1]+4);
    let y=0;
    const to=async(ny,ms)=>{ await st.gate(); await st.a(page,[{transform:'translateY('+(-y)+'px)'},{transform:'translateY('+(-ny)+'px)'}],{duration:ms,easing:'cubic-bezier(.45,0,.25,1)'}); y=ny; page.style.transform='translateY('+(-y)+'px)'; };
    page.style.transform='translateY(0)';
    await st.hold(2200);
    for(const sy of stops.slice(1)){ await to(sy,Math.max(1600,Math.abs(sy-y)*9)); await st.hold(2000); }
    await to(0,1800); st.reset(); page.style.transform='translateY(0)';
    await st.hold(1400);
  }

  // Purple Fabric, orbit cover: CSS drives the orbit; this only pauses it off-screen.
  async function pfo(st){
    if(st.p) st.p.style.display='none';
    const orb=st.card.querySelector('.pf3-orb');
    orb.classList.toggle('is-paused',!st.vis||document.hidden);
    await sleep(300);
  }
  // NutriHealth, phone cover: the three prototype recordings play in turn, paused off-screen.
  async function nh3(st){
    if(st.p) st.p.style.display='none';
    const vids=[...st.card.querySelectorAll('.nh3-scr video')];
    for(let i=0;i<vids.length;i++){
      const v=vids[i];
      vids.forEach((x,k)=>x.classList.toggle('is-on',k===i));
      try{ v.currentTime=0; }catch(e){}
      await st.gate();
      try{ await v.play(); }catch(e){ await st.hold(4000); continue; }
      while(!v.ended){
        if(!st.vis||document.hidden){ v.pause(); await st.gate(); try{ await v.play(); }catch(e){} }
        await sleep(200);
      }
      await st.hold(700);
    }
  }
  // Spotify Chapters, laptop cover: a slow push in on the "Your August is ready" banner, then back out.
  async function smr3(st){
    if(st.p) st.p.style.display='none';
    const img=st.card.querySelector('.smr3-scr img');
    const z=[{transform:'scale(1) translate(0,0)'},{transform:'scale(1.55) translate(4%,14%)'}];
    await st.hold(1800);
    await st.a(img,z,{duration:4200,easing:'cubic-bezier(.45,0,.25,1)'});
    await st.hold(2600);
    await st.a(img,[z[1],z[0]],{duration:3600,easing:'cubic-bezier(.45,0,.25,1)'});
    st.reset();
    await st.hold(1400);
  }
  function boot(){
    if(!document.querySelector('.wcard .wcard-art')){ if(tries++<80) setTimeout(boot,150); return; }
    [['.wc-pf',document.querySelector('.pf3-orb')?pfo:document.querySelector('.pf3 .pfui')?pf:document.querySelector('.pf3')?pf3:(document.querySelector('.pf2')?pf2:pf),'arrow'],['.wc-sp',document.querySelector('.sp3')?sp3:(document.querySelector('.sp2')?sp2:sp),'tap'],['.wc-nh',nh,'tap'],['.wc-smr',smr,'tap']].forEach(([sel,scene,kind])=>{
      const card=document.querySelector(sel); if(!card||!card.querySelector('.wcard-art')||card.classList.contains('cm-on')) return;
      card.classList.add('cm-on');
      const st=Stage(card); st.pointer(kind);
      setTimeout(()=>run(st,scene), sel==='.wc-nh'?1200:300);
    });
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
