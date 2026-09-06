/**
 * Homepage paper shaders + pixel frame + more-work shelf.
 */
import {
  ShaderMount,
  grainGradientFragmentShader,
  GrainGradientShapes,
  ditheringFragmentShader,
  DitheringShapes,
  DitheringTypes,
  ShaderFitOptions,
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
} from '@paper-design/shaders';

var mounts = [];
var noiseTex = null;

/** Paper-exported dither backgrounds (light / dark). */
var PAGE_DITHER = {
  light: {
    colorBack: '#00000000',
    colorFront: '#0000000D',
    background: '#FFFFFF',
    frame: 234173.69000029092,
  },
  dark: {
    colorBack: '#00000000',
    colorFront: '#FFFFFF0F',
    background: '#000000',
    frame: 234353.41000029244,
  },
  speed: 0.04, // 60% less than Paper export (0.1)
  shape: 'simplex',
  type: '8x8',
  size: 6,
  scale: 1.66,
};

function cssVar(name, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function pageBg() {
  return cssVar('--bg', '#ffffff');
}

function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function reduceMotion() {
  return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function sizing(extra) {
  extra = extra || {};
  return {
    u_fit: ShaderFitOptions[extra.fit || defaultObjectSizing.fit],
    u_scale: extra.scale != null ? extra.scale : 1,
    u_rotation: extra.rotation != null ? extra.rotation : 0,
    u_offsetX: extra.offsetX != null ? extra.offsetX : 0,
    u_offsetY: extra.offsetY != null ? extra.offsetY : 0,
    u_originX: defaultObjectSizing.originX,
    u_originY: defaultObjectSizing.originY,
    u_worldWidth: defaultObjectSizing.worldWidth,
    u_worldHeight: defaultObjectSizing.worldHeight,
  };
}

function track(mount, kind, sync) {
  if (!mount) return null;
  mounts.push({ mount: mount, kind: kind, sync: sync || null });
  return mount;
}

function applyPageDitherShell(cfg) {
  var bgEl = document.querySelector('.hp2-bg');
  if (bgEl) bgEl.style.backgroundColor = cfg.background;
  if (document.body.classList.contains('hp2-exp')) {
    document.body.style.backgroundColor = cfg.background;
  }
}

/**
 * Paper Dithering bg — from export @paper-design/shaders-react@0.0.80
 * Light: https://app.paper.design/.../9R-0
 * Dark:  https://app.paper.design/.../9M-0
 */
function mountPageDither(el) {
  if (!el) return null;
  var dark = isDark();
  var cfg = dark ? PAGE_DITHER.dark : PAGE_DITHER.light;
  applyPageDitherShell(cfg);

  var uniforms = Object.assign(sizing({ scale: PAGE_DITHER.scale, fit: 'cover' }), {
    u_colorBack: getShaderColorFromString(cfg.colorBack),
    u_colorFront: getShaderColorFromString(cfg.colorFront),
    u_shape: DitheringShapes[PAGE_DITHER.shape],
    u_type: DitheringTypes[PAGE_DITHER.type],
    u_pxSize: PAGE_DITHER.size,
  });

  var mount = new ShaderMount(
    el,
    ditheringFragmentShader,
    uniforms,
    undefined,
    reduceMotion() ? 0 : PAGE_DITHER.speed,
    cfg.frame
  );

  return track(mount, 'page-dither', function (m) {
    var next = isDark() ? PAGE_DITHER.dark : PAGE_DITHER.light;
    applyPageDitherShell(next);
    m.setUniforms({
      u_colorBack: getShaderColorFromString(next.colorBack),
      u_colorFront: getShaderColorFromString(next.colorFront),
    });
    if (typeof m.setFrame === 'function') {
      m.setFrame(next.frame);
    }
  });
}

function mountGrain(el) {
  if (!el) return null;
  var bg = pageBg();
  var dark = isDark();
  var colors = dark
    ? [
        getShaderColorFromString('#1a1a1a'),
        getShaderColorFromString('#2c2c2c'),
        getShaderColorFromString('#4285F4'),
        getShaderColorFromString('#121212'),
      ]
    : [
        getShaderColorFromString('#f0f0f0'),
        getShaderColorFromString('#e4e4e4'),
        getShaderColorFromString('#4285F4'),
        getShaderColorFromString('#f7f7f7'),
      ];
  while (colors.length < 7) {
    colors.push(getShaderColorFromString('rgba(0,0,0,0)'));
  }
  var uniforms = Object.assign(sizing({ scale: 1.2, fit: 'cover' }), {
    u_colorBack: getShaderColorFromString(bg),
    u_colors: colors,
    u_colorsCount: 4,
    u_softness: 0.75,
    u_intensity: 0.35,
    u_noise: 0.4,
    u_shape: GrainGradientShapes.corners,
  });
  if (noiseTex && noiseTex.complete) {
    uniforms.u_noiseTexture = noiseTex;
  }
  var mount = new ShaderMount(
    el,
    grainGradientFragmentShader,
    uniforms,
    undefined,
    reduceMotion() ? 0 : 0.12,
    0
  );
  return track(mount, 'grain', function (m) {
    var nextBg = pageBg();
    var nextDark = isDark();
    var next = nextDark
      ? [
          getShaderColorFromString('#1a1a1a'),
          getShaderColorFromString('#2c2c2c'),
          getShaderColorFromString('#4285F4'),
          getShaderColorFromString('#121212'),
        ]
      : [
          getShaderColorFromString('#f0f0f0'),
          getShaderColorFromString('#e4e4e4'),
          getShaderColorFromString('#4285F4'),
          getShaderColorFromString('#f7f7f7'),
        ];
    while (next.length < 7) next.push(getShaderColorFromString('rgba(0,0,0,0)'));
    m.setUniforms({
      u_colorBack: getShaderColorFromString(nextBg),
      u_colors: next,
    });
  });
}

function mountDither(el) {
  if (!el) return null;
  var front = el.getAttribute('data-color') || '#4285F4';
  var uniforms = Object.assign(sizing({ scale: 1.15 }), {
    u_colorBack: getShaderColorFromString(pageBg()),
    u_colorFront: getShaderColorFromString(front),
    u_shape: DitheringShapes.sphere,
    u_type: DitheringTypes['8x8'],
    u_pxSize: 3.5,
  });
  var mount = new ShaderMount(
    el,
    ditheringFragmentShader,
    uniforms,
    undefined,
    reduceMotion() ? 0 : 0.14,
    0
  );
  return track(mount, 'dither', function (m) {
    m.setUniforms({ u_colorBack: getShaderColorFromString(pageBg()) });
  });
}

function syncAll() {
  for (var i = 0; i < mounts.length; i++) {
    var entry = mounts[i];
    if (entry.sync && entry.mount && typeof entry.mount.setUniforms === 'function') {
      entry.sync(entry.mount);
    }
  }
}

function hash2(x, y) {
  var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Static white-square pixel edges (hero + project cards). */
function initPixelFrame(root) {
  var frames = root.querySelectorAll('[data-hp2-pixel-frame]');
  if (!frames.length) return;

  var painters = [];

  frames.forEach(function (frame) {
    var canvas = frame.querySelector('.hp2-pixel-mask');
    var img = frame.querySelector('img');
    if (!canvas || !img) return;
    var ctx = canvas.getContext('2d');

    function paint() {
      var w = frame.clientWidth;
      var h = frame.clientHeight;
      if (w < 2 || h < 2) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var cell = Math.max(10, Math.round(w / 48));
      var cols = Math.ceil(w / cell);
      var rows = Math.ceil(h / cell);
      var fill = isDark() ? '#000000' : '#ffffff';
      ctx.fillStyle = fill;

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var ny = r / rows;
          var topBand = ny < 0.28;
          var botBand = ny > 0.78;
          if (!topBand && !botBand) continue;
          var dens = topBand ? 1 - ny / 0.28 : (ny - 0.78) / 0.22;
          dens = Math.max(0, Math.min(1, dens));
          if (hash2(c, r) > dens * 0.92) continue;
          if (dens < 0.35 && hash2(c + 3, r + 5) > 0.35) continue;
          ctx.fillRect(c * cell, r * cell, cell, cell);
        }
      }
    }

    painters.push(paint);

    if (img.complete) paint();
    else img.addEventListener('load', paint, { once: true });
  });

  function paintAll() {
    for (var i = 0; i < painters.length; i++) painters[i]();
  }

  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(paintAll, 100);
  });

  var obs = new MutationObserver(function () {
    requestAnimationFrame(paintAll);
  });
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

