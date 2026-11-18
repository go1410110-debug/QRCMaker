import { useQRStore } from '../../store/qrStore'
import { ColorPickerPopover } from '../ui/ColorPickerPopover'
import { GradientPicker } from '../ui/GradientPicker'

const bodyShapes = [
  { key: 'square', label: 'Square', svg: <rect x="4" y="4" width="24" height="24" fill="currentColor" /> },
  { key: 'dots', label: 'Dots', svg: <circle cx="16" cy="16" r="10" fill="currentColor" /> },
  { key: 'rounded', label: 'Rounded', svg: <rect x="4" y="4" width="24" height="24" rx="6" fill="currentColor" /> },
  { key: 'extra-rounded', label: 'Extra Round', svg: <rect x="4" y="4" width="24" height="24" rx="12" fill="currentColor" /> },
  { key: 'classy', label: 'Classy', svg: <><rect x="4" y="4" width="24" height="24" fill="currentColor" /><rect x="4" y="4" width="12" height="12" rx="6" fill="currentColor" /></> },
  { key: 'classy-rounded', label: 'Classy Rnd', svg: <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" /> },
];

const eyeFrameShapes = [
  { key: 'square', label: 'Square', svg: <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeWidth="3" fill="none" /> },
  { key: 'dot', label: 'Dot', svg: <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" /> },
  { key: 'extra-rounded', label: 'Extra Rnd', svg: <rect x="2" y="2" width="28" height="28" rx="10" stroke="currentColor" strokeWidth="3" fill="none" /> },
];

const eyeBallShapes = [
  { key: 'square', label: 'Square', svg: <rect x="6" y="6" width="20" height="20" fill="currentColor" /> },
  { key: 'dot', label: 'Dot', svg: <circle cx="16" cy="16" r="8" fill="currentColor" /> },
];

function ColorTypeToggle({ value, onChange }) {
  return (
    <div className="flex gap-2 mb-2">
      <button
        onClick={() => onChange('single')}
        className={`cyber-tab text-[10px] ${value === 'single' ? 'active' : ''}`}
      >
        Solid
      </button>
      <button
        onClick={() => onChange('gradient')}
        className={`cyber-tab text-[10px] ${value === 'gradient' ? 'active' : ''}`}
      >
        Gradient
      </button>
    </div>
  );
}

function ShapeGrid({ shapes, activeShape, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {shapes.map(({ key, label, svg }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`shape-option flex flex-col items-center gap-0.5 !w-auto !h-auto px-2 py-1.5 ${activeShape === key ? 'active' : ''}`}
          title={label}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" className="text-[var(--neon-cyan)]">
            {svg}
          </svg>
          <span className="text-[8px] text-[var(--text-secondary)] uppercase">{label}</span>
        </button>
      ))}
    </div>
  );
}

function ColorSection({ title, colorType, color, gradient, onColorTypeChange, onColorChange, onGradientChange }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">{title}</h4>
      <ColorTypeToggle value={colorType} onChange={onColorTypeChange} />
      {colorType === 'single' ? (
        <ColorPickerPopover color={color} onChange={onColorChange} />
      ) : (
        <GradientPicker gradient={gradient} onChange={onGradientChange} />
      )}
    </div>
  );
}

export function DesignSection() {
  const store = useQRStore();

  return (
    <div className="space-y-5">
      {/* Body Shape */}
      <div>
        <h4 className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-2">
          Body Shape
        </h4>
        <ShapeGrid shapes={bodyShapes} activeShape={store.bodyShape} onSelect={store.setBodyShape} />
      </div>

      {/* Eye Frame Shape */}
      <div>
        <h4 className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-2">
          Eye Frame Shape
        </h4>
        <ShapeGrid shapes={eyeFrameShapes} activeShape={store.eyeFrameShape} onSelect={store.setEyeFrameShape} />
      </div>

      {/* Eye Ball Shape */}
      <div>
        <h4 className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-2">
          Eye Ball Shape
        </h4>
        <ShapeGrid shapes={eyeBallShapes} activeShape={store.eyeBallShape} onSelect={store.setEyeBallShape} />
      </div>

      <div className="border-t border-[var(--border-dim)] pt-4" />

      {/* Background Color */}
      <ColorSection
        title="Background"
        colorType={store.bgColorType}
        color={store.bgColor}
        gradient={store.bgGradient}
        onColorTypeChange={(v) => store.setField('bgColorType', v)}
        onColorChange={(v) => store.setField('bgColor', v)}
        onGradientChange={(v) => store.setField('bgGradient', v)}
      />

      {/* Body Color */}
      <ColorSection
        title="Pattern Body"
        colorType={store.bodyColorType}
        color={store.bodyColor}
        gradient={store.bodyGradient}
        onColorTypeChange={(v) => store.setField('bodyColorType', v)}
        onColorChange={(v) => store.setField('bodyColor', v)}
        onGradientChange={(v) => store.setField('bodyGradient', v)}
      />

      {/* Eye Frame Color */}
      <ColorSection
        title="Eye Frame"
        colorType={store.eyeFrameColorType}
        color={store.eyeFrameColor}
        gradient={store.eyeFrameGradient}
        onColorTypeChange={(v) => store.setField('eyeFrameColorType', v)}
        onColorChange={(v) => store.setField('eyeFrameColor', v)}
        onGradientChange={(v) => store.setField('eyeFrameGradient', v)}
      />

      {/* Eye Ball Color */}
      <ColorSection
        title="Eye Ball"
        colorType={store.eyeBallColorType}
        color={store.eyeBallColor}
        gradient={store.eyeBallGradient}
        onColorTypeChange={(v) => store.setField('eyeBallColorType', v)}
        onColorChange={(v) => store.setField('eyeBallColor', v)}
        onGradientChange={(v) => store.setField('eyeBallGradient', v)}
      />

      {/* Error Correction */}
      <div>
        <h4 className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-2">
          Error Correction Level
        </h4>
        <div className="flex gap-2">
          {['L', 'M', 'Q', 'H'].map((level) => (
            <button
              key={level}
              onClick={() => store.setField('errorCorrectionLevel', level)}
              className={`cyber-tab ${store.errorCorrectionLevel === level ? 'active' : ''}`}
              disabled={store.centerMode !== 'none'}
            >
              {level}
            </button>
          ))}
        </div>
        {store.centerMode !== 'none' && (
          <p className="text-[10px] text-[var(--neon-magenta)] mt-1">Locked to H (center overlay active)</p>
        )}
      </div>
    </div>
  );
}