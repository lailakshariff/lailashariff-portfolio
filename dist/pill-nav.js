/* Pill nav: compacts once the visitor scrolls past the hero. */
(function () {
  if (window.__pnavWired) return;
  window.__pnavWired = 1;
  var root = document.documentElement, on = null, queued = false;
  function apply() {
    queued = false;
    var want = (window.scrollY || window.pageYOffset || 0) > 140;
    if (want === on) return;
    on = want;
    root.setAttribute('data-pnav', want ? 'compact' : 'full');
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(apply); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  apply();
})();
