import { create } from 'zustand';
import { revokeAllManagedBlobUrls, revokeManagedBlobUrl } from '../utils/urlManager';
import { resetAllQRInstances } from '../utils/qrInstances';

export const QUICK_PRESETS = [
  {
    id: 'standard-black',
    name: 'Standard Black',
    description: 'Clean & highly scannable',
    badge: 'Classic',
    previewColors: ['#000000', '#000000'],
    design: {
      bodyShape: 'square',
      bodyColorType: 'single',
      bodyColor: '#000000',
      eyeFrameShape: 'square',
      eyeFrameColorType: 'single',
      eyeFrameColor: '#000000',
      eyeBallShape: 'square',
      eyeBallColorType: 'single',
      eyeBallColor: '#000000',
      bgColorType: 'single',
      bgColor: '#ffffff',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Sky & deep indigo gradient',
    badge: 'Popular',
    previewColors: ['#0284c7', '#2563eb'],
    design: {
      bodyShape: 'rounded',
      bodyColorType: 'gradient',
      bodyGradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [{ offset: 0, color: '#0284c7' }, { offset: 1, color: '#2563eb' }],
      },
      eyeFrameShape: 'extra-rounded',
      eyeFrameColorType: 'single',
      eyeFrameColor: '#0284c7',
      eyeBallShape: 'dot',
      eyeBallColorType: 'single',
      eyeBallColor: '#1d4ed8',
      bgColorType: 'single',
      bgColor: '#ffffff',
    },
  },
  {
    id: 'rounded-tech',
    name: 'Rounded Tech',
    description: 'Emerald to cyan dots',
    badge: 'Modern',
    previewColors: ['#059669', '#06b6d4'],
    design: {
      bodyShape: 'dots',
      bodyColorType: 'gradient',
      bodyGradient: {
        type: 'linear',
        rotation: 135,
        colorStops: [{ offset: 0, color: '#059669' }, { offset: 1, color: '#06b6d4' }],
      },
      eyeFrameShape: 'extra-rounded',
      eyeFrameColorType: 'single',
      eyeFrameColor: '#059669',
      eyeBallShape: 'dot',
      eyeBallColorType: 'single',
      eyeBallColor: '#0891b2',
      bgColorType: 'single',
      bgColor: '#ffffff',
    },
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Gradient',
    description: 'Vibrant rose to violet',
    badge: 'Creative',
    previewColors: ['#f43f5e', '#8b5cf6'],
    design: {
      bodyShape: 'classy-rounded',
      bodyColorType: 'gradient',
      bodyGradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [{ offset: 0, color: '#f43f5e' }, { offset: 1, color: '#8b5cf6' }],
      },
      eyeFrameShape: 'extra-rounded',
      eyeFrameColorType: 'single',
      eyeFrameColor: '#e11d48',
      eyeBallShape: 'dot',
      eyeBallColorType: 'single',
      eyeBallColor: '#7c3aed',
      bgColorType: 'single',
      bgColor: '#ffffff',
    },
  },
  {
    id: 'slate-modern',
    name: 'Modern Slate',
    description: 'Minimalist charcoal tone',
    badge: 'Sleek',
    previewColors: ['#1e293b', '#334155'],
    design: {
      bodyShape: 'rounded',
      bodyColorType: 'single',
      bodyColor: '#1e293b',
      eyeFrameShape: 'extra-rounded',
      eyeFrameColorType: 'single',
      eyeFrameColor: '#0f172a',
      eyeBallShape: 'square',
      eyeBallColorType: 'single',
      eyeBallColor: '#334155',
      bgColorType: 'single',
      bgColor: '#f8fafc',
    },
  },
];

