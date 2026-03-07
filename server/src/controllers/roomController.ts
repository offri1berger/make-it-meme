import { Request, Response } from 'express';
import { createRoom, joinRoom } from '../services/roomService';
import logger from '../lib/logger';

export const handleCreateRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== 'string') {
      res.status(400).json({ error: 'Nickname is required' });
      return;
    }

    const result = await createRoom(nickname);
    res.status(201).json(result);
  } catch (err) {
    logger.error({ err }, 'Failed to create room');
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const handleJoinRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roomCode } = req.params;
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== 'string') {
      res.status(400).json({ error: 'Nickname is required' });
      return;
    }

    const result = await joinRoom(roomCode as string, nickname);
    res.status(200).json(result);
  } catch (err: any) {
    logger.error({ err }, 'Failed to join room');

    if (err.message === 'Room not found') {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    if (err.message === 'Game already started') {
      res.status(409).json({ error: 'Game already started...' });
      return;
    }
    if (err.message === 'Room is full') {
      res.status(409).json({ error: 'Room is full!' });
      return;
    }
    if (err.message === 'Nickname already taken') {
      res
        .status(409)
        .json({ error: 'Nickname already taken, choose another one' });
      return;
    }

    res.status(500).json({ error: 'Failed to join room' });
  }
};
