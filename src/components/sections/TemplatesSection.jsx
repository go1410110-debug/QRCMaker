import { useState } from 'react'
import { useQRStore } from '../../store/qrStore'
import { Save, Trash2, Upload, Clock, Bookmark } from 'lucide-react'

export function TemplatesSection() {
  const { savedTemplates, saveTemplate, loadTemplate, deleteTemplate } = useQRStore();
  const [templateName, setTemplateName] = useState('');

  const handleSave = () => {
    if (!templateName.trim()) return;
    saveTemplate(templateName.trim());
    setTemplateName('');
  };

  return (
    <div className="space-y-4">
      {/* Save Input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Name your template (e.g. Blue Corporate)..."
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!templateName.trim()}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      {/* Template list */}
      {savedTemplates.length === 0 ? (
        <div className="text-center py-4 text-gray-400 dark:text-slate-500 text-xs flex flex-col items-center gap-1.5">
          <Bookmark className="w-5 h-5 opacity-40" />
          No custom saved templates yet
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {savedTemplates.map((template, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-700/60 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate">
                  {template.name}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(template.timestamp).toLocaleDateString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => loadTemplate(template)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                Apply
              </button>
              <button
                type="button"
                onClick={() => deleteTemplate(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Delete template"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
