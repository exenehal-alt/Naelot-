import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { FileCode2, FileText, Upload } from 'lucide-react';
import type { TranslationStrings } from '../utils/i18n';

interface FileUploadPortalProps {
  t: TranslationStrings;
  isBusy: boolean;
  onFilesSelected: (files: File[]) => void;
  onRunSampleHtml: () => void;
  onRunMassiveTextSample: () => void;
}

export function FileUploadPortal({
  t,
  isBusy,
  onFilesSelected,
  onRunSampleHtml,
  onRunMassiveTextSample,
}: FileUploadPortalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isBusy) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length > 0) {
      onFilesSelected(selected);
    }
    event.target.value = '';
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="file-dropzone"
        className={`relative rounded-xl border-2 border-dashed transition-colors px-6 py-12 sm:py-16 text-center ${
          isDragging
            ? 'border-blue-600 bg-blue-50/50'
            : 'border-slate-300 bg-white hover:border-slate-400'
        } ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          id="html-file-upload-input"
          type="file"
          accept=".html,.htm,.txt,text/html,text/plain"
          multiple
          disabled={isBusy}
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="mx-auto w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 mb-4">
          <Upload className="w-5 h-5" aria-hidden="true" />
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
          {t.dropzoneTitle}
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
          {t.dropzoneSubtitle}
        </p>

        <div className="flex items-center justify-center">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>{t.dropzoneButton}</span>
          </button>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          {t.dropzoneHint}
        </p>
      </div>

      {/* Quick deterministic test triggers */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="text-xs font-medium text-slate-500">
          {t.quickTestsLabel}
        </span>
        <button
          type="button"
          disabled={isBusy}
          onClick={onRunSampleHtml}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <FileCode2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{t.testInvoiceBtn}</span>
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={onRunMassiveTextSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{t.testLargeTextBtn}</span>
        </button>
      </div>
    </div>
  );
}
