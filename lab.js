/* Playground — Made with AI. Ten experiments, each self-contained.
   Every effect is computed here rather than baked into an asset, so the
   grain, characters and swatches are genuinely derived from the photograph. */
(function () {
  var PAL = ['#8f4038', '#a8544a', '#f5efe3', '#7b8fae', '#657899', '#22201d'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function ready(el, fn) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fn(); io.disconnect(); } });
    }, { rootMargin: '120px' });
    io.observe(el);
  }
  function fit(c) {
    var r = c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.max(1, Math.round(r.width * d));
    c.height = Math.max(1, Math.round(r.height * d));
    return { w: r.width, h: r.height, d: d };
  }
  // luminance grid sampled off an offscreen copy of the photo.
  // The source is cropped to fill the grid's aspect, the way object-fit:cover
  // would, so a landscape photograph is not squeezed into a portrait tile.
  function sample(img, cols, rows) {
    var o = document.createElement('canvas');
    o.width = cols; o.height = rows;
    var x = o.getContext('2d');
    var sw = img.naturalWidth, sh = img.naturalHeight;
    var want = cols / rows, have = sw / sh, sx = 0, sy = 0;
    if (have > want) { var nw = sh * want; sx = (sw - nw) / 2; sw = nw; }
    else { var nh = sw / want; sy = (sh - nh) / 2; sh = nh; }
    x.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    var px = x.getImageData(0, 0, cols, rows).data, out = new Float32Array(cols * rows);
    for (var i = 0; i < cols * rows; i++) {
      out[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    }
    return out;
  }
  function loadImg(src, cb) {
    var im = new Image();
    im.onload = function () { cb(im); };
    im.src = src;
  }

  /* 01 — halftone dither. The same construction as the hero star: a fixed
     grid, dot radius driven by luminance, colour from the portfolio palette.
     The cursor changes the pitch, so you can see the image resolve. */
  function dither(box) {
    var c = box.querySelector('canvas');
    loadImg(box.dataset.src, function (img) {
      var pitch = 9, target = 9, m = fit(c), ctx = c.getContext('2d');
      var cache = {}, raf = 0;
      function grid(p) {
        var cols = Math.max(4, Math.round(m.w / p)), rows = Math.max(4, Math.round(m.h / p));
        var key = cols + 'x' + rows;
        if (!cache[key]) cache[key] = { cols: cols, rows: rows, lum: sample(img, cols, rows) };
        return cache[key];
      }
      function draw() {
        pitch += (target - pitch) * 0.16;
        var g = grid(pitch), p = m.w / g.cols, d = m.d;
        ctx.setTransform(d, 0, 0, d, 0, 0);
        ctx.clearRect(0, 0, m.w, m.h);
        for (var y = 0; y < g.rows; y++) {
          for (var x = 0; x < g.cols; x++) {
            var l = g.lum[y * g.cols + x];
            var r = (1 - l) * p * 0.62;
            if (r < 0.25) continue;
            ctx.fillStyle = l < 0.3 ? PAL[5] : l < 0.48 ? PAL[0] : l < 0.62 ? PAL[1] : l < 0.78 ? PAL[3] : PAL[2];
            ctx.beginPath();
            ctx.arc((x + 0.5) * p, (y + 0.5) * (m.h / g.rows), r, 0, 6.2832);
            ctx.fill();
          }
        }
        if (Math.abs(target - pitch) > 0.05) raf = requestAnimationFrame(draw); else raf = 0;
      }
      function kick() { if (!raf) raf = requestAnimationFrame(draw); }
      box.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect();
        target = 4 + (1 - (e.clientY - r.top) / r.height) * 16;   // coarse at the foot, fine at the head
        kick();
      });
      box.addEventListener('pointerleave', function () { target = 9; kick(); });
      if (TOUCH) autoDrive(box, function (t) { target = 11 + Math.sin(t * 0.55) * 6; kick(); });
      window.addEventListener('resize', function () { m = fit(c); cache = {}; kick(); }, { passive: true });
      draw();
    });
  }

  /* 02 — ascii. Dim blocks at rest; within the cursor's radius the cells
     resolve into characters from a density ramp. */
  function ascii(box) {
    var c = box.querySelector('canvas');
    loadImg(box.dataset.src, function (img) {
      var RAMP = '@%#*+=-:. ', cw = 7, m = fit(c), ctx = c.getContext('2d');
      var cols, rows, lum, mx = -999, my = -999, raf = 0;
      function build() {
        m = fit(c);
        cols = Math.max(8, Math.round(m.w / cw));
        rows = Math.max(6, Math.round(m.h / (cw * 1.62)));
        lum = sample(img, cols, rows);
      }
      function draw() {
        raf = 0;
        var pw = m.w / cols, ph = m.h / rows, d = m.d;
        ctx.setTransform(d, 0, 0, d, 0, 0);
        ctx.fillStyle = '#14140f';
        ctx.fillRect(0, 0, m.w, m.h);
        ctx.font = '500 ' + (ph * 0.94).toFixed(1) + 'px ui-monospace,SFMono-Regular,Menlo,monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            var px = (x + 0.5) * pw, py = (y + 0.5) * ph;
            var near = 1 - Math.min(1, Math.hypot(px - mx, py - my) / 118);
            var l = lum[y * cols + x];
            if (near > 0.02) {
              ctx.globalAlpha = 0.25 + near * 0.75;
              ctx.fillStyle = l > 0.7 ? '#f5efe3' : l > 0.45 ? '#c9b9a6' : '#a8544a';
              ctx.fillText(RAMP[Math.min(9, Math.floor((1 - l) * 9.99))], px, py);
            } else {
              ctx.globalAlpha = 0.16 + (1 - l) * 0.2;
              ctx.fillStyle = '#7b8fae';
              ctx.fillRect(px - 1, py - 1, 2, 2);
            }
          }
        }
        ctx.globalAlpha = 1;
      }
      function kick() { if (!raf) raf = requestAnimationFrame(draw); }
      box.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top; kick();
      });
      box.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
      if (TOUCH) autoDrive(box, function (t) {
        var r = box.getBoundingClientRect();
        mx = r.width * (0.5 + Math.sin(t * 0.5) * 0.34);
        my = r.height * (0.5 + Math.sin(t) * 0.3);
        kick();
      });
      window.addEventListener('resize', function () { build(); kick(); }, { passive: true });
      build(); draw();
    });
  }

  /* 03 — progressive blur. Stacked backdrop-filter layers, each masked to
     start higher up, so blur accumulates toward the top edge. */
  function blur(box) {
    for (var i = 1; i <= 4; i++) {
      var l = document.createElement('div');
      l.className = 'pb';
      l.style.setProperty('--b', (i * i * 1.6).toFixed(1) + 'px');
      l.style.setProperty('--s', (68 - i * 15) + '%');
      box.appendChild(l);
    }
    var cap = document.createElement('div');
    cap.className = 'cap';
    cap.textContent = box.dataset.cap || '';
    box.appendChild(cap);
    ready(box, function () { box.classList.add('on'); });
  }

  /* 04 — elastic type. Each glyph lifts and stretches by its distance from
     the cursor, so the line behaves like a struck string. */
  function elastic(box) {
    var line = box.querySelector('.line'), text = box.dataset.text || '';
    var glyphs = [];
    text.split('').forEach(function (ch) {
      var s = document.createElement('i');
      if (ch === ' ') { s.className = 'sp'; } else { s.textContent = ch; }
      line.appendChild(s);
      glyphs.push(s);
    });
    if (reduce) return;
    var raf = 0, mx = -999, my = -999;
    function draw() {
      raf = 0;
      var r = box.getBoundingClientRect();
      glyphs.forEach(function (g) {
        var b = g.getBoundingClientRect();
        var d = Math.hypot(b.left + b.width / 2 - r.left - mx, b.top + b.height / 2 - r.top - my);
        var k = Math.max(0, 1 - d / 150);
        g.style.transform = 'translateY(' + (-16 * k).toFixed(2) + 'px) scale(' + (1 + 0.34 * k).toFixed(3) + ')';
        g.style.color = k > 0.12 ? '#e8c9a6' : '#e8e4d5';
      });
    }
    box.addEventListener('pointermove', function (e) {
      var r = box.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(draw);
    });
    box.addEventListener('pointerleave', function () { mx = my = -999; if (!raf) raf = requestAnimationFrame(draw); });
    if (TOUCH) autoDrive(box, function (t) {
      var r = box.getBoundingClientRect();
      mx = r.width * (0.5 + Math.sin(t * 0.42) * 0.36);
      my = r.height * (0.5 + Math.cos(t * 0.31) * 0.3);
      if (!raf) raf = requestAnimationFrame(draw);
    });
  }

  /* 05 — cursor gallery. A photograph is dropped on the trail every time the
     pointer has travelled far enough, then decays. */
  function gallery(box) {
    var srcs = (box.dataset.srcs || '').split(',').filter(Boolean);
    if (!srcs.length) return;
    var i = 0, lx = null, ly = null, live = [];
    box.addEventListener('click', function (e) { lx = null; drop(e); });
    box.addEventListener('pointermove', drop);
    function drop(e) {
      var r = box.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      box.classList.add('moved');
      if (lx !== null && Math.hypot(x - lx, y - ly) < 66) return;
      lx = x; ly = y;
      var g = document.createElement('div');
      g.className = 'ghost';
      g.innerHTML = '<img src="' + srcs[i % srcs.length] + '" alt="">';
      i++;
      var rot = (Math.random() * 14 - 7).toFixed(1);
      g.style.left = '0px'; g.style.top = '0px';
      g.style.visibility = 'hidden';
      box.appendChild(g);
      // the ghost is centred on the pointer via negative margins, so a drop near
      // an edge would hang outside the box and be clipped to a half photo.
      // Measure the real box (it shrinks on mobile) and keep the card whole.
      var cs = getComputedStyle(g);
      var gw = g.offsetWidth, gh = g.offsetHeight;
      var ml = -parseFloat(cs.marginLeft) || 0, mt = -parseFloat(cs.marginTop) || 0;
      var rr = Math.abs(parseFloat(rot)) * Math.PI / 180;
      var pad = 6 + Math.round(Math.sin(rr) * (gw + gh) / 2);
      var minX = ml + pad, maxX = r.width - (gw - ml) - pad;
      var minY = mt + pad, maxY = r.height - (gh - mt) - pad;
      var px = maxX < minX ? r.width / 2 : Math.min(Math.max(x, minX), maxX);
      var py = maxY < minY ? r.height / 2 : Math.min(Math.max(y, minY), maxY);
      g.style.left = px + 'px'; g.style.top = py + 'px';
      g.style.transform = 'rotate(' + rot + 'deg) scale(.82)';
      g.style.opacity = '0';
      g.style.visibility = '';
      requestAnimationFrame(function () {
        g.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1),opacity .5s ease';
        g.style.transform = 'rotate(' + rot + 'deg) scale(1)';
        g.style.opacity = '1';
      });
      live.push(g);
      while (live.length > 5) {
        (function (old) {
          old.style.transition = 'transform .7s ease,opacity .7s ease';
          old.style.opacity = '0';
          old.style.transform = 'rotate(' + rot + 'deg) scale(.9)';
          setTimeout(function () { old.remove(); }, 720);
        })(live.shift());
      }
    }
  }

  /* 06 — glass pill. Real backdrop-filter over a photograph, with dock
     magnification driven by pointer distance. */
  function glass(box) {
    var apps = [].slice.call(box.querySelectorAll('.app'));
    var pill = box.querySelector('.pill');
    if (reduce) return;
    pill.addEventListener('pointermove', function (e) {
      apps.forEach(function (a) {
        var b = a.getBoundingClientRect();
        var d = Math.abs(b.left + b.width / 2 - e.clientX);
        var k = Math.max(0, 1 - d / 130);
        a.style.transform = 'translateY(' + (-13 * k).toFixed(1) + 'px) scale(' + (1 + 0.42 * k).toFixed(3) + ')';
      });
    });
    pill.addEventListener('pointerleave', function () {
      apps.forEach(function (a) { a.style.transform = ''; });
    });
  }

  /* 07 — stitch generator. Rows of crochet V-stitches, alternating direction
     the way real work turns at the end of each row. */
  function stitch(box) {
    var c = box.querySelector('canvas');
    var YARN = [['#c9686a', '#e8b7ac', '#f3e6d8'], ['#5f8b7d', '#a8c4ac', '#eee8d6'],
                ['#7b8fae', '#c3cfdd', '#f3efe6'], ['#c98a4b', '#e8c39a', '#f5ecdc']];
    function draw() {
      var m = fit(c), ctx = c.getContext('2d'), d = m.d;
      var yarn = YARN[Math.floor(Math.random() * YARN.length)];
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.fillStyle = '#efe6d6';
      ctx.fillRect(0, 0, m.w, m.h);
      var rh = 15 + Math.random() * 5, sw = 13 + Math.random() * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (var y = rh, row = 0; y < m.h + rh; y += rh, row++) {
        var off = (row % 2 ? sw / 2 : 0) + (Math.random() * 2 - 1);
        ctx.strokeStyle = yarn[row % yarn.length];
        ctx.lineWidth = 2.1;
        for (var x = -sw + off; x < m.w + sw; x += sw) {
          var j = (Math.random() * 1.6 - 0.8);
          ctx.beginPath();
          ctx.moveTo(x, y - rh * 0.72 + j);
          ctx.quadraticCurveTo(x + sw * 0.28, y - rh * 0.1, x + sw * 0.5, y + j);
          ctx.quadraticCurveTo(x + sw * 0.72, y - rh * 0.1, x + sw, y - rh * 0.72 + j);
          ctx.stroke();
          if (row % 3 === 1) {                       // the chain that closes a shell
            ctx.beginPath();
            ctx.arc(x + sw * 0.5, y - rh * 0.34, 1.5, 0, 6.2832);
            ctx.stroke();
          }
        }
      }
    }
    box.querySelector('.again').addEventListener('click', function (e) { e.stopPropagation(); draw(); });
    box.addEventListener('click', draw);
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  /* 08 — palette extractor. Buckets the photograph's pixels in RGB space and
     reports the five heaviest, so the swatches are measured, not chosen. */
  function palette(box) {
    var srcs = (box.dataset.srcs || '').split(',').filter(Boolean);
    var ph = box.querySelector('.ph'), sw = box.querySelector('.sw'), at = 0;
    function run(src) {
      loadImg(src, function (img) {
        var o = document.createElement('canvas'), n = 90;
        o.width = n; o.height = n;
        var x = o.getContext('2d');
        x.drawImage(img, 0, 0, n, n);
        var px = x.getImageData(0, 0, n, n).data, bins = {};
        for (var i = 0; i < n * n; i++) {
          var r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
          var key = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5);
          var e = bins[key] || (bins[key] = { n: 0, r: 0, g: 0, b: 0 });
          e.n++; e.r += r; e.g += g; e.b += b;
        }
        var top = Object.keys(bins).map(function (k) { return bins[k]; })
          .sort(function (a, b2) { return b2.n - a.n; }).slice(0, 5)
          .map(function (e) {
            return [Math.round(e.r / e.n), Math.round(e.g / e.n), Math.round(e.b / e.n)];
          })
          .sort(function (a, b2) {
            return (0.2126 * b2[0] + 0.7152 * b2[1] + 0.0722 * b2[2]) - (0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]);
          });
        ph.src = src;
        sw.innerHTML = top.map(function (c) {
          var hex = '#' + c.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
          var lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
          return '<div style="background:' + hex + ';color:' + (lum > 140 ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.72)') + '">' + hex.toUpperCase() + '</div>';
        }).join('');
      });
    }
    box.addEventListener('click', function () { at = (at + 1) % srcs.length; run(srcs[at]); });
    run(srcs[0]);
  }

  /* 09 — marker highlight, drawing itself once the tile is in view. */
  function marker(box) { ready(box, function () { box.classList.add('on'); }); }

  /* Touch devices have no hover, so the pointer-driven tiles would sit inert.
     They self-demonstrate instead: a slow synthetic sweep, running only while
     the tile is on screen. */
  var TOUCH = !(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  function autoDrive(box, step) {
    if (reduce) return;
    var on = false, t = 0;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { on = es[0].isIntersecting; }, { threshold: 0.25 }).observe(box);
    } else { on = true; }
    (function loop() {
      if (on) { t += 0.016; step(t); }
      requestAnimationFrame(loop);
    })();
  }

  /* 10 — type pairing. Two overlaid specimens crossfade, so you read the
     same words in Garamond and Satoshi at once. */
  function typeslider(box) {
    var g = box.querySelector('.g'), s = box.querySelector('.s'), input = box.querySelector('input');
    function apply() {
      var v = +input.value / 100;
      g.style.opacity = (1 - v).toFixed(3);
      s.style.opacity = v.toFixed(3);
      g.style.filter = 'blur(' + (v * 1.6).toFixed(2) + 'px)';
      s.style.filter = 'blur(' + ((1 - v) * 1.6).toFixed(2) + 'px)';
    }
    input.addEventListener('input', apply);

    // Drive the value from the pointer directly, so the thumb tracks a drag
    // anywhere along the row and keeps following once the pointer leaves it.
    function setFrom(e) {
      var r = input.getBoundingClientRect();
      if (!r.width) return;
      var pct = ((e.clientX - r.left) / r.width) * 100;
      input.value = String(Math.max(0, Math.min(100, Math.round(pct))));
      apply();
    }
    input.addEventListener('pointerdown', function (e) {
      input.setPointerCapture && input.setPointerCapture(e.pointerId);
      setFrom(e);
    });
    input.addEventListener('pointermove', function (e) {
      if (e.buttons) setFrom(e);
    });

    apply();
  }

  var WIRE = { dither: dither, ascii: ascii, blur: blur, elastic: elastic, gallery: gallery,
               glass: glass, stitch: stitch, palette: palette, marker: marker, type: typeslider };

  function boot() {
    var found = 0;
    Object.keys(WIRE).forEach(function (k) {
      var box = document.getElementById('lab-' + k);
      if (!box || box.dataset.wired) return;
      box.dataset.wired = '1';
      found++;
      try { WIRE[k](box); } catch (err) { /* one broken tile must not stop the rest */ }
    });
    return found > 0;
  }
  if (!boot()) {
    var t = setInterval(function () { if (boot()) clearInterval(t); }, 100);
    setTimeout(function () { clearInterval(t); }, 12000);
  }
})();

