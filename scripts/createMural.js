const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'assets');

async function createMural() {
  console.log('Creating high-quality mural background...');
  
  const width = 1400;
  const height = 2000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0a0a12');
  gradient.addColorStop(0.5, '#12121f');
  gradient.addColorStop(1, '#0a0a12');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const images = [];
  for (let i = 1; i <= 5; i++) {
    try {
      const img = await loadImage(path.join(ASSETS_DIR, `mural${i}.jpg`));
      images.push(img);
      console.log(`Loaded mural${i}.jpg`);
    } catch (e) {
      console.log(`Could not load mural${i}.jpg`);
    }
  }

  if (images.length === 0) {
    console.log('No images found');
    return;
  }

  const imgSize = 240;
  const padding = 35;
  const cols = 5;
  const rows = 8;

  const positions = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2) * 60;
      const x = col * (imgSize + padding) + padding * 2 + offsetX;
      const y = row * (imgSize + padding) + padding * 2;
      positions.push({ x, y });
    }
  }

  positions.forEach((pos, i) => {
    const img = images[i % images.length];
    const rotation = (Math.random() - 0.5) * 0.2;
    
    ctx.save();
    ctx.translate(pos.x + imgSize / 2, pos.y + imgSize / 2);
    ctx.rotate(rotation);
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 8;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-imgSize / 2 - 12, -imgSize / 2 - 12, imgSize + 24, imgSize + 36);
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
    
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(-imgSize / 2 - 12, -imgSize / 2 - 12, imgSize + 24, imgSize + 36);
    
    ctx.restore();
  });

  ctx.fillStyle = 'rgba(8, 8, 15, 0.2)';
  ctx.fillRect(0, 0, width, height);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(path.join(ASSETS_DIR, 'mural-bg.jpg'), buffer);
  console.log('Saved mural-bg.jpg (high quality 1400x2000)');
}

createMural().catch(console.error);
