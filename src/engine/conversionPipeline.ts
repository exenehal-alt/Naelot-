import type {
  ConversionJobResult,
  ConversionSettings,
  ConvertedPageImage,
  ImageFormat,
  PageSizeSpec,
  PipelineProgressState,
} from '../types/converter';
import {
  PAGE_SIZES,
  buildOutputFilenames,
  buildPdfFromImages,
  detectContentMode,
  extractPlainTextFromHtml,
  getImageMimeType,
  packImagesToZip,
  paginatePlainText,
  sanitizeHtml,
  type RawPageImageForPacking,
} from '../utils/htmlProcessor';

export interface PipelineRunInput {
  content: string;
  sourceName: string;
  settings: ConversionSettings;
  onProgress?: (progress: PipelineProgressState) => void;
}

const yieldToBrowser = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type });
}

function canvasToUint8Array(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode page canvas to image.'));
          return;
        }
        blob
          .arrayBuffer()
          .then((buffer) => resolve(new Uint8Array(buffer)))
          .catch(reject);
      },
      mimeType,
      quality,
    );
  });
}

async function encodePageCanvas(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  jpegQuality: number,
): Promise<{
  imageBytes: Uint8Array;
  pdfImageBytes: Uint8Array;
  pdfImageType: 'png' | 'jpeg';
  mimeType: string;
}> {
  const mimeType = getImageMimeType(format);
  if (format === 'webp') {
    const [webpBytes, jpegBytes] = await Promise.all([
      canvasToUint8Array(canvas, 'image/webp', jpegQuality),
      canvasToUint8Array(canvas, 'image/jpeg', jpegQuality),
    ]);
    return {
      imageBytes: webpBytes,
      pdfImageBytes: jpegBytes,
      pdfImageType: 'jpeg',
      mimeType,
    };
  }

  const bytes = await canvasToUint8Array(canvas, mimeType, jpegQuality);
  return {
    imageBytes: bytes,
    pdfImageBytes: bytes,
    pdfImageType: format === 'png' ? 'png' : 'jpeg',
    mimeType,
  };
}

/**
 * Renders a single paginated plain-text page directly onto Canvas2D using the
 * browser's native Unicode/Bengali text shaper at high speed.
 */
function drawTextPageToCanvas(
  canvas: HTMLCanvasElement,
  lines: string[],
  pageNumber: number,
  totalPages: number,
  title: string,
  spec: PageSizeSpec,
  scale: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.');
  }

  canvas.width = Math.round(spec.widthPx * scale);
  canvas.height = Math.round(spec.heightPx * scale);

  ctx.save();
  ctx.scale(scale, scale);

  // Pure crisp white sheet background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, spec.widthPx, spec.heightPx);

  const marginX = spec.marginPx;
  const topHeaderY = 26;
  const contentTopY = spec.marginPx + 14;
  const footerY = spec.heightPx - 22;

  // Subtle top document header rule
  ctx.fillStyle = '#64748b';
  ctx.font = '500 10.5px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textBaseline = 'middle';
  const truncatedTitle = title.length > 64 ? `${title.slice(0, 61)}...` : title;
  ctx.fillText(truncatedTitle, marginX, topHeaderY);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, topHeaderY + 12);
  ctx.lineTo(spec.widthPx - marginX, topHeaderY + 12);
  ctx.stroke();

  // Body lines
  const fontSize = spec.key === 'slide16x9' ? 14 : 13;
  const lineHeight = spec.key === 'slide16x9' ? 22 : 20.5;
  ctx.fillStyle = '#0f172a';
  ctx.font = `400 ${fontSize}px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif`;
  ctx.textBaseline = 'top';

  const maxLineWidth = spec.widthPx - marginX * 2;
  let y = contentTopY;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (y + lineHeight > footerY - 12) break;
    if (line.length > 0) {
      // Bold section headings automatically when clearly underlined or numbered chapter
      const isHeading =
        i === 0 && pageNumber === 1
          ? true
          : /^(অধ্যায়\s+\d+|Section\s+#?\d+|Chapter\s+\d+|===+)/i.test(line.trim());
      if (isHeading) {
        ctx.font = `700 ${fontSize + 1}px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif`;
        ctx.fillText(line, marginX, y, maxLineWidth);
        ctx.font = `400 ${fontSize}px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif`;
      } else {
        ctx.fillText(line, marginX, y, maxLineWidth);
      }
    }
    y += lineHeight;
  }

  // Footer with page number
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(marginX, footerY - 10);
  ctx.lineTo(spec.widthPx - marginX, footerY - 10);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '500 10.5px "JetBrains Mono", monospace';
  ctx.textBaseline = 'middle';
  const pageText = `${pageNumber} / ${totalPages}`;
  const pageTextWidth = ctx.measureText(pageText).width;
  ctx.fillText(pageText, spec.widthPx - marginX - pageTextWidth, footerY);

  ctx.restore();
}

