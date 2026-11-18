import { ColorPickerPopover } from './ColorPickerPopover'

export function GradientPicker({ gradient, onChange }) {
  const updateStop = (index, color) => {
    const newStops = [...gradient.colorStops];
    newStops[index] = { ...newStops[index], color };
    onChange({ ...gradient, colorStops: newStops });
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/60">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...gradient, type: 'linear' })}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
            gradient.type === 'linear'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          Linear Gradient
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...gradient, type: 'radial' })}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
            gradient.type === 'radial'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          Radial Gradient
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <ColorPickerPopover
          label="Start Color"
          color={gradient.colorStops[0]?.color || '#0284c7'}
          onChange={(c) => updateStop(0, c)}
        />
        <ColorPickerPopover
          label="End Color"
          color={gradient.colorStops[1]?.color || '#2563eb'}
          onChange={(c) => updateStop(1, c)}
        />
      </div>

      {gradient.type === 'linear' && (
        <div className="pt-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-gray-600 dark:text-slate-400">
              Angle
            </label>
            <span className="text-xs font-mono font-medium text-gray-800 dark:text-slate-200">
              {gradient.rotation}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={gradient.rotation}
            onChange={(e) => onChange({ ...gradient, rotation: Number(e.target.value) })}
          />
        </div>
      )}

      {/* Gradient Preview bar */}
      <div
        className="h-5 rounded-lg border border-black/10 dark:border-white/10 shadow-2xs"
        style={{
          background:
            gradient.type === 'linear'
              ? `linear-gradient(${gradient.rotation}deg, ${gradient.colorStops[0].color}, ${gradient.colorStops[1].color})`
              : `radial-gradient(circle, ${gradient.colorStops[0].color}, ${gradient.colorStops[1].color})`,
        }}
      />
    </div>
  );
}
