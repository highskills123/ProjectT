import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from './auth';
import { writeLimiter, apiLimiter } from '../middleware/rateLimiter';

export const allianceRouter = Router();

interface Alliance {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  power: number;
  wins: number;
  losses: number;
  techBonus: number;
  createdAt: Date;
}

// In-memory store (replace with DB in production)
const alliances: Map<string, Alliance> = new Map();

// Seed some default alliances
const seedAlliances = () => {
  const seeds = [
    { name: 'DragonCrest', power: 280000, wins: 45, losses: 12 },
    { name: 'IronLegion',  power: 215000, wins: 38, losses: 18 },
    { name: 'MysticOrder', power: 182000, wins: 30, losses: 22 },
    { name: 'ShadowPact',  power: 141000, wins: 25, losses: 28 },
    { name: 'LightBearers',power: 98000,  wins: 14, losses: 35 },
  ];
  seeds.forEach(s => {
    const id = uuidv4();
    alliances.set(id, {
      id,
      name: s.name,
      leaderId: 'system',
      memberIds: [],
      power: s.power,
      wins: s.wins,
      losses: s.losses,
      techBonus: 5,
      createdAt: new Date(),
    });
  });
};
seedAlliances();

// GET /api/alliances – list all alliances (public)
allianceRouter.get('/', (_req: Request, res: Response) => {
  const list = [...alliances.values()].map(a => ({
    id: a.id,
    name: a.name,
    members: a.memberIds.length,
    power: a.power,
    wins: a.wins,
    losses: a.losses,
  }));
  res.json(list);
});

// POST /api/alliances – create an alliance
allianceRouter.post('/', writeLimiter, (req: Request, res: Response) => {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  const player = verifyToken(token);
  if (!player) return res.status(401).json({ error: 'Unauthorized' });

  const { name } = req.body as { name?: string };
  if (!name || name.trim().length < 3) {
    return res.status(400).json({ error: 'Alliance name must be at least 3 characters' });
  }

  // Check if name is taken
  const taken = [...alliances.values()].some(a => a.name.toLowerCase() === name.toLowerCase());
  if (taken) return res.status(409).json({ error: 'Name already taken' });

  const id = uuidv4();
  alliances.set(id, {
    id,
    name: name.trim(),
    leaderId: player.id,
    memberIds: [player.id],
    power: 0,
    wins: 0,
    losses: 0,
    techBonus: 0,
    createdAt: new Date(),
  });

  return res.json({ success: true, allianceId: id });
});

// POST /api/alliances/:id/join
allianceRouter.post('/:id/join', writeLimiter, (req: Request, res: Response) => {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  const player = verifyToken(token);
  if (!player) return res.status(401).json({ error: 'Unauthorized' });

  const alliance = alliances.get(req.params.id);
  if (!alliance) return res.status(404).json({ error: 'Alliance not found' });

  if (alliance.memberIds.includes(player.id)) {
    return res.status(400).json({ error: 'Already a member' });
  }

  if (alliance.memberIds.length >= 50) {
    return res.status(400).json({ error: 'Alliance is full (max 50 members)' });
  }

  alliance.memberIds.push(player.id);
  return res.json({ success: true });
});

// POST /api/alliances/:id/leave
allianceRouter.post('/:id/leave', writeLimiter, (req: Request, res: Response) => {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  const player = verifyToken(token);
  if (!player) return res.status(401).json({ error: 'Unauthorized' });

  const alliance = alliances.get(req.params.id);
  if (!alliance) return res.status(404).json({ error: 'Alliance not found' });

  const idx = alliance.memberIds.indexOf(player.id);
  if (idx === -1) return res.status(400).json({ error: 'Not a member' });

  alliance.memberIds.splice(idx, 1);

  // If leader left and there are other members, promote next
  if (alliance.leaderId === player.id && alliance.memberIds.length > 0) {
    alliance.leaderId = alliance.memberIds[0];
  }

  // Disband if empty
  if (alliance.memberIds.length === 0) {
    alliances.delete(alliance.id);
  }

  return res.json({ success: true });
});
