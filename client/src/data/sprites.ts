/**
 * Sprite configuration for tinyrpg character assets.
 *
 * Asset placement instructions
 * ─────────────────────────────────────────────────────────────────────────────
 * Copy each character's folder from your tinyrpg source directory into:
 *   client/assets/sprites/tiny/<CharacterName>/
 *
 * Expected file structure per character (example for Archer):
 *   client/assets/sprites/tiny/Archer/Archer.png          ← combined all-in-one sheet
 *   client/assets/sprites/tiny/Archer/Archer-Attack01.png ← attack 1 frames only
 *   client/assets/sprites/tiny/Archer/Archer-Attack02.png ← attack 2 frames only
 *   (additional sheets like -Hurt.png, -Dead.png are optional)
 *
 * Frame dimensions
 * ─────────────────────────────────────────────────────────────────────────────
 * The defaults below match the craftpix-style "Tiny Hero / Tiny Enemy" packs:
 *   frameWidth : 96 px   frameHeight : 64 px
 * If your sheets use different dimensions (e.g. 48×48 or 100×100) set them
 * individually in the `frameWidth` / `frameHeight` fields of each entry.
 *
 * Combined sprite-sheet row layout (Archer.png / Knight.png / etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 *   Row 0 – Idle     (4 frames)
 *   Row 1 – Walk     (6 frames)
 *   Row 2 – Run      (8 frames)   ← some packs omit this; set runFrames:0
 *   Row 3 – Attack1  (6 frames)
 *   Row 4 – Attack2  (6 frames)   ← omit if no second attack in combined sheet
 *   Row 5 – Hurt     (3 frames)
 *   Row 6 – Dead     (6 frames)
 *
 * Separate attack sheets (Archer-Attack01.png, Archer-Attack02.png, …)
 * ─────────────────────────────────────────────────────────────────────────────
 *   Single row with all attack frames.
 */

/** Describes one animation strip within a sprite sheet. */
export interface AnimationDef {
  /** Phaser animation key (e.g. 'archer_idle'). */
  key: string;
  /** Row index within the sprite sheet (0-based). */
  row: number;
  /** Number of frames in this animation. */
  frameCount: number;
  /** Frames per second. */
  frameRate: number;
  /** Whether to loop. */
  repeat: number; // -1 = infinite
}

/** Describes one sprite-sheet file (main or attack-specific). */
export interface SheetDef {
  /** Path relative to `assets/` (e.g. 'sprites/tiny/Archer/Archer.png'). */
  path: string;
  /** Phaser texture key. */
  textureKey: string;
  /** Width of one frame in pixels. */
  frameWidth: number;
  /** Height of one frame in pixels. */
  frameHeight: number;
  /** Animations defined within this sheet. */
  animations: AnimationDef[];
}

/** Full sprite configuration for one tinyrpg character. */
export interface TinySpriteConfig {
  /** Display name used for documentation. */
  name: string;
  /** Role in the game – drives which data file this character maps to. */
  role: 'hero' | 'enemy';
  /**
   * The Phaser texture key used by BattleScene / HeroScene for the idle frame.
   * Defaults to the first sheet's textureKey.
   */
  defaultTextureKey: string;
  /** The key to use to play the idle animation. */
  idleAnimKey: string;
  /** The key to use to play the walk/run animation (may equal idleAnimKey). */
  walkAnimKey: string;
  /** The key(s) to play when the character attacks. */
  attackAnimKeys: string[];
  /** The key to play when the character takes damage. */
  hurtAnimKey: string;
  /** The key to play when the character dies. */
  deadAnimKey: string;
  /** All sprite-sheet files for this character. */
  sheets: SheetDef[];
}

// ── Shared frame defaults ─────────────────────────────────────────────────────
const W = 96;   // default frame width  (pixels)
const H = 64;   // default frame height (pixels)

