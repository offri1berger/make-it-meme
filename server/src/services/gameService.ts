import { nanoid } from 'nanoid';
import { db } from '../db/connection';
import { redis } from '../cache/connection';
import logger from '../lib/logger';
import { roundTimerQueue } from '../workers/roundTimerWorker';

export const startGame = async (
  roomCode: string,
  hostPlayerId: string
): Promise<void> => {
  const raw = await redis.get(`room:${roomCode}`);
  if (!raw) throw new Error('Room not found');

  const roomState = JSON.parse(raw);

  if (roomState.hostPlayerId !== hostPlayerId)
    throw new Error('Only the host can start the game');
  if (roomState.players.length < 3)
    throw new Error('Need at least 3 players to start');
  if (roomState.status !== 'lobby') throw new Error('Game already started');

  // Pick a random meme template from PostgreSQL
  const templates = await db.selectFrom('meme_templates').selectAll().execute();
  if (templates.length === 0) throw new Error('No meme templates available');
  const meme = templates[Math.floor(Math.random() * templates.length)];

  const gameId = nanoid();

  // Update room state in Redis
  const updatedState = {
    ...roomState,
    gameId,
    status: 'ROUND_START',
    currentRound: 1,
    meme: { id: meme.id, url: meme.cloudinary_url },
    captions: [],
    votes: [],
    timerEndsAt: null,
  };

  await redis.set(
    `room:${roomCode}`,
    JSON.stringify(updatedState),
    'EX',
    60 * 60 * 24
  );

  logger.info({ roomCode, gameId }, 'Game started');
};

export const startCaptionPhase = async (
  roomCode: string
): Promise<{ timerEndsAt: number }> => {
  const raw = await redis.get(`room:${roomCode}`);
  if (!raw) throw new Error('Room not found');

  const roomState = JSON.parse(raw);

  const timerEndsAt = Date.now() + 60_000; // 60 seconds from now

  const updatedState = {
    ...roomState,
    status: 'CAPTION_PHASE',
    captions: [],
    votes: [],
    timerEndsAt,
  };

  await redis.set(
    `room:${roomCode}`,
    JSON.stringify(updatedState),
    'EX',
    60 * 60 * 24
  );

  await roundTimerQueue.add(
    'end-round',
    { roomCode },
    { delay: 60_000, jobId: `round-${roomCode}-${Date.now()}` }
  );

  logger.info({ roomCode, timerEndsAt }, 'Caption phase started');
  return { timerEndsAt };
};

export const submitCaption = async (
  roomCode: string,
  playerId: string,
  text: string
): Promise<void> => {
  const raw = await redis.get(`room:${roomCode}`);
  if (!raw) throw new Error('Room not found');

  const roomState = JSON.parse(raw);

  if (roomState.status !== 'CAPTION_PHASE')
    throw new Error('Not in caption phase');

  const alreadySubmitted = roomState.captions.some(
    (c: any) => c.playerId === playerId
  );
  if (alreadySubmitted) throw new Error('Already submitted a caption');

  if (text.length > 200) throw new Error('Caption too long');

  const captionId = nanoid();
  roomState.captions.push({ id: captionId, playerId, text, voteCount: 0 });

  // Mark player as submitted
  const player = roomState.players.find((p: any) => p.id === playerId);
  if (player) player.submitted = true;

  // Check if all players submitted — move to voting automatically
  const allSubmitted = roomState.players.every((p: any) => p.submitted);
  if (allSubmitted) roomState.status = 'VOTING_PHASE';

  await redis.set(
    `room:${roomCode}`,
    JSON.stringify(roomState),
    'EX',
    60 * 60 * 24
  );

  logger.info({ roomCode, playerId, captionId }, 'Caption submitted');
};

