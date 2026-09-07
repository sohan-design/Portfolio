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

/** Pixel border: knock out edge squares so the page shader shows through. */
function initPixelFrame(root) {
  var frames = root.querySelectorAll('[data-hp2-pixel-frame]');
  if (!frames.length) return;

  var painters = [];

  frames.forEach(function (frame) {
    var canvas = frame.querySelector('.hp2-pixel-mask');
    var img = frame.querySelector('img');
    if (!canvas || !img) return;
    var ctx = canvas.getContext('2d');

    function coverImage(w, h) {
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;
      var scale = Math.max(w / iw, h / ih);
      var dw = iw * scale;
      var dh = ih * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

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
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      coverImage(w, h);

      var cell = Math.max(10, Math.round(w / 48));
      var cols = Math.ceil(w / cell);
      var rows = Math.ceil(h / cell);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000';

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var nx = c / cols;
          var ny = r / rows;
          var top = ny < 0.16 ? 1 - ny / 0.16 : 0;
          var bot = ny > 0.84 ? (ny - 0.84) / 0.16 : 0;
          var left = nx < 0.1 ? 1 - nx / 0.1 : 0;
          var right = nx > 0.9 ? (nx - 0.9) / 0.1 : 0;
          var dens = Math.max(top, bot, left, right);
          if (dens <= 0) continue;
          if (hash2(c, r) > dens * 0.92) continue;
          if (dens < 0.4 && hash2(c + 3, r + 5) > 0.4) continue;
          ctx.globalAlpha = 1;
          ctx.fillRect(c * cell, r * cell, cell, cell);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      frame.classList.add('is-cut');
    }

    painters.push(paint);

    if (img.complete && img.naturalWidth) paint();
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

/**
 * Pixel cursor trail (thebrowser.company): 5px rectangles in #0C50FF.
 * Native pointer stays visible.
 */
function initPixelTrail() {
  document.documentElement.classList.remove('pixel-cursor');

  var fine =
    window.matchMedia &&
    matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  var canvas = document.querySelector('[data-pixel-trail]');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var cell = 5;
  var fade = 500;
  var maxStamps = 96;
  var color = '#0C50FF';
  var stamps = [];
  var seen = Object.create(null);
  var lastX = null;
  var lastY = null;
  var cursorX = null;
  var cursorY = null;
  var raf = 0;
  var running = false;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function stampCell(sx, sy, now) {
    var key = sx + ':' + sy;
    if (seen[key]) return;
    seen[key] = 1;
    stamps.push({ x: sx, y: sy, t: now });
    if (stamps.length > maxStamps) {
      var dropped = stamps.shift();
      delete seen[dropped.x + ':' + dropped.y];
    }
  }

  function stamp(x, y) {
    var now = performance.now();
    var sx = Math.floor(x / cell) * cell;
    var sy = Math.floor(y / cell) * cell;
    cursorX = sx;
    cursorY = sy;

    if (lastX == null) {
      stampCell(sx, sy, now);
      lastX = sx;
      lastY = sy;
      return;
    }

    var dx = sx - lastX;
    var dy = sy - lastY;
    var steps = Math.max(Math.abs(dx), Math.abs(dy)) / cell;
    if (steps < 1) {
      stampCell(sx, sy, now);
    } else {
      for (var i = 1; i <= steps; i++) {
        var px = Math.round(lastX + (dx * i) / steps);
        var py = Math.round(lastY + (dy * i) / steps);
        stampCell(Math.floor(px / cell) * cell, Math.floor(py / cell) * cell, now);
      }
    }

    lastX = sx;
    lastY = sy;
  }

  function draw(now) {
    raf = 0;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var alive = [];
    ctx.fillStyle = color;
    for (var i = 0; i < stamps.length; i++) {
      var s = stamps[i];
      var age = now - s.t;
      if (age >= fade) {
        delete seen[s.x + ':' + s.y];
        continue;
      }
      var a = 1 - age / fade;
      ctx.globalAlpha = a * a;
      ctx.fillRect(s.x, s.y, cell, cell);
      alive.push(s);
    }
    ctx.globalAlpha = 1;
    if (cursorX != null) {
      ctx.fillStyle = color;
      ctx.fillRect(cursorX, cursorY, cell, cell);
    }
    stamps = alive;
    if (alive.length || cursorX != null) {
      running = true;
      raf = requestAnimationFrame(draw);
    } else {
      running = false;
    }
  }

  function kick() {
    if (!running) {
      running = true;
      raf = requestAnimationFrame(draw);
    }
  }

  document.addEventListener(
    'mousemove',
    function (e) {
      stamp(e.clientX, e.clientY);
      kick();
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', function () {
    lastX = null;
    lastY = null;
    cursorX = null;
    cursorY = null;
  });

  window.addEventListener('resize', resize);
  resize();
}

/**
 * Avatar hover: starts straight, tilts on hover + cycling cursor badge.
 */
function initAvatarCursor() {
  var fine =
    window.matchMedia &&
    matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;

  var cursor = document.getElementById('cursor');
  var avatar = document.querySelector('.hero-avatar[data-cursor-cycle], .avatar[data-cursor-cycle]');
  if (!cursor || !avatar) return;

  var textEl = cursor.querySelector('.cursor-text');
  if (!textEl) return;

  var MSGS = [
    'Hi.',
    "I'm from Nagpur.",
    'Oranges? Not my client.',
    'Still hovering? Scroll down.',
    'Thought you were bored?',
    'Dare you. Hover again.',
  ];
  var idx = 0;
  var mx = 0;
  var my = 0;
  var raf = 0;

  function place() {
    raf = 0;
    var x = mx - cursor.offsetWidth / 2;
    var y = my - cursor.offsetHeight / 2;
    cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  document.addEventListener(
    'mousemove',
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (cursor.classList.contains('show') && !raf) {
        raf = requestAnimationFrame(place);
      }
    },
    { passive: true }
  );

  function showMsg() {
    var txt = MSGS[idx];
    idx = (idx + 1) % MSGS.length;
    textEl.textContent = '';
    String(txt)
      .split('|')
      .forEach(function (part, i) {
        if (i) textEl.appendChild(document.createElement('br'));
        textEl.appendChild(document.createTextNode(part));
      });
    textEl.classList.add('has');
    avatar.classList.add('avatar-cursor-active');
    cursor.classList.add('show');
    place();
  }

  function hide() {
    cursor.classList.remove('show');
    avatar.classList.remove('avatar-cursor-active');
  }

  avatar.addEventListener('mouseenter', showMsg);
  avatar.addEventListener('mouseleave', hide);
  avatar.addEventListener('focus', showMsg);
  avatar.addEventListener('blur', hide);
}

/** Dark CTA pixel wave — static valley, scratches on scroll then settles. */
function initCtaPixelWave(root) {
  var section = root.querySelector('.site-cta--pixel');
  var canvas = root.querySelector('[data-cta-wave]');
  if (!section || !canvas) return;

  var ctx = canvas.getContext('2d');
  var reduce =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Same blues in light and dark: statue field + cursor trail #0C50FF. */
  var COLORS = ['#0C50FF', '#1A4ADF', '#3D74FF', '#0A38C4', '#6A96FF'];
  var ghost = 'rgba(12, 80, 255, 0.22)';
  var cell = 10;
  var cols = 0;
  var rows = 0;
  var base = null; // Int8: 0 empty, 1–5 color index
  var scratch = null; // Float32 offsets 0..1 decay
  var scratchEnergy = 0;
  var lastY = window.scrollY || 0;
  var raf = 0;
  var settling = false;

  function hash(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function waveHeight(nx) {
    // Valley in the center, taller on the sides (concave from above)
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
          // Solid body of the wave — bottom edge is always filled
          var dens = fromBottom < 2 ? 1 : 0.92 - (fromBottom / Math.max(1, fillRows)) * 0.18;
          if (hash(c, r) < dens) {
            base[i] = 1 + Math.floor(hash(c + 9, r + 3) * COLORS.length);
          }
        } else if (fromBottom < fillRows + 4) {
          // Sparse spray / ghost dots above the crest
          var spray = 0.18 * (1 - (fromBottom - fillRows) / 4);
          if (hash(c + 2, r + 7) < spray) {
            base[i] = 1 + Math.floor(hash(c + 4, r) * 3);
          }
        } else if (fromBottom < fillRows + 10 && hash(c * 3, r * 5) < 0.045) {
          // faint grid dots higher up
          base[i] = -1; // draw as muted grey
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

  // Scratch only — wave stays flush to the footer edge (no lift / gap).
  function applyRise() {}

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
    applyRise();
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

    // Band walks across the wave with scroll, then the pixels slide and fall back.
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
    var y = window.scrollY || 0;
    var dy = y - lastY;
    lastY = y;
    applyRise();
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
    if (scratch) scratch.fill(0);
    settling = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    paint(performance.now());
    applyRise();
    kick();
  }

  resize();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    clearTimeout(section._ctaWaveT);
    section._ctaWaveT = setTimeout(resize, 120);
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
  initPixelTrail();
  initAvatarCursor();
  initCtaPixelWave(root);

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
