import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  createInitialGameState,
  executeMove,
  sanitizeGameState,
} from './server/gameEngine.js';
import {
  GameState,
  ClientMessage,
  ServerMessage,
  PlayerColor,
  PieceType,
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RoomSession {
  roomId: string;
  state: GameState;
  whiteWs: WebSocket | null;
  blackWs: WebSocket | null;
  isLocal: boolean;
  createdAt: number;
}

const rooms = new Map<string, RoomSession>();

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sendTo(ws: WebSocket | null, msg: ServerMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      console.error('Failed to send WS message:', e);
    }
  }
}

function broadcastToRoom(room: RoomSession, msg: ServerMessage) {
  sendTo(room.whiteWs, msg);
  if (room.blackWs && room.blackWs !== room.whiteWs) {
    sendTo(room.blackWs, msg);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      activeRooms: rooms.size,
      time: new Date().toISOString(),
    });
  });

  // REST endpoint to get room info or inspect if needed
  app.get('/api/room/:id', (req, res) => {
    const room = rooms.get(req.params.id.toUpperCase());
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.json({
      roomId: room.roomId,
      hasWhite: !!room.whiteWs,
      hasBlack: !!room.blackWs,
      isLocal: room.isLocal,
      status: room.state.status,
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId: string | null = null;
    let assignedColor: PlayerColor | null = null;

    ws.on('message', (data: string) => {
      try {
        const msg: ClientMessage = JSON.parse(data.toString());

        if (msg.type === 'create_room') {
          const roomId = generateRoomId();
          const state = createInitialGameState(roomId);
          const isLocal = msg.mode === 'local';

          const room: RoomSession = {
            roomId,
            state,
            whiteWs: ws,
            blackWs: isLocal ? ws : null,
            isLocal,
            createdAt: Date.now(),
          };

          rooms.set(roomId, room);
          currentRoomId = roomId;
          assignedColor = 'white';

          if (isLocal) {
            sendTo(ws, {
              type: 'game_start',
              roomId,
              color: 'white',
              state: sanitizeGameState(state),
            });
          } else {
            sendTo(ws, {
              type: 'room_created',
              roomId,
              color: 'white',
            });
          }
          return;
        }

        if (msg.type === 'join_room') {
          const roomId = msg.roomId?.trim().toUpperCase();
          const room = rooms.get(roomId);

          if (!room) {
            sendTo(ws, { type: 'error', message: `Room ${roomId} not found.` });
            return;
          }

          if (room.whiteWs === ws) {
            // Reconnecting as white
            currentRoomId = roomId;
            assignedColor = 'white';
            sendTo(ws, {
              type: 'game_start',
              roomId,
              color: 'white',
              state: sanitizeGameState(room.state),
            });
            return;
          }

          if (!room.blackWs || room.blackWs.readyState !== WebSocket.OPEN) {
            room.blackWs = ws;
            currentRoomId = roomId;
            assignedColor = 'black';

            // Send game_start to White Host
            sendTo(room.whiteWs, {
              type: 'game_start',
              roomId,
              color: 'white',
              state: sanitizeGameState(room.state),
            });

            // Send game_start to Black Guest
            sendTo(room.blackWs, {
              type: 'game_start',
              roomId,
              color: 'black',
              state: sanitizeGameState(room.state),
            });
          } else {
            sendTo(ws, { type: 'error', message: 'Room is already full.' });
          }
          return;
        }

        if (msg.type === 'make_move') {
          const room = rooms.get(msg.roomId);
          if (!room) {
            sendTo(ws, { type: 'error', message: 'Room not found.' });
            return;
          }

          // Check whose turn it is
          if (!room.isLocal) {
            const isWhitePlayer = ws === room.whiteWs;
            const isBlackPlayer = ws === room.blackWs;
            if (
              (room.state.turn === 'white' && !isWhitePlayer) ||
              (room.state.turn === 'black' && !isBlackPlayer)
            ) {
              sendTo(ws, { type: 'error', message: 'Not your turn!' });
              return;
            }
          }

          const result = executeMove(room.state, msg.from, msg.to, msg.promotion);
          if (!result.valid) {
            sendTo(ws, { type: 'error', message: result.error || 'Invalid move.' });
            return;
          }

          room.state = result.state;
          const sanitized = sanitizeGameState(room.state);

          if (room.state.status === 'completed') {
            broadcastToRoom(room, {
              type: 'game_over',
              winner: room.state.winner,
              reason: room.state.winReason || 'Game finished',
              state: sanitized,
            });
          } else {
            broadcastToRoom(room, {
              type: 'move_resolved',
              state: sanitized,
              lastMove: result.record,
            });
          }
          return;
        }

        if (msg.type === 'request_rematch') {
          const room = rooms.get(msg.roomId);
          if (!room) return;

          // Start a new match with fresh randomized board
          room.state = createInitialGameState(room.roomId);
          const sanitized = sanitizeGameState(room.state);

          broadcastToRoom(room, {
            type: 'rematch_started',
            state: sanitized,
          });
          return;
        }

        if (msg.type === 'resign') {
          const room = rooms.get(msg.roomId);
          if (!room || room.state.status === 'completed') return;

          const resigningColor: PlayerColor = ws === room.whiteWs ? 'white' : 'black';
          const winnerColor: PlayerColor = resigningColor === 'white' ? 'black' : 'white';

          room.state.status = 'completed';
          room.state.winner = winnerColor;
          room.state.winReason = `${resigningColor.charAt(0).toUpperCase() + resigningColor.slice(1)} resigned`;

          for (const sq of Object.values(room.state.squares)) {
            sq.revealed = true;
          }

          const sanitized = sanitizeGameState(room.state);
          broadcastToRoom(room, {
            type: 'game_over',
            winner: winnerColor,
            reason: room.state.winReason,
            state: sanitized,
          });
          return;
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          if (room.whiteWs === ws) room.whiteWs = null;
          if (room.blackWs === ws) room.blackWs = null;

          broadcastToRoom(room, {
            type: 'player_status',
            whiteConnected: !!room.whiteWs && room.whiteWs.readyState === WebSocket.OPEN,
            blackConnected: !!room.blackWs && room.blackWs.readyState === WebSocket.OPEN,
          });

          // Cleanup room if both disconnected after 30 minutes
          if (!room.whiteWs && !room.blackWs) {
            setTimeout(() => {
              const r = rooms.get(currentRoomId!);
              if (r && !r.whiteWs && !r.blackWs) {
                rooms.delete(currentRoomId!);
              }
            }, 30 * 60 * 1000);
          }
        }
      }
    });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Fog of War Chess server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