/**
 * Splits rich HTML into clean page-sized DOM fragments by measuring elements
 * in a temporary offscreen container sized identically to the target page.
 */
function paginateRichHtmlToXhtmlPages(
  sanitizedHtml: string,
  spec: PageSizeSpec,
): { stylesCss: string; pageXhtmlList: string[]; pageFallbackTexts: string[] } {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(sanitizedHtml, 'text/html');

  // Collect all CSS from <style> tags
  const styleNodes = Array.from(parsedDoc.querySelectorAll('style'));
  const stylesCss = styleNodes.map((node) => node.textContent || '').join('\n');
  styleNodes.forEach((node) => node.remove());

  // Strip external image sources that would taint canvas inside SVG foreignObject
  parsedDoc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src && !src.startsWith('data:')) {
      img.removeAttribute('src');
      img.setAttribute(
        'style',
        `${img.getAttribute('style') || ''};display:inline-block;min-width:48px;min-height:24px;background:#f1f5f9;border:1px solid #cbd5e1;`,
      );
    }
  });

  const contentWidth = spec.widthPx - spec.marginPx * 2;
  const contentHeight = spec.heightPx - spec.marginPx * 2 - 22;

  const measureHost = document.createElement('div');
  measureHost.setAttribute('aria-hidden', 'true');
  measureHost.style.cssText = [
    'position:fixed',
    'left:-100000px',
    'top:0',
    `width:${contentWidth}px`,
    'visibility:hidden',
    'pointer-events:none',
    'box-sizing:border-box',
    'font-family:"Plus Jakarta Sans","Noto Sans Bengali",sans-serif',
    'font-size:14px',
    'line-height:1.6',
    'color:#0f172a',
    'background:#ffffff',
  ].join(';');

  if (stylesCss.trim()) {
    const scopedStyle = document.createElement('style');
    scopedStyle.textContent = stylesCss;
    measureHost.appendChild(scopedStyle);
  }

  const contentRoot = document.createElement('div');
  contentRoot.style.cssText = 'width:100%;box-sizing:border-box;';
  Array.from(parsedDoc.body.childNodes).forEach((child) => {
    contentRoot.appendChild(document.importNode(child, true));
  });
  measureHost.appendChild(contentRoot);
  document.body.appendChild(measureHost);

  const pageBuckets: Node[][] = [];
  const pageFallbackTexts: string[] = [];

  try {
    // Flatten single giant wrapper containers so multi-page documents split cleanly
    const flattenBlocks = (container: Element): Node[] => {
      const result: Node[] = [];
      for (const node of Array.from(container.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.trim().length > 0) {
            const p = document.createElement('p');
            p.textContent = node.textContent.trim();
            result.push(p);
          }
          continue;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = node as HTMLElement;
        const rect = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();

        if (
          rect.height > contentHeight * 0.92 &&
          el.children.length > 1 &&
          (tag === 'div' || tag === 'main' || tag === 'section' || tag === 'article')
        ) {
          result.push(...flattenBlocks(el));
        } else if (tag === 'table' && rect.height > contentHeight * 0.92) {
          const splitTables = splitTallTable(el as HTMLTableElement, contentHeight);
          result.push(...splitTables);
        } else {
          result.push(el);
        }
      }
      return result;
    };

    const blocks = flattenBlocks(contentRoot);

    let currentBucket: Node[] = [];
    let currentHeight = 0;

    for (const block of blocks) {
      let blockHeight = 28;
      if (block.nodeType === Node.ELEMENT_NODE) {
        const el = block as HTMLElement;
        const rect = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        const mt = parseFloat(cs.marginTop) || 0;
        const mb = parseFloat(cs.marginBottom) || 0;
        blockHeight = Math.max(16, rect.height + mt + mb);
      }

      if (currentBucket.length > 0 && currentHeight + blockHeight > contentHeight) {
        pageBuckets.push(currentBucket);
        currentBucket = [block];
        currentHeight = blockHeight;
      } else {
        currentBucket.push(block);
        currentHeight += blockHeight;
      }
    }

    if (currentBucket.length > 0) {
      pageBuckets.push(currentBucket);
    }

    const serializer = new XMLSerializer();
    const pageXhtmlList = pageBuckets.map((bucket) => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      let textAccum = '';
      for (const node of bucket) {
        const cloned = node.cloneNode(true);
        wrapper.appendChild(cloned);
        textAccum += `${node.textContent || ''}\n`;
      }
      pageFallbackTexts.push(textAccum.trim());
      return serializer.serializeToString(wrapper);
    });

    if (pageXhtmlList.length === 0) {
      return {
        stylesCss,
        pageXhtmlList: ['<div xmlns="http://www.w3.org/1999/xhtml"></div>'],
        pageFallbackTexts: [extractPlainTextFromHtml(sanitizedHtml)],
      };
    }

    return { stylesCss, pageXhtmlList, pageFallbackTexts };
  } finally {
    document.body.removeChild(measureHost);
  }
}

