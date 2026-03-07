import { Server, Socket } from 'socket.io';
import { redis } from '../cache/connection';
import { db } from '../db/connection';
import logger from '../lib/logger';

export const registerRoomHandlers = (io: Server, socket: Socket): void => {
  socket.on('room:join', async ({ roomCode, playerId }) => {
    logger.info({ roomCode, playerId }, 'room:join handler fired');
    const raw = await redis.get(`room:${roomCode}`);
    logger.info({ raw }, 'Redis raw value');
    try {
      if (!raw) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const roomState = JSON.parse(raw);

      const player = roomState.players.find((p: any) => p.id === playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found in room' });
        return;
      }

      await db
        .updateTable('players')
        .set({ socket_id: socket.id })
        .where('id', '=', playerId)
        .execute();

      socket.join(roomCode);

      io.to(roomCode).emit('room:updated', roomState);

      logger.info(
        { roomCode, playerId, socketId: socket.id },
        'Player joined socket room'
      );
    } catch (err) {
      logger.error({ err }, 'Error in room:join');
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('room:leave', async ({ roomCode, playerId }) => {
    try {
      const raw = await redis.get(`room:${roomCode}`);
      if (!raw) return;

      const roomState = JSON.parse(raw);

      roomState.players = roomState.players.filter(
        (p: any) => p.id !== playerId
      );

      await redis.set(
        `room:${roomCode}`,
        JSON.stringify(roomState),
        'EX',
        60 * 60 * 24
      );

      socket.leave(roomCode);

      io.to(roomCode).emit('room:updated', roomState);

      logger.info({ roomCode, playerId }, 'Player left room');
    } catch (err) {
      logger.error({ err }, 'Error in room:leave');
    }
  });

  socket.on('player:ready', async ({ roomCode, playerId }) => {
    try {
      const raw = await redis.get(`room:${roomCode}`);
      if (!raw) return;

      const roomState = JSON.parse(raw);

      const player = roomState.players.find((p: any) => p.id === playerId);
      if (player) player.ready = true;

      await redis.set(
        `room:${roomCode}`,
        JSON.stringify(roomState),
        'EX',
        60 * 60 * 24
      );

      io.to(roomCode).emit('room:updated', roomState);

      logger.info({ roomCode, playerId }, 'Player ready');
    } catch (err) {
      logger.error({ err }, 'Error in player:ready');
    }
  });
};
