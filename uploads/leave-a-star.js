/* Leave a Star — the closing moment of the About page.
   Boots itself against [data-ls] markup; all copy lives in the page, not here.

   PERSISTENCE: real, shared, via the Supabase Data API (see supabase-config.js).
   Every star drawn in the sky is a row in the public Stars table; the count is
   the true row count. Rows are written once, on Add it / Skip — the table needs
   no UPDATE or DELETE permission. Coordinates are stored as percentages, so a
   star sits in the same relative spot on any screen size. */
(function () {
  if (window.__leaveAStar) return;
  window.__leaveAStar = true;

  var RENDER_CAP = 70;          // most stars drawn at once, however many exist
  var FETCH_LIMIT = 400;        // rows pulled per visit; the count is still the true total

  /* Purely decorative marks, drawn behind everything and never interactive.
     They are NOT visitor stars: they carry no words and are never counted.
     0 keeps the sky honest — raise it only if you want faint atmosphere. */
  var DECOR_STARS = 0;

  var SHAPES = {
    five:    { label: 'Five-point', d: 'M12 1.2 L15.1 9.1 L23.4 9.4 L16.9 14.5 L19.3 22.5 L12 17.8 L4.7 22.5 L7.1 14.5 L0.6 9.4 L8.9 9.1 Z', fill: true },
    diamond: { label: 'Sparkle', d: 'M12 1.6 L14.3 9.7 L22.4 12 L14.3 14.3 L12 22.4 L9.7 14.3 L1.6 12 L9.7 9.7 Z', fill: true },
    spark:   { label: 'Soft sparkle', d: 'M12 1.4 C12.9 8.2 15.8 11.1 22.6 12 C15.8 12.9 12.9 15.8 12 22.6 C11.1 15.8 8.2 12.9 1.4 12 C8.2 11.1 11.1 8.2 12 1.4 Z', fill: true },
    six:     { label: 'Asterisk', d: 'M12 2.4 V21.6 M4 6.9 L20 17.1 M20 6.9 L4 17.1', fill: false },
    doodle:  { label: 'Hand-drawn', d: 'M11.4 2.6 C12.5 6.5 13.3 8.3 14.5 9 C16.1 9.5 19.4 9.3 21.6 9.9 C19.2 11.7 16.9 13.2 16.3 14.4 C15.9 15.8 17.3 19.3 17.9 21.5 C15.5 20.1 13 18.2 11.6 18.1 C10 18.2 6.7 20.5 4.5 21.8 C5.3 19.3 6.4 15.9 6.2 14.6 C5.6 13.2 3.3 11.2 1.6 9.6 C4.1 9.3 7.6 9.5 8.8 8.8 C9.9 8 10.6 5.7 11.4 2.6 Z', fill: true }
  };
  /* Portfolio colours, tuned to stay legible against a dusk ground in both modes. */
  var COLORS = {
    terracotta: { label: 'Terracotta', l1: '#8f3a2c', l2: '#f4ab95', d: '#d98d7e' },
    dusty:      { label: 'Dusty blue', l1: '#2f4d78', l2: '#c3d8ef', d: '#93aecb' },
    ochre:      { label: 'Ochre',      l1: '#8a5c10', l2: '#f3d193', d: '#dcae60' },
    cream:      { label: 'Cream',      l1: '#8a7a58', l2: '#f9f2e0', d: '#efe4c9' },
    charcoal:   { label: 'Charcoal',   l1: '#1b1a20', l2: '#d3d7e0', d: '#8d8778' }
  };

  function hx(c) { return [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)]; }
  function mix(a, b, t) {
    var x = hx(a), y = hx(b), o = '#';
    for (var i = 0; i < 3; i++) o += ('0' + Math.round(x[i] + (y[i] - x[i]) * t).toString(16)).slice(-2);
    return o;
  }

  /* ---- Supabase (PostgREST) ------------------------------------------------
     Two calls only: one SELECT on load, one INSERT when a visitor finishes.  */
  var CFG = window.LS_SUPABASE || {};
  var TABLE = CFG.table || 'Stars';
  var COLS = 'id,created_at,x_position,y_position,star_type,color,word';

  function configured() { return !!(CFG.url && CFG.key); }
  function endpoint() { return CFG.url.replace(/\/+$/, '') + '/rest/v1/' + encodeURIComponent(TABLE); }
  function headers(extra) {
    var h = { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }

  /* A row becomes the shape the sky already draws: 0..1 coordinates, known keys. */
  function fromRow(row) {
    var shape = SHAPES[row.star_type] ? row.star_type : 'five';
    var color = COLORS[row.color] ? row.color : 'terracotta';
    var x = Number(row.x_position), y = Number(row.y_position);
    if (!isFinite(x) || !isFinite(y)) return null;
    x = Math.min(1, Math.max(0, x / 100));
    y = Math.min(1, Math.max(0, y / 100));
    var t = row.created_at ? Date.parse(row.created_at) : Date.now();
    return {
      id: 'r' + row.id, x: x, y: y, shape: shape, color: color,
      word: typeof row.word === 'string' ? row.word : '',
      t: isFinite(t) ? t : Date.now(),
      k: 0.7 + y * 0.5, op: 0.5 + y * 0.4
    };
  }

  var StarStore = {
    /* Resolves { rows, total }. total is the real row count, even past the limit. */
    list: function () {
      if (!configured()) return Promise.resolve({ rows: [], total: 0, off: true });
      var url = endpoint() + '?select=' + COLS + '&order=created_at.desc&limit=' + FETCH_LIMIT;
      return fetch(url, { headers: headers({ Prefer: 'count=exact' }) })
        .then(function (res) {
          if (!res.ok) throw new Error('select ' + res.status);
          var range = res.headers.get('content-range') || '';
          var total = parseInt(range.split('/')[1], 10);
          return res.json().then(function (rows) {
            var out = [];
            (rows || []).forEach(function (r) { var s = fromRow(r); if (s) out.push(s); });
            return { rows: out, total: isFinite(total) ? total : out.length };
          });
        });
    },
    /* One insert per visitor, written when they add a word or skip. */
    add: function (star) {
      if (!configured()) return Promise.reject(new Error('Supabase is not configured'));
      var body = {
        x_position: Number((star.x * 100).toFixed(3)),
        y_position: Number((star.y * 100).toFixed(3)),
        star_type: star.shape,
        color: star.color,
        word: star.word ? star.word : null
      };
      return fetch(endpoint() + '?select=' + COLS, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify(body)
      }).then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) { throw new Error('insert ' + res.status + ' ' + t); });
        }
        return res.json().then(function (rows) {
          var row = rows && rows[0];
          return row ? fromRow(row) : null;
        });
      });
    }
  };

  function rng(seed) { var s = seed; return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }

  /* Decorative marks only — no words, not interactive, never counted.
     `ar` is the field's width/height ratio: spacing is measured in visual distance,
     so a tall narrow phone sky spreads them as evenly as a wide desktop one. */
  function decorSky(n, ar) {
    var r = rng(90210), shapes = Object.keys(SHAPES), cols = Object.keys(COLORS), out = [], tries = 0;
    var f = Math.max(0.45, Math.min(2.4, ar || 1.9));
    while (out.length < n && tries < 2600) {
      tries++;
      var x = 0.04 + r() * 0.92;
      var y = Math.pow(r(), 0.7);                       // monotonic downward bias, no visible banding
      y = 0.04 + y * 0.93;
      var minD = (0.15 - 0.06 * y) * (f < 1 ? 0.72 : 1);
      var ok = true;
      for (var i = 0; i < out.length; i++) if (Math.hypot((x - out[i].x) * f, y - out[i].y) < minD) { ok = false; break; }
      if (!ok) continue;
      out.push({
        id: 'x' + out.length, x: x, y: y,
        shape: shapes[(r() * shapes.length) | 0],
        color: cols[(r() * cols.length) | 0],
        word: '',
        k: 0.6 + y * 0.4 + r() * 0.2,                   // deeper marks run a little larger
        op: 0.3 + y * 0.26 + r() * 0.1,
        t: 0, decor: true
      });
    }
    return out;
  }

  var teardown = [];
  var wiredField = null, layer = null;
  /* The host can replace the control markup at any time, which would strip
     listeners bound to those nodes. Delegation on document survives that;
     API points at the current boot's handlers. */
  var API = null;

  function boot() {
    var root = document.querySelector('[data-ls]');
    if (!root) return false;
    var field = root.querySelector('[data-ls-field]');
    if (!field) return false;
    if (wiredField === field && layer && layer.isConnected) return true;
    while (teardown.length) { try { teardown.pop()(); } catch (e) {} }

    /* Everything this script draws lives in its own layer, so React never sees
       nodes appear or vanish inside the markup it owns. */
    layer = field.querySelector('[data-ls-layer]');
    if (!layer) {
      layer = document.createElement('div');
      layer.setAttribute('data-ls-layer', '');
      layer.setAttribute('aria-hidden', 'false');
      layer.style.cssText = 'position:absolute;inset:0';
      field.appendChild(layer);
    }
    layer.textContent = '';
    wiredField = field;
    root.dataset.wired = '1';

    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    var shape = 'five', color = 'terracotta', pending = null, saving = false;

    function aspect() {
      var r = field.getBoundingClientRect();
      return r.height > 0 ? r.width / r.height : 1.9;
    }
    var ar = aspect();
    var stars = [];                     // real visitor stars (Supabase rows)
    var decor = decorSky(DECOR_STARS, ar);
    var total = 0;                      // true row count in the table

    /* Touch has no hover preview, so placement is explicit there. */
    function touchFlow() {
      return !!(window.matchMedia && (matchMedia('(hover:none)').matches || matchMedia('(max-width:820px)').matches));
    }
    var armed = false;

    var el = {
      count: root.querySelector('[data-ls-count]'),
      hint: root.querySelector('[data-ls-hint]'),
      num: root.querySelector('[data-ls-num]'),
      numval: root.querySelector('[data-ls-numval]'),
      word: root.querySelector('[data-ls-word]'),
      input: root.querySelector('[data-ls-input]'),
      thanks: root.querySelector('[data-ls-thanks]'),
      live: root.querySelector('[data-ls-live]'),
      choice: root.querySelector('[data-ls-choice]'),
      arm: root.querySelector('[data-ls-arm]'),
      armhint: root.querySelector('[data-ls-armhint]'),
      oops: root.querySelector('[data-ls-oops]')
    };

    function dark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
    /* y is depth 0..1 down the field: the deeper the star, the lighter it must run */
    function hex(k, y) {
      var c = COLORS[k] || COLORS.terracotta;
      if (dark()) return c.d;
      var t = Math.min(1, Math.max(0, (y === undefined ? 0 : y)));
      return mix(c.l1, c.l2, t * t * 0.55 + t * 0.45);
    }
    function svg(sh, co, size, y) {
      var s = SHAPES[sh] || SHAPES.five, f = hex(co, y);
      return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true" style="display:block;overflow:visible">' +
        (s.fill ? '<path d="' + s.d + '" fill="' + f + '"/>'
                : '<path d="' + s.d + '" stroke="' + f + '" stroke-width="2" stroke-linecap="round" fill="none"/>') + '</svg>';
    }
    function say(m) { if (el.live) el.live.textContent = m; }
    function show(node, on) { if (node) node.style.display = on ? '' : 'none'; }

    /* ghost preview + word tooltip */
    var ghost = document.createElement('div');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = 'position:absolute;opacity:0;pointer-events:none;transform:translate(-50%,-50%);transition:opacity .25s ease';
    layer.appendChild(ghost);

    var tip = document.createElement('div');
    tip.setAttribute('aria-hidden', 'true');
    tip.style.cssText = 'position:absolute;z-index:5;opacity:0;pointer-events:none;transform:translate(-50%,-100%);transition:opacity .25s ease;white-space:nowrap;text-align:center;text-shadow:0 1px 10px rgba(10,12,16,.6)';
    layer.appendChild(tip);

    var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    /* `t` is the row's own created_at, parsed on read — never page-load time. */
    function ago(t) {
      if (!t || !isFinite(t)) return '';
      var mins = (Date.now() - t) / 60000;
      if (mins < 0) mins = 0;
      if (mins < 1) return 'Created just now';
      if (mins < 60) { var m = Math.floor(mins); return 'Created ' + m + (m === 1 ? ' minute ago' : ' minutes ago'); }
      var hrs = mins / 60;
      if (hrs < 24) { var h = Math.floor(hrs); return 'Created ' + h + (h === 1 ? ' hour ago' : ' hours ago'); }
      var days = Math.floor(hrs / 24);
      if (days === 1) return 'Created yesterday';
      if (days < 7) return 'Created ' + days + ' days ago';
      if (days < 28) { var w = Math.floor(days / 7); return 'Created ' + w + (w === 1 ? ' week ago' : ' weeks ago'); }
      var d = new Date(t);
      return 'Created ' + MON[d.getMonth()] + ' ' + d.getDate();
    }

    function visible() {
      if (stars.length <= RENDER_CAP) return stars;
      var sorted = stars.slice().sort(function (a, b) { return b.t - a.t; });
      var out = sorted.slice(0, 20), rest = sorted.slice(20), r = rng(4242);
      while (out.length < RENDER_CAP && rest.length) out.push(rest.splice((r() * rest.length) | 0, 1)[0]);
      return out;
    }

    function node(s) {
      var base = s.shape === 'six' ? 15 : 14;
      var size = Math.max(8, Math.min(24, base * (s.k || 1))).toFixed(1);
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.star = s.id;
      b.setAttribute('aria-label', s.word ? 'A star, with the word: ' + s.word + ', ' + ago(s.t) : SHAPES[s.shape].label + ' star, no word');
      b.style.cssText = 'position:absolute;left:' + (s.x * 100).toFixed(3) + '%;top:' + (s.y * 100).toFixed(3) + '%;' +
        'transform:translate(-50%,-50%) rotate(' + (((s.x * 211) % 17) - 8).toFixed(1) + 'deg);' +
        'width:40px;height:40px;display:grid;place-items:center;border:0;background:none;padding:0;cursor:pointer;' +
        'opacity:' + (s.mine ? 1 : Math.min(1, s.op || 0.85)).toFixed(2) + ';-webkit-tap-highlight-color:transparent;transition:opacity .3s ease';
      b.innerHTML = svg(s.shape, s.color, size, s.y);
      var reveal = function () {
        if (armed) return;                              /* placement mode wins over discovery */
        if (!s.word) { tip.style.opacity = '0'; return; }
        tip.textContent = '';
        var w = document.createElement('span');
        w.style.cssText = 'display:block;font:300 italic 16px/1.15 Newsreader,Georgia,serif;color:#f4ecdd';
        w.textContent = s.word;                         /* visitor text, as text only */
        var when = document.createElement('span');
        when.style.cssText = "display:block;margin-top:4px;font:500 8.5px/1 var(--font-sans);letter-spacing:.14em;text-transform:uppercase;color:rgba(244,236,221,.52)";
        when.textContent = ago(s.t);
        tip.appendChild(w);
        tip.appendChild(when);
        tip.style.left = (s.x * 100).toFixed(3) + '%';
        tip.style.top = 'calc(' + (s.y * 100).toFixed(3) + '% - 26px)';
        tip.style.opacity = '1';
      };
      b.addEventListener('pointerenter', reveal);
      b.addEventListener('focus', reveal);
      b.addEventListener('blur', function () { tip.style.opacity = '0'; });
      b.addEventListener('pointerleave', function () { tip.style.opacity = '0'; });
      b.addEventListener('click', function (e) { e.stopPropagation(); reveal(); });
      return b;
    }

    function decorNode(s) {
      var d = document.createElement('span');
      d.setAttribute('data-decor', '');
      d.setAttribute('aria-hidden', 'true');
      d.style.cssText = 'position:absolute;left:' + (s.x * 100).toFixed(3) + '%;top:' + (s.y * 100).toFixed(3) + '%;' +
        'transform:translate(-50%,-50%);pointer-events:none;opacity:' + s.op.toFixed(2);
      d.innerHTML = svg(s.shape, s.color, Math.max(8, 13 * s.k).toFixed(1), s.y);
      return d;
    }

    function paint() {
      var old = layer.querySelectorAll('[data-star],[data-decor]');
      for (var i = 0; i < old.length; i++) old[i].remove();
      decor.forEach(function (s) { layer.appendChild(decorNode(s)); });
      visible().forEach(function (s) { layer.appendChild(node(s)); });
    }

    function tally() {
      if (!el.count) return;
      if (!total) { el.count.textContent = ''; return; }   /* an empty sky says nothing */
      el.count.textContent = total + (total === 1 ? ' little star and counting' : ' little stars and counting');
    }

    function paintControls() {
      root.querySelectorAll('[data-shape]').forEach(function (b) {
        var on = b.dataset.shape === shape;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.color = on ? hex(color, 0) : 'currentColor';
        b.style.opacity = on ? '1' : (dark() ? '.55' : '.8');
      });
      root.querySelectorAll('[data-color]').forEach(function (b) {
        var on = b.dataset.color === color, dot = b.firstElementChild;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (dot) {
          dot.style.background = hex(b.dataset.color, 0);
          dot.style.boxShadow = on ? (dark() ? '0 0 0 1.5px rgba(244,236,221,.9)' : '0 0 0 1.5px rgba(38,41,48,.8)') : 'none';
          dot.style.opacity = on ? '1' : '.68';
        }
      });
      if (el.choice) el.choice.textContent = SHAPES[shape].label + ' · ' + COLORS[color].label;
      if (ghost.style.opacity !== '0') ghost.innerHTML = svg(shape, color, 19, ghostY);
    }

    /* keeps the sky from ever becoming a pile */
    function breathe(x, y) {
      var f = Math.max(0.45, Math.min(2.4, aspect()));
      var all = stars.concat(decor);
      for (var pass = 0; pass < 6; pass++) {
        var moved = false;
        for (var i = 0; i < all.length; i++) {
          var o = all[i], dx = (x - o.x) * f, dy = y - o.y, d = Math.hypot(dx, dy);
          if (d < 0.07) {
            var a = d < 0.001 ? Math.random() * 6.283 : Math.atan2(dy, dx);
            x += Math.cos(a) * 0.032; y += Math.sin(a) * 0.032; moved = true;
          }
        }
        if (!moved) break;
      }
      return [Math.min(0.97, Math.max(0.03, x)), Math.min(0.95, Math.max(0.05, y))];
    }

    function burst(x, y) {
      var col = hex(color, y);
      for (var i = 0; i < 3; i++) {
        var p = document.createElement('span');
        p.setAttribute('aria-hidden', 'true');
        p.style.cssText = 'position:absolute;left:' + (x * 100) + '%;top:' + (y * 100) + '%;width:2.5px;height:2.5px;border-radius:50%;background:' + col + ';pointer-events:none;transform:translate(-50%,-50%)';
        layer.appendChild(p);
        var a = (i / 3) * 6.283 + Math.random() * 1.2, r = 11 + Math.random() * 9;
        var an = p.animate([
          { transform: 'translate(-50%,-50%) translate(0,0) scale(1)', opacity: 0.75 },
          { transform: 'translate(-50%,-50%) translate(' + (Math.cos(a) * r).toFixed(1) + 'px,' + (Math.sin(a) * r).toFixed(1) + 'px) scale(.2)', opacity: 0 }
        ], { duration: 340 + Math.random() * 140, easing: 'cubic-bezier(.15,.7,.2,1)' });
        an.onfinish = (function (n) { return function () { n.remove(); }; })(p);
      }
    }

    function reset() {
      show(el.num, false); show(el.word, false); show(el.thanks, false); show(el.oops, false); show(el.hint, true);
    }
    reset();

    function setArmed(on) {
      armed = !!on;
      if (el.arm) el.arm.setAttribute('aria-pressed', armed ? 'true' : 'false');
      if (el.armhint) el.armhint.hidden = !armed;
      field.style.cursor = armed ? 'crosshair' : '';
      if (!armed) ghost.style.opacity = '0';
      else tip.style.opacity = '0';
      say(armed ? 'Placement on. Tap anywhere in the sky to leave your star.' : 'Placement off.');
    }

    /* A placement is a local preview. Nothing is written until Add it / Skip,
       so the table never needs an UPDATE to attach the word. */
    function place(x, y) {
      if (pending || saving) return;
      var p = breathe(x, y);
      var star = { id: 'tmp' + Date.now().toString(36), x: p[0], y: p[1], shape: shape, color: color, word: '', t: Date.now(), mine: true, k: 1.1, op: 1 };
      stars.push(star);
      pending = star;
      ghost.style.opacity = '0';
      show(el.oops, false);

      var b = node(star);
      layer.appendChild(b);
      if (!reduced) {
        b.animate([{ transform: b.style.transform + ' scale(.3)', opacity: 0 }, { transform: b.style.transform + ' scale(1)', opacity: 1 }],
          { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
        burst(p[0], p[1]);
      }

      var no = total + 1;
      say('Star placed. You left star number ' + no + '.');
      show(el.hint, false);
      if (armed) setArmed(false);
      setTimeout(function () {
        if (el.numval) el.numval.textContent = no;
        show(el.num, true);
        setTimeout(function () {
          show(el.word, true);
          if (el.word) el.word.style.opacity = '1';
          if (el.input) { el.input.value = ''; }
        }, reduced ? 0 : 420);
      }, reduced ? 0 : 460);
    }

    /* One word only. Returns null when the visitor typed more than one. */
    function clean(v) {
      var s = (v || '').trim();
      if (!s) return '';
      if (/\s/.test(s)) return null;
      return s.slice(0, 18);
    }

    function dropPreview(s) {
      var i = stars.indexOf(s);
      if (i > -1) stars.splice(i, 1);
      var b = layer.querySelector('[data-star="' + s.id + '"]');
      if (b) b.remove();
    }

    function finish() {
      var s = pending;
      if (!s || saving) return;
      var v = clean(el.input && el.input.value);
      if (v === null) {
        say('One word only, please.');
        if (el.input) {
          el.input.style.borderBottomColor = 'rgba(228,176,164,.95)';
          setTimeout(function () { el.input.style.borderBottomColor = ''; }, 1200);
          el.input.focus();
        }
        return;
      }
      s.word = v;
      saving = true;
      pending = null;
      if (el.word) el.word.style.opacity = '.45';

      StarStore.add(s).then(function (saved) {
        saving = false;
        total += 1;
        /* swap the preview for the row the database actually returned */
        if (saved) {
          var i = stars.indexOf(s);
          saved.mine = true; saved.k = 1.1; saved.op = 1;
          if (i > -1) stars[i] = saved;
          var b = layer.querySelector('[data-star="' + s.id + '"]');
          if (b) b.dataset.star = saved.id;
          s = saved;
        }
        var b2 = layer.querySelector('[data-star="' + s.id + '"]');
        if (b2 && s.word) b2.setAttribute('aria-label', 'A star, with the word: ' + s.word + ', ' + ago(s.t));
        tally();
        if (el.word) {
          el.word.style.opacity = '0';
          setTimeout(function () { show(el.word, false); show(el.thanks, true); }, reduced ? 0 : 380);
        } else { show(el.thanks, true); }
        say(s.word ? 'Word added: ' + s.word + '. Your star is part of the sky now.' : 'Your star is part of the sky now.');
      }).catch(function (err) {
        console.error('[leave-a-star] could not save this star:', err);
        saving = false;
        dropPreview(s);
        if (el.word) { el.word.style.opacity = '1'; show(el.word, false); }
        show(el.num, false);
        show(el.oops, true);
        say('That star could not be saved. Please try once more.');
        pending = null;
      });
    }

    API = {
      shape: function (v) { shape = v; paintControls(); },
      color: function (v) { color = v; paintControls(); },
      arm: function () { setArmed(!armed); },
      add: finish,
      skip: function () { if (el.input) el.input.value = ''; finish(); },
      key: function (e) {
        if (e.key === 'Enter') { e.preventDefault(); finish(); }
        if (e.key === 'Escape') { if (el.input) el.input.value = ''; finish(); }
      },
      repaint: paintControls,
      styled: function () {
        var b = document.querySelector('[data-shape]');
        return !!(b && b.style.color);
      }
    };
    teardown.push(function () { API = null; });

    /* tapping outside the sky dismisses a revealed word */
    var offTap = function (e) { if (!field.contains(e.target)) tip.style.opacity = '0'; };
    document.addEventListener('pointerdown', offTap, true);
    teardown.push(function () { document.removeEventListener('pointerdown', offTap, true); });

    /* keep the word input clear of the on-screen keyboard without scrollIntoView */
    if (el.input) el.input.addEventListener('focus', function () {
      if (!touchFlow()) return;
      setTimeout(function () {
        var r = el.input.getBoundingClientRect();
        var want = (window.visualViewport ? window.visualViewport.height : window.innerHeight) * 0.32;
        if (r.top > want) window.scrollBy({ top: r.top - want, behavior: 'smooth' });
      }, 320);
    });

    var kx = 0.5, ky = 0.5, keyMode = false;
    field.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' || pending) return;
      if (touchFlow() && !armed) return;
      keyMode = false;
      var r = field.getBoundingClientRect();
      moveGhost((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });
    field.addEventListener('pointerleave', function () { if (!keyMode) ghost.style.opacity = '0'; });
    /* Placement must be a deliberate tap — a scroll drag never leaves a star. */
    var down = null;
    field.addEventListener('pointerdown', function (e) {
      down = { x: e.clientX, y: e.clientY, t: Date.now() };
    });
    field.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-star]')) return;
      if (down && (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10 || Date.now() - down.t > 700)) { down = null; return; }
      down = null;
      if (touchFlow() && !armed) return;          /* on touch, the sky only accepts taps once armed */
      var r = field.getBoundingClientRect();
      place((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });
    field.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 0.01 : 0.045;
      if (e.key === 'ArrowLeft') kx -= step;
      else if (e.key === 'ArrowRight') kx += step;
      else if (e.key === 'ArrowUp') ky -= step;
      else if (e.key === 'ArrowDown') ky += step;
      else if ((e.key === 'Enter' || e.key === ' ') && keyMode) { e.preventDefault(); place(kx, ky); return; }
      else return;
      e.preventDefault();
      keyMode = true;
      kx = Math.min(0.97, Math.max(0.03, kx));
      ky = Math.min(0.95, Math.max(0.05, ky));
      moveGhost(kx, ky);
      say('Across ' + Math.round(kx * 100) + ', down ' + Math.round(ky * 100) + '. Press Enter to leave your star here.');
    });

    var ghostY = 0.5;
    function moveGhost(x, y) {
      if (pending) return;
      ghostY = y;
      ghost.innerHTML = svg(shape, color, 19, y);
      ghost.style.left = (Math.min(0.98, Math.max(0.02, x)) * 100) + '%';
      ghost.style.top = (Math.min(0.97, Math.max(0.03, y)) * 100) + '%';
      ghost.style.opacity = '.38';
    }

    /* Rotate the phone or cross a breakpoint and the sky changes shape: re-space the
       decorative marks. Saved stars keep their stored percentages. */
    var onShape = function () {
      var next = aspect();
      if (!next || Math.abs(next - ar) < 0.25) return;
      ar = next;
      decor = decorSky(DECOR_STARS, ar);
      paint();
    };
    window.addEventListener('resize', onShape);
    window.addEventListener('orientationchange', onShape);
    teardown.push(function () {
      window.removeEventListener('resize', onShape);
      window.removeEventListener('orientationchange', onShape);
    });

    /* dusk deepens as the section is scrolled through */
    var veil = root.querySelector('[data-ls-veil]');
    if (veil) {
      if (reduced) { veil.style.opacity = '1'; }
      else {
        var raf = 0;
        var onScroll = function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; step(); }); };
        var step = function () {
          var r = root.getBoundingClientRect();
          var p = (window.innerHeight - r.top) / (window.innerHeight * 0.85);
          veil.style.opacity = Math.min(1, Math.max(0, p)).toFixed(3);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        teardown.push(function () {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
        });
        step();
      }
    }

    var themeObs = new MutationObserver(function () { paint(); paintControls(); });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    teardown.push(function () { themeObs.disconnect(); });

    paint();
    tally();
    paintControls();

    /* Saved stars arrive after the section has already drawn, so there is no
       spinner and no layout shift — they simply appear. A failure is silent to
       visitors: the sky stays empty and the rest of the page is untouched. */
    StarStore.list().then(function (res) {
      if (res.off) { console.info('[leave-a-star] Supabase not configured — no saved stars loaded.'); return; }
      var mine = stars.filter(function (s) { return s.mine; });
      stars = res.rows.concat(mine);
      total = res.total;
      paint();
      tally();
    }).catch(function (err) {
      console.error('[leave-a-star] could not load saved stars:', err);
    });

    return true;
  }

  /* The host can re-render this section, which discards our layer. Watch for that
     one condition only — no body-wide observer, so a re-render can't feed back. */
  function watch() {
    document.addEventListener('click', function (e) {
      if (!API || !e.target.closest) return;
      var t = e.target;
      var sh = t.closest('[data-shape]');       if (sh) { API.shape(sh.dataset.shape); return; }
      var co = t.closest('[data-color]');       if (co) { API.color(co.dataset.color); return; }
      if (t.closest('[data-ls-arm]'))  { API.arm();  return; }
      if (t.closest('[data-ls-add]'))  { API.add();  return; }
      if (t.closest('[data-ls-skip]')) { API.skip(); return; }
    });
    document.addEventListener('keydown', function (e) {
      if (API && e.target && e.target.closest && e.target.closest('[data-ls-input]')) API.key(e);
    });

    boot();
    setInterval(function () {
      if (!layer || !layer.isConnected) { boot(); return; }
      /* markup was re-rendered under us: selected states need re-applying */
      if (API && !API.styled()) API.repaint();
    }, 1200);
  }
  if (document.body) watch();
  else document.addEventListener('DOMContentLoaded', watch);
})();
