export type GameStatus =
  | "LOBBY"
  | "ROUND_START"
  | "CAPTION_PHASE"
  | "VOTING_PHASE"
  | "ROUND_RESULTS"
  | "GAME_OVER";

export interface Player {
  id: string;
  nickname: string;
  score: number;
  submitted: boolean;
}

export interface Caption {
  id: string;
  playerId: string;
  text: string;
  voteCount: number;
}

export interface GameState {
  gameId: string;
  roomCode: string;
  status: GameStatus;
  currentRound: number;
  totalRounds: number;
  players: Player[];
  captions: Caption[];
  timerEndsAt: number | null;
}