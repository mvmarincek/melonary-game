import { AgentPrompt, MELONARY_STYLE } from './types';

export class ArtDirectorAgent {
  private styleGuide = MELONARY_STYLE;
  
  generateBasePrompt(type: 'character' | 'enemy' | 'background', phase?: number): string {
    const base = `Art style: ${this.styleGuide.general.artStyle}. `;
    
    if (type === 'character') {
      const colors = this.styleGuide.character.colors.join(', ');
      const traits = this.styleGuide.character.traits.join(', ');
      return `${base}Melonary the caramelo dog hero. Colors: ${colors}. Traits: ${traits}. Muscular anthropomorphic dog with golden fur, wearing black leather armor with gold accents, skull emblem on chest, sunglasses.`;
    }
    
    if (type === 'enemy') {
      return `${base}Enemy biker character. Human or dog biker on motorcycle. Menacing but cartoonish. Dark colors, leather jacket, helmet optional.`;
    }
    
    if (type === 'background') {
      const phaseNum = phase || 1;
      const phaseData = this.styleGuide.background.phases[phaseNum as keyof typeof this.styleGuide.background.phases];
      if (phaseData) {
        return `${base}Game background for "${phaseData.name}" phase. Elements: ${phaseData.elements.join(', ')}. Horizontal scrolling background, seamless edges preferred.`;
      }
    }
    
    return base;
  }
  
  getStyleGuidelines(): typeof MELONARY_STYLE {
    return this.styleGuide;
  }
  
  validateStyle(description: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const desc = description.toLowerCase();
    
    if (!desc.includes('dog') && !desc.includes('caramelo') && !desc.includes('melonary')) {
      if (description.includes('character')) {
        issues.push('Character should reference Melonary/caramelo dog');
      }
    }
    
    if (desc.includes('realistic') && !desc.includes('semi-realistic')) {
      issues.push('Style should be cartoon/semi-realistic, not fully realistic');
    }
    
    return { valid: issues.length === 0, issues };
  }
}

export const artDirector = new ArtDirectorAgent();
