import { ChevronDown } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'

export function AccordionSection({ title, subtitle, icon, isOpen, onToggle, children, badge }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  // Re-measure on any child resize
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;
    const observer = new ResizeObserver(() => {
      setHeight(contentRef.current?.scrollHeight || 0);
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 shadow-xs overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors text-left cursor-pointer"
      >
        {icon && (
          <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900 dark:text-slate-100">
              {title}
            </span>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`p-1.5 rounded-full text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <div
        className="accordion-content"
        style={{
          maxHeight: isOpen ? `${height + 40}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-slate-700/50">
          {children}
        </div>
      </div>
    </div>
  );
}
