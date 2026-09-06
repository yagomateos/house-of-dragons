import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { GameSaveState, PlayerCharacter, ScreenId, SceneStepReward } from '../types';
import { loadGame, saveGame, createNewSave, clearGame, hasSavedGame } from '../utils/storage';
import { computeUnlockedAchievements } from './achievementLogic';
import { chapters } from '../data/chapters';
import { getEvent } from '../data/events';
import { getBoss, getBossForChapter } from '../data/bosses';

// ============================================================
// Modelo de vida: una única fuente de verdad con dos capas.
//
// - `save.health` es el punto de guardado: solo cambia cuando el
//   jugador SUPERA con éxito un acontecimiento o un jefe (se
//   "confirma"), o al empezar un capítulo nuevo (se restaura a 100).
// - `sessionHealth` es la vida REAL durante un intento en curso
//   (dentro de un acontecimiento o una batalla de jefe). Empieza
//   igual que `save.health` y baja con cada error. Si llega a 0, el
//   intento se descarta sin tocar `save.health` (no se pierde
//   progreso ya guardado). Si el intento termina con éxito, su valor
//   final se copia a `save.health`.
//
// El resto de la interfaz debe leer la vida como
// `sessionHealth ?? save.health`.
// ============================================================

const DAMAGE_WRONG_ANSWER = 10;
const DAMAGE_BOSS_HIT = 20;
const MAX_HEALTH = 100;

interface AppState {
  save: GameSaveState | null;
  screen: ScreenId;
  viewingLocationId: string | null;
  viewingEventId: string | null;
  viewingBossId: string | null;
  sessionHealth: number | null;
  /** Se incrementa cada reintento para forzar que la pantalla del acontecimiento se reinicie desde el principio. */
  retryToken: number;
  newlyUnlockedAchievements: string[];
}

type Action =
  | { type: 'NEW_GAME'; player: PlayerCharacter }
  | { type: 'CONTINUE_GAME' }
  | { type: 'SET_SCREEN'; screen: ScreenId }
  | { type: 'SET_VIEWING_LOCATION'; locationId: string | null }
  | { type: 'PLAY_EVENT'; eventId: string }
  | { type: 'EXIT_EVENT' }
  | { type: 'PLAY_BOSS'; bossId: string }
  | { type: 'EXIT_BOSS' }
  | { type: 'DEFEAT_BOSS'; bossId: string }
  | { type: 'RECORD_DECISION'; eventId: string; optionId: string; knowledgeBonus: number }
  | { type: 'RECORD_ANSWER'; correct: boolean }
  | { type: 'APPLY_REWARD'; reward: SceneStepReward; eventId: string }
  | { type: 'RESTART_BOSS_ATTEMPT' }
  | { type: 'DISCARD_BOSS_ATTEMPT' }
  | { type: 'SET_SESSION_HEALTH'; value: number }
  | { type: 'RETRY_ATTEMPT' }
  | { type: 'ABANDON_ATTEMPT' }
  | { type: 'CLEAR_ACHIEVEMENT_TOAST' }
  | { type: 'RESET_GAME' };

const initialState: AppState = {
  save: null,
  screen: 'start',
  viewingLocationId: null,
  viewingEventId: null,
  viewingBossId: null,
  sessionHealth: null,
  retryToken: 0,
  newlyUnlockedAchievements: [],
};

function clampHealth(value: number): number {
  return Math.max(0, Math.min(MAX_HEALTH, Math.round(value)));
}

function withAchievements(save: GameSaveState): { save: GameSaveState; newly: string[] } {
  const before = new Set(save.unlockedAchievementIds);
  const after = computeUnlockedAchievements(save);
  const newly = after.filter((id) => !before.has(id));
  return { save: { ...save, unlockedAchievementIds: after }, newly };
}

/** Un capítulo con jefe pendiente no avanza hasta que el jefe se supera. */
function chapterHasPendingBoss(save: GameSaveState, chapterId: string): boolean {
  const boss = getBossForChapter(chapterId);
  return Boolean(boss && !save.defeatedBossIds.includes(boss.id));
}

function advanceToNextChapter(save: GameSaveState, fromChapterId: string): GameSaveState {
  const currentChapter = chapters.find((c) => c.id === fromChapterId);
  if (!currentChapter) return save;
  const nextChapter = chapters.find((c) => c.order === currentChapter.order + 1);
  if (nextChapter && nextChapter.id !== save.currentChapterId) {
    const nextEventId = nextChapter.eventIds[0] ?? save.currentEventId;
    // Cada capítulo nuevo empieza con la vida al máximo (ver nota de
    // arquitectura arriba): los errores solo penalizan dentro del
    // capítulo en curso, no se arrastran indefinidamente.
    return { ...save, currentChapterId: nextChapter.id, currentEventId: nextEventId, health: MAX_HEALTH };
  }
  return save;
}

