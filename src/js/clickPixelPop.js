/**
 * Click pixel pop — + and X rays with short fading trails.
 * Site-wide; skips touch and reduced-motion.
 */
export function initClickPixelPop() {
  var fine =
    window.matchMedia &&
    matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  var color = '#0C50FF';
  var cell = 5;
  var size = 58;
  var duration = 500;
  var trailFade = 420;
  var easeOut = 'cubic-bezier(0.23, 1, 0.32, 1)';
  var layer = document.createElement('div');
  layer.className = 'click-pixel-pop';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  // Eight rays: + (cardinals) and X (diagonals).
  var rayAngles = [
    0,
    Math.PI / 2,
    Math.PI,
    (3 * Math.PI) / 2,
    Math.PI / 4,
    (3 * Math.PI) / 4,
    (5 * Math.PI) / 4,
    (7 * Math.PI) / 4,
  ];

  function easeOutProgress(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function makePixel(parent, x, y, cls) {
    var el = document.createElement('div');
    el.className = cls || 'click-pixel-pop__pixel';
    el.style.width = cell + 'px';
    el.style.height = cell + 'px';
    el.style.left = x - cell / 2 + 'px';
    el.style.top = y - cell / 2 + 'px';
    el.style.background = color;
    parent.appendChild(el);
    return el;
  }

  function stampTrail(parent, x, y, appearAt) {
    var ghost = makePixel(parent, x, y, 'click-pixel-pop__trail');
    ghost.style.opacity = '0';
    ghost.animate(
      [
        { opacity: 0 },
        { opacity: 0.85, offset: 0.08 },
        { opacity: 0 },
      ],
      {
        duration: trailFade,
        delay: appearAt,
        easing: 'linear',
        fill: 'forwards',
      }
    ).onfinish = function () {
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    };
  }

  function dropTrailAlong(parent, x0, y0, x1, y1, count) {
    var seen = Object.create(null);
    for (var i = 0; i <= count; i++) {
      var t = i / count;
      var p = easeOutProgress(t);
      var x = x0 + (x1 - x0) * p;
      var y = y0 + (y1 - y0) * p;
      var sx = Math.round(x / cell) * cell;
      var sy = Math.round(y / cell) * cell;
      var key = sx + ':' + sy;
      if (seen[key]) continue;
      seen[key] = 1;
      stampTrail(parent, sx, sy, Math.round(t * duration * 0.55));
    }
  }

  function flyHead(parent, x0, y0, x1, y1, onDone) {
    var head = makePixel(parent, x0, y0);
    var dx = x1 - x0;
    var dy = y1 - y0;
    var anim = head.animate(
      [
        { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
        {
          transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(1)',
          opacity: 1,
          offset: 0.6,
          easing: easeOut,
        },
        {
          transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0)',
          opacity: 0,
          easing: 'linear',
        },
      ],
      { duration: duration, fill: 'forwards' }
    );
    anim.onfinish = function () {
      if (head.parentNode) head.parentNode.removeChild(head);
      onDone();
    };
  }

  function burst(cx, cy) {
    var wrap = document.createElement('div');
    wrap.className = 'click-pixel-pop__burst';
    wrap.style.left = cx + 'px';
    wrap.style.top = cy + 'px';
    layer.appendChild(wrap);

    var pending = rayAngles.length;
    var cleanupAt = performance.now() + duration + trailFade + 80;

    function done() {
      pending -= 1;
      if (pending > 0) return;
      var wait = Math.max(0, cleanupAt - performance.now());
      setTimeout(function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      }, wait);
    }

    rayAngles.forEach(function (rad) {
      var x1 = Math.cos(rad) * (size * 0.4);
      var y1 = Math.sin(rad) * (size * 0.4);
      dropTrailAlong(wrap, 0, 0, x1, y1, 4);
      flyHead(wrap, 0, 0, x1, y1, done);
    });
  }

  document.addEventListener(
    'click',
    function (e) {
      if (e.button !== 0) return;
      burst(e.clientX, e.clientY);
    },
    true
  );
}
