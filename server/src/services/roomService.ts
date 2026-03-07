import { nanoid } from 'nanoid';
import { db } from '../db/connection';
import { redis } from '../cache/connection';
import logger from '../lib/logger';

export const createRoom = async (
  nickname: string
): Promise<{ roomCode: string; playerId: string }> => {
  const roomId = nanoid();
  const playerId = nanoid();
  const roomCode = nanoid(8);

  await db
    .insertInto('rooms')
    .values({
      id: roomId,
      code: roomCode,
      status: 'lobby',
      host_player_id: playerId,
      total_rounds: 5,
      created_at: new Date(),
    })
    .execute();

  await db
    .insertInto('players')
    .values({
      id: playerId,
      nickname,
      room_id: roomId,
      socket_id: '',
      joined_at: new Date(),
    })
    .execute();

  await redis.set(
    `room:${roomCode}`,
    JSON.stringify({
      roomId,
      roomCode,
      status: 'lobby',
      hostPlayerId: playerId,
      players: [{ id: playerId, nickname, score: 0, submitted: false }],
      totalRounds: 5,
    }),
    'EX',
    60 * 60 * 24
  );

  logger.info({ roomCode, playerId }, 'Room created');
  return { roomCode, playerId };
};

export const joinRoom = async (
  roomCode: string,
  nickname: string
): Promise<{ playerId: string }> => {
  const raw = await redis.get(`room:${roomCode}`);
  if (!raw) throw new Error('Room not found');

  const roomState = JSON.parse(raw);

  const nicknameExists = roomState.players.some(
    (p: { nickname: string }) =>
      p.nickname.toLowerCase() === nickname.toLowerCase()
  );

  if (roomState.status !== 'lobby') throw new Error('Game already started');
  if (roomState.players.length >= 10) throw new Error('Room is full');
  if (nicknameExists) throw new Error('Nickname already taken');

  const playerId = nanoid();

  await db
    .insertInto('players')
    .values({
      id: playerId,
      nickname,
      room_id: roomState.roomId,
      socket_id: '',
      joined_at: new Date(),
    })
    .execute();

  roomState.players.push({
    id: playerId,
    nickname,
    score: 0,
    submitted: false,
  });
  await redis.set(
    `room:${roomCode}`,
    JSON.stringify(roomState),
    'EX',
    60 * 60 * 24
  );

  logger.info({ roomCode, playerId }, 'Player joined room');
  return { playerId };
};
