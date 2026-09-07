import type { GameSaveState, PlayerCharacter } from '../types';
import { chapters } from '../data/chapters';
import { locations } from '../data/locations';

const STORAGE_KEY = 'cronica-poniente-save-v1';
const SAVE_VERSION = 1;

export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function loadGame(): GameSaveState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameSaveState;
    if (parsed.version !== SAVE_VERSION) return null;
    // Migración leve: partidas guardadas antes de añadir el sistema de jefes.
    if (!parsed.defeatedBossIds) parsed.defeatedBossIds = [];
    // Migración leve: partidas guardadas antes de añadir el guardado de
    // preguntas ya recompensadas (evita farmear conocimiento reintentando).
    if (!parsed.questionsAnswered) parsed.questionsAnswered = {};
    // Reconciliación: si una partida avanzó a un capítulo que entonces
    // estaba vacío de acontecimientos y ese capítulo ya tiene contenido
    // nuevo, reapunta currentEventId a su primer acontecimiento en vez de
    // dejarlo bloqueado apuntando al capítulo anterior.
    const chapter = chapters.find((c) => c.id === parsed.currentChapterId);
    const chapterStarted = chapter?.eventIds.some((id) => parsed.completedEventIds.includes(id)) ?? false;
    if (chapter && chapter.eventIds.length > 0 && !chapterStarted && !chapter.eventIds.includes(parsed.currentEventId)) {
      parsed.currentEventId = chapter.eventIds[0];
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveGame(state: GameSaveState): void {
  try {
    const toSave: GameSaveState = { ...state, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // almacenamiento no disponible (modo privado, cuota excedida, etc.)
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
}

export function createNewSave(player: PlayerCharacter): GameSaveState {
  const firstChapter = chapters[0];
  const firstEventId = firstChapter.eventIds[0];
  const startingLocations = locations.filter((l) => l.unlockedFromStart).map((l) => l.id);
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    player,
    currentChapterId: firstChapter.id,
    currentEventId: firstEventId,
    currentYear: '129 d.C.',
    completedEventIds: [],
    unlockedLocationIds: startingLocations,
    discoveredCharacterIds: [],
    discoveredDragonIds: [],
    unlockedAchievementIds: [],
    defeatedBossIds: [],
    decisionsMade: {},
    questionsAnswered: {},
    knowledge: 0,
    experience: 0,
    health: 100,
    correctAnswers: 0,
    totalAnswers: 0,
    createdAt: now,
    updatedAt: now,
  };
}