// Helper to determine initial theme
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('qr-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

const defaultDesign = {
  // Data
  dataType: 'url',
  data: 'https://google.com',

  // Center overlay
  centerMode: 'none', // 'none' | 'image' | 'text'
  centerImage: null,
  centerText: '',
  centerFontFamily: 'Arial',
  centerTextColor: '#000000',
  centerTextBgColor: 'transparent',
  centerTextRendered: null,
  centerSize: 18, // percentage 0-30

  // Design - body
  bodyShape: 'square', // square, dots, rounded, extra-rounded, classy, classy-rounded
  bodyColorType: 'single',
  bodyColor: '#000000',
  bodyGradient: { type: 'linear', rotation: 0, colorStops: [{ offset: 0, color: '#0284c7' }, { offset: 1, color: '#2563eb' }] },

  // Design - eye frame
  eyeFrameShape: 'square', // square, dot, extra-rounded
  eyeFrameColorType: 'single',
  eyeFrameColor: '#000000',
  eyeFrameGradient: { type: 'linear', rotation: 0, colorStops: [{ offset: 0, color: '#0284c7' }, { offset: 1, color: '#2563eb' }] },

  // Design - eye ball
  eyeBallShape: 'square', // square, dot
  eyeBallColorType: 'single',
  eyeBallColor: '#000000',
  eyeBallGradient: { type: 'linear', rotation: 0, colorStops: [{ offset: 0, color: '#2563eb' }, { offset: 1, color: '#0284c7' }] },

  // Design - background
  bgColorType: 'single',
  bgColor: '#ffffff',
  bgGradient: { type: 'linear', rotation: 0, colorStops: [{ offset: 0, color: '#ffffff' }, { offset: 1, color: '#f1f5f9' }] },

  // Active design preset
  activePreset: 'standard-black',

  // Error correction
  errorCorrectionLevel: 'M', // L, M, Q, H

  // Export
  resolution: 800,
};

export const INITIAL_BULK_ROWS = [
  { id: 'bulk-row-1', fileName: 'website-home', data: 'https://example.com', logo: null },
  { id: 'bulk-row-2', fileName: 'promo-summer', data: 'https://example.com/summer-sale', logo: null },
  { id: 'bulk-row-3', fileName: 'wifi-guest', data: 'WIFI:S:GuestWiFi;T:WPA;P:secret123;;', logo: null },
];

export const useQRStore = create((set, get) => ({
  ...defaultDesign,

  // Global Theme
  theme: getInitialTheme(),

  // Navigation mode: 'single' | 'bulk'
  activeMode: 'single',

  // UI State: Advanced settings accordion collapsed by default
  isAdvancedOpen: false,

  // Template management
  savedTemplates: JSON.parse(
    typeof window !== 'undefined' ? localStorage.getItem('qr-templates') || '[]' : '[]'
  ),

  // Bulk Mode Grid State
  defaultBulkLogo: null,
  bulkRows: INITIAL_BULK_ROWS,
  bulkResolution: 1500, // High-resolution output for bulk (1000px, 1500px, 2000px)

  // Live preview override (for previewing specific bulk grid row)
  previewOverride: null, // null | { rowId: string, data: string, logo: string | null }

  // ── Actions ──
  setActiveMode: (mode) => set({ activeMode: mode }),

  setTheme: (theme) => {
    localStorage.setItem('qr-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  setField: (field, value) => set({ [field]: value }),

  setData: (data) => set({ data }),
  setDataType: (dataType) => set({ dataType }),

  setCenterMode: (centerMode) => {
    const updates = { centerMode };
    if (centerMode !== 'none') {
      updates.errorCorrectionLevel = 'H';
    } else {
      // If turning off logo, revoke center image if it was a blob URL
      const currentImg = get().centerImage;
      if (currentImg) {
        revokeManagedBlobUrl(currentImg);
        updates.centerImage = null;
      }
    }
    set(updates);
  },

  setCenterImage: (centerImage) => {
    // Revoke old image if it was a blob URL
    const oldImg = get().centerImage;
    if (oldImg && oldImg !== centerImage) {
      revokeManagedBlobUrl(oldImg);
    }
    set({ centerImage, errorCorrectionLevel: 'H' });
  },

  setCenterText: (centerText) => set({ centerText }),
  setCenterFontFamily: (centerFontFamily) => set({ centerFontFamily }),
  setCenterTextColor: (centerTextColor) => set({ centerTextColor }),
  setCenterTextBgColor: (centerTextBgColor) => set({ centerTextBgColor }),
  setCenterTextRendered: (centerTextRendered) => set({ centerTextRendered }),
  setCenterSize: (centerSize) => set({ centerSize }),

  setBodyShape: (bodyShape) => set({ bodyShape, activePreset: null }),
  setEyeFrameShape: (eyeFrameShape) => set({ eyeFrameShape, activePreset: null }),
  setEyeBallShape: (eyeBallShape) => set({ eyeBallShape, activePreset: null }),

  setIsAdvancedOpen: (isAdvancedOpen) => set({ isAdvancedOpen }),
  toggleAdvanced: () => set((s) => ({ isAdvancedOpen: !s.isAdvancedOpen })),

  // Apply One-Click Design Preset
  applyPreset: (presetId) => {
    const preset = QUICK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    set({
      ...preset.design,
      activePreset: presetId,
    });
  },

  // ── Bulk Grid Management Actions ──
  setDefaultBulkLogo: (logo) => {
    const oldLogo = get().defaultBulkLogo;
    if (oldLogo && oldLogo !== logo) {
      revokeManagedBlobUrl(oldLogo);
    }
    set({ defaultBulkLogo: logo });
  },

  setBulkResolution: (bulkResolution) => set({ bulkResolution }),

  addBulkRow: (customRow = null) => {
    const current = get().bulkRows;
    const nextNum = current.length + 1;
    const newRow = customRow || {
      id: `bulk-row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fileName: `qr-code-${nextNum < 10 ? '0' + nextNum : nextNum}`,
      data: 'https://example.com',
      logo: null,
    };
    set({ bulkRows: [...current, newRow] });
    return newRow;
  },

  updateBulkRow: (id, updates) => {
    const rows = get().bulkRows.map((r) => {
      if (r.id === id) {
        if ('logo' in updates && r.logo && r.logo !== updates.logo) {
          revokeManagedBlobUrl(r.logo);
        }
        return { ...r, ...updates };
      }
      return r;
    });

    // If currently previewing this row, update the preview override in sync
    const override = get().previewOverride;
    if (override && override.rowId === id) {
      const updatedRow = rows.find((r) => r.id === id);
      const effectiveLogo = updatedRow.logo || get().defaultBulkLogo || null;
      set({
        bulkRows: rows,
        previewOverride: {
          rowId: id,
          data: updatedRow.data,
          logo: effectiveLogo,
        },
      });
      return;
    }

    set({ bulkRows: rows });
  },

  duplicateBulkRow: (id) => {
    const current = get().bulkRows;
    const idx = current.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const original = current[idx];
    const duplicated = {
      id: `bulk-row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fileName: `${original.fileName}-copy`,
      data: original.data,
      logo: original.logo, // note: if custom logo, shares reference
    };
    const nextRows = [...current];
    nextRows.splice(idx + 1, 0, duplicated);
    set({ bulkRows: nextRows });
  },

  deleteBulkRow: (id) => {
    const current = get().bulkRows;
    const target = current.find((r) => r.id === id);
    if (target && target.logo) {
      revokeManagedBlobUrl(target.logo);
    }
    const filtered = current.filter((r) => r.id !== id);
    // Keep at least 1 row
    if (filtered.length === 0) {
      filtered.push({
        id: `bulk-row-${Date.now()}`,
        fileName: 'qr-code-01',
        data: 'https://example.com',
        logo: null,
      });
    }

    // Clear preview override if this row was being previewed
    const override = get().previewOverride;
    const updates = { bulkRows: filtered };
    if (override && override.rowId === id) {
      updates.previewOverride = null;
    }
    set(updates);
  },

  setBulkRows: (rows) => {
    // Revoke any logos from previous rows not in new rows
    const oldRows = get().bulkRows;
    oldRows.forEach((r) => {
      if (r.logo && !rows.some((nr) => nr.logo === r.logo)) {
        revokeManagedBlobUrl(r.logo);
      }
    });
    set({ bulkRows: rows });
  },

  setPreviewOverride: (override) => set({ previewOverride: override }),
  clearPreviewOverride: () => set({ previewOverride: null }),

  // Build QR config from current state (or override)
  getQRConfig: (overrideData) => {
    const s = get();
    const override = s.previewOverride;

    // Determine target data
    const data = override
      ? override.data || 'https://google.com'
      : overrideData || s.data || 'https://google.com';

    const bodyColor =
      s.bodyColorType === 'single'
        ? { color: s.bodyColor }
        : { gradient: s.bodyGradient };

    const eyeFrameColor =
      s.eyeFrameColorType === 'single'
        ? { color: s.eyeFrameColor }
        : { gradient: s.eyeFrameGradient };

    const eyeBallColor =
      s.eyeBallColorType === 'single'
        ? { color: s.eyeBallColor }
        : { gradient: s.eyeBallGradient };

    const bgColor =
      s.bgColorType === 'single'
        ? { color: s.bgColor }
        : { gradient: s.bgGradient };

    // Determine effective center image
    let effectiveImage = null;
    let forceHighErrorCorrection = false;

    if (override) {
      // In bulk row preview mode
      effectiveImage = override.logo || null;
      if (effectiveImage) {
        forceHighErrorCorrection = true;
      }
    } else {
      // In normal mode
      if (s.centerMode === 'image') {
        effectiveImage = s.centerImage;
        forceHighErrorCorrection = true;
      } else if (s.centerMode === 'text') {
        effectiveImage = s.centerTextRendered;
        forceHighErrorCorrection = true;
      }
    }

    const config = {
      width: s.resolution,
      height: s.resolution,
      data,
      margin: 10,
      qrOptions: {
        errorCorrectionLevel: forceHighErrorCorrection ? 'H' : s.errorCorrectionLevel,
      },
      dotsOptions: {
        type: s.bodyShape,
        ...bodyColor,
      },
      cornersSquareOptions: {
        type: s.eyeFrameShape,
        ...eyeFrameColor,
      },
      cornersDotOptions: {
        type: s.eyeBallShape,
        ...eyeBallColor,
      },
      backgroundOptions: {
        ...bgColor,
      },
    };

    if (effectiveImage) {
      config.image = effectiveImage;
      config.imageOptions = {
        hideBackgroundDots: true,
        imageSize: (s.centerSize / 100) * 2, // scale to proportion
        margin: 4,
        crossOrigin: 'anonymous',
      };
    } else {
      config.image = '';
    }

    return config;
  },

  // Template save/load
  saveTemplate: (name) => {
    const s = get();
    const template = {
      name,
      timestamp: Date.now(),
      bodyShape: s.bodyShape,
      bodyColorType: s.bodyColorType,
      bodyColor: s.bodyColor,
      bodyGradient: s.bodyGradient,
      eyeFrameShape: s.eyeFrameShape,
      eyeFrameColorType: s.eyeFrameColorType,
      eyeFrameColor: s.eyeFrameColor,
      eyeFrameGradient: s.eyeFrameGradient,
      eyeBallShape: s.eyeBallShape,
      eyeBallColorType: s.eyeBallColorType,
      eyeBallColor: s.eyeBallColor,
      eyeBallGradient: s.eyeBallGradient,
      bgColorType: s.bgColorType,
      bgColor: s.bgColor,
      bgGradient: s.bgGradient,
      centerMode: s.centerMode,
      centerSize: s.centerSize,
      centerText: s.centerText,
      centerFontFamily: s.centerFontFamily,
      centerTextColor: s.centerTextColor,
      centerTextBgColor: s.centerTextBgColor,
      errorCorrectionLevel: s.errorCorrectionLevel,
    };
    const templates = [...get().savedTemplates, template];
    localStorage.setItem('qr-templates', JSON.stringify(templates));
    set({ savedTemplates: templates });
  },

  loadTemplate: (template) => {
    const { name: _name, timestamp: _timestamp, ...design } = template;
    set({ ...design, activePreset: null, previewOverride: null });
  },

  deleteTemplate: (index) => {
    const templates = get().savedTemplates.filter((_, i) => i !== index);
    localStorage.setItem('qr-templates', JSON.stringify(templates));
    set({ savedTemplates: templates });
  },

  // Global Reset: Clears Zustand store, revokes all Object URLs,
  // and explicitly calls qrCode.update(defaultConfig) on live instances.
  reset: () => {
    // 1. Revoke any memory-allocated Blob URLs
    revokeAllManagedBlobUrls();

    // 2. Reset store state
    set({
      ...defaultDesign,
      activePreset: 'standard-black',
      previewOverride: null,
      defaultBulkLogo: null,
      bulkRows: [
        { id: 'bulk-row-1', fileName: 'website-home', data: 'https://example.com', logo: null },
        { id: 'bulk-row-2', fileName: 'promo-summer', data: 'https://example.com/summer-sale', logo: null },
        { id: 'bulk-row-3', fileName: 'wifi-guest', data: 'WIFI:S:GuestWiFi;T:WPA;P:secret123;;', logo: null },
      ],
    });

    // 3. Explicitly update live canvas instances to clean default black-and-white square
    resetAllQRInstances(280);
  },
}));
