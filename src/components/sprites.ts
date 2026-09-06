// ============================================================
// Sprites de pixel art originales, definidos como cuadrículas de
// caracteres. Cada carácter mapea a un color mediante una "legend".
// '.' siempre significa "transparente".
// Diseños propios inspirados en heráldica de fantasía medieval,
// sin reproducir material con copyright.
// ============================================================
import type { IconKey } from '../types';

export interface Sprite {
  grid: string[];
  legend: Record<string, string>;
  cols: number;
}

function sprite(grid: string[], legend: Record<string, string>): Sprite {
  const cols = Math.max(...grid.map((r) => r.length));
  const normalized = grid.map((r) => (r.length >= cols ? r.slice(0, cols) : r.padEnd(cols, '.')));
  return { grid: normalized, legend, cols };
}

const C = {
  gold: '#c9a227',
  darkGold: '#8a6d1a',
  bone: '#e8dfc8',
  stone: '#5a5a63',
  darkStone: '#37373e',
  night: '#1b2545',
  black: '#14141a',
  red: '#7a1f1f',
  darkRed: '#4a1010',
  ember: '#e07a3f',
  flame: '#f4b942',
  ice: '#a8d8ea',
  green: '#4f6b3a',
  darkGreen: '#33461f',
  bronze: '#8a5a2b',
  silver: '#c7c7d1',
  skin: '#d7a374',
  skinDark: '#b6825a',
  hairBrown: '#4a3323',
  hairBlonde: '#d8c273',
  hairGrey: '#9a9a9a',
  hairSilver: '#ece6d6',
  hairDark: '#241a12',
  hairWarmGrey: '#8f8778',
  eye: '#14141a',
  wood: '#5a3d24',
  steel: '#9aa0a8',
  steelDark: '#5f666e',
  patch: '#14141a',
};

function dragonSprite(body: string, wing: string): Sprite {
  return sprite(
    [
      '....WW..........',
      '...WWWW.........',
      '..WWWWWW........',
      '.WWWWWWWW.......',
      'BBWWWWWWWW......',
      'BBBBWWWWWWBB....',
      '.BBBBBBBBBBBB...',
      '..BBBBEBBBBBBB..',
      '...BBBBBBBBBBB..',
      '....BB.....BBB..',
      '...BB.......BB..',
      '..BB.........BB.',
    ],
    { W: wing, B: body, E: C.flame }
  );
}

const MALE_ROWS = [
  '....HHHHHH..',
  '...HHHHHHHH.',
  '..HSSSSSSSH.',
  '.HSSSSSSSSH.',
  '.HSEESSSSEH.',
  '.HSSSSSSSSH.',
  '.HSSSSSSSSH.',
  '..HSSSSSSH..',
  '...SSSSSS...',
  '..CCCCCCCC..',
  '.CCCCCCCCCC.',
  'CCCCCCCCCCCC',
];

const FEMALE_ROWS = [
  '..HHHHHHHH..',
  '.HHHHHHHHHH.',
  'HHSSSSSSSSHH',
  'HSSSSSSSSSSH',
  'HSEESSSSEESH',
  'HSSSSSSSSSSH',
  'HSSSSSSSSSSH',
  'HHSSSSSSSSHH',
  'HH.SSSSSS.HH',
  '..CCCCCCCC..',
  '.CCCCCCCCCC.',
  'CCCCCCCCCCCC',
];

const OLD_ROWS = [
  '....GGGGGG..',
  '...GGGGGGGG.',
  '..GSSSSSSSG.',
  '.GSSSSSSSSG.',
  '.GSEESSSSEG.',
  '.GSSSSSSSSG.',
  '.GSSGGGGSSG.',
  '..GGGGGGGG..',
  '...GGGGGG...',
  '..CCCCCCCC..',
  '.CCCCCCCCCC.',
  'CCCCCCCCCCCC',
];

const AEMOND_ROWS = [
  '....HHHHHH..',
  '...HHHHHHHH.',
  '..HSSSSSSSH.',
  '.HSSSSSSSSH.',
  '.HSXXSSSSEH.',
  '.HSXXSSSSSH.',
  '.HSSSSSSSSH.',
  '..HSSSSSSH..',
  '...SSSSSS...',
  '..CCCCCCCC..',
  '.CCCCCCCCCC.',
  'CCCCCCCCCCCC',
];

const KNIGHT_ROWS = [
  '....KKKKKK..',
  '...KKKKKKKK.',
  '..KKKKKKKKK.',
  '.KSSSSSSSSK.',
  '.KSEESSSSEK.',
  '.KSSSSSSSSK.',
  '.KSSSSSSSSK.',
  '..KSSSSSSK..',
  '...SSSSSS...',
  '..CCCCCCCC..',
  '.CCCCCCCCCC.',
  'CCCCCCCCCCCC',
];

function portraitSprite(hair: string, skin: string, rows: string[] = MALE_ROWS): Sprite {
  return sprite(rows, { H: hair, S: skin, E: C.eye, C: C.night, X: C.patch, K: C.steel });
}

