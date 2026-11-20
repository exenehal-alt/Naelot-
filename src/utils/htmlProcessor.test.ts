import test from 'node:test';
import assert from 'node:assert/strict';
import { unzipSync } from 'fflate';
import {
  buildOutputFilenames,
  buildPdfFromImages,
  detectContentMode,
  estimatePageCount,
  extractPlainTextFromHtml,
  formatBytes,
  formatDuration,
  isSupportedFile,
  packImagesToZip,
  paginatePlainText,
  sanitizeHtml,
} from './htmlProcessor';

// Valid 1x1 white PNG binary fixture for real pdf-lib & fflate verification
const ONE_BY_ONE_PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64',
  ),
);

test('detectContentMode distinguishes rich HTML from plain text and massive unstyled text', () => {
  assert.equal(detectContentMode('Hello world plain text'), 'fast-text');
  assert.equal(detectContentMode('বাংলা সাধারণ টেক্সট ডকুমেন্ট'), 'fast-text');
  assert.equal(
    detectContentMode('<!DOCTYPE html><html><body><h1>Invoice</h1><table><tr><td>100</td></tr></table></body></html>'),
    'rich-html',
  );
  // 200,000+ chars of simple <p> tags without rich layout switches to fast-text for speed
  const hugeSimpleHtml = '<p>Simple line of text.</p>'.repeat(9000);
  assert.equal(detectContentMode(hugeSimpleHtml), 'fast-text');
});

test('sanitizeHtml removes scripts, iframes, and inline event handlers while keeping styles', () => {
  const dirty =
    '<style>h1 { color: red; }</style><h1 onclick="alert(1)">Title</h1><script>evil()</script><a href="javascript:void(0)">Link</a><iframe src="x"></iframe>';
  const clean = sanitizeHtml(dirty);
  assert.ok(clean.includes('<style>h1 { color: red; }</style>'));
  assert.ok(clean.includes('<h1>Title</h1>'));
  assert.equal(clean.includes('<script'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('<iframe'), false);
});

test('extractPlainTextFromHtml preserves paragraphs and decodes HTML entities', () => {
  const html = '<style>.a{color:red}</style><h1>Report &amp; Summary</h1><p>Line 1<br/>Line 2</p>';
  const text = extractPlainTextFromHtml(html);
  assert.ok(text.includes('Report & Summary'));
  assert.ok(text.includes('Line 1\nLine 2'));
  assert.equal(text.includes('.a{color:red}'), false);
});

test('paginatePlainText handles 200,000+ characters (including Bengali) rapidly without losing words', () => {
  const sampleLine =
    'বাংলা এবং English বিশাল টেক্সট দ্রুত পিডিএফ এবং ছবিতে কনভার্ট করার পরীক্ষা চলছে। ';
  const massiveText = Array.from({ length: 2600 }, (_, i) => `অধ্যায় ${i + 1}: ${sampleLine}`).join('\n');
  assert.ok(massiveText.length > 200_000);

  const startedAt = performance.now();
  const pages = paginatePlainText(massiveText, 80, 44);
  const elapsedMs = performance.now() - startedAt;

  assert.ok(pages.length >= 60, `Expected at least 60 pages, got ${pages.length}`);
  assert.equal(pages[0].pageNumber, 1);
  assert.equal(pages[pages.length - 1].pageNumber, pages.length);
  assert.ok(pages[0].lines[0].includes('অধ্যায় 1:'));
  assert.ok(
    pages[pages.length - 1].lines.some((line) => line.includes('অধ্যায় 2600:')),
    'Last page must contain final section without truncation',
  );
  assert.ok(elapsedMs < 500, `Pagination should be ultra-fast (<500ms), took ${elapsedMs.toFixed(1)}ms`);
});

test('buildOutputFilenames sanitizes names and pads page indices properly', () => {
  const names = buildOutputFilenames('Monthly Report / 2026.html', 'jpeg');
  assert.equal(names.pdfFilename, 'Monthly-Report-2026.pdf');
  assert.equal(names.zipFilename, 'Monthly-Report-2026-images.zip');
  assert.equal(names.pageFilename(1, 12), 'Monthly-Report-2026-page-001.jpg');
  assert.equal(names.pageFilename(1000, 1200), 'Monthly-Report-2026-page-1000.jpg');

  const fallback = buildOutputFilenames('   ', 'png');
  assert.equal(fallback.zipFilename, 'snapsheet-document-images.zip');
});

test('file validation and metric formatters produce expected output', () => {
  assert.equal(isSupportedFile('invoice.html'), true);
  assert.equal(isSupportedFile('PAGE.HTM'), true);
  assert.equal(isSupportedFile('notes.txt'), true);
  assert.equal(isSupportedFile('photo.png'), false);

  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(2 * 1024 * 1024), '2.00 MB');

  assert.equal(formatDuration(320), '320 ms');
  assert.equal(formatDuration(1450), '1.45s');

  assert.equal(estimatePageCount('', 'a4'), 0);
  assert.ok(estimatePageCount('A'.repeat(100_000), 'a4') >= 20);
});

test('packImagesToZip creates a valid standard ZIP archive verifiable via unzipSync', () => {
  const zipBytes = packImagesToZip([
    {
      filename: 'doc-page-001.png',
      imageBytes: ONE_BY_ONE_PNG,
      pdfImageBytes: ONE_BY_ONE_PNG,
      pdfImageType: 'png',
    },
    {
      filename: 'doc-page-002.png',
      imageBytes: ONE_BY_ONE_PNG,
      pdfImageBytes: ONE_BY_ONE_PNG,
      pdfImageType: 'png',
    },
  ]);

  // ZIP magic bytes: PK\x03\x04
  assert.equal(zipBytes[0], 0x50);
  assert.equal(zipBytes[1], 0x4b);

  const unzipped = unzipSync(zipBytes);
  assert.deepEqual(Object.keys(unzipped).sort(), ['doc-page-001.png', 'doc-page-002.png']);
  assert.deepEqual(Array.from(unzipped['doc-page-001.png']), Array.from(ONE_BY_ONE_PNG));
});

test('buildPdfFromImages generates a valid multi-page PDF binary', async () => {
  const pdfBytes = await buildPdfFromImages(
    [
      {
        filename: 'doc-page-001.png',
        imageBytes: ONE_BY_ONE_PNG,
        pdfImageBytes: ONE_BY_ONE_PNG,
        pdfImageType: 'png',
      },
      {
        filename: 'doc-page-002.png',
        imageBytes: ONE_BY_ONE_PNG,
        pdfImageBytes: ONE_BY_ONE_PNG,
        pdfImageType: 'png',
      },
    ],
    'a4',
  );

  const header = Buffer.from(pdfBytes.slice(0, 5)).toString('ascii');
  assert.equal(header, '%PDF-');
  const fullText = Buffer.from(pdfBytes).toString('latin1');
  assert.ok(fullText.includes('/Count 2'), 'Generated PDF must contain exactly 2 pages');
});
