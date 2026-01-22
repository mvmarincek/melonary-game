import { execute, query } from '../config/database';

export async function runMigrations(): Promise<void> {
  console.log('Running database migrations...');

  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      x_username VARCHAR(50),
      tiktok_username VARCHAR(50),
      language VARCHAR(5) DEFAULT 'en',
      is_admin BOOLEAN DEFAULT false,
      total_score BIGINT DEFAULT 0,
      current_phase INTEGER DEFAULT 1,
      games_played INTEGER DEFAULT 0,
      highest_combo INTEGER DEFAULT 0,
      sound_enabled BOOLEAN DEFAULT true,
      music_volume DECIMAL(3,2) DEFAULT 0.7,
      sfx_volume DECIMAL(3,2) DEFAULT 0.8,
      created_at TIMESTAMP DEFAULT NOW(),
      last_login TIMESTAMP DEFAULT NOW()
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      score BIGINT DEFAULT 0,
      phase_reached INTEGER DEFAULT 1,
      combo_max INTEGER DEFAULT 0,
      kicks_total INTEGER DEFAULT 0,
      kicks_hit INTEGER DEFAULT 0,
      kicks_perfect INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      started_at TIMESTAMP DEFAULT NOW(),
      ended_at TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS game_actions (
      id UUID PRIMARY KEY,
      session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
      action_type VARCHAR(20) NOT NULL,
      target_type VARCHAR(50),
      result VARCHAR(20) NOT NULL,
      points_earned INTEGER DEFAULT 0,
      combo_count INTEGER DEFAULT 0,
      timestamp TIMESTAMP DEFAULT NOW()
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS phases (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      background_url TEXT,
      enemy_speed_multiplier DECIMAL(3,2) DEFAULT 1.0,
      spawn_rate DECIMAL(3,2) DEFAULT 1.0,
      points_multiplier DECIMAL(3,2) DEFAULT 1.0,
      required_score INTEGER DEFAULT 0,
      enemy_types TEXT[] DEFAULT '{}'
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS assets (
      id UUID PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      url TEXT NOT NULL,
      cloudinary_id VARCHAR(255) NOT NULL,
      phase INTEGER,
      tags TEXT[] DEFAULT '{}',
      version INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS weekly_scores (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      score BIGINT DEFAULT 0,
      games_count INTEGER DEFAULT 0,
      UNIQUE(user_id, week_start)
    )
  `);

  await execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await execute(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  await execute(`CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC)`);
  await execute(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON game_sessions(user_id)`);
  await execute(`CREATE INDEX IF NOT EXISTS idx_actions_session ON game_actions(session_id)`);
  await execute(`CREATE INDEX IF NOT EXISTS idx_weekly_scores_week ON weekly_scores(week_start, score DESC)`);
  await execute(`CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type, is_active)`);

  console.log('Migrations completed successfully!');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
