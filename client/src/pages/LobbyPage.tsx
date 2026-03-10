import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

type Player = {
  id: string;
  nickname: string;
  score: number;
  submitted: boolean;
  ready: boolean;
};

type RoomState = {
  roomCode: string;
  status: string;
  hostPlayerId: string;
  players: Player[];
  totalRounds: number;
};

const LobbyPage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState('');

  const playerId = localStorage.getItem('playerId');

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

    s.on('game:started', () => {
      navigate(`/game/${roomCode}`);
    });

    s.on('error', (err: { message: string }) => {
      setError(err.message);
    });

    return () => {
      s.disconnect();
    };
  }, [roomCode, playerId]);

  const handleStartGame = () => {
    if (!socketRef.current || !playerId) return;
    socketRef.current.emit('game:start', { roomCode, hostPlayerId: playerId });
  };

  const isHost = roomState?.hostPlayerId === playerId;
  const canStart = (roomState?.players.length ?? 0) >= 3;

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f0f0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#ff4444', fontSize: '1.25rem' }}>{error}</p>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f0f0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#666' }}>Connecting...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p
            style={{
              color: '#666',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
            }}
          >
            ROOM CODE
          </p>
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              letterSpacing: '0.15em',
              color: '#ff6b00',
              margin: 0,
            }}
          >
            {roomCode}
          </h1>
          <p
            style={{ color: '#555', fontSize: '0.875rem', marginTop: '0.5rem' }}
          >
            Share this code with your friends
          </p>
        </div>

        {/* Players */}
        <div
          style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <p
            style={{
              color: '#666',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Players ({roomState.players.length}/10)
          </p>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {roomState.players.map((player) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: '#111',
                  borderRadius: '0.75rem',
                  border: '1px solid #222',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#ff6b00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  >
                    {player.nickname[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{player.nickname}</span>
                  {player.id === roomState.hostPlayerId && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        background: '#ff6b0022',
                        color: '#ff6b00',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}
                    >
                      HOST
                    </span>
                  )}
                </div>
                {player.id === playerId && (
                  <span style={{ color: '#555', fontSize: '0.75rem' }}>
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start button — host only */}
        {isHost && (
          <div>
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                background: canStart ? '#ff6b00' : '#222',
                color: canStart ? '#fff' : '#555',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: canStart ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {canStart
                ? '🎮 Start Game'
                : `Waiting for players (${roomState.players.length}/3 min)`}
            </button>
          </div>
        )}

        {!isHost && (
          <p
            style={{ textAlign: 'center', color: '#555', fontSize: '0.875rem' }}
          >
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
