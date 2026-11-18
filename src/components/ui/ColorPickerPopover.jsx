import { useState, useRef, useEffect } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'

const QUICK_SWATCHES = [
  '#000000', '#1e293b', '#2563eb', '#0284c7', 
  '#059669', '#16a34a', '#e11d48', '#7c3aed', 
  '#d97706', '#ffffff'
];

export function ColorPickerPopover({ color, onChange, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (popover.current && !popover.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={popover}>
      {label && (
        <label className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 hover:border-gray-300 dark:hover:border-slate-600 transition-colors shadow-xs cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div
          className="w-5 h-5 rounded-md border border-black/10 dark:border-white/10 shrink-0 shadow-2xs"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-mono tracking-wider uppercase font-medium">{color}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl w-60">
          <HexColorPicker color={color} onChange={onChange} />
          
          {/* Quick Swatches */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-700/60">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-slate-400 block mb-1.5">
              Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => onChange(swatch)}
                  className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 ${
                    color.toLowerCase() === swatch.toLowerCase()
                      ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800'
                      : 'border-black/10 dark:border-white/10'
                  }`}
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))}
            </div>
          </div>

          {/* Hex Input */}
          <div className="mt-3 flex items-center gap-2 bg-gray-50 dark:bg-slate-900/80 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="text-xs font-mono text-gray-400 dark:text-slate-400">#</span>
            <HexColorInput
              color={color}
              onChange={onChange}
              className="w-full bg-transparent text-xs font-mono text-gray-900 dark:text-slate-100 outline-none uppercase"
              prefixed={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
