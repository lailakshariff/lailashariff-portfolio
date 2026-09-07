// Laila Shariff hero — theme toggle logic (vanilla JS replacement for the DC's React state)
(function () {
  var root = document.getElementById('ls-hero');
  var btn = document.getElementById('ls-theme-toggle');
  if (!root || !btn) return;

  var STORAGE_KEY = 'ls-theme';
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  });
})();
