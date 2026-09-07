import { syncHeroShaderBackgrounds } from './heroShader.js';

var STORAGE_KEY = 'portfolio-theme';

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

export function applyTheme(theme) {
  var next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  document.documentElement.style.colorScheme = next;
  syncToggles(next);
  // Wait a frame so CSS vars resolve, then push --bg into live shaders.
  requestAnimationFrame(function () {
    syncHeroShaderBackgrounds();
  });
  return next;
}

function syncToggles(theme) {
  var isDark = theme === 'dark';
  Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (btn) {
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.classList.toggle('is-dark', isDark);
  });
}

function setThemeFromPoint(theme, x, y) {
  var root = document.documentElement;
  var originX = typeof x === 'number' ? x : window.innerWidth / 2;
  var originY = typeof y === 'number' ? y : window.innerHeight / 2;
  var radius = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY)
  );

  root.style.setProperty('--theme-origin-x', originX + 'px');
  root.style.setProperty('--theme-origin-y', originY + 'px');
  root.style.setProperty('--theme-radius', Math.ceil(radius) + 'px');
  root.style.setProperty('--theme-x', originX + 'px');
  root.style.setProperty('--theme-y', originY + 'px');

  var reduce =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var run = function () {
    applyTheme(theme);
    storeTheme(theme);
  };

  function clearFlags() {
    root.removeAttribute('data-theme-transition');
    root.removeAttribute('data-theme-animating');
    root.classList.remove('theme-animating');
  }

  if (!reduce && typeof document.startViewTransition === 'function') {
    root.setAttribute('data-theme-transition', theme);
    root.setAttribute('data-theme-animating', '');
    root.classList.add('theme-animating');
    var transition = document.startViewTransition(run);
    Promise.resolve(transition.finished).then(clearFlags, clearFlags);
    return;
  }

  run();
}

export function initThemeToggle() {
  applyTheme(resolveTheme());

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    var rect = btn.getBoundingClientRect();
    setThemeFromPoint(next, rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (getStoredTheme()) return;
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }
}
