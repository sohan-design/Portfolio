/** Footer pixel wave — static valley, scratches on scroll then settles. */
export function initCtaPixelWave(root) {
  var scope = root || document;
  var section = scope.querySelector('.site-cta--pixel');
  var canvas = scope.querySelector('[data-cta-wave]');
  if (!section || !canvas || canvas.dataset.waveReady) return;
  canvas.dataset.waveReady = '1';

  var ctx = canvas.getContext('2d');
  var reduce =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var scroller = section.closest('.cs-panel') || window;

  function scrollTop() {
    return scroller === window ? window.scrollY || 0 : scroller.scrollTop;
  }

  /* Same blues in light and dark: statue field + cursor trail #0C50FF. */
  var COLORS = ['#0C50FF', '#1A4ADF', '#3D74FF', '#0A38C4', '#6A96FF'];
  var ghost = 'rgba(12, 80, 255, 0.22)';
  var cell = 10;
  var cols = 0;
  var rows = 0;
  var base = null;
  var scratch = null;
  var lastY = scrollTop();
  var raf = 0;
  var settling = false;

  function hash(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function waveHeight(nx) {
    var edge = Math.pow(Math.abs(nx - 0.5) * 2, 1.35);
    return 0.28 + edge * 0.62;
  }

  function buildBase() {
    var w = section.clientWidth;
    var h = canvas.clientHeight || Math.round(w * 0.28);
    if (w < 2 || h < 2) return;

    cell = Math.max(8, Math.round(w / 110));
    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    base = new Int8Array(cols * rows);
    scratch = new Float32Array(cols * rows);

    for (var c = 0; c < cols; c++) {
      var nx = cols <= 1 ? 0.5 : c / (cols - 1);
      var fill = waveHeight(nx);
      var fillRows = Math.floor(fill * rows);

      for (var r = 0; r < rows; r++) {
        var i = r * cols + c;
        var fromBottom = rows - 1 - r;

        if (fromBottom < fillRows) {
          var dens = fromBottom < 2 ? 1 : 0.92 - (fromBottom / Math.max(1, fillRows)) * 0.18;
          if (hash(c, r) < dens) {
            base[i] = 1 + Math.floor(hash(c + 9, r + 3) * COLORS.length);
          }
        } else if (fromBottom < fillRows + 4) {
          var spray = 0.18 * (1 - (fromBottom - fillRows) / 4);
          if (hash(c + 2, r + 7) < spray) {
            base[i] = 1 + Math.floor(hash(c + 4, r) * 3);
          }
        } else if (fromBottom < fillRows + 10 && hash(c * 3, r * 5) < 0.045) {
          base[i] = -1;
        }
      }
    }
  }

  function pulse(i, now) {
    if (reduce) return 1;
    var phase = (i % 23) * 0.55;
    var wave = 0.5 + 0.5 * Math.sin(now * 0.00115 + phase);
    return 0.38 + 0.62 * wave;
  }

  function paint(now) {
    if (!base) return;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    var t = now || performance.now();
    ctx.clearRect(0, 0, w, h);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = r * cols + c;
        var v = base[i];
        if (!v) continue;

        var s = scratch ? scratch[i] : 0;
        var dx = s ? s * cell * 2.4 : 0;
        var dy = s ? -s * cell * 0.35 : 0;
        var x = c * cell + dx;
        var y = r * cell + dy;
        var dim = pulse(i, t);

        if (v < 0) {
          ctx.globalAlpha = 0.55 * dim;
          ctx.fillStyle = ghost;
          ctx.fillRect(x + cell * 0.35, y + cell * 0.35, Math.max(1, cell * 0.3), Math.max(1, cell * 0.3));
        } else {
          ctx.fillStyle = COLORS[(v - 1) % COLORS.length];
          ctx.globalAlpha = dim * (s ? 0.72 + 0.28 * (1 - Math.min(1, s)) : 1);
          ctx.fillRect(x, y, cell - 0.5, cell - 0.5);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    raf = 0;
    var max = 0;
    if (scratch) {
      for (var i = 0; i < scratch.length; i++) {
        if (scratch[i] !== 0) {
          scratch[i] *= 0.82;
          if (Math.abs(scratch[i]) < 0.03) scratch[i] = 0;
          if (Math.abs(scratch[i]) > max) max = Math.abs(scratch[i]);
        }
      }
    }
    paint(now);
    if (max <= 0.03) settling = false;
    if (!reduce) raf = requestAnimationFrame(loop);
  }

  function kick() {
    if (!raf && !reduce) raf = requestAnimationFrame(loop);
  }

  function scratchBand(dy, dir) {
    if (reduce || !scratch || !base || !cols) return;
    var rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    var strength = Math.min(1, Math.abs(dy) / 48);
    if (strength < 0.04) return;

    var progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    var center = Math.floor(progress * (cols - 1));
    var half = Math.max(3, Math.floor(cols * (0.06 + strength * 0.1)));
    var push = dir * strength;

    for (var c = Math.max(0, center - half); c <= Math.min(cols - 1, center + half); c++) {
      var falloff = 1 - Math.abs(c - center) / half;
      for (var r = 0; r < rows; r++) {
        var i = r * cols + c;
        if (!base[i]) continue;
        var fromBottom = (rows - 1 - r) / rows;
        if (fromBottom > 0.92) continue;
        scratch[i] = Math.max(-1.2, Math.min(1.2, scratch[i] + push * falloff));
      }
    }

    if (!settling) {
      settling = true;
      kick();
    }
  }

  var scrollT = 0;
  function onScroll() {
    var y = scrollTop();
    var dy = y - lastY;
    lastY = y;
    if (Math.abs(dy) < 1) return;
    scratchBand(dy, dy > 0 ? 1 : -1);
    clearTimeout(scrollT);
    scrollT = setTimeout(function () {
      if (!settling && scratch) {
        settling = true;
        kick();
      }
    }, 90);
  }

  function resize() {
    buildBase();
    if (!base) return;
    if (scratch) scratch.fill(0);
    settling = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    paint(performance.now());
    kick();
  }

  resize();
  if (!base) requestAnimationFrame(resize);
  scroller.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    clearTimeout(section._ctaWaveT);
    section._ctaWaveT = setTimeout(resize, 120);
  });
}
