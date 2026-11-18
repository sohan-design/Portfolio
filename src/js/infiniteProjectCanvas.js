/**
 * Infinite pan canvas for Best Projects — 300px tiles, dotted backgrid,
 * pointer-drag with soft grab catch + ease-out coast (Emil / design-eng).
 */
var TILE = 300;
var GAP = 48;
var STRIDE = TILE + GAP;
var COLS = 7;
/** Base per-frame friction at 60fps; applied frame-independently on release. */
var COAST_FRICTION = 0.94;
/** Extra damping once slow — soft landing instead of a hard stop. */
var COAST_SOFT_FRICTION = 0.86;
var COAST_SOFT_SPEED = 1.6;
var MIN_VEL = 0.08;
/** Grab eases into 1:1 tracking over this window (ease-out). */
var GRAB_CATCH_MS = 140;
var VEL_SAMPLE_MS = 100;
var DOT_STEP = 18;
var MAX_DPR = 1.5;

/** Strong ease-out: starts fast, settles soft — cubic-bezier(0.23, 1, 0.32, 1). */
function easeOutGrab(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  // Approx of (0.23, 1, 0.32, 1): 1 - (1-t)^3 with a quicker start
  var u = 1 - t;
  return 1 - u * u * u * (1 - t * 0.35);
}

var TILE_SRCS = [
  '/assets/tech-for-humans/tile-01.webp',
  '/assets/tech-for-humans/tile-02.webp',
  '/assets/tech-for-humans/tile-03.webp',
  '/assets/tech-for-humans/tile-04.webp',
  '/assets/tech-for-humans/tile-05.webp',
  '/assets/tech-for-humans/tile-06.webp',
  '/assets/tech-for-humans/tile-07.webp',
  '/assets/tech-for-humans/tile-08.webp',
  '/assets/tech-for-humans/tile-09.webp',
  '/assets/tech-for-humans/tile-10.webp',
  '/assets/tech-for-humans/tile-11.webp',
  '/assets/tech-for-humans/tile-12.webp',
  '/assets/tech-for-humans/tile-13.webp',
  '/assets/tech-for-humans/tile-14.webp',
  '/assets/tech-for-humans/tile-15.webp',
  '/assets/tech-for-humans/tile-16.webp',
  '/assets/tech-for-humans/tile-17.webp',
  '/assets/tech-for-humans/tile-18.webp',
  '/assets/tech-for-humans/tile-19.webp',
  '/assets/tech-for-humans/tile-20.webp',
  '/assets/tech-for-humans/tile-21.webp',
  '/assets/tech-for-humans/tile-22.webp',
  '/assets/tech-for-humans/tile-23.webp',
  '/assets/tech-for-humans/tile-24.webp',
  '/assets/tech-for-humans/tile-25.webp',
  '/assets/tech-for-humans/tile-26.webp',
  '/assets/tech-for-humans/tile-27.webp',
  '/assets/tech-for-humans/tile-28.webp',
  '/assets/tech-for-humans/tile-29.webp',
  '/assets/tech-for-humans/tile-30.webp',
  '/assets/tech-for-humans/tile-31.webp',
  '/assets/tech-for-humans/tile-32.webp',
  '/assets/tech-for-humans/tile-33.webp',
  '/assets/tech-for-humans/tile-34.webp',
  '/assets/tech-for-humans/tile-35.webp',
  '/assets/tech-for-humans/tile-36.webp',
  '/assets/tech-for-humans/tile-37.webp',
];

export function initInfiniteProjectCanvases(root) {
  var scope = root || document;
  var nodes = scope.querySelectorAll('[data-infinite-canvas]');
  Array.prototype.forEach.call(nodes, function (el) {
    mount(el);
  });
}

