import { Router, Request, Response } from 'express';
import { verifyToken } from './auth';
import { writeLimiter, apiLimiter } from '../middleware/rateLimiter';

export const gameRouter = Router();

// In-memory save store (replace with DB in production)
const saves: Map<string, object> = new Map();

// Leaderboard (power rankings)
const leaderboard: Array<{ rank: number; name: string; power: number }> = [
  { rank: 1, name: 'DragonLord',    power: 128450 },
  { rank: 2, name: 'ShadowKnight',  power: 95230  },
  { rank: 3, name: 'ArcaneWizard',  power: 87100  },
  { rank: 4, name: 'IronFist',      power: 76540  },
  { rank: 5, name: 'NightElf',      power: 65200  },
];

// POST /api/players/save – sync client save to server
gameRouter.post('/players/save', writeLimiter, (req: Request, res: Response) => {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  const player = verifyToken(token);
  if (!player) return res.status(401).json({ error: 'Unauthorized' });

  saves.set(player.id, req.body.save);
  return res.json({ success: true });
});

// GET /api/players/save – retrieve server-side save
gameRouter.get('/players/save', apiLimiter, (req: Request, res: Response) => {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  const player = verifyToken(token);
  if (!player) return res.status(401).json({ error: 'Unauthorized' });

  const save = saves.get(player.id);
  if (!save) return res.status(404).json({ error: 'No save found' });
  return res.json(save);
});

// GET /api/leaderboard
gameRouter.get('/leaderboard', (_req: Request, res: Response) => {
  res.json(leaderboard);
});
