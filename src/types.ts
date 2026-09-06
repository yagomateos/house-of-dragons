// ============================================================
// CRÓNICA DE PONIENTE — Tipos centrales del juego
// ============================================================

export type ClassId = 'guerrero' | 'explorador' | 'cronista';

export interface PlayerCharacter {
  name: string;
  classId: ClassId;
}

export type IconKey =
  | 'castle'
  | 'dragon-red'
  | 'dragon-black'
  | 'dragon-bronze'
  | 'dragon-gold'
  | 'dragon-green'
  | 'dragon-pale'
  | 'dragon-silver'
  | 'dragon-gold-bright'
  | 'dragon-crimson'
  | 'crown'
  | 'sword'
  | 'book'
  | 'flame'
  | 'snowflake'
  | 'scroll'
  | 'shield'
  | 'skull'
  | 'tower'
  | 'ship'
  | 'wolf'
  | 'kraken'
  | 'stag'
  | 'lion'
  | 'trout'
  | 'falcon'
  | 'portrait-male'
  | 'portrait-female'
  | 'portrait-old'
  | 'portrait-male-silver'
  | 'portrait-male-dark'
  | 'portrait-aemond'
  | 'portrait-knight'
  | 'portrait-female-silver'
  | 'portrait-female-dark'
  | 'portrait-old-warm'
  | 'portrait-old-tan'
  | 'portrait-old-silver'
  | 'portrait-old-noble'
  | 'portrait-male-grey'
  | 'portrait-male-blonde'
  | 'portrait-male-gold'
  | 'iron-throne'
  | 'wall'
  | 'map-pin';

// ---------- LOCALIZACIONES ----------

export interface LocationData {
  id: string;
  name: string;
  periodLabel: string;
  x: number; // % posición en el mapa
  y: number; // % posición en el mapa
  icon: IconKey;
  description: string;
  /** eventos disponibles en esta localización (se filtran por desbloqueo) */
  eventIds: string[];
  /** true si desbloqueada desde el inicio del juego */
  unlockedFromStart: boolean;
}

// ---------- CAPÍTULOS ----------

export interface ChapterData {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  yearRangeLabel: string;
  eventIds: string[];
}

// ---------- PERSONAJES ----------

export type CharacterStatus = 'vivo' | 'muerto' | 'desconocido';

export interface CharacterData {
  id: string;
  name: string;
  house: string;
  portrait: IconKey;
  description: string;
  periodLabel: string;
  eventIds: string[];
  status: CharacterStatus;
  /** si viene solo de la serie de TV y difiere de los libros */
  tvOnlyNote?: string;
}

// ---------- DRAGONES ----------

export interface DragonData {
  id: string;
  name: string;
  rider: string;
  periodLabel: string;
  description: string;
  sizeLabel: string;
  status: CharacterStatus;
  portrait: IconKey;
  tvOnlyNote?: string;
}

// ---------- EVENTOS / ESCENAS ----------

export interface SceneStepNarration {
  type: 'narration';
  text: string;
  background?: 'castle' | 'throne' | 'battle' | 'sea' | 'snow' | 'hall';
}

export interface SceneStepDialogue {
  type: 'dialogue';
  speakerId: string; // characterId
  text: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  resultText: string;
  knowledgeBonus?: number;
}

export interface SceneStepDecision {
  type: 'decision';
  prompt: string;
  options: DecisionOption[];
}

export interface SceneStepQuestion {
  type: 'question';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SceneStepReward {
  type: 'reward';
  knowledge: number;
  experience: number;
  unlockCharacterIds?: string[];
  unlockDragonIds?: string[];
  unlockLocationIds?: string[];
  text: string;
}

export type SceneStep =
  | SceneStepNarration
  | SceneStepDialogue
  | SceneStepDecision
  | SceneStepQuestion
  | SceneStepReward;

export interface HistoricalEvent {
  id: string;
  chapterId: string;
  locationId: string;
  order: number;
  year: string; // ej. "129 d.C." o "Fecha aproximada"
  title: string;
  characterIds: string[];
  summary: string;
  steps: SceneStep[];
  /** id del siguiente evento (para navegación lineal dentro del capítulo) */
  nextEventId?: string;
  tvOnlyNote?: string;
}

// ---------- JEFES DE CAPÍTULO ----------

export type BossType = 'dragon' | 'strategy' | 'politics' | 'battle' | 'resources' | 'flight' | 'survival';

export type Difficulty = 'facil' | 'normal' | 'dificil';

export interface BossData {
  id: string;
  chapterId: string;
  name: string;
  type: BossType;
  title: string;
  tagline: string;
  icon: IconKey;
  /** texto narrativo mostrado al superar el jefe */
  victoryText: string;
  rewards: {
    knowledge: number;
    experience: number;
    unlockLocationIds?: string[];
    unlockCharacterIds?: string[];
  };
}

// ---------- LOGROS ----------

export interface AchievementData {
  id: string;
  name: string;
  description: string;
}

// ---------- ESTADO DE PARTIDA GUARDADA ----------

export interface GameSaveState {
  version: number;
  player: PlayerCharacter;
  currentChapterId: string;
  currentEventId: string;
  currentYear: string;
  completedEventIds: string[];
  unlockedLocationIds: string[];
  discoveredCharacterIds: string[];
  discoveredDragonIds: string[];
  unlockedAchievementIds: string[];
  defeatedBossIds: string[];
  decisionsMade: Record<string, string>; // eventId -> optionId
  knowledge: number;
  experience: number;
  health: number;
  correctAnswers: number;
  totalAnswers: number;
  createdAt: number;
  updatedAt: number;
}

export type ScreenId =
  | 'start'
  | 'create'
  | 'map'
  | 'event'
  | 'boss'
  | 'timeline'
  | 'encyclopedia'
  | 'settings';
