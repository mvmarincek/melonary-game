const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'assets');

async function removeWhiteBackground(inputFile, outputFile, tolerance = 30) {
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
      
      if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
        data[i + 3] = 0;
      }
      else if (r > 240 - tolerance && g > 240 - tolerance && b > 240 - tolerance) {
        const avg = (r + g + b) / 3;
        const alpha = Math.max(0, 255 - (avg - 200) * 5);
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(ASSETS_DIR, outputFile), buffer);
    
    console.log(`Saved: ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${inputFile}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== REMOVING WHITE BACKGROUNDS ===\n');
  
  const filesToProcess = [
    { input: 'dog-topdown.png', output: 'dog-topdown.png', tolerance: 40 },
    { input: 'moto-thin.png', output: 'moto-thin.png', tolerance: 40 },
    { input: 'moto-fat.png', output: 'moto-fat.png', tolerance: 40 },
  ];
  
  for (const file of filesToProcess) {
    await removeWhiteBackground(file.input, file.output, file.tolerance);
  }
  
  console.log('\n=== DONE ===');
}

main().catch(console.error);
