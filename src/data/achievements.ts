import type { AchievementData } from '../types';

export const achievements: AchievementData[] = [
  {
    id: 'ach_primer_viaje',
    name: 'Primer Viaje',
    description: 'Completar el primer acontecimiento histórico.',
  },
  {
    id: 'ach_cronista',
    name: 'Cronista',
    description: 'Completar 10 acontecimientos históricos.',
  },
  {
    id: 'ach_conocedor',
    name: 'Conocedor de Poniente',
    description: 'Responder correctamente 10 preguntas.',
  },
  {
    id: 'ach_fuego_sangre',
    name: 'Fuego y Sangre',
    description: 'Completar el capítulo de la Danza de los Dragones.',
  },
  {
    id: 'ach_invierno',
    name: 'El Invierno',
    description: 'Llegar al último capítulo de la crónica.',
  },
];

export function getAchievement(id: string) {
  return achievements.find((a) => a.id === id);
}
