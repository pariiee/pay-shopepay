import QRCode from 'qrcode';

export function generateStyledQrSvg(text, options = {}) {
  let {
    style = 'classic',
    body = 'square',
    eyeFrame = 'square',
    eyeBall = 'square',
    color = '#0f172a',
    logo = null,
    logoBg = 'circle',
    size = 320
  } = options;

  // Backward compatibility with legacy preset style strings
  if (options.style && !options.body) {
    if (style === 'dots') {
      body = 'dots';
      eyeFrame = 'circle';
      eyeBall = 'circle';
    } else if (style === 'rounded') {
      body = 'rounded';
      eyeFrame = 'rounded';
      eyeBall = 'rounded';
    } else if (style === 'classy') {
      body = 'rounded';
      eyeFrame = 'leaf';
      eyeBall = 'leaf';
    } else if (style === 'minimal') {
      body = 'dots';
      eyeFrame = 'rounded';
      eyeBall = 'diamond';
    } else {
      body = 'square';
      eyeFrame = 'square';
      eyeBall = 'square';
    }
  }

  // Higher error correction level (H = 30%) when logo is embedded
  const eccLevel = logo ? 'H' : 'M';
  const qr = QRCode.create(text, { errorCorrectionLevel: eccLevel });
  const moduleCount = qr.modules.size;
  const cellSize = size / (moduleCount + 4); // 2 cells quiet zone
  const padding = cellSize * 2;

  // Calculate center logo bounds in module coordinates
  const logoCellRadius = logo ? Math.ceil(moduleCount * 0.13) : 0;
  const centerModule = moduleCount / 2;

  // Is coordinate inside one of the 3 corner finder patterns (7x7)?
  const isFinder = (x, y) => {
    if (x < 7 && y < 7) return true; // Top-left
    if (x >= moduleCount - 7 && y < 7) return true; // Top-right
    if (x < 7 && y >= moduleCount - 7) return true; // Bottom-left
    return false;
  };

  // Is coordinate inside the center logo cutout area?
  const isLogoArea = (x, y) => {
    if (!logo) return false;
    const dx = x - centerModule + 0.5;
    const dy = y - centerModule + 0.5;
    if (logoBg === 'square') {
      return Math.abs(dx) <= logoCellRadius && Math.abs(dy) <= logoCellRadius;
    }
    // Default circular clearance
    return (dx * dx + dy * dy) <= (logoCellRadius + 0.3) * (logoCellRadius + 0.3);
  };

  let paths = [];

  // 1. Render Eye Frame & Eye Ball for each corner
  const renderCornerEye = (ox, oy, cornerType) => {
    const x = padding + ox * cellSize;
    const y = padding + oy * cellSize;
    const w = 7 * cellSize;
    const cx = x + w / 2;
    const cy = y + w / 2;
    const innerW = 5 * cellSize;
    const ballW = 3 * cellSize;
    const ballX = x + 2 * cellSize;
    const ballY = y + 2 * cellSize;

    // --- A. EYE FRAME SHAPE ---
    if (eyeFrame === 'circle') {
      paths.push(`
        <circle cx="${cx}" cy="${cy}" r="${w / 2}" fill="${color}" />
        <circle cx="${cx}" cy="${cy}" r="${innerW / 2}" fill="#ffffff" />
      `);
    } else if (eyeFrame === 'rounded') {
      const r = cellSize * 1.5;
      paths.push(`
        <rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${r}" ry="${r}" fill="${color}" />
        <rect x="${x + cellSize}" y="${y + cellSize}" width="${innerW}" height="${innerW}" rx="${r * 0.7}" ry="${r * 0.7}" fill="#ffffff" />
      `);
    } else if (eyeFrame === 'leaf') {
      const rOuter = cellSize * 2.2;
      const rInner = cellSize * 1.4;
      let dOuter = '';
      let dInner = '';
      if (cornerType === 'TR') {
        dOuter = `M ${x} ${y} H ${x + w - rOuter} A ${rOuter} ${rOuter} 0 0 1 ${x + w} ${y + rOuter} V ${y + w} H ${x + rOuter} A ${rOuter} ${rOuter} 0 0 1 ${x} ${y + w - rOuter} Z`;
        dInner = `M ${x + cellSize} ${y + cellSize} H ${x + cellSize + innerW - rInner} A ${rInner} ${rInner} 0 0 1 ${x + cellSize + innerW} ${y + cellSize + rInner} V ${y + cellSize + innerW} H ${x + cellSize + rInner} A ${rInner} ${rInner} 0 0 1 ${x + cellSize} ${y + cellSize + innerW - rInner} Z`;
      } else {
        dOuter = `M ${x + rOuter} ${y} H ${x + w} V ${y + w - rOuter} A ${rOuter} ${rOuter} 0 0 1 ${x + w - rOuter} ${y + w} H ${x} V ${y + rOuter} A ${rOuter} ${rOuter} 0 0 1 ${x + rOuter} ${y} Z`;
        dInner = `M ${x + cellSize + rInner} ${y + cellSize} H ${x + cellSize + innerW} V ${y + cellSize + innerW - rInner} A ${rInner} ${rInner} 0 0 1 ${x + cellSize + innerW - rInner} ${y + cellSize + innerW} H ${x + cellSize} V ${y + cellSize + rInner} A ${rInner} ${rInner} 0 0 1 ${x + cellSize + rInner} ${y + cellSize} Z`;
      }
      paths.push(`
        <path d="${dOuter}" fill="${color}" />
        <path d="${dInner}" fill="#ffffff" />
      `);
    } else if (eyeFrame === 'teardrop') {
      const r = cellSize * 2.2;
      const rInner = cellSize * 1.4;
      paths.push(`
        <rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${r}" ry="${r}" fill="${color}" />
        <rect x="${x + cellSize}" y="${y + cellSize}" width="${innerW}" height="${innerW}" rx="${rInner}" ry="${rInner}" fill="#ffffff" />
      `);
    } else {
      // Default: square sharp
      paths.push(`
        <rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${color}" />
        <rect x="${x + cellSize}" y="${y + cellSize}" width="${innerW}" height="${innerW}" fill="#ffffff" />
      `);
    }

    // --- B. EYE BALL SHAPE ---
    if (eyeBall === 'circle') {
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${ballW / 2}" fill="${color}" />`);
    } else if (eyeBall === 'rounded') {
      const r = cellSize * 0.8;
      paths.push(`<rect x="${ballX}" y="${ballY}" width="${ballW}" height="${ballW}" rx="${r}" ry="${r}" fill="${color}" />`);
    } else if (eyeBall === 'diamond') {
      paths.push(`<polygon points="${cx},${ballY} ${ballX + ballW},${cy} ${cx},${ballY + ballW} ${ballX},${cy}" fill="${color}" />`);
    } else if (eyeBall === 'leaf') {
      const r = cellSize * 1.2;
      paths.push(`<path d="M ${ballX + r} ${ballY} H ${ballX + ballW} V ${ballY + ballW - r} A ${r} ${r} 0 0 1 ${ballX + ballW - r} ${ballY + ballW} H ${ballX} V ${ballY + r} A ${r} ${r} 0 0 1 ${ballX + r} ${ballY} Z" fill="${color}" />`);
    } else {
      // Default: square sharp
      paths.push(`<rect x="${ballX}" y="${ballY}" width="${ballW}" height="${ballW}" fill="${color}" />`);
    }
  };

  renderCornerEye(0, 0, 'TL');
  renderCornerEye(moduleCount - 7, 0, 'TR');
  renderCornerEye(0, moduleCount - 7, 'BL');

  // 2. Render Data Modules (Body Shape)
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinder(c, r)) continue; // skip 7x7 corner eye regions
      if (isLogoArea(c, r)) continue; // skip center area reserved for logo
      if (qr.modules.get(c, r)) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;

        if (body === 'dots') {
          paths.push(`<circle cx="${cx}" cy="${cy}" r="${cellSize * 0.44}" fill="${color}" />`);
        } else if (body === 'rounded') {
          const rx = cellSize * 0.35;
          paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${rx}" ry="${rx}" fill="${color}" />`);
        } else if (body === 'diamond') {
          paths.push(`<polygon points="${cx},${y + cellSize * 0.05} ${x + cellSize * 0.95},${cy} ${cx},${y + cellSize * 0.95} ${x + cellSize * 0.05},${cy}" fill="${color}" />`);
        } else if (body === 'star') {
          const m1 = cellSize * 0.3;
          const m2 = cellSize * 0.7;
          paths.push(`<polygon points="${cx},${y} ${x + m2},${y + m1} ${x + cellSize},${cy} ${x + m2},${y + m2} ${cx},${y + cellSize} ${x + m1},${y + m2} ${x},${cy} ${x + m1},${y + m1}" fill="${color}" />`);
        } else if (body === 'leaf') {
          const r = cellSize * 0.45;
          paths.push(`<path d="M ${x + r} ${y} H ${x + cellSize} V ${y + cellSize - r} A ${r} ${r} 0 0 1 ${x + cellSize - r} ${y + cellSize} H ${x} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z" fill="${color}" />`);
        } else {
          // Default: square sharp
          paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" />`);
        }
      }
    }
  }

  // 3. Render Center Logo Overlay (Seamless Circular / Borderless)
  let logoSvg = '';
  if (logo && typeof logo === 'string' && logo.trim()) {
    const centerPx = size / 2;
    const logoRadiusPx = (logoCellRadius + 0.35) * cellSize;
    const imgSize = logoRadiusPx * 1.55;
    const imgX = centerPx - imgSize / 2;
    const imgY = centerPx - imgSize / 2;

    let bgShape = '';
    if (logoBg === 'square') {
      const shieldW = logoRadiusPx * 2;
      bgShape = `<rect x="${centerPx - shieldW/2}" y="${centerPx - shieldW/2}" width="${shieldW}" height="${shieldW}" rx="${cellSize}" ry="${cellSize}" fill="#ffffff" />`;
    } else if (logoBg === 'none') {
      bgShape = ''; // Pure transparent, no background
    } else {
      // Default: clean white circle with NO stroke border
      bgShape = `<circle cx="${centerPx}" cy="${centerPx}" r="${logoRadiusPx}" fill="#ffffff" />`;
    }

    logoSvg = `
      <g id="qr-center-logo">
        ${bgShape}
        <image href="${logo}" x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid meet" />
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="16" ry="16" />
    ${paths.join('\n')}
    ${logoSvg}
  </svg>`;

  if (options.rawSvg) return svg;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
