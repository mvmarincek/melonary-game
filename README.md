# Melonary Game

A web-based 2D arcade game featuring Melonary, the legendary caramelo dog that delivers flying kicks to bikers.

## Features

- **Addictive Gameplay**: Simple tap-to-kick mechanics with combo system
- **Progressive Phases**: 6 unique phases with increasing difficulty
- **Internationalization**: Support for English, Portuguese, and Spanish
- **Ranking System**: Global and weekly leaderboards
- **Admin Panel**: User management with CSV export
- **Multi-Agent Asset System**: AI-powered asset generation guidelines

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Canvas 2D for game rendering
- Hosted on Vercel

### Backend
- Node.js + Express + TypeScript
- PostgreSQL database
- JWT authentication
- Cloudinary for image storage
- Hosted on Render

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and Cloudinary credentials
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

## Deployment

### Backend (Render)
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Use the `render.yaml` blueprint or configure manually
4. Add environment variables

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set the root directory to `frontend`
3. Add `VITE_API_URL` environment variable pointing to your backend

## Game Mechanics

- **Tap/Click/Space**: Execute flying kick
- **Hit Zone**: Enemies in the golden zone can be kicked
- **Perfect Timing**: Kick when enemy is in the center for bonus points
- **Combo System**: Chain hits for score multipliers
- **Phase Progression**: Score thresholds unlock new phases

## Admin Features

- Dashboard with real-time stats
- User listing with search and pagination
- CSV export of all user data
- Asset management interface

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/settings` - Update settings

### Game
- `POST /api/game/start` - Start new session
- `POST /api/game/kick` - Submit kick action
- `POST /api/game/end` - End session
- `GET /api/game/ranking/global` - Global rankings
- `GET /api/game/ranking/weekly` - Weekly rankings

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/users/export` - Export CSV
- `GET /api/admin/stats` - Dashboard stats

## License

MIT
