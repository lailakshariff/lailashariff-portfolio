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
      'background:var(--dot,' + COLOR + ');pointer-events:none;z-index:2147483647;' +
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
    tx = e.clientX; ty = e.clientY;
    adapt(e.target, e.clientX, e.clientY);
    scale = hoverable(e.target) ? 1.55 : 1;
    if (dot) dot.style.opacity = '1';
    if (!raf) { x = tx; y = ty; raf = requestAnimationFrame(tick); }
  }, { passive: true });

  document.addEventListener('mousedown', function () { scale = 0.7; });
  document.addEventListener('mouseup', function (e) { scale = hoverable(e.target) ? 1.55 : 1; });
  document.addEventListener('mouseleave', function () { if (dot) dot.style.opacity = '0'; });
})();
