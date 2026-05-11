import { getRhwp } from './wasm.js';

console.log('@rhwp/core WASM 로드 테스트...');

try {
  const { version, HwpDocument } = await getRhwp();
  console.log('rhwp 버전:', version());
  console.log('WASM 초기화 성공.');

  const blankDoc = HwpDocument.createEmpty();
  console.log('빈 문서 페이지 수:', blankDoc.pageCount());
  blankDoc.free();
} catch (err) {
  console.error('실패:', err);
  process.exit(1);
}
