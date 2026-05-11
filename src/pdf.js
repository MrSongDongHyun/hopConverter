import { writeFileSync } from 'fs';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

export async function convertToPdf(doc, outputPath) {
  const pageCount = doc.pageCount();
  const buffer = await renderAllPages(doc, pageCount);
  writeFileSync(outputPath, buffer);
}

function parseSvgDimensions(svgString) {
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  if (viewBoxMatch) {
    const [, , w, h] = viewBoxMatch[1].split(/\s+/).map(Number);
    if (w > 0 && h > 0) return { widthPt: w * 0.75, heightPt: h * 0.75 };
  }
  const wMatch = svgString.match(/width="([0-9.]+)"/);
  const hMatch = svgString.match(/height="([0-9.]+)"/);
  const w = wMatch ? Number(wMatch[1]) : 595;
  const h = hMatch ? Number(hMatch[1]) : 842;
  return { widthPt: (w || 595) * 0.75, heightPt: (h || 842) * 0.75 };
}

async function renderAllPages(doc, pageCount) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const svgs = [];

    for (let i = 0; i < pageCount; i++) {
      svgs.push(doc.renderPageSvg(i));
    }

    const { widthPt: firstW, heightPt: firstH } = parseSvgDimensions(svgs[0]);
    const pdfDoc = new PDFDocument({ size: [firstW, firstH], margin: 0, autoFirstPage: false });
    pdfDoc.on('data', c => chunks.push(c));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);

    for (let i = 0; i < svgs.length; i++) {
      const svg = svgs[i];
      const { widthPt, heightPt } = parseSvgDimensions(svg);
      pdfDoc.addPage({ size: [widthPt, heightPt], margin: 0 });
      SVGtoPDF(pdfDoc, svg, 0, 0, { width: widthPt, height: heightPt });
      process.stderr.write(`\r변환 중... ${i + 1}/${pageCount} 페이지`);
    }

    process.stderr.write('\n');
    pdfDoc.end();
  });
}
