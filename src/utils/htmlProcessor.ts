import { zipSync } from 'fflate';
import { PDFDocument } from 'pdf-lib';
import type { ImageFormat, PageSizeKey, PageSizeSpec } from '../types/converter';

export const PAGE_SIZES: Record<PageSizeKey, PageSizeSpec> = {
  a4: {
    key: 'a4',
    label: 'A4 (210 × 297 mm)',
    widthPx: 794,
    heightPx: 1123,
    widthPt: 595.28,
    heightPt: 841.89,
    marginPx: 48,
  },
  letter: {
    key: 'letter',
    label: 'Letter (8.5 × 11 in)',
    widthPx: 816,
    heightPx: 1056,
    widthPt: 612,
    heightPt: 792,
    marginPx: 48,
  },
  legal: {
    key: 'legal',
    label: 'Legal (8.5 × 14 in)',
    widthPx: 816,
    heightPx: 1344,
    widthPt: 612,
    heightPt: 1008,
    marginPx: 48,
  },
  slide16x9: {
    key: 'slide16x9',
    label: 'Slide 16:9 (Widescreen)',
    widthPx: 1280,
    heightPx: 720,
    widthPt: 960,
    heightPt: 540,
    marginPx: 44,
  },
};

export interface TextPageChunk {
  pageNumber: number;
  lines: string[];
}

export interface RawPageImageForPacking {
  filename: string;
  imageBytes: Uint8Array;
  /** Bytes compatible with pdf-lib (PNG or JPEG). Equals imageBytes unless format is WebP. */
  pdfImageBytes: Uint8Array;
  pdfImageType: 'png' | 'jpeg';
}

const HTML_TAG_PATTERN = /<\s*(!doctype|html|head|body|div|p|h[1-6]|table|tr|td|th|ul|ol|li|section|article|header|footer|main|span|style|br|hr|img|svg|pre|blockquote)\b/i;
const RICH_LAYOUT_PATTERN = /<\s*(style|table|thead|tbody|h[1-6]|header|section|article|blockquote|ul|ol|img|svg)\b|\bstyle\s*=/i;

/**
 * Determines whether input should use the rich HTML/CSS DOM renderer or
 * the ultra-fast Canvas2D paginated text engine.
 */
export function detectContentMode(input: string): 'rich-html' | 'fast-text' {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'fast-text';
  }
  const hasHtmlTags = HTML_TAG_PATTERN.test(trimmed);
  if (!hasHtmlTags) {
    return 'fast-text';
  }
  // Very large HTML without rich layout markup routes to fast-text after tag stripping
  if (trimmed.length > 180_000 && !RICH_LAYOUT_PATTERN.test(trimmed)) {
    return 'fast-text';
  }
  return 'rich-html';
}

/**
 * Strips executable or unsafe elements while preserving visual HTML and CSS styles.
 */
