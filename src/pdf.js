import { writeFileSync } from 'fs';
import { Resvg } from '@resvg/resvg-js';
import { PDFDocument } from 'pdf-lib';

export async function convertToPdf(doc, outputPath) {
  const pageCount = doc.pageCount();
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < pageCount; i++) {
    const svg = doc.renderPageSvg(i);
    const { widthPx, heightPx } = parseSvgDimensions(svg);

    const pngBuffer = renderSvgToPng(svg, widthPx, heightPx);
    const pngImage = await pdfDoc.embedPng(pngBuffer);

    const widthPt = pxToPt(widthPx);
    const heightPt = pxToPt(heightPx);
    const page = pdfDoc.addPage([widthPt, heightPt]);
    page.drawImage(pngImage, { x: 0, y: 0, width: widthPt, height: heightPt });

    process.stderr.write(`\r변환 중... ${i + 1}/${pageCount} 페이지`);
  }

  process.stderr.write('\n');
  writeFileSync(outputPath, await pdfDoc.save());
}

function parseSvgDimensions(svgString) {
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  if (viewBoxMatch) {
    const [, , w, h] = viewBoxMatch[1].split(/\s+/).map(Number);
    if (w > 0 && h > 0) return { widthPx: w, heightPx: h };
  }

  const wMatch = svgString.match(/width="([0-9.]+)"/);
  const hMatch = svgString.match(/height="([0-9.]+)"/);
  const w = wMatch ? Number(wMatch[1]) : 595;
  const h = hMatch ? Number(hMatch[1]) : 842;
  return { widthPx: w || 595, heightPx: h || 842 };
}

const RENDER_SCALE = 2;

function renderSvgToPng(svgString, widthPx, heightPx) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: Math.max(widthPx, 1) * RENDER_SCALE },
    font: { loadSystemFonts: true },
  });
  return resvg.render().asPng();
}

function pxToPt(px) {
  return px * 0.75;
}
