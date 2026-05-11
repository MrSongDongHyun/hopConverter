// WASM 바이트를 base64로 인라인하는 소스 파일 생성
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const wasmPath = join(dirname(require.resolve('@rhwp/core')), 'rhwp_bg.wasm');
const bytes = readFileSync(wasmPath);
const b64 = bytes.toString('base64');

mkdirSync(join(__dirname, '../src/generated'), { recursive: true });
writeFileSync(
  join(__dirname, '../src/generated/wasm-bytes.js'),
  `// 자동 생성 파일 — 수정하지 마세요 (generate-wasm.js 로 재생성)\n` +
  `export const wasmBytes = Buffer.from('${b64}', 'base64');\n`
);

console.log(`WASM 인라인 완료: ${Math.round(bytes.length / 1024)} KB → ${Math.round(b64.length / 1024)} KB (base64)`);
