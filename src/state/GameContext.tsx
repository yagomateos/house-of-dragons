import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { GameSaveState, PlayerCharacter, ScreenId, SceneStepReward } from '../types';
import { loadGame, saveGame, createNewSave, clearGame, hasSavedGame } from '../utils/storage';
import { computeUnlockedAchievements } from './achievementLogic';
import { chapters } from '../data/chapters';
import { getEvent } from '../data/events';
import { getBoss, getBossForChapter } from '../data/bosses';

interface AppState {
  save: GameSaveState | null;
  screen: ScreenId;
  viewingLocationId: string | null;
  viewingEventId: string | null;
  viewingBossId: string | null;
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
  | { type: 'CLEAR_ACHIEVEMENT_TOAST' }
  | { type: 'RESET_GAME' };

const initialState: AppState = {
  save: null,
  screen: 'start',
  viewingLocationId: null,
  viewingEventId: null,
  viewingBossId: null,
  newlyUnlockedAchievements: [],
};

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
    return { ...save, currentChapterId: nextChapter.id, currentEventId: nextEventId };
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
      return { ...state, save, screen: 'map', viewingLocationId: null, viewingEventId: null };
    }
    case 'CONTINUE_GAME': {
      const save = loadGame();
      if (!save) return state;
      return { ...state, save, screen: 'map' };
    }
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_VIEWING_LOCATION':
      return { ...state, viewingLocationId: action.locationId };
    case 'PLAY_EVENT':
      return { ...state, screen: 'event', viewingEventId: action.eventId };
    case 'EXIT_EVENT':
      return { ...state, screen: 'map', viewingEventId: null };
    case 'PLAY_BOSS':
      return { ...state, screen: 'boss', viewingBossId: action.bossId };
    case 'EXIT_BOSS':
      return { ...state, screen: 'map', viewingBossId: null };
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
        knowledge: state.save.knowledge + boss.rewards.knowledge,
        experience: state.save.experience + boss.rewards.experience,
        discoveredCharacterIds,
        unlockedLocationIds,
        defeatedBossIds: Array.from(new Set([...state.save.defeatedBossIds, boss.id])),
      };
      save = advanceToNextChapter(save, boss.chapterId);
      const withAch = withAchievements(save);
      saveGame(withAch.save);
      return { ...state, save: withAch.save, newlyUnlockedAchievements: withAch.newly };
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
      return { ...state, save: withAch.save, newlyUnlockedAchievements: withAch.newly };
    }
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
      return { ...state, save: withAch.save, newlyUnlockedAchievements: withAch.newly };
    }
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
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hasSave = Boolean(state.save) || hasSavedGame();

  useEffect(() => {
    if (state.save) saveGame(state.save);
  }, [state.save]);

  const value = useMemo(() => ({ state, dispatch, hasSave }), [state, hasSave]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider');
  return ctx;
}
