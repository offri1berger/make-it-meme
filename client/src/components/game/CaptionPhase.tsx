import type { RoomState } from '../../types/game';
import { styles } from './gameStyles';

type Props = {
  roomState: RoomState;
  timeLeft: number | null;
  caption: string;
  setCaption: (value: string) => void;
  submitted: boolean;
  onSubmit: () => void;
};

const CaptionPhase = ({
  roomState,
  timeLeft,
  caption,
  setCaption,
  submitted,
  onSubmit,
}: Props) => (
  <div style={styles.page}>
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.roundBadge}>
          Round {roomState.currentRound}/{roomState.totalRounds}
        </span>
        {timeLeft !== null && (
          <span
            style={{
              ...styles.timer,
              color: timeLeft <= 10 ? '#ff4444' : '#ff6b00',
            }}
          >
            ⏱ {timeLeft}s
          </span>
        )}
      </div>

      {roomState.meme && (
        <img src={roomState.meme.url} alt="meme" style={styles.memeImage} />
      )}

      <div style={styles.submittedCount}>
        {roomState.players.filter((p) => p.submitted).length}/
        {roomState.players.length} submitted
      </div>

      {!submitted ? (
        <div style={styles.captionBox}>
          <textarea
            style={styles.textarea}
            placeholder="Write the funniest caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            rows={3}
          />
          <button
            onClick={onSubmit}
            disabled={!caption.trim()}
            style={{ ...styles.primaryBtn, opacity: caption.trim() ? 1 : 0.4 }}
          >
            Submit Caption
          </button>
        </div>
      ) : (
        <div style={styles.waitingBox}>
          <p style={{ color: '#888' }}>
            Caption submitted! Waiting for others...
          </p>
        </div>
      )}
    </div>
  </div>
);

export default CaptionPhase;
