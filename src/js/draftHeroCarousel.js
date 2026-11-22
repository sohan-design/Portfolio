/**
 * Hero carousel — hard cuts on a fixed 800ms interval.
 * All frames are decoded before the reel starts so swaps never stall.
 */
var INTERVAL_MS = 800;

export function initDraftHeroCarousels(root) {
  var scope = root || document;
  var nodes = scope.querySelectorAll('[data-td-carousel]');
  Array.prototype.forEach.call(nodes, function (el) {
    mountCarousel(el);
  });
}

function mountCarousel(root) {
  if (root.dataset.carouselReady) return;
  root.dataset.carouselReady = '1';

  var viewport = root.querySelector('.td-hero-carousel-viewport') || root;
  var nodes = viewport.querySelectorAll('img');
  if (nodes.length < 2) return;

  var frames = [];
  Array.prototype.forEach.call(nodes, function (node) {
    frames.push({
      src: node.getAttribute('src'),
      alt: node.getAttribute('alt') || '',
      shadow: node.getAttribute('data-shadow') || '',
    });
  });

  var img = document.createElement('img');
  img.className = 'td-hero-carousel-slide is-active';
  img.alt = frames[0].alt;
  img.src = frames[0].src;
  img.setAttribute('draggable', 'false');
  if (frames[0].shadow) root.style.setProperty('--td-figure-shadow', frames[0].shadow);
  viewport.replaceChildren(img);

  var index = 0;
  var timer = 0;
  var reduceMotion =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i) {
    index = i;
    var frame = frames[index];
    img.src = frame.src;
    img.alt = frame.alt;
    if (frame.shadow) root.style.setProperty('--td-figure-shadow', frame.shadow);
  }

  function tick() {
    show((index + 1) % frames.length);
  }

  function start() {
    stop();
    if (reduceMotion) return;
    timer = window.setInterval(tick, INTERVAL_MS);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = 0;
  }

  function decodeAll() {
    return Promise.all(
      frames.map(function (frame) {
        var warm = new Image();
        warm.src = frame.src;
        if (warm.decode) {
          return warm.decode().catch(function () {});
        }
        return new Promise(function (resolve) {
          warm.onload = warm.onerror = resolve;
        });
      })
    );
  }

  if (typeof document.hidden === 'boolean') {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (!reduceMotion) start();
    });
  }

  // Show first frame immediately; start the reel only after the set is decoded.
  decodeAll().then(function () {
    if (!reduceMotion) start();
  });
}
