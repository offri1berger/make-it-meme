import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import LobbyPage from './pages/LobbyPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game/:roomCode" element={<GamePage />} />
      <Route path="/lobby/:roomCode" element={<LobbyPage />} />
    </Routes>
  );
};

export default App;