function advanceChapterIfNeeded(save: GameSaveState): GameSaveState {
  const currentChapter = chapters.find((c) => c.id === save.currentChapterId);
  if (!currentChapter) return save;
  const currentEvent = getEvent(save.currentEventId);
  if (currentEvent && !currentEvent.nextEventId && save.completedEventIds.includes(currentEvent.id)) {
    if (chapterHasPendingBoss(save, currentChapter.id)) return save;
    return advanceToNextChapter(save, currentChapter.id);
  }
  return save;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NEW_GAME': {
      const save = createNewSave(action.player);
      saveGame(save);
      return { ...state, save, screen: 'map', viewingLocationId: null, viewingEventId: null, sessionHealth: null };
    }
    case 'CONTINUE_GAME': {
      const save = loadGame();
      if (!save) return state;
      return { ...state, save, screen: 'map', sessionHealth: null };
    }
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_VIEWING_LOCATION':
      return { ...state, viewingLocationId: action.locationId };
    case 'PLAY_EVENT':
      if (!state.save) return state;
      return { ...state, screen: 'event', viewingEventId: action.eventId, sessionHealth: state.save.health };
    case 'EXIT_EVENT':
      // Salir sin terminar el acontecimiento descarta el daño de este
      // intento: el punto de guardado (save.health) no se toca.
      return { ...state, screen: 'map', viewingEventId: null, sessionHealth: null };
    case 'PLAY_BOSS':
      if (!state.save) return state;
      return { ...state, screen: 'boss', viewingBossId: action.bossId, sessionHealth: state.save.health };
    case 'EXIT_BOSS':
      return { ...state, screen: 'map', viewingBossId: null, sessionHealth: null };
    case 'DEFEAT_BOSS': {
      if (!state.save) return state;
      const boss = getBoss(action.bossId);
      if (!boss) return state;
      const discoveredCharacterIds = Array.from(
        new Set([...state.save.discoveredCharacterIds, ...(boss.rewards.unlockCharacterIds ?? [])])
      );
      const unlockedLocationIds = Array.from(
        new Set([...state.save.unlockedLocationIds, ...(boss.rewards.unlockLocationIds ?? [])])
      );
      let save: GameSaveState = {
        ...state.save,
        // Se confirma la vida con la que terminó la batalla (nunca se
        // "regala" salud extra por ganar; solo se conserva la que quedaba).
        health: clampHealth(state.sessionHealth ?? state.save.health),
        knowledge: state.save.knowledge + boss.rewards.knowledge,
        experience: state.save.experience + boss.rewards.experience,
        discoveredCharacterIds,
        unlockedLocationIds,
        defeatedBossIds: Array.from(new Set([...state.save.defeatedBossIds, boss.id])),
      };
      save = advanceToNextChapter(save, boss.chapterId);
      const withAch = withAchievements(save);
      saveGame(withAch.save);
      return { ...state, save: withAch.save, sessionHealth: null, newlyUnlockedAchievements: withAch.newly };
    }
    case 'RECORD_DECISION': {
      if (!state.save) return state;
      let save: GameSaveState = {
        ...state.save,
        decisionsMade: { ...state.save.decisionsMade, [action.eventId]: action.optionId },
        knowledge: state.save.knowledge + action.knowledgeBonus,
      };
      saveGame(save);
      return { ...state, save };
    }
    case 'RECORD_ANSWER': {
      if (!state.save) return state;
      let save: GameSaveState = {
        ...state.save,
        totalAnswers: state.save.totalAnswers + 1,
        correctAnswers: state.save.correctAnswers + (action.correct ? 1 : 0),
        knowledge: state.save.knowledge + (action.correct ? 10 : 0),
      };
      const withAch = withAchievements(save);
      saveGame(withAch.save);

      // Responder mal cuesta vida REAL de este intento. No se marca
      // nada como completado ni se avanza: la propia pantalla decide
      // si permite reintentar la pregunta o si lleva a la derrota,
      // una vez el jugador haya visto el resultado.
      let sessionHealth = state.sessionHealth;
      if (!action.correct && sessionHealth !== null) {
        sessionHealth = clampHealth(sessionHealth - DAMAGE_WRONG_ANSWER);
      }

      return { ...state, save: withAch.save, sessionHealth, newlyUnlockedAchievements: withAch.newly };
    }
    case 'SET_SESSION_HEALTH': {
      // Usado por los minijuegos de jefe: reportan su propio valor de
      // vida (ya con el daño de "-20 por golpe" aplicado) para que el
      // resto de la interfaz (HUD) lo refleje en tiempo real. La
      // pantalla de jefe gestiona su propia derrota, así que aquí NO
      // forzamos el cambio de pantalla.
      return { ...state, sessionHealth: clampHealth(action.value) };
    }
    case 'RETRY_ATTEMPT': {
      // Desde la pantalla "Has Caído": vuelve a intentar el mismo
      // nivel con la vida del último punto de guardado.
      if (!state.save || !state.viewingEventId) return { ...state, screen: 'map' };
      return { ...state, screen: 'event', sessionHealth: state.save.health, retryToken: state.retryToken + 1 };
    }
    case 'ABANDON_ATTEMPT':
      // Vuelve al mapa sin tocar el punto de guardado: el progreso ya
      // confirmado se conserva íntegro.
      return { ...state, screen: 'map', viewingEventId: null, viewingBossId: null, sessionHealth: null };
    case 'APPLY_REWARD': {
      if (!state.save) return state;
      const r = action.reward;
      const completedEventIds = state.save.completedEventIds.includes(action.eventId)
        ? state.save.completedEventIds
        : [...state.save.completedEventIds, action.eventId];
      const discoveredCharacterIds = Array.from(
        new Set([...state.save.discoveredCharacterIds, ...(r.unlockCharacterIds ?? [])])
      );
      const discoveredDragonIds = Array.from(
        new Set([...state.save.discoveredDragonIds, ...(r.unlockDragonIds ?? [])])
      );
      const unlockedLocationIds = Array.from(
        new Set([...state.save.unlockedLocationIds, ...(r.unlockLocationIds ?? [])])
      );
      const event = getEvent(action.eventId);
      const nextEventId = event?.nextEventId ?? state.save.currentEventId;
      const nextYear = nextEventId ? getEvent(nextEventId)?.year ?? state.save.currentYear : state.save.currentYear;

      let save: GameSaveState = {
        ...state.save,
        // Se confirma la vida del intento: sobrevivir con menos vida
        // de la que tenías al empezar el acontecimiento tiene coste
        // real de cara al siguiente.
        health: clampHealth(state.sessionHealth ?? state.save.health),
        knowledge: state.save.knowledge + r.knowledge,
        experience: state.save.experience + r.experience,
        completedEventIds,
        discoveredCharacterIds,
        discoveredDragonIds,
        unlockedLocationIds,
        currentEventId: nextEventId,
        currentYear: nextYear,
      };
      save = advanceChapterIfNeeded(save);
      const withAch = withAchievements(save);
      saveGame(withAch.save);
      return { ...state, save: withAch.save, sessionHealth: null, newlyUnlockedAchievements: withAch.newly };
    }
    case 'RESTART_BOSS_ATTEMPT':
      // Reintentar el jefe: la pantalla de jefe gestiona su propia
      // fase de derrota, así que aquí solo se restaura la vida del
      // intento; la pantalla sigue siendo 'boss'.
      if (!state.save) return state;
      return { ...state, sessionHealth: state.save.health };
    case 'DISCARD_BOSS_ATTEMPT':
      // El jugador ve la pantalla de derrota del jefe pero aún no ha
      // pulsado nada: se descarta el daño de este intento sin tocar
      // el punto de guardado ni cambiar de pantalla.
      return { ...state, sessionHealth: null };
    case 'CLEAR_ACHIEVEMENT_TOAST':
      return { ...state, newlyUnlockedAchievements: [] };
    case 'RESET_GAME': {
      clearGame();
      return { ...initialState, screen: 'start' };
    }
    default:
      return state;
  }
}

interface GameContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  hasSave: boolean;
  /** Vida efectiva a mostrar en cualquier pantalla: la del intento en curso si existe, si no la del punto de guardado. */
  displayHealth: number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hasSave = Boolean(state.save) || hasSavedGame();
  const displayHealth = state.sessionHealth ?? state.save?.health ?? 0;

  useEffect(() => {
    if (state.save) saveGame(state.save);
  }, [state.save]);

  const value = useMemo(
    () => ({ state, dispatch, hasSave, displayHealth }),
    [state, hasSave, displayHealth]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider');
  return ctx;
}

export { DAMAGE_WRONG_ANSWER, DAMAGE_BOSS_HIT, MAX_HEALTH };
