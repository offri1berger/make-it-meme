import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const HomePage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'idle' | 'join'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!nickname.trim()) {
      setError('Enter a nickname first');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`${API_URL}/api/rooms`, { nickname });
      const { roomCode, playerId } = res.data;
      sessionStorage.setItem('playerId', playerId);
      sessionStorage.setItem('nickname', nickname);
      navigate(`/lobby/${roomCode}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!nickname.trim()) {
      setError('Enter a nickname first');
      return;
    }
    if (!roomCode.trim()) {
      setError('Enter a room code');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`${API_URL}/api/rooms/${roomCode}/join`, {
        nickname,
      });
      const { playerId } = res.data;
      sessionStorage.setItem('playerId', playerId);
      sessionStorage.setItem('nickname', nickname);
      navigate(`/lobby/${roomCode}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: "'system-ui', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ff6b0033 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #a855f733 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🐸</div>
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-2px',
              lineHeight: 1,
              margin: 0,
              textShadow: '0 0 40px rgba(255,107,0,0.5)',
            }}
          >
            Make it
            <br />
            <span style={{ color: '#ff6b00' }}>Meme</span>
          </h1>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '1rem' }}>
            Write the funniest caption. Win eternal glory.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Nickname */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                color: '#888',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Your Nickname
            </label>
            <input
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid #333',
                background: '#111',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              placeholder="e.g. MemeKing69"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              onFocus={(e) => (e.target.style.borderColor = '#ff6b00')}
              onBlur={(e) => (e.target.style.borderColor = '#333')}
            />
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              background: loading ? '#333' : '#ff6b00',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '0.75rem',
              transition: 'all 0.2s',
              letterSpacing: '-0.02em',
            }}
            onMouseEnter={(e) => {
              if (!loading)
                (e.target as HTMLButtonElement).style.background = '#ff8533';
            }}
            onMouseLeave={(e) => {
              if (!loading)
                (e.target as HTMLButtonElement).style.background = '#ff6b00';
            }}
          >
            {loading ? 'Creating...' : '🚀 Create Room'}
          </button>

          {/* Join section */}
          {mode === 'idle' ? (
            <button
              onClick={() => setMode('join')}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                background: 'transparent',
                color: '#888',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid #2a2a2a',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = '#444';
                (e.target as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = '#2a2a2a';
                (e.target as HTMLButtonElement).style.color = '#888';
              }}
            >
              Join a Room
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #333',
                  background: '#111',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  letterSpacing: '0.15em',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
                placeholder="ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={8}
                onFocus={(e) => (e.target.style.borderColor = '#a855f7')}
                onBlur={(e) => (e.target.style.borderColor = '#333')}
              />
              <button
                onClick={handleJoin}
                disabled={loading}
                style={{
                  padding: '0.875rem 1.25rem',
                  borderRadius: '0.75rem',
                  background: '#a855f7',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '...' : 'Join →'}
              </button>
            </div>
          )}

          {error && (
            <p
              style={{
                color: '#ff4444',
                fontSize: '0.875rem',
                textAlign: 'center',
                marginTop: '1rem',
                margin: '1rem 0 0',
              }}
            >
              {error}
            </p>
          )}
        </div>

        <p
          style={{
            textAlign: 'center',
            color: '#444',
            fontSize: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          3–10 players · No account needed
        </p>
      </div>
    </div>
  );
};

export default HomePage;
