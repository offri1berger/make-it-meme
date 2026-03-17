export type Player = {
  id: string;
  nickname: string;
  score: number;
  submitted: boolean;
};

export type Caption = {
  id: string;
  playerId: string;
  text: string;
  voteCount: number;
};

export type RoomState = {
  roomCode: string;
  status: string;
  players: Player[];
  meme: { id: string; url: string };
  captions: Caption[];
  currentRound: number;
  totalRounds: number;
  timerEndsAt: number | null;
};
