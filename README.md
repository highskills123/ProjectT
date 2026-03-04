# ⚔ ProjectT – Idle RPG Mobile Game

A pixel-art idle RPG combining the best of **Rise of Kingdoms**, **Mu Online**, and **Call of Dragons**:
town building, hero RPG, idle auto-combat, research trees, and multiplayer alliances.

---

## Features

| Feature | Description |
|---------|-------------|
| 🏰 Town Building | Place and upgrade 10+ building types on a 7×9 grid |
| ⚔ Idle Combat | Auto-battle against waves of enemies; boss every 10 waves |
| 🧙 Hero System | 4 hero classes (Dark Knight, Dark Wizard, Fairy Elf, Summoner) with skills |
| ⚗ Research Tree | 14-node tech tree across Economy, Military, Magic & Defence |
| 🗺 Alliances | Multiplayer alliances via REST API + Socket.IO real-time chat |
| 💾 Offline Progress | Resources accumulate while away (capped at 8 hrs) |
| 📱 Mobile-Ready | Responsive canvas, touch input, PWA meta tags |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install all dependencies
```bash
npm run install:all
```

### Run in development mode (client + server)
```bash
npm run dev
```

- **Client** → http://localhost:8080
- **Server** → http://localhost:3000

### Build for production
```bash
npm run build
```

---

## Project Structure

```
ProjectT/
├── client/                  # Phaser 3 game (TypeScript + Webpack)
│   ├── src/
│   │   ├── scenes/          # Game screens (Town, Battle, Hero, Research, Alliance…)
│   │   ├── systems/         # Core logic (Building, Idle, Combat, Hero, Research)
│   │   ├── data/            # Static config (buildings, heroes, enemies, research)
│   │   └── utils/           # SaveManager, NetworkManager
│   └── assets/              # Place your sprite sheets and tilesets here
│       └── README.md        # Asset placement guide
├── server/                  # Node.js + Express + Socket.IO backend
│   └── src/
│       ├── routes/          # REST API (auth, game saves, alliances)
│       └── socket/          # Real-time event handlers
└── docs/
    └── GAME_DESIGN.md       # Full game design document
```

---

## Adding Your Assets

Copy your asset files into `client/assets/`:

| Your folder | → | Destination |
|-------------|---|-------------|
| `C:\Users\high\Desktop\tinyrpg\*.png` | → | `client/assets/sprites/` |
| `C:\Users\high\Documents\Free-Undead-Tileset-Top-Down-Pixel-Art\*.png` | → | `client/assets/tilesets/` |

See [`client/assets/README.md`](client/assets/README.md) for the full guide.
The game uses **procedural placeholder graphics** automatically if asset files are not present.

---

## Game Design

See [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) for the full design document including:
- Core game loop
- Hero classes and skills
- Research tree
- Alliance system
- Roadmap

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Game Engine | Phaser 3 |
| Language | TypeScript |
| Bundler | Webpack 5 |
| Server | Node.js + Express |
| Real-time | Socket.IO |
| Styling | CSS (mobile-first, pixel-art) |
