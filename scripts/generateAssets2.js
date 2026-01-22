const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'assets');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

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
    console.log(`Done: ${filename}\n`);
    return true;
  } catch (error) {
    console.error(`Error generating ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== MELONARY ASSET GENERATOR v2 ===\n');

  await generateImage(
    `2D game sprite sheet, TOP-DOWN VIEW from above, Brazilian caramel/golden street dog (vira-lata caramelo) seen from ABOVE looking down at the dog's back, the dog is in flying kick pose with legs extended, wearing dark aviator sunglasses, golden/tan fur color, muscular heroic build, the sprite should show the dog as if a camera is directly above looking down, NO BACKGROUND - completely transparent/empty background, game asset style, clean edges, suitable for a top-down racing game where we see characters from bird's eye view`,
    'dog-topdown.png',
    '1024x1024'
  );

  await generateImage(
    `2D game sprite, TOP-DOWN VIEW from above looking down, a THIN/SKINNY delivery motorcycle rider on a simple motorcycle with a RED delivery bag/box on the back, seen from DIRECTLY ABOVE as if camera is in the sky looking down at the rider's back and helmet, the rider wears a helmet, simple dark clothes, the motorcycle is a standard delivery bike, NO BACKGROUND - completely transparent/empty background, game asset for top-down arcade game, clean edges`,
    'moto-thin.png',
    '1024x1024'
  );

  await generateImage(
    `2D game sprite, TOP-DOWN VIEW from above looking down, a FAT/CHUBBY delivery motorcycle rider on a simple motorcycle with a RED delivery bag/box on the back, seen from DIRECTLY ABOVE as if camera is in the sky looking down at the rider's back and helmet, the rider is visibly overweight/fat, wears a helmet, simple dark clothes, the motorcycle is a standard delivery bike, NO BACKGROUND - completely transparent/empty background, game asset for top-down arcade game, clean edges`,
    'moto-fat.png',
    '1024x1024'
  );

  console.log('\n=== GENERATING FULL-SCREEN CITY ROAD BACKGROUNDS ===\n');

  const cityPromptBase = `Top-down view of a city street at night for a racing/arcade game, VERTICAL ORIENTATION with road going from bottom to top of image, the image shows 5 parallel lanes/roads with lane markings, buildings on the left and right sides of the road, wet asphalt reflecting neon lights, the perspective is from directly above like a drone camera, vibrant city atmosphere, NO vehicles or people in the image, the road should fill most of the image width with buildings only on the edges`;

  await generateImage(
    `${cityPromptBase}. Rio de Janeiro Brazil style - tropical palm trees on sidewalks, colorful Brazilian style buildings, favela lights visible on distant hills, Copacabana beach area vibes, Christ the Redeemer silhouette in the far distance, warm tropical night colors`,
    'road-rio.png',
    '1024x1792'
  );

  await generateImage(
    `${cityPromptBase}. New York City USA style - tall skyscrapers on both sides, Times Square neon billboards and advertisements, steam rising from manholes, classic NYC yellow elements in the environment, Empire State Building visible in distance, gritty urban atmosphere`,
    'road-newyork.png',
    '1024x1792'
  );

  await generateImage(
    `${cityPromptBase}. Tokyo Japan style - Japanese neon signs with kanji characters, anime advertisements on buildings, cherry blossom petals on the road, vending machines on sidewalks, Tokyo Tower visible in distance, cyberpunk neon atmosphere`,
    'road-tokyo.png',
    '1024x1792'
  );

  await generateImage(
    `${cityPromptBase}. Paris France style - elegant Haussmann style buildings, Art Nouveau metro signs, Eiffel Tower visible in the distance with lights, romantic Parisian streetlamps, cafe terraces on sidewalks, sophisticated European atmosphere`,
    'road-paris.png',
    '1024x1792'
  );

  await generateImage(
    `${cityPromptBase}. Dubai UAE style - ultra-modern futuristic skyscrapers, Burj Khalifa visible in distance, golden sand particles in air, luxury architectural style, palm tree lined boulevards, golden and blue lighting`,
    'road-dubai.png',
    '1024x1792'
  );

  await generateImage(
    `${cityPromptBase}. Los Angeles USA style - palm trees lining the road, Hollywood hills with Hollywood sign visible in distance, movie theater marquees, Walk of Fame stars on sidewalks, sunset colors in the sky, California beach city vibes`,
    'road-losangeles.png',
    '1024x1792'
  );

  console.log('\n=== ASSET GENERATION COMPLETE ===');
  console.log(`Assets saved to: ${ASSETS_DIR}`);
}

main().catch(console.error);