function splitTallTable(table: HTMLTableElement, maxHeight: number): HTMLTableElement[] {
  const thead = table.querySelector('thead');
  const rows = Array.from(table.querySelectorAll('tbody tr, :scope > tr'));
  if (rows.length <= 1) return [table];

  const headerHeight = thead ? thead.getBoundingClientRect().height : 0;
  const chunks: HTMLTableElement[] = [];
  let currentRows: Element[] = [];
  let accHeight = headerHeight;

  const flush = () => {
    if (currentRows.length === 0) return;
    const cloneTable = table.cloneNode(false) as HTMLTableElement;
    if (thead) cloneTable.appendChild(thead.cloneNode(true));
    const tbody = document.createElement('tbody');
    currentRows.forEach((r) => tbody.appendChild(r.cloneNode(true)));
    cloneTable.appendChild(tbody);
    chunks.push(cloneTable);
    currentRows = [];
    accHeight = headerHeight;
  };

  for (const row of rows) {
    const h = Math.max(24, row.getBoundingClientRect().height);
    if (currentRows.length > 0 && accHeight + h > maxHeight) {
      flush();
    }
    currentRows.push(row);
    accHeight += h;
  }
  flush();
  return chunks.length > 0 ? chunks : [table];
}

function escapeXmlForStyle(css: string): string {
  return css.replace(/<\/style>/gi, '').replace(/\]\]>/g, ']]&gt;');
}

/**
 * Renders one XHTML page fragment onto a Canvas via SVG foreignObject data URI.
 */
async function drawRichHtmlPageToCanvas(
  canvas: HTMLCanvasElement,
  pageXhtml: string,
  stylesCss: string,
  pageNumber: number,
  totalPages: number,
  spec: PageSizeSpec,
  scale: number,
): Promise<boolean> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  canvas.width = Math.round(spec.widthPx * scale);
  canvas.height = Math.round(spec.heightPx * scale);

  const safeCss = escapeXmlForStyle(stylesCss);
  const svgMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" width="${spec.widthPx}" height="${spec.heightPx}" viewBox="0 0 ${spec.widthPx} ${spec.heightPx}">
  <rect width="100%" height="100%" fill="#ffffff" />
  <foreignObject x="0" y="0" width="${spec.widthPx}" height="${spec.heightPx}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${spec.widthPx}px;height:${spec.heightPx}px;box-sizing:border-box;padding:${spec.marginPx}px;background:#ffffff;color:#0f172a;font-family:'Plus Jakarta Sans','Noto Sans Bengali',system-ui,sans-serif;font-size:14px;line-height:1.6;overflow:hidden;position:relative;">
      <style><![CDATA[
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; }
        ${safeCss}
      ]]></style>
      <div style="width:100%;height:${spec.heightPx - spec.marginPx * 2 - 20}px;overflow:hidden;">
        ${pageXhtml}
      </div>
      <div style="position:absolute;left:${spec.marginPx}px;right:${spec.marginPx}px;bottom:18px;border-top:1px solid #e2e8f0;padding-top:6px;display:flex;justify-content:flex-end;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#64748b;">
        <span>${pageNumber} / ${totalPages}</span>
      </div>
    </div>
  </foreignObject>
