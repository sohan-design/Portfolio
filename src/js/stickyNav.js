/**
 * Site header: static in the page on load. After the dock mark scrolls past
 * (home: the LMS bio line; elsewhere: the header itself), a 64px bar slides
 * in from the top and stays visible.
 */
var NAV_H = 64;

export function initStickyNav() {
  var header = document.querySelector('.site-header');
  if (!header || header.dataset.stickyReady) return;
  header.dataset.stickyReady = '1';
  header.classList.add('is-sticky-nav');

  var spacer = document.createElement('div');
  spacer.className = 'site-header-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  header.after(spacer);

  var dockEl = document.querySelector('[data-nav-dock]') || header;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  var fixed = false;

  function pastDock() {
    return dockEl.getBoundingClientRect().bottom <= 0;
  }

  function setFixed(next) {
    if (fixed === next) return;
    fixed = next;
    header.classList.toggle('is-nav-fixed', next);
    spacer.style.height = next ? NAV_H + 'px' : '0px';
    // Slide in from the top when docking; sit normally when static.
    if (next) {
      header.classList.add('is-nav-hidden');
      // Force a layout pass so the enter transition runs.
      void header.offsetWidth;
      if (reduce && reduce.matches) {
        header.classList.remove('is-nav-hidden');
      } else {
        requestAnimationFrame(function () {
          header.classList.remove('is-nav-hidden');
        });
      }
    } else {
      header.classList.remove('is-nav-hidden');
    }
  }

  function onScroll() {
    setFixed(pastDock());
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}
