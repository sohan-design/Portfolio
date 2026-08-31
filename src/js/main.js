    (function () {
      // Only for fine pointers — touch/coarse keep the native cursor.
      if (!window.matchMedia || !matchMedia('(pointer: fine)').matches) return;
      var cursor = document.getElementById('cursor');
      if (!cursor) return;
      var iconEl = cursor.querySelector('.cursor-icon');
      var textEl = cursor.querySelector('.cursor-text');
      var afterEl = cursor.querySelector('.cursor-icon-after');
      document.documentElement.classList.add('has-custom-cursor');

      // Icon glyphs exported from the design (Metafore logomark keeps its teal;
      // Instagram uses currentColor so it inherits the badge text color).
      var ICONS = {
        // chevron-right (›) — trailing glyph in the "Hello! 👋" avatar badge
        chevron: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 3L7.5 6L4.5 9" stroke="#5C5C5C" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        // arrows-out — the "view / enlarge" badge shown when hovering artwork
        expand: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 1.5H12.5V5.5M12.5 1.5L8 6M5.5 12.5H1.5V8.5M1.5 12.5L6 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        metafore: '<svg width="14" height="11" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.65 1.41C5.39 0.67 4.6 0.29 3.89 0.55C3.17 0.82 2.79 1.63 3.05 2.37L5.72 10.09C5.98 10.83 6.77 11.21 7.48 10.95C8.2 10.68 8.58 9.87 8.32 9.13L5.65 1.41Z" fill="#92B0B0"/><path d="M2.77 9.53C2.82 10.3 2.24 10.96 1.47 11.01C0.71 11.06 0.05 10.47 0 9.7C-0.05 8.94 0.53 8.27 1.3 8.23C2.06 8.18 2.72 8.76 2.77 9.53Z" fill="#014747"/><path d="M5.71 7.15C6.47 7.15 7.09 6.53 7.09 5.76C7.09 4.99 6.47 4.36 5.71 4.36C4.94 4.36 4.32 4.99 4.32 5.76C4.32 6.53 4.94 7.15 5.71 7.15Z" fill="#014747"/><path d="M11.13 1.34C10.87 0.6 10.08 0.21 9.36 0.48C8.64 0.75 8.27 1.56 8.53 2.3L11.22 10.09C11.48 10.83 12.27 11.21 12.99 10.95C13.7 10.68 14.08 9.87 13.82 9.13L11.13 1.34Z" fill="#92B0B0"/><path d="M9.83 3.2C10.6 3.2 11.22 2.57 11.22 1.8C11.22 1.03 10.6 0.41 9.83 0.41C9.07 0.41 8.45 1.03 8.45 1.8C8.45 2.57 9.07 3.2 9.83 3.2Z" fill="#014747"/></svg>',
        instagram: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1.08C7.6 1.08 7.79 1.09 8.42 1.12C9.01 1.14 9.33 1.24 9.54 1.32C9.82 1.43 10.02 1.56 10.23 1.77C10.44 1.98 10.57 2.18 10.67 2.46C10.76 2.67 10.85 2.99 10.88 3.57C10.91 4.2 10.91 4.39 10.91 6C10.91 7.6 10.91 7.79 10.88 8.42C10.85 9 10.76 9.32 10.67 9.53C10.57 9.81 10.43 10.01 10.23 10.22C10.01 10.43 9.82 10.56 9.54 10.67C9.33 10.75 9.01 10.85 8.42 10.88C7.79 10.9 7.6 10.91 6 10.91C4.4 10.91 4.21 10.9 3.58 10.88C2.99 10.85 2.67 10.75 2.46 10.67C2.18 10.56 1.98 10.43 1.77 10.22C1.56 10.01 1.43 9.81 1.33 9.53C1.24 9.32 1.15 9 1.12 8.42C1.09 7.79 1.09 7.6 1.09 6C1.09 4.39 1.09 4.2 1.12 3.57C1.15 2.99 1.24 2.67 1.33 2.46C1.43 2.18 1.57 1.98 1.77 1.77C1.99 1.56 2.18 1.43 2.46 1.32C2.67 1.24 2.99 1.14 3.58 1.12C4.21 1.09 4.4 1.08 6 1.08ZM6 0C4.37 0 4.17 0.01 3.53 0.04C2.89 0.06 2.45 0.17 2.07 0.31C1.68 0.47 1.34 0.67 1.01 1.01C0.67 1.34 0.47 1.68 0.31 2.07C0.17 2.45 0.06 2.89 0.04 3.52C0.01 4.17 0 4.37 0 6C0 7.63 0.01 7.83 0.04 8.47C0.06 9.11 0.17 9.55 0.31 9.93C0.47 10.32 0.67 10.66 1.01 10.99C1.34 11.32 1.68 11.53 2.07 11.68C2.45 11.83 2.89 11.93 3.52 11.96C4.16 11.99 4.37 12 6 12C7.63 12 7.83 11.99 8.47 11.96C9.11 11.93 9.55 11.83 9.93 11.68C10.32 11.53 10.65 11.32 10.99 10.99C11.32 10.66 11.53 10.32 11.68 9.93C11.83 9.55 11.93 9.11 11.96 8.47C11.99 7.84 11.99 7.63 11.99 6C11.99 4.37 11.99 4.17 11.96 3.53C11.93 2.89 11.83 2.45 11.68 2.07C11.53 1.68 11.33 1.34 10.99 1.01C10.66 0.68 10.32 0.47 9.93 0.32C9.55 0.17 9.11 0.07 8.47 0.04C7.83 0.01 7.63 0 6 0Z" fill="currentColor"/><path d="M6 2.92C4.3 2.92 2.92 4.3 2.92 6C2.92 7.7 4.3 9.08 6 9.08C7.7 9.08 9.08 7.7 9.08 6C9.08 4.3 7.7 2.92 6 2.92ZM6 8C4.9 8 4 7.1 4 6C4 4.9 4.9 4 6 4C7.1 4 8 4.9 8 6C8 7.1 7.1 8 6 8Z" fill="currentColor"/><path d="M9.92 2.8C9.92 3.19 9.6 3.52 9.2 3.52C8.81 3.52 8.48 3.19 8.48 2.8C8.48 2.4 8.81 2.08 9.2 2.08C9.6 2.08 9.92 2.4 9.92 2.8Z" fill="currentColor"/></svg>',
        // paintbrush — the Art dock icon, reused as the "drawing" link cursor badge
        art: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12.9938 12.9034C13.0803 12.8746 13.3039 12.8746 13.4841 12.752C13.6716 12.6222 13.6932 12.579 14.097 12.1391C14.508 11.6993 15.3516 10.798 15.9428 10.1131C16.5268 9.42808 17.082 8.76474 17.63 8.02929C18.1708 7.28663 18.9279 6.11136 19.2235 5.66433C19.5119 5.21729 19.3316 5.52012 19.3749 5.3615C19.4182 5.19566 19.4903 4.82794 19.4975 4.68373C19.5047 4.53953 19.5047 4.5179 19.4037 4.50347C19.3028 4.48184 19.0504 4.5179 18.8846 4.56116C18.7188 4.60442 18.8774 4.43137 18.4231 4.74862C17.9761 5.05866 16.9522 5.82295 16.188 6.46466C15.4165 7.09917 14.5945 7.85624 13.823 8.57727C13.0515 9.29829 11.9627 10.3294 11.5518 10.7836C11.148 11.2451 11.4003 11.2234 11.3715 11.31"/><path d="M10.2321 15.4486C10.1961 15.4126 10.0735 15.3405 9.98699 15.2323C9.90768 15.1241 9.85721 14.9439 9.74184 14.8069C9.63369 14.6699 9.43901 14.4969 9.31644 14.4031C9.19386 14.3166 9.08571 14.3166 9.0064 14.2517C8.93429 14.194 8.88382 14.0715 8.85498 14.0354"/><path d="M5.38696 18.9744C5.42301 18.7293 5.54559 18.0227 5.60327 17.5035C5.66095 16.9844 5.66095 16.249 5.72584 15.8452C5.79074 15.4414 5.86284 15.3116 5.99983 15.0809C6.14404 14.8502 6.35314 14.6339 6.55502 14.468C6.75691 14.3022 7.0309 14.1796 7.23279 14.1003C7.42746 14.021 7.48515 14.021 7.75193 14.0066C8.01871 13.9994 8.646 14.0354 8.82625 14.0354"/><path d="M12.9648 12.9034C12.8206 12.7448 12.3736 12.2184 12.1068 11.9516C11.84 11.6849 11.4939 11.4181 11.3713 11.3099"/><path d="M8.85498 14.0066C8.87661 13.9273 8.7973 13.7831 8.97755 13.5163C9.16502 13.2495 9.64811 12.752 9.95815 12.4131C10.2682 12.0742 10.6143 11.6777 10.845 11.4902C11.0829 11.3099 11.2848 11.3388 11.3714 11.3099"/><path d="M12.9647 12.9323C12.9358 13.0188 12.9791 13.2062 12.8133 13.4225C12.6402 13.6461 12.2869 13.9417 11.9552 14.2517C11.6164 14.5618 11.0612 15.0953 10.7872 15.2972C10.5132 15.4919 10.3762 15.4198 10.2969 15.4486"/><path d="M4.5 19.4071C4.64421 19.3422 5.21382 19.0754 5.35802 19.0033"/><path d="M10.2681 15.4775C10.2609 15.6866 10.2609 16.4437 10.2321 16.7393C10.2105 17.0349 10.1744 17.0926 10.1095 17.2584C10.0518 17.4242 10.0014 17.5612 9.86437 17.7199C9.73458 17.8785 9.54712 18.0587 9.31639 18.2102C9.08566 18.3544 8.7612 18.4986 8.48721 18.6067C8.21322 18.7149 7.93923 18.787 7.65803 18.8519C7.37683 18.9168 7.17494 18.9817 6.80001 19.0033C6.42508 19.0321 5.65358 19.0033 5.42285 19.0033"/></svg>',
        // Company logomarks exported from the design (raster) for the experience links.
        itu: '<img src="data:image/png;base64,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" width="14" height="14" alt="" style="display:block" />',
        cosmofeed: '<img src="data:image/png;base64,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" width="13" height="13" alt="" style="display:block" />'
      };

      var mx = 0, my = 0, raf = null;
      // The badge REPLACES the native cursor: centre it on the pointer so it sits
      // right on top of the link instead of trailing to the bottom-right.
      function apply() {
        raf = null;
        var x = mx - cursor.offsetWidth / 2;
        var y = my - cursor.offsetHeight / 2;
        cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      }
      document.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        if (!raf) raf = requestAnimationFrame(apply);
      }, { passive: true });

      // Avatar badge cycles through these on each hover, then loops back to the
      // start on the 7th hover.
      var HELLO_MSGS = [
        'Hello! 👋',
        'Did you like my work?',
        'Thanks for stopping by :)',
        'Still hovering?',
        'You’re curious, I like it :D',
        'Okay, go explore!'
      ];
      var helloIdx = 0;

      function fill(el) {
        var icon = el.getAttribute('data-cursor-icon');
        var txt = el.getAttribute('data-cursor');
        var iconAfter = el.getAttribute('data-cursor-icon-after');
        if (el.hasAttribute('data-cursor-cycle')) {
          txt = HELLO_MSGS[helloIdx];
          helloIdx = (helloIdx + 1) % HELLO_MSGS.length;
        }
        if (icon && ICONS[icon]) { iconEl.innerHTML = ICONS[icon]; iconEl.classList.add('has'); }
        else { iconEl.innerHTML = ''; iconEl.classList.remove('has'); }
        if (txt) {
          textEl.textContent = '';                       // "|" in data-cursor forces a line break
          txt.split('|').forEach(function (part, i) {
            if (i) textEl.appendChild(document.createElement('br'));
            textEl.appendChild(document.createTextNode(part));
          });
          textEl.classList.add('has');
        } else { textEl.textContent = ''; textEl.classList.remove('has'); }
        if (iconAfter && ICONS[iconAfter]) { afterEl.innerHTML = ICONS[iconAfter]; afterEl.classList.add('has'); }
        else { afterEl.innerHTML = ''; afterEl.classList.remove('has'); }
        // icon with no text → compact square 24×24 badge
        cursor.classList.toggle('icon-only', !!(icon && ICONS[icon]) && !txt);
        cursor.classList.add('show');
        apply();
      }

      var targets = document.querySelectorAll('[data-cursor],[data-cursor-icon],[data-cursor-icon-after]');
      Array.prototype.forEach.call(targets, function (el) {
        el.addEventListener('mouseenter', function () { fill(el); });
        el.addEventListener('mouseleave', function () { cursor.classList.remove('show'); });
      });

      // Email chips → copy address to clipboard and confirm in the TOOLTIP.
      // Applies to EVERY mailto link (intro + all footers) so the experience is
      // consistent; the markup is set up here so footers need no extra classes.
      // Hand-drawn tick (from the design) shown in place of the envelope on copy.
      var TICK = '<svg class="email-glyph" width="15" height="12" viewBox="6.9 8.2 14.4 11.6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.69092 15.0484C8.84476 16.01 10.0627 17.3241 11.3448 18.9907C14.8416 14.043 17.6748 11.1148 20.4794 8.99072" stroke="currentColor" stroke-width="1.44" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      if (navigator.clipboard) {
        Array.prototype.forEach.call(
          document.querySelectorAll('a[href^="mailto:"]'),
          function (email) {
            email.classList.add('email');
            // ensure the envelope glyph is tagged so it can be swapped for the tick
            var svg = email.querySelector('svg');
            if (svg && !svg.classList.contains('email-glyph')) svg.classList.add('email-glyph');
            // ensure a "Copy email" tooltip exists
            var tip = email.querySelector('.email-tip');
            if (!tip) {
              tip = document.createElement('span');
              tip.className = 'email-tip';
              tip.setAttribute('aria-hidden', 'true');
              tip.textContent = 'Copy email';
              email.appendChild(tip);
            }
            var glyph = email.querySelector('.email-glyph');
            if (!glyph) return;
            var envelope = glyph.outerHTML;
            var revert = null;
            email.addEventListener('click', function (e) {
              e.preventDefault();
              var addr = email.getAttribute('href').replace(/^mailto:/, '');
              try { navigator.clipboard.writeText(addr); } catch (err) {}
              // Show confirmation immediately (don't wait on the clipboard promise).
              email.querySelector('.email-glyph').outerHTML = TICK;   // envelope → tick
              tip.textContent = 'Copied!';
              clearTimeout(revert);
              revert = setTimeout(function () {
                email.querySelector('.email-glyph').outerHTML = envelope;  // tick → envelope
                tip.textContent = 'Copy email';
              }, 1400);
            });
          }
        );
      }
    })();

