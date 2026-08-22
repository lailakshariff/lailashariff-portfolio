(function () {
  var K = 'ls-theme', root = document.documentElement;
  function set(t) { root.setAttribute('data-theme', t); try { localStorage.setItem(K, t); } catch (e) {} }
  var saved = null; try { saved = localStorage.getItem(K); } catch (e) {}
  set(saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
  function wire() {
    var b = document.getElementById('tmode');
    if (!b) return false;
    if (b.dataset.wired) return true;
    b.dataset.wired = '1';
    b.addEventListener('click', function () {
      set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    return true;
  }
  var t = setInterval(function () { if (wire()) clearInterval(t); }, 100);
  setTimeout(function () { clearInterval(t); }, 12000);
})();
