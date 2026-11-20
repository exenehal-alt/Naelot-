import { useCallback, useEffect, useRef, useState } from 'react';
import { Code2, Upload } from 'lucide-react';
import { FileUploadPortal } from './components/FileUploadPortal';
import { HistoryTableView } from './components/HistoryTableView';
import { OutputGallery } from './components/OutputGallery';
import { PipelineProgress } from './components/PipelineProgress';
import { SettingsSidebar } from './components/SettingsSidebar';
import { TextCodePortal } from './components/TextCodePortal';
import { TopBar } from './components/TopBar';
import {
  runConversionPipeline,
  triggerAutomaticDownload,
} from './engine/conversionPipeline';
import type {
  ActiveTab,
  ConversionJobResult,
  ConversionSettings,
  InputMode,
  Locale,
  PipelineProgressState,
} from './types/converter';
import { isSupportedFile } from './utils/htmlProcessor';
import { TRANSLATIONS } from './utils/i18n';
import {
  SAMPLE_HTML_REPORT,
  generateMassiveSampleText,
} from './utils/sampleTemplates';

const INITIAL_SETTINGS: ConversionSettings = {
  imageFormat: 'jpeg',
  pageSize: 'a4',
  scale: 1.5,
  autoDownloadZip: true,
  autoConvertOnPaste: true,
  jpegQuality: 0.91,
};

const IDLE_PROGRESS: PipelineProgressState = {
  stage: 'idle',
  currentPage: 0,
  totalPages: 0,
  percent: 0,
  elapsedMs: 0,
  sourceName: '',
  charCount: 0,
};

