import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../routes/auth';

interface ConnectedPlayer {
  id: string;
  name: string;
  socketId: string;
  allianceId?: string;
  power: number;
}

const connectedPlayers: Map<string, ConnectedPlayer> = new Map();

export function registerSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // ── Authentication ──────────────────────────────────────────────────
    socket.on('auth', (data: { token: string }) => {
      const player = verifyToken(data.token);
      if (!player) {
        socket.emit('auth:error', { message: 'Invalid token' });
        return;
      }
      connectedPlayers.set(player.id, {
        id: player.id,
        name: player.name,
        socketId: socket.id,
        power: 0,
      });
      socket.data.playerId = player.id;
      socket.emit('auth:success', { name: player.name });
      console.log(`[Socket] Player authenticated: ${player.name}`);

      // Broadcast updated online count
      io.emit('players:online', { count: connectedPlayers.size });
    });

    // ── Alliance chat ────────────────────────────────────────────────────
    socket.on('alliance:chat', (data: { allianceId: string; message: string }) => {
      const playerId = socket.data.playerId as string | undefined;
      const player = playerId ? connectedPlayers.get(playerId) : undefined;
      if (!player) return;

      // Broadcast to all members of the same alliance
      io.to(`alliance_${data.allianceId}`).emit('alliance:message', {
        from: player.name,
        message: data.message.slice(0, 200),
        time: new Date().toISOString(),
      });
    });

    // ── Join alliance room ────────────────────────────────────────────────
    socket.on('alliance:join_room', (data: { allianceId: string }) => {
      socket.join(`alliance_${data.allianceId}`);
      const playerId = socket.data.playerId as string | undefined;
      const player = playerId ? connectedPlayers.get(playerId) : undefined;
      if (player) player.allianceId = data.allianceId;
    });

    // ── Power sync ───────────────────────────────────────────────────────
    socket.on('player:sync_power', (data: { power: number }) => {
      const playerId = socket.data.playerId as string | undefined;
      const player = playerId ? connectedPlayers.get(playerId) : undefined;
      if (player) player.power = data.power;
    });

    // ── World map events (placeholder) ───────────────────────────────────
    socket.on('world:march', (data: { targetCol: number; targetRow: number; troops: number }) => {
      const playerId = socket.data.playerId as string | undefined;
      const player = playerId ? connectedPlayers.get(playerId) : undefined;
      if (!player) return;

      // Broadcast march to all players (for world map display)
      io.emit('world:march_update', {
        playerId: player.id,
        playerName: player.name,
        ...data,
      });
    });

    // ── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const playerId = socket.data.playerId as string | undefined;
      if (playerId) {
        connectedPlayers.delete(playerId);
        io.emit('players:online', { count: connectedPlayers.size });
        console.log(`[Socket] Player disconnected: ${playerId}`);
      }
    });
  });
}
