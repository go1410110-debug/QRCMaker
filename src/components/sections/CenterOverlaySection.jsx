import { useEffect, useRef } from 'react'
import { useQRStore } from '../../store/qrStore'
import { renderTextToDataUrl } from '../../utils/canvasText'
import debounce from 'lodash.debounce'
import { Image, Type, X } from 'lucide-react'

export function CenterOverlaySection() {
  const {
    centerMode, setCenterMode,
    centerImage, setCenterImage,
    centerText, setCenterText,
    setCenterTextRendered,
    centerSize, setCenterSize,
  } = useQRStore();

  const fileInputRef = useRef(null);

  const debouncedRenderRef = useRef(null);

  useEffect(() => {
    debouncedRenderRef.current = debounce((text) => {
      if (text.trim()) {
        const dataUrl = renderTextToDataUrl(text, 300);
        setCenterTextRendered(dataUrl);
      } else {
        setCenterTextRendered(null);
      }
    }, 300);

    return () => {
      debouncedRenderRef.current?.cancel();
    };
  }, [setCenterTextRendered]);

  useEffect(() => {
    if (centerMode === 'text') {
      debouncedRenderRef.current?.(centerText);
    }
  }, [centerText, centerMode]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCenterImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const _clearCenter = () => {
    setCenterMode('none');
    setCenterImage(null);
    setCenterText('');
    setCenterTextRendered(null);
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {[
          { key: 'none', label: 'None', icon: X },
          { key: 'image', label: 'Upload Logo', icon: Image },
          { key: 'text', label: 'Enter Text', icon: Type },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCenterMode(key)}
            className={`cyber-tab flex items-center gap-1.5 ${centerMode === key ? 'active' : ''}`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Image upload */}
      {centerMode === 'image' && (
        <div className="space-y-3">
          <div
            className="cyber-file-input cyber-input !p-4 text-center cursor-pointer hover:border-[var(--neon-cyan)]"
            onClick={() => fileInputRef.current?.click()}
          >
            {centerImage ? (
              <div className="flex items-center gap-3">
                <img src={centerImage} alt="Logo" className="w-10 h-10 object-contain rounded" />
                <span className="text-xs text-[var(--text-secondary)]">Click to change</span>
              </div>
            ) : (
              <span className="text-xs text-[var(--text-secondary)]">Click to upload image (PNG, SVG, JPG)</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Text input */}
      {centerMode === 'text' && (
        <input
          className="cyber-input"
          placeholder="Enter center text..."
          value={centerText}
          onChange={(e) => setCenterText(e.target.value)}
          maxLength={10}
        />
      )}

      {/* Size slider */}
      {centerMode !== 'none' && (
        <div>
          <label className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
            Size: {centerSize}%
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={centerSize}
            onChange={(e) => setCenterSize(Number(e.target.value))}
            className="mt-1"
          />
        </div>
      )}

      {/* Info box */}
      {centerMode !== 'none' && (
        <div className="p-2 bg-[#ff00e511] border border-[#ff00e533] rounded text-[10px] text-[var(--neon-magenta)]">
          ⚡ Error correction set to <strong>H (30%)</strong> for center overlay reliability
        </div>
      )}
    </div>
  );
}