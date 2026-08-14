/* Black dot cursor. Fine pointers only; leaves touch devices alone. */
(function () {
  if (window.__dotCursor) return;
  window.__dotCursor = true;
  if (!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  var SIZE = 22;
  var TAG = document.querySelector('script[src*="dot-cursor.js"]');
  var COLOR = (TAG && TAG.getAttribute('data-dot-color')) || '#141311';
  var dot, tx = -100, ty = -100, x = -100, y = -100, scale = 1, cur = 1, raf = 0;

  function build() {
    if (dot || !document.body) return;
    dot = document.createElement('div');
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText =
      'position:fixed;left:0;top:0;width:' + SIZE + 'px;height:' + SIZE + 'px;' +
      'margin:' + (-SIZE / 2) + 'px 0 0 ' + (-SIZE / 2) + 'px;border-radius:50%;' +
      'background:' + COLOR + ';pointer-events:none;z-index:2147483647;' +
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

  document.addEventListener('mousemove', function (e) {
    build();
    tx = e.clientX; ty = e.clientY;
    scale = hoverable(e.target) ? 1.9 : 1;
    if (dot) dot.style.opacity = '1';
    if (!raf) { x = tx; y = ty; raf = requestAnimationFrame(tick); }
  }, { passive: true });

  document.addEventListener('mousedown', function () { scale = 0.7; });
  document.addEventListener('mouseup', function (e) { scale = hoverable(e.target) ? 1.9 : 1; });
  document.addEventListener('mouseleave', function () { if (dot) dot.style.opacity = '0'; });
})();
