const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'assets');

async function downloadImage(url, filename) {
  const filepath = path.join(ASSETS_DIR, filename);
  return new Promise((resolve, reject) => {
    const download = (downloadUrl) => {
      https.get(downloadUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          download(response.headers.location);
        } else {
          const file = fs.createWriteStream(filepath);
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${filename}`);
            resolve(filepath);
          });
        }
      }).on('error', reject);
    };
    download(url);
  });
}

async function generateImage(prompt, filename, size = '1024x1024') {
  console.log(`Generating: ${filename}...`);
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'hd',
      style: 'vivid'
    });
    
    const url = response.data[0].url;
    await downloadImage(url, filename);
    console.log(`Done!\n`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== GENERATING NEW DOG SPRITE ===\n');

  await generateImage(
    `2D game character sprite, Brazilian caramel/golden street dog (vira-lata caramelo) standing on two legs in heroic pose, wearing a BLACK LEATHER VEST/JACKET and DARK AVIATOR SUNGLASSES, the dog has golden/tan caramel fur, muscular athletic build, cool badass attitude, the dog is seen from a 3/4 top-down angle as in arcade games, simple clean design with bold outlines, the background must be SOLID BRIGHT GREEN (#00FF00) for easy chroma key removal, cartoon/comic book style, vibrant colors`,
    'dog-new.png',
    '1024x1024'
  );

  await generateImage(
    `2D game character sprite, a THIN/SKINNY delivery motorcycle rider on a simple delivery motorcycle with RED delivery bag/box on back, rider wearing helmet, seen from 3/4 top-down angle as in arcade racing games, simple clean design with bold outlines, the background must be SOLID BRIGHT GREEN (#00FF00) for easy chroma key removal, cartoon style`,
    'moto-thin-new.png',
    '1024x1024'
  );

  await generateImage(
    `2D game character sprite, a FAT/CHUBBY overweight delivery motorcycle rider on a simple delivery motorcycle with RED delivery bag/box on back, rider wearing helmet, clearly overweight body, seen from 3/4 top-down angle as in arcade racing games, simple clean design with bold outlines, the background must be SOLID BRIGHT GREEN (#00FF00) for easy chroma key removal, cartoon style`,
    'moto-fat-new.png',
    '1024x1024'
  );

  console.log('=== DONE ===');
}

main().catch(console.error);
