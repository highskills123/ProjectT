# Game Assets

Place your asset files here before running the game. The game falls back to
procedurally generated placeholder graphics if files are missing, so it always
boots even without real assets.

---

## Tinyrpg Character Sprite Sheets

Copy each character folder from your tinyrpg source directory into
`sprites/tiny/`.  The folder and file names must match **exactly** (case-sensitive).

### Expected folder layout

```
client/assets/sprites/tiny/
  Archer/
    Archer.png            ← combined sheet: idle + walk + run + attack + hurt + dead
    Archer-Attack01.png   ← attack-1 frames only (single row)
    Archer-Attack02.png   ← attack-2 frames only (single row)
  Knight/
    Knight.png
    Knight-Attack01.png
    Knight-Attack02.png
  Mage/
    Mage.png
    Mage-Attack01.png
    Mage-Attack02.png
  … (one folder per character below)
```

### Default sprite-sheet frame dimensions

| Dimension    | Default value | Override location          |
|--------------|---------------|----------------------------|
| Frame width  | 96 px         | `frameWidth` in sprites.ts |
| Frame height | 64 px         | `frameHeight` in sprites.ts|
| Boss frame W | 128 px        | `frameWidth` in sprites.ts |
| Boss frame H | 80 px         | `frameHeight` in sprites.ts|

If your sheets use different dimensions, edit the `frameWidth` / `frameHeight`
fields in `client/src/data/sprites.ts`.

### Combined sheet row layout (`CharacterName.png`)

| Row | Animation   | Default frame count |
|-----|-------------|---------------------|
| 0   | Idle        | 4                   |
| 1   | Walk        | 6                   |
| 2   | Run         | 8                   |
| 3   | Attack 1    | 6                   |
| 4   | Attack 2    | 6                   |
| 5   | Hurt        | 3                   |
| 6   | Dead        | 6                   |

Set `runFrames: 0` or `attack2Frames: 0` in `sprites.ts` if an animation row
is absent from a particular character's sheet.

### Separate attack sheets (`CharacterName-Attack01.png`, `-Attack02.png`)

Single row of frames.  Default: 6 frames at 12 fps.

---

### Hero characters (maps to in-game hero classes)

| Folder name | In-game hero class | Role    |
|-------------|-------------------|---------|
| `Archer`    | ARCHER            | Ranged  |
| `Knight`    | WARRIOR           | Tank    |
| `Mage`      | MAGE              | Mage    |
| `Wizard`    | *(standalone – not yet assigned to a hero class; copy anyway for future use)* | Mage |
| `Elf`       | ELF               | Support |
| `Cleric`    | *(future hero)*   | Support |
| `Rogue`     | *(future hero)*   | DPS     |
| `Samurai`   | *(future hero)*   | DPS     |

> **Note:** To assign a new folder to a hero class, add an entry to
> `HERO_CLASS_TO_SPRITE` in `client/src/data/sprites.ts`.

### Enemy characters (maps to in-game enemy types)

| Folder name  | Enemy type   | Spawn wave |
|--------------|--------------|-----------|
| `Skeleton`   | skeleton     | 1         |
| `Zombie`     | zombie       | 1         |
| `Goblin`     | goblin       | 2         |
| `Slime`      | slime        | 2         |
| `Spider`     | spider       | 3         |
| `Orc`        | orc          | 3         |
| `Troll`      | troll        | 4         |
| `Vampire`    | vampire      | 5         |
| `Golem`      | golem        | 6         |
| `Lich`       | lich         | 8         |
| `Werewolf`   | werewolf     | 12        |
| `Dragonling` | dragonling   | 16        |
| `Boss`       | boss         | 10        |

---

## Tilesets (from Free-Undead-Tileset)

Copy your tileset files into the `tilesets/` folder:

| File                   | Description                          |
|------------------------|--------------------------------------|
| `tilesets/tileset.png` | Ground/environment tiles             |
| `tilesets/objects.png` | Decorative objects (trees, rocks, …) |
| `tilesets/walls.png`   | Wall/building tiles                  |
| `tilesets/dungeon.png` | Dungeon/battle scene tiles           |

---

## UI Assets

| File              | Description               |
|-------------------|---------------------------|
| `ui/panel.png`    | Panel/window background   |
| `ui/button.png`   | Button sprite sheet       |
| `ui/icons.png`    | Resource/action icon sheet|
| `ui/frame.png`    | Hero card frame           |

---

## Audio

| File                   | Description                    |
|------------------------|--------------------------------|
| `audio/bgm_town.mp3`   | Town background music          |
| `audio/bgm_battle.mp3` | Battle background music        |
| `audio/bgm_menu.mp3`   | Main menu music                |
| `audio/sfx_click.mp3`  | UI click sound                 |
| `audio/sfx_build.mp3`  | Building construction sound    |
| `audio/sfx_levelup.mp3`| Hero level-up sound            |
| `audio/sfx_victory.mp3`| Wave clear / victory sound     |

---

## Where to Find Your Assets

- **TinyRPG characters**: `C:\Users\high\Desktop\tinyrpg`  
  Copy each `<CharacterName>\<CharacterName>\` folder into `sprites/tiny/`.
- **Free Undead Tileset**: `C:\Users\high\Documents\Free-Undead-Tileset-Top-Down-Pixel-Art`  
  Copy the relevant PNG files into `tilesets/`.

---

## Adjusting frame sizes or animation frame counts

All configuration lives in one place:

```
client/src/data/sprites.ts
```

- `frameWidth` / `frameHeight` – pixel dimensions of a single frame
- `idleFrames`, `walkFrames`, `runFrames`, `attack1Frames`, `attack2Frames`,
  `hurtFrames`, `deadFrames` – number of frames in each animation row
- `frameRate` – playback speed (fps) per animation
- `HERO_CLASS_TO_SPRITE` – maps hero class keys → character folder name
- `ENEMY_TYPE_TO_SPRITE` – maps enemy type keys → character folder name

