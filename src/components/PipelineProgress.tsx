import { AlertCircle, Check, Loader2 } from 'lucide-react';
import type { PipelineProgressState, PipelineStage } from '../types/converter';
import { formatDuration } from '../utils/htmlProcessor';
import type { TranslationStrings } from '../utils/i18n';

interface PipelineProgressProps {
  t: TranslationStrings;
  progress: PipelineProgressState;
  batchInfo?: { current: number; total: number } | null;
}

const STAGE_ORDER: PipelineStage[] = [
  'parsing',
  'rendering_pages',
  'building_pdf',
  'packing_zip',
  'done',
];

export function PipelineProgress({ t, progress, batchInfo }: PipelineProgressProps) {
  if (progress.stage === 'idle') return null;

  const isError = progress.stage === 'error';
  const currentIdx = STAGE_ORDER.indexOf(progress.stage);

  const steps: { key: PipelineStage; label: string; minIndex: number }[] = [
    { key: 'parsing', label: t.stageParse, minIndex: 0 },
    { key: 'rendering_pages', label: t.stageRender, minIndex: 1 },
    { key: 'building_pdf', label: t.stagePdf, minIndex: 2 },
    { key: 'packing_zip', label: t.stageZip, minIndex: 3 },
  ];

  return (
    <section
      aria-live="polite"
      data-testid="pipeline-progress"
      className={`rounded-xl border px-5 py-4 ${
        isError
          ? 'bg-red-50/70 border-red-200'
          : 'bg-white border-slate-200'
      }`}
    >
      {isError ? (
        <div className="flex items-start gap-3 text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">{progress.errorMessage}</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Header line with real file info and live metrics */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {progress.stage !== 'done' ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" aria-hidden="true" />
              ) : (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              )}
              <span className="text-sm font-semibold text-slate-900 truncate">
                {progress.sourceName}
              </span>
              {batchInfo && batchInfo.total > 1 && (
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  ({t.batchProgressPrefix} {batchInfo.current}/{batchInfo.total})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
              {progress.totalPages > 0 && (
                <>
                  <span>
                    {progress.currentPage}/{progress.totalPages} {t.pagesUnit}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{progress.percent}%</span>
              <span aria-hidden="true">·</span>
              <span>{formatDuration(progress.elapsedMs)}</span>
            </div>
          </div>

          {/* Crisp linear progress track */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-transform duration-150 origin-left ${
                progress.stage === 'done' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
              style={{ transform: `scaleX(${progress.percent / 100})` }}
            />
          </div>

          {/* 4-stage pipeline steps */}
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
            {steps.map((step) => {
              const isCompleted = currentIdx > step.minIndex || progress.stage === 'done';
              const isActive = currentIdx === step.minIndex && progress.stage !== 'done';
              return (
                <li
                  key={step.key}
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isActive
                        ? 'text-blue-700'
                        : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="w-3.5 h-3.5 inline-flex items-center justify-center text-[10px] font-mono shrink-0">
                      ·
                    </span>
                  )}
                  <span className="truncate">{step.label}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
