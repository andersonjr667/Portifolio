const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'images');
const outDir = path.join(srcDir, 'optimized');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function processImage(file) {
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file, ext);
  const inputPath = path.join(srcDir, file);

  try {
    // Generate WebP (quality 80)
    const webpPath = path.join(outDir, `${name}.webp`);
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Generate a resized JPG for fallback (1200px width)
    const jpgPath = path.join(outDir, `${name}.jpg`);
    await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(jpgPath);

    // Generate thumbnail (800px)
    const thumbPath = path.join(outDir, `${name}-thumb.jpg`);
    await sharp(inputPath)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toFile(thumbPath);

    console.log(`Processed: ${file} -> ${path.relative(process.cwd(), webpPath)}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

(async () => {
  const files = fs.readdirSync(srcDir).filter(f => /\.(png|jpe?g)$/i.test(f));
  for (const file of files) {
    await processImage(file);
  }
  console.log('Image optimization complete. Optimized files are in images/optimized/');
})();