// ── Helper: build a combined-sheet SheetDef ───────────────────────────────────
function combinedSheet(
  charName: string,
  textureKey: string,
  frameWidth = W,
  frameHeight = H,
  cfg: {
    idleFrames?:    number;
    walkFrames?:    number;
    runFrames?:     number;
    attack1Frames?: number;
    attack2Frames?: number;
    hurtFrames?:    number;
    deadFrames?:    number;
  } = {},
): SheetDef {
  const id   = cfg.idleFrames    ?? 4;
  const wk   = cfg.walkFrames    ?? 6;
  const rn   = cfg.runFrames     ?? 8;
  const at1  = cfg.attack1Frames ?? 6;
  const at2  = cfg.attack2Frames ?? 6;
  const hu   = cfg.hurtFrames    ?? 3;
  const de   = cfg.deadFrames    ?? 6;

  let row = 0;
  const animations: AnimationDef[] = [];

  if (id  > 0) { animations.push({ key: `${textureKey}_idle`,    row: row++, frameCount: id,  frameRate: 8,  repeat: -1 }); }
  if (wk  > 0) { animations.push({ key: `${textureKey}_walk`,    row: row++, frameCount: wk,  frameRate: 10, repeat: -1 }); }
  if (rn  > 0) { animations.push({ key: `${textureKey}_run`,     row: row++, frameCount: rn,  frameRate: 12, repeat: -1 }); }
  if (at1 > 0) { animations.push({ key: `${textureKey}_atk1`,    row: row++, frameCount: at1, frameRate: 12, repeat:  0 }); }
  if (at2 > 0) { animations.push({ key: `${textureKey}_atk2`,    row: row++, frameCount: at2, frameRate: 12, repeat:  0 }); }
  if (hu  > 0) { animations.push({ key: `${textureKey}_hurt`,    row: row++, frameCount: hu,  frameRate: 10, repeat:  0 }); }
  if (de  > 0) { animations.push({ key: `${textureKey}_dead`,    row: row,   frameCount: de,  frameRate: 8,  repeat:  0 }); }

  return {
    path:        `sprites/tiny/${charName}/${charName}.png`,
    textureKey,
    frameWidth,
    frameHeight,
    animations,
  };
}

// ── Helper: build a dedicated attack-sheet SheetDef ───────────────────────────
function attackSheet(
  charName: string,
  attackIndex: number,
  textureKey: string,
  animKey: string,
  frameCount = 6,
  frameWidth = W,
  frameHeight = H,
): SheetDef {
  return {
    path:        `sprites/tiny/${charName}/${charName}-Attack0${attackIndex}.png`,
    textureKey,
    frameWidth,
    frameHeight,
    animations: [
      { key: animKey, row: 0, frameCount, frameRate: 12, repeat: 0 },
    ],
  };
}

// ── Helper: build a single-row animation sheet SheetDef ───────────────────────
/**
 * Creates a SheetDef for a dedicated single-row PNG file.
 * File path convention: sprites/tiny/<CharName>/<CharName>-<fileSuffix>.png
 */