export function sanitizeHtml(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

/**
 * Extracts readable plain text with preserved paragraph breaks from HTML markup.
 */
export function extractPlainTextFromHtml(html: string): string {
  const withoutHead = sanitizeHtml(html)
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');

  const withBreaks = withoutHead
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article|header|footer|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return decodeBasicEntities(withBreaks)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/**
 * High-speed deterministic text paginator capable of handling 1,000,000+ characters
 * including Bengali/Unicode scripts without dropping characters or hanging.
 */
export function paginatePlainText(
  text: string,
  charsPerLine = 84,
  linesPerPage = 46,
): TextPageChunk[] {
  const safeCharsPerLine = Math.max(20, Math.floor(charsPerLine));
  const safeLinesPerPage = Math.max(8, Math.floor(linesPerPage));
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (normalized.trim().length === 0) {
    return [{ pageNumber: 1, lines: [''] }];
  }

  const rawParagraphs = normalized.split('\n');
  const allLines: string[] = [];

  for (let p = 0; p < rawParagraphs.length; p++) {
    const para = rawParagraphs[p];
    if (para.length === 0) {
      allLines.push('');
      continue;
    }

    if (para.length <= safeCharsPerLine) {
      allLines.push(para);
      continue;
    }

    // Fast word-aware line wrapping without regex catastrophic backtracking
    let cursor = 0;
    const len = para.length;
    while (cursor < len) {
      const remaining = len - cursor;
      if (remaining <= safeCharsPerLine) {
        allLines.push(para.slice(cursor));
        break;
      }

      const sliceEnd = cursor + safeCharsPerLine;
      let breakPos = para.lastIndexOf(' ', sliceEnd);
      if (breakPos <= cursor) {
        // Check for Bengali/punctuation separators or hard-break long word
        breakPos = sliceEnd;
        allLines.push(para.slice(cursor, breakPos));
        cursor = breakPos;
      } else {
        allLines.push(para.slice(cursor, breakPos));
        cursor = breakPos + 1;
        while (cursor < len && para[cursor] === ' ') {
          cursor++;
        }
      }
    }
  }

  const pages: TextPageChunk[] = [];
  for (let i = 0; i < allLines.length; i += safeLinesPerPage) {
    pages.push({
      pageNumber: pages.length + 1,
      lines: allLines.slice(i, i + safeLinesPerPage),
    });
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, lines: [''] }];
}

/**
 * Estimates page count quickly for live character feedback without full layout.
 */
export function estimatePageCount(input: string, pageSize: PageSizeKey): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const spec = PAGE_SIZES[pageSize];
  const contentAreaFactor = (spec.widthPx * spec.heightPx) / (794 * 1123);
  const mode = detectContentMode(trimmed);
  const charsPerPage = Math.round((mode === 'rich-html' ? 3200 : 3400) * contentAreaFactor);
  return Math.max(1, Math.ceil(trimmed.length / Math.max(1200, charsPerPage)));
}

export function getImageExtension(format: ImageFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

export function getImageMimeType(format: ImageFormat): string {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'webp') return 'image/webp';
  return 'image/png';
}

export function sanitizeBaseFilename(rawName: string): string {
  const stripped = rawName
    .trim()
    .replace(/\.(html?|txt|pdf|zip)$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return stripped.length > 0 ? stripped.slice(0, 64) : 'snapsheet-document';
}

export function buildOutputFilenames(baseName: string, format: ImageFormat) {
  const cleanBase = sanitizeBaseFilename(baseName);
  const ext = getImageExtension(format);
  return {
    cleanBase,
    pdfFilename: `${cleanBase}.pdf`,
    zipFilename: `${cleanBase}-images.zip`,
    pageFilename: (pageNumber: number, totalPages: number) => {
      const padWidth = Math.max(3, String(totalPages).length);
      const padded = String(pageNumber).padStart(padWidth, '0');
      return `${cleanBase}-page-${padded}.${ext}`;
    },
  };
}

export function isSupportedFile(fileName: string): boolean {
  return /\.(html?|txt)$/i.test(fileName.trim());
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0 ms';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Packs rendered page images into a standard ZIP archive using zero-overhead STORE
 * mode (level: 0) since PNG/JPEG/WebP are already compressed.
 */
export function packImagesToZip(pages: RawPageImageForPacking[]): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  for (const page of pages) {
    files[page.filename] = page.imageBytes;
  }
  return zipSync(files, { level: 0 });
}

/**
 * Builds a real, standards-compliant multi-page PDF document from rendered page images.
 */
export async function buildPdfFromImages(
  pages: RawPageImageForPacking[],
  pageSizeKey: PageSizeKey,
): Promise<Uint8Array> {
  const spec = PAGE_SIZES[pageSizeKey];
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setCreator('SnapSheet');
  pdfDoc.setProducer('SnapSheet Instant Converter');

  for (const page of pages) {
    const pdfPage = pdfDoc.addPage([spec.widthPt, spec.heightPt]);
    const embeddedImage =
      page.pdfImageType === 'png'
        ? await pdfDoc.embedPng(page.pdfImageBytes)
        : await pdfDoc.embedJpg(page.pdfImageBytes);

    pdfPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: spec.widthPt,
      height: spec.heightPt,
    });
  }

  return pdfDoc.save({ useObjectStreams: false });
}
