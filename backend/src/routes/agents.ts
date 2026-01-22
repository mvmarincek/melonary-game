import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { artDirector } from '../agents/artDirector';
import { characterAgent } from '../agents/characterAgent';
import { scenarioAgent } from '../agents/scenarioAgent';
import { qualityAgent } from '../agents/qualityAgent';
import { createAsset, getActiveAssets } from '../models/asset';
import { uploadImage } from '../config/cloudinary';
import { AssetRequest } from '../agents/types';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/style-guide', async (req: AuthRequest, res: Response) => {
  try {
    const styleGuide = artDirector.getStyleGuidelines();
    res.json(styleGuide);
  } catch (error) {
    console.error('Style guide error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/generate-prompt', async (req: AuthRequest, res: Response) => {
  try {
    const request: AssetRequest = req.body;
    
    let prompt: string;
    
    switch (request.type) {
      case 'character':
        prompt = characterAgent.generatePrompt(request);
        break;
      case 'background':
        prompt = scenarioAgent.generatePrompt(request);
        break;
      case 'enemy':
        prompt = artDirector.generateBasePrompt('enemy');
        break;
      default:
        prompt = artDirector.generateBasePrompt('character');
    }
    
    const validation = artDirector.validateStyle(prompt);
    
    res.json({
      prompt,
      validation,
      request
    });
  } catch (error) {
    console.error('Generate prompt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/character-sprites', async (req: AuthRequest, res: Response) => {
  try {
    const spriteList = characterAgent.generateSpriteSheet();
    const prompts = spriteList.map(name => ({
      name,
      prompt: characterAgent.generatePrompt({ type: 'character', name })
    }));
    res.json(prompts);
  } catch (error) {
    console.error('Character sprites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/background-list', async (req: AuthRequest, res: Response) => {
  try {
    const backgrounds = scenarioAgent.getPhaseBackgrounds();
    const prompts = backgrounds.map(bg => ({
      ...bg,
      prompt: scenarioAgent.generatePrompt({ type: 'background', name: bg.name, phase: bg.phase })
    }));
    res.json(prompts);
  } catch (error) {
    console.error('Background list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/validate', async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl, type, metadata } = req.body;
    const result = qualityAgent.validateAsset(imageUrl, type, metadata || {});
    res.json(result);
  } catch (error) {
    console.error('Validate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/check-consistency', async (req: AuthRequest, res: Response) => {
  try {
    const assets = await getActiveAssets();
    const result = qualityAgent.checkConsistency(assets);
    res.json(result);
  } catch (error) {
    console.error('Check consistency error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/upload-asset', async (req: AuthRequest, res: Response) => {
  try {
    const { type, name, imagePath, phase, tags } = req.body;
    
    const uploadResult = await uploadImage(imagePath, {
      folder: type,
      publicId: name,
      tags: tags || []
    });
    
    const asset = await createAsset({
      type,
      name,
      url: uploadResult.url,
      cloudinary_id: uploadResult.publicId,
      phase,
      tags
    });
    
    res.status(201).json(asset);
  } catch (error) {
    console.error('Upload asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
