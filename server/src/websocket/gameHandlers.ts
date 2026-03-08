import { Server, Socket } from 'socket.io';
import logger from '../lib/logger';
import { redis } from '../cache/connection';
import {
  startGame,
  startCaptionPhase,
  submitCaption,
  submitVote,
  endRound,
  endGame,
} from '../services/gameService';

export const registerGameHandlers = (io: Server, socket: Socket): void => {
  socket.on('game:start', async ({ roomCode, hostPlayerId }) => {
    try {
      await startGame(roomCode, hostPlayerId);
      const { timerEndsAt } = await startCaptionPhase(roomCode);

      io.to(roomCode).emit('game:started', { roomCode });
      io.to(roomCode).emit('round:started', { round: 1, timerEndsAt });

      logger.info({ roomCode }, 'Game started, round 1 beginning');
    } catch (err: any) {
      logger.error({ err }, 'Error in game:start');
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('caption:submit', async ({ roomCode, playerId, text }) => {
    try {
      await submitCaption(roomCode, playerId, text);

      const raw = await redis.get(`room:${roomCode}`);
      const roomState = JSON.parse(raw!);

      // Broadcast updated state so everyone sees who has submitted
      io.to(roomCode).emit('room:updated', roomState);

      // If all submitted, move to voting
      if (roomState.status === 'VOTING_PHASE') {
        io.to(roomCode).emit('round:voting', { captions: roomState.captions });
      }

      logger.info({ roomCode, playerId }, 'Caption submitted');
    } catch (err: any) {
      logger.error({ err }, 'Error in caption:submit');
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('vote:submit', async ({ roomCode, playerId, captionId }) => {
    try {
      await submitVote(roomCode, playerId, captionId);

      const raw = await redis.get(`room:${roomCode}`);
      const roomState = JSON.parse(raw!);

      // If all voted, show results
      if (roomState.status === 'ROUND_RESULTS') {
        const winningCaption = roomState.captions.reduce(
          (best: any, c: any) =>
            c.voteCount > (best?.voteCount ?? -1) ? c : best,
          null
        );

        io.to(roomCode).emit('round:results', {
          winningCaption,
          players: roomState.players,
        });
      }

      logger.info({ roomCode, playerId }, 'Vote submitted');
    } catch (err: any) {
      logger.error({ err }, 'Error in vote:submit');
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('round:next', async ({ roomCode }) => {
    try {
      const { isGameOver } = await endRound(roomCode);

      if (isGameOver) {
        await endGame(roomCode);
        const raw = await redis.get(`room:${roomCode}`);
        const roomState = JSON.parse(raw!);
        io.to(roomCode).emit('game:ended', { players: roomState.players });
      } else {
        const { timerEndsAt } = await startCaptionPhase(roomCode);
        const raw = await redis.get(`room:${roomCode}`);
        const roomState = JSON.parse(raw!);
        io.to(roomCode).emit('round:started', {
          round: roomState.currentRound,
          meme: roomState.meme,
          timerEndsAt,
        });
      }

      logger.info({ roomCode }, 'Moving to next round');
    } catch (err: any) {
      logger.error({ err }, 'Error in round:next');
      socket.emit('error', { message: err.message });
    }
  });
};
