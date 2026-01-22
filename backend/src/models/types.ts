export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password_hash: string;
  x_username?: string;
  tiktok_username?: string;
  language: 'en' | 'pt' | 'es';
  is_admin: boolean;
  total_score: number;
  current_phase: number;
  games_played: number;
  highest_combo: number;
  sound_enabled: boolean;
  music_volume: number;
  sfx_volume: number;
  created_at: Date;
  last_login: Date;
}

export interface GameSession {
  id: string;
  user_id: string;
  score: number;
  phase_reached: number;
  combo_max: number;
  kicks_total: number;
  kicks_hit: number;
  kicks_perfect: number;
  duration_seconds: number;
  started_at: Date;
  ended_at?: Date;
}

export interface GameAction {
  id: string;
  session_id: string;
  action_type: 'kick' | 'miss' | 'phase_up' | 'combo';
  target_type?: string;
  result: 'hit' | 'miss' | 'perfect';
  points_earned: number;
  combo_count: number;
  timestamp: Date;
}

export interface Phase {
  id: number;
  name: string;
  description: string;
  background_url?: string;
  enemy_speed_multiplier: number;
  spawn_rate: number;
  points_multiplier: number;
  required_score: number;
  enemy_types: string[];
}

export interface Asset {
  id: string;
  type: 'character' | 'enemy' | 'background' | 'effect' | 'ui';
  name: string;
  url: string;
  cloudinary_id: string;
  phase?: number;
  tags: string[];
  version: number;
  is_active: boolean;
  created_at: Date;
}

export interface Ranking {
  position: number;
  user_id: string;
  username: string;
  score: number;
  phase: number;
}

export interface WeeklyScore {
  id: string;
  user_id: string;
  week_start: Date;
  score: number;
  games_count: number;
}
