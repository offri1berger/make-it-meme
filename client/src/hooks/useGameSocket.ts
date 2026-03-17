import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Caption, RoomState } from '../types/game';

const SERVER_URL = 'http://localhost:3000';

export function useGameSocket(roomCode: string | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [caption, setCaption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [voted, setVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [winningCaption, setWinningCaption] = useState<Caption | null>(null);
  const [error, setError] = useState('');

  const playerId = sessionStorage.getItem('playerId');

  useEffect(() => {
    if (!roomState?.timerEndsAt) return;
    const interval = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((roomState.timerEndsAt! - Date.now()) / 1000)
      );
      setTimeLeft(left);
      if (left === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [roomState?.timerEndsAt]);

  useEffect(() => {
    if (!playerId || !roomCode) return;

    const s = io(SERVER_URL);
    socketRef.current = s;

    s.on('connect', () => {
      s.emit('room:join', { roomCode, playerId });
    });

    s.on('room:updated', (state: RoomState) => {
      setRoomState(state);
    });

    s.on('round:started', ({ round, meme, timerEndsAt }: any) => {
      setSubmitted(false);
      setVoted(false);
      setCaption('');
      setWinningCaption(null);
      setRoomState((prev) =>
        prev
          ? {
              ...prev,
              currentRound: round,
              meme,
              timerEndsAt,
              status: 'CAPTION_PHASE',
            }
          : prev
      );
    });

    s.on('round:voting', ({ captions }: any) => {
      setRoomState((prev) =>
        prev ? { ...prev, captions, status: 'VOTING_PHASE' } : prev
      );
    });

    s.on('round:results', ({ winningCaption, players }: any) => {
      setWinningCaption(winningCaption);
      setRoomState((prev) =>
        prev ? { ...prev, players, status: 'ROUND_RESULTS' } : prev
      );
    });

    s.on('game:ended', ({ players }: any) => {
      setRoomState((prev) =>
        prev ? { ...prev, players, status: 'GAME_OVER' } : prev
      );
    });

    s.on('error', (err: { message: string }) => {
      setError(err.message);
    });

    return () => {
      s.disconnect();
    };
  }, [roomCode, playerId]);

  const handleSubmitCaption = () => {
    if (!caption.trim() || submitted) return;
    socketRef.current?.emit('caption:submit', {
      roomCode,
      playerId,
      text: caption,
    });
    setSubmitted(true);
  };

  const handleVote = (captionId: string) => {
    if (voted) return;
    socketRef.current?.emit('vote:submit', { roomCode, playerId, captionId });
    setVoted(true);
  };

  const handleNextRound = () => {
    socketRef.current?.emit('round:next', { roomCode });
  };

  return {
    roomState,
    caption,
    setCaption,
    submitted,
    voted,
    timeLeft,
    winningCaption,
    error,
    playerId,
    handleSubmitCaption,
    handleVote,
    handleNextRound,
  };
}
