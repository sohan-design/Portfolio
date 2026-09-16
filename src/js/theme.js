import { syncHeroShaderBackgrounds } from './heroShader.js';

var STORAGE_KEY = 'portfolio-theme';
var root = document.documentElement;
var reducedMotion = window.matchMedia
  ? matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false, addEventListener: function () {} };

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {}
}

function systemPrefersDark() {
  return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme() {
  var stored = getStoredTheme();
  if (stored === 'dark' || stored === 'light') return stored;
  return systemPrefersDark() ? 'dark' : 'light';
}

function syncToggles(theme) {
  var isDark = theme === 'dark';
  var label = isDark ? 'Light mode' : 'Dark mode';
  Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (btn) {
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.classList.toggle('is-dark', isDark);
    var tip = btn.querySelector('.theme-toggle-tooltip');
    if (tip) tip.textContent = label;
  });
}

export function applyTheme(theme) {
  var next = theme === 'dark' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  root.style.colorScheme = next;

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = next === 'dark' ? '#000000' : '#ffffff';

  syncToggles(next);

  // Shader canvases paint their own fills, so they have to repaint in the same
  // task — the view transition snapshots the new frame as soon as this returns.
  syncHeroShaderBackgrounds();
  document.dispatchEvent(new CustomEvent('portfolio:theme-change', { detail: { theme: next } }));

  return next;
}

var themeTransition;
var themeRequest = 0;
var requestedTheme;

function stopThemeTransition() {
  if (themeTransition && typeof themeTransition.skipTransition === 'function') {
    themeTransition.skipTransition();
  }
  root.removeAttribute('data-theme-animating');
  root.removeAttribute('data-theme-transition');
}

async function toggleFrom(button) {
  var nextTheme =
    (requestedTheme || root.getAttribute('data-theme')) === 'dark' ? 'light' : 'dark';
  requestedTheme = nextTheme;
  var request = ++themeRequest;

  // A second click lands on the settled colors instead of queueing a wipe.
  if (themeTransition) {
    themeTransition.skipTransition();
    try {
      await themeTransition.finished;
    } catch (e) {}
  }
  if (request !== themeRequest) return;

  root.removeAttribute('data-theme-animating');
  root.removeAttribute('data-theme-transition');
  themeTransition = undefined;

  function apply() {
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  }

  if (typeof document.startViewTransition !== 'function' || reducedMotion.matches) {
    root.classList.add('theme-animating');
    apply();
    requestedTheme = undefined;
    setTimeout(function () {
      root.classList.remove('theme-animating');
    }, 420);
    return;
  }

  var box = button.getBoundingClientRect();
  var x = box.left + box.width / 2;
  var y = box.top + box.height / 2;

  // Relative coordinates stay aligned with the browser's snapshot scale on Retina.
  root.style.setProperty('--theme-origin-x', (x / innerWidth) * 100 + '%');
  root.style.setProperty('--theme-origin-y', (y / innerHeight) * 100 + '%');
  var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty(
    '--theme-radius',
    (radius / Math.hypot(innerWidth, innerHeight)) * Math.SQRT2 * 100 + 1 + '%'
  );

  root.setAttribute('data-theme-transition', nextTheme);

  var transition;
  try {
    transition = document.startViewTransition(apply);
    themeTransition = transition;
    await transition.ready;
    if (request === themeRequest && !reducedMotion.matches && root.hasAttribute('data-theme-transition')) {
      root.setAttribute('data-theme-animating', '');
    }
    await transition.finished;
  } catch (e) {
    // Theme switching stays usable if snapshots or pseudo-element animation fail.
    if (transition) transition.skipTransition();
    if (request === themeRequest) apply();
  } finally {
    if (request === themeRequest) {
      root.removeAttribute('data-theme-animating');
      root.removeAttribute('data-theme-transition');
      themeTransition = undefined;
      requestedTheme = undefined;
    }
  }
}

export function initThemeToggle() {
  applyTheme(resolveTheme());

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (btn) toggleFrom(btn);
  });

  // A viewport change invalidates the captured snapshots and the wipe origin.
  addEventListener('resize', stopThemeTransition);
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', function () {
      if (reducedMotion.matches) stopThemeTransition();
    });
  }

  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (getStoredTheme()) return;
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }
}
