/**
 * Draft hero dither: original sparse warp shape, random tints only,
 * and a top-left–aligned pixel grid so edge half-cells never draw.
 */
import { ditheringFragmentShader } from '@paper-design/shaders';

var CENTERED_GRID = [
  'float pxSize = u_pxSize * u_pixelRatio;',
  '  vec2 pxSizeUV = gl_FragCoord.xy - .5 * u_resolution;',
  '  pxSizeUV /= pxSize;',
  '  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;',
].join('\n');

// Align the dither lattice to the canvas origin so every drawn cell is whole.
var EDGE_ALIGNED_GRID = [
  'float pxSize = u_pxSize * u_pixelRatio;',
  '  vec2 pxSizeUV = gl_FragCoord.xy / pxSize;',
  '  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;',
].join('\n');

var BINARY_TAIL = [
  'dithering -= .5;',
  '  float res = step(.5, shape + dithering);',
  '',
  '  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;',
  '  float fgOpacity = u_colorFront.a;',
  '  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;',
  '  float bgOpacity = u_colorBack.a;',
  '',
  '  vec3 color = fgColor * res;',
  '  float opacity = fgOpacity * res;',
  '',
  '  color += bgColor * (1. - opacity);',
  '  opacity += bgOpacity * (1. - opacity);',
  '',
  '  fragColor = vec4(color, opacity);',
  '}',
].join('\n');

var MULTI_TAIL = [
  '// Classic random dither against the animated shape (cells fill/unfill over time),',
  '// remapped so density sits near ~50% instead of a solid block.',
  '  // shape animates over time → density crosses each cell hash → fill/unfill.',
  '  float density = mix(0.08, 0.72, clamp(shape, 0.0, 1.0));',
  '  float lit = step(hash21(ditheringNoiseUV), density);',
  '  float rnd = hash21(ditheringNoiseUV + vec2(17.0, 9.0));',
  '  float levels = 5.0;',
  '  int idx = int(floor(rnd * levels));',
  '',
  '  // Drop any remainder strip that is not a full cell.',
  '  vec2 cellCoord = floor(gl_FragCoord.xy / pxSize);',
  '  vec2 cellCount = floor(u_resolution / pxSize);',
  '  bool fullCell = cellCoord.x >= 0.0 && cellCoord.y >= 0.0',
  '    && cellCoord.x < cellCount.x && cellCoord.y < cellCount.y;',
  '',
  '  vec3 base = u_colorFront.rgb;',
  '  vec3 tint0 = mix(base, vec3(1.0), 0.06);',
  '  vec3 tint1 = mix(base, vec3(1.0), 0.22);',
  '  vec3 tint2 = mix(base, vec3(1.0), 0.38);',
  '  vec3 tint3 = mix(base, vec3(1.0), 0.55);',
  '  vec3 tint4 = mix(base, vec3(1.0), 0.72);',
  '',
  '  vec3 ink = tint0;',
  '  float inkA = 0.0;',
  '  if (fullCell && lit > 0.5) {',
  '    inkA = u_colorFront.a;',
  '    if (idx == 0) ink = tint0;',
  '    else if (idx == 1) ink = tint1;',
  '    else if (idx == 2) ink = tint2;',
  '    else if (idx == 3) ink = tint3;',
  '    else ink = tint4;',
  '  }',
  '',
  '  vec3 fgColor = ink * inkA;',
  '  float fgOpacity = inkA;',
  '  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;',
  '  float bgOpacity = u_colorBack.a;',
  '',
  '  vec3 color = fgColor;',
  '  float opacity = fgOpacity;',
  '',
  '  color += bgColor * (1. - opacity);',
  '  opacity += bgOpacity * (1. - opacity);',
  '',
  '  fragColor = vec4(color, opacity);',
  '}',
].join('\n');

export var heroDitherMultiFragmentShader = ditheringFragmentShader
  .replace(CENTERED_GRID, EDGE_ALIGNED_GRID)
  .replace(BINARY_TAIL, MULTI_TAIL);

if (
  heroDitherMultiFragmentShader.indexOf('fullCell') === -1 ||
  heroDitherMultiFragmentShader.indexOf('density') === -1 ||
  heroDitherMultiFragmentShader.indexOf('gl_FragCoord.xy / pxSize') === -1
) {
  console.warn('[heroDitherMulti] Failed to patch Paper dithering shader');
}
