import { useState, useRef } from 'react'
import { useQRStore } from '../../store/qrStore'
import { createManagedBlobUrl } from '../../utils/urlManager'
import { BulkProgressModal } from './BulkProgressModal'
import QRCodeStyling from 'qr-code-styling'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  Upload, 
  X, 
  Package, 
  AlertCircle, 
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react'

export function BulkGrid() {
  const store = useQRStore();
  const defaultLogoInputRef = useRef(null);

  // Validation state: map of rowId -> { fileName?: boolean, data?: boolean }
  const [validationErrors, setValidationErrors] = useState({});
  const [validationAlert, setValidationAlert] = useState(null);

  // Progress modal state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState(null);

  // Handle Default Bulk Fallback Logo upload
  const handleDefaultLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = createManagedBlobUrl(file);
    store.setDefaultBulkLogo(blobUrl);
    if (defaultLogoInputRef.current) defaultLogoInputRef.current.value = '';
  };

  const handleRemoveDefaultLogo = () => {
    store.setDefaultBulkLogo(null);
  };

  // Handle specific row logo upload
  const handleRowLogoUpload = (rowId, file) => {
    if (!file) return;
    const blobUrl = createManagedBlobUrl(file);
    store.updateBulkRow(rowId, { logo: blobUrl });
  };

  const handleRemoveRowLogo = (rowId) => {
    store.updateBulkRow(rowId, { logo: null });
  };

  // Preview specific row in the live canvas
  const handlePreviewRow = (row) => {
    const effectiveLogo = row.logo || store.defaultBulkLogo || null;
    store.setPreviewOverride({
      rowId: row.id,
      data: row.data,
      logo: effectiveLogo,
    });
  };

  // Duplicate a row
  const handleDuplicateRow = (rowId) => {
    store.duplicateBulkRow(rowId);
  };

  // Delete a row
  const handleDeleteRow = (rowId) => {
    store.deleteBulkRow(rowId);
    // Remove any validation errors for deleted row
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  // Load sample dataset
  const handleLoadSampleData = () => {
    const samples = [
      { id: `sample-1`, fileName: 'table-01-menu', data: 'https://example.com/menu/table1', logo: null },
      { id: `sample-2`, fileName: 'table-02-menu', data: 'https://example.com/menu/table2', logo: null },
      { id: `sample-3`, fileName: 'guest-wifi-lobby', data: 'WIFI:S:HotelLobby_5G;T:WPA;P:Welcome2026;;', logo: null },
      { id: `sample-4`, fileName: 'support-hotline', data: 'tel:+18005550199', logo: null },
      { id: `sample-5`, fileName: 'summer-promo-discount', data: 'https://example.com/discount?code=SUMMER26', logo: null },
    ];
    store.setBulkRows(samples);
    setValidationErrors({});
    setValidationAlert(null);
  };

  // Generate ZIP Archive (Asynchronous Batch Processing)
  const handleGenerateZip = async () => {
    const rows = store.bulkRows;
    const errors = {};
    let hasError = false;

    // 1. Validation check: File Name & Data Link required
    rows.forEach((row) => {
      const rowErrors = {};
      if (!row.fileName || !row.fileName.trim()) {
        rowErrors.fileName = true;
        hasError = true;
      }
      if (!row.data || !row.data.trim()) {
        rowErrors.data = true;
        hasError = true;
      }
      if (Object.keys(rowErrors).length > 0) {
        errors[row.id] = rowErrors;
      }
    });

    if (hasError) {
      setValidationErrors(errors);
      setValidationAlert('Please fill in the highlighted File Name and Data Link fields in red before generating.');
      return;
    }

    setValidationErrors({});
    setValidationAlert(null);

    // 2. Open progress modal
    setIsProcessing(true);
    setProgressState({
      current: 0,
      total: rows.length,
      status: 'generating',
      currentFile: rows[0]?.fileName || '',
    });

    try {
      const zip = new JSZip();
      const resolution = store.bulkResolution || 1500;
      const baseDesign = store.getQRConfig();

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Update progress counter
        setProgressState({
          current: i + 1,
          total: rows.length,
          status: 'generating',
          currentFile: row.fileName,
        });

        // Resolve logo: row logo has precedence, then global fallback logo
        const effectiveLogo = row.logo || store.defaultBulkLogo || null;

        // Build high-resolution config with Error Correction forced to 'H'
        const rowConfig = {
          ...baseDesign,
          width: resolution,
          height: resolution,
          data: row.data,
          qrOptions: {
            errorCorrectionLevel: 'H', // Forced to High for reliability and logo support
          },
        };

        if (effectiveLogo) {
          rowConfig.image = effectiveLogo;
          rowConfig.imageOptions = {
            hideBackgroundDots: true,
            imageSize: 0.36,
            margin: 4,
            crossOrigin: 'anonymous',
          };
        } else {
          rowConfig.image = '';
        }

        // Render QR Code styling to blob
        const qr = new QRCodeStyling(rowConfig);
        const blob = await qr.getRawData('png');

        // Append to ZIP archive with sanitized file name
        let cleanName = row.fileName.trim().replace(/[<>:"/\\|?*]/g, '_');
        if (!cleanName.toLowerCase().endsWith('.png')) {
          cleanName += '.png';
        }
        zip.file(cleanName, blob);

        // Yield to browser main thread so UI updates smoothly and doesn't freeze
        await new Promise((resolve) => setTimeout(resolve, 35));
      }

      // 3. Compress ZIP archive
      setProgressState({
        current: rows.length,
        total: rows.length,
        status: 'zipping',
        currentFile: '',
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      // Save file
      saveAs(zipBlob, `bulk-qr-codes-${Date.now()}.zip`);

      setProgressState({
        current: rows.length,
        total: rows.length,
        status: 'done',
        currentFile: '',
      });
    } catch (err) {
      console.error('Bulk generation error:', err);
      setValidationAlert('Error during generation: ' + err.message);
      setIsProcessing(false);
    }
  };

  const activePreviewRowId = store.previewOverride?.rowId;

  return (
    <div className="space-y-6">
      {/* ── Global Fallback Logo Box ── */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                Default Bulk Logo (Global Fallback)
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Any row in the grid that doesn't have a specific logo attached will automatically inherit this logo.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {store.defaultBulkLogo ? (
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-700">
                <img
                  src={store.defaultBulkLogo}
                  alt="Default Bulk Logo"
                  className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-gray-200 dark:border-slate-700"
                />
                <div className="text-left">
                  <span className="text-xs font-semibold text-gray-900 dark:text-slate-100 block">
                    Global Logo Active
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveDefaultLogo}
                    className="text-[11px] text-red-500 hover:text-red-600 font-medium cursor-pointer"
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => defaultLogoInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50/50 dark:bg-slate-900/40 text-xs font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Upload Default Logo
              </button>
            )}
            <input
              ref={defaultLogoInputRef}
              type="file"
              accept="image/*"
              onChange={handleDefaultLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ── Validation Alert Banner ── */}
      {validationAlert && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{validationAlert}</span>
        </div>
      )}

      {/* ── Spreadsheet Data Grid Card ── */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                Bulk Generation Data Grid
              </h3>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {store.bulkRows.length} total items in spreadsheet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Load Sample Data
            </button>
            <button
              type="button"
              onClick={() => store.setBulkRows([
                { id: `bulk-row-${Date.now()}`, fileName: 'qr-code-01', data: '', logo: null }
              ])}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 hover:text-red-500 text-xs font-medium cursor-pointer transition-colors"
            >
              Clear Grid
            </button>
          </div>
        </div>

        {/* Dynamic Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-slate-900/60 border-b border-gray-200/80 dark:border-slate-700/60 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5 w-12 text-center">#</th>
                <th className="py-3 px-3.5 min-w-[160px]">File Name</th>
                <th className="py-3 px-3.5 min-w-[220px]">QR Data / Link</th>
                <th className="py-3 px-3.5 min-w-[170px]">Custom Logo</th>
                <th className="py-3 px-3.5 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {store.bulkRows.map((row, index) => {
                const isPreviewed = activePreviewRowId === row.id;
                const rowErrors = validationErrors[row.id] || {};

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isPreviewed
                        ? 'bg-purple-50/60 dark:bg-purple-950/30'
                        : 'hover:bg-gray-50/60 dark:hover:bg-slate-700/20'
                    }`}
                  >
                    {/* Row Number */}
                    <td className="py-3 px-3.5 text-center font-mono text-gray-400 font-medium">
                      {index + 1}
                    </td>

                    {/* File Name Input */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.fileName}
                          onChange={(e) => {
                            store.updateBulkRow(row.id, { fileName: e.target.value });
                            if (validationErrors[row.id]?.fileName) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                [row.id]: { ...prev[row.id], fileName: false },
                              }));
                            }
                          }}
                          placeholder="e.g. table-01"
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors focus:outline-none focus:ring-2 ${
                            rowErrors.fileName
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-100 focus:ring-red-500/20'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                        />
                        {rowErrors.fileName && (
                          <span className="text-[10px] text-red-500 block mt-0.5 font-sans">
                            File name required
                          </span>
                        )}
                      </div>
                    </td>

                    {/* QR Data / Link Input */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.data}
                          onChange={(e) => {
                            store.updateBulkRow(row.id, { data: e.target.value });
                            if (validationErrors[row.id]?.data) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                [row.id]: { ...prev[row.id], data: false },
                              }));
                            }
                          }}
                          placeholder="https://example.com/link"
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 ${
                            rowErrors.data
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-100 focus:ring-red-500/20'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                        />
                        {rowErrors.data && (
                          <span className="text-[10px] text-red-500 block mt-0.5">
                            Data link required
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Custom Logo Column */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {row.logo ? (
                          <div className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg bg-gray-100 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600">
                            <img
                              src={row.logo}
                              alt="Logo"
                              className="w-6 h-6 object-contain rounded bg-white p-0.5 border border-black/10"
                            />
                            <span className="text-[11px] text-gray-700 dark:text-slate-200 font-medium">
                              Custom
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRowLogo(row.id)}
                              className="p-0.5 text-gray-400 hover:text-red-500 cursor-pointer"
                              title="Remove custom logo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : store.defaultBulkLogo ? (
                          <div className="flex items-center gap-2">
                            <label className="px-2.5 py-1 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 bg-gray-50 dark:bg-slate-900 text-[11px] font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                              <Upload className="w-3 h-3 text-blue-500" />
                              <span>Override</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleRowLogoUpload(row.id, file);
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              (Using default logo)
                            </span>
                          </div>
                        ) : (
                          <label className="px-2.5 py-1 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 bg-gray-50 dark:bg-slate-900 text-[11px] font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3 h-3 text-blue-500" />
                            <span>Attach Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleRowLogoUpload(row.id, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() => handlePreviewRow(row)}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isPreviewed
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-gray-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                          title="Preview in sticky live QR canvas"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(row.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs transition-colors cursor-pointer"
                          title="Duplicate this row"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs transition-colors cursor-pointer"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Add Row Button */}
        <div className="p-3 bg-gray-50/50 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => store.addBulkRow()}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Row
          </button>
        </div>
      </div>

      {/* ── High Resolution Output & ZIP Generation Card ── */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Bulk Output Settings & ZIP Export</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Generates crystal-clear high-res QR codes packaged into a single ZIP file.
            </p>
          </div>

          {/* Resolution Selector for High-Resolution Bulk Output */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
              Resolution:
            </span>
            <select
              value={store.bulkResolution || 1500}
              onChange={(e) => store.setBulkResolution(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="1000">1000 × 1000 px (Standard HD)</option>
              <option value="1500">1500 × 1500 px (High Resolution)</option>
              <option value="2000">2000 × 2000 px (Ultra HD Print)</option>
            </select>
          </div>
        </div>

        {/* Generate ZIP Action Button */}
        <button
          type="button"
          onClick={handleGenerateZip}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Package className="w-5 h-5" />
          <span>Generate ZIP Archive ({store.bulkRows.length} QR Codes)</span>
        </button>
      </div>

      {/* Progress Modal */}
      <BulkProgressModal
        isOpen={isProcessing}
        progress={progressState}
        resolution={store.bulkResolution || 1500}
        onClose={() => {
          setIsProcessing(false);
          setProgressState(null);
        }}
      />
    </div>
  );
}