</svg>`.trim();

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, spec.widthPx, spec.heightPx);
        ctx.restore();
        // Verify canvas is not tainted by probing a single pixel
        ctx.getImageData(0, 0, 1, 1);
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

/**
 * Triggers an immediate automatic browser file download without requiring any button click.
 */
export function triggerAutomaticDownload(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    if (anchor.parentNode) {
      anchor.parentNode.removeChild(anchor);
    }
  }, 150);
}

/**
 * Executes the complete end-to-end pipeline:
 * HTML/Text -> Paginated Render -> High-Res Images -> Real Multi-Page PDF -> Instant ZIP -> Auto-Download.
 */
export async function runConversionPipeline(input: PipelineRunInput): Promise<ConversionJobResult> {
  const startedAt = performance.now();
  const { content, sourceName, settings, onProgress } = input;
  const spec = PAGE_SIZES[settings.pageSize];
  const filenames = buildOutputFilenames(sourceName, settings.imageFormat);
  const charCount = content.length;

  const emitProgress = (
    stage: PipelineProgressState['stage'],
    currentPage: number,
    totalPages: number,
    percent: number,
  ) => {
    onProgress?.({
      stage,
      currentPage,
      totalPages,
      percent: Math.min(100, Math.max(0, Math.round(percent))),
      elapsedMs: performance.now() - startedAt,
      sourceName: filenames.cleanBase,
      charCount,
    });
  };

  emitProgress('parsing', 0, 0, 5);
  await yieldToBrowser();

  const renderMode = detectContentMode(content);
  const canvas = document.createElement('canvas');

  const packedInputs: RawPageImageForPacking[] = [];
  const previewPages: ConvertedPageImage[] = [];

  if (renderMode === 'rich-html') {
    const cleanHtml = sanitizeHtml(content);
    const { stylesCss, pageXhtmlList, pageFallbackTexts } = paginateRichHtmlToXhtmlPages(
      cleanHtml,
      spec,
    );
    const totalPages = pageXhtmlList.length;
    emitProgress('rendering_pages', 0, totalPages, 12);

    for (let idx = 0; idx < totalPages; idx++) {
      const pageNumber = idx + 1;
      const renderedRich = await drawRichHtmlPageToCanvas(
        canvas,
        pageXhtmlList[idx],
        stylesCss,
        pageNumber,
        totalPages,
        spec,
        settings.scale,
      );

      if (!renderedRich) {
        const fallbackLines = paginatePlainText(
          pageFallbackTexts[idx] || '',
          spec.key === 'slide16x9' ? 128 : 82,
          spec.key === 'slide16x9' ? 25 : 46,
        )[0].lines;
        drawTextPageToCanvas(
          canvas,
          fallbackLines,
          pageNumber,
          totalPages,
          filenames.cleanBase,
          spec,
          settings.scale,
        );
      }

      const encoded = await encodePageCanvas(canvas, settings.imageFormat, settings.jpegQuality);
      const pageFilename = filenames.pageFilename(pageNumber, totalPages);
      const previewBlob = bytesToBlob(encoded.imageBytes, encoded.mimeType);
      const previewUrl = URL.createObjectURL(previewBlob);

      packedInputs.push({
        filename: pageFilename,
        imageBytes: encoded.imageBytes,
        pdfImageBytes: encoded.pdfImageBytes,
        pdfImageType: encoded.pdfImageType,
      });

      previewPages.push({
        pageNumber,
        filename: pageFilename,
        mimeType: encoded.mimeType,
        byteLength: encoded.imageBytes.byteLength,
        width: canvas.width,
        height: canvas.height,
        previewUrl,
      });

      const pct = 12 + ((pageNumber / totalPages) * 63);
      emitProgress('rendering_pages', pageNumber, totalPages, pct);
      if (pageNumber % 3 === 0) {
        await yieldToBrowser();
      }
    }
  } else {
    // High-speed Canvas2D paginated text path (handles 100k–1M+ characters effortlessly)
    const plainText = /<[a-z][\s\S]*>/i.test(content)
      ? extractPlainTextFromHtml(content)
      : content;

    const charsPerLine = spec.key === 'slide16x9' ? 132 : 84;
    const linesPerPage =
      spec.key === 'slide16x9'
        ? 25
        : spec.key === 'legal'
          ? 56
          : spec.key === 'letter'
            ? 43
            : 46;

    const pageChunks = paginatePlainText(plainText, charsPerLine, linesPerPage);
    const totalPages = pageChunks.length;
    emitProgress('rendering_pages', 0, totalPages, 12);

    const BATCH_SIZE = 4;
    const canvasPool = Array.from({ length: BATCH_SIZE }, () =>
      document.createElement('canvas'),
    );

    for (let batchStart = 0; batchStart < totalPages; batchStart += BATCH_SIZE) {
      const batch = pageChunks.slice(batchStart, batchStart + BATCH_SIZE);
      const batchEncoded = await Promise.all(
        batch.map(async (chunk, slotIdx) => {
          const slotCanvas = canvasPool[slotIdx];
          drawTextPageToCanvas(
            slotCanvas,
            chunk.lines,
            chunk.pageNumber,
            totalPages,
            filenames.cleanBase,
            spec,
            settings.scale,
          );
          const encoded = await encodePageCanvas(
            slotCanvas,
            settings.imageFormat,
            settings.jpegQuality,
          );
          return {
            chunk,
            encoded,
            width: slotCanvas.width,
            height: slotCanvas.height,
          };
        }),
      );

      for (const item of batchEncoded) {
        const pageFilename = filenames.pageFilename(item.chunk.pageNumber, totalPages);
        const previewBlob = bytesToBlob(item.encoded.imageBytes, item.encoded.mimeType);
        const previewUrl = URL.createObjectURL(previewBlob);

        packedInputs.push({
          filename: pageFilename,
          imageBytes: item.encoded.imageBytes,
          pdfImageBytes: item.encoded.pdfImageBytes,
          pdfImageType: item.encoded.pdfImageType,
        });

        previewPages.push({
          pageNumber: item.chunk.pageNumber,
          filename: pageFilename,
          mimeType: item.encoded.mimeType,
          byteLength: item.encoded.imageBytes.byteLength,
          width: item.width,
          height: item.height,
          previewUrl,
        });
      }

      const completedCount = Math.min(totalPages, batchStart + batch.length);
      const pct = 12 + (completedCount / totalPages) * 63;
      emitProgress('rendering_pages', completedCount, totalPages, pct);
      await yieldToBrowser();
    }
  }

  // Stage 3: Build real multi-page PDF via pdf-lib
  emitProgress('building_pdf', previewPages.length, previewPages.length, 80);
  await yieldToBrowser();
  const pdfBytes = await buildPdfFromImages(packedInputs, settings.pageSize);
  const pdfBlob = bytesToBlob(pdfBytes, 'application/pdf');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Stage 4: Pack all converted images into ZIP via fflate (instant STORE mode)
  emitProgress('packing_zip', previewPages.length, previewPages.length, 92);
  await yieldToBrowser();
  const zipBytes = packImagesToZip(packedInputs);
  const zipBlob = bytesToBlob(zipBytes, 'application/zip');
  const zipUrl = URL.createObjectURL(zipBlob);

  // Automatic ZIP download without needing to click a download button
  let autoDownloaded = false;
  if (settings.autoDownloadZip) {
    triggerAutomaticDownload(zipUrl, filenames.zipFilename);
    autoDownloaded = true;
  }

  const elapsedMs = performance.now() - startedAt;
  emitProgress('done', previewPages.length, previewPages.length, 100);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceName: filenames.cleanBase,
    createdAt: Date.now(),
    charCount,
    pageCount: previewPages.length,
    renderMode,
    imageFormat: settings.imageFormat,
    pageSize: settings.pageSize,
    elapsedMs,
    pdfFilename: filenames.pdfFilename,
    pdfSizeBytes: pdfBytes.byteLength,
    pdfUrl,
    zipFilename: filenames.zipFilename,
    zipSizeBytes: zipBytes.byteLength,
    zipUrl,
    autoDownloaded,
    pages: previewPages,
  };
}
