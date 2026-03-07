import './config/env';
import http from 'http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './lib/logger';
import { env } from './config/env';
import { redis } from './cache/connection';
import roomRoutes from './routes/rooms';
import { initSocketServer } from './websocket';

const app = express();
const httpServer = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Routes
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io
initSocketServer(httpServer);

async function start() {
  await redis.connect();
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

start();
