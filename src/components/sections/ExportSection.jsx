import { useCallback } from 'react'
import { useQRStore } from '../../store/qrStore'
import QRCodeStyling from 'qr-code-styling'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import { FileImage, FileCode, FileText, Settings } from 'lucide-react'

export function ExportSection() {
  const { resolution, setField, getQRConfig } = useQRStore();

  const handleDownload = useCallback(async (format) => {
    const config = getQRConfig();
    // For export, use the resolution setting
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
          format: [resolution + 40, resolution + 40],
        });
        pdf.addImage(img, 'PNG', 20, 20, resolution, resolution);
        pdf.save(`qr-code-${Date.now()}.pdf`);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [resolution, getQRConfig]);

  return (
    <div className="space-y-4">
      {/* Resolution slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Resolution
          </label>
          <span className="text-xs text-[var(--neon-cyan)] font-mono">{resolution}px</span>
        </div>
        <input
          type="range"
          min="200"
          max="2000"
          step="50"
          value={resolution}
          onChange={(e) => setField('resolution', Number(e.target.value))}
        />
        <div className="flex justify-between text-[9px] text-[var(--text-secondary)] mt-1">
          <span>200px</span>
          <span>2000px</span>
        </div>
      </div>

      {/* Download buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => handleDownload('png')} className="cyber-btn flex flex-col items-center gap-1 !py-3">
          <FileImage className="w-5 h-5" />
          <span className="text-[10px]">PNG</span>
        </button>
        <button onClick={() => handleDownload('svg')} className="cyber-btn cyber-btn-magenta flex flex-col items-center gap-1 !py-3">
          <FileCode className="w-5 h-5" />
          <span className="text-[10px]">SVG</span>
        </button>
        <button onClick={() => handleDownload('pdf')} className="cyber-btn cyber-btn-green flex flex-col items-center gap-1 !py-3">
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">PDF</span>
        </button>
      </div>
    </div>
  );
}