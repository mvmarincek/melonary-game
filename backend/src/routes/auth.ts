import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { createUser, findUserByEmail, findUserByUsername, validatePassword, updateLastLogin, updateUserSettings } from '../models/user';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { query, execute } from '../config/database';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(100),
  language: z.enum(['en', 'pt', 'es']).optional(),
  x_username: z.string().max(50).optional(),
  tiktok_username: z.string().max(50).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign({ userId }, secret, { expiresIn: 604800 });
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    const existingEmail = await findUserByEmail(data.email);
    if (existingEmail) {
      return res.status(400).json({ error: 'auth.email_exists' });
    }
    
    const existingUsername = await findUserByUsername(data.username);
    if (existingUsername) {
      return res.status(400).json({ error: 'auth.username_exists' });
    }
    
    const user = await createUser({
      name: data.name,
      email: data.email,
      username: data.username,
      password: data.password,
      language: data.language,
      x_username: data.x_username,
      tiktok_username: data.tiktok_username
    });
    
    const token = signToken(user.id);
    
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        language: user.language,
        total_score: user.total_score,
        current_phase: user.current_phase,
        sound_enabled: user.sound_enabled,
        music_volume: user.music_volume,
        sfx_volume: user.sfx_volume
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = await findUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ error: 'auth.invalid_credentials' });
    }
    
    const valid = await validatePassword(user, data.password);
    if (!valid) {
      return res.status(401).json({ error: 'auth.invalid_credentials' });
    }
    
    await updateLastLogin(user.id);
    
    const token = signToken(user.id);
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        language: user.language,
        total_score: user.total_score,
        current_phase: user.current_phase,
        highest_combo: user.highest_combo,
        games_played: user.games_played,
        sound_enabled: user.sound_enabled,
        music_volume: user.music_volume,
        sfx_volume: user.sfx_volume,
        is_admin: user.is_admin
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    language: user.language,
    total_score: user.total_score,
    current_phase: user.current_phase,
    highest_combo: user.highest_combo,
    games_played: user.games_played,
    sound_enabled: user.sound_enabled,
    music_volume: user.music_volume,
    sfx_volume: user.sfx_volume,
    is_admin: user.is_admin
  });
});

router.put('/settings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const settingsSchema = z.object({
      language: z.enum(['en', 'pt', 'es']).optional(),
      sound_enabled: z.boolean().optional(),
      music_volume: z.number().min(0).max(1).optional(),
      sfx_volume: z.number().min(0).max(1).optional()
    });
    
    const settings = settingsSchema.parse(req.body);
    await updateUserSettings(req.user!.id, settings);
    
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid settings' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/setup-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@melonary.game';
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    const existing = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existing.length > 0) {
      await execute('UPDATE users SET password_hash = $1, is_admin = true WHERE email = $2', [passwordHash, adminEmail]);
      res.json({ success: true, message: 'Admin password reset', email: adminEmail, password: adminPassword });
    } else {
      await execute(`
        INSERT INTO users (id, name, email, username, password_hash, is_admin, language)
        VALUES ($1, 'Admin', $2, 'admin', $3, true, 'en')
      `, [uuid(), adminEmail, passwordHash]);
      res.json({ success: true, message: 'Admin created', email: adminEmail, password: adminPassword });
    }
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
