// 번들용 wasm 로더 — WASM 바이트가 빌드 시점에 인라인됨
// generate-wasm.js 실행 후 src/generated/wasm-bytes.js 가 생성되어야 함
import { wasmBytes } from './generated/wasm-bytes.js';

let initPromise = null;

function registerMeasureTextWidth() {
  globalThis.measureTextWidth = (font, text) => {
    const sizeMatch = font.match(/(\d+(?:\.\d+)?)(px|pt)/);
    const size = sizeMatch ? parseFloat(sizeMatch[1]) : 12;
    let width = 0;
    for (const char of text) {
      const cp = char.codePointAt(0);
      if (
        (cp >= 0xAC00 && cp <= 0xD7A3) ||
        (cp >= 0x4E00 && cp <= 0x9FFF) ||
        (cp >= 0x3000 && cp <= 0x303F) ||
        (cp >= 0xFF00 && cp <= 0xFFEF)
      ) {
        width += size;
      } else if (cp >= 0x0020 && cp <= 0x007E) {
        width += size * 0.55;
      } else {
        width += size * 0.7;
      }
    }
    return width;
  };
}

export function getRhwp() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    registerMeasureTextWidth();
    const mod = await import('@rhwp/core');
    await mod.default({ module_or_path: wasmBytes });
    return mod;
  })().catch(err => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}
