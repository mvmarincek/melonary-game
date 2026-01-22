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
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          const file = fs.createWriteStream(filepath);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${filename}`);
            resolve(filepath);
          });
        }).on('error', reject);
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
    console.log(`Revised prompt: ${response.data[0].revised_prompt}\n`);
    return true;
  } catch (error) {
    console.error(`Error generating ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== MELONARY ASSET GENERATOR ===\n');

  await generateImage(
    `2D game sprite of a muscular golden/caramel Brazilian street dog (vira-lata caramelo) seen from behind, in flying kick pose (voadora), wearing dark sunglasses, cyberpunk golden armor style, heroic pose with one leg extended for a powerful kick, transparent background, pixel art style suitable for arcade game, dynamic action pose, golden fur, athletic build`,
    'dog-sprite.png',
    '1024x1024'
  );

  await generateImage(
    `2D game sprite of a motorcycle rider seen from the front/facing the viewer, riding a sport motorcycle, wearing black helmet with visor, leather jacket, menacing look, the motorcycle headlight is on, night time lighting, transparent background, arcade game style, suitable for obstacle in racing game, clear silhouette`,
    'moto-sprite.png',
    '1024x1024'
  );

  await generateImage(
    `2D game sprite of a motorcycle rider seen from the front/facing the viewer, riding a chopper/cruiser motorcycle, wearing open face helmet, bandana, biker gang style, the motorcycle has chrome details, night lighting, transparent background, arcade game style, villain character`,
    'moto-sprite-2.png',
    '1024x1024'
  );

  await generateImage(
    `2D game sprite of a motorcycle rider seen from the front/facing the viewer, riding a delivery motorcycle with box on back, wearing basic helmet, casual clothes, the motorcycle headlight bright, night lighting, transparent background, arcade game style`,
    'moto-sprite-3.png',
    '1024x1024'
  );

  console.log('\n=== GENERATING CITY BACKGROUNDS ===\n');

  await generateImage(
    `Wide street view at night in Rio de Janeiro Brazil, perspective looking down a city street, Copacabana or Ipanema area, palm trees on sides, Christ the Redeemer statue visible in the distance on Corcovado mountain, favela lights on hills, tropical atmosphere, wet asphalt reflecting neon lights, arcade racing game background style, vibrant colors, 16:9 aspect ratio, no vehicles or people`,
    'bg-rio.png',
    '1792x1024'
  );

  await generateImage(
    `Wide street view at night in New York City Times Square area, perspective looking down a city street, tall buildings with billboards and neon signs on both sides, Empire State Building visible in distance, steam rising from manholes, yellow taxi cab colors reflected, wet asphalt, arcade racing game background style, vibrant city lights, 16:9 aspect ratio, no vehicles or people`,
    'bg-newyork.png',
    '1792x1024'
  );

  await generateImage(
    `Wide street view at night in Tokyo Japan Shibuya or Akihabara area, perspective looking down a city street, buildings covered in Japanese neon signs with kanji and anime advertisements, Tokyo Tower or Skytree visible in distance, cherry blossom petals, vending machines glowing, wet asphalt reflecting lights, arcade racing game background style, cyberpunk atmosphere, 16:9 aspect ratio, no vehicles or people`,
    'bg-tokyo.png',
    '1792x1024'
  );

  await generateImage(
    `Wide street view at night in Paris France Champs-Elysees area, perspective looking down a grand boulevard, Eiffel Tower lit up visible in the distance, classic Haussmann buildings on sides, Art Nouveau metro signs, romantic streetlamps, cafe terraces, wet cobblestone reflecting lights, arcade racing game background style, elegant atmosphere, 16:9 aspect ratio, no vehicles or people`,
    'bg-paris.png',
    '1792x1024'
  );

  await generateImage(
    `Wide street view at night in Dubai UAE Sheikh Zayed Road area, perspective looking down a modern highway, Burj Khalifa tower dominating the skyline in distance, futuristic skyscrapers on sides, palm tree lined boulevard, golden desert sand particles in air, luxury atmosphere, wet asphalt reflecting city lights, arcade racing game background style, 16:9 aspect ratio, no vehicles or people`,
    'bg-dubai.png',
    '1792x1024'
  );

  await generateImage(
    `Wide street view at night in Los Angeles USA Hollywood Boulevard area, perspective looking down the street, Hollywood sign visible on hills in distance, palm trees silhouettes, Walk of Fame stars on sidewalk, movie theater marquees, spotlight beams in sky, sunset boulevard vibes, wet asphalt reflecting neon, arcade racing game background style, 16:9 aspect ratio, no vehicles or people`,
    'bg-losangeles.png',
    '1792x1024'
  );

  console.log('\n=== ASSET GENERATION COMPLETE ===');
  console.log(`Assets saved to: ${ASSETS_DIR}`);
}

main().catch(console.error);
