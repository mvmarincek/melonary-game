import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { gameLimiter } from '../middleware/rateLimiter';
import { createSession, getSession, updateSession, endSession, recordAction, getGlobalRanking, getWeeklyRanking, updateWeeklyScore } from '../models/game';
import { updateUserScore } from '../models/user';
import { query } from '../config/database';
import { Phase } from '../models/types';

const router = Router();

interface GameState {
  sessionId: string;
  score: number;
  combo: number;
  phase: number;
  kicksTotal: number;
  kicksHit: number;
  kicksPerfect: number;
}

const activeSessions = new Map<string, GameState>();

router.post('/start', authenticate, gameLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const session = await createSession(req.user!.id);
    
    const gameState: GameState = {
      sessionId: session.id,
      score: 0,
      combo: 0,
      phase: 1,
      kicksTotal: 0,
      kicksHit: 0,
      kicksPerfect: 0
    };
    
    activeSessions.set(session.id, gameState);
    
    const phases = await query<Phase>('SELECT * FROM phases ORDER BY id');
    
    res.json({
      sessionId: session.id,
      phase: 1,
      phases: phases.map(p => ({
        id: p.id,
        name: p.name,
        speedMultiplier: p.enemy_speed_multiplier,
        spawnRate: p.spawn_rate,
        pointsMultiplier: p.points_multiplier,
        requiredScore: p.required_score,
        enemyTypes: p.enemy_types
      }))
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

const kickSchema = z.object({
  sessionId: z.string().uuid(),
  timing: z.enum(['miss', 'hit', 'perfect']),
  enemyType: z.string().optional()
});

router.post('/kick', authenticate, gameLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const data = kickSchema.parse(req.body);
    
    const gameState = activeSessions.get(data.sessionId);
    if (!gameState) {
      return res.status(400).json({ error: 'Invalid session' });
    }
    
    const session = await getSession(data.sessionId);
    if (!session || session.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const phases = await query<Phase>('SELECT * FROM phases WHERE id = $1', [gameState.phase]);
    const currentPhase = phases[0];
    const pointsMultiplier = currentPhase?.points_multiplier || 1;
    
    let pointsEarned = 0;
    let comboBreak = false;
    
    gameState.kicksTotal++;
    
    if (data.timing === 'miss') {
      comboBreak = gameState.combo > 0;
      gameState.combo = 0;
      pointsEarned = 0;
    } else if (data.timing === 'hit') {
      gameState.combo++;
      gameState.kicksHit++;
      const basePoints = 100;
      const comboBonus = Math.min(gameState.combo * 10, 200);
      pointsEarned = Math.floor((basePoints + comboBonus) * pointsMultiplier);
    } else if (data.timing === 'perfect') {
      gameState.combo++;
      gameState.kicksHit++;
      gameState.kicksPerfect++;
      const basePoints = 200;
      const comboBonus = Math.min(gameState.combo * 20, 400);
      pointsEarned = Math.floor((basePoints + comboBonus) * pointsMultiplier);
    }
    
    gameState.score += pointsEarned;
    
    let phaseUp = false;
    const nextPhases = await query<Phase>('SELECT * FROM phases WHERE id = $1', [gameState.phase + 1]);
    if (nextPhases.length > 0 && gameState.score >= nextPhases[0].required_score) {
      gameState.phase++;
      phaseUp = true;
    }
    
    await recordAction(data.sessionId, {
      action_type: 'kick',
      target_type: data.enemyType,
      result: data.timing,
      points_earned: pointsEarned,
      combo_count: gameState.combo
    });
    
    await updateSession(data.sessionId, {
      score: gameState.score,
      phase_reached: gameState.phase,
      combo_max: Math.max(session.combo_max, gameState.combo),
      kicks_total: gameState.kicksTotal,
      kicks_hit: gameState.kicksHit,
      kicks_perfect: gameState.kicksPerfect
    });
    
    res.json({
      result: data.timing,
      pointsEarned,
      totalScore: gameState.score,
      combo: gameState.combo,
      comboBreak,
      phaseUp,
      currentPhase: gameState.phase
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    console.error('Kick error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/end', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, score, phase, combo, kicksTotal, kicksHit } = req.body;
    
    const finalScore = score || 0;
    const finalPhase = phase || 1;
    const finalCombo = combo || 0;
    const totalKicks = kicksTotal || 0;
    const hitKicks = kicksHit || 0;
    
    if (sessionId) {
      const gameState = activeSessions.get(sessionId);
      if (gameState) {
        activeSessions.delete(sessionId);
      }
      try {
        await endSession(sessionId);
      } catch {}
    }
    
    await updateUserScore(req.user!.id, finalScore, finalPhase, finalCombo);
    await updateWeeklyScore(req.user!.id, finalScore);
    
    const accuracy = totalKicks > 0 ? Math.round((hitKicks / totalKicks) * 100) : 0;
    const isNewRecord = finalScore > 0;
    
    res.json({
      finalScore,
      phaseReached: finalPhase,
      maxCombo: finalCombo,
      kicksTotal: totalKicks,
      kicksHit: hitKicks,
      accuracy,
      newRecord: isNewRecord
    });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/ranking/global', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const ranking = await getGlobalRanking(limit);
    res.json(ranking);
  } catch (error) {
    console.error('Ranking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/ranking/weekly', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const ranking = await getWeeklyRanking(limit);
    res.json(ranking);
  } catch (error) {
    console.error('Weekly ranking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/phases', async (req, res) => {
  try {
    const phases = await query<Phase>('SELECT * FROM phases ORDER BY id');
    res.json(phases);
  } catch (error) {
    console.error('Phases error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
