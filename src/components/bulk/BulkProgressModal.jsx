import { CheckCircle2, Loader2, Package, Sparkles } from 'lucide-react'

export function BulkProgressModal({
  isOpen,
  progress,
  onClose,
  resolution,
}) {
  if (!isOpen || !progress) return null;

  const percent = progress.total > 0
    ? Math.min(100, Math.round((progress.current / progress.total) * 100))
    : 0;

  const isDone = progress.status === 'done';
  const isZipping = progress.status === 'zipping';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDone
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
          }`}>
            {isDone ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Package className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
              {isDone ? 'Bulk Generation Complete!' : 'Generating Bulk QR Codes'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isDone
                ? 'Your ZIP archive has been created and downloaded'
                : isZipping
                ? 'Packaging QR images into ZIP archive...'
                : `Rendering at ${resolution} × ${resolution} px Ultra HD`}
            </p>
          </div>
        </div>

        {/* Progress Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-700 dark:text-slate-300 flex items-center gap-2">
              {!isDone && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              )}
              {isDone
                ? `Finished ${progress.total} of ${progress.total} QR Codes`
                : isZipping
                ? 'Compressing into ZIP...'
                : `Generating ${progress.current} / ${progress.total} QR Codes...`}
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
              {percent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-slate-700/60 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className={`h-2.5 rounded-full transition-all duration-150 ${
                isDone
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Current File Information Box */}
        {!isDone && progress.currentFile && (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between">
            <span className="text-gray-500 dark:text-slate-400">Current file:</span>
            <span className="font-mono font-medium text-gray-800 dark:text-slate-200 truncate max-w-[200px]">
              {progress.currentFile}.png
            </span>
          </div>
        )}

        {/* High Resolution Reassurance Badge */}
        <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            High Resolution ({resolution}px) • Error Correction forced to <strong>High (H)</strong> for crisp print quality
          </span>
        </div>

        {/* Action Button */}
        {isDone && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
