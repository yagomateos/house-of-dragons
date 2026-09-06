// Genera los iconos de la PWA a partir de nuestro propio pixel art
// (el mismo dragón dorado que aparece en la Enciclopedia), sin depender
// de ningún archivo de imagen externo. Ejecutar con: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const GRID = [
  '....WW..........',
  '...WWWW.........',
  '..WWWWWW........',
  '.WWWWWWWW.......',
  'BBWWWWWWWW......',
  'BBBBWWWWWWBB....',
  '.BBBBBBBBBBBB...',
  '..BBBBEBBBBBBB..',
  '...BBBBBBBBBBB..',
  '....BB.....BBB..',
  '...BB.......BB..',
  '..BB.........BB.',
];

const COLORS = { W: '#8a6d1a', B: '#c9a227', E: '#f4b942' };
const COLS = Math.max(...GRID.map((r) => r.length));
const ROWS = GRID.length;

function buildSvg(size) {
  const padding = size * 0.16;
  const inner = size - padding * 2;
  const cell = inner / COLS;
  const offsetY = (size - ROWS * cell) / 2;

  let cells = '';
  GRID.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const color = COLORS[ch];
      cells += `<rect x="${padding + x * cell}" y="${offsetY + y * cell}" width="${cell + 0.5}" height="${
        cell + 0.5
      }" fill="${color}" />`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="bg" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#1b2545" />
        <stop offset="100%" stop-color="#0b0b0f" />
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg)" />
    <rect x="${size * 0.035}" y="${size * 0.035}" width="${size * 0.93}" height="${size * 0.93}" rx="${
    size * 0.14
  }" fill="none" stroke="#c9a227" stroke-width="${size * 0.02}" opacity="0.85" />
    ${cells}
  </svg>`;
}

async function main() {
  await mkdir('public/icons', { recursive: true });

  const targets = [
    { file: 'icon-192.png', size: 192 },
    { file: 'icon-512.png', size: 512 },
    { file: 'apple-touch-icon.png', size: 180 },
  ];

  for (const t of targets) {
    const svg = buildSvg(t.size);
    await sharp(Buffer.from(svg)).png().toFile(`public/icons/${t.file}`);
    console.log('generado', t.file);
  }

  // Versión "maskable" con más margen de seguridad para Android (icono adaptativo)
  await sharp(Buffer.from(buildMaskable(512))).png().toFile('public/icons/icon-512-maskable.png');
  console.log('generado icon-512-maskable.png');

  function buildMaskable(size) {
    const padding = size * 0.28;
    const inner = size - padding * 2;
    const cell = inner / COLS;
    const offsetY = (size - ROWS * cell) / 2;
    let cells = '';
    GRID.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.') continue;
        const color = COLORS[ch];
        cells += `<rect x="${padding + x * cell}" y="${offsetY + y * cell}" width="${cell + 0.5}" height="${
          cell + 0.5
        }" fill="${color}" />`;
      }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#0b0b0f" />
      ${cells}
    </svg>`;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
