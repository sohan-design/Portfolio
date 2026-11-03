/**
 * Multi-tone dithering fragment shader for the draft hero.
 * Built from Paper's dithering shader: same shapes/grid, but maps shape
 * intensity to shades + tints of u_colorFront instead of a binary ink.
 */
import { ditheringFragmentShader } from '@paper-design/shaders';

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
  '// Solid silhouette + continuous tone so cells use shades/tints of the ink.',
  '  float mask = step(0.1, shape);',
  '  float tone = mix(0.18, 1.0, smoothstep(0.1, 1.35, shape));',
  '',
  '  dithering -= .5;',
  '  float levels = 5.0;',
  '  float band = clamp(tone * levels + dithering * 1.15, 0.0, levels - 0.001);',
  '  int idx = int(floor(band));',
  '',
  '  vec3 base = u_colorFront.rgb;',
  '  vec3 shadeDeep = base * 0.22;',
  '  vec3 shadeLow = base * 0.42;',
  '  vec3 shadeMid = base * 0.68;',
  '  vec3 tintLite = mix(base, vec3(1.0), 0.28);',
  '  vec3 tintHigh = mix(base, vec3(1.0), 0.55);',
  '',
  '  vec3 ink = base;',
  '  float inkA = 0.0;',
  '  if (mask > 0.5) {',
  '    inkA = u_colorFront.a;',
  '    if (idx <= 0) ink = shadeDeep;',
  '    else if (idx == 1) ink = shadeLow;',
  '    else if (idx == 2) ink = shadeMid;',
  '    else if (idx == 3) ink = mix(base, tintLite, 0.4);',
  '    else ink = tintHigh;',
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

// Keep a continuous warp field (not crushed to 0/1) so tones have range,
// while still reading as a filled silhouette via the mask above.
var WARP_FILL =
  'shape = .28 / max(0.001, abs(sin(t - shapeUV.y - shapeUV.x)));\n' +
  '    shape = clamp(shape, 0.0, 1.6);';

var WARP_ORIG =
  'shape = .15 / max(0.001, abs(sin(t - shapeUV.y - shapeUV.x)));\n' +
  '    shape = smoothstep(0.02, 1., shape);';

export var heroDitherMultiFragmentShader = ditheringFragmentShader
  .replace(WARP_ORIG, WARP_FILL)
  .replace(BINARY_TAIL, MULTI_TAIL);

if (
  heroDitherMultiFragmentShader === ditheringFragmentShader ||
  heroDitherMultiFragmentShader.indexOf('tintHigh') === -1
) {
  console.warn('[heroDitherMulti] Failed to patch Paper dithering shader');
}
