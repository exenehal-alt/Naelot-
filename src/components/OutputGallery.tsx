import { useEffect, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Maximize2,
  X,
} from 'lucide-react';
import type { ConversionJobResult } from '../types/converter';
import { formatBytes, formatDuration } from '../utils/htmlProcessor';
import type { TranslationStrings } from '../utils/i18n';

interface OutputGalleryProps {
  t: TranslationStrings;
  result: ConversionJobResult | null;
  onDownloadZip: (job: ConversionJobResult) => void;
  onDownloadPdf: (job: ConversionJobResult) => void;
  onBackToPortal?: () => void;
  standaloneEmpty?: boolean;
}

const INITIAL_VISIBLE_PAGES = 16;
const LOAD_MORE_STEP = 16;

export function OutputGallery({
  t,
  result,
  onDownloadZip,
  onDownloadPdf,
  onBackToPortal,
  standaloneEmpty = false,
}: OutputGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PAGES);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_PAGES);
    setPreviewIndex(null);
  }, [result?.id]);

  useEffect(() => {
    if (previewIndex === null || !result) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewIndex(null);
      } else if (event.key === 'ArrowLeft') {
        setPreviewIndex((idx) => (idx !== null && idx > 0 ? idx - 1 : idx));
      } else if (event.key === 'ArrowRight') {
        setPreviewIndex((idx) =>
          idx !== null && idx < result.pages.length - 1 ? idx + 1 : idx,
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewIndex, result]);

  if (!result) {
    if (!standaloneEmpty) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-16 text-center">
        <h2 className="text-base font-semibold text-slate-900 mb-1.5">
          {t.galleryEmptyTitle}
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          {t.galleryEmptyDesc}
        </p>
        {onBackToPortal && (
          <button
            type="button"
            onClick={onBackToPortal}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {t.goToPortalBtn}
          </button>
        )}
      </div>
    );
  }

  const visiblePages = result.pages.slice(0, visibleCount);
  const hasMore = result.pages.length > visibleCount;
  const activePreview = previewIndex !== null ? result.pages[previewIndex] : null;

  return (
    <section data-testid="conversion-result" className="space-y-5">
      {/* Completion & auto-download confirmation bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold">
              {result.autoDownloaded ? t.autoDownloadedBanner : t.readyBanner}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 font-mono tabular-nums">
            <span className="font-semibold text-slate-900 truncate max-w-[240px]">
              {result.zipFilename}
            </span>
            <span className="whitespace-nowrap">
              · {result.pageCount} {t.pagesUnit}
            </span>
            <span className="whitespace-nowrap">
              · ZIP {formatBytes(result.zipSizeBytes)}
            </span>
            <span className="whitespace-nowrap">
              · PDF {formatBytes(result.pdfSizeBytes)}
            </span>
            <span className="whitespace-nowrap">
              · {formatDuration(result.elapsedMs)}
            </span>
            <span className="font-sans whitespace-nowrap">
              · {result.renderMode === 'rich-html' ? t.engineRichHtml : t.engineFastText}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onDownloadPdf(result)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.downloadPdfBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => onDownloadZip(result)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Archive className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.redownloadZipBtn}</span>
          </button>
        </div>
      </div>

      {/* Converted page thumbnails grid */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            {t.galleryHeading}
          </h3>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {t.showingPagesPrefix} {visiblePages.length} / {result.pages.length}
          </span>
        </div>

        <div
          data-testid="page-gallery-grid"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {visiblePages.map((page, idx) => (
            <div
              key={page.filename}
              className="group bg-white border border-slate-200 rounded-lg overflow-hidden transition-colors hover:border-blue-400"
            >
              <button
                type="button"
                onClick={() => setPreviewIndex(idx)}
                aria-label={`${t.pageLabel} ${page.pageNumber} — ${page.filename}`}
                className="relative block w-full bg-slate-100 aspect-[3/4] overflow-hidden text-left"
              >
                <img
                  src={page.previewUrl}
                  alt={`${result.sourceName} ${t.pageLabel} ${page.pageNumber}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-white"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-md bg-slate-900/75 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </button>

              <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-slate-600">
                <span className="truncate font-medium text-slate-800">
                  {t.pageLabel} {page.pageNumber}
                </span>
                <span className="text-slate-400 shrink-0">
                  {formatBytes(page.byteLength)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + LOAD_MORE_STEP)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {t.showMorePagesBtn} ({result.pages.length - visibleCount})
            </button>
          </div>
        )}
      </div>

      {/* Lightbox preview dialog */}
      {activePreview && previewIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${t.pageLabel} ${activePreview.pageNumber}`}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col p-4 sm:p-6"
          onClick={() => setPreviewIndex(null)}
        >
          <div
            className="max-w-4xl w-full mx-auto flex items-center justify-between text-white pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-mono tabular-nums">
              {activePreview.filename} · {activePreview.pageNumber}/{result.pages.length} ·{' '}
              {formatBytes(activePreview.byteLength)}
            </div>
            <button
              type="button"
              onClick={() => setPreviewIndex(null)}
              aria-label={t.closePreviewLabel}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div
            className="flex-1 min-h-0 flex items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={previewIndex === 0}
              onClick={() => setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
              aria-label={t.prevPageLabel}
              className="p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="max-h-full max-w-3xl overflow-auto bg-white rounded-lg shadow-2xl">
              <img
                src={activePreview.previewUrl}
                alt={`${result.sourceName} ${t.pageLabel} ${activePreview.pageNumber}`}
                referrerPolicy="no-referrer"
                className="block max-h-[80vh] w-auto object-contain"
              />
            </div>

            <button
              type="button"
              disabled={previewIndex >= result.pages.length - 1}
              onClick={() =>
                setPreviewIndex((i) =>
                  i !== null && i < result.pages.length - 1 ? i + 1 : i,
                )
              }
              aria-label={t.nextPageLabel}
              className="p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors shrink-0"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
