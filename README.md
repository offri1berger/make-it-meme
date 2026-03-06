# 🎭 Make it Meme

A real-time multiplayer meme caption game for 3–10 players.
Players compete to write the funniest caption for a meme, then vote anonymously for the best one.

## Features

- 🎮 Real-time multiplayer (3–10 players per room)
- 🖼️ Classic meme templates + custom photo uploads
- ⏱️ Server-enforced round timer (BullMQ)
- 🗳️ Anonymous voting system
- 📊 Live leaderboard per game

## Tech Stack

| Layer    | Technology                                                                              |
| -------- | --------------------------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, Zustand, TanStack Query, Tailwind, shadcn/ui, Framer Motion |
| Backend  | Node.js, TypeScript, Express, Socket.io, Kysely, BullMQ, Pino                           |
| Storage  | PostgreSQL (permanent), Redis (active game state)                                       |
| Images   | Cloudinary                                                                              |
| Infra    | Docker, GitHub Actions, Railway                                                         |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker Desktop

### Setup

```bash
# Clone the repo
git clone https://github.com/offri1berger/make-it-meme.git
cd make-it-meme

# Install dependencies
pnpm install

# Start PostgreSQL and Redis
docker-compose up -d

# Set up environment variables
cp server/.env.example server/.env
# Fill in your values in server/.env

# Run database migrations
cd server && pnpm migrate:up

# Start the dev server
cd ..
pnpm dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3000`.

## Project Structure

```
make-it-meme/
├── client/          # React frontend
├── server/          # Node.js backend
└── packages/
    └── shared/      # Shared TypeScript types
```

## License

MIT
