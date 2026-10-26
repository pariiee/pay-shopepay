import QRCode from 'qrcode';

export function generateStyledQrSvg(text, options = {}) {
  const {
    style = 'classic',
    color = '#0f172a',
    size = 320
  } = options;

  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const moduleCount = qr.modules.size;
  const cellSize = size / (moduleCount + 4); // 2 cells padding
  const padding = cellSize * 2;

  // Helper to check if a cell is part of the 3 finder patterns (top-left, top-right, bottom-left)
  const isFinder = (x, y) => {
    if (x < 7 && y < 7) return true; // Top-left
    if (x >= moduleCount - 7 && y < 7) return true; // Top-right
    if (x < 7 && y >= moduleCount - 7) return true; // Bottom-left
    return false;
  };

  let paths = [];

  // Render Finder Patterns cleanly for high scanner readability
  const renderFinder = (ox, oy) => {
    const x = padding + ox * cellSize;
    const y = padding + oy * cellSize;
    const w = 7 * cellSize;
    const rOuter = (style === 'dots' || style === 'rounded' || style === 'classy') ? cellSize * 1.5 : 0;
    const rInner = (style === 'dots' || style === 'rounded' || style === 'classy') ? cellSize * 0.8 : 0;

    return `
      <rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${rOuter}" ry="${rOuter}" fill="${color}" />
      <rect x="${x + cellSize}" y="${y + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" rx="${rOuter * 0.7}" ry="${rOuter * 0.7}" fill="#ffffff" />
      <rect x="${x + 2 * cellSize}" y="${y + 2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" rx="${rInner}" ry="${rInner}" fill="${color}" />
    `;
  };

  paths.push(renderFinder(0, 0));
  paths.push(renderFinder(moduleCount - 7, 0));
  paths.push(renderFinder(0, moduleCount - 7));

  // Render Data Modules
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinder(c, r)) continue; // skip finder patterns
      if (qr.modules.get(c, r)) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;

        if (style === 'dots') {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const radius = cellSize * 0.42;
          paths.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" />`);
        } else if (style === 'rounded') {
          const rx = cellSize * 0.35;
          paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${rx}" ry="${rx}" fill="${color}" />`);
        } else if (style === 'classy') {
          // Elegant rounded squaricle with tiny margin
          const rx = cellSize * 0.25;
          paths.push(`<rect x="${x + cellSize * 0.05}" y="${y + cellSize * 0.05}" width="${cellSize * 0.9}" height="${cellSize * 0.9}" rx="${rx}" ry="${rx}" fill="${color}" />`);
        } else if (style === 'minimal') {
          // Sleek compact squaricle
          paths.push(`<rect x="${x + cellSize * 0.08}" y="${y + cellSize * 0.08}" width="${cellSize * 0.84}" height="${cellSize * 0.84}" rx="${cellSize * 0.15}" ry="${cellSize * 0.15}" fill="${color}" />`);
        } else {
          // Classic sharp rectangle
          paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" />`);
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="16" ry="16" />
    ${paths.join('\n')}
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
