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

/* Playground group disclosure. Delegated so it survives pages that re-render the nav. */
(function () {
  if (window.__pnavDD) return;
  window.__pnavDD = 1;
  var timer = 0, hoverOpened = null;
  function grp(el) { return el && el.closest ? el.closest('.pnav-dd') : null; }
  function set(d, open) {
    clearTimeout(timer);
    d.classList.toggle('is-open', open);
    var b = d.querySelector('.pnav-dd-btn');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open && hoverOpened === d) hoverOpened = null;
  }
  function closeAll(except) {
    var o = document.querySelectorAll('.pnav-dd.is-open');
    for (var i = 0; i < o.length; i++) if (o[i] !== except) set(o[i], false);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pnav-dd-btn');
    if (b) {
      e.preventDefault();
      var d = grp(b);
      if (hoverOpened === d) { hoverOpened = null; return; }
      var open = !d.classList.contains('is-open');
      closeAll(d); set(d, open);
      return;
    }
    if (!grp(e.target)) closeAll();
  });
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var d = grp(e.target); if (!d) return;
    clearTimeout(timer);
    if (!d.classList.contains('is-open')) { closeAll(d); set(d, true); hoverOpened = d; }
  });
  document.addEventListener('pointerout', function (e) {
    if (e.pointerType !== 'mouse') return;
    var d = grp(e.target); if (!d || (e.relatedTarget && d.contains(e.relatedTarget))) return;
    if (d.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) return;
    timer = setTimeout(function () { set(d, false); }, 180);
  });
  document.addEventListener('keydown', function (e) {
    var d = grp(document.activeElement); if (!d) return;
    var items = [].slice.call(d.querySelectorAll('.pnav-dd-panel a'));
    var i = items.indexOf(document.activeElement), btn = d.querySelector('.pnav-dd-btn');
    if (e.key === 'Escape' && d.classList.contains('is-open')) { e.preventDefault(); set(d, false); btn.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (!d.classList.contains('is-open')) set(d, true); (items[i + 1] || items[0]).focus(); }
    else if (e.key === 'ArrowUp' && i >= 0) { e.preventDefault(); (i > 0 ? items[i - 1] : btn).focus(); }
  });
  document.addEventListener('focusout', function (e) {
    var d = grp(e.target); if (!d) return;
    setTimeout(function () { if (!d.contains(document.activeElement) && !d.matches(':hover')) set(d, false); }, 0);
  });
})();
