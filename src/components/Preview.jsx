import { useRef, useEffect, useMemo, useState } from 'react'
import { useQRStore } from '../store/qrStore'
import QRCodeStyling from 'qr-code-styling'
import { registerQRInstance } from '../utils/qrInstances'
import { saveAs } from 'file-saver'
import { 
  Smartphone, 
  FileImage, 
  FileCode, 
  QrCode,
  X,
  Layers
} from 'lucide-react'

export function Preview({ isMobileCompact = false }) {
  const containerRef = useRef(null);
  const qrRef = useRef(null);
  const store = useQRStore();
  const [downloading, setDownloading] = useState(null);

  const previewDimension = isMobileCompact ? 140 : 280;

  const config = useMemo(() => {
    const c = store.getQRConfig();
    c.width = previewDimension;
    c.height = previewDimension;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.data,
    store.bodyShape,
    store.bodyColorType,
    store.bodyColor,
    store.bodyGradient,
    store.eyeFrameShape,
    store.eyeFrameColorType,
    store.eyeFrameColor,
    store.eyeFrameGradient,
    store.eyeBallShape,
    store.eyeBallColorType,
    store.eyeBallColor,
    store.eyeBallGradient,
    store.bgColorType,
    store.bgColor,
    store.bgGradient,
    store.centerMode,
    store.centerImage,
    store.centerTextRendered,
    store.centerSize,
    store.errorCorrectionLevel,
    store.previewOverride,
    previewDimension,
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    let unregister = null;

    if (!qrRef.current) {
      // First mount: instantiate and append
      const qr = new QRCodeStyling(config);
      containerRef.current.innerHTML = '';
      qr.append(containerRef.current);
      qrRef.current = qr;
      unregister = registerQRInstance(qr);
    } else {
      // Subsequent state updates: update existing instance performantly without DOM thrashing
      qrRef.current.update(config);
    }

    return () => {
      if (unregister) unregister();
    };
  }, [config]);

  const handleQuickDownload = async (format) => {
    setDownloading(format);
    try {
      const exportConfig = store.getQRConfig();
      exportConfig.width = store.resolution;
      exportConfig.height = store.resolution;

      const exportQr = new QRCodeStyling(exportConfig);
      const blob = await exportQr.getRawData(format);
      saveAs(blob, `qr-code-${Date.now()}.${format}`);
    } catch (err) {
      console.error('Quick download failed:', err);
    } finally {
      setTimeout(() => setDownloading(null), 400);
    }
  };

  const previewRow = store.previewOverride
    ? store.bulkRows.find((r) => r.id === store.previewOverride.rowId)
    : null;

  if (isMobileCompact) {
    return (
      <div className="flex items-center gap-4 w-full">
        <div className="bg-white p-2 rounded-xl shadow-xs border border-gray-200 dark:border-slate-700 shrink-0">
          <div ref={containerRef} className="flex items-center justify-center w-[140px] h-[140px]" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-slate-100">
              <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Live Preview</span>
              {store.previewOverride && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                  Bulk Row
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate font-mono mt-0.5">
              {store.previewOverride?.data || store.data || 'https://google.com'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDownload('png')}
              disabled={downloading === 'png'}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileImage className="w-3.5 h-3.5" />
              PNG
            </button>
            <button
              type="button"
              onClick={() => handleQuickDownload('svg')}
              disabled={downloading === 'svg'}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              SVG
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      {/* Card Wrapper */}
      <div className="w-full bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-200/90 dark:border-slate-700/80 p-6 shadow-sm flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-slate-200">
            <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Live QR Preview</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>

        {/* Bulk Row Preview Notification Banner */}
        {store.previewOverride && (
          <div className="w-full mb-3 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between text-left">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200 block truncate">
                  Previewing: {previewRow?.fileName || 'Bulk Row'}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 truncate block">
                  {store.previewOverride.logo ? 'With Row Logo' : 'No Logo'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={store.clearPreviewOverride}
              className="p-1 rounded-md text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 cursor-pointer transition-colors"
              title="Close preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* QR Canvas Display */}
        <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/60 shadow-2xs flex items-center justify-center">
          <div
            ref={containerRef}
            className="flex items-center justify-center w-[280px] h-[280px] bg-white rounded-lg p-2 shadow-2xs"
          />
        </div>

        {/* Live Metadata & Scan Tip */}
        <div className="w-full mt-4 space-y-3">
          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 dark:text-slate-400">
            <span>
              Quality: <strong className="text-gray-800 dark:text-slate-200">{store.resolution}px</strong>
            </span>
            <span>•</span>
            <span>
              EC: <strong className="text-blue-600 dark:text-blue-400">
                {store.previewOverride?.logo || store.centerMode !== 'none' ? 'H (30%)' : `${store.errorCorrectionLevel}`}
              </strong>
            </span>
            <span>•</span>
            <span className="capitalize">
              Shape: <strong className="text-gray-800 dark:text-slate-200">{store.bodyShape}</strong>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Test-scan with your phone right now!</span>
          </div>

          {/* Quick Download Buttons on the Card */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDownload('png')}
              disabled={downloading === 'png'}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <FileImage className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={() => handleQuickDownload('svg')}
              disabled={downloading === 'svg'}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              Download SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
