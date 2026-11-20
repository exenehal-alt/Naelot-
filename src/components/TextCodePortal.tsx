import { useRef, type ClipboardEvent } from 'react';
import { FileCode2, FileText, Play, Trash2 } from 'lucide-react';
import type { PageSizeKey } from '../types/converter';
import { estimatePageCount } from '../utils/htmlProcessor';
import type { TranslationStrings } from '../utils/i18n';

interface TextCodePortalProps {
  t: TranslationStrings;
  textValue: string;
  fileName: string;
  pageSize: PageSizeKey;
  autoConvertOnPaste: boolean;
  isBusy: boolean;
  onTextChange: (value: string) => void;
  onFileNameChange: (value: string) => void;
  onConvertSubmit: (overrideContent?: string, overrideName?: string) => void;
  onLoadSampleHtml: () => void;
  onLoadMassiveText: () => void;
}

export function TextCodePortal({
  t,
  textValue,
  fileName,
  pageSize,
  autoConvertOnPaste,
  isBusy,
  onTextChange,
  onFileNameChange,
  onConvertSubmit,
  onLoadSampleHtml,
  onLoadMassiveText,
}: TextCodePortalProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const charCount = textValue.length;
  const estPages = estimatePageCount(textValue, pageSize);

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!autoConvertOnPaste || isBusy) return;
    const pastedText = event.clipboardData.getData('text/plain');
    if (!pastedText || pastedText.trim().length === 0) return;

    event.preventDefault();
    const el = event.currentTarget;
    const start = el.selectionStart ?? textValue.length;
    const end = el.selectionEnd ?? textValue.length;
    const nextValue = `${textValue.slice(0, start)}${pastedText}${textValue.slice(end)}`;
    onTextChange(nextValue);

    // Defer slightly so textarea updates cleanly before triggering conversion
    setTimeout(() => {
      onConvertSubmit(nextValue, fileName);
    }, 40);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
      {/* Top toolbar: filename + quick loaders */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex-1 max-w-xs">
          <label
            htmlFor="output-filename-input"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            {t.textFilenameLabel}
          </label>
          <input
            id="output-filename-input"
            type="text"
            value={fileName}
            disabled={isBusy}
            onChange={(e) => onFileNameChange(e.target.value)}
            placeholder={t.textFilenamePlaceholder}
            className="w-full h-9 px-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={onLoadSampleHtml}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{t.testInvoiceBtn}</span>
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onLoadMassiveText}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{t.testLargeTextBtn}</span>
          </button>
        </div>
      </div>

      {/* Main high-capacity code/text textarea */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
          <label
            htmlFor="html-code-textarea"
            className="text-xs font-medium text-slate-600"
          >
            {t.textEditorLabel}
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
            <span data-testid="editor-char-count">
              {charCount.toLocaleString()} {t.charsUnit}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.estPagesPrefix} {estPages} {t.pagesUnit}
            </span>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          id="html-code-textarea"
          value={textValue}
          disabled={isBusy}
          onChange={(e) => onTextChange(e.target.value)}
          onPaste={handlePaste}
          spellCheck={false}
          rows={11}
          placeholder={t.textEditorPlaceholder}
          className="w-full p-3.5 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-none resize-y transition-colors"
        />
      </div>

      {/* Footer actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-500">
          {autoConvertOnPaste ? t.pasteAutoNote : ''}
        </p>

        <div className="flex items-center gap-2.5 shrink-0">
          {charCount > 0 && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onTextChange('')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.clearTextBtn}</span>
            </button>
          )}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onConvertSubmit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>{isBusy ? t.convertingBtn : t.convertNowBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
