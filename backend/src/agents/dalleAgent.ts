import OpenAI from 'openai';
import { uploadImage } from '../config/cloudinary';
import { createAsset } from '../models/asset';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ImageGenerationRequest {
  type: 'background' | 'character' | 'enemy' | 'effect';
  name: string;
  prompt: string;
  phase?: number;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
}

export interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}

export class DalleAgent {
  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const size = request.size || (request.type === 'background' ? '1792x1024' : '1024x1024');
    const style = request.style || 'vivid';

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: request.prompt,
      n: 1,
      size,
      style,
      quality: 'standard',
    });

    return {
      url: response.data[0].url!,
      revisedPrompt: response.data[0].revised_prompt || request.prompt,
    };
  }

  async generateAndSave(request: ImageGenerationRequest): Promise<any> {
    const generated = await this.generateImage(request);

    const uploaded = await uploadImage(generated.url, {
      folder: request.type,
      publicId: request.name,
      tags: [request.type, `phase-${request.phase || 'all'}`],
    });

    const asset = await createAsset({
      type: request.type,
      name: request.name,
      url: uploaded.url,
      cloudinary_id: uploaded.publicId,
      phase: request.phase,
      tags: [request.type, `phase-${request.phase || 'all'}`],
    });

    return {
      asset,
      revisedPrompt: generated.revisedPrompt,
    };
  }

  getCityBackgroundPrompt(city: string, phase: number): string {
    const baseStyle = 'Top-down racing game perspective, night city street scene, neon lights reflecting on wet asphalt, dramatic lighting, arcade game style, vibrant colors';
    
    const cities: Record<string, string> = {
      rio: `${baseStyle}. Rio de Janeiro, Brazil. Copacabana beach road, palm trees silhouettes, Christ the Redeemer statue visible in distance, tropical sunset colors, favela lights on hills, Brazilian street art graffiti on walls`,
      
      newyork: `${baseStyle}. New York City, USA. Times Square area, yellow taxi cabs, Broadway theater signs, Empire State Building silhouette, steam rising from manholes, iconic NYC billboards`,
      
      tokyo: `${baseStyle}. Tokyo, Japan. Shibuya crossing area, Japanese neon signs with kanji, cherry blossom petals falling, Tokyo Tower in background, anime-style advertisements, vending machines glowing`,
      
      paris: `${baseStyle}. Paris, France. Champs-Élysées at night, Eiffel Tower lit up in background, French café terraces, cobblestone streets, Art Nouveau metro signs, romantic streetlamps`,
      
      dubai: `${baseStyle}. Dubai, UAE. Sheikh Zayed Road, Burj Khalifa towering in background, luxury supercars, golden desert sand particles in air, futuristic architecture, palm tree lined boulevards`,
      
      losangeles: `${baseStyle}. Los Angeles, USA. Hollywood Boulevard, Walk of Fame stars on sidewalk, palm trees, Hollywood sign on hills, lowrider cars, sunset boulevard vibes, movie premiere spotlights`,
    };

    return cities[city.toLowerCase()] || cities.rio;
  }

  getExplosionEffectPrompt(): string {
    return 'Cartoon explosion effect, comic book style POW BOOM effect, orange and yellow flames, smoke clouds, debris flying, transparent background, 2D game sprite, vibrant colors, action comic style';
  }

  getMotorcyclePrompt(type: 'normal' | 'fast' | 'armored'): string {
    const base = 'Rear view of motorcycle with rider, arcade game sprite style, transparent background, 2D cartoon';
    
    const types: Record<string, string> = {
      normal: `${base}. Standard street motorcycle, black and chrome, casual rider with helmet, urban biker style`,
      fast: `${base}. Red sport motorcycle, racing style, rider in red leather suit, speed lines effect, aggressive stance`,
      armored: `${base}. Heavy armored motorcycle, military style, rider in tactical gear, thick metal plates, menacing appearance`,
    };

    return types[type];
  }

  getMelonaryPrompt(pose: 'idle' | 'kick' | 'victory'): string {
    const base = 'Caramelo dog character, Brazilian stray dog meme, golden/caramel fur, muscular anthropomorphic dog, wearing cool sunglasses, black leather jacket with gold chains, badass attitude, cartoon style, transparent background';
    
    const poses: Record<string, string> = {
      idle: `${base}. Standing ready pose, confident stance, arms crossed, smirking expression`,
      kick: `${base}. Flying kick pose, dynamic action, leg extended, motion blur effect, POW text effect, attacking movement`,
      victory: `${base}. Victory celebration pose, fist pump in air, triumphant expression, sparkles around`,
    };

    return poses[pose];
  }
}

export const dalleAgent = new DalleAgent();
