// esbuild → pkg 순서로 단일 exe 생성
import { build } from 'esbuild';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('dist', { recursive: true });
mkdirSync('bin', { recursive: true });

console.log('1/2  esbuild 번들링...');
await build({
  entryPoints: ['src/index.bundle.js'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/cli.cjs',
  // pdfkit은 __dirname 기반으로 AFM 폰트 파일을 읽으므로 pkg assets로 별도 처리
  external: ['pdfkit', 'svg-to-pdfkit'],
});

console.log('2/2  pkg로 exe 빌드...');
execSync(
  'npx @yao-pkg/pkg dist/cli.cjs --target node22-win-x64 --output bin/hop-converter-win-x64.exe --config package.json --fallback-to-source',
  { stdio: 'inherit' }
);

console.log('\n완료: bin/hop-converter-win-x64.exe');
