import type { RoomState } from '../../types/game';
import { styles } from './gameStyles';

type Props = {
  roomState: RoomState;
  playerId: string | null;
  voted: boolean;
  onVote: (captionId: string) => void;
};

const VotingPhase = ({ roomState, playerId, voted, onVote }: Props) => (
  <div style={styles.page}>
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.roundBadge}>
          Round {roomState.currentRound}/{roomState.totalRounds}
        </span>
        <span style={{ color: '#a855f7', fontWeight: 700 }}>Vote!</span>
      </div>

      {roomState.meme && (
        <img src={roomState.meme.url} alt="meme" style={styles.memeImage} />
      )}

      <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Pick the funniest caption (you can't vote for your own)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {roomState.captions.map((c) => {
          const isOwn = c.playerId === playerId;
          return (
            <button
              key={c.id}
              onClick={() => !isOwn && onVote(c.id)}
              disabled={voted || isOwn}
              style={{
                ...styles.captionOption,
                opacity: voted || isOwn ? 0.5 : 1,
                cursor: voted || isOwn ? 'not-allowed' : 'pointer',
                border: isOwn ? '1px solid #333' : '1px solid #444',
              }}
            >
              {c.text}
              {isOwn && (
                <span
                  style={{
                    color: '#555',
                    fontSize: '0.75rem',
                    marginLeft: '0.5rem',
                  }}
                >
                  (yours)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {voted && (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '1rem' }}>
          Vote cast! Waiting for others...
        </p>
      )}
    </div>
  </div>
);

export default VotingPhase;
