/**
 * Footer scene — pixel-art park, re-gridded from the source PNG.
 * The PNG is a smooth upscale, so each cell takes the dominant color of its
 * block in the source. Sky stays transparent; the page color shows through.
 * Dark theme drops the clouds and dims the scene (night).
 */
var SRC = '/assets/footer/park-scene.png';

// Source pixels per cell. Raise for chunkier pixels, lower for finer detail.
var PIXEL = 4;

// Source rows above this are empty sky.
var CROP_TOP = 56;
// Water line: clouds never reach below it.
var WATER_Y = 490;
// Ground band where the artist's label sits; flattened to plain ground.
var LABEL_Y = 526;
var POND_X = 660;
var CLOUD_FRAY_X = 560;
// Everything standing on the grass right of this is cleared.
var CLEAR_X = 440;
var GROUND = [61, 53, 68];

// The white fishing line reads as cloud to the color test, so its path is
// cleared by position (source pixels, rod tip to bobber).
var LINE = { x0: 897, y0: 411, x1: 978, y1: 491 };

// Ground under the grass line, rebuilt as turf over soil.
var TURF_LIGHT = [102, 187, 106];
var TURF_DARK = [57, 142, 61];
var SOIL = [121, 85, 71];
var SOIL_DARK = [95, 66, 58];

// Night grade: a little darker and cooler than the day art.
var NIGHT = [0.7, 0.72, 0.82];

function isCloud(r, g, b, sx, sy) {
  if (sx < 380 || sy >= WATER_Y) return false;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var blue = b > r + 22 && b >= g - 10 && b > 85;
  var pale = r > 175 && g > 195 && b > 210 && max - min < 70;
  return blue || pale;
}

