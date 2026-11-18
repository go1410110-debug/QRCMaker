import { useEffect, useRef } from 'react'
import { useQRStore, QUICK_PRESETS } from '../../store/qrStore'
import { renderTextToDataUrl, AVAILABLE_FONTS } from '../../utils/canvasText'
import { createManagedBlobUrl } from '../../utils/urlManager'
import { ColorPickerPopover } from '../ui/ColorPickerPopover'
import { GradientPicker } from '../ui/GradientPicker'
import { EyeTooltip } from '../ui/EyeTooltip'
import debounce from 'lodash.debounce'
import { 
  Sparkles, 
  Palette, 
  Shapes, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  X, 
  Upload, 
  Check,
  Eye,
  Layers
} from 'lucide-react'

const BODY_SHAPES = [
  { key: 'square', label: 'Square', svg: <rect x="4" y="4" width="24" height="24" fill="currentColor" /> },
  { key: 'rounded', label: 'Rounded', svg: <rect x="4" y="4" width="24" height="24" rx="6" fill="currentColor" /> },
  { key: 'dots', label: 'Dots', svg: <circle cx="16" cy="16" r="10" fill="currentColor" /> },
  { key: 'extra-rounded', label: 'Circle', svg: <rect x="4" y="4" width="24" height="24" rx="12" fill="currentColor" /> },
  { key: 'classy', label: 'Classy', svg: <><rect x="4" y="4" width="24" height="24" fill="currentColor" /><rect x="4" y="4" width="12" height="12" rx="6" fill="currentColor" /></> },
  { key: 'classy-rounded', label: 'Smooth', svg: <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" /> },
];

const EYE_FRAME_SHAPES = [
  { key: 'square', label: 'Square', svg: <rect x="3" y="3" width="26" height="26" stroke="currentColor" strokeWidth="3.5" fill="none" rx="1" /> },
  { key: 'extra-rounded', label: 'Rounded', svg: <rect x="3" y="3" width="26" height="26" rx="9" stroke="currentColor" strokeWidth="3.5" fill="none" /> },
  { key: 'dot', label: 'Circle', svg: <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3.5" fill="none" /> },
];

const EYE_BALL_SHAPES = [
  { key: 'square', label: 'Square', svg: <rect x="6" y="6" width="20" height="20" fill="currentColor" rx="1" /> },
  { key: 'dot', label: 'Circle', svg: <circle cx="16" cy="16" r="9" fill="currentColor" /> },
];

export function Step2Customize() {
  const store = useQRStore();
  const fileInputRef = useRef(null);

  // Debounced canvas text rendering ref (300ms debounce to prevent canvas UI freezing)
  const debouncedRenderRef = useRef(null);

  useEffect(() => {
    debouncedRenderRef.current = debounce((text, fontFamily, color, bgColor) => {
      if (text && text.trim()) {
        const dataUrl = renderTextToDataUrl(text, {
          size: 300,
          fontFamily,
          color,
          bgColor,
        });
        store.setCenterTextRendered(dataUrl);
      } else {
        store.setCenterTextRendered(null);
      }
    }, 300);

    return () => {
      debouncedRenderRef.current?.cancel();
    };
  }, [store]);

  useEffect(() => {
    if (store.centerMode === 'text') {
      debouncedRenderRef.current?.(
        store.centerText,
        store.centerFontFamily,
        store.centerTextColor,
        store.centerTextBgColor
      );
    }
  }, [
    store.centerText,
    store.centerFontFamily,
    store.centerTextColor,
    store.centerTextBgColor,
    store.centerMode,
  ]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = createManagedBlobUrl(file);
    store.setCenterImage(blobUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearCenter = () => {
    store.setCenterMode('none');
    store.setCenterText('');
    store.setCenterTextRendered(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 p-5 md:p-6 shadow-xs space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
          2
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Make it yours!
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Choose colors, shapes, corner styling, and add your brand logo or text
          </p>
        </div>
      </div>

      {/* ── Section: One-Click Quick Themes (Presets) ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            Quick Themes
          </h3>
          <span className="text-[11px] text-gray-400 dark:text-slate-400">
            One-click designer styles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {QUICK_PRESETS.map((preset) => {
            const isActive = store.activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => store.applyPreset(preset.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between relative group ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500 shadow-xs'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                }`}
              >
                {/* Visual Swatch Pill */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-7 h-7 rounded-lg shadow-2xs flex items-center justify-center border border-black/10 dark:border-white/10"
                    style={{
                      background:
                        preset.previewColors.length > 1
                          ? `linear-gradient(135deg, ${preset.previewColors[0]}, ${preset.previewColors[1]})`
                          : preset.previewColors[0],
                    }}
                  />
                  {isActive && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-slate-100 block truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 block truncate">
                    {preset.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-700/60" />

      {/* ── Section: Pattern Shapes & Colors ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shapes className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            Pattern Shapes & Colors
          </h3>
        </div>

        {/* Pattern Shape Grid */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-2 block">
            Body Pattern Shape
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {BODY_SHAPES.map(({ key, label, svg }) => {
              const isSelected = store.bodyShape === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => store.setBodyShape(key)}
                  className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300'
                  }`}
                >
                  <svg width="24" height="24" viewBox="0 0 32 32">
                    {svg}
                  </svg>
                  <span className="text-[11px]">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pattern Color & Gradient */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-slate-400">
              Pattern Color
            </label>
            <div className="flex bg-gray-100 dark:bg-slate-700/60 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => store.setField('bodyColorType', 'single')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  store.bodyColorType === 'single'
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-2xs'
                    : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                Solid
              </button>
              <button
                type="button"
                onClick={() => store.setField('bodyColorType', 'gradient')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  store.bodyColorType === 'gradient'
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-2xs'
                    : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                Gradient
              </button>
            </div>
          </div>

          {store.bodyColorType === 'single' ? (
            <ColorPickerPopover
              color={store.bodyColor}
              onChange={(c) => store.setField('bodyColor', c)}
            />
          ) : (
            <GradientPicker
              gradient={store.bodyGradient}
              onChange={(g) => store.setField('bodyGradient', g)}
            />
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-700/60" />

      {/* ── Section: Corner Eyes Styling with Visual Tooltip Icons ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            Corner Eyes Styling
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Eye Frame (Outer Border) */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/70 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center">
              <span className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                Eye Frame
              </span>
              <EyeTooltip type="frame" />
            </div>

            {/* Shape selection */}
            <div className="grid grid-cols-3 gap-1.5">
              {EYE_FRAME_SHAPES.map(({ key, label, svg }) => {
                const isSelected = store.eyeFrameShape === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => store.setEyeFrameShape(key)}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-medium'
                        : 'border-transparent bg-transparent hover:bg-white/60 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    <svg width="22" height="22" viewBox="0 0 32 32">
                      {svg}
                    </svg>
                    <span className="text-[10px]">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Frame Color */}
            <ColorPickerPopover
              label="Frame Color"
              color={store.eyeFrameColor}
              onChange={(c) => store.setField('eyeFrameColor', c)}
            />
          </div>

          {/* Eye Ball (Center Dot) */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/70 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center">
              <span className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                Eye Ball
              </span>
              <EyeTooltip type="ball" />
            </div>

            {/* Shape selection */}
            <div className="grid grid-cols-2 gap-1.5">
              {EYE_BALL_SHAPES.map(({ key, label, svg }) => {
                const isSelected = store.eyeBallShape === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => store.setEyeBallShape(key)}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-medium'
                        : 'border-transparent bg-transparent hover:bg-white/60 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    <svg width="22" height="22" viewBox="0 0 32 32">
                      {svg}
                    </svg>
                    <span className="text-[10px]">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Ball Color */}
            <ColorPickerPopover
              label="Ball Color"
              color={store.eyeBallColor}
              onChange={(c) => store.setField('eyeBallColor', c)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-700/60" />

      {/* ── Section: Background Color ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            Background Color
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => store.setField('bgColor', '#ffffff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 cursor-pointer transition-colors ${
              store.bgColor === '#ffffff'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-white" />
            White (Recommended)
          </button>

          <button
            type="button"
            onClick={() => store.setField('bgColor', '#f8fafc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 cursor-pointer transition-colors ${
              store.bgColor === '#f8fafc'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-slate-50" />
            Soft Gray
          </button>

          <button
            type="button"
            onClick={() => store.setField('bgColor', '#0f172a')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 cursor-pointer transition-colors ${
              store.bgColor === '#0f172a'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full border border-gray-600 bg-slate-900" />
            Dark Slate
          </button>

          <div className="w-36">
            <ColorPickerPopover
              color={store.bgColor}
              onChange={(c) => store.setField('bgColor', c)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-700/60" />

      {/* ── Section: Enhanced Center Overlay (Logo / Text with Fonts) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Center Overlay (Logo or Text)
            </h3>
          </div>

          {store.centerMode !== 'none' && (
            <button
              type="button"
              onClick={handleClearCenter}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>

        {/* Center Mode Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'none', label: 'None', icon: X },
            { key: 'image', label: 'Upload Logo', icon: ImageIcon },
            { key: 'text', label: 'Enter Text', icon: TypeIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => store.setCenterMode(key)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                store.centerMode === key
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Upload Logo mode */}
        {store.centerMode === 'image' && (
          <div className="space-y-3 pt-1">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-800/40"
            >
              {store.centerImage ? (
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={store.centerImage}
                    alt="Center logo preview"
                    className="w-12 h-12 object-contain rounded-lg border border-gray-200 dark:border-slate-700 bg-white p-1"
                  />
                  <div className="text-left">
                    <span className="text-xs font-semibold text-gray-900 dark:text-slate-100 block">
                      Custom Logo Uploaded
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400">
                      Click to change image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 block">
                      Click to choose logo image
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-400">
                      Supports PNG, SVG, or JPG
                    </span>
                  </div>
                </div>
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

        {/* Enhanced Enter Text mode (Requirement 4) */}
        {store.centerMode === 'text' && (
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-700/60 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                Center Text
              </label>
              <input
                type="text"
                placeholder="e.g. SCAN, PAY, VIP"
                value={store.centerText}
                onChange={(e) => store.setCenterText(e.target.value)}
                maxLength={10}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Font Family Dropdown featuring distinct fonts */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  Font Family
                </label>
                <select
                  value={store.centerFontFamily}
                  onChange={(e) => store.setCenterFontFamily(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.id} value={font.id} style={{ fontFamily: font.id }}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Color Picker */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  Text Color
                </label>
                <ColorPickerPopover
                  color={store.centerTextColor}
                  onChange={(c) => store.setCenterTextColor(c)}
                />
              </div>
            </div>

            {/* Optional Background Badge */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5 block">
                Badge Background (improves contrast)
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'transparent', label: 'Transparent' },
                  { key: '#ffffff', label: 'White Badge' },
                  { key: '#000000', label: 'Black Badge' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => store.setCenterTextBgColor(key)}
                    className={`px-2.5 py-1 text-xs rounded-lg border cursor-pointer font-medium transition-colors ${
                      store.centerTextBgColor === key
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center Size Slider */}
        {store.centerMode !== 'none' && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-gray-600 dark:text-slate-400">
                Overlay Size
              </label>
              <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
                {store.centerSize}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              value={store.centerSize}
              onChange={(e) => store.setCenterSize(Number(e.target.value))}
            />
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
              Error correction level is automatically boosted to <strong>High (H)</strong> for scannability.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