function revokeJobUrls(job: ConversionJobResult) {
  URL.revokeObjectURL(job.pdfUrl);
  URL.revokeObjectURL(job.zipUrl);
  for (const page of job.pages) {
    URL.revokeObjectURL(page.previewUrl);
  }
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('bn');
  const [activeTab, setActiveTab] = useState<ActiveTab>('portal');
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [settings, setSettings] = useState<ConversionSettings>(INITIAL_SETTINGS);

  const [textValue, setTextValue] = useState('');
  const [textFileName, setTextFileName] = useState('document');

  const [progress, setProgress] = useState<PipelineProgressState>(IDLE_PROGRESS);
  const [batchInfo, setBatchInfo] = useState<{ current: number; total: number } | null>(null);
  const [history, setHistory] = useState<ConversionJobResult[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const historyRef = useRef<ConversionJobResult[]>([]);
  historyRef.current = history;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    return () => {
      for (const job of historyRef.current) {
        revokeJobUrls(job);
      }
    };
  }, []);

  const t = TRANSLATIONS[locale];
  const isBusy =
    progress.stage === 'parsing' ||
    progress.stage === 'rendering_pages' ||
    progress.stage === 'building_pdf' ||
    progress.stage === 'packing_zip';

  const activeResult =
    history.find((job) => job.id === activeJobId) ?? history[0] ?? null;

  const executeConversion = useCallback(
    async (content: string, sourceName: string) => {
      if (!content.trim()) {
        setProgress({
          ...IDLE_PROGRESS,
          stage: 'error',
          errorMessage: TRANSLATIONS[locale].emptyInputError,
        });
        return;
      }

      try {
        const result = await runConversionPipeline({
          content,
          sourceName,
          settings,
          onProgress: (nextState) => setProgress(nextState),
        });

        setHistory((prev) => [result, ...prev]);
        setActiveJobId(result.id);
      } catch (err) {
        setProgress({
          ...IDLE_PROGRESS,
          stage: 'error',
          errorMessage:
            err instanceof Error
              ? err.message
              : 'Conversion failed. Please check the input HTML and try again.',
        });
      }
    },
    [locale, settings],
  );

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter((file) => isSupportedFile(file.name));
      if (validFiles.length === 0) {
        setProgress({
          ...IDLE_PROGRESS,
          stage: 'error',
          errorMessage: TRANSLATIONS[locale].unsupportedFileError,
        });
        return;
      }

      setBatchInfo(
        validFiles.length > 1 ? { current: 1, total: validFiles.length } : null,
      );

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        if (validFiles.length > 1) {
          setBatchInfo({ current: i + 1, total: validFiles.length });
        }
        const fileText = await file.text();
        await executeConversion(fileText, file.name);
      }

      setBatchInfo(null);
    },
    [executeConversion, locale],
  );

  const handleConvertText = useCallback(
    (overrideContent?: string, overrideName?: string) => {
      const targetContent = overrideContent ?? textValue;
      const targetName = overrideName ?? textFileName;
      void executeConversion(targetContent, targetName || 'document');
    },
    [executeConversion, textFileName, textValue],
  );

  const handleRunSampleHtml = useCallback(() => {
    setTextFileName('monthly-billing-report');
    setTextValue(SAMPLE_HTML_REPORT);
    void executeConversion(SAMPLE_HTML_REPORT, 'monthly-billing-report');
  }, [executeConversion]);

  const handleRunMassiveTextSample = useCallback(() => {
    const massiveText = generateMassiveSampleText(105_000);
    setTextFileName('massive-100k-report');
    setTextValue(massiveText);
    void executeConversion(massiveText, 'massive-100k-report');
  }, [executeConversion]);

  const handleLoadSampleHtmlIntoEditor = useCallback(() => {
    setTextFileName('monthly-billing-report');
    setTextValue(SAMPLE_HTML_REPORT);
  }, []);

  const handleLoadMassiveTextIntoEditor = useCallback(() => {
    const massiveText = generateMassiveSampleText(105_000);
    setTextFileName('massive-100k-report');
    setTextValue(massiveText);
  }, []);

  const handleUpdateSettings = useCallback(
    (patch: Partial<ConversionSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const handleDownloadZip = useCallback((job: ConversionJobResult) => {
    triggerAutomaticDownload(job.zipUrl, job.zipFilename);
  }, []);

  const handleDownloadPdf = useCallback((job: ConversionJobResult) => {
    triggerAutomaticDownload(job.pdfUrl, job.pdfFilename);
  }, []);

  const handleSelectHistoryJob = useCallback((job: ConversionJobResult) => {
    setActiveJobId(job.id);
    setActiveTab('gallery');
  }, []);

  const handleClearHistory = useCallback(() => {
    for (const job of historyRef.current) {
      revokeJobUrls(job);
    }
    setHistory([]);
    setActiveJobId(null);
    setProgress(IDLE_PROGRESS);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        t={t}
        locale={locale}
        activeTab={activeTab}
        historyCount={history.length}
        hasGallery={Boolean(activeResult)}
        onSelectTab={setActiveTab}
        onToggleLocale={() => setLocale((prev) => (prev === 'bn' ? 'en' : 'bn'))}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Primary Workspace Column */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {activeTab === 'portal' && (
              <>
                {/* Compact workspace header + mode segmented control */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 text-balance">
                      {t.portalTitle}
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t.portalSubtitle}
                    </p>
                  </div>

                  {/* Functional segmented mode switcher */}
                  <div
                    role="tablist"
                    aria-label="Input mode"
                    className="inline-flex items-center p-1 bg-slate-200/70 border border-slate-200 rounded-lg self-start shrink-0"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={inputMode === 'file'}
                      onClick={() => setInputMode('file')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        inputMode === 'file'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.modeFile}</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={inputMode === 'text'}
                      onClick={() => setInputMode('text')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        inputMode === 'text'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.modeText}</span>
                    </button>
                  </div>
                </div>

                {/* Active Input Portal */}
                {inputMode === 'file' ? (
                  <FileUploadPortal
                    t={t}
                    isBusy={isBusy}
                    onFilesSelected={handleFilesSelected}
                    onRunSampleHtml={handleRunSampleHtml}
                    onRunMassiveTextSample={handleRunMassiveTextSample}
                  />
                ) : (
                  <TextCodePortal
                    t={t}
                    textValue={textValue}
                    fileName={textFileName}
                    pageSize={settings.pageSize}
                    autoConvertOnPaste={settings.autoConvertOnPaste}
                    isBusy={isBusy}
                    onTextChange={setTextValue}
                    onFileNameChange={setTextFileName}
                    onConvertSubmit={handleConvertText}
                    onLoadSampleHtml={handleLoadSampleHtmlIntoEditor}
                    onLoadMassiveText={handleLoadMassiveTextIntoEditor}
                  />
                )}

                {/* Real-Time Pipeline Status */}
                <PipelineProgress
                  t={t}
                  progress={progress}
                  batchInfo={batchInfo}
                />

                {/* Inline Output Confirmation & Page Thumbnails */}
                {activeResult && (
                  <OutputGallery
                    t={t}
                    result={activeResult}
                    onDownloadZip={handleDownloadZip}
                    onDownloadPdf={handleDownloadPdf}
                  />
                )}
              </>
            )}

            {activeTab === 'gallery' && (
              <OutputGallery
                t={t}
                result={activeResult}
                standaloneEmpty
                onDownloadZip={handleDownloadZip}
                onDownloadPdf={handleDownloadPdf}
                onBackToPortal={() => setActiveTab('portal')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTableView
                t={t}
                history={history}
                onInspect={handleSelectHistoryJob}
                onDownloadZip={handleDownloadZip}
                onDownloadPdf={handleDownloadPdf}
                onClearAll={handleClearHistory}
                onBackToPortal={() => setActiveTab('portal')}
              />
            )}
          </div>

          {/* Right Configuration & Session History Rail */}
          <SettingsSidebar
            t={t}
            settings={settings}
            history={history}
            activeJobId={activeResult?.id ?? null}
            isBusy={isBusy}
            onUpdateSettings={handleUpdateSettings}
            onSelectHistoryJob={handleSelectHistoryJob}
            onDownloadZip={handleDownloadZip}
            onDownloadPdf={handleDownloadPdf}
            onClearHistory={handleClearHistory}
          />
        </div>
      </main>
    </div>
  );
}
