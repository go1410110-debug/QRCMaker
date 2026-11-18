import { useState, useCallback } from 'react'
import { useQRStore } from '../../store/qrStore'
import QRCodeStyling from 'qr-code-styling'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import { 
  Download, 
  FileImage, 
  FileCode, 
  FileText, 
  Copy, 
  Check, 
  Smartphone
} from 'lucide-react'

export function Step3Download() {
  const { resolution, getQRConfig } = useQRStore();
  const [downloading, setDownloading] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = useCallback(
    async (format) => {
      setDownloading(format);
      try {
        const config = getQRConfig();
        config.width = resolution;
        config.height = resolution;

        const qr = new QRCodeStyling(config);

        if (format === 'png') {
          const blob = await qr.getRawData('png');
          saveAs(blob, `qr-code-${Date.now()}.png`);
        } else if (format === 'svg') {
          const blob = await qr.getRawData('svg');
          saveAs(blob, `qr-code-${Date.now()}.svg`);
        } else if (format === 'pdf') {
          const blob = await qr.getRawData('png');
          const url = URL.createObjectURL(blob);
          const img = new window.Image();
          img.onload = () => {
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'px',
              format: [resolution + 60, resolution + 60],
            });
            pdf.addImage(img, 'PNG', 30, 30, resolution, resolution);
            pdf.save(`qr-code-${Date.now()}.pdf`);
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
      } catch (err) {
        console.error('Download error:', err);
      } finally {
        setTimeout(() => setDownloading(null), 500);
      }
    },
    [resolution, getQRConfig]
  );

  const handleCopy = async () => {
    try {
      const config = getQRConfig();
      config.width = 600;
      config.height = 600;
      const qr = new QRCodeStyling(config);
      const blob = await qr.getRawData('png');
      
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 p-5 md:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
          3
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Download your QR Code
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Choose high-res PNG for digital screens or vector SVG for crisp printing
          </p>
        </div>
      </div>

      {/* Prominent Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Large Prominent PNG Button */}
        <button
          type="button"
          onClick={() => handleDownload('png')}
          disabled={downloading === 'png'}
          className="group relative p-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-4 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileImage className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">Download PNG</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/20 uppercase tracking-wider">
                {resolution}px
              </span>
            </div>
            <p className="text-xs text-blue-100 line-clamp-1">
              Best for web, apps & social media
            </p>
          </div>
          <Download className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-y-0.5 transition-all shrink-0" />
        </button>

        {/* Large Prominent SVG Button */}
        <button
          type="button"
          onClick={() => handleDownload('svg')}
          disabled={downloading === 'svg'}
          className="group relative p-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-4 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-slate-500/50"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileCode className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">Download SVG</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                Vector
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              Infinite scale for print & design
            </p>
          </div>
          <Download className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-y-0.5 transition-all shrink-0" />
        </button>
      </div>

      {/* Secondary Quick Actions */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => handleDownload('pdf')}
          disabled={downloading === 'pdf'}
          className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-rose-500" />
          Download PDF
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-blue-500" />
              Copy Image
            </>
          )}
        </button>
      </div>

      {/* Scannability & Quality Guarantee Box */}
      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200/60 dark:border-slate-700/60 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-gray-800 dark:text-slate-200 block">
            Scan Test Recommendation
          </span>
          <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
            Point your smartphone's camera directly at the live preview screen before printing in bulk to verify your link opens effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
}
