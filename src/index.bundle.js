#!/usr/bin/env node
// 번들용 진입점 — wasm-bundle.js 사용 (WASM 인라인)
import { readFileSync } from 'fs';
import { extname, resolve, basename } from 'path';
import { Command } from 'commander';
import { getRhwp } from './wasm-bundle.js';
import { convertToPdf } from './pdf.js';
import { convertToText, convertToMarkdown } from './text.js';

const program = new Command();

program
  .name('hop-converter')
  .description('HWP/HWPX → PDF / Text / Markdown 변환기')
  .version('1.0.0');

program
  .command('convert <input>')
  .description('HWP/HWPX 파일을 변환합니다')
  .option('-o, --output <path>', '출력 파일 경로')
  .option('-f, --format <fmt>', '출력 형식: pdf | text | markdown', 'pdf')
  .action(async (inputPath, opts) => {
    const absInput = resolve(inputPath);

    const ext = extname(absInput).toLowerCase();
    if (ext !== '.hwp' && ext !== '.hwpx') {
      console.error('오류: .hwp 또는 .hwpx 파일만 지원합니다.');
      process.exit(1);
    }

    const fmt = opts.format.toLowerCase();
    if (!['pdf', 'text', 'markdown'].includes(fmt)) {
      console.error('오류: --format은 pdf | text | markdown 중 하나여야 합니다.');
      process.exit(1);
    }

    const outputExt = fmt === 'pdf' ? '.pdf' : fmt === 'text' ? '.txt' : '.md';
    const outputPath = opts.output ? resolve(opts.output) : resolve(basename(absInput, ext) + outputExt);

    console.log(`입력: ${absInput}`);
    console.log(`출력: ${outputPath} (${fmt})`);

    let doc = null;
    try {
      const { HwpDocument } = await getRhwp();
      const fileBytes = readFileSync(absInput);
      doc = new HwpDocument(new Uint8Array(fileBytes));

      const count = doc.pageCount();
      console.log(`페이지 수: ${count}`);

      if (fmt === 'pdf') {
        await convertToPdf(doc, outputPath);
      } else if (fmt === 'text') {
        convertToText(doc, outputPath);
      } else {
        convertToMarkdown(doc, outputPath);
      }

      console.log(`완료: ${outputPath}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`오류: 파일을 찾을 수 없습니다 — ${err.path ?? absInput}`);
      } else if (err instanceof WebAssembly.RuntimeError || err.message?.includes('unreachable')) {
        console.error('오류: HWP 파일을 처리할 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.');
      } else {
        console.error('변환 실패:', err.message ?? err);
        if (err.stack) console.error(err.stack);
      }
      process.exit(1);
    } finally {
      doc?.free();
    }
  });

program.parse();
