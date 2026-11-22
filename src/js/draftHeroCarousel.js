/**
 * Draft hero image carousel — 0.08s crossfade + per-slide colored blur shadow.
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
  var slides = root.querySelectorAll('.td-hero-carousel-slide');
  if (slides.length < 2) {
    if (slides[0]) applyShadow(slides[0]);
    return;
  }

  var index = 0;
  var timer = null;
  var reduceMotion =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyShadow(slide) {
    var shadow = slide.getAttribute('data-shadow');
    if (shadow) root.style.setProperty('--td-figure-shadow', shadow);
  }

  function show(next) {
    var prev = index;
    index = (next + slides.length) % slides.length;
    if (prev === index) return;

    slides[prev].classList.remove('is-active');
    slides[prev].setAttribute('aria-hidden', 'true');
    slides[index].classList.add('is-active');
    slides[index].setAttribute('aria-hidden', 'false');
    applyShadow(slides[index]);
  }

  function next() {
    show(index + 1);
  }

  function start() {
    stop();
    if (reduceMotion) return;
    timer = setInterval(next, INTERVAL_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  applyShadow(slides[index]);
  slides[index].classList.add('is-active');

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) start();
  });

  if (!reduceMotion) start();
}
