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

function evenPx(value) {
  var n = Math.max(2, Math.floor(value));
  return n % 2 === 0 ? n : n - 1;
}

/** Snap shader container to even width/height, fitting the available hero fill area. */
export function snapHeroShaderSize(parentElement) {
  if (!parentElement) return;
  var fill = parentElement.closest('.cs-hero-fill');
  var maxH = fill && fill.clientHeight > 0 ? fill.clientHeight : 342;
  var maxW = fill && fill.clientWidth > 0 ? fill.clientWidth : 800;
  maxW = Math.min(800, maxW);
  if (maxW < 2) maxW = 800;

  var w = evenPx(maxW);
  var h = evenPx(w / SHADER_ASPECT);
  if (h > maxH) {
    h = evenPx(maxH);
    w = evenPx(h * SHADER_ASPECT);
  }

  parentElement.style.width = w + 'px';
  parentElement.style.height = h + 'px';
}

export function createHeroShader(parentElement, options) {
  if (!parentElement) return null;
  options = options || {};

  snapHeroShaderSize(parentElement);

  var reduceMotion =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pageBg =
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() ||
    '#f0f0f0';
  var colorFront =
    options.colorFront ||
    parentElement.getAttribute('data-shader-color') ||
    GOOGLE_COLORS.blue;

  var uniforms = {
    u_colorBack: getShaderColorFromString(pageBg),
    u_colorFront: getShaderColorFromString(colorFront),
    u_shape: DitheringShapes[HERO_SHADER_DEFAULTS.shape],
    u_type: DitheringTypes[HERO_SHADER_DEFAULTS.type],
    u_pxSize: HERO_SHADER_DEFAULTS.size,
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

  return new ShaderMount(
    parentElement,
    ditheringFragmentShader,
    uniforms,
    undefined,
    reduceMotion ? 0 : HERO_SHADER_DEFAULTS.speed,
    HERO_SHADER_DEFAULTS.frame
  );
}

export function disposeHeroShader(mount) {
  if (mount && typeof mount.dispose === 'function') {
    mount.dispose();
  }
}
