import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { createCanvas } from 'canvas';

const require = createRequire(import.meta.url);

let initPromise = null;

function registerMeasureTextWidth() {
  let canvasCtx = null;
  let lastFont = '';
  globalThis.measureTextWidth = (font, text) => {
    if (!canvasCtx) canvasCtx = createCanvas(1, 1).getContext('2d');
    if (font !== lastFont) { canvasCtx.font = font; lastFont = font; }
    return canvasCtx.measureText(text).width;
  };
}

export function getRhwp() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    registerMeasureTextWidth();
    const mod = await import('@rhwp/core');
    const wasmPath = join(dirname(require.resolve('@rhwp/core')), 'rhwp_bg.wasm');
    const wasmBytes = readFileSync(wasmPath);
    await mod.default({ module_or_path: wasmBytes });
    return mod;
  })().catch(err => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}
