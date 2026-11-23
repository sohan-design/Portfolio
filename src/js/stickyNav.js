/**
 * Site header: static on load. After the dock mark scrolls past, a 64px bar
 * slides in from the top; scrolling back slides it out.
 * Works on window-scrolled pages (home/about/works) and panel-scrolled
 * case studies (.cs-panel).
 */
var NAV_H = 72;
/** Stay docked until the anchor is this far back into the viewport. */
var EXIT_SLACK = 28;
var SLIDE_MS = 420;
var SLIDE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function scrollParentOf(el) {
  var node = el && el.parentElement;
  while (node && node !== document.documentElement) {
    if (node.classList && node.classList.contains('cs-panel')) return node;
    var style = window.getComputedStyle(node);
    var oy = style.overflowY;
    if (
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function initStickyNav() {
  var headers = document.querySelectorAll('.site-header');
  if (!headers.length) return;
  Array.prototype.forEach.call(headers, bindHeader);
}

function bindHeader(header) {
  if (!header || header.dataset.stickyReady) return;
  header.dataset.stickyReady = '1';
  header.classList.add('is-sticky-nav');

  var spacer = document.createElement('div');
  spacer.className = 'site-header-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  header.after(spacer);

  // Optional page mark (home bio). Otherwise dock after this header leaves view.
  var dockEl =
    (header.closest('main, article, .cs-content, .site') || document)
      .querySelector('[data-nav-dock]') || null;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  // static | fixed | entering | exiting
  var mode = 'static';
  var slideAnim = null;
  var slideTimer = 0;
  var root = scrollParentOf(header);

  function clearTransform() {
    header.style.transform = '';
  }

  function commitTransform(to) {
    if (to === 'translateY(0)') clearTransform();
    else header.style.transform = to;
  }

  function cancelSlide() {
    if (slideTimer) {
      window.clearTimeout(slideTimer);
      slideTimer = 0;
    }
    if (!slideAnim) return;
    try { slideAnim.cancel(); } catch (e) {}
    slideAnim = null;
  }

  function playSlide(from, to, onDone) {
    cancelSlide();
    // Never leave `from` on the inline style — a cancelled WAAPI fill used to
    // fall back to translateY(-100%) and crop the bar against the viewport.
    clearTransform();

    var settled = false;
    function finish() {
      if (settled) return;
      settled = true;
      if (slideTimer) {
        window.clearTimeout(slideTimer);
        slideTimer = 0;
      }
      var finished = slideAnim;
      slideAnim = null;
      commitTransform(to);
      if (finished) {
        try { finished.cancel(); } catch (e) {}
      }
      commitTransform(to);
      if (onDone) onDone();
    }

    if ((reduce && reduce.matches) || typeof header.animate !== 'function') {
      commitTransform(to);
      if (onDone) onDone();
      return;
    }

    slideAnim = header.animate(
      [{ transform: from }, { transform: to }],
      { duration: SLIDE_MS, easing: SLIDE_EASE, fill: 'forwards' }
    );
    slideAnim.onfinish = finish;
    // If the animation stalls (embedded preview / timeline quirks), commit anyway.
    slideTimer = window.setTimeout(finish, SLIDE_MS + 80);
  }

  function finishEnter() {
    commitTransform('translateY(0)');
    mode = 'fixed';
  }

  function finishExit() {
    clearTransform();
    header.classList.remove('is-nav-fixed');
    spacer.style.height = '0px';
    mode = 'static';
  }

  function currentTransform(fallback) {
    var t = getComputedStyle(header).transform;
    return !t || t === 'none' ? fallback : t;
  }

  function dock() {
    if (mode === 'fixed' || mode === 'entering') return;
    spacer.style.height = NAV_H + 'px';
    header.classList.add('is-nav-fixed');
    mode = 'entering';
    playSlide(currentTransform('translateY(-100%)'), 'translateY(0)', finishEnter);
  }

  function undock() {
    if (mode === 'static' || mode === 'exiting') return;
    mode = 'exiting';
    playSlide(currentTransform('translateY(0)'), 'translateY(-100%)', finishExit);
  }

  function anchorBottom() {
    if (dockEl) return dockEl.getBoundingClientRect().bottom;
    return (mode === 'static' ? header : spacer).getBoundingClientRect().bottom;
  }

  function onScroll() {
    var bottom = anchorBottom();
    var wantFixed = mode === 'static' || mode === 'exiting'
      ? bottom <= 0
      : bottom <= EXIT_SLACK;

    if (wantFixed) dock();
    else undock();
  }

  function bindRoot() {
    var next = scrollParentOf(header);
    if (next === root) return;
    if (root) root.removeEventListener('scroll', onScroll);
    root = next;
    if (root) root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (root) root.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    bindRoot();
    onScroll();
  }, { passive: true });
  // Case-study overlay may open / size after first paint.
  window.setTimeout(bindRoot, 0);
  window.setTimeout(bindRoot, 400);
  onScroll();
}
