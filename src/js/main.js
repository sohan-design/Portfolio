import { inject } from '@vercel/analytics';
import { createHeroShader, disposeHeroShader, snapHeroShaderSize } from './heroShader.js';
import { initFooterLotties } from './footerLottie.js';
import { initThemeToggle } from './theme.js';
import { initCtaPixelWave } from './ctaWave.js';
import { mountSiteFooter } from './siteFooter.js';

// Initialize Vercel Analytics
inject();

(function () {
  initThemeToggle();

  // ---------- Intro loader ----------
  (function () {
    var loader = document.getElementById('introLoader');
    if (!loader) return;

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      document.body.classList.remove('intro-loading');
      loader.remove();
      return;
    }

    // Gate already applied by inline script (session + nav type). Just animate.
    if (!document.body.classList.contains('intro-loading')) {
      document.body.classList.add('intro-loading');
    }

    var icons = Array.prototype.slice.call(loader.querySelectorAll('.intro-icon'));
    var progressEl = loader.querySelector('.intro-progress');
    var progressBar = loader.querySelector('.intro-progress-bar');
    var current = 0;
    var loopsDone = 0;
    var totalLoops = 2;
    var iconDelay = 200;
    var holdLast = 300;
    var step = 0;
    var totalSteps = icons.length * totalLoops;

    function setProgress(value) {
      var pct = Math.max(0, Math.min(100, value));
      if (progressBar) progressBar.style.width = pct + '%';
      if (progressEl) progressEl.setAttribute('aria-valuenow', String(Math.round(pct)));
    }

    function showNext() {
      if (current > 0) {
        icons[current - 1].classList.remove('is-active');
        icons[current - 1].classList.add('is-leaving');
      } else if (loopsDone > 0) {
        icons[icons.length - 1].classList.remove('is-active');
        icons[icons.length - 1].classList.add('is-leaving');
      }

      if (current >= icons.length) {
        loopsDone++;
        if (loopsDone >= totalLoops) {
          setProgress(100);
          setTimeout(exitLoader, holdLast);
          return;
        }
        current = 0;
      }

      var icon = icons[current];
      icon.classList.remove('is-leaving');
      icon.classList.add('is-active');
      step++;
      setProgress((step / totalSteps) * 100);
      current++;
      setTimeout(showNext, iconDelay);
    }

    function exitLoader() {
      setProgress(100);
      loader.classList.add('is-exiting');
      document.body.classList.remove('intro-loading');

      loader.addEventListener('animationend', function (e) {
        if (e.target !== loader) return;
        loader.classList.add('is-done');
        loader.remove();
      });
    }

    setProgress(0);
    setTimeout(function () { showNext(); }, 150);
  })();

  // Strip any legacy separator.svg images from case-study dividers.
  Array.prototype.forEach.call(document.querySelectorAll('.cs-divider img'), function (img) {
    img.remove();
  });

  // Nav active state from URL
  (function () {
    var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
    var view =
      path === '/' ? 'home' :
      path.indexOf('/more-work') === 0 ? 'works' :
      path.indexOf('/work/') === 0 ? 'works' :
      path.indexOf('/about') === 0 ? 'about' : null;

    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (item) {
      item.classList.toggle('is-active', view && item.getAttribute('data-nav') === view);
    });
  })();

  // Scroll reveal
  (function () {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    if (reduce) {
      items.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    function inView(el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    }

    function sweep() {
      items.forEach(function (el) {
        if (!el.classList.contains('revealed') && inView(el)) el.classList.add('revealed');
      });
    }

    var lead = document.querySelector('[data-reveal-lead]');
    if (lead) setTimeout(function () { lead.classList.add('revealed'); }, 60);
    setTimeout(function () { sweep(); }, 400);
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('revealed'); });
    }, 1200);
  })();

  // About photo deck
  (function () {
    var stack = document.querySelector('.about-stack');
    if (!stack) return;
    var photos = Array.prototype.slice.call(stack.querySelectorAll('.about-photo'));
    if (photos.length < 2) return;

    var locked = false;
    function advance() {
      if (locked) return;
      locked = true;
      photos.forEach(function (p) {
        var next = (parseInt(p.getAttribute('data-pos'), 10) + photos.length - 1) % photos.length;
        p.setAttribute('data-pos', String(next));
      });
      setTimeout(function () { locked = false; }, 380);
    }
    stack.addEventListener('click', advance);
    stack.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
    });
  })();
    // Case-study system: clicking a project card opens its intro modal (if it
    // has one), then "View detailed case study" reveals the full study as an
    // overlay over the landing page (page stays put, scroll locked underneath).
    // Everything is keyed by data-project so each card drives its own modal +
    // study, all sharing the exact same classes, animations, nav and spacing.
    (function () {
      var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var lastFocused = null;

      function lock() {
        // Freeze the page behind the overlay without a layout jump. Compensate
        // for the scrollbar width (0 on macOS overlay scrollbars).
        var sw = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.overflow = 'hidden';
        if (sw > 0) document.body.style.paddingRight = (24 + sw) + 'px';
      }
      function unlock() {
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
      }

      // ---- one full case-study overlay (scroll-reveal, scroll-spy, nav glide) --
      function initCaseStudy(overlay) {
        var panel = overlay.querySelector('.cs-panel');
        var navItems = overlay.querySelectorAll('.cs-nav-item');
        var sections = panel.querySelectorAll('.cs-section');
        var textTimer = null, closeTimer = null, revealTimer = null;
        var revealList = [];
        var suppressSpy = false;   // muted while a nav-click glide is running
        var scrollRAF = null;
        var heroIntro = overlay.hasAttribute('data-hero-intro');
        var heroTitle = heroIntro ? overlay.querySelector('.cs-title') : null;
        var heroShaderEl = heroIntro ? overlay.querySelector('[data-hero-shader]') : null;
        var heroShaderMount = null;
        var heroRevealStarted = false;
        var heroTitleBaseSize = 64;
        var heroFitTimer = null;

        function initHeroShaderMount() {
          if (!heroShaderEl || heroShaderMount) return;
          snapHeroShaderSize(heroShaderEl);
          heroShaderMount = createHeroShader(heroShaderEl);
        }

        function resizeHeroShader() {
          if (!heroShaderEl) return;
          snapHeroShaderSize(heroShaderEl);
        }

        function resetHeroShaderMount() {
          if (!heroShaderMount) return;
          disposeHeroShader(heroShaderMount);
          heroShaderMount = null;
        }

        function heroScrollRange() {
          var spacer = Math.min(400, Math.max(200, panel.clientHeight * 0.38));
          return Math.max(1, spacer + panel.clientHeight * 0.3);
        }

        function fitHeroTitle() {
          if (!heroTitle) return;
          heroTitle.style.fontSize = '';
          var lines = heroTitle.querySelectorAll('.cs-title-line');
          if (!lines.length) lines = [heroTitle];

          var column = heroTitle.closest('.cs-content') || panel;
          var columnRect = column.getBoundingClientRect();
          var panelRect = panel.getBoundingClientRect();
          // Maximize to the panel's right edge (16px inset) — only shrink when a line would clip.
          var targetRight = panelRect.right - 16;
          if (targetRight < columnRect.left + 1) targetRight = columnRect.right - 16;
          if (targetRight < 1) return;

          var minSize = 24;
          var maxSize = 160;
          var best = minSize;
          var lo = minSize;
          var hi = maxSize;

          while (lo <= hi + 0.01) {
            var mid = Math.round(((lo + hi) / 2) * 4) / 4;
            heroTitle.style.fontSize = mid + 'px';
            var widestRight = 0;
            for (var i = 0; i < lines.length; i++) {
              widestRight = Math.max(widestRight, lines[i].getBoundingClientRect().right);
            }
            if (widestRight <= targetRight + 0.5) {
              best = mid;
              lo = mid + 0.25;
            } else {
              hi = mid - 0.25;
            }
          }

          heroTitle.style.fontSize = best + 'px';
          heroTitleBaseSize = best;
        }

        function scheduleHeroTitleFit(done) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              fitHeroTitle();
              resizeHeroShader();
              if (done) done();
            });
          });
        }

        function resetHero() {
          overlay.classList.remove('cs-hero-scrolled');
          if (heroTitle) {
            heroTitle.style.transform = '';
            heroTitle.style.marginBottom = '';
            heroTitle.style.fontSize = '';
            heroTitleBaseSize = 64;
          }
        }

        function updateHeroScroll() {
          if (!heroIntro || reduceMotion || !heroTitle) return;
          var range = heroScrollRange();
          var progress = Math.min(1, Math.max(0, panel.scrollTop / range));
          var eased = 1 - Math.pow(1 - progress, 2.5);
          var minScale = 24 / heroTitleBaseSize;
          var scale = 1 - eased * (1 - minScale);

          heroTitle.style.transform = 'scale(' + scale + ')';
          heroTitle.style.transformOrigin = 'left bottom';
          heroTitle.style.marginBottom = '';

          var showChrome = progress > 0.35;
          overlay.classList.toggle('cs-hero-scrolled', showChrome);

          if (showChrome && !overlay.classList.contains('text-in')) {
            overlay.classList.add('text-in');
          }
          if (panel.scrollTop > 60 && !heroRevealStarted) {
            heroRevealStarted = true;
            startReveal();
          }
        }

        function setActive(id) {
          Array.prototype.forEach.call(navItems, function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }

        // ---- scroll reveal: content blocks fade + rise in as they scroll into
        // view (one-time; scrolling back up shows them already revealed) ----
        function revealBlocks() {
          return panel.querySelectorAll('.cs-content .cs-section > *, .cs-content .cs-divider, .cs-content .cs-footer');
        }
        function resetReveal() {
          Array.prototype.forEach.call(revealBlocks(), function (el) { el.classList.remove('reveal-in'); });
        }
        // reveal every block (top-down) whose top has crossed ~88% of the viewport;
        // stops at the first block still below the line (they're in document order).
        function checkReveal() {
          var line = panel.getBoundingClientRect().top + panel.clientHeight * 0.88;
          for (var i = 0; i < revealList.length; i++) {
            var el = revealList[i];
            if (el.classList.contains('reveal-in')) continue;
            if (el.getBoundingClientRect().top < line) el.classList.add('reveal-in');
            else break;
          }
        }
        function startReveal() {
          revealList = Array.prototype.slice.call(revealBlocks());
          if (reduceMotion) {
            revealList.forEach(function (el) { el.classList.add('reveal-in'); });
            return;
          }
          panel.addEventListener('scroll', checkReveal, { passive: true });
          checkReveal();   // reveal whatever is already in view on open
        }
        function stopReveal() {
          panel.removeEventListener('scroll', checkReveal);
        }

        function open() {
          lastFocused = document.activeElement;
          lock();
          // The image zoom is a CSS keyframe (see .cs-cover) — identical for
          // every card and independent of where the card sits on screen.
          overlay.classList.add('open');
          overlay.setAttribute('aria-hidden', 'false');
          panel.scrollTop = 0;
          if (sections.length) setActive(sections[0].id);
          clearTimeout(textTimer);
          clearTimeout(closeTimer);
          clearTimeout(revealTimer);
          resetReveal();
          heroRevealStarted = false;
          if (heroIntro) {
            resetHero();
            overlay.classList.remove('text-in');
            heroRevealStarted = false;
            initHeroShaderMount();
            scheduleHeroTitleFit(function () {
              if (reduceMotion) {
                overlay.classList.add('text-in');
                startReveal();
              } else {
                updateHeroScroll();
              }
            });
          } else {
            // the nav + the first content reveal ~0.45s later, once the cover has
            // zoomed in; from there content keeps revealing as the user scrolls.
            if (reduceMotion) { overlay.classList.add('text-in'); startReveal(); }
            else revealTimer = setTimeout(function () { overlay.classList.add('text-in'); startReveal(); }, 450);
          }
          // Move focus into the dialog for keyboard / screen-reader users, but
          // target the dialog container — not the back button — so no focus ring
          // flashes on the button when the study auto-opens on page load.
          // Keyboard users still Tab straight to the back button from here.
          overlay.setAttribute('tabindex', '-1');
          overlay.focus({ preventScroll: true });
        }
        function close() {
          if (!overlay.classList.contains('open')) return;
          // On a dedicated case-study page, "back" leaves the page rather than
          // just hiding the overlay.
          if (document.body.hasAttribute('data-study')) {
            if (document.referrer.indexOf(location.origin) === 0 && history.length > 1) history.back();
            else location.href = '/';
            return;
          }
          overlay.classList.remove('text-in');       // text fades out
          overlay.classList.remove('open');          // paper + image fade out
          resetHeroShaderMount();
          stopReveal();
          clearTimeout(closeTimer);
          clearTimeout(revealTimer);
          closeTimer = setTimeout(function () {
            overlay.setAttribute('aria-hidden', 'true');
            panel.scrollTop = 0;
            resetReveal();                            // reset so a reopen re-animates
          }, 320);
          unlock();
          if (lastFocused && lastFocused.focus) lastFocused.focus();
        }

        // scroll-spy: the section whose top has passed ~25% down the panel is the
        // active one. The panel is the scroll container and the sections'
        // offsetParent, so offsetTop is already in panel-scroll coordinates.
        function syncActive() {
          if (suppressSpy) return;
          if (!sections.length) return;
          // At the very bottom, the last section is the active one even if its top
          // never reaches the line (short content can't scroll that far).
          if (panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 4) {
            setActive(sections[sections.length - 1].id);
            return;
          }
          var line = panel.scrollTop + panel.clientHeight * 0.25;
          var current = sections[0].id;
          for (var i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop <= line) current = sections[i].id;
          }
          setActive(current);
        }
        panel.addEventListener('scroll', syncActive, { passive: true });
        if (heroIntro) {
          panel.addEventListener('scroll', updateHeroScroll, { passive: true });
          window.addEventListener('resize', function () {
            if (!overlay.classList.contains('open')) return;
            clearTimeout(heroFitTimer);
            heroFitTimer = setTimeout(function () {
              resizeHeroShader();
              scheduleHeroTitleFit(updateHeroScroll);
            }, 100);
          });
        }

        // custom eased scroll for the panel — a single consistent 620ms glide
        // (native smooth scroll can stutter inside a nested scroll container).
        function easeInOutCubic(t) {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        function smoothScrollPanelTo(dest, dur, done) {
          if (scrollRAF) cancelAnimationFrame(scrollRAF);
          var start = panel.scrollTop;
          var max = panel.scrollHeight - panel.clientHeight;
          var to = Math.max(0, Math.min(dest, max));
          var change = to - start;
          if (Math.abs(change) < 1) { if (done) done(); return; }
          var startTs = null;
          function step(ts) {
            if (startTs === null) startTs = ts;
            var p = Math.min(1, (ts - startTs) / dur);
            panel.scrollTop = start + change * easeInOutCubic(p);
            if (p < 1) { scrollRAF = requestAnimationFrame(step); }
            else { scrollRAF = null; if (done) done(); }
          }
          scrollRAF = requestAnimationFrame(step);
        }

        // nav click → set the active dot immediately, then glide to the section
        Array.prototype.forEach.call(navItems, function (a) {
          a.addEventListener('click', function (e) {
            e.preventDefault();
            var id = a.getAttribute('href').slice(1);
            var target = document.getElementById(id);
            if (!target) return;
            setActive(id);                 // snap the indicator right away
            suppressSpy = true;
            if (reduceMotion) {
              panel.scrollTop = target.offsetTop - 32;
              suppressSpy = false;
            } else {
              smoothScrollPanelTo(target.offsetTop - 32, 620, function () {
                suppressSpy = false;
              });
            }
          });
        });

        Array.prototype.forEach.call(overlay.querySelectorAll('[data-cs-close]'), function (el) {
          el.addEventListener('click', close);
        });

        return { overlay: overlay, open: open, close: close };
      }

      // ---- one intro modal (cover + copy over a blurred page) ----------------
      function initModal(modal, onReadFull) {
        function openModal() {
          lastFocused = document.activeElement;
          lock();
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
          var sc = modal.querySelector('.pm-scroll');
          if (sc) sc.scrollTop = 0;              // always start at the cover
          var cta = modal.querySelector('.pm-foot .pm-cta');
          if (cta) cta.focus();
        }
        function closeModal(keepLock) {
          if (!modal.classList.contains('open')) return;
          modal.classList.remove('open');
          modal.setAttribute('aria-hidden', 'true');
          if (!keepLock) {
            unlock();
            if (lastFocused && lastFocused.focus) lastFocused.focus();
          }
        }
        // click outside the card (on the blurred backdrop) dismisses it
        modal.addEventListener('click', function (e) {
          if (!(e.target.closest && e.target.closest('.pm-card'))) closeModal();
        });
        Array.prototype.forEach.call(modal.querySelectorAll('[data-pm-close]'), function (el) {
          el.addEventListener('click', function () { closeModal(); });
        });
        var readFull = modal.querySelector('.pm-foot .pm-cta');
        if (readFull) readFull.addEventListener('click', function () {
          closeModal(true);      // keep scroll locked through the hand-off
          if (onReadFull) onReadFull();
        });
        return { modal: modal, openModal: openModal, closeModal: closeModal };
      }

      // Build every study + modal, keyed by data-project.
      var studies = {};
      Array.prototype.forEach.call(document.querySelectorAll('.cs-overlay'), function (ov) {
        var proj = ov.getAttribute('data-project');
        if (proj) studies[proj] = initCaseStudy(ov);
      });
      // Each project's dedicated case-study page.
      var STUDY_URLS = {
        cosmo: '/work/redesigned-payment-pages',
        whitelabel: '/work/white-label-evolution',
        trainer: '/work/b2b-trainer-dashboard'
      };
      var modals = {};
      Array.prototype.forEach.call(document.querySelectorAll('.pm-overlay'), function (m) {
        var proj = m.getAttribute('data-project');
        if (!proj) return;
        modals[proj] = initModal(m, function () {
          if (studies[proj]) studies[proj].open();     // same-page hand-off
          else location.href = STUDY_URLS[proj] || '/'; // study lives on its own page
        });
      });

      // Dedicated case-study pages auto-open their study on load.
      var autoStudy = document.body.getAttribute('data-study');
      if (autoStudy && studies[autoStudy]) studies[autoStudy].open();

      // Card → its modal (preferred) or its study directly. Cards without a
      // data-project (no case study yet) stay inert.
      Array.prototype.forEach.call(document.querySelectorAll('.project'), function (card) {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        var proj = card.getAttribute('data-project');
        var href = card.getAttribute('data-href');
        var activate = null;
        if (proj && modals[proj]) activate = function () { modals[proj].openModal(); };
        else if (proj && studies[proj]) activate = function () { studies[proj].open(); };
        else if (proj && STUDY_URLS[proj]) activate = function () { location.href = STUDY_URLS[proj]; };
        else if (href) activate = function () { window.open(href, '_blank', 'noopener'); };
        if (!activate) return;
        card.addEventListener('click', function (e) {
          e.stopPropagation();
          activate();
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
        });
      });

      // Esc closes whichever layer is open (modal first, then study).
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        for (var k in modals) { if (modals[k].modal.classList.contains('open')) { modals[k].closeModal(); return; } }
        for (var s in studies) { if (studies[s].overlay.classList.contains('open')) { studies[s].close(); return; } }
      });

    })();

    // ---------- Image lightbox / preview ----------
    // Click any zoomable case-study figure to preview it enlarged over a dark
    // translucent backdrop, its name captioned below, with prev/next arrows to
    // step through every image in the case study (matching the design).
    (function () {
      var box = document.getElementById('csLightbox');
      if (!box) return;
      var imgEl = document.getElementById('csLightboxImg');
      var frameEl = imgEl.closest('.cs-lightbox-frame');
      if (!frameEl) {
        frameEl = document.createElement('div');
        frameEl.className = 'cs-lightbox-frame';
        imgEl.parentNode.insertBefore(frameEl, imgEl);
        frameEl.appendChild(imgEl);
      }
      var clipEl = frameEl.querySelector('.cs-lightbox-clip');
      if (!clipEl) {
        clipEl = document.createElement('div');
        clipEl.className = 'cs-lightbox-clip';
        frameEl.appendChild(clipEl);
        clipEl.appendChild(imgEl);
      }
      var capEl = document.getElementById('csLightboxCaption');
      var prevBtn = document.getElementById('csLightboxPrev');
      var nextBtn = document.getElementById('csLightboxNext');

      // ordered list of zoomable figures in the same preview group (scoped so
      // Best Projects, more-work, and an open case study never mix)
      var groupRoot = null;
      function figures() {
        if (groupRoot) return Array.prototype.slice.call(groupRoot.querySelectorAll('img.cs-zoom'));
        var openPanel = document.querySelector('.cs-overlay.open .cs-panel');
        var scope = openPanel || document;
        return Array.prototype.slice.call(scope.querySelectorAll('img.cs-zoom'));
      }
      var current = 0;
      show.fitToken = 0;

      function show(i) {
        var figs = figures();
        if (!figs.length) return;
        current = (i + figs.length) % figs.length;   // wrap around
        var fig = figs[current];
        imgEl.setAttribute('src', fig.getAttribute('src'));
        imgEl.setAttribute('alt', fig.getAttribute('alt') || '');
        // Always show the full image. The frame follows that image's own shape
        // (square stays square) and only shrinks to fit the viewport.
        imgEl.style.width = '';
        imgEl.style.height = '';
        imgEl.style.maxWidth = 'none';
        imgEl.style.maxHeight = 'none';
        imgEl.style.aspectRatio = '';
        imgEl.style.objectFit = 'contain';
        frameEl.style.maxWidth = 'none';
        frameEl.style.maxHeight = 'none';
        frameEl.style.width = 'fit-content';
        frameEl.style.height = '';
        frameEl.style.aspectRatio = '';
        clipEl.style.width = '';
        clipEl.style.height = '';
        var fitToken = ++show.fitToken;
        function fitToImage() {
          if (fitToken !== show.fitToken) return;
          var nw = fig.naturalWidth || imgEl.naturalWidth || 0;
          var nh = fig.naturalHeight || imgEl.naturalHeight || 0;
          if (!nw || !nh) return;
          var border = 16;
          var maxW = Math.min(1170, window.innerWidth * 0.96) - border;
          var maxH = window.innerHeight * 0.8 - border;
          // Portrait frames match the height of a 16:10 horizontal preview so
          // they don't run edge-to-edge or cover the caption.
          if (nh > nw) maxH = Math.min(maxH, maxW * (10 / 16));
          var scale = Math.min(1, maxW / nw, maxH / nh);
          var w = Math.max(1, Math.round(nw * scale));
          var h = Math.max(1, Math.round(nh * scale));
          frameEl.style.width = (w + border) + 'px';
          frameEl.style.height = (h + border) + 'px';
          frameEl.style.aspectRatio = nw + ' / ' + nh;
          clipEl.style.width = w + 'px';
          clipEl.style.height = h + 'px';
          imgEl.style.width = w + 'px';
          imgEl.style.height = h + 'px';
        }
        if ((fig.complete && fig.naturalWidth) || (imgEl.complete && imgEl.naturalWidth)) fitToImage();
        else imgEl.addEventListener('load', fitToImage, { once: true });
        // The 8px border sits on the frame. A separate clip rounds the photo to 4px
        // — a border as wide as the frame radius would otherwise square the image.
        frameEl.style.padding = '0';
        frameEl.style.background = 'none';
        frameEl.style.border = '8px solid rgba(255, 255, 255, 0.15)';
        // 8px border + 4px image radius — otherwise the inner corner is square.
        frameEl.style.borderRadius = '12px';
        frameEl.style.overflow = 'hidden';
        clipEl.style.borderRadius = '4px';
        clipEl.style.overflow = 'hidden';
        clipEl.style.clipPath = 'inset(0 round 4px)';
        clipEl.style.display = 'block';
        clipEl.style.lineHeight = '0';
        imgEl.style.padding = '0';
        imgEl.style.background = 'none';
        imgEl.style.border = 'none';
        imgEl.style.borderRadius = '0';
        imgEl.style.overflow = 'hidden';
        imgEl.style.clipPath = 'none';
        imgEl.style.display = 'block';
        var cardTitle = fig.closest && fig.closest('.hp2-pcard') && fig.closest('.hp2-pcard').querySelector('.hp2-pcard-title');
        capEl.textContent = fig.getAttribute('data-caption') || (cardTitle && cardTitle.textContent.replace(/\s+/g, ' ').trim()) || fig.getAttribute('alt') || '';
      }
      function openBox(fig) {
        groupRoot = (fig.closest && (
          fig.closest('.hp2-pcard-grid') ||
          fig.closest('.hp2-shelf') ||
          fig.closest('.mw-grid') ||
          fig.closest('.cs-panel')
        )) || null;
        var figs = figures();
        show(figs.indexOf(fig));
        box.classList.add('open');
        box.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cs-lightbox-open');
      }
      function closeBox() {
        if (!box.classList.contains('open')) return;
        box.classList.remove('open');
        box.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cs-lightbox-open');
      }

      // delegate: any zoomable figure opens the preview
      document.addEventListener('click', function (e) {
        var fig = e.target.closest && e.target.closest('img.cs-zoom');
        if (fig && !(fig.closest && fig.closest('.hp2-pcard'))) openBox(fig);
      });
      // click the backdrop (not the image or arrows) to dismiss
      box.addEventListener('click', function (e) {
        if (e.target === imgEl || e.target === frameEl || e.target === clipEl || (e.target.closest && e.target.closest('.cs-lightbox-nav'))) return;
        closeBox();
      });
      prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
      nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });

      document.addEventListener('keydown', function (e) {
        if (!box.classList.contains('open')) return;
        if (e.key === 'Escape') { e.stopImmediatePropagation(); closeBox(); }
        else if (e.key === 'ArrowLeft') { e.stopImmediatePropagation(); show(current - 1); }
        else if (e.key === 'ArrowRight') { e.stopImmediatePropagation(); show(current + 1); }
      }, true);                                  // capture phase → runs first
    })();

    // ---------- Live clock (always India time — that's where Sugandha is) ----------
    (function () {
      var els = document.querySelectorAll('[data-clock]');
      if (!els.length) return;
      var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      function tick() {
        var text = fmt.format(new Date()) + ' IST in Bangalore';
        for (var i = 0; i < els.length; i++) els[i].textContent = text;
      }
      tick();
      setInterval(tick, 1000);
    })();

    // More work carousel (home) — coverflow, autoplays every 3s
    (function () {
      var carousel = document.querySelector('[data-carousel]');
      if (!carousel) return;
      var track = carousel.querySelector('[data-carousel-track]');
      var cards = Array.prototype.slice.call(track.children);
      var n = cards.length;
      if (!n) return;

      var active = 0;
      var timer = null;

      function render() {
        var w = track.clientWidth;
        var nearX = w * 0.1392;
        var farX = w * 0.2328;
        cards.forEach(function (card, i) {
          var diff = i - active;
          if (diff > n / 2) diff -= n;
          if (diff < -n / 2) diff += n;

          var tx = 0, s = 0.727, scrim = 0.2, z = 0;
          if (diff === 0) { tx = 0; s = 1; scrim = 0; z = 5; }
          else if (diff === -1) { tx = -nearX; s = 0.818; scrim = 0.08; z = 3; }
          else if (diff === 1) { tx = nearX; s = 0.818; scrim = 0.08; z = 3; }
          else if (diff === -2) { tx = -farX; s = 0.727; scrim = 0.2; z = 1; }
          else if (diff === 2) { tx = farX; s = 0.727; scrim = 0.2; z = 1; }
          else { tx = (diff < 0 ? -farX : farX) * 1.3; }

          card.style.setProperty('--tx', tx + 'px');
          card.style.setProperty('--s', s);
          card.style.setProperty('--scrim', scrim);
          card.style.setProperty('--z', z);
          card.dataset.depth = Math.min(Math.abs(diff), 2);
        });
      }

      function next() { active = (active + 1) % n; render(); }
      function start() { stop(); timer = setInterval(next, 3000); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }

      render();
      start();

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);

      var resizeRAF = null;
      window.addEventListener('resize', function () {
        if (resizeRAF) return;
        resizeRAF = requestAnimationFrame(function () { resizeRAF = null; render(); });
      }, { passive: true });
    })();

  initFooterLotties();
  mountSiteFooter();
  initCtaPixelWave(document);

})();
