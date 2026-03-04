import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authLimiter } from '../middleware/rateLimiter';

const JWT_SECRET = process.env.JWT_SECRET ?? 'projectt-dev-secret-change-in-prod';

export const authRouter = Router();

// In-memory player store (replace with a real DB in production)
const players: Map<string, { id: string; name: string; passwordHash: string }> = new Map();

authRouter.post('/register', authLimiter, (req: Request, res: Response) => {
  const { name, password } = req.body as { name?: string; password?: string };
  if (!name || !password) {
    return res.status(400).json({ error: 'name and password required' });
  }
  if (players.has(name)) {
    return res.status(409).json({ error: 'Name already taken' });
  }

  const id = uuidv4();
  // NOTE: In production use bcrypt; this is a dev-only simple hash
  players.set(name, { id, name, passwordHash: Buffer.from(password).toString('base64') });

  const token = jwt.sign({ id, name }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({ token, id, name });
});

authRouter.post('/login', authLimiter, (req: Request, res: Response) => {
  const { name, password } = req.body as { name?: string; password?: string };
  if (!name || !password) {
    return res.status(400).json({ error: 'name and password required' });
  }

  const player = players.get(name);
  if (!player || player.passwordHash !== Buffer.from(password).toString('base64')) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: player.id, name }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({ token, id: player.id, name });
});

export function verifyToken(token: string): { id: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; name: string };
  } catch {
    return null;
  }
}
