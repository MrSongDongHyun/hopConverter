import { writeFileSync } from 'fs';

export function convertToText(doc, outputPath) {
  const pageCount = doc.pageCount();
  const allParagraphs = [];

  for (let i = 0; i < pageCount; i++) {
    const layout = JSON.parse(doc.getPageTextLayout(i));
    const paras = groupByParaIdx(layout.runs ?? []);
    for (const runs of paras) {
      const text = runs.map(r => r.text ?? '').join('').trim();
      if (text) allParagraphs.push(text);
    }
    process.stderr.write(`\r추출 중... ${i + 1}/${pageCount} 페이지`);
  }

  process.stderr.write('\n');
  writeFileSync(outputPath, allParagraphs.join('\n'), 'utf-8');
}

export function convertToMarkdown(doc, outputPath) {
  const pageCount = doc.pageCount();
  const mdParagraphs = [];

  for (let i = 0; i < pageCount; i++) {
    const layout = JSON.parse(doc.getPageTextLayout(i));
    const paras = groupByParaIdx(layout.runs ?? []);

    for (const runs of paras) {
      const text = runs.map(r => r.text ?? '').join('').trim();
      if (!text) continue;

      const fontSize = runs.reduce((max, r) => Math.max(max, r.fontSize ?? 10), 10);
      if (fontSize >= 18) mdParagraphs.push(`# ${text}`);
      else if (fontSize >= 15) mdParagraphs.push(`## ${text}`);
      else if (fontSize >= 13) mdParagraphs.push(`### ${text}`);
      else mdParagraphs.push(text);
    }
    process.stderr.write(`\r변환 중... ${i + 1}/${pageCount} 페이지`);
  }

  process.stderr.write('\n');
  writeFileSync(outputPath, mdParagraphs.join('\n\n'), 'utf-8');
}

function groupByParaIdx(runs) {
  if (runs.length === 0) return [];
  const map = new Map();
  for (const run of runs) {
    const key = `${run.secIdx ?? 0}-${run.paraIdx ?? 0}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(run);
  }
  return [...map.values()];
}