function singleRowSheet(
  charName: string,
  fileSuffix: string,
  textureKey: string,
  animKey: string,
  frameCount: number,
  frameRate: number,
  repeat: number,
  frameWidth = W,
  frameHeight = H,
): SheetDef {
  return {
    path:        `sprites/tiny/${charName}/${charName}-${fileSuffix}.png`,
    textureKey,
    frameWidth,
    frameHeight,
    animations: [
      { key: animKey, row: 0, frameCount, frameRate, repeat },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const TINY_SPRITES: Record<string, TinySpriteConfig> = {

  // ── HEROES ─────────────────────────────────────────────────────────────────

  Archer: {
    name: 'Archer',
    role: 'hero',
    defaultTextureKey: 'archer_sheet',
    idleAnimKey:    'archer_sheet_idle',
    walkAnimKey:    'archer_sheet_walk',
    attackAnimKeys: ['archer_atk1_anim', 'archer_atk2_anim'],
    hurtAnimKey:    'archer_sheet_hurt',
    deadAnimKey:    'archer_sheet_dead',
    sheets: [
      combinedSheet('Archer', 'archer_sheet'),
      attackSheet('Archer', 1, 'archer_atk1', 'archer_atk1_anim', 6),
      attackSheet('Archer', 2, 'archer_atk2', 'archer_atk2_anim', 6),
    ],
  },

  Knight: {
    name: 'Knight',
    role: 'hero',
    defaultTextureKey: 'knight_sheet',
    idleAnimKey:    'knight_sheet_idle',
    walkAnimKey:    'knight_sheet_walk',
    attackAnimKeys: ['knight_atk1_anim', 'knight_atk2_anim'],
    hurtAnimKey:    'knight_sheet_hurt',
    deadAnimKey:    'knight_sheet_dead',
    sheets: [
      combinedSheet('Knight', 'knight_sheet'),
      attackSheet('Knight', 1, 'knight_atk1', 'knight_atk1_anim', 6),
      attackSheet('Knight', 2, 'knight_atk2', 'knight_atk2_anim', 6),
    ],
  },

  Mage: {
    name: 'Mage',
    role: 'hero',
    defaultTextureKey: 'mage_sheet',
    idleAnimKey:    'mage_sheet_idle',
    walkAnimKey:    'mage_sheet_walk',
    attackAnimKeys: ['mage_atk1_anim', 'mage_atk2_anim'],
    hurtAnimKey:    'mage_sheet_hurt',
    deadAnimKey:    'mage_sheet_dead',
    sheets: [
      combinedSheet('Mage', 'mage_sheet'),
      attackSheet('Mage', 1, 'mage_atk1', 'mage_atk1_anim', 6),
      attackSheet('Mage', 2, 'mage_atk2', 'mage_atk2_anim', 6),
    ],
  },

  Wizard: {
    name: 'Wizard',
    role: 'hero',
    defaultTextureKey: 'wizard_idle',
    idleAnimKey:    'wizard_idle_anim',
    walkAnimKey:    'wizard_walk_anim',
    attackAnimKeys: ['wizard_atk1_anim', 'wizard_atk2_anim'],
    hurtAnimKey:    'wizard_hurt_anim',
    deadAnimKey:    'wizard_dead_anim',
    sheets: [
      // Individual animation sheets (100×100 frames) – named exactly as uploaded
      singleRowSheet('Wizard', 'Idle',            'wizard_idle',        'wizard_idle_anim',          6,  8, -1, 100, 100),
      singleRowSheet('Wizard', 'Walk',            'wizard_walk',        'wizard_walk_anim',          8, 10, -1, 100, 100),
      singleRowSheet('Wizard', 'Attack01',        'wizard_atk1',        'wizard_atk1_anim',          6, 12,  0, 100, 100),
      singleRowSheet('Wizard', 'Attack02',        'wizard_atk2',        'wizard_atk2_anim',          6, 12,  0, 100, 100),
      singleRowSheet('Wizard', 'Hurt',            'wizard_hurt',        'wizard_hurt_anim',          4, 10,  0, 100, 100),
      singleRowSheet('Wizard', 'DEATH',           'wizard_dead',        'wizard_dead_anim',          4,  8,  0, 100, 100),
      // Effect and shadow sheets
      singleRowSheet('Wizard', 'Attack01_Effect', 'wizard_atk1_effect', 'wizard_atk1_effect_anim',  10, 12,  0, 100, 100),
      singleRowSheet('Wizard', 'Attack02_Effect', 'wizard_atk2_effect', 'wizard_atk2_effect_anim',   7, 12,  0, 100, 100),
      singleRowSheet('Wizard', 'Shadow',          'wizard_shadow',      'wizard_shadow_anim',         1,  8, -1, 100, 100),
      singleRowSheet('Wizard', 'Shadow_death',    'wizard_shadow_dead', 'wizard_shadow_dead_anim',   4,  8,  0, 100, 100),
    ],
  },

  Elf: {
    name: 'Elf',
    role: 'hero',
    defaultTextureKey: 'elf_sheet',
    idleAnimKey:    'elf_sheet_idle',
    walkAnimKey:    'elf_sheet_walk',
    attackAnimKeys: ['elf_atk1_anim', 'elf_atk2_anim'],
    hurtAnimKey:    'elf_sheet_hurt',
    deadAnimKey:    'elf_sheet_dead',
    sheets: [
      combinedSheet('Elf', 'elf_sheet'),
      attackSheet('Elf', 1, 'elf_atk1', 'elf_atk1_anim', 6),
      attackSheet('Elf', 2, 'elf_atk2', 'elf_atk2_anim', 6),
    ],
  },

  Cleric: {
    name: 'Cleric',
    role: 'hero',
    defaultTextureKey: 'cleric_sheet',
    idleAnimKey:    'cleric_sheet_idle',
    walkAnimKey:    'cleric_sheet_walk',
    attackAnimKeys: ['cleric_atk1_anim', 'cleric_atk2_anim'],
    hurtAnimKey:    'cleric_sheet_hurt',
    deadAnimKey:    'cleric_sheet_dead',
    sheets: [
      combinedSheet('Cleric', 'cleric_sheet'),
      attackSheet('Cleric', 1, 'cleric_atk1', 'cleric_atk1_anim', 6),
      attackSheet('Cleric', 2, 'cleric_atk2', 'cleric_atk2_anim', 6),
    ],
  },

  Rogue: {
    name: 'Rogue',
    role: 'hero',
    defaultTextureKey: 'rogue_sheet',
    idleAnimKey:    'rogue_sheet_idle',
    walkAnimKey:    'rogue_sheet_walk',
    attackAnimKeys: ['rogue_atk1_anim', 'rogue_atk2_anim'],
    hurtAnimKey:    'rogue_sheet_hurt',
    deadAnimKey:    'rogue_sheet_dead',
    sheets: [
      combinedSheet('Rogue', 'rogue_sheet'),
      attackSheet('Rogue', 1, 'rogue_atk1', 'rogue_atk1_anim', 6),
      attackSheet('Rogue', 2, 'rogue_atk2', 'rogue_atk2_anim', 6),
    ],
  },

  /**
   * Priest – currently only spell-effect sheets are available
   * (Attack_effect and Heal_Effect).  Full character sheets
   * (Idle, Walk, Attack, Hurt, Death) should be added to
   * client/assets/sprites/tiny/Priest/ once they are exported from
   * Priest.aseprite.  Until then all state keys fall back to the attack
   * effect animation so the character is at least visible in battle.
   */
  Priest: {
    name: 'Priest',
    role: 'hero',
    defaultTextureKey: 'priest_atk_effect',
    idleAnimKey:    'priest_atk_effect_anim',   // fallback – no idle sheet yet
    walkAnimKey:    'priest_atk_effect_anim',   // fallback – no walk sheet yet
    attackAnimKeys: ['priest_atk_effect_anim'],
    hurtAnimKey:    'priest_atk_effect_anim',   // fallback – no hurt sheet yet
    deadAnimKey:    'priest_heal_effect_anim',  // use heal effect as death anim for now
    sheets: [
      // Effect sheets (100×100 frames) – named exactly as uploaded
      singleRowSheet('Priest', 'Attack_effect', 'priest_atk_effect',  'priest_atk_effect_anim',  5, 12, 0, 100, 100),
      singleRowSheet('Priest', 'Heal_Effect',   'priest_heal_effect', 'priest_heal_effect_anim', 4,  8, 0, 100, 100),
    ],
  },

  Samurai: {
    name: 'Samurai',
    role: 'hero',
    defaultTextureKey: 'samurai_sheet',
    idleAnimKey:    'samurai_sheet_idle',
    walkAnimKey:    'samurai_sheet_walk',
    attackAnimKeys: ['samurai_atk1_anim', 'samurai_atk2_anim'],
    hurtAnimKey:    'samurai_sheet_hurt',
    deadAnimKey:    'samurai_sheet_dead',
    sheets: [
      combinedSheet('Samurai', 'samurai_sheet'),
      attackSheet('Samurai', 1, 'samurai_atk1', 'samurai_atk1_anim', 6),
      attackSheet('Samurai', 2, 'samurai_atk2', 'samurai_atk2_anim', 6),
    ],
  },

  // ── ENEMIES ────────────────────────────────────────────────────────────────

  Skeleton: {
    name: 'Skeleton',
    role: 'enemy',
    defaultTextureKey: 'skeleton_sheet',
    idleAnimKey:    'skeleton_sheet_idle',
    walkAnimKey:    'skeleton_sheet_walk',
    attackAnimKeys: ['skeleton_atk1_anim'],
    hurtAnimKey:    'skeleton_sheet_hurt',
    deadAnimKey:    'skeleton_sheet_dead',
    sheets: [
      combinedSheet('Skeleton', 'skeleton_sheet', W, H, { attack2Frames: 0 }),
      attackSheet('Skeleton', 1, 'skeleton_atk1', 'skeleton_atk1_anim', 6),
    ],
  },

  Zombie: {
    name: 'Zombie',
    role: 'enemy',
    defaultTextureKey: 'zombie_sheet',
    idleAnimKey:    'zombie_sheet_idle',
    walkAnimKey:    'zombie_sheet_walk',
    attackAnimKeys: ['zombie_atk1_anim'],
    hurtAnimKey:    'zombie_sheet_hurt',
    deadAnimKey:    'zombie_sheet_dead',
    sheets: [
      combinedSheet('Zombie', 'zombie_sheet', W, H, { attack2Frames: 0 }),
      attackSheet('Zombie', 1, 'zombie_atk1', 'zombie_atk1_anim', 6),
    ],
  },

  Vampire: {
    name: 'Vampire',
    role: 'enemy',
    defaultTextureKey: 'vampire_sheet',
    idleAnimKey:    'vampire_sheet_idle',
    walkAnimKey:    'vampire_sheet_walk',
    attackAnimKeys: ['vampire_atk1_anim', 'vampire_atk2_anim'],
    hurtAnimKey:    'vampire_sheet_hurt',
    deadAnimKey:    'vampire_sheet_dead',
    sheets: [
      combinedSheet('Vampire', 'vampire_sheet'),
      attackSheet('Vampire', 1, 'vampire_atk1', 'vampire_atk1_anim', 6),
      attackSheet('Vampire', 2, 'vampire_atk2', 'vampire_atk2_anim', 6),
    ],
  },

  Lich: {
    name: 'Lich',
    role: 'enemy',
    defaultTextureKey: 'lich_sheet',
    idleAnimKey:    'lich_sheet_idle',
    walkAnimKey:    'lich_sheet_walk',
    attackAnimKeys: ['lich_atk1_anim', 'lich_atk2_anim'],
    hurtAnimKey:    'lich_sheet_hurt',
    deadAnimKey:    'lich_sheet_dead',
    sheets: [
      combinedSheet('Lich', 'lich_sheet'),
      attackSheet('Lich', 1, 'lich_atk1', 'lich_atk1_anim', 6),
      attackSheet('Lich', 2, 'lich_atk2', 'lich_atk2_anim', 6),
    ],
  },

  Werewolf: {
    name: 'Werewolf',
    role: 'enemy',
    defaultTextureKey: 'werewolf_sheet',
    idleAnimKey:    'werewolf_sheet_idle',
    walkAnimKey:    'werewolf_sheet_walk',
    attackAnimKeys: ['werewolf_atk1_anim', 'werewolf_atk2_anim'],
    hurtAnimKey:    'werewolf_sheet_hurt',
    deadAnimKey:    'werewolf_sheet_dead',
    sheets: [
      combinedSheet('Werewolf', 'werewolf_sheet'),
      attackSheet('Werewolf', 1, 'werewolf_atk1', 'werewolf_atk1_anim', 6),
      attackSheet('Werewolf', 2, 'werewolf_atk2', 'werewolf_atk2_anim', 6),
    ],
  },

  Goblin: {
    name: 'Goblin',
    role: 'enemy',
    defaultTextureKey: 'goblin_sheet',
    idleAnimKey:    'goblin_sheet_idle',
    walkAnimKey:    'goblin_sheet_walk',
    attackAnimKeys: ['goblin_atk1_anim'],
    hurtAnimKey:    'goblin_sheet_hurt',
    deadAnimKey:    'goblin_sheet_dead',
    sheets: [
      combinedSheet('Goblin', 'goblin_sheet', W, H, { attack2Frames: 0 }),
      attackSheet('Goblin', 1, 'goblin_atk1', 'goblin_atk1_anim', 6),
    ],
  },

  Orc: {
    name: 'Orc',
    role: 'enemy',
    defaultTextureKey: 'orc_idle',
    idleAnimKey:    'orc_idle_anim',
    walkAnimKey:    'orc_walk_anim',
    attackAnimKeys: ['orc_atk1_anim', 'orc_atk2_anim'],
    hurtAnimKey:    'orc_hurt_anim',
    deadAnimKey:    'orc_dead_anim',
    sheets: [
      // Individual animation sheets (100×100 frames) – named exactly as uploaded
      singleRowSheet('Orc', 'Idle',            'orc_idle',        'orc_idle_anim',          6,  8, -1, 100, 100),
      singleRowSheet('Orc', 'Walk',            'orc_walk',        'orc_walk_anim',          8, 10, -1, 100, 100),
      singleRowSheet('Orc', 'Attack01',        'orc_atk1',        'orc_atk1_anim',          6, 12,  0, 100, 100),
      singleRowSheet('Orc', 'Attack02',        'orc_atk2',        'orc_atk2_anim',          6, 12,  0, 100, 100),
      singleRowSheet('Orc', 'Hurt',            'orc_hurt',        'orc_hurt_anim',          4, 10,  0, 100, 100),
      singleRowSheet('Orc', 'Death',           'orc_dead',        'orc_dead_anim',          4,  8,  0, 100, 100),
      // Effect and shadow sheets
      singleRowSheet('Orc', 'attack01_Effect', 'orc_atk1_effect', 'orc_atk1_effect_anim',   6, 12,  0, 100, 100),
      singleRowSheet('Orc', 'attack02_Effect', 'orc_atk2_effect', 'orc_atk2_effect_anim',   6, 12,  0, 100, 100),
      singleRowSheet('Orc', 'shadow',          'orc_shadow',      'orc_shadow_anim',         1,  8, -1, 100, 100),
      singleRowSheet('Orc', 'shadow_attack02', 'orc_shadow_atk2', 'orc_shadow_atk2_anim',   6, 12,  0, 100, 100),
      singleRowSheet('Orc', 'shadow_death',    'orc_shadow_dead', 'orc_shadow_dead_anim',   4,  8,  0, 100, 100),
    ],
  },

  Troll: {
    name: 'Troll',
    role: 'enemy',
    defaultTextureKey: 'troll_sheet',
    idleAnimKey:    'troll_sheet_idle',
    walkAnimKey:    'troll_sheet_walk',
    attackAnimKeys: ['troll_atk1_anim', 'troll_atk2_anim'],
    hurtAnimKey:    'troll_sheet_hurt',
    deadAnimKey:    'troll_sheet_dead',
    sheets: [
      combinedSheet('Troll', 'troll_sheet'),
      attackSheet('Troll', 1, 'troll_atk1', 'troll_atk1_anim', 6),
      attackSheet('Troll', 2, 'troll_atk2', 'troll_atk2_anim', 6),
    ],
  },

  Golem: {
    name: 'Golem',
    role: 'enemy',
    defaultTextureKey: 'golem_sheet',
    idleAnimKey:    'golem_sheet_idle',
    walkAnimKey:    'golem_sheet_walk',
    attackAnimKeys: ['golem_atk1_anim', 'golem_atk2_anim'],
    hurtAnimKey:    'golem_sheet_hurt',
    deadAnimKey:    'golem_sheet_dead',
    sheets: [
      combinedSheet('Golem', 'golem_sheet'),
      attackSheet('Golem', 1, 'golem_atk1', 'golem_atk1_anim', 6),
      attackSheet('Golem', 2, 'golem_atk2', 'golem_atk2_anim', 6),
    ],
  },

  Dragonling: {
    name: 'Dragonling',
    role: 'enemy',
    defaultTextureKey: 'dragonling_sheet',
    idleAnimKey:    'dragonling_sheet_idle',
    walkAnimKey:    'dragonling_sheet_walk',
    attackAnimKeys: ['dragonling_atk1_anim', 'dragonling_atk2_anim'],
    hurtAnimKey:    'dragonling_sheet_hurt',
    deadAnimKey:    'dragonling_sheet_dead',
    sheets: [
      combinedSheet('Dragonling', 'dragonling_sheet'),
      attackSheet('Dragonling', 1, 'dragonling_atk1', 'dragonling_atk1_anim', 6),
      attackSheet('Dragonling', 2, 'dragonling_atk2', 'dragonling_atk2_anim', 6),
    ],
  },

  Slime: {
    name: 'Slime',
    role: 'enemy',
    defaultTextureKey: 'slime_sheet',
    idleAnimKey:    'slime_sheet_idle',
    walkAnimKey:    'slime_sheet_walk',
    attackAnimKeys: ['slime_atk1_anim'],
    hurtAnimKey:    'slime_sheet_hurt',
    deadAnimKey:    'slime_sheet_dead',
    sheets: [
      combinedSheet('Slime', 'slime_sheet', W, H, { runFrames: 0, attack2Frames: 0 }),
      attackSheet('Slime', 1, 'slime_atk1', 'slime_atk1_anim', 6),
    ],
  },

  Spider: {
    name: 'Spider',
    role: 'enemy',
    defaultTextureKey: 'spider_sheet',
    idleAnimKey:    'spider_sheet_idle',
    walkAnimKey:    'spider_sheet_walk',
    attackAnimKeys: ['spider_atk1_anim'],
    hurtAnimKey:    'spider_sheet_hurt',
    deadAnimKey:    'spider_sheet_dead',
    sheets: [
      combinedSheet('Spider', 'spider_sheet', W, H, { runFrames: 0, attack2Frames: 0 }),
      attackSheet('Spider', 1, 'spider_atk1', 'spider_atk1_anim', 6),
    ],
  },

  // Boss / Death Lord
  Boss: {
    name: 'Boss',
    role: 'enemy',
    defaultTextureKey: 'boss_sheet',
    idleAnimKey:    'boss_sheet_idle',
    walkAnimKey:    'boss_sheet_walk',
    attackAnimKeys: ['boss_atk1_anim', 'boss_atk2_anim'],
    hurtAnimKey:    'boss_sheet_hurt',
    deadAnimKey:    'boss_sheet_dead',
    sheets: [
      combinedSheet('Boss', 'boss_sheet', 128, 80),
      attackSheet('Boss', 1, 'boss_atk1', 'boss_atk1_anim', 8, 128, 80),
      attackSheet('Boss', 2, 'boss_atk2', 'boss_atk2_anim', 8, 128, 80),
    ],
  },
};

/**
 * Returns the TinySpriteConfig for the given game-level key.
 *
 * heroClass keys (from heroes.ts): WARRIOR → Knight, MAGE → Mage, ARCHER → Archer, ELF → Elf
 * enemy type keys (from enemies.ts): skeleton, zombie, goblin, orc, troll, vampire,
 *   slime, spider, golem, lich, werewolf, dragonling, boss
 */
export const HERO_CLASS_TO_SPRITE: Record<string, string> = {
  WARRIOR: 'Knight',
  MAGE:    'Mage',
  ARCHER:  'Archer',
  ELF:     'Elf',
};

export const ENEMY_TYPE_TO_SPRITE: Record<string, string> = {
  skeleton:   'Skeleton',
  zombie:     'Zombie',
  vampire:    'Vampire',
  lich:       'Lich',
  werewolf:   'Werewolf',
  dragonling: 'Dragonling',
  goblin:     'Goblin',
  orc:        'Orc',
  troll:      'Troll',
  golem:      'Golem',
  slime:      'Slime',
  spider:     'Spider',
  boss:       'Boss',
};

/** Resolve the TinySpriteConfig for a given heroClass key (e.g. 'WARRIOR'). */
export function getHeroSprite(heroClass: string): TinySpriteConfig | undefined {
  const spriteName = HERO_CLASS_TO_SPRITE[heroClass];
  return spriteName ? TINY_SPRITES[spriteName] : undefined;
}

/** Resolve the TinySpriteConfig for a given enemy type key (e.g. 'skeleton'). */
export function getEnemySprite(enemyType: string): TinySpriteConfig | undefined {
  const spriteName = ENEMY_TYPE_TO_SPRITE[enemyType];
  return spriteName ? TINY_SPRITES[spriteName] : undefined;
}
