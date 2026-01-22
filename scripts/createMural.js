const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'assets');

async function createMural() {
  console.log('Creating mural background...');
  
  const width = 800;
  const height = 1400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a14';
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

  const positions = [];
  const imgSize = 180;
  const padding = 20;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 5; col++) {
      const x = col * (imgSize + padding) + padding + (row % 2) * 40;
      const y = row * (imgSize + padding) + padding;
      positions.push({ x, y });
    }
  }

  positions.forEach((pos, i) => {
    const img = images[i % images.length];
    const rotation = (Math.random() - 0.5) * 0.3;
    
    ctx.save();
    ctx.translate(pos.x + imgSize / 2, pos.y + imgSize / 2);
    ctx.rotate(rotation);
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(-imgSize / 2 - 8, -imgSize / 2 - 8, imgSize + 16, imgSize + 24);
    
    ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
    
    ctx.restore();
  });

  ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
  ctx.fillRect(0, 0, width, height);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
  fs.writeFileSync(path.join(ASSETS_DIR, 'mural-bg.jpg'), buffer);
  console.log('Saved mural-bg.jpg');
}

createMural().catch(console.error);
