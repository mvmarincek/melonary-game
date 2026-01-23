import { query, queryOne, execute } from '../config/database';
import { GameSession, GameAction } from './types';
import { v4 as uuid } from 'uuid';

export async function createSession(userId: string): Promise<GameSession> {
  const id = uuid();
  const result = await queryOne<GameSession>(`
    INSERT INTO game_sessions (id, user_id)
    VALUES ($1, $2)
    RETURNING *
  `, [id, userId]);
  return result!;
}

export async function getSession(sessionId: string): Promise<GameSession | null> {
  return queryOne<GameSession>('SELECT * FROM game_sessions WHERE id = $1', [sessionId]);
}

export async function updateSession(sessionId: string, data: Partial<GameSession>): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.score !== undefined) { updates.push(`score = $${idx++}`); values.push(data.score); }
  if (data.phase_reached !== undefined) { updates.push(`phase_reached = $${idx++}`); values.push(data.phase_reached); }
  if (data.combo_max !== undefined) { updates.push(`combo_max = $${idx++}`); values.push(data.combo_max); }
  if (data.kicks_total !== undefined) { updates.push(`kicks_total = $${idx++}`); values.push(data.kicks_total); }
  if (data.kicks_hit !== undefined) { updates.push(`kicks_hit = $${idx++}`); values.push(data.kicks_hit); }
  if (data.kicks_perfect !== undefined) { updates.push(`kicks_perfect = $${idx++}`); values.push(data.kicks_perfect); }
  if (data.ended_at !== undefined) { updates.push(`ended_at = $${idx++}`); values.push(data.ended_at); }

  if (updates.length > 0) {
    values.push(sessionId);
    await execute(`UPDATE game_sessions SET ${updates.join(', ')} WHERE id = $${idx}`, values);
  }
}

export async function endSession(sessionId: string): Promise<GameSession | null> {
  await execute(`
    UPDATE game_sessions 
    SET ended_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
    WHERE id = $1
  `, [sessionId]);
  return getSession(sessionId);
}

export async function recordAction(sessionId: string, action: {
  action_type: 'kick' | 'miss' | 'phase_up' | 'combo';
  target_type?: string;
  result: 'hit' | 'miss' | 'perfect';
  points_earned: number;
  combo_count: number;
}): Promise<GameAction> {
  const id = uuid();
  const result = await queryOne<GameAction>(`
    INSERT INTO game_actions (id, session_id, action_type, target_type, result, points_earned, combo_count)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [id, sessionId, action.action_type, action.target_type, action.result, action.points_earned, action.combo_count]);
  return result!;
}

export async function getGlobalRanking(limit: number = 100): Promise<any[]> {
  return query(`
    SELECT ROW_NUMBER() OVER (ORDER BY total_score DESC) as position,
           id as user_id, username, total_score as score, current_phase as phase, highest_combo as combo
    FROM users
    ORDER BY total_score DESC
    LIMIT $1
  `, [limit]);
}

export async function getWeeklyRanking(limit: number = 100): Promise<any[]> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  return query(`
    SELECT ROW_NUMBER() OVER (ORDER BY ws.score DESC) as position,
           u.id as user_id, u.username, ws.score, u.current_phase as phase, u.highest_combo as combo
    FROM weekly_scores ws
    JOIN users u ON u.id = ws.user_id
    WHERE ws.week_start >= $1
    ORDER BY ws.score DESC
    LIMIT $2
  `, [weekStart, limit]);
}

export async function updateWeeklyScore(userId: string, score: number): Promise<void> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  await execute(`
    INSERT INTO weekly_scores (id, user_id, week_start, score, games_count)
    VALUES ($1, $2, $3, $4, 1)
    ON CONFLICT (user_id, week_start) 
    DO UPDATE SET score = weekly_scores.score + $4, games_count = weekly_scores.games_count + 1
  `, [uuid(), userId, weekStart, score]);
}
