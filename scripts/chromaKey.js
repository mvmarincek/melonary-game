const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'assets');

async function removeGreenBackground(inputFile, outputFile) {
  console.log(`Processing: ${inputFile}...`);
  
  try {
    const image = await loadImage(path.join(ASSETS_DIR, inputFile));
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const isGreen = g > 150 && g > r * 1.2 && g > b * 1.2;
      const isBrightGreen = g > 200 && r < 150 && b < 150;
      const isWhite = r > 240 && g > 240 && b > 240;
      const isLightGray = r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
      
      if (isGreen || isBrightGreen || isWhite || isLightGray) {
        data[i + 3] = 0;
      }
    }
    
    for (let pass = 0; pass < 2; pass++) {
      const tempData = new Uint8ClampedArray(data);
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const idx = (y * canvas.width + x) * 4;
          if (tempData[idx + 3] > 0) {
            let transparentNeighbors = 0;
            const neighbors = [
              ((y - 1) * canvas.width + x) * 4,
              ((y + 1) * canvas.width + x) * 4,
              (y * canvas.width + (x - 1)) * 4,
              (y * canvas.width + (x + 1)) * 4,
            ];
            for (const nIdx of neighbors) {
              if (tempData[nIdx + 3] === 0) transparentNeighbors++;
            }
            if (transparentNeighbors >= 3) {
              data[idx + 3] = 0;
            }
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(ASSETS_DIR, outputFile), buffer);
    
    console.log(`Saved: ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== REMOVING GREEN BACKGROUNDS (CHROMA KEY) ===\n');
  
  await removeGreenBackground('dog-new.png', 'dog-final.png');
  await removeGreenBackground('moto-thin-new.png', 'moto-thin-final.png');
  await removeGreenBackground('moto-fat-new.png', 'moto-fat-final.png');
  
  console.log('\n=== DONE ===');
}

main().catch(console.error);
