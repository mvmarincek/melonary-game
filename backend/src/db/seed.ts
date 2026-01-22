import { execute, query } from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export async function seedDatabase(): Promise<void> {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@melonary.game';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  
  if (existingAdmin.length === 0) {
    await execute(`
      INSERT INTO users (id, name, email, username, password_hash, is_admin, language)
      VALUES ($1, 'Admin', $2, 'admin', $3, true, 'en')
    `, [uuid(), adminEmail, passwordHash]);
    console.log('Admin user created');
  }

  const existingPhases = await query('SELECT id FROM phases');
  
  if (existingPhases.length === 0) {
    const phases = [
      { name: 'Street', description: 'The streets where it all began', speed: 1.0, spawn: 1.0, points: 1.0, required: 0, enemies: ['biker'] },
      { name: 'Highway', description: 'Fast lanes, faster bikers', speed: 1.2, spawn: 1.1, points: 1.2, required: 1000, enemies: ['biker', 'fast_biker'] },
      { name: 'City Center', description: 'Downtown chaos', speed: 1.4, spawn: 1.2, points: 1.5, required: 3000, enemies: ['biker', 'fast_biker', 'armored_biker'] },
      { name: 'Beach Road', description: 'Sunny showdown', speed: 1.5, spawn: 1.3, points: 1.8, required: 6000, enemies: ['fast_biker', 'armored_biker'] },
      { name: 'Night City', description: 'Neon-lit battles', speed: 1.7, spawn: 1.4, points: 2.0, required: 10000, enemies: ['fast_biker', 'armored_biker', 'boss'] },
      { name: 'Endless Mode', description: 'How far can you go?', speed: 2.0, spawn: 1.5, points: 2.5, required: 15000, enemies: ['fast_biker', 'armored_biker', 'boss'] }
    ];

    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      await execute(`
        INSERT INTO phases (id, name, description, enemy_speed_multiplier, spawn_rate, points_multiplier, required_score, enemy_types)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [i + 1, p.name, p.description, p.speed, p.spawn, p.points, p.required, p.enemies]);
    }
    console.log('Phases seeded');
  }

  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
