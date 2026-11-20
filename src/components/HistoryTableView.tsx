import { Archive, Eye, FileDown, Trash2 } from 'lucide-react';
import type { ConversionJobResult } from '../types/converter';
import { formatBytes, formatDuration } from '../utils/htmlProcessor';
import type { TranslationStrings } from '../utils/i18n';

interface HistoryTableViewProps {
  t: TranslationStrings;
  history: ConversionJobResult[];
  onInspect: (job: ConversionJobResult) => void;
  onDownloadZip: (job: ConversionJobResult) => void;
  onDownloadPdf: (job: ConversionJobResult) => void;
  onClearAll: () => void;
  onBackToPortal: () => void;
}

export function HistoryTableView({
  t,
  history,
  onInspect,
  onDownloadZip,
  onDownloadPdf,
  onClearAll,
  onBackToPortal,
}: HistoryTableViewProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-16 text-center">
        <h2 className="text-base font-semibold text-slate-900 mb-1.5">
          {t.historyHeading}
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          {t.historyEmptyText}
        </p>
        <button
          type="button"
          onClick={onBackToPortal}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          {t.goToPortalBtn}
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">
          {t.historyHeading} ({history.length})
        </h2>
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.historyClearBtn}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-2.5 px-4">File</th>
              <th className="py-2.5 px-4 text-right">Pages</th>
              <th className="py-2.5 px-4 text-right">ZIP Size</th>
              <th className="py-2.5 px-4 text-right">PDF Size</th>
              <th className="py-2.5 px-4 text-right">Time</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {history.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900 max-w-[240px] truncate">
                  {job.sourceName}
                  <span className="ml-2 font-mono font-normal text-slate-400">
                    {job.imageFormat.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                  {job.pageCount}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                  {formatBytes(job.zipSizeBytes)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                  {formatBytes(job.pdfSizeBytes)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                  {formatDuration(job.elapsedMs)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onInspect(job)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <Eye className="w-3 h-3" aria-hidden="true" />
                      <span>{t.viewGalleryShort}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(job)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <FileDown className="w-3 h-3" aria-hidden="true" />
                      <span>{t.downloadPdfShort}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadZip(job)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <Archive className="w-3 h-3" aria-hidden="true" />
                      <span>{t.downloadZipShort}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
