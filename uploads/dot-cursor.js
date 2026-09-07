/* Five-point star cursor. Fine pointers only; leaves touch devices alone. */
(function () {
  if (window.__dotCursor) return;
  window.__dotCursor = true;
  if (!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  var W = 26, H = 26;
  var STAR = "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%3E%3Cpath%20d='M12%201.2%20L15.1%209.1%20L23.4%209.4%20L16.9%2014.5%20L19.3%2022.5%20L12%2017.8%20L4.7%2022.5%20L7.1%2014.5%20L0.6%209.4%20L8.9%209.1%20Z'%20fill='black'/%3E%3C/svg%3E\")";
  var TAG = document.querySelector('script[src*="dot-cursor.js"]');
  var COLOR = (TAG && TAG.getAttribute('data-dot-color')) || '#141311';
  var dot, tx = -100, ty = -100, x = -100, y = -100, scale = 1, cur = 1, raf = 0;

  function build() {
    if (dot || !document.body) return;
    dot = document.createElement('div');
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText =
      'position:fixed;left:0;top:0;width:' + W + 'px;height:' + H + 'px;' +
      'margin:' + (-H / 2) + 'px 0 0 ' + (-W / 2) + 'px;' +
      'background:#a8544a;pointer-events:none;z-index:2147483647;' +
      '-webkit-mask-image:' + STAR + ';mask-image:' + STAR + ';' +
      '-webkit-mask-size:100% 100%;mask-size:100% 100%;' +
      '-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;' +
      'opacity:0;transition:opacity .25s ease;will-change:transform;' +
      'transform:translate3d(-100px,-100px,0)';
    document.body.appendChild(dot);

    var s = document.createElement('style');
    s.textContent = 'html,body,a,button,[role="button"],.pile-card,input,textarea,select,label{cursor:none !important}';
    document.head.appendChild(s);
  }

  /* --- shooting-star trail: hero section only, deliberately sparse --- */
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* weighted palette from the existing artwork: rust, slate, charcoal, cream (rare) */
  var TRAIL_COLORS = ['#a8544a', '#a8544a', '#5b7794', '#5b7794', '#8f4038', '#22201d'];
  var lastSpawn = { x: -999, y: -999 }, live = 0, hero = null, heroChecked = false;

  function heroEl() {
    if (!heroChecked) { hero = document.querySelector('.ls-hero'); heroChecked = !!hero; }
    return hero;
  }

  /* true only while the pointer is inside the hero's visible area */
  function inHero(cx, cy) {
    var h = heroEl();
    if (!h) return false;
    var r = h.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= innerHeight) return false;
    return cy >= Math.max(0, r.top) && cy <= Math.min(innerHeight, r.bottom) && cx >= r.left && cx <= r.right;
  }

  function overType(el) {
    return !!(el && el.closest && el.closest('.ls-hero-h1,.ls-hero-sub,.ls-hero-current,.ls-hero-nav'));
  }

  function spawn(cx, cy, vx, vy, quiet) {
    if (live >= 9) return;
    var big = Math.random() < 0.2;
    var size = quiet ? 5 + Math.random() * 3 : (big ? 11 + Math.random() * 3 : 6.5 + Math.random() * 4.5);
    var col = TRAIL_COLORS[(Math.random() * TRAIL_COLORS.length) | 0];
    
    var mag = Math.hypot(vx, vy) || 1;
    var reach = quiet ? 8 + Math.random() * 10 : 12 + Math.random() * 16;
    var dx = -(vx / mag) * reach + (Math.random() - 0.5) * 11;
    var dy = -(vy / mag) * reach + 6 + Math.random() * 13;
    var el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    var op = quiet ? 0.5 : 0.82;
    el.style.cssText =
      'position:fixed;left:' + cx.toFixed(1) + 'px;top:' + cy.toFixed(1) + 'px;' +
      'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
      'margin:' + (-size / 2).toFixed(1) + 'px 0 0 ' + (-size / 2).toFixed(1) + 'px;' +
      'background:' + col + ';pointer-events:none;z-index:2147483646;opacity:' + op + ';' +
      '-webkit-mask-image:' + STAR + ';mask-image:' + STAR + ';' +
      '-webkit-mask-size:100% 100%;mask-size:100% 100%;' +
      '-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;' +
      'will-change:transform,opacity';
    document.body.appendChild(el);
    live++;
    var dur = quiet ? 220 + Math.random() * 130 : 330 + Math.random() * 210;
    var rot = (Math.random() - 0.5) * 150;
    var done = function () { if (el.parentNode) el.remove(); live--; };
    if (el.animate) {
      var a = el.animate([
        { transform: 'translate3d(0,0,0) scale(1) rotate(0deg)', opacity: op },
        { transform: 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(.3) rotate(' + rot.toFixed(0) + 'deg)', opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(.25,.6,.3,1)', fill: 'forwards' });
      a.onfinish = done;
    } else {
      setTimeout(done, dur);
    }
  }

  function maybeTrail(target, cx, cy, vx, vy) {
    if (REDUCED || !inHero(cx, cy)) return;
    var quiet = overType(target);
    var gap = quiet ? 70 : 44;                       // px of travel between stars
    if (Math.hypot(cx - lastSpawn.x, cy - lastSpawn.y) < gap) return;
    lastSpawn.x = cx; lastSpawn.y = cy;
    if (quiet && Math.random() < 0.55) return;       // thin out over the headline
    spawn(cx, cy, vx, vy, quiet);
  }

  /* star goes black while the pointer is on nav text */
  var STAR_BASE = '#a8544a', navBlack = false;

  function overNavText(el) {
    return !!(el && el.closest && el.closest('.pnav a,.pnav button,.pnav-wordmark,.ls-hero-nav a,.ls-hero-nav button'));
  }

  function navTint(el) {
    if (!dot) return;
    var want = overNavText(el);
    if (want === navBlack) return;
    navBlack = want;
    var over = document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000';
    dot.style.background = want ? over : STAR_BASE;
  }

  function hoverable(el) {
    return !!(el && el.closest && el.closest('a,button,[role="button"],.pile-card,input,textarea,select,summary'));
  }

  function tick() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    cur += (scale - cur) * 0.16;
    if (dot) dot.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + cur.toFixed(3) + ')';
    raf = requestAnimationFrame(tick);
  }

  /* --- adaptive contrast: keep the star visible on light artwork in dark mode --- */
  var DARK_INK = '#141311', LIGHT_INK = '#f4f1ea';
  var imgCache = new WeakMap(), lastPaint = 0, paintedLight = null;

  function lum(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }

  function parseRgb(str) {
    var m = /rgba?\(([^)]+)\)/.exec(str || '');
    if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    if (p.length > 3 && p[3] < 0.55) return null;
    return p;
  }

  function sampleImage(el, cx, cy) {
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    var c = imgCache.get(el);
    if (c === false) return null;
    if (!c) {
      if (!el.complete || !el.naturalWidth) return null;
      try {
        var cv = document.createElement('canvas');
        cv.width = 32; cv.height = 32;
        cv.getContext('2d').drawImage(el, 0, 0, 32, 32);
        c = cv.getContext('2d').getImageData(0, 0, 32, 32).data;
      } catch (err) { imgCache.set(el, false); return null; }
      imgCache.set(el, c);
    }
    var gx = Math.min(31, Math.max(0, Math.floor((cx - rect.left) / rect.width * 32)));
    var gy = Math.min(31, Math.max(0, Math.floor((cy - rect.top) / rect.height * 32)));
    var i = (gy * 32 + gx) * 4;
    return lum(c[i], c[i + 1], c[i + 2]);
  }

  var bgImgCache = {};

  function gradientLum(bgi) {
    if (!bgi || bgi === 'none' || bgi.indexOf('gradient') < 0) return null;
    var m = bgi.match(/rgba?\([^)]+\)/g);
    if (!m || !m.length) return null;
    var tot = 0, n = 0;
    for (var i = 0; i < Math.min(2, m.length); i++) {
      var p = m[i].match(/[\d.]+/g).map(Number);
      if (p.length > 3 && p[3] < 0.5) continue;
      tot += lum(p[0], p[1], p[2]); n++;
    }
    return n ? tot / n : null;
  }

  function bgUrlLum(el, bgi, cx, cy) {
    var u = /url\(["']?([^"')]+)["']?\)/.exec(bgi);
    if (!u) return null;
    var im = bgImgCache[u[1]];
    if (im === false) return null;
    if (!im) {
      im = new Image();
      im.onerror = function () { bgImgCache[u[1]] = false; };
      im.src = u[1];
      bgImgCache[u[1]] = im;
      return null;
    }
    if (!im.complete || !im.naturalWidth) return null;
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    var c = imgCache.get(im);
    if (c === false) return null;
    if (!c) {
      try {
        var cv = document.createElement('canvas');
        cv.width = 32; cv.height = 32;
        var ctx = cv.getContext('2d');
        ctx.drawImage(im, 0, 0, 32, 32);
        c = ctx.getImageData(0, 0, 32, 32).data;
      } catch (err) { imgCache.set(im, false); return null; }
      imgCache.set(im, c);
    }
    var gx = Math.min(31, Math.max(0, Math.floor((cx - rect.left) / rect.width * 32)));
    var gy = Math.min(31, Math.max(0, Math.floor((cy - rect.top) / rect.height * 32)));
    var i2 = (gy * 32 + gx) * 4;
    return lum(c[i2], c[i2 + 1], c[i2 + 2]);
  }

  function surfaceLum(el, cx, cy) {
    var stack = [];
    if (document.elementsFromPoint) stack = document.elementsFromPoint(cx, cy) || [];
    var n = el, hops = 0;
    while (n && n.nodeType === 1 && hops++ < 16) { stack.push(n); n = n.parentElement; }
    for (var i = 0; i < stack.length; i++) {
      var e2 = stack[i];
      if (!e2 || e2.nodeType !== 1) continue;
      if (e2.tagName === 'IMG') {
        var l = sampleImage(e2, cx, cy);
        if (l !== null) return l;
      }
      var cs = getComputedStyle(e2);
      if (parseFloat(cs.opacity) < 0.5) continue;
      var bgi = cs.backgroundImage;
      var g = gradientLum(bgi);
      if (g !== null) return g;
      var iu = bgUrlLum(e2, bgi, cx, cy);
      if (iu !== null) return iu;
      var p = parseRgb(cs.backgroundColor);
      if (p) return lum(p[0], p[1], p[2]);
    }
    return null;
  }

  function adapt(el, cx, cy) {
    return; /* mix-blend-mode:difference now handles contrast */
    if (!dot) return;
    var now = Date.now();
    if (now - lastPaint < 70) return;
    lastPaint = now;
    var l = surfaceLum(el, cx, cy);
    if (l === null) { paintedLight = null; dot.style.background = 'var(--dot,' + COLOR + ')'; return; }
    var wantDark = l > 0.55;
    if (paintedLight === wantDark) return;
    paintedLight = wantDark;
    dot.style.background = wantDark ? DARK_INK : LIGHT_INK;
  }

  document.addEventListener('mousemove', function (e) {
    build();
    var pvx = e.clientX - tx, pvy = e.clientY - ty;
    tx = e.clientX; ty = e.clientY;
    adapt(e.target, e.clientX, e.clientY);
    navTint(e.target);
    maybeTrail(e.target, tx, ty, pvx, pvy);
    scale = hoverable(e.target) ? 1.55 : 1;
    if (dot) dot.style.opacity = '1';
    if (!raf) { x = tx; y = ty; raf = requestAnimationFrame(tick); }
  }, { passive: true });

  document.addEventListener('mousedown', function () { scale = 0.7; });
  document.addEventListener('mouseup', function (e) { scale = hoverable(e.target) ? 1.55 : 1; });
  document.addEventListener('mouseleave', function () { if (dot) dot.style.opacity = '0'; });
})();