function mount(host) {
  if (host.__infiniteCanvasMounted) return;
  host.__infiniteCanvasMounted = true;

  var canvas = host.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    host.appendChild(canvas);
  }
  var ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) return;

  var rows = Math.ceil(TILE_SRCS.length / COLS);
  var periodX = COLS * STRIDE;
  var periodY = rows * STRIDE;

  var offsetX = periodX * 0.15;
  var offsetY = periodY * 0.12;
  var velX = 0;
  var velY = 0;
  var dragging = false;
  var moved = false;
  var lastX = 0;
  var lastY = 0;
  var lastT = 0;
  var grabStartT = 0;
  var samples = [];
  var raf = 0;
  var needsDraw = true;
  var reduceMotion =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var images = new Array(TILE_SRCS.length);
  var loadQueue = TILE_SRCS.map(function (src, index) {
    return { src: src, index: index };
  });
  var loading = 0;
  var MAX_PARALLEL = 4;

  function pumpLoads() {
    while (loading < MAX_PARALLEL && loadQueue.length) {
      (function (job) {
        loading += 1;
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () {
          images[job.index] = img;
          loading -= 1;
          needsDraw = true;
          schedule();
          pumpLoads();
        };
        img.onerror = function () {
          loading -= 1;
          pumpLoads();
        };
        img.src = job.src;
      })(loadQueue.shift());
    }
  }

  function wrap(v, period) {
    v = v % period;
    if (v < 0) v += period;
    return v;
  }

  function resize() {
    var rect = host.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    var bw = Math.round(w * dpr);
    var bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    needsDraw = true;
    schedule();
  }

  function drawDots(w, h, ox, oy, dark) {
    var color = dark ? 'rgba(80, 120, 255, 0.28)' : 'rgba(0, 0, 0, 0.16)';
    ctx.fillStyle = color;
    var startX = -wrap(ox, DOT_STEP);
    var startY = -wrap(oy, DOT_STEP);
    for (var y = startY; y < h + DOT_STEP; y += DOT_STEP) {
      for (var x = startX; x < w + DOT_STEP; x += DOT_STEP) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  }

  function tileIndex(col, row) {
    var c = ((col % COLS) + COLS) % COLS;
    var r = ((row % rows) + rows) % rows;
    var i = r * COLS + c;
    if (i >= TILE_SRCS.length) return -1;
    return i;
  }

  function draw() {
    needsDraw = false;
    var w = host.clientWidth;
    var h = host.clientHeight;
    if (w < 1 || h < 1) return;

    var dark =
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      matchMedia('(prefers-color-scheme: dark)').matches;

    ctx.fillStyle = dark ? '#050508' : '#f4f4f6';
    ctx.fillRect(0, 0, w, h);

    var ox = wrap(offsetX, periodX);
    var oy = wrap(offsetY, periodY);
    drawDots(w, h, ox, oy, dark);

    var col0 = Math.floor((-ox) / STRIDE) - 1;
    var row0 = Math.floor((-oy) / STRIDE) - 1;
    var col1 = Math.ceil((w - ox) / STRIDE) + 1;
    var row1 = Math.ceil((h - oy) / STRIDE) + 1;

    for (var row = row0; row <= row1; row++) {
      for (var col = col0; col <= col1; col++) {
        var idx = tileIndex(col, row);
        if (idx < 0) continue;
        var img = images[idx];
        if (!img) continue;
        var x = ox + col * STRIDE;
        var y = oy + row * STRIDE;
        if (x > w || y > h || x + TILE < 0 || y + TILE < 0) continue;
        ctx.drawImage(img, x, y, TILE, TILE);
      }
    }
  }

  function pushSample(t, x, y) {
    samples.push({ t: t, x: x, y: y });
    var cutoff = t - VEL_SAMPLE_MS;
    while (samples.length > 1 && samples[0].t < cutoff) samples.shift();
  }

  function velocityFromSamples() {
    if (samples.length < 2) return { x: velX, y: velY };
    var a = samples[0];
    var b = samples[samples.length - 1];
    var dt = Math.max(1, b.t - a.t);
    return {
      x: ((b.x - a.x) / dt) * 16.67,
      y: ((b.y - a.y) / dt) * 16.67,
    };
  }

  function tick(now) {
    raf = 0;
    var t = typeof now === 'number' ? now : performance.now();
    if (!dragging && !reduceMotion && (Math.abs(velX) > MIN_VEL || Math.abs(velY) > MIN_VEL)) {
      var dt = Math.min(32, Math.max(8, t - (lastT || t)));
      lastT = t;
      // Frame-independent ease-out coast
      var speed = Math.hypot(velX, velY);
      var friction = speed < COAST_SOFT_SPEED ? COAST_SOFT_FRICTION : COAST_FRICTION;
      var decay = Math.pow(friction, dt / 16.67);
      offsetX += velX * (dt / 16.67);
      offsetY += velY * (dt / 16.67);
      velX *= decay;
      velY *= decay;
      if (Math.hypot(velX, velY) <= MIN_VEL) {
        velX = 0;
        velY = 0;
      }
      needsDraw = true;
    }
    if (needsDraw) draw();
    if (!dragging && (Math.abs(velX) > MIN_VEL || Math.abs(velY) > MIN_VEL || needsDraw)) {
      raf = requestAnimationFrame(tick);
    }
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function onPointerDown(e) {
    if (e.button != null && e.button !== 0) return;
    dragging = true;
    moved = false;
    // Interruptible: don't hard-kill coast — finger takes over with soft catch
    grabStartT = performance.now();
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = grabStartT;
    samples = [{ t: grabStartT, x: e.clientX, y: e.clientY }];
    host.classList.add('is-dragging');
    try {
      host.setPointerCapture(e.pointerId);
    } catch (_) {}
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging) return;
    var now = performance.now();
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) moved = true;

    // Soft grab: ease-out into 1:1 tracking over GRAB_CATCH_MS
    var catchT = easeOutGrab((now - grabStartT) / GRAB_CATCH_MS);
    offsetX += dx * catchT;
    offsetY += dy * catchT;

    // Residual coast blends out as the grab catches
    if (catchT < 1 && (velX || velY)) {
      offsetX += velX * (1 - catchT) * 0.35;
      offsetY += velY * (1 - catchT) * 0.35;
      velX *= 0.82;
      velY *= 0.82;
    } else {
      velX = 0;
      velY = 0;
    }

    lastX = e.clientX;
    lastY = e.clientY;
    lastT = now;
    pushSample(now, e.clientX, e.clientY);
    needsDraw = true;
    schedule();
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    host.classList.remove('is-dragging');
    try {
      host.releasePointerCapture(e.pointerId);
    } catch (_) {}
    if (reduceMotion) {
      velX = 0;
      velY = 0;
    } else {
      var v = velocityFromSamples();
      // Hand off finger velocity into ease-out coast
      velX = v.x;
      velY = v.y;
      lastT = performance.now();
    }
    samples = [];
    schedule();
  }

  host.addEventListener('pointerdown', onPointerDown);
  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerUp);
  host.addEventListener('lostpointercapture', onPointerUp);
  host.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });
  host.addEventListener('click', function (e) {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  var ro =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(function () {
          resize();
        })
      : null;
  if (ro) ro.observe(host);
  else window.addEventListener('resize', resize);

  var themeObs =
    typeof MutationObserver !== 'undefined'
      ? new MutationObserver(function () {
          needsDraw = true;
          schedule();
        })
      : null;
  if (themeObs) {
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  resize();
  pumpLoads();
  schedule();
}
