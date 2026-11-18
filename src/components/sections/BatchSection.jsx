import { useState, useRef } from 'react'
import { useQRStore } from '../../store/qrStore'
import QRCodeStyling from 'qr-code-styling'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import { Package, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export function BatchSection() {
  const { getQRConfig, resolution } = useQRStore();
  const [csvData, setCsvData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data
          .filter((row) => row.length >= 2 && row[0]?.trim() && row[1]?.trim())
          .map((row) => ({ filename: row[0].trim(), data: row[1].trim() }));

        if (rows.length === 0) {
          setError('No valid rows found. CSV must contain Column A: Filename, Column B: Content URL/Data.');
          return;
        }
        setCsvData(rows);
      },
      error: (err) => {
        setError(`CSV Parse Error: ${err.message}`);
      },
    });
  };

  const handleBatchGenerate = async () => {
    if (!csvData || csvData.length === 0) return;

    setProgress({ current: 0, total: csvData.length, status: 'generating' });
    setError(null);

    try {
      const zip = new JSZip();
      const baseConfig = getQRConfig();

      for (let i = 0; i < csvData.length; i++) {
        const { filename, data } = csvData[i];
        setProgress({ current: i + 1, total: csvData.length, status: 'generating' });

        const config = {
          ...baseConfig,
          width: resolution,
          height: resolution,
          data,
        };

        const qr = new QRCodeStyling(config);
        const blob = await qr.getRawData('png');

        const name = filename.endsWith('.png') ? filename : `${filename}.png`;
        zip.file(name, blob);

        await new Promise((r) => setTimeout(r, 40));
      }

      setProgress({ current: csvData.length, total: csvData.length, status: 'zipping' });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `qr-batch-${Date.now()}.zip`);

      setProgress({ current: csvData.length, total: csvData.length, status: 'done' });
    } catch (err) {
      setError(`Generation error: ${err.message}`);
      setProgress(null);
    }
  };

  const clearBatch = () => {
    setCsvData(null);
    setProgress(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-slate-400">
        Bulk-create multiple QR codes in a single ZIP archive using a CSV spreadsheet with <strong>Column A: Filename</strong> and <strong>Column B: Content/Link</strong>.
      </p>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-900/40"
      >
        <div className="flex flex-col items-center gap-1.5">
          <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
            {csvData ? `${csvData.length} items loaded from CSV` : 'Click to select CSV spreadsheet'}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            .csv files with filename & URL/content
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {csvData && !progress && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBatchGenerate}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Generate & Download ZIP ({csvData.length} QRs)
          </button>
          <button
            type="button"
            onClick={clearBatch}
            className="py-2 px-3 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {progress && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              {progress.status === 'done' ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              )}
              {progress.status === 'generating' && `Creating QR ${progress.current} of ${progress.total}...`}
              {progress.status === 'zipping' && 'Packaging into ZIP...'}
              {progress.status === 'done' && 'Batch generation complete!'}
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 text-xs">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>

          <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
