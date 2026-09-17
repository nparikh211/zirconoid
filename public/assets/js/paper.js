// Paints the blog sheets with the Paper Shaders paper texture.
// The shader is static, so it renders once per size and then sits there. Without WebGL2 the
// sheet keeps its plain off-white background and the page reads exactly the same.
import { ShaderMount } from '../vendor/paper-shaders/shader-mount.js';
import { paperTextureFragmentShader } from '../vendor/paper-shaders/shaders/paper-texture.js';
import { getShaderNoiseTexture } from '../vendor/paper-shaders/get-shader-noise-texture.js';
import { getShaderColorFromString } from '../vendor/paper-shaders/get-shader-color-from-string.js';
import { ShaderFitOptions, defaultObjectSizing } from '../vendor/paper-shaders/shader-sizing.js';
import { emptyPixel } from '../vendor/paper-shaders/empty-pixel.js';

// The grain of the stock. These are the values the design was signed off on.
const PAPER = {
  colorBack: '#ffffff',
  colorFront: '#948f7f',
  contrast: 0.32,
  roughness: 0.74,
  fiber: 0.47,
  fiberSize: 0.07,
  crumples: 0.18,
  crumpleSize: 0.18,
  folds: 0.75,
  foldCount: 8,
  drops: 0.04,
  fade: 0,
  seed: 850.8,
  scale: 0.28,
  fit: 'cover',
};

// Both textures are data URIs, but an Image still decodes off the main thread and the shader
// refuses one that has not finished.
const load = src => new Promise(done => {
  const img = typeof src === 'string' ? Object.assign(new Image(), { src }) : src;
  if (img.complete && img.naturalWidth) return done(img);
  img.addEventListener('load', () => done(img), { once: true });
  img.addEventListener('error', () => done(null), { once: true });
});

const sheets = document.querySelectorAll('[data-paper]');
if (sheets.length) {
  // An article runs far longer than a screen, and the canvas covers all of it, so cap the
  // render on a phone. Grain a touch softer there beats a canvas the size of the page.
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const minPixelRatio = coarse ? 1.5 : 2;
  const maxPixelCount = coarse ? 1920 * 1080 : 1920 * 1080 * 3;

  // u_image is the shader's optional source picture. A transparent pixel is how you say there
  // is none: it leaves the texture as the whole result.
  const [noise, blank] = await Promise.all([load(getShaderNoiseTexture()), load(emptyPixel)]);
  if (!noise) throw new Error('paper: the noise texture did not load');

  const uniforms = {
    u_image: blank,
    u_colorFront: getShaderColorFromString(PAPER.colorFront),
    u_colorBack: getShaderColorFromString(PAPER.colorBack),
    u_contrast: PAPER.contrast,
    u_roughness: PAPER.roughness,
    u_fiber: PAPER.fiber,
    u_fiberSize: PAPER.fiberSize,
    u_crumples: PAPER.crumples,
    u_crumpleSize: PAPER.crumpleSize,
    u_foldCount: PAPER.foldCount,
    u_folds: PAPER.folds,
    u_fade: PAPER.fade,
    u_drops: PAPER.drops,
    u_seed: PAPER.seed,
    u_noiseTexture: noise,
    u_fit: ShaderFitOptions[PAPER.fit],
    u_scale: PAPER.scale,
    u_rotation: defaultObjectSizing.rotation,
    u_offsetX: defaultObjectSizing.offsetX,
    u_offsetY: defaultObjectSizing.offsetY,
    u_originX: defaultObjectSizing.originX,
    u_originY: defaultObjectSizing.originY,
    u_worldWidth: defaultObjectSizing.worldWidth,
    u_worldHeight: defaultObjectSizing.worldHeight,
  };

  for (const sheet of sheets) {
    try {
      // The library styles the canvas itself: absolute, behind the text, clipped to the sheet.
      sheet.setAttribute('data-paper-shader', '');
      new ShaderMount(sheet, paperTextureFragmentShader, uniforms, undefined, 0, 0, minPixelRatio, maxPixelCount);
      sheet.setAttribute('data-paper-ready', '');
    } catch (e) {
      sheet.removeAttribute('data-paper-shader');
      console.warn('paper texture failed', e);
    }
  }
}
