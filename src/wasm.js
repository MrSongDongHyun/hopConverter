import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);

let initPromise = null;

function registerMeasureTextWidth() {
  globalThis.measureTextWidth = (font, text) => {
    const sizeMatch = font.match(/(\d+(?:\.\d+)?)(px|pt)/);
    const size = sizeMatch ? parseFloat(sizeMatch[1]) : 12;
    let width = 0;
    for (const char of text) {
      const cp = char.codePointAt(0);
      if (
        (cp >= 0xAC00 && cp <= 0xD7A3) ||  // 한글 완성형
        (cp >= 0x4E00 && cp <= 0x9FFF) ||  // CJK 통합 한자
        (cp >= 0x3000 && cp <= 0x303F) ||  // CJK 기호
        (cp >= 0xFF00 && cp <= 0xFFEF)     // 전각 ASCII
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
