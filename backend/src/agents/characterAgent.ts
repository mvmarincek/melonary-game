import { MELONARY_STYLE, AssetRequest } from './types';
import { artDirector } from './artDirector';

export class CharacterAgent {
  generatePrompt(request: AssetRequest): string {
    const basePrompt = artDirector.generateBasePrompt('character');
    
    const poses = MELONARY_STYLE.character.pose;
    const moods = MELONARY_STYLE.character.mood;
    
    let specificPrompt = basePrompt;
    
    if (request.name.includes('kick') || request.name.includes('attack')) {
      specificPrompt += ` Pose: Flying kick attack, dynamic action pose, motion lines. Mood: determined, powerful.`;
    } else if (request.name.includes('idle') || request.name.includes('stand')) {
      specificPrompt += ` Pose: Standing ready, arms crossed or fists up. Mood: confident, badass.`;
    } else if (request.name.includes('victory') || request.name.includes('win')) {
      specificPrompt += ` Pose: Victory celebration, thumbs up or fist pump. Mood: triumphant, happy.`;
    } else if (request.name.includes('run') || request.name.includes('move')) {
      specificPrompt += ` Pose: Running or dashing forward. Mood: focused, fast.`;
    } else if (request.name.includes('hurt') || request.name.includes('damage')) {
      specificPrompt += ` Pose: Taking damage, knocked back. Mood: surprised but resilient.`;
    }
    
    if (request.phase && request.phase > 3) {
      specificPrompt += ` Enhanced armor with glowing effects for late-game power.`;
    }
    
    specificPrompt += ` PNG with transparent background, game sprite format, 512x512.`;
    
    return specificPrompt;
  }
  
  generateSpriteSheet(): string[] {
    return [
      'melonary_idle_1',
      'melonary_idle_2',
      'melonary_run_1',
      'melonary_run_2',
      'melonary_run_3',
      'melonary_kick_windup',
      'melonary_kick_impact',
      'melonary_kick_follow',
      'melonary_victory',
      'melonary_hurt'
    ];
  }
}

export const characterAgent = new CharacterAgent();
