# Game Assets

Place your asset files here before running the game. The game will fall back
to procedurally generated placeholder graphics if files are missing.

## Sprite Sheets (from tinyrpg)

Copy your tinyrpg assets into the `sprites/` folder:

| File | Description |
|------|-------------|
| `sprites/characters.png` | Player/hero sprite sheet (16×32 px per frame) |
| `sprites/monsters.png`   | Enemy sprite sheet (16×16 px per frame) |
| `sprites/items.png`      | Equipment/items sprite sheet |
| `sprites/effects.png`    | Battle effect sprites |

Expected sprite sheet format:
- Frame size: **16×32** for humanoids, **16×16** for small enemies
- Animation rows: `down (walk)`, `left (walk)`, `right (walk)`, `up (walk)`, then attack/idle

---

## Tilesets (from Free-Undead-Tileset)

Copy your tileset files into the `tilesets/` folder:

| File | Description |
|------|-------------|
| `tilesets/tileset.png`   | Ground/environment tiles |
| `tilesets/objects.png`   | Decorative objects (trees, rocks, etc.) |
| `tilesets/walls.png`     | Wall/building tiles |
| `tilesets/dungeon.png`   | Dungeon/battle scene tiles |

---

## UI Assets

| File | Description |
|------|-------------|
| `ui/panel.png`           | Panel/window background |
| `ui/button.png`          | Button sprite sheet |
| `ui/icons.png`           | Resource/action icon sheet |
| `ui/frame.png`           | Hero card frame |

---

## Audio

| File | Description |
|------|-------------|
| `audio/bgm_town.mp3`     | Town background music |
| `audio/bgm_battle.mp3`   | Battle background music |
| `audio/bgm_menu.mp3`     | Main menu music |
| `audio/sfx_click.mp3`    | UI click sound |
| `audio/sfx_build.mp3`    | Building construction sound |
| `audio/sfx_levelup.mp3`  | Hero level-up sound |
| `audio/sfx_victory.mp3`  | Wave clear / victory sound |

---

## Where to Find Your Assets

- **TinyRPG**: `C:\Users\high\Desktop\tinyrpg`
- **Free Undead Tileset**: `C:\Users\high\Documents\Free-Undead-Tileset-Top-Down-Pixel-Art`

Copy the relevant files from those folders into the matching `sprites/`,
`tilesets/`, `ui/`, and `audio/` subdirectories here.
