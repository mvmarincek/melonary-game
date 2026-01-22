import { AssetResult } from './types';

export class QualityAgent {
  validateAsset(
    imageUrl: string,
    expectedType: 'character' | 'enemy' | 'background' | 'effect',
    metadata: {
      width?: number;
      height?: number;
      format?: string;
      hasTransparency?: boolean;
    }
  ): AssetResult {
    const issues: string[] = [];
    const suggestedTags: string[] = [expectedType];
    
    if (expectedType === 'character' || expectedType === 'enemy' || expectedType === 'effect') {
      if (metadata.format && metadata.format !== 'png') {
        issues.push('Sprites should be PNG format');
      }
      if (metadata.hasTransparency === false) {
        issues.push('Sprites should have transparent background');
      }
      if (metadata.width && metadata.height) {
        if (metadata.width !== metadata.height) {
          issues.push('Sprites should be square (e.g., 512x512)');
        }
        if (metadata.width < 256) {
          issues.push('Sprite resolution too low, minimum 256x256');
        }
      }
      suggestedTags.push('sprite', 'game-asset');
    }
    
    if (expectedType === 'background') {
      if (metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height;
        if (aspectRatio < 1.5) {
          issues.push('Background should be widescreen (16:9 or similar)');
        }
        if (metadata.width < 1280) {
          issues.push('Background resolution too low, minimum 1280px width');
        }
      }
      suggestedTags.push('background', 'game-asset', 'scrolling');
    }
    
    const approved = issues.length === 0;
    
    return {
      approved,
      prompt: '',
      reason: approved ? 'Asset meets quality standards' : issues.join('; '),
      suggestedTags
    };
  }
  
  checkConsistency(assets: { type: string; url: string; tags: string[] }[]): {
    consistent: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    const characterAssets = assets.filter(a => a.type === 'character');
    const enemyAssets = assets.filter(a => a.type === 'enemy');
    const backgroundAssets = assets.filter(a => a.type === 'background');
    
    if (characterAssets.length < 5) {
      issues.push('Need at least 5 character sprites for smooth animation');
    }
    if (enemyAssets.length < 3) {
      issues.push('Need at least 3 enemy variants');
    }
    if (backgroundAssets.length < 6) {
      issues.push('Need at least 1 background per phase (6 phases)');
    }
    
    return {
      consistent: issues.length === 0,
      issues
    };
  }
}

export const qualityAgent = new QualityAgent();
