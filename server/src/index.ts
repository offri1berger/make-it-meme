import './config/env';
import http from 'http';
import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './lib/logger';
import { env } from './config/env';
import { redis } from './cache/connection';
import roomRoutes from './routes/rooms';
import { initSocketServer } from './websocket';
import './workers/roundTimerWorker';
import uploadRoutes from './routes/uploads';

const app = express();
const httpServer = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use('/api/rooms', roomRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, 'Unhandled error');
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({
    error:
      env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
app.use(errorHandler);

const io = initSocketServer(httpServer);

const start = async () => {
  try {
    await redis.connect();
    httpServer.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  io.close();
  httpServer.close();
  await redis.disconnect();
  logger.info('Shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
