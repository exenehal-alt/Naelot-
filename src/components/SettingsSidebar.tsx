import { Archive, Eye, FileDown, Trash2 } from 'lucide-react';
import type {
  ConversionJobResult,
  ConversionSettings,
  ImageFormat,
  PageSizeKey,
  RenderScale,
} from '../types/converter';
import { PAGE_SIZES, formatBytes, formatDuration } from '../utils/htmlProcessor';
import type { TranslationStrings } from '../utils/i18n';

interface SettingsSidebarProps {
  t: TranslationStrings;
  settings: ConversionSettings;
  history: ConversionJobResult[];
  activeJobId: string | null;
  isBusy: boolean;
  onUpdateSettings: (patch: Partial<ConversionSettings>) => void;
  onSelectHistoryJob: (job: ConversionJobResult) => void;
  onDownloadZip: (job: ConversionJobResult) => void;
  onDownloadPdf: (job: ConversionJobResult) => void;
  onClearHistory: () => void;
}

const IMAGE_FORMATS: { value: ImageFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'webp', label: 'WebP' },
];

export function SettingsSidebar({
  t,
  settings,
  history,
  activeJobId,
  isBusy,
  onUpdateSettings,
  onSelectHistoryJob,
  onDownloadZip,
  onDownloadPdf,
  onClearHistory,
}: SettingsSidebarProps) {
  const scales: { value: RenderScale; label: string }[] = [
    { value: 1, label: t.scaleFast },
    { value: 1.5, label: t.scaleStandard },
    { value: 2, label: t.scaleHd },
  ];

  return (
    <aside className="w-full lg:w-80 xl:w-[340px] shrink-0 lg:border-l border-slate-200 lg:pl-7 space-y-7">
      {/* Output Settings */}
      <div className="space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">
          {t.settingsHeading}
        </h2>

        {/* Image format segmented control */}
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600">
            {t.imageFormatLabel}
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-lg">
            {IMAGE_FORMATS.map((fmt) => {
              const selected = settings.imageFormat === fmt.value;
              return (
                <button
                  key={fmt.value}
                  type="button"
                  disabled={isBusy}
                  aria-pressed={selected}
                  onClick={() => onUpdateSettings({ imageFormat: fmt.value })}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page size select */}
        <div className="space-y-1.5">
          <label
            htmlFor="page-size-select"
            className="block text-xs font-medium text-slate-600"
          >
            {t.pageSizeLabel}
          </label>
          <select
            id="page-size-select"
            value={settings.pageSize}
            disabled={isBusy}
            onChange={(e) =>
              onUpdateSettings({ pageSize: e.target.value as PageSizeKey })
            }
            className="w-full h-9 px-3 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
          >
            {Object.values(PAGE_SIZES).map((spec) => (
              <option key={spec.key} value={spec.key}>
                {spec.label}
              </option>
            ))}
          </select>
        </div>

        {/* Resolution / Speed segmented control */}
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600">
            {t.resolutionLabel}
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-lg">
            {scales.map((item) => {
              const selected = settings.scale === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={isBusy}
                  aria-pressed={selected}
                  onClick={() => onUpdateSettings({ scale: item.value })}
                  className={`py-1.5 px-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Automation Switches */}
        <div className="pt-3 border-t border-slate-200 space-y-3.5">
          <h3 className="text-xs font-semibold text-slate-700">
            {t.automationHeading}
          </h3>

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <label
                htmlFor="toggle-auto-download"
                className="block text-xs font-medium text-slate-900"
              >
                {t.autoDownloadLabel}
              </label>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t.autoDownloadHint}
              </p>
            </div>
            <button
              id="toggle-auto-download"
              type="button"
              role="switch"
              aria-checked={settings.autoDownloadZip}
              onClick={() =>
                onUpdateSettings({ autoDownloadZip: !settings.autoDownloadZip })
              }
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                settings.autoDownloadZip ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                  settings.autoDownloadZip ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <label
                htmlFor="toggle-auto-paste"
                className="block text-xs font-medium text-slate-900"
              >
                {t.autoPasteLabel}
              </label>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t.autoPasteHint}
              </p>
            </div>
            <button
              id="toggle-auto-paste"
              type="button"
              role="switch"
              aria-checked={settings.autoConvertOnPaste}
              onClick={() =>
                onUpdateSettings({
                  autoConvertOnPaste: !settings.autoConvertOnPaste,
                })
              }
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                settings.autoConvertOnPaste ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                  settings.autoConvertOnPaste ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Session Conversion History */}
      <div className="pt-6 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            {t.historyHeading}
          </h2>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              <span>{t.historyClearBtn}</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 leading-relaxed">
            {t.historyEmptyText}
          </p>
        ) : (
          <ul data-testid="sidebar-history-list" className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {history.map((job) => {
              const isSelected = job.id === activeJobId;
              return (
                <li
                  key={job.id}
                  className={`py-3 space-y-2 transition-colors ${
                    isSelected ? 'bg-blue-50/40 -mx-2 px-2 rounded-md' : ''
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {job.sourceName}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                      {formatDuration(job.elapsedMs)}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono tabular-nums text-slate-500">
                    {job.pageCount} {t.pagesUnit} · {formatBytes(job.zipSizeBytes)} ·{' '}
                    {job.imageFormat.toUpperCase()}
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onDownloadZip(job)}
                      aria-label={`${t.downloadZipShort} ${job.sourceName}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <Archive className="w-3 h-3" aria-hidden="true" />
                      <span>{t.downloadZipShort}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(job)}
                      aria-label={`${t.downloadPdfShort} ${job.sourceName}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <FileDown className="w-3 h-3" aria-hidden="true" />
                      <span>{t.downloadPdfShort}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectHistoryJob(job)}
                      aria-label={`${t.viewGalleryShort} ${job.sourceName}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <Eye className="w-3 h-3" aria-hidden="true" />
                      <span>{t.viewGalleryShort}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
