import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import adminRoutes from './routes/admin';
import assetsRoutes from './routes/assets';
import agentsRoutes from './routes/agents';
import { runMigrations } from './db/migrate';
import { seedDatabase } from './db/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'https://melonary.vercel.app',
    'https://melonary-mvmarincek.vercel.app',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());
app.use(apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/agents', agentsRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    console.log('Running database migrations...');
    await runMigrations();
    
    console.log('Seeding database...');
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`Melonary Game Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
