import { query, queryOne, execute } from '../config/database';
import { User } from './types';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export async function createUser(data: {
  name: string;
  email: string;
  username: string;
  password: string;
  language?: 'en' | 'pt' | 'es';
  x_username?: string;
  tiktok_username?: string;
}): Promise<User> {
  const id = uuid();
  const password_hash = await bcrypt.hash(data.password, 10);
  
  const result = await queryOne<User>(`
    INSERT INTO users (id, name, email, username, password_hash, language, x_username, tiktok_username)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [id, data.name, data.email.toLowerCase(), data.username, password_hash, data.language || 'en', data.x_username, data.tiktok_username]);
  
  return result!;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
}

export async function findUserByUsername(username: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE username = $1', [username]);
}

export async function findUserById(id: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

export async function updateUserScore(userId: string, score: number, phase: number, combo: number): Promise<void> {
  await execute(`
    UPDATE users 
    SET total_score = total_score + $2,
        current_phase = GREATEST(current_phase, $3),
        highest_combo = GREATEST(highest_combo, $4),
        games_played = games_played + 1
    WHERE id = $1
  `, [userId, score, phase, combo]);
}

export async function updateLastLogin(userId: string): Promise<void> {
  await execute('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
}

export async function updateUserSettings(userId: string, settings: {
  language?: 'en' | 'pt' | 'es';
  sound_enabled?: boolean;
  music_volume?: number;
  sfx_volume?: number;
}): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (settings.language !== undefined) {
    updates.push(`language = $${idx++}`);
    values.push(settings.language);
  }
  if (settings.sound_enabled !== undefined) {
    updates.push(`sound_enabled = $${idx++}`);
    values.push(settings.sound_enabled);
  }
  if (settings.music_volume !== undefined) {
    updates.push(`music_volume = $${idx++}`);
    values.push(settings.music_volume);
  }
  if (settings.sfx_volume !== undefined) {
    updates.push(`sfx_volume = $${idx++}`);
    values.push(settings.sfx_volume);
  }

  if (updates.length > 0) {
    values.push(userId);
    await execute(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`, values);
  }
}

export async function getAllUsers(page: number = 1, limit: number = 50, search?: string): Promise<{ users: User[]; total: number }> {
  let whereClause = '';
  const params: any[] = [];
  
  if (search) {
    whereClause = 'WHERE name ILIKE $1 OR email ILIKE $1 OR username ILIKE $1';
    params.push(`%${search}%`);
  }
  
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  
  const users = await query<User>(`
    SELECT * FROM users 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);
  
  const countParams = search ? [`%${search}%`] : [];
  const countResult = await queryOne<{ count: string }>(`
    SELECT COUNT(*) as count FROM users ${whereClause}
  `, countParams);
  
  return { users, total: parseInt(countResult?.count || '0') };
}

export async function getUsersForExport(): Promise<User[]> {
  return query<User>(`
    SELECT id, name, email, username, x_username, tiktok_username, language,
           total_score, current_phase, games_played, highest_combo,
           created_at, last_login
    FROM users
    ORDER BY created_at DESC
  `);
}
