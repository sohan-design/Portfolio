import {
  ShaderMount,
  ditheringFragmentShader,
  DitheringShapes,
  DitheringTypes,
  ShaderFitOptions,
  defaultObjectSizing,
  getShaderColorFromString,
} from '@paper-design/shaders';

/** Google brand palette (icon, wordmark, and product colors). */
export const GOOGLE_COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
};

const SHADER_ASPECT = 800 / 342;

const HERO_SHADER_DEFAULTS = {
  speed: 0.1,
  frame: 202317.700000006,
  shape: 'warp',
  type: '8x8',
  size: 24,
  scale: 1,
};

/** Chunkier cells on the trainer draft hero. */
const DRAFT_SHADER_PX_SIZE = 48;
/** Draft animation: 150% faster than the shared 0.1 default → 0.25. */
const DRAFT_SHADER_SPEED = HERO_SHADER_DEFAULTS.speed * 2.5;

var activeMounts = [];

function evenPx(value) {
  var n = Math.max(2, Math.floor(value));
  return n % 2 === 0 ? n : n - 1;
}

/** Round down to a whole number of dither cells (no clipped half-pixels). */
function cellSnap(value, cell) {
  var c = Math.max(1, Math.floor(cell));
  var n = Math.floor(value / c) * c;
  return Math.max(c, n);
}

function resolvePxSize(parentElement) {
  var declared = parseFloat(parentElement && parentElement.getAttribute('data-shader-size'));
  if (declared > 0) return Math.round(declared);
  if (parentElement && parentElement.classList.contains('td-hero-shader')) {
    return DRAFT_SHADER_PX_SIZE;
  }
  return HERO_SHADER_DEFAULTS.size;
}

function resolveSpeed(parentElement) {
  var declared = parseFloat(parentElement && parentElement.getAttribute('data-shader-speed'));
  if (declared > 0) return declared;
  if (parentElement && parentElement.classList.contains('td-hero-shader')) {
    return DRAFT_SHADER_SPEED;
  }
  return HERO_SHADER_DEFAULTS.speed;
}

function pageBackgroundColor() {
  if (document.documentElement.getAttribute('data-theme') === 'dark') {
    return '#000000';
  }
  return '#ffffff';
}

/** Snap shader container to whole dither cells, fitting the available hero fill area. */
export function snapHeroShaderSize(parentElement) {
  if (!parentElement) return;

  // Clear previous inline size so responsive CSS max/clamp can resolve.
  parentElement.style.width = '';
  parentElement.style.height = '';

  var pxSize = resolvePxSize(parentElement);
  var fill = parentElement.closest('.cs-hero-fill, .td-hero-fill');
  var fillW = fill && fill.clientWidth > 0 ? fill.clientWidth : 800;
  var fillH = fill && fill.clientHeight > 0 ? fill.clientHeight : 342;
  var styles = window.getComputedStyle(parentElement);
  var cssW = parseFloat(styles.width);
  var cssMaxW = parseFloat(styles.maxWidth);
  var cssMaxH = parseFloat(styles.maxHeight);

  var maxW = fillW;
  if (cssW > 0 && isFinite(cssW)) maxW = Math.min(maxW, cssW);
  if (cssMaxW > 0 && isFinite(cssMaxW)) maxW = Math.min(maxW, cssMaxW);
  var declaredMax = parseFloat(parentElement.getAttribute('data-shader-max-width'));
  if (declaredMax > 0) maxW = Math.min(maxW, declaredMax);
  maxW = Math.min(800, maxW);

  var maxH = fillH;
  if (cssMaxH > 0 && isFinite(cssMaxH)) maxH = Math.min(maxH, cssMaxH);
  if (maxW < 2) maxW = Math.min(320, fillW) || 160;
  if (maxH < 2) maxH = Math.max(pxSize * 2, Math.floor(maxW / SHADER_ASPECT));

  var w = cellSnap(evenPx(maxW), pxSize);
  var h = cellSnap(evenPx(w / SHADER_ASPECT), pxSize);
  if (h > maxH) {
    h = cellSnap(evenPx(maxH), pxSize);
    w = cellSnap(evenPx(h * SHADER_ASPECT), pxSize);
  }
  if (w < pxSize || h < pxSize) return;

  // Lock size so aspect-ratio / max-height can't leave fractional or half cells.
  parentElement.style.width = w + 'px';
  parentElement.style.height = h + 'px';
  parentElement.style.maxWidth = w + 'px';
  parentElement.style.maxHeight = h + 'px';
}

/** Keep shader back color in sync with the page --bg (light / dark). */
export function syncHeroShaderBackgrounds() {
  var pageBg = pageBackgroundColor();
  var color = getShaderColorFromString(pageBg);
  for (var i = 0; i < activeMounts.length; i++) {
    var mount = activeMounts[i];
    if (mount && typeof mount.setUniforms === 'function') {
      mount.setUniforms({ u_colorBack: color });
    }
  }
}

export function createHeroShader(parentElement, options) {
  if (!parentElement) return null;
  options = options || {};

  snapHeroShaderSize(parentElement);

  var reduceMotion =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pageBg = pageBackgroundColor();
  var colorFront =
    options.colorFront ||
    parentElement.getAttribute('data-shader-color') ||
    GOOGLE_COLORS.blue;

  var pxSize = resolvePxSize(parentElement);
  var uniforms = {
    u_colorBack: getShaderColorFromString(pageBg),
    u_colorFront: getShaderColorFromString(colorFront),
    u_shape: DitheringShapes[HERO_SHADER_DEFAULTS.shape],
    u_type: DitheringTypes[HERO_SHADER_DEFAULTS.type],
    u_pxSize: pxSize,
    u_fit: ShaderFitOptions[defaultObjectSizing.fit],
    u_scale: HERO_SHADER_DEFAULTS.scale,
    u_rotation: defaultObjectSizing.rotation,
    u_offsetX: defaultObjectSizing.offsetX,
    u_offsetY: defaultObjectSizing.offsetY,
    u_originX: defaultObjectSizing.originX,
    u_originY: defaultObjectSizing.originY,
    u_worldWidth: defaultObjectSizing.worldWidth,
    u_worldHeight: defaultObjectSizing.worldHeight,
  };

  var mount = new ShaderMount(
    parentElement,
    ditheringFragmentShader,
    uniforms,
    undefined,
    reduceMotion ? 0 : resolveSpeed(parentElement),
    HERO_SHADER_DEFAULTS.frame
  );
  activeMounts.push(mount);
  return mount;
}

export function disposeHeroShader(mount) {
  if (!mount) return;
  var idx = activeMounts.indexOf(mount);
  if (idx !== -1) activeMounts.splice(idx, 1);
  if (typeof mount.dispose === 'function') {
    mount.dispose();
  }
}
