import { useEffect, useState } from 'react'
import { useQRStore } from './store/qrStore'
import { Step1Share } from './components/steps/Step1Share'
import { Step2Customize } from './components/steps/Step2Customize'
import { Step3Download } from './components/steps/Step3Download'
import { AdvancedSettings } from './components/sections/AdvancedSettings'
import { BulkGrid } from './components/bulk/BulkGrid'
import { Preview } from './components/Preview'
import { 
  Sun, 
  Moon, 
  QrCode, 
  ChevronUp, 
  ChevronDown,
  RotateCcw,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react'

export default function App() {
  const { theme, toggleTheme, setTheme, reset, activeMode, setActiveMode } = useQRStore();
  const [mobilePreviewExpanded, setMobilePreviewExpanded] = useState(true);

  // Initialize theme on mount and keep HTML class in sync
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen to system theme changes if user hasn't explicitly set localStorage
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('qr-theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* ── Global Header ── */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-slate-100">
                  QuickQR
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                  Free & Instant
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 hidden sm:block">
                Create, customize & download high-res QR codes
              </p>
            </div>
          </div>

          {/* Right Header Actions: Reset & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Global Reset Button: Clears store AND explicitly updates live canvas to default */}
            <button
              type="button"
              onClick={reset}
              className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Reset to default black-and-white square"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset</span>
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors shadow-2xs cursor-pointer flex items-center gap-2"
              aria-label="Toggle theme mode"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-medium hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Pinned Sticky Preview ── */}
      <div className="lg:hidden sticky top-14 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-200">
        <div className="max-w-xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
              <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Live Mobile Preview</span>
            </div>
            <button
              type="button"
              onClick={() => setMobilePreviewExpanded(!mobilePreviewExpanded)}
              className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer font-medium"
            >
              {mobilePreviewExpanded ? (
                <>
                  <span>Collapse</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Show Preview</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {mobilePreviewExpanded && (
            <div className="pt-1 pb-1">
              <Preview isMobileCompact={true} />
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs: Single QR Mode vs Interactive Bulk Mode Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('single')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                activeMode === 'single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Single QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('bulk')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                activeMode === 'bulk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Bulk Mode Data Grid</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 uppercase tracking-wider font-bold">
                New
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>High-res canvas preview active</span>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Content Grid (Left) + Desktop Sticky Preview (Right) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (60%) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            {activeMode === 'single' ? (
              <>
                {/* Step 1: What do you want to share? */}
                <Step1Share />

                {/* Step 2: Make it yours! */}
                <Step2Customize />

                {/* Step 3: Download */}
                <Step3Download />

                {/* Collapsed Advanced Settings Accordion */}
                <div className="pt-2">
                  <AdvancedSettings />
                </div>
              </>
            ) : (
              /* Bulk Mode: Interactive Data Grid */
              <BulkGrid />
            )}
          </div>

          {/* Right Column: Desktop Sticky Preview (40%) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20">
            <Preview isMobileCompact={false} />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-gray-200/80 dark:border-slate-800 py-6 text-center text-xs text-gray-500 dark:text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            QuickQR • 100% Client-Side QR Code Generator • Your data never leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
