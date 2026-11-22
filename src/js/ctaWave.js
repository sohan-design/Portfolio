/**
 * Footer dither — page surface dissolves into solid blue (pixel spray).
 * Orientation: light/dark at top → blue at bottom (reference flipped).
 */
export function initCtaPixelWave(root) {
  var scope = root || document;
  var section = scope.querySelector('.site-cta--dither') || scope.querySelector('.site-cta--pixel');
  var canvas = scope.querySelector('[data-cta-wave]');
  if (!section || !canvas || canvas.dataset.waveReady) return;
  canvas.dataset.waveReady = '1';

  var ctx = canvas.getContext('2d', { alpha: false });
  var BLUE = '#1857F5';
  var seed = 17;

  function hash(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  function smoothstep(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function surfaceColor() {
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') return '#000000';
    // Match light page paper / white surfaces.
    return '#F2F2F2';
  }

  function paint() {
    var cssW = Math.max(1, section.clientWidth || window.innerWidth);
    var cssH = Math.max(1, section.clientHeight);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
    }
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var top = surfaceColor();
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, cssW, cssH);

    // Chunky squares like the reference dissolve.
    var cell = Math.max(4, Math.round(cssW / 220));
    var cols = Math.ceil(cssW / cell) + 1;
    var rows = Math.ceil(cssH / cell) + 1;

    // Keep the upper Contact band mostly clear; dissolve into solid blue below.
    var start = 0.38;
    var end = 0.82;

    ctx.fillStyle = BLUE;
    for (var y = 0; y < rows; y++) {
      var t = rows <= 1 ? 1 : y / (rows - 1);
      var density = smoothstep(start, end, t);

      // Fully solid blue past the dissolve.
      if (density >= 0.999) {
        ctx.fillRect(0, y * cell, cssW, cssH - y * cell);
        break;
      }
      if (density <= 0.001) continue;

      for (var x = 0; x < cols; x++) {
        // Slight horizontal drift so the edge isn't a flat line.
        var drift = (hash(x, y + 3) - 0.5) * 0.06;
        var local = Math.max(0, Math.min(1, density + drift));
        if (hash(x, y) < local) {
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }

  function schedule() {
    clearTimeout(section._ctaWaveT);
    section._ctaWaveT = setTimeout(paint, 40);
  }

  paint();
  window.addEventListener('resize', schedule);

  if (window.MutationObserver) {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }
}