export const submitVote = async (
  roomCode: string,
  playerId: string,
  captionId: string
): Promise<void> => {
  const raw = await redis.get(`room:${roomCode}`);
  if (!raw) throw new Error('Room not found');

  const roomState = JSON.parse(raw);

  if (roomState.status !== 'VOTING_PHASE')
    throw new Error('Not in voting phase');

  const alreadyVoted = roomState.votes.some(
    (v: any) => v.playerId === playerId
  );
  if (alreadyVoted) throw new Error('Already voted');

  // Can't vote for your own caption
  const ownCaption = roomState.captions.find(
    (c: any) => c.id === captionId && c.playerId === playerId
  );
  if (ownCaption) throw new Error('Cannot vote for your own caption');

  // Add vote
  roomState.votes.push({ playerId, captionId });

  // Increment caption vote count
  const caption = roomState.captions.find((c: any) => c.id === captionId);
  if (caption) caption.voteCount++;

  // Check if all players voted
  const allVoted = roomState.players.every((p: any) =>
    roomState.votes.some((v: any) => v.playerId === p.id)
  );
  if (allVoted) roomState.status = 'ROUND_RESULTS';

  await redis.set(
    `room:${roomCode}`,
    JSON.stringify(roomState),
    'EX',
    60 * 60 * 24
  );

  logger.info({ roomCode, playerId, captionId }, 'Vote submitted');
};

export const endRound = async (
  roomCode: string
): Promise<{ isGameOver: boolean }> => {
  const raw = await redis.get(`room:${roomCode}`);
  if (!raw) throw new Error('Room not found');

  const roomState = JSON.parse(raw);

  // Find winning caption (most votes)
  const winningCaption = roomState.captions.reduce(
    (best: any, c: any) => (c.voteCount > (best?.voteCount ?? -1) ? c : best),
    null
  );

  // Award point to winning player
  if (winningCaption) {
    const winner = roomState.players.find(
      (p: any) => p.id === winningCaption.playerId
    );
    if (winner) winner.score++;
  }

  // Reset player submitted flags
  roomState.players.forEach((p: any) => (p.submitted = false));

  const isGameOver = roomState.currentRound >= roomState.totalRounds;

  if (isGameOver) {
    roomState.status = 'GAME_OVER';
  } else {
    // Pick next meme
    const templates = await db
      .selectFrom('meme_templates')
      .selectAll()
      .execute();
    const meme = templates[Math.floor(Math.random() * templates.length)];
    roomState.currentRound++;
    roomState.status = 'ROUND_START';
    roomState.meme = { id: meme.id, url: meme.cloudinary_url };
    roomState.captions = [];
    roomState.votes = [];
    roomState.timerEndsAt = null;
  }

  await redis.set(
    `room:${roomCode}`,
    JSON.stringify(roomState),
    'EX',
    60 * 60 * 24
  );

  logger.info({ roomCode, isGameOver }, 'Round ended');
  return { isGameOver };
};

export const endGame = async (roomCode: string): Promise<void> => {
  const raw = await redis.get(`room:${roomCode}`);
  if (!raw) throw new Error('Room not found');

  const roomState = JSON.parse(raw);

  // Find overall winner
  const winner = roomState.players.reduce(
    (best: any, p: any) => (p.score > (best?.score ?? -1) ? p : best),
    null
  );

  // Flush to PostgreSQL
  await db
    .insertInto('games')
    .values({
      id: roomState.gameId,
      room_id: roomState.roomId,
      winner_player_id: winner?.id ?? null,
      total_rounds: roomState.totalRounds,
      started_at: new Date(),
      ended_at: new Date(),
    })
    .execute();

  // Save scores
  for (const player of roomState.players) {
    await db
      .insertInto('game_scores')
      .values({
        id: nanoid(),
        game_id: roomState.gameId,
        player_id: player.id,
        score: player.score,
        rounds_won: player.score,
      })
      .execute();
  }

  // Update room status in PostgreSQL
  await db
    .updateTable('rooms')
    .set({ status: 'finished' })
    .where('code', '=', roomCode)
    .execute();

  logger.info(
    { roomCode, winnerId: winner?.id },
    'Game ended, flushed to PostgreSQL'
  );
};
