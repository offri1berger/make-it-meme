import type { RoomState } from '../../types/game';
import { styles } from './gameStyles';

type Props = {
  roomState: RoomState;
  onPlayAgain: () => void;
};

const GameOver = ({ roomState, onPlayAgain }: Props) => {
  const sorted = [...roomState.players].sort((a, b) => b.score - a.score);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.5rem' }}>
            Game Over!
          </h1>
          <p style={{ color: '#ff6b00', fontWeight: 700, fontSize: '1.25rem' }}>
            {sorted[0]?.nickname} wins!
          </p>
        </div>

        <div>
          {sorted.map((p, i) => (
            <div
              key={p.id}
              style={{
                ...styles.scoreRow,
                background: i === 0 ? '#ff6b0011' : '#111',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span
                  style={{
                    color: i === 0 ? '#ff6b00' : '#555',
                    fontWeight: 700,
                  }}
                >
                  #{i + 1}
                </span>
                <span style={{ color: '#fff' }}>{p.nickname}</span>
              </div>
              <span style={{ color: '#ff6b00', fontWeight: 700 }}>
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onPlayAgain}
          style={{ ...styles.primaryBtn, marginTop: '2rem' }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOver;
