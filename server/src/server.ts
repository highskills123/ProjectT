import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { gameRouter } from './routes/game';
import { allianceRouter } from './routes/alliance';
import { registerSocketHandlers } from './socket/handlers';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:3000'] }));
app.use(express.json());

// ── REST routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);
app.use('/api',           gameRouter);
app.use('/api/alliances', allianceRouter);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Socket.IO ───────────────────────────────────────────────────────────────
registerSocketHandlers(io);

// ── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[ProjectT Server] Listening on http://localhost:${PORT}`);
});

export { io };
