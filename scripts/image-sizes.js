const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'images');
const optDir = path.join(imagesDir, 'optimized');
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

function getSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (e) {
    return null;
  }
}

const files = fs.readdirSync(imagesDir).filter(f => /\.(png|jpe?g)$/i.test(f));
const rows = [];
rows.push('Image size report\n');
rows.push('Original -> Optimized (webp / jpg / thumb)\n');
rows.push('---------------------------------------------------\n');

files.forEach(file => {
  const name = path.basename(file, path.extname(file));
  const origPath = path.join(imagesDir, file);
  const origSize = getSize(origPath);

  const webpPath = path.join(optDir, `${name}.webp`);
  const jpgPath = path.join(optDir, `${name}.jpg`);
  const thumbPath = path.join(optDir, `${name}-thumb.jpg`);

  const webpSize = getSize(webpPath);
  const jpgSize = getSize(jpgPath);
  const thumbSize = getSize(thumbPath);

  rows.push(`${file}: ${origSize ? (origSize/1024).toFixed(1)+' KB' : 'N/A'} -> webp: ${webpSize? (webpSize/1024).toFixed(1)+' KB':'N/A'}, jpg: ${jpgSize? (jpgSize/1024).toFixed(1)+' KB':'N/A'}, thumb: ${thumbSize? (thumbSize/1024).toFixed(1)+' KB':'N/A'}`);
});

const outPath = path.join(reportsDir, 'image-sizes.txt');
fs.writeFileSync(outPath, rows.join('\n'));
console.log('Image sizes report written to', outPath);
