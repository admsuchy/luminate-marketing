import sharp from 'sharp';
import fs from 'node:fs/promises';

const SRC = '/Users/luminatestudios/Documents/luminate-marketing/public/logo.png';
const PUBLIC = '/Users/luminatestudios/Documents/luminate-marketing/public';

const meta = await sharp(SRC).metadata();
console.log('source:', meta.width, 'x', meta.height);

// 1. Extract the leftmost square (icon region).
const square = await sharp(SRC)
  .extract({ left: 0, top: 0, width: meta.height, height: meta.height })
  .toBuffer();

// 2. Auto-trim transparent pixels.
const trimmed = await sharp(square)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 5 })
  .toBuffer();

// 3. Resize icon down to 432×432, then pad to 512×512 (40px breathing room).
const mask = await sharp(trimmed)
  .resize(432, 432, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .extend({
    top: 40, bottom: 40, left: 40, right: 40,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const maskMeta = await sharp(mask).metadata();
console.log('mask:', maskMeta.width, 'x', maskMeta.height);

await fs.writeFile(`${PUBLIC}/logo-icon.png`, mask);
console.log('wrote:', `${PUBLIC}/logo-icon.png`);

// Recolor by compositing the white-on-transparent mask over a solid color,
// using dest-in blend so only the icon shape remains in the new color.
async function recolor({ color, name }) {
  const out = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: color,
    },
  })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await fs.writeFile(`${PUBLIC}/${name}`, out);
  console.log('wrote:', `${PUBLIC}/${name}`);
}

await recolor({ color: { r: 255, g: 127, b: 0,   alpha: 1 }, name: 'logo-icon-orange.png' });
await recolor({ color: { r: 10,  g: 10,  b: 10,  alpha: 1 }, name: 'logo-icon-black.png'  });

// Generate downscaled favicon sizes from the white master so they're crisp.
async function downscale(srcName, size, outName) {
  const buf = await sharp(`${PUBLIC}/${srcName}`)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await fs.writeFile(`${PUBLIC}/${outName}`, buf);
  console.log('wrote:', `${PUBLIC}/${outName}`, size + 'x' + size);
}

await downscale('logo-icon.png', 16,  'favicon-16.png');
await downscale('logo-icon.png', 32,  'favicon-32.png');
await downscale('logo-icon.png', 180, 'apple-touch-icon.png');
// favicon.ico fallback (browsers accept PNG renamed to .ico, and the legacy
// /favicon.ico request still resolves so old caches get replaced).
await downscale('logo-icon.png', 32,  'favicon.ico');
