import type { Caption, RoomState } from '../../types/game';
import { styles } from './gameStyles';

type Props = {
  roomState: RoomState;
  playerId: string | null;
  winningCaption: Caption | null;
  onNextRound: () => void;
};

const RoundResults = ({
  roomState,
  playerId,
  winningCaption,
  onNextRound,
}: Props) => {
  const winner = roomState.players.find(
    (p) => p.id === winningCaption?.playerId
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2
          style={{
            color: '#ff6b00',
            fontWeight: 900,
            fontSize: '2rem',
            textAlign: 'center',
          }}
        >
          🏆 Round Winner!
        </h2>

        {winningCaption && (
          <div style={styles.winnerCard}>
            <p
              style={{
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}
            >
              "{winningCaption.text}"
            </p>
            <p style={{ color: '#ff6b00', fontSize: '0.875rem' }}>
              — {winner?.nickname}
            </p>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <p
            style={{
              color: '#666',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
            }}
          >
            Scores
          </p>
          {[...roomState.players]
            .sort((a, b) => b.score - a.score)
            .map((p) => (
              <div key={p.id} style={styles.scoreRow}>
                <span style={{ color: '#fff' }}>{p.nickname}</span>
                <span style={{ color: '#ff6b00', fontWeight: 700 }}>
                  {p.score} pts
                </span>
              </div>
            ))}
        </div>

        {roomState.players[0]?.id === playerId && (
          <button
            onClick={onNextRound}
            style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}
          >
            Next Round →
          </button>
        )}
      </div>
    </div>
  );
};

export default RoundResults;