function hash(x, y) {
  var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function isGroundColor(r, g, b) {
  return Math.abs(r - GROUND[0]) < 16 && Math.abs(g - GROUND[1]) < 14 && Math.abs(b - GROUND[2]) < 16;
}

/**
 * Replace the flat ground with turf and soil. Per column: light turf, a
 * jagged dark-grass fringe, a dark soil edge, then soil with darker streaks.
 */
function paintGround(day, cols, rows) {
  var px = day.data;
  var top = [];
  var cx;
  var cy;

  for (cx = 0; cx < cols; cx++) {
    var t = rows;
    for (cy = rows - 1; cy >= 0; cy--) {
      var o = (cy * cols + cx) * 4;
      if (!px[o + 3] || !isGroundColor(px[o], px[o + 1], px[o + 2])) break;
      t = cy;
    }
    top.push(t);
  }
  // The trunk and bushes share the ground's purple and reeds leave stray
  // cells in it, so a column's own scan can land far off. Trust it only near
  // the most common height around it.
  var raw = top.slice();
  for (cx = 0; cx < cols; cx++) {
    var counts = {};
    var mode = raw[cx];
    var best = 0;
    for (var k = -12; k <= 12; k++) {
      var v = raw[Math.min(cols - 1, Math.max(0, cx + k))];
      counts[v] = (counts[v] || 0) + 1;
      if (counts[v] > best || (counts[v] === best && v < mode)) {
        best = counts[v];
        mode = v;
      }
    }
    top[cx] = Math.abs(raw[cx] - mode) <= 2 ? raw[cx] : mode;
  }

  var surface = top.map(function (_, i) {
    var win = top.slice(Math.max(0, i - 2), i + 3).sort(function (a, b) { return a - b; });
    return win[win.length >> 1];
  });

  function set(cx, cy, c) {
    var o = (cy * cols + cx) * 4;
    px[o] = c[0];
    px[o + 1] = c[1];
    px[o + 2] = c[2];
    px[o + 3] = 255;
  }

  // The pond is filled in: the bank's grass line runs on to the right edge,
  // the water above it becomes sky and the red bobber goes with it.
  var pondCol = Math.floor(POND_X / PIXEL);
  var bank = surface[pondCol - 1];

  // The clouds were cut flat by the pond's horizon; fray their bottom edge.
  for (cx = Math.floor(CLOUD_FRAY_X / PIXEL); cx < cols; cx++) {
    var lift = 8 + Math.floor(hash(cx >> 1, 21) * 7) * PIXEL;
    for (cy = 0; cy < rows; cy++) {
      var sy = CROP_TOP + cy * PIXEL + PIXEL / 2;
      if (sy < WATER_Y - lift || sy >= WATER_Y) continue;
      var q = (cy * cols + cx) * 4;
      if (px[q + 3] && isCloud(px[q], px[q + 1], px[q + 2], cx * PIXEL + PIXEL / 2, sy)) px[q + 3] = 0;
    }
  }

  for (cx = pondCol; cx < cols; cx++) surface[cx] = bank;

  // Right of the tree only sky and grass remain: bushes, reeds, dock, rod and
  // line are cleared. The line is thin enough to patch from the cloud beside it.
  var line = lineCells(cols);
  function onLine(x, y) {
    var i = y * cols + x;
    return line[i] || line[i - 1] || line[i + 1];
  }
  function cloudAt(x, y) {
    var o = (y * cols + x) * 4;
    // Bush shadows are navy too, but darker than any cloud shade.
    return px[o + 3] && !onLine(x, y) && px[o + 2] > 140 &&
      isCloud(px[o], px[o + 1], px[o + 2], x * PIXEL + PIXEL / 2, CROP_TOP + y * PIXEL + PIXEL / 2);
  }
  var clearCol = Math.floor(CLEAR_X / PIXEL);
  var patch = [];
  for (cx = clearCol; cx < cols; cx++) {
    for (cy = 0; cy < surface[cx]; cy++) {
      var p = (cy * cols + cx) * 4;
      if (!px[p + 3] || cloudAt(cx, cy)) continue;
      var from = -1;
      if (onLine(cx, cy) && CROP_TOP + cy * PIXEL < WATER_Y) {
        for (var d = 1; d <= 3 && from < 0; d++) {
          if (cx - d >= 0 && cloudAt(cx - d, cy)) from = cx - d;
          else if (cx + d < cols && cloudAt(cx + d, cy)) from = cx + d;
        }
      }
      patch.push([p, from < 0 ? -1 : (cy * cols + from) * 4]);
    }
  }
  patch.forEach(function (e) {
    if (e[1] < 0) {
      px[e[0] + 3] = 0;
      return;
    }
    px[e[0]] = px[e[1]];
    px[e[0] + 1] = px[e[1] + 1];
    px[e[0] + 2] = px[e[1] + 2];
  });

  for (cx = 0; cx < cols; cx++) {
    var s = surface[cx];
    if (s >= rows) continue;

    // Grass tufts rise into the light turf; soil bumps rise into the grass.
    var tuft = Math.floor(hash(cx >> 1, 3) * 3);
    var bump = hash(cx >> 1, 9) < 0.35 ? 1 : 0;
    var lightEnd = s + 4 - tuft;
    var darkEnd = s + 7 - bump;

    for (cy = s; cy < rows; cy++) {
      if (cy < lightEnd) {
        set(cx, cy, TURF_LIGHT);
      } else if (cy < darkEnd) {
        set(cx, cy, TURF_DARK);
      } else if (cy === darkEnd) {
        set(cx, cy, SOIL_DARK);
      } else {
        // Horizontal streaks, a few cells long, like the reference blotches.
        var streak = hash(Math.floor((cx + cy * 3) / 3), cy) < 0.28;
        set(cx, cy, streak ? SOIL_DARK : SOIL);
      }
    }

    // Short, sparse blades on the cleared stretch.
    if (cx >= clearCol && s > 2 && hash(cx, 41) < 0.32) {
      var tall = hash(cx, 43) < 0.35 ? 2 : 1;
      for (var h = 1; h <= tall; h++) set(cx, s - h, h === tall && tall > 1 ? TURF_LIGHT : TURF_DARK);
    }
  }
}

function lineCells(cols) {
  var cells = {};
  var x0 = Math.floor(LINE.x0 / PIXEL);
  var y0 = Math.floor((LINE.y0 - CROP_TOP) / PIXEL);
  var x1 = Math.floor(LINE.x1 / PIXEL);
  var y1 = Math.floor((LINE.y1 - CROP_TOP) / PIXEL);
  var dx = Math.abs(x1 - x0);
  var dy = -Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1;
  var sy = y0 < y1 ? 1 : -1;
  var err = dx + dy;
  while (true) {
    cells[y0 * cols + x0] = true;
    if (x0 === x1 && y0 === y1) break;
    var e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
  return cells;
}

/** Clouds out, stray specks swept, then the night grade. */
function buildNight(day, cols, rows) {
  var src = day.data;
  var night = new ImageData(cols, rows);
  var out = night.data;
  var cx;
  var cy;
  var o;

  for (cy = 0; cy < rows; cy++) {
    for (cx = 0; cx < cols; cx++) {
      o = (cy * cols + cx) * 4;
      if (!src[o + 3]) continue;
      var sx = cx * PIXEL + PIXEL / 2;
      var sy = CROP_TOP + cy * PIXEL + PIXEL / 2;
      if (isCloud(src[o], src[o + 1], src[o + 2], sx, sy)) continue;
      out[o] = src[o];
      out[o + 1] = src[o + 1];
      out[o + 2] = src[o + 2];
      out[o + 3] = 255;
    }
  }

  // Cloud leftovers show up as lone cells in the open sky.
  var lone = [];
  for (cy = 0; cy < rows; cy++) {
    for (cx = 0; cx < cols; cx++) {
      o = (cy * cols + cx) * 4;
      if (!out[o + 3]) continue;
      if (cx * PIXEL < 380 || CROP_TOP + cy * PIXEL >= WATER_Y) continue;
      var near = 0;
      for (var ny = -1; ny <= 1; ny++) {
        for (var nx = -1; nx <= 1; nx++) {
          if (!nx && !ny) continue;
          var x = cx + nx;
          var y = cy + ny;
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          if (out[(y * cols + x) * 4 + 3]) near++;
        }
      }
      if (!near) lone.push(o);
    }
  }
  lone.forEach(function (i) { out[i + 3] = 0; });

  for (o = 0; o < out.length; o += 4) {
    if (!out[o + 3]) continue;
    out[o] = Math.round(out[o] * NIGHT[0]);
    out[o + 1] = Math.round(out[o + 1] * NIGHT[1]);
    out[o + 2] = Math.round(out[o + 2] * NIGHT[2]);
  }

  return night;
}

function buildGrids(img) {
  var W = img.naturalWidth;
  var H = img.naturalHeight;
  var src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  var sctx = src.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(img, 0, 0);
  var data = sctx.getImageData(0, 0, W, H).data;

  var cols = Math.floor(W / PIXEL);
  var rows = Math.floor((H - CROP_TOP) / PIXEL);
  var day = new ImageData(cols, rows);

  for (var cy = 0; cy < rows; cy++) {
    for (var cx = 0; cx < cols; cx++) {
      var x0 = cx * PIXEL;
      var y0 = CROP_TOP + cy * PIXEL;
      var buckets = {};
      var opaque = 0;
      var total = 0;
      var best = null;

      for (var y = y0; y < y0 + PIXEL; y++) {
        for (var x = x0; x < x0 + PIXEL; x++) {
          var i = (y * W + x) * 4;
          total++;
          if (data[i + 3] < 128) continue;
          opaque++;
          var key = (data[i] >> 4) + '-' + (data[i + 1] >> 4) + '-' + (data[i + 2] >> 4);
          var bk = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 });
          bk.n++;
          bk.r += data[i];
          bk.g += data[i + 1];
          bk.b += data[i + 2];
          if (!best || bk.n > best.n) best = bk;
        }
      }

      var o = (cy * cols + cx) * 4;
      if (opaque * 2 < total || !best) continue;

      var r = Math.round(best.r / best.n);
      var g = Math.round(best.g / best.n);
      var b = Math.round(best.b / best.n);

      if (y0 + PIXEL / 2 >= LABEL_Y) {
        r = GROUND[0];
        g = GROUND[1];
        b = GROUND[2];
      }

      day.data[o] = r;
      day.data[o + 1] = g;
      day.data[o + 2] = b;
      day.data[o + 3] = 255;
    }
  }

  paintGround(day, cols, rows);

  return { cols: cols, rows: rows, day: day, night: buildNight(day, cols, rows) };
}