/* Travel log. A scroll-driven pile: the section is tall, its inner frame is
   sticky, and scroll position maps to a continuous index. Each photograph's
   distance from that index (u) places it on a diagonal path — u = 0 is centred
   and full size, u > 0 is still arriving from the lower right, u < 0 has left
   toward the upper left. Every photograph eases toward the target index at its
   own rate, so the pile trails the scroll and is dragged back when you reverse.

   The host re-renders this page and replaces nodes, so nothing is cached on
   the DOM: a watchdog re-adopts whatever .pfig nodes are current. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var STEP = 300;                                   // scroll px per photograph
  // Shorter travel on small screens: the same nine photographs shouldn't cost
  // a phone visitor two and a half screens more scrolling than a desktop one.
  function stepPx() { var w = window.innerWidth; return w < 560 ? 210 : w < 900 ? 255 : 300; }
  var figs = [], strip = null, stage = null, capEl = null, raf = 0, until = 0, active = -1;

  function adopt() {
    var el = document.getElementById('plog');
    if (!el) return;
    strip = el; stage = document.getElementById('plog-stage'); capEl = document.getElementById('plog-cap');
    if (reduce) { el.classList.add('plain'); return; }
    var nodes = [].slice.call(el.querySelectorAll('.pfig'));
    if (!nodes.length) return;
    if (figs.length === nodes.length && figs[0].el === nodes[0] && nodes[0].isConnected) return;
    // Seed every photograph at the CURRENT progress, so a re-render mid-pile
    // resumes where the visitor is instead of snapping back to the first one.
    var top0 = el.getBoundingClientRect().top,
        p0 = Math.max(0, Math.min(nodes.length - 1, -top0 / STEP));
    figs = nodes.map(function (n, i) {
      return {
        el: n, cur: p0,
        k: 0.085 + (i % 3) * 0.022,
        tilt: (i % 3 === 1 ? -1 : 1) * (1.1 + (i % 4) * 0.35)
      };
    });
    measure();
    wake(1200);
  }

  function measure() {
    if (!strip || reduce) return;
    STEP = stepPx();
    strip.style.height = (window.innerHeight + (figs.length - 1) * STEP) + 'px';
    // Publish the real photo height so the caption and hint sit just under it
    // at every breakpoint. The section is display:none when this first runs, so
    // offsetHeight is 0 — fall back to the intrinsic ratio against the CSS caps,
    // which is correct even while hidden.
    var img = figs.length && figs[0].el.querySelector('img');
    if (!img) return;
    var h = img.offsetHeight;
    if (!h && img.naturalWidth) {
      // Resolve the caps ourselves: a computed max-width can be a percentage
      // or 'none', which parseFloat turns into nonsense.
      var vw = strip.clientWidth || window.innerWidth, vh = window.innerHeight,
          maxW = vw < 560 ? vw * 0.88
               : vw <= 820 ? Math.min(vw * 0.84, 420)
               : vw <= 1024 ? Math.min(vw * 0.78, 560)
               : Math.min(vw * 0.66, 700),
          maxH = vw < 560 ? Math.min(vh * 0.38, 300)
               : vw <= 820 ? Math.min(vh * 0.42, 340)
               : vw <= 1024 ? Math.min(vh * 0.46, 420)
               : Math.min(vh * 0.5, 460);
      h = Math.min(maxH, maxW * img.naturalHeight / img.naturalWidth);
    }
    if (h) strip.style.setProperty('--pht', Math.round(h) + 'px');
    if (!img.complete) img.addEventListener('load', measure, { once: true });
  }

  function frame() {
    if (!strip || !figs.length) { raf = 0; return; }
    var vw = strip.clientWidth || window.innerWidth,
        vh = strip.clientHeight || window.innerHeight,
        top = strip.getBoundingClientRect().top,
        n = figs.length - 1,
        p = Math.max(0, Math.min(n, -top / STEP));

    // Arrivals swing in from low right on a long, steep path; departures only
    // tuck a short way to the left and fade. Distance is compressed (^0.7) so
    // far photographs nest behind the centre instead of marching off in a line.
    var narrow = vw < 560,
        inX = Math.min(vw * (narrow ? 0.44 : 0.30), 380),
        inY = Math.min(vh * (narrow ? 0.36 : 0.42), 400),
        outX = Math.min(vw * (narrow ? 0.24 : 0.15), 180),
        outY = Math.min(vh * 0.06, 54),
        busy = false, near = 1e9, idx = 0;

    for (var i = 0; i < figs.length; i++) {
      var f = figs[i];
      f.cur += (p - f.cur) * f.k;
      if (Math.abs(p - f.cur) > 0.0015) busy = true;
      var u = i - f.cur, au = Math.abs(u);
      if (au > 2.6) { if (f.el.style.opacity !== '0') f.el.style.opacity = '0'; continue; }

      var d = Math.pow(au, 0.7) * (u < 0 ? -1 : 1),
          sx = u > 0 ? inX : outX,
          sy = u > 0 ? inY : outY,
          s = u > 0 ? Math.max(0.24, 1 - au * 0.5) : Math.max(0.2, 1 - au * 0.6),
          o = au <= 0.9 ? 1 : Math.max(0, 1 - (au - 0.9) / (u > 0 ? 1.3 : 0.85)),
          rot = d * f.tilt;

      f.el.style.opacity = o.toFixed(3);
      f.el.style.zIndex = String(200 - Math.round(au * 40));
      f.el.style.transform = 'translate3d(calc(-50% + ' + (d * sx).toFixed(1) + 'px), calc(-50% + ' +
        (d * sy).toFixed(1) + 'px), 0) scale(' + s.toFixed(4) + ') rotate(' + rot.toFixed(2) + 'deg)';

      if (au < near) { near = au; idx = i; }
    }

    if (capEl) {
      if (idx !== active) {
        active = idx;
        capEl.textContent = figs[idx].el.getAttribute('data-cap') || '';
      }
      capEl.style.opacity = near < 0.42 ? '1' : '0';
    }
    raf = (busy || Date.now() < until) ? requestAnimationFrame(frame) : 0;
  }

  function wake(ms) {
    until = Date.now() + (ms || 700);
    if (!raf) raf = requestAnimationFrame(frame);
  }

  // The Playground shows one section at a time, so the pile is usually
  // display:none at init; a size change is the signal it became visible.
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { measure(); wake(900); });
    setTimeout(function () { if (stage) ro.observe(stage); }, 300);
  }
  window.addEventListener('scroll', function () { wake(700); }, { passive: true });
  window.addEventListener('resize', function () { measure(); wake(700); }, { passive: true });
  // rAF is paused in a hidden tab; repaint on return rather than sit on a stale frame.
  document.addEventListener('visibilitychange', function () { wake(900); });
  // Arrow keys step to the NEXT photograph rather than adding a raw 300px, so
  // repeated presses stay aligned. Active whenever the pinned frame covers the
  // middle of the viewport; capture phase so nothing else swallows the key.
  // The committed target survives the smooth scroll, so rapid taps queue up
  // instead of each re-reading a position that is still animating.
  var keyIdx = null, keyAt = 0;
  function stepTo(dir) {
    var docTop = strip.getBoundingClientRect().top + window.scrollY, now = Date.now();
    if (keyIdx === null || now - keyAt > 700) keyIdx = Math.round((window.scrollY - docTop) / STEP);
    var next = Math.max(0, Math.min(figs.length - 1, keyIdx + dir));
    if (next === keyIdx && (next === 0 || next === figs.length - 1)) return false;  // let the page scroll
    keyIdx = next; keyAt = now;
    window.scrollTo({ top: docTop + keyIdx * STEP, behavior: 'smooth' });
    return true;
  }
  document.addEventListener('keydown', function (e) {
    if (!strip || reduce || !figs.length) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    var t = e.target;
    if (t && t.closest && t.closest('input,textarea,select,[contenteditable]')) return;
    var b = strip.getBoundingClientRect(), mid = window.innerHeight / 2;
    if (b.top > mid || b.bottom < mid) return;
    if (stepTo(dir)) e.preventDefault();
  }, true);
  adopt();
  setInterval(adopt, 600);
})();