// Build the dock's ruler tick marks — short ticks every 5px (8px tall) with
    // full-height (14px) marks aligned under each of the 4 dock icons
    // (centres 37/87/137/187, minus the ruler's 8px left inset).
    (function () {
      var r = document.querySelector('.dock-ruler');
      if (!r) return;
      var W = 208, H = 14, gap = 5, parts = [], tall = { 30: 1, 80: 1, 130: 1, 180: 1 };
      for (var x = 0; x <= W; x += gap) {
        var isTall = tall[x] === 1;
        parts.push('<line x1="' + x + '" y1="' + (isTall ? 0 : 6) + '" x2="' + x + '" y2="' + H + '"/>');
      }
      r.innerHTML = '<svg viewBox="0 0 208 14" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" stroke="#EFEFEF" stroke-width="1">' + parts.join('') + '</svg>';
    })();

    // Entrance / scroll reveal for the Art & About views. On opening a view the
    // lead text fades in first; ~0.5s later the content already in view follows
    // (lightly staggered), and anything further down reveals as it scrolls in.
    (function () {
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var active = null;      // the view currently being revealed
      var armed = false;      // scroll-reveal turns on 0.5s after the view opens
      var framePlayed = false; // avatar "frame swing" plays only on the first reveal this session

      function inView(el) {
        var r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.92 && r.bottom > 0;
      }
      // Reveal anything that has scrolled into frame (scroll-driven — robust
      // across browsers where IntersectionObserver misses programmatic scroll).
      function sweep() {
        if (!active || !armed) return;
        // once the page bottom is reached, nothing below can be scrolled into the
        // trigger zone — reveal whatever's left so it never gets stranded.
        var atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
        Array.prototype.forEach.call(active.querySelectorAll('[data-reveal]:not(.revealed)'), function (el) {
          if (atBottom || inView(el)) el.classList.add('revealed');
        });
      }
      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        setTimeout(function () { ticking = false; sweep(); }, 60);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);

      window.__revealView = function (root) {
        active = root; armed = false;
        if (!root) return;
        // repeating cards (art tiles, home project/experience cards) are tagged
        // here so each one reveals on its own as it scrolls into frame.
        Array.prototype.forEach.call(root.querySelectorAll('.tile:not([data-reveal]), .project:not([data-reveal]), .exp-item:not([data-reveal])'),
          function (t) { t.setAttribute('data-reveal', ''); });

        var items = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
        if (reduce) { items.forEach(function (el) { el.classList.add('revealed'); }); return; }

        // Reset so the entrance replays every time the view is opened. Crucially
        // we SNAP back to the hidden state with transitions OFF — otherwise, on a
        // repeat visit, removing .revealed would animate a slow fade-OUT that
        // collides with the reveal, so you'd only see a partial move instead of
        // the full first-time animation. Kill transition → commit hidden → restore.
        items.forEach(function (el) { el.style.transition = 'none'; el.classList.remove('revealed', 'frame-in'); el.style.transitionDelay = ''; });
        void root.offsetWidth;                              // commit the hidden state instantly
        items.forEach(function (el) { el.style.transition = ''; });

        // 1) lead text animates in first. Deferred a beat (not toggled in the same
        //    tick as the reset) so the browser paints the hidden state first and
        //    the transition ALWAYS plays — every visit, same as the content below.
        var lead = root.querySelector('[data-reveal-lead]');
        setTimeout(function () {
          if (!lead) return;
          // A framed lead (the home avatar) swings in like a picture the FIRST
          // time only; after that it just fades/rises in like everything else.
          if (lead.hasAttribute('data-reveal-frame') && !framePlayed) {
            framePlayed = true;
            lead.classList.add('revealed', 'frame-in');
            setTimeout(function () { lead.classList.remove('frame-in'); }, 3300);
          } else {
            lead.classList.add('revealed');
          }
        }, 60);

        // 2) after 0.5s reveal the content already in view (lightly staggered),
        //    then arm scroll-reveal for everything further down
        setTimeout(function () {
          var stagger = 0;
          items.forEach(function (el) {
            if (el === lead || el.classList.contains('revealed') || !inView(el)) return;
            el.style.transitionDelay = (stagger * 90) + 'ms';
            el.classList.add('revealed');
            (function (node, s) { setTimeout(function () { node.style.transitionDelay = ''; }, s * 90 + 800); })(el, stagger);
            stagger++;
          });
          armed = true;
        }, 500);
      };
    })();

    // Dock: sync .active from the URL (handles trailing slashes), slide the red
    // marker under the active icon, and play the entrance reveal for <main>.
    (function () {
      var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
      var view =
        path === '/' ? 'home' :
        path.indexOf('/more-work') === 0 ? 'more-work' :
        path.indexOf('/art') === 0 ? 'art' :
        path.indexOf('/about') === 0 ? 'about' : null;

      Array.prototype.forEach.call(document.querySelectorAll('.dock-item'), function (item) {
        var isActive = view && item.getAttribute('data-view') === view;
        item.classList.toggle('active', !!isActive);
      });

      var dot = document.querySelector('.dock-dot');
      var dock = document.querySelector('.dock');
      function positionDot() {
        var active = document.querySelector('.dock-item.active');
        if (!active || !dot || !dock) return;
        var a = active.getBoundingClientRect(), d = dock.getBoundingClientRect();
        dot.style.left = (a.left + a.width / 2 - d.left - dot.offsetWidth / 2) + 'px';
      }
      window.addEventListener('resize', positionDot);
      // Layout may not be final on first paint — measure twice.
      positionDot();
      requestAnimationFrame(positionDot);
      setTimeout(positionDot, 50);

      var current = document.querySelector('main.page, main.art-page, main.about-page, main.work-page');
      if (current && window.__revealView) window.__revealView(current);

      // Safety net: never leave secondary pages blank if reveal timing glitches.
      setTimeout(function () {
        document.documentElement.classList.add('is-ready');
        if (!current) return;
        Array.prototype.forEach.call(current.querySelectorAll('[data-reveal]'), function (el) {
          el.classList.add('revealed');
        });
      }, 900);
    })();

    // About-page photo deck: click sends the front card to the back and glides
    // the next one forward. Slot styling (offset/rotation/overlay) lives in CSS
    // keyed to data-pos, so cards just swap slots and the tint stays per-slot.
    (function () {
      var stack = document.querySelector('.about-stack');
      if (!stack) return;
      var photos = Array.prototype.slice.call(stack.querySelectorAll('.about-photo'));
      if (photos.length < 2) return;

      // Floating hand-drawn caption: shows the FRONT card's data-caption in one of
      // three slots, and hops to a different (random) slot on every advance. First
      // card is shown on the right; after that the slot is randomised.
      var caption = stack.querySelector('.deck-caption');
      var captionText = caption && caption.querySelector('.dc-text');
      // Below 1024px the floating caption is hidden (CSS), so the hint line under
      // the deck carries the front card's caption instead of "Some quick facts…".
      var hint = document.querySelector('.about-caption');
      var HINT_DEFAULT = hint ? hint.textContent : '';
      var smallMq = window.matchMedia('(max-width: 1024px)');
      // Fixed sequence: centre (right slot) → top (left-top) → bottom (left-bottom),
      // repeating as you click through the deck.
      var SLOTS = ['right', 'left-top', 'left-bottom'];
      var slotIdx = 0;
      function frontText() {
        for (var i = 0; i < photos.length; i++) {
          if (photos[i].getAttribute('data-pos') === '0') {
            return photos[i].getAttribute('data-caption') || '';
          }
        }
        return '';
      }
      // A "|" in the caption forces a line break; otherwise it wraps within 180px.
      function setText(txt) {
        captionText.textContent = '';
        txt.split('|').forEach(function (part, i) {
          if (i) captionText.appendChild(document.createElement('br'));
          captionText.appendChild(document.createTextNode(part.trim()));
        });
      }
      function paintCaption(slot) {
        syncHint();
        if (!caption) return;
        var txt = frontText();
        if (slot) caption.setAttribute('data-slot', slot);
        if (txt) { setText(txt); caption.classList.add('show'); }
        else { caption.classList.remove('show'); }
      }
      // Small screens: mirror the front card's caption onto the bottom hint line
      // (a "|" break just becomes a space here). Wider screens keep the hint copy.
      function syncHint() {
        if (!hint) return;
        if (smallMq.matches) {
          var txt = frontText().replace(/\|/g, ' ').trim();
          hint.textContent = txt || HINT_DEFAULT;   // keeps the hint's own style
        } else {
          hint.textContent = HINT_DEFAULT;
        }
      }
      if (smallMq.addEventListener) smallMq.addEventListener('change', syncHint);
      else if (smallMq.addListener) smallMq.addListener(syncHint);   // older Safari
      window.addEventListener('resize', syncHint);                   // fallback if 'change' doesn't fire
      function nextSlot() {
        slotIdx = (slotIdx + 1) % SLOTS.length;
        return SLOTS[slotIdx];
      }
      // Reset the pile to its original order (Dubai card on top) — called each
      // time the About view is opened so it never resumes mid-cycle.
      function resetDeck() {
        stack.classList.add('no-anim');
        photos.forEach(function (p, i) { p.setAttribute('data-pos', String(i)); });
        slotIdx = 0;
        void stack.offsetWidth;              // flush the snap before re-enabling glide
        stack.classList.remove('no-anim');
        paintCaption(SLOTS[slotIdx]);
      }
      window.__resetDeck = resetDeck;
      paintCaption(SLOTS[slotIdx]);   // first card → centre (right slot)

      var locked = false;
      function advance() {
        if (locked) return;
        locked = true;
        if (caption) caption.classList.remove('show');       // fade the caption out
        photos.forEach(function (p) {
          var next = (parseInt(p.getAttribute('data-pos'), 10) + photos.length - 1) % photos.length;
          p.setAttribute('data-pos', String(next));
        });
        setTimeout(function () { paintCaption(nextSlot()); }, 190);  // new text + new slot, fade back in
        setTimeout(function () { locked = false; }, 380);   // brief guard, keeps clicks tidy
      }
      stack.addEventListener('click', advance);
      stack.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
      });
    })();

    // Balanced-column masonry for the Art grid. Every tile is given a VARIED
    // display height (short / square / tall rhythm, biased by the image's own
    // orientation and sequenced so no two consecutive tiles share a height) so
    // neighbours never line up. Tiles are then distributed across N columns and
    // stretched to a shared height so all columns END ON THE SAME LINE;
    // object-fit:cover absorbs the small stretch + crop.
    (function () {
      var grid = document.querySelector('.art-grid');
      if (!grid) return;
      var GAP = 20;
      // capture the tiles once (they get re-parented into column wrappers)
      var tiles = Array.prototype.slice.call(grid.querySelectorAll('.tile'));
      var ratios = tiles.map(function (t) {
        var img = t.querySelector('img');
        var w = +img.getAttribute('width')  || img.naturalWidth  || 1;
        var h = +img.getAttribute('height') || img.naturalHeight || 1;
        return h / w;                               // natural height per unit width
      });

      // Display height per tile. Portraits/landscapes keep their (continuous,
      // already-varied) natural ratio, lightly clamped. The near-square images
      // are the ones that otherwise all render identical, so they're spread
      // across a varied set of heights (cycled, never repeating back-to-back)
      // — this breaks up the grid so neighbours don't share a height.
      var SQ = [0.80, 1.18, 0.92, 1.28, 0.72, 1.06, 0.86, 1.14];
      var dispR = [];
      (function () {
        var sqi = 0, prev = -1;
        tiles.forEach(function (t, i) {
          var r = ratios[i], v;
          if (r >= 0.87 && r <= 1.15) {                 // square-ish → spread it
            v = SQ[sqi % SQ.length];
            if (v === prev) { sqi++; v = SQ[sqi % SQ.length]; }
            sqi++;
          } else {
            v = Math.max(0.62, Math.min(1.55, r));      // keep natural, clamped
          }
          prev = v;
          dispR.push(v);
        });
      })();

      // Column count follows the ACTUAL gallery width (which now carries side
      // gutters below the 1200px design width), not the raw viewport — so as the
      // container narrows the columns step down sooner and images never balloon.
      function colCount(gridW) {
        return gridW > 1140 ? 4 : gridW > 760 ? 3 : gridW > 460 ? 2 : 1;
      }

      function layout() {
        var artPage = document.getElementById('page-art');
        if (!artPage || artPage.hidden) return;   // not on this page / not measurable
        var gridW = grid.clientWidth;
        if (!gridW) return;
        var N = colCount(gridW);
        var colW = (gridW - GAP * (N - 1)) / N;
        var PAD = 10;                                             // 5px mat × 2

        // build empty columns
        grid.innerHTML = '';
        var cols = [];
        for (var i = 0; i < N; i++) {
          var c = document.createElement('div');
          c.className = 'art-col';
          grid.appendChild(c);
          cols.push({ el: c, h: 0, items: [] });
        }
        // greedy: each tile goes to the currently-shortest column, using its
        // VARIED display height (not its natural height)
        tiles.forEach(function (t, i) {
          var th = colW * dispR[i] + PAD;
          var short = cols[0];
          for (var k = 1; k < N; k++) if (cols[k].h < short.h) short = cols[k];
          short.items.push({ el: t, h: th });
          short.el.appendChild(t);
          short.h += th + GAP;
        });
        // height of each column (drop the trailing gap), then stretch all to max
        var natH = cols.map(function (c) {
          return c.items.reduce(function (s, x) { return s + x.h; }, 0)
                 + GAP * Math.max(0, c.items.length - 1);
        });
        var maxH = Math.max.apply(null, natH);
        cols.forEach(function (c) {
          c.el.style.height = maxH + 'px';
          c.items.forEach(function (x) {
            x.el.style.flexGrow = x.h;                            // weight = display height
            x.el.style.flexBasis = '0';
          });
        });
      }
      window.__artLayout = layout;

      var raf = null;
      window.addEventListener('resize', function () {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(layout);
      });
      // run now in case the Art view is the initial view
      layout();
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
          // the nav + the first content reveal ~0.45s later, once the cover has
          // zoomed in; from there content keeps revealing as the user scrolls.
          if (reduceMotion) { overlay.classList.add('text-in'); startReveal(); }
          else revealTimer = setTimeout(function () { overlay.classList.add('text-in'); startReveal(); }, 450);
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
        var text = fmt.format(new Date()) + ' IST in Delhi';
        for (var i = 0; i < els.length; i++) els[i].textContent = text;
      }
      tick();
      setInterval(tick, 1000);
    })();

    // ---------- More work carousel (home) — coverflow, autoplays every 3s ----------
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
        // offsets measured off the Figma carousel: 600px column, center card
        // centered, near cards offset ~83.5px, far cards offset ~139.7px
        var nearX = w * 0.1392;
        var farX = w * 0.2328;
        cards.forEach(function (card, i) {
          var diff = i - active;
          if (diff > n / 2) diff -= n;
          if (diff < -n / 2) diff += n;

          // scale/scrim ratios match the Figma carousel (center 440px vs
          // near 360px vs far 320px cards, and 0% / 8% / 20% black scrim
          // over the WHOLE card, mat included)
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

      // pause the autoplay while a visitor is looking at it
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);

      var resizeRAF = null;
      window.addEventListener('resize', function () {
        if (resizeRAF) return;
        resizeRAF = requestAnimationFrame(function () { resizeRAF = null; render(); });
      }, { passive: true });
    })();
