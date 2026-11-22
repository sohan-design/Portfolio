/**
 * Homepage paper shaders + pixel frame + more-work shelf.
 */
import {
  ShaderMount,
  ditheringFragmentShader,
  DitheringShapes,
  DitheringTypes,
  ShaderFitOptions,
  defaultObjectSizing,
  getShaderColorFromString,
} from '@paper-design/shaders';

var mounts = [];

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
 * Paper Dithering bg â€” from export @paper-design/shaders-react@0.0.80
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


/** About gallery — infinite horizontal auto-scroll marquee. */
function initAboutMarquee(shelf) {
  var rail = shelf.querySelector('[data-hp2-shelf-rail]');
  var prev = shelf.querySelector('[data-hp2-shelf-prev]');
  var next = shelf.querySelector('[data-hp2-shelf-next]');
  if (!rail || rail.dataset.marqueeReady) return;
  rail.dataset.marqueeReady = '1';

  var originals = Array.prototype.slice.call(rail.querySelectorAll('.hp2-shelf-card'));
  if (!originals.length) return;

  var track = document.createElement('div');
  track.className = 'ab-marquee-track';
  // Bento rhythm: each photo gets a size variant + a small colour block after it.
  var unit = [];
  originals.forEach(function (card, i) {
    card.classList.add('ab-tile', 'ab-tile--v' + (i % 3));
    track.appendChild(card);
    unit.push(card);
    var accent = document.createElement('span');
    accent.className = 'ab-accent ab-accent--v' + (i % 3);
    accent.setAttribute('aria-hidden', 'true');
    track.appendChild(accent);
    unit.push(accent);
  });
  originals = unit;
  rail.appendChild(track);
  shelf.classList.add('ab-shelf--marquee');

  function cloneCard(card) {
    var clone = card.cloneNode(true);
    clone.setAttribute('data-ab-clone', '');
    clone.setAttribute('aria-hidden', 'true');
    var img = clone.querySelector('img');
    if (img) {
      img.setAttribute('data-ab-clone', '');
      img.removeAttribute('loading');
    }
    return clone;
  }

  var reduce =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = {
    loopWidth: 0,
    offset: 0,
    paused: false,
    hover: false,
    speed: 0.55,
    last: 0,
  };
  shelf._abMarquee = state;

  function rebuild() {
    Array.prototype.slice.call(track.querySelectorAll('[data-ab-clone]')).forEach(function (node) {
      node.remove();
    });

    // Grow one set until it spans the rail, then duplicate that set once.
    var guard = 0;
    while (track.scrollWidth < rail.clientWidth * 1.15 && guard < 8) {
      originals.forEach(function (card) {
        track.appendChild(cloneCard(card));
      });
      guard += 1;
    }

    var baseCards = Array.prototype.slice.call(track.children);
    var baseCount = baseCards.length;
    baseCards.forEach(function (card) {
      track.appendChild(cloneCard(card));
    });

    // Exact loop distance: first original → first clone.
    var first = track.children[0];
    var twin = track.children[baseCount];
    state.loopWidth = twin && first ? twin.offsetLeft - first.offsetLeft : Math.round(track.scrollWidth / 2);

    if (state.loopWidth > 0 && state.offset >= state.loopWidth) {
      state.offset = state.offset % state.loopWidth;
    }
    track.style.transform = 'translate3d(' + -state.offset + 'px,0,0)';
  }

  rebuild();

  if (reduce) {
    shelf.classList.add('ab-shelf--static');
    return;
  }

  function syncPaused() {
    var ae = document.activeElement;
    var focusOnControls = !!(ae && ae.closest && ae.closest('.hp2-shelf-controls') && shelf.contains(ae));
    state.paused = state.hover || focusOnControls;
  }

  function step() {
    if (state.paused || state.loopWidth <= 0) return;
    state.offset += state.speed;
    if (state.offset >= state.loopWidth) state.offset -= state.loopWidth;
    track.style.transform = 'translate3d(' + -state.offset + 'px,0,0)';
  }

  if (shelf._marqueeTimer) clearInterval(shelf._marqueeTimer);
  if (shelf._marqueeRaf) cancelAnimationFrame(shelf._marqueeRaf);
  // Interval keeps crawling even when rAF is throttled (background / embedded preview).
  shelf._marqueeTimer = setInterval(step, 16);

  shelf.addEventListener('mouseenter', function () { state.hover = true; syncPaused(); });
  shelf.addEventListener('mouseleave', function () { state.hover = false; syncPaused(); state.last = 0; });
  shelf.addEventListener('focusin', syncPaused);
  shelf.addEventListener('focusout', function () {
    window.setTimeout(syncPaused, 0);
  });

  function nudge(dir) {
    var card = track.querySelector('.hp2-shelf-card');
    var accent = track.querySelector('.ab-accent');
    if (!card || !state.loopWidth) return;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
    var step = card.getBoundingClientRect().width + gap +
      (accent ? accent.getBoundingClientRect().width + gap : 0);
    state.offset += dir * step;
    while (state.offset < 0) state.offset += state.loopWidth;
    while (state.offset >= state.loopWidth) state.offset -= state.loopWidth;
    track.style.transform = 'translate3d(' + -state.offset + 'px,0,0)';
  }

  if (prev) {
    prev.disabled = false;
    prev.addEventListener('click', function () { nudge(-1); });
  }
  if (next) {
    next.disabled = false;
    next.addEventListener('click', function () { nudge(1); });
  }

  var resizeT = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(rebuild, 120);
  });
}

/** Apple-style full-bleed horizontal shelf (home More Work + about gallery). */
function initShelf(root) {
  var shelves = (root || document).querySelectorAll('[data-hp2-shelf]');
  Array.prototype.forEach.call(shelves, function (shelf) {
    if (shelf.dataset.shelfReady) return;
    shelf.dataset.shelfReady = '1';

    var rail = shelf.querySelector('[data-hp2-shelf-rail]');
    var prev = shelf.querySelector('[data-hp2-shelf-prev]');
    var next = shelf.querySelector('[data-hp2-shelf-next]');
    if (!rail) return;

    // About page: infinite auto-scroll marquee.
    if (shelf.classList.contains('ab-shelf') || document.body.getAttribute('data-page') === 'about') {
      initAboutMarquee(shelf);
      return;
    }

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
  });
}

function boot() {
  function safeMount(el) {
    var kind = el.getAttribute('data-hp2');
    try {
      if (kind === 'page-noise') mountPageDither(el);
    } catch (err) {
      console.warn('[hp2] shader mount failed:', kind, err);
    }
  }

  function mountAll() {
    document.querySelectorAll('[data-hp2]').forEach(safeMount);
  }

  mountAll();

  var home = document.getElementById('page-home');
  if (home) {
    initPixelFrame(home);
    initAvatarCursor();
  }
  initShelf(document);

  // Repaint in the same task as the theme swap: the view transition snapshots
  // the new frame immediately, so a rAF-deferred sync would capture stale fills.
  document.addEventListener('portfolio:theme-change', syncAll);

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
