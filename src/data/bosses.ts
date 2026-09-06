import type { BossData } from '../types';

// Un jefe por capítulo, cada uno con un minijuego distinto (ver
// src/components/minigames/). De momento solo el Capítulo 1 tiene jefe;
// el resto se añadirá capítulo a capítulo sobre esta misma estructura.
export const bosses: BossData[] = [
  {
    id: 'boss_ch1_dragon',
    chapterId: 'ch1_danza',
    name: 'Vhagar Desatada',
    type: 'dragon',
    title: 'LA DANZA DE LOS DRAGONES',
    tagline: 'El fuego decide quién sobrevivirá.',
    icon: 'dragon-green',
    victoryText:
      'Sobrevives a la furia del dragón y regresas a tierra firme con vida. Poniente respira aliviado, pero las cicatrices de la guerra tardarán generaciones en cerrarse. Las cenizas de la Danza marcarán todo lo que viene después.',
    rewards: {
      knowledge: 50,
      experience: 100,
    },
  },
];

export function getBossForChapter(chapterId: string): BossData | undefined {
  return bosses.find((b) => b.chapterId === chapterId);
}

export function getBoss(id: string): BossData | undefined {
  return bosses.find((b) => b.id === id);
}
