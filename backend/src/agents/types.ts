export interface AgentPrompt {
  role: string;
  context: string;
  instructions: string[];
  outputFormat: string;
}

export interface AssetRequest {
  type: 'character' | 'enemy' | 'background' | 'effect';
  name: string;
  phase?: number;
  style?: string;
  tags?: string[];
}

export interface AssetResult {
  approved: boolean;
  prompt: string;
  reason?: string;
  suggestedTags: string[];
}

export const MELONARY_STYLE = {
  character: {
    colors: ['golden', 'caramel', 'amber', 'bronze'],
    traits: ['muscular', 'confident', 'sunglasses', 'leather armor', 'gold chains', 'skull emblem'],
    mood: ['badass', 'heroic', 'meme', 'funny', 'determined'],
    pose: ['flying kick', 'standing ready', 'victory pose', 'running']
  },
  enemy: {
    types: ['biker', 'fast_biker', 'armored_biker', 'boss'],
    traits: ['on motorcycle', 'menacing', 'leather jacket', 'helmet'],
    variations: ['different colors', 'different bikes', 'varying sizes']
  },
  background: {
    phases: {
      1: { name: 'Street', elements: ['urban street', 'graffiti', 'sidewalks', 'sunset'] },
      2: { name: 'Highway', elements: ['open road', 'speed lines', 'highway signs', 'motion blur'] },
      3: { name: 'City Center', elements: ['skyscrapers', 'busy streets', 'traffic', 'downtown'] },
      4: { name: 'Beach Road', elements: ['palm trees', 'ocean', 'sunny', 'coastal road'] },
      5: { name: 'Night City', elements: ['neon lights', 'dark sky', 'city lights', 'rain'] },
      6: { name: 'Endless', elements: ['abstract', 'cosmic', 'infinite road', 'golden aura'] }
    }
  },
  general: {
    artStyle: '2D cartoon with semi-realistic shading, vibrant colors, meme-friendly',
    resolution: '512x512 for sprites, 1920x1080 for backgrounds',
    format: 'PNG with transparency for characters/enemies'
  }
};