/** Apple-style full-bleed horizontal shelf. */
function initShelf(root) {
  var shelf = root.querySelector('[data-hp2-shelf]');
  if (!shelf) return;
  var rail = shelf.querySelector('[data-hp2-shelf-rail]');
  var prev = shelf.querySelector('[data-hp2-shelf-prev]');
  var next = shelf.querySelector('[data-hp2-shelf-next]');
  if (!rail) return;

  function cardStep() {
    var card = rail.querySelector('.hp2-shelf-card');
    if (!card) return 320;
    var styles = getComputedStyle(rail);
    var gap = parseFloat(styles.columnGap || styles.gap) || 20;
    return card.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    var max = rail.scrollWidth - rail.clientWidth - 2;
    if (prev) prev.disabled = rail.scrollLeft <= 2;
    if (next) next.disabled = rail.scrollLeft >= max;
  }

  function scrollByDir(dir) {
    rail.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
    setTimeout(updateButtons, 350);
  }

  if (prev) prev.addEventListener('click', function () { scrollByDir(-1); });
  if (next) next.addEventListener('click', function () { scrollByDir(1); });
  rail.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
}

function boot() {
  try {
    noiseTex = getShaderNoiseTexture();
  } catch (e) {
    noiseTex = null;
  }

  function safeMount(el) {
    var kind = el.getAttribute('data-hp2');
    try {
      if (kind === 'page-noise') mountPageDither(el);
      else if (kind === 'hero-grain') mountGrain(el);
    } catch (err) {
      console.warn('[hp2] shader mount failed:', kind, err);
    }
  }

  function mountAll() {
    document.querySelectorAll('[data-hp2]').forEach(safeMount);
  }

  if (noiseTex && !noiseTex.complete) {
    noiseTex.addEventListener('load', mountAll, { once: true });
    noiseTex.addEventListener(
      'error',
      function () {
        noiseTex = null;
        mountAll();
      },
      { once: true }
    );
  } else {
    mountAll();
  }

  var root = document.getElementById('page-home') || document.body;
  initPixelFrame(root);
  initShelf(root);

  var obs = new MutationObserver(function () {
    requestAnimationFrame(syncAll);
  });
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