export function initCtaPixelWave(root) {
  var scope = root || document;
  var scene = scope.querySelector('.cta-scene');
  var canvas = scope.querySelector('[data-cta-wave]');
  if (!scene || !canvas || canvas.dataset.waveReady) return;
  canvas.dataset.waveReady = '1';

  var ctx = canvas.getContext('2d');
  var grids = null;

  function paint() {
    if (!grids) return;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, grids.cols, grids.rows);
    ctx.putImageData(dark ? grids.night : grids.day, 0, 0);
  }

  // Body gutters vary per page; pin the scene to the viewport so the ground
  // always reaches both edges.
  function bleed() {
    scene.style.marginLeft = '0px';
    scene.style.width = '';
    var view = document.documentElement.clientWidth;
    var left = scene.getBoundingClientRect().left;
    scene.style.marginLeft = -left + 'px';
    scene.style.width = view + 'px';
  }

  var bleedT = 0;
  function scheduleBleed() {
    clearTimeout(bleedT);
    bleedT = setTimeout(bleed, 60);
  }
  window.addEventListener('resize', scheduleBleed);
  // Catches the scrollbar appearing once the page grows past the viewport.
  if (window.ResizeObserver) {
    new ResizeObserver(scheduleBleed).observe(document.documentElement);
  }
  bleed();

  var img = new Image();
  img.decoding = 'async';
  img.onload = function () {
    grids = buildGrids(img);
    canvas.width = grids.cols;
    canvas.height = grids.rows;
    scene.style.aspectRatio = grids.cols + ' / ' + grids.rows;
    bleed();
    paint();
  };
  img.src = SRC;

  // Same task as the theme swap so the view transition snapshots the new frame.
  document.addEventListener('portfolio:theme-change', paint);
  if (window.MutationObserver) {
    new MutationObserver(paint).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }
}
