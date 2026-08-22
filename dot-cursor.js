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

  document.addEventListener('mousemove', function (e) {
    build();
    tx = e.clientX; ty = e.clientY;
    scale = hoverable(e.target) ? 1.55 : 1;
    if (dot) dot.style.opacity = '1';
    if (!raf) { x = tx; y = ty; raf = requestAnimationFrame(tick); }
  }, { passive: true });

  document.addEventListener('mousedown', function () { scale = 0.7; });
  document.addEventListener('mouseup', function (e) { scale = hoverable(e.target) ? 1.55 : 1; });
  document.addEventListener('mouseleave', function () { if (dot) dot.style.opacity = '0'; });
})();
