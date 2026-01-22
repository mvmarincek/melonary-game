import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { getAllUsers, getUsersForExport } from '../models/user';
import { getActiveAssets, createAsset, updateAsset, deactivateAsset } from '../models/asset';
import { query } from '../config/database';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const search = req.query.search as string;
    
    const { users, total } = await getAllUsers(page, limit, search);
    
    res.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        x_username: u.x_username,
        tiktok_username: u.tiktok_username,
        language: u.language,
        total_score: u.total_score,
        current_phase: u.current_phase,
        games_played: u.games_played,
        highest_combo: u.highest_combo,
        created_at: u.created_at,
        last_login: u.last_login
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users/export', async (req: AuthRequest, res: Response) => {
  try {
    const users = await getUsersForExport();
    
    const headers = [
      'ID',
      'Name',
      'Email',
      'Username',
      'X Username',
      'TikTok Username',
      'Language',
      'Total Score',
      'Current Phase',
      'Games Played',
      'Highest Combo',
      'Created At',
      'Last Login'
    ];
    
    const rows = users.map(u => [
      u.id,
      u.name,
      u.email,
      u.username,
      u.x_username || '',
      u.tiktok_username || '',
      u.language,
      u.total_score.toString(),
      u.current_phase.toString(),
      u.games_played.toString(),
      u.highest_combo.toString(),
      new Date(u.created_at).toISOString(),
      new Date(u.last_login).toISOString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=melonary-users-${new Date().toISOString().split('T')[0]}.csv`);
    res.send('\ufeff' + csvContent);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const usersCount = await query<{ count: string }>('SELECT COUNT(*) as count FROM users');
    const gamesCount = await query<{ count: string }>('SELECT COUNT(*) as count FROM game_sessions');
    const totalScore = await query<{ sum: string }>('SELECT COALESCE(SUM(total_score), 0) as sum FROM users');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyUsers = await query<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE created_at >= $1', [today]);
    const dailyGames = await query<{ count: string }>('SELECT COUNT(*) as count FROM game_sessions WHERE started_at >= $1', [today]);
    
    res.json({
      totalUsers: parseInt(usersCount[0]?.count || '0'),
      totalGames: parseInt(gamesCount[0]?.count || '0'),
      totalScore: parseInt(totalScore[0]?.sum || '0'),
      dailyNewUsers: parseInt(dailyUsers[0]?.count || '0'),
      dailyGamesPlayed: parseInt(dailyGames[0]?.count || '0')
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/assets', async (req: AuthRequest, res: Response) => {
  try {
    const assets = await getActiveAssets();
    res.json(assets);
  } catch (error) {
    console.error('Assets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/assets', async (req: AuthRequest, res: Response) => {
  try {
    const { type, name, url, cloudinary_id, phase, tags } = req.body;
    const asset = await createAsset({ type, name, url, cloudinary_id, phase, tags });
    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/assets/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { url, is_active, version, tags } = req.body;
    await updateAsset(id, { url, is_active, version, tags });
    res.json({ success: true });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/assets/:id', async (req: AuthRequest, res: Response) => {
  try {
    await deactivateAsset(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
