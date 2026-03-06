import './config/env';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './lib/logger';
import { env } from './config/env';
import { redis } from './cache/connection';

const app = express();

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await redis.connect();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

start();
