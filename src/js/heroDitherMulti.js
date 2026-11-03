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
  '// Filled silhouette; each cell picks a random tint of the ink (no dark shades).',
  '  float mask = step(0.1, shape);',
  '  // Re-roll with time so the tint field stays totally random as it animates.',
  '  float rnd = hash21(ditheringNoiseUV + vec2(floor(t * 3.0), floor(t * 5.0)));',
  '  float levels = 5.0;',
  '  int idx = int(floor(rnd * levels));',
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
  '  if (mask > 0.5) {',
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
  heroDitherMultiFragmentShader.indexOf('tint4') === -1
) {
  console.warn('[heroDitherMulti] Failed to patch Paper dithering shader');
}
