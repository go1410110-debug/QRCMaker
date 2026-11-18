import { useState } from 'react'
import { useQRStore } from '../../store/qrStore'
import { AccordionSection } from '../ui/AccordionSection'
import { BatchSection } from './BatchSection'
import { TemplatesSection } from './TemplatesSection'
import { 
  Sliders, 
  ShieldAlert, 
  Code, 
  Layers, 
  Bookmark, 
  Maximize2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

const ERROR_LEVELS = [
  { level: 'L', name: 'Low (7%)', desc: 'Lightest QR pattern, ideal for small prints without logo' },
  { level: 'M', name: 'Medium (15%)', desc: 'Standard balance for most general use cases' },
  { level: 'Q', name: 'Quartile (25%)', desc: 'Strong recovery for outdoor signs or flyers' },
  { level: 'H', name: 'High (30%)', desc: 'Maximum durability, needed for center logos or badges' },
];

const RESOLUTION_PRESETS = [
  { label: '400px', value: 400, desc: 'Web / Email' },
  { label: '800px', value: 800, desc: 'Standard HD' },
  { label: '1200px', value: 1200, desc: 'High Res' },
  { label: '2000px', value: 2000, desc: 'Print / Posters' },
];

export function AdvancedSettings() {
  const store = useQRStore();
  const [jsonInput, setJsonInput] = useState('{\n  "source": "qr-gen",\n  "version": 1,\n  "action": "open"\n}');
  const [jsonError, setJsonError] = useState(null);
  const [jsonApplied, setJsonApplied] = useState(false);

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      store.setData(minified);
      store.setDataType('json');
      setJsonError(null);
      setJsonApplied(true);
      setTimeout(() => setJsonApplied(false), 2000);
    } catch (err) {
      setJsonError('Invalid JSON format: ' + err.message);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON syntax: ' + err.message);
    }
  };

  return (
    <AccordionSection
      title="Advanced Settings"
      subtitle="Resolution, Error Correction, Raw JSON, Batch & Templates"
      icon={<Sliders className="w-4 h-4" />}
      isOpen={store.isAdvancedOpen}
      onToggle={store.toggleAdvanced}
      badge="Technical"
    >
      <div className="space-y-6 pt-2">
        {/* 1. Error Correction Level */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
              Error Correction Level (Damage Recovery)
            </h4>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            Determines how much damaged or obscured data the QR code can recover.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ERROR_LEVELS.map(({ level, name, desc }) => {
              const isSelected =
                (store.centerMode !== 'none' ? 'H' : store.errorCorrectionLevel) === level;
              const isLocked = store.centerMode !== 'none' && level !== 'H';

              return (
                <button
                  key={level}
                  type="button"
                  disabled={isLocked}
                  onClick={() => store.setField('errorCorrectionLevel', level)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : isLocked
                      ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/40 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{name}</span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>

          {store.centerMode !== 'none' && (
            <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Locked to <strong>Level H (30%)</strong> because a center logo or text is active.</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700/60" />

        {/* 2. Custom Resolution Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                Export Image Resolution
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {store.resolution} × {store.resolution} px
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            Sets the pixel dimensions for exported PNG and PDF files.
          </p>

          <input
            type="range"
            min="200"
            max="2000"
            step="50"
            value={store.resolution}
            onChange={(e) => store.setField('resolution', Number(e.target.value))}
          />

          <div className="flex gap-2 mt-3">
            {RESOLUTION_PRESETS.map((res) => (
              <button
                key={res.value}
                type="button"
                onClick={() => store.setField('resolution', res.value)}
                className={`flex-1 py-1 px-2 rounded-lg border text-center cursor-pointer transition-colors ${
                  store.resolution === res.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400'
                }`}
              >
                <div className="text-[11px]">{res.label}</div>
                <div className="text-[9px] text-gray-400 dark:text-slate-500">{res.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700/60" />

        {/* 3. Raw JSON Payload Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                Raw JSON Payload (IoT & Devs)
              </h4>
            </div>
            <button
              type="button"
              onClick={handleFormatJson}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Format JSON
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
            Encode structured JSON for smart hardware, sensors, device pairing, or API payloads.
          </p>

          <textarea
            rows={4}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 font-mono text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          {jsonError && (
            <p className="text-xs text-red-500 mt-1">{jsonError}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={handleApplyJson}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {jsonApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              {jsonApplied ? 'Applied to QR!' : 'Apply JSON to QR'}
            </button>

            {store.dataType === 'json' && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Currently encoding JSON payload
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700/60" />

        {/* 4. Batch Generation */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
              Batch QR Generation
            </h4>
          </div>
          <BatchSection />
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700/60" />

        {/* 5. Saved Templates */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
              Saved Design Templates
            </h4>
          </div>
          <TemplatesSection />
        </div>
      </div>
    </AccordionSection>
  );
}
