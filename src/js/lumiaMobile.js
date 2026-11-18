/**
 * Lumia mobile panorama + pivot tabs (≤480px).
 * Active tab is bright; neighbors stay dim; both rails stay in sync.
 */
export function initLumiaMobile() {
  if (!document.getElementById('page-home')) return;

  var panorama = document.querySelector('.lumia-panorama');
  var pivotRail = document.querySelector('[data-lumia-pivot-rail]');
  var hubs = panorama ? panorama.querySelectorAll('[data-lumia-hub]') : [];
  var tabs = pivotRail ? pivotRail.querySelectorAll('[data-lumia-jump]') : [];
  if (!panorama || !pivotRail || !hubs.length || !tabs.length) return;

  var mq = window.matchMedia('(max-width: 480px)');
  var syncing = false;

  function isMobile() {
    return mq.matches;
  }

  function setActive(name) {
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.classList.toggle('is-active', tab.getAttribute('data-lumia-jump') === name);
    });
  }

  function centerPivotTab(name) {
    var tab = pivotRail.querySelector('[data-lumia-jump="' + name + '"]');
    if (!tab) return;
    var left = tab.offsetLeft - 16;
    pivotRail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }

  function scrollToHub(name) {
    if (!isMobile()) return;
    var hub = panorama.querySelector('[data-lumia-hub="' + name + '"]');
    if (!hub) return;
    syncing = true;
    panorama.scrollTo({ left: hub.offsetLeft, behavior: 'smooth' });
    setActive(name);
    centerPivotTab(name);
    setTimeout(function () { syncing = false; }, 420);
  }

  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-lumia-jump');
      if (name) scrollToHub(name);
    });
  });

  var ticking = false;
  function onPanoramaScroll() {
    if (!isMobile() || syncing || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var x = panorama.scrollLeft + panorama.clientWidth * 0.35;
      var current = hubs[0];
      for (var i = 0; i < hubs.length; i++) {
        if (hubs[i].offsetLeft <= x) current = hubs[i];
      }
      if (!current) return;
      var name = current.getAttribute('data-lumia-hub');
      setActive(name);
      centerPivotTab(name);
    });
  }

  panorama.addEventListener('scroll', onPanoramaScroll, { passive: true });
  setActive('sohan');
}