const sprites: Record<IconKey, Sprite> = {
  castle: sprite(
    [
      '..BB....BB....BB..',
      '..BB....BB....BB..',
      '.BBBB..BBBB..BBBB.',
      'BBBBBBBBBBBBBBBBBB',
      'BB.BBBBBBBBBBBB.BB',
      'BB.BB..BBBB..BB.BB',
      'BB.BB..BBBB..BB.BB',
      'BB.BB..BBBB..BB.BB',
      'BB.BB..WWWW..BB.BB',
      'BB.BB..WWWW..BB.BB',
      'BBBBBBBWWWWBBBBBBB',
    ],
    { B: C.stone, W: C.darkStone }
  ),
  tower: sprite(
    [
      '.BB.BB.BB.',
      '.BBBBBBBB.',
      '.BBBBBBBB.',
      '..BBBBBB..',
      '..B....B..',
      '..B.WW.B..',
      '..B.WW.B..',
      '..BBBBBB..',
      '.BBBBBBBB.',
      'BBBBBBBBBB',
    ],
    { B: C.darkStone, W: C.night }
  ),
  wall: sprite(
    [
      'B.B.B.B.B.B.B.B.',
      'BBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBB',
      'B..B..B..B..B..B',
      'BBBBBBBBBBBBBBBB',
      'IIIIIIIIIIIIIIII',
    ],
    { B: C.ice, I: C.bone }
  ),
  'iron-throne': sprite(
    [
      'S..............S',
      'S.SS.SS.SS.SS..S',
      'S..............S',
      'SSSSSSSSSSSSSSSS',
      'S..............S',
      'S..............S',
      'S..............S',
      'SSSSSSSSSSSSSSSS',
      '..SS........SS..',
      '..SS........SS..',
    ],
    { S: C.stone }
  ),
  crown: sprite(
    [
      'G....G....G....G',
      'GG..GGG..GGG..GG',
      'GGGGGGGGGGGGGGGG',
      '.RRRRRRRRRRRRRR.',
      'GGGGGGGGGGGGGGGG',
    ],
    { G: C.gold, R: C.red }
  ),
  sword: sprite(
    [
      '.......S........',
      '.......S........',
      '.......S........',
      '.......S........',
      '.......S........',
      '.......S........',
      '......GGG.......',
      '.....GGGGG......',
      '.......W........',
      '.......W........',
      '......WWW.......',
    ],
    { S: C.silver, G: C.gold, W: C.wood }
  ),
  shield: sprite(
    [
      'GGGGGGGGGGGG',
      'GRRRRRRRRRRG',
      'GRRRRRRRRRRG',
      'GRR.RRRRRRRG',
      'GRRR.RRRRRRG',
      '.GRRRRRRRRG.',
      '.GRRRRRRRG..',
      '..GRRRRRG...',
      '...GRRRG....',
      '....GRG.....',
      '.....G......',
    ],
    { G: C.gold, R: C.red }
  ),
  book: sprite(
    [
      'RRRRRRRR....',
      'RBBBBBBR....',
      'RBGGGGBR....',
      'RBGBBGBR....',
      'RBGGGGBR....',
      'RBBBBBBR....',
      'RRRRRRRR....',
    ],
    { R: C.darkRed, B: C.bone, G: C.gold }
  ),
  scroll: sprite(
    [
      '.BBBBBBBBBB.',
      'BBBBBBBBBBBB',
      'B..........B',
      'B.SSSSSSSS.B',
      'B.SSSSSSSS.B',
      'B.SSSSSSSS.B',
      'B..........B',
      'BBBBBBBBBBBB',
      '.BBBBBBBBBB.',
    ],
    { B: C.darkGold, S: C.bone }
  ),
  flame: sprite(
    [
      '.....F.....',
      '....FFF....',
      '...FFEFF...',
      '..FFEEEFF..',
      '..FEEEEEF..',
      '.FFEEEEEFF.',
      '.FFFEEEFFF.',
      '..FFFFFFF..',
      '...FFFFF...',
      '....FFF....',
    ],
    { F: C.ember, E: C.flame }
  ),
  snowflake: sprite(
    [
      '......I......',
      '......I......',
      '..I...I...I..',
      '...I..I..I...',
      '....I.I.I....',
      'IIIIIIIIIIIII',
      '....I.I.I....',
      '...I..I..I...',
      '..I...I...I..',
      '......I......',
      '......I......',
    ],
    { I: C.ice }
  ),
  skull: sprite(
    [
      '..BBBBBBBB..',
      '.BBBBBBBBBB.',
      'BBBEBBBBEBBB',
      'BBBEBBBBEBBB',
      'BBBBBBBBBBBB',
      '.BB.BBBB.BB.',
      '..B.B..B.B..',
      '...BBBBBB...',
    ],
    { B: C.bone, E: C.black }
  ),
  ship: sprite(
    [
      '......I......',
      '......I......',
      '.....III.....',
      '....IIIII....',
      '.....III.....',
      'BBBBBBBBBBBBB',
      '.BBBBBBBBBBB.',
      '..BBBBBBBBB..',
    ],
    { I: C.bone, B: C.wood }
  ),
  wolf: sprite(
    [
      'S....S......',
      'SS..SS......',
      '.SSSS.......',
      '.SGGSS......',
      '.SSSSSSSS...',
      '.SSSSSSSSS..',
      '..SS..SSSS..',
      '..SS...SSS..',
    ],
    { S: C.silver, G: C.eye }
  ),
  kraken: sprite(
    [
      '...BBBBBB...',
      '..BBBBBBBB..',
      '..BEBBBBEB..',
      '..BBBBBBBB..',
      '.B.B.BB.B.B.',
      'B..B.BB.B..B',
      '.B.B....B.B.',
    ],
    { B: C.darkGreen, E: C.gold }
  ),
  stag: sprite(
    [
      'B.......B...',
      'BB.....BB...',
      '.B.B.B.B....',
      '..BBBBB.....',
      '..BGGB......',
      '..BBBB......',
      '.BB..BB.....',
    ],
    { B: C.darkGold, G: C.eye }
  ),
  lion: sprite(
    [
      '.GGGGGGGG...',
      'GGGSSSSGGG..',
      'GGSSSSSSGG..',
      'GGSEESSSGG..',
      'GGGSSSSGGG..',
      '.GGGGGGGG...',
      '...SS.SS....',
    ],
    { G: C.gold, S: C.darkGold, E: C.black }
  ),
  trout: sprite(
    [
      '....BBBBB...',
      '..BBBBBBBBB.',
      '.B.EBBBBBBBB',
      '..BBBBBBBBB.',
      '....BBBBB...',
    ],
    { B: C.ice, E: C.black }
  ),
  falcon: sprite(
    [
      '.....BB.....',
      '....BBBB....',
      '..WWBBBBWW..',
      'WWWWBBBBWWWW',
      '..WW.BB.WW..',
      '.....BB.....',
      '.....CC.....',
    ],
    { B: C.night, W: C.silver, C: C.gold }
  ),
  'map-pin': sprite(
    [
      '..RRRR..',
      '.RRRRRR.',
      'RRRGGRRR',
      'RRRGGRRR',
      '.RRRRRR.',
      '..RRRR..',
      '...RR...',
      '....R...',
    ],
    { R: C.red, G: C.bone }
  ),
  'dragon-red': dragonSprite(C.red, C.darkRed),
  'dragon-black': dragonSprite(C.black, C.stone),
  'dragon-bronze': dragonSprite(C.bronze, C.darkGold),
  'dragon-gold': dragonSprite(C.gold, C.darkGold),
  'dragon-green': dragonSprite(C.green, C.darkGreen),
  'dragon-pale': dragonSprite(C.bone, C.silver),
  'dragon-silver': dragonSprite(C.silver, C.stone),
  'dragon-gold-bright': dragonSprite(C.gold, C.ember),
  'dragon-crimson': dragonSprite('#c2434f', C.red),

  // Retratos: cada personaje descubrible tiene su propia combinación de
  // plantilla (hombre/mujer/anciano/nudillo) y color, para que ninguno
  // se confunda con otro en la Enciclopedia.
  'portrait-male': portraitSprite(C.hairBrown, C.skin, MALE_ROWS),
  'portrait-male-silver': portraitSprite(C.hairSilver, C.skin, MALE_ROWS),
  'portrait-male-dark': portraitSprite(C.hairDark, C.skin, MALE_ROWS),
  'portrait-aemond': portraitSprite(C.hairSilver, C.skin, AEMOND_ROWS),
  'portrait-knight': portraitSprite(C.steelDark, C.skin, KNIGHT_ROWS),
  'portrait-female': portraitSprite(C.hairBlonde, C.skin, FEMALE_ROWS),
  'portrait-female-silver': portraitSprite(C.hairSilver, C.skin, FEMALE_ROWS),
  'portrait-female-dark': portraitSprite(C.hairDark, C.skin, FEMALE_ROWS),
  'portrait-old': portraitSprite(C.hairGrey, C.skinDark, OLD_ROWS),
  'portrait-old-warm': portraitSprite(C.hairWarmGrey, C.skin, OLD_ROWS),
  'portrait-old-tan': portraitSprite(C.hairDark, C.skinDark, OLD_ROWS),
  'portrait-old-silver': portraitSprite(C.hairSilver, C.skinDark, OLD_ROWS),
  'portrait-old-noble': portraitSprite(C.hairDark, C.skin, OLD_ROWS),
  'portrait-male-grey': portraitSprite(C.hairGrey, C.skin, MALE_ROWS),
  'portrait-male-blonde': portraitSprite(C.hairBlonde, C.skin, MALE_ROWS),
  'portrait-male-gold': portraitSprite(C.gold, C.skin, MALE_ROWS),
};

export function getSprite(icon: IconKey): Sprite {
  return sprites[icon];
}
