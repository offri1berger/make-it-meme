import { Queue, Worker } from 'bullmq';
import logger from '../lib/logger';
import { redis } from '../cache/connection';

const connection = {
  host: 'localhost',
  port: 6379,
};

export const roundTimerQueue = new Queue('round-timer', {
  connection,
});

export const roundTimerWorker = new Worker(
  'round-timer',
  async (job) => {
    const { roomCode } = job.data;
    logger.info(
      { roomCode, jobId: job.id },
      'Round timer fired — forcing end of caption phase'
    );

    const raw = await redis.get(`room:${roomCode}`);
    if (!raw) {
      logger.warn({ roomCode }, 'Room not found when timer fired');
      return;
    }

    const roomState = JSON.parse(raw);

    if (roomState.status === 'CAPTION_PHASE') {
      roomState.status = 'VOTING_PHASE';
      await redis.set(
        `room:${roomCode}`,
        JSON.stringify(roomState),
        'EX',
        60 * 60 * 24
      );
      logger.info(
        { roomCode },
        'Forced end of caption phase — moving to voting'
      );
    } else {
      logger.info(
        { roomCode, status: roomState.status },
        'Timer fired but phase already ended — skipping'
      );
    }
  },
  { connection }
);

roundTimerWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Round timer job completed');
});

roundTimerWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Round timer job failed');
});
