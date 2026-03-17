import { useParams, useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import VotingPhase from '../components/game/VotingPhase';
import RoundResults from '../components/game/RoundResults';
import GameOver from '../components/game/GameOver';
import CaptionPhase from '../components/game/CaptionPhase';
import { styles } from '../components/game/gameStyles';

const GamePage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const game = useGameSocket(roomCode);

  if (!game.roomState) {
    return (
      <div style={styles.centered}>
        <p style={{ color: '#666' }}>Loading game...</p>
      </div>
    );
  }

  switch (game.roomState.status) {
    case 'CAPTION_PHASE':
      return (
        <CaptionPhase
          roomState={game.roomState}
          timeLeft={game.timeLeft}
          caption={game.caption}
          setCaption={game.setCaption}
          submitted={game.submitted}
          onSubmit={game.handleSubmitCaption}
        />
      );

    case 'VOTING_PHASE':
      return (
        <VotingPhase
          roomState={game.roomState}
          playerId={game.playerId}
          voted={game.voted}
          onVote={game.handleVote}
        />
      );

    case 'ROUND_RESULTS':
      return (
        <RoundResults
          roomState={game.roomState}
          playerId={game.playerId}
          winningCaption={game.winningCaption}
          onNextRound={game.handleNextRound}
        />
      );

    case 'GAME_OVER':
      return (
        <GameOver
          roomState={game.roomState}
          onPlayAgain={() => navigate('/')}
        />
      );

    default:
      return (
        <div style={styles.centered}>
          <p style={{ color: '#666' }}>Waiting for game to start...</p>
        </div>
      );
  }
};

export default GamePage;
