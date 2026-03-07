import { Router } from 'express';
import {
  handleCreateRoom,
  handleJoinRoom,
} from '../controllers/roomController';

const router = Router();

router.post('/', handleCreateRoom);
router.post('/:roomCode/join', handleJoinRoom);

export default router;
