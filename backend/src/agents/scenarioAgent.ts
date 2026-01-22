import { MELONARY_STYLE, AssetRequest } from './types';
import { artDirector } from './artDirector';

export class ScenarioAgent {
  generatePrompt(request: AssetRequest): string {
    const phase = request.phase || 1;
    const basePrompt = artDirector.generateBasePrompt('background', phase);
    
    const phaseData = MELONARY_STYLE.background.phases[phase as keyof typeof MELONARY_STYLE.background.phases];
    
    let specificPrompt = basePrompt;
    
    if (phaseData) {
      specificPrompt += ` Scene: ${phaseData.name}. `;
      
      switch (phase) {
        case 1:
          specificPrompt += `Urban Brazilian street at golden hour. Colorful buildings, graffiti art, asphalt road. Warm sunset lighting with orange and gold tones.`;
          break;
        case 2:
          specificPrompt += `Open highway stretching into distance. Motion blur on sides, clear sky, road signs. Speed and freedom feeling.`;
          break;
        case 3:
          specificPrompt += `Busy downtown with tall buildings. Traffic, pedestrians silhouettes, urban chaos. Dynamic and energetic.`;
          break;
        case 4:
          specificPrompt += `Coastal road with palm trees. Blue ocean visible, sunny day, beach vibes. Relaxed but active atmosphere.`;
          break;
        case 5:
          specificPrompt += `Nighttime city with neon signs. Wet streets reflecting lights, cyberpunk influence. Mysterious and cool.`;
          break;
        case 6:
          specificPrompt += `Abstract infinite road. Cosmic elements, golden energy, transcendent. Epic and legendary feeling.`;
          break;
      }
    }
    
    specificPrompt += ` Horizontal scrolling game background, 1920x1080, seamless loop preferred.`;
    
    return specificPrompt;
  }
  
  getPhaseBackgrounds(): { phase: number; name: string; count: number }[] {
    return [
      { phase: 1, name: 'street', count: 3 },
      { phase: 2, name: 'highway', count: 2 },
      { phase: 3, name: 'city', count: 3 },
      { phase: 4, name: 'beach', count: 2 },
      { phase: 5, name: 'night', count: 3 },
      { phase: 6, name: 'endless', count: 1 }
    ];
  }
}

export const scenarioAgent = new ScenarioAgent();
