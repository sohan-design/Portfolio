import { createHeroShader, disposeHeroShader, snapHeroShaderSize } from './heroShader.js';
import { initFooterLotties } from './footerLottie.js';

(function () {
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

  // Floating nav on scroll-up (static at top, hidden on scroll down, pill on scroll up)
  (function () {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var header = nav.closest('.site-header');
    if (!header) return;

    var studyPanel = document.body.hasAttribute('data-study')
      ? document.querySelector('.cs-overlay .cs-panel')
      : null;

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gate = 0;
    var last = studyPanel ? studyPanel.scrollTop : window.scrollY;
    var ticking = false;
    var showRaf = 0;

    function scrollY() {
      return studyPanel ? studyPanel.scrollTop : window.scrollY;
    }

    function measure() {
      header.classList.remove('is-reserved');
      nav.classList.remove('floating', 'is-visible');
      header.style.setProperty('--nav-reserve', nav.offsetHeight + 'px');
      if (studyPanel) {
        gate = header.getBoundingClientRect().top - studyPanel.getBoundingClientRect().top
          + studyPanel.scrollTop + nav.offsetHeight + 120;
      } else {
        gate = header.offsetTop + nav.offsetHeight + 120;
      }
    }

    function hideFloating() {
      if (showRaf) {
        cancelAnimationFrame(showRaf);
        showRaf = 0;
      }
      nav.classList.remove('is-visible', 'floating');
      header.classList.remove('is-reserved');
    }

    function showFloating() {
      if (nav.classList.contains('floating') && nav.classList.contains('is-visible')) return;
      hideFloating();
      nav.classList.add('floating');
      header.classList.add('is-reserved');
      if (reduce) {
        nav.classList.add('is-visible');
        return;
      }
      showRaf = requestAnimationFrame(function () {
        showRaf = 0;
        nav.classList.add('is-visible');
      });
    }

    function update() {
      ticking = false;
      var y = scrollY();
      var delta = y - last;
      if (Math.abs(delta) < 4) return;
      last = y;
      if (y <= gate || delta > 0) {
        hideFloating();
        return;
      }
      showFloating();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    measure();
    update();
    (studyPanel || window).addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      measure();
      update();
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
        unify: '/work/redesigned-ai-agents',
        cosmo: '/work/redesigned-payment-pages'
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
        card.addEventListener('click', activate);
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
      var capEl = document.getElementById('csLightboxCaption');
      var prevBtn = document.getElementById('csLightboxPrev');
      var nextBtn = document.getElementById('csLightboxNext');

      // ordered list of every zoomable figure in the OPEN study, in document
      // order (scoped so two studies' figures never mix)
      function figures() {
        var openPanel = document.querySelector('.cs-overlay.open .cs-panel');
        var scope = openPanel || document;
        return Array.prototype.slice.call(scope.querySelectorAll('img.cs-zoom'));
      }
      var current = 0;

      function show(i) {
        var figs = figures();
        if (!figs.length) return;
        current = (i + figs.length) % figs.length;   // wrap around
        var fig = figs[current];
        imgEl.setAttribute('src', fig.getAttribute('src'));
        imgEl.setAttribute('alt', fig.getAttribute('alt') || '');
        var isMw = !!(fig.closest && (fig.closest('.mw-card') || fig.closest('.tile')));
        var isCarousel = !!(fig.closest && fig.closest('.mw-carousel-card'));
        if (isMw || isCarousel) {
          // More-work previews: crop to the SAME ratio as the on-page card
          // (590:400 grid card, 8:5 home carousel card) so every image in the
          // section frames consistently, however tall/empty its own source
          // canvas is — instead of each showing its own native aspect ratio.
          imgEl.style.maxWidth = '';
          imgEl.style.width = 'min(900px, 88vw)';
          imgEl.style.aspectRatio = isCarousel ? '440 / 290' : '59 / 40';
          imgEl.style.objectFit = 'cover';
        } else {
          // Never upscale beyond the source's native width — a small image shows
          // smaller but crisp instead of stretched-and-blurry. (Large images keep
          // the 900px / 88vw design cap from CSS.)
          var nat = fig.naturalWidth || 0;
          imgEl.style.maxWidth = (nat && nat < 900) ? 'min(' + nat + 'px, 88vw)' : '';
          imgEl.style.width = '';
          imgEl.style.aspectRatio = '';
          imgEl.style.objectFit = '';
        }
        // Mirror the on-page figure's framing so the preview matches it exactly:
        // copy the source frame's mat (padding + white background) and corner
        // radius. This keeps the two projects distinct automatically — UnifyApps
        // figures bake their own mat into the PNG (frame padding 0 → no mat added
        // here), Cosmofeed framed figures use a 6px CSS mat, flush cards use none.
        var frame = fig.closest && (fig.closest('.cs-frame') || fig.closest('.mw-card') || fig.closest('.mw-carousel-card') || fig.closest('.tile'));
        var fcs = frame ? getComputedStyle(frame) : null;
        var hasMat = fcs ? (parseFloat(fcs.paddingLeft) || 0) > 0 : false;
        imgEl.style.padding = fcs ? fcs.padding : '0';
        imgEl.style.background = hasMat ? '#fff' : 'none';
        imgEl.style.borderRadius = fcs ? fcs.borderRadius : '0';
        imgEl.style.border = fcs ? (fcs.borderWidth + ' ' + fcs.borderStyle + ' ' + fcs.borderColor) : 'none';
        // caption = explicit data-caption (display copy), falling back to alt
        capEl.textContent = fig.getAttribute('data-caption') || fig.getAttribute('alt') || '';
      }
      function openBox(fig) {
        var figs = figures();
        show(figs.indexOf(fig));
        box.classList.add('open');
        box.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cs-lightbox-open');   // hides the floating dock
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
        if (fig) openBox(fig);
      });
      // click the backdrop (not the image or arrows) to dismiss
      box.addEventListener('click', function (e) {
        if (e.target === imgEl || (e.target.closest && e.target.closest('.cs-lightbox-nav'))) return;
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

})();
