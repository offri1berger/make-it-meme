import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from '../lib/logger';
import { env } from '../config/env';
import { registerRoomHandlers } from './roomHandlers';
import { registerGameHandlers } from './gameHandlers';

export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected');

    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected');
    });
  });

  return io;
};
