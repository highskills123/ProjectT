# ProjectT – Game Design Document

## Overview

ProjectT is an **idle RPG mobile game** combining elements from:
- **Rise of Kingdoms** – real-time city building, resource gathering, alliance wars
- **Mu Online** – class-based hero RPG, dark fantasy aesthetic, equipment system
- **Call of Dragons** – dragon companions, faction-based warfare, fantasy world

**Platform**: Mobile (iOS / Android via Capacitor) + Web browser  
**Genre**: Idle RPG + City Builder + Multiplayer Strategy  
**Art Style**: Top-down pixel art (16×32 heroes, 32×32 tiles)

---

## Core Game Loop

```
Build Town → Gather Resources → Level Heroes → Fight Battles → Earn Loot → Build Town
                                       ↕
                               Join Alliance → Alliance Wars → Territory Control
```

---

## Scenes & Navigation

| Scene | Purpose |
|-------|---------|
| **BootScene** | Generate placeholder textures |
| **PreloadScene** | Load real assets |
| **MainMenuScene** | Start screen, continue/new game |
| **TownScene** | City building on a grid map |
| **BattleScene** | Idle auto-combat with waves of enemies |
| **HeroScene** | Hero roster – unlock, level, equip |
| **ResearchScene** | Tech tree with 4 categories |
| **AllianceScene** | Multiplayer alliance management |
| **UIScene** | Persistent HUD overlay |

---

## Town Building

- **Grid**: 7 × 9 cells
- **Buildings**: Castle, Barracks, Farm, Gold Mine, Lumber Mill, Market, Blacksmith, Mage Tower, City Wall, Tavern
- **Upgrade System**: Each building has up to 20–25 levels
- **Castle Level gates** other buildings (e.g. Market requires Castle Lv3)
- **Offline Progression**: Resources accumulate while offline (capped at 8 hours)

### Resources
| Resource | Source | Use |
|----------|--------|-----|
| 💰 Gold   | Mine, Market | Buy heroes, research |
| 🌾 Food   | Farm         | Army upkeep |
| 🪵 Wood   | Lumber Mill  | Construction |
| 🪨 Stone  | (future)     | Advanced buildings |
| ✨ Mana   | Mage Tower   | Magic research |
| 💎 Gems   | Events / IAP | Premium currency |

---

## Hero System

Inspired by Mu Online's class system:

| Class | Mu Online Equivalent | Role |
|-------|---------------------|------|
| Dark Knight | Dark Knight | Tank/DPS |
| Dark Wizard | Dark Wizard | Mage AoE |
| Fairy Elf   | Fairy Elf   | Ranged/Support |
| Summoner    | Summoner    | Buff/Dragon |

- **Rarity**: 1–5 stars (affects base stats)
- **Max 3 Active Heroes** in battle at once
- **Skill Cooldowns**: Each hero has 4 skills
- **EXP & Leveling**: Heroes gain EXP from battles; stats increase each level
- **Equipment** (future): Weapon, Armor, Helmet, Accessory slots

---

## Battle System (Idle Auto-Combat)

- **Wave-based**: Each wave lasts 30 seconds or until enemies are defeated
- **Auto-fight**: Heroes and enemies attack automatically every 2 seconds
- **Boss Waves**: Every 10th wave spawns a boss enemy
- **Enemy Scaling**: Stats scale by +15% per wave
- **Loot**: Gold + EXP on wave clear
- **Auto-revive**: Heroes cannot die permanently (they survive at 1 HP)

### Enemy Types (inspired by undead tileset theme)
| Enemy | First Wave | Role |
|-------|-----------|------|
| Skeleton | 1 | Basic melee |
| Zombie | 1 | Tanky slow |
| Vampire | 5 | High damage |
| Lich | 8 | Spell caster |
| Werewolf | 12 | Berserker |
| Dragonling | 16 | AoE fire |
| Death Lord | 10 (boss) | Raid boss |

---

## Research Tree

Four categories, each with interconnected nodes:

- **Economy**: Gold Mining → Farming → Logging → Trade Routes
- **Military**: Swordsmanship → Archery → Troop Training → Battle Tactics
- **Magic**: Arcane Study → Mana Control → Dragon Lore
- **Defence**: Fortification → Healing Arts

---

## Alliance / Multiplayer

Inspired by Rise of Kingdoms & Call of Dragons:

- **Create / Join** alliances (max 50 members)
- **Alliance Chat** via Socket.IO real-time messaging
- **Alliance Wars** (future): Territory battles on a world map
- **Donations**: Share resources with alliance members
- **Tech Bonuses**: Alliance-wide research unlocks buffs
- **Rank System**: Leader, Officer, Member roles

---

## Technical Architecture

```
client/               Phaser 3 + TypeScript + Webpack
  src/scenes/         Game screens
  src/systems/        Core game logic
  src/data/           Static configuration
  src/utils/          Save & network helpers
  assets/             Sprites, tilesets, UI, audio

server/               Node.js + Express + Socket.IO + TypeScript
  src/routes/         REST API (auth, game, alliances)
  src/socket/         Real-time event handlers
  src/models/         Data models (future: DB integration)
```

### Data Persistence
- **Client**: `localStorage` for save games (offline first)
- **Server**: In-memory (dev) → PostgreSQL/MongoDB (production)
- **Sync**: Save data uploaded to server when online

---

## Asset Integration Guide

### TinyRPG Sprites (`C:\Users\high\Desktop\tinyrpg`)
Copy into `client/assets/sprites/`:
- `characters.png` – hero sprite sheets (16×32 per frame)
- `monsters.png` – enemy sprites (16×16 per frame)
- Phaser loads them as sprite sheets with `frameWidth: 16, frameHeight: 32`

### Free-Undead-Tileset (`C:\Users\high\Documents\Free-Undead-Tileset-Top-Down-Pixel-Art`)
Copy into `client/assets/tilesets/`:
- Ground/floor tiles → `tileset.png`
- Objects/decorations → `objects.png`
- Used for town grid and battle arena backgrounds

See `client/assets/README.md` for full asset placement guide.

---

## Roadmap

### v0.1 (Current)
- [x] Core town building grid
- [x] Idle resource production
- [x] Wave-based auto-battle
- [x] 4 hero classes with skills
- [x] Research tech tree
- [x] Alliance UI + server API
- [x] Real-time Socket.IO foundation
- [x] Offline progression

### v0.2 (Planned)
- [ ] Equipment crafting (Blacksmith)
- [ ] Troop training system (Barracks)
- [ ] World map with territory control
- [ ] Alliance wars
- [ ] Achievement system
- [ ] Daily/weekly events

### v0.3 (Future)
- [ ] Dragon companion system
- [ ] PvP arena
- [ ] Guild dungeon raids
- [ ] Season pass / battle pass
- [ ] Capacitor packaging for iOS/Android
