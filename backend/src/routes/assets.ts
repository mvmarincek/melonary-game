import { Router } from 'express';
import { getAssetsByType } from '../models/asset';
import { query } from '../config/database';

const router = Router();

router.get('/character', async (req, res) => {
  try {
    const phase = req.query.phase ? parseInt(req.query.phase as string) : undefined;
    const assets = await getAssetsByType('character', phase);
    res.json(assets);
  } catch (error) {
    console.error('Character assets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/enemy', async (req, res) => {
  try {
    const phase = req.query.phase ? parseInt(req.query.phase as string) : undefined;
    const assets = await getAssetsByType('enemy', phase);
    res.json(assets);
  } catch (error) {
    console.error('Enemy assets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/background', async (req, res) => {
  try {
    const phase = req.query.phase ? parseInt(req.query.phase as string) : undefined;
    const assets = await getAssetsByType('background', phase);
    res.json(assets);
  } catch (error) {
    console.error('Background assets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const assets = await query('SELECT * FROM assets WHERE is_active = true ORDER BY type, phase, name');
    res.json(assets);
  } catch (error) {
    console.error('All assets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
