import type { GameSaveState } from '../types';
import { getEvent } from '../data/events';

export function computeUnlockedAchievements(save: GameSaveState): string[] {
  const unlocked = new Set(save.unlockedAchievementIds);

  if (save.completedEventIds.length >= 1) unlocked.add('ach_primer_viaje');
  if (save.completedEventIds.length >= 10) unlocked.add('ach_cronista');
  if (save.correctAnswers >= 10) unlocked.add('ach_conocedor');

  const danceEventIds = ['ev_muerte_viserys', 'ev_reclamacion_rhaenyra', 'ev_muerte_lucerys', 'ev_batalla_bosque', 'ev_cenizas_guerra'];
  if (danceEventIds.every((id) => save.completedEventIds.includes(id))) {
    unlocked.add('ach_fuego_sangre');
  }

  if (save.currentChapterId === 'ch7_invierno') unlocked.add('ach_invierno');

  return Array.from(unlocked);
}

export function isEventCompleted(save: GameSaveState, eventId: string): boolean {
  return save.completedEventIds.includes(eventId);
}

export function eventExists(id: string): boolean {
  return Boolean(getEvent(id));
}
