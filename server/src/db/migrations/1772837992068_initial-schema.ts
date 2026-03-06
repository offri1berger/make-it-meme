import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder): void => {
  // meme_templates
  pgm.createTable('meme_templates', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    name: { type: 'varchar(100)', notNull: true },
    cloudinary_url: { type: 'text', notNull: true },
    thumbnail_url: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // rooms
  pgm.createTable('rooms', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    code: { type: 'varchar(12)', notNull: true, unique: true },
    status: { type: 'varchar(20)', notNull: true, default: 'lobby' },
    host_player_id: { type: 'varchar(21)', notNull: true },
    total_rounds: { type: 'integer', notNull: true, default: 5 },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // players
  pgm.createTable('players', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    nickname: { type: 'varchar(30)', notNull: true },
    room_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'rooms(id)',
      onDelete: 'CASCADE',
    },
    socket_id: { type: 'varchar(50)', notNull: true },
    joined_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // games
  pgm.createTable('games', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    room_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'rooms(id)',
      onDelete: 'CASCADE',
    },
    winner_player_id: { type: 'varchar(21)' },
    total_rounds: { type: 'integer', notNull: true },
    started_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    ended_at: { type: 'timestamptz' },
  });

  // game_rounds
  pgm.createTable('game_rounds', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    game_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'games(id)',
      onDelete: 'CASCADE',
    },
    round_number: { type: 'integer', notNull: true },
    meme_template_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'meme_templates(id)',
    },
    winning_caption_id: { type: 'varchar(21)' },
    started_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    ended_at: { type: 'timestamptz' },
  });

  // captions
  pgm.createTable('captions', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    round_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'game_rounds(id)',
      onDelete: 'CASCADE',
    },
    player_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'players(id)',
      onDelete: 'CASCADE',
    },
    text: { type: 'text', notNull: true },
    vote_count: { type: 'integer', notNull: true, default: 0 },
    submitted_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // caption_votes
  pgm.createTable('caption_votes', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    caption_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'captions(id)',
      onDelete: 'CASCADE',
    },
    player_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'players(id)',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  pgm.addConstraint(
    'caption_votes',
    'unique_vote_per_player',
    'UNIQUE(caption_id, player_id)'
  );

  // game_scores
  pgm.createTable('game_scores', {
    id: { type: 'varchar(21)', primaryKey: true, notNull: true },
    game_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'games(id)',
      onDelete: 'CASCADE',
    },
    player_id: {
      type: 'varchar(21)',
      notNull: true,
      references: 'players(id)',
      onDelete: 'CASCADE',
    },
    score: { type: 'integer', notNull: true, default: 0 },
    rounds_won: { type: 'integer', notNull: true, default: 0 },
  });
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.dropTable('game_scores');
  pgm.dropTable('caption_votes');
  pgm.dropTable('captions');
  pgm.dropTable('game_rounds');
  pgm.dropTable('games');
  pgm.dropTable('players');
  pgm.dropTable('rooms');
  pgm.dropTable('meme_templates');
};
