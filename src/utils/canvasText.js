export const AVAILABLE_FONTS = [
  { id: 'Arial', name: 'Arial', category: 'Sans-Serif' },
  { id: 'Courier New', name: 'Courier New', category: 'Monospace' },
  { id: 'Times New Roman', name: 'Times New Roman', category: 'Serif' },
  { id: 'Impact', name: 'Impact', category: 'Display' },
  { id: 'Comic Sans MS', name: 'Comic Sans MS', category: 'Casual' },
  { id: 'Georgia', name: 'Georgia', category: 'Serif' },
  { id: 'Trebuchet MS', name: 'Trebuchet MS', category: 'Sans-Serif' },
];

export function renderTextToDataUrl(text, options = {}) {
  // Support both renderTextToDataUrl(text, 300) and renderTextToDataUrl(text, { size, fontFamily, color, bgColor })
  const opts = typeof options === 'number' ? { size: options } : options;
  const {
    size = 300,
    fontFamily = 'Arial',
    color = '#000000',
    bgColor = 'transparent',
    fontWeight = 'bold',
  } = opts;

  if (!text || !text.trim()) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  // If a background color is provided (and not transparent), draw a crisp rounded card / pill badge
  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    const radius = size * 0.16;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
  }

  // Calculate font size to fit text within canvas width with comfortable margins
  let fontSize = Math.floor(size * 0.38);
  const maxTextWidth = size * 0.82;
  const fontFaceString = `"${fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif`;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFaceString}`;
  let metrics = ctx.measureText(text);

  while (metrics.width > maxTextWidth && fontSize > 10) {
    fontSize -= 2;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFaceString}`;
    metrics = ctx.measureText(text);
  }

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);

  return canvas.toDataURL('image/png');
}
