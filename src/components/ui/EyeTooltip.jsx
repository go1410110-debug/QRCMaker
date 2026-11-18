import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

export function EyeTooltip({ type = 'frame' }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFrame = type === 'frame';

  return (
    <div className="relative inline-flex items-center ml-1.5" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="text-gray-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer p-0.5 rounded-full transition-colors focus:outline-none"
        aria-label={`What is ${isFrame ? 'Eye Frame' : 'Eye Ball'}?`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 text-left pointer-events-auto transition-all"
        >
          {/* Visual SVG diagram showing QR eye with highlighted element */}
          <div className="flex items-center gap-3 mb-2 pb-2 border-b border-gray-100 dark:border-slate-700/60">
            <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
              {/* Outer frame */}
              <rect
                x="4"
                y="4"
                width="40"
                height="40"
                rx={isFrame ? "8" : "4"}
                fill={isFrame ? "#2563eb" : "none"}
                stroke={isFrame ? "#1d4ed8" : "#94a3b8"}
                strokeWidth={isFrame ? "4" : "3"}
                className={isFrame ? "animate-pulse" : "opacity-40"}
              />
              {/* Inner whitespace if frame is filled */}
              {isFrame && (
                <rect
                  x="12"
                  y="12"
                  width="24"
                  height="24"
                  rx="4"
                  fill="white"
                  className="dark:fill-slate-800"
                />
              )}
              {/* Inner ball / dot */}
              <rect
                x="16"
                y="16"
                width="16"
                height="16"
                rx={!isFrame ? "4" : "2"}
                fill={!isFrame ? "#2563eb" : isFrame ? "#1e293b" : "#64748b"}
                className={!isFrame ? "animate-pulse" : "dark:fill-slate-300"}
              />
            </svg>

            <div>
              <span className="text-xs font-semibold text-gray-900 dark:text-slate-100 block">
                {isFrame ? 'Eye Frame (Outer Border)' : 'Eye Ball (Center Dot)'}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                {isFrame ? 'Corner border shape' : 'Inner corner dot'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
            {isFrame
              ? 'The outer square border in the 3 corners of the QR code. Scanners use these frames to orient the code when scanned from any angle.'
              : 'The solid center dot located inside each of the 3 corner frames. It helps the scanner pinpoint the exact corner grid.'}
          </p>

          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
