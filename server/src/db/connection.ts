import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { env } from '../config/env.js';

// This interface defines the shape of your entire database
// Every table and every column — TypeScript will enforce this everywhere
export interface Database {
  meme_templates: {
    id: string;
    name: string;
    cloudinary_url: string;
    thumbnail_url: string;
    created_at: Date;
  };
  rooms: {
    id: string;
    code: string;
    status: 'lobby' | 'in_progress' | 'finished';
    host_player_id: string;
    total_rounds: number;
    created_at: Date;
  };
  players: {
    id: string;
    nickname: string;
    room_id: string;
    socket_id: string;
    joined_at: Date;
  };
  games: {
    id: string;
    room_id: string;
    winner_player_id: string | null;
    total_rounds: number;
    started_at: Date;
    ended_at: Date | null;
  };
  game_rounds: {
    id: string;
    game_id: string;
    round_number: number;
    meme_template_id: string;
    winning_caption_id: string | null;
    started_at: Date;
    ended_at: Date | null;
  };
  captions: {
    id: string;
    round_id: string;
    player_id: string;
    text: string;
    vote_count: number;
    submitted_at: Date;
  };
  game_scores: {
    id: string;
    game_id: string;
    player_id: string;
    score: number;
    rounds_won: number;
  };
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: env.DATABASE_URL,
  }),
});

export const db = new Kysely<Database>({ dialect });
