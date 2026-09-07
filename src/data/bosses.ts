import type { BossData } from '../types';

// Un jefe por capítulo, cada uno con un minijuego distinto (ver
// src/components/minigames/). Los capítulos 5-7 aún no tienen
// acontecimientos narrativos, así que sus jefes se añadirán cuando esos
// capítulos tengan contenido jugable que lleve hasta ellos.
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
  {
    id: 'boss_ch2_guerra',
    chapterId: 'ch2_cenizas',
    name: 'Las Fronteras en Llamas',
    type: 'strategy',
    title: 'LA GUERRA',
    tagline: 'Sin dragones que impongan orden, el reino se sostiene a base de decisiones militares.',
    icon: 'crown',
    victoryText:
      'Cada frente recibe la respuesta que necesitaba a tiempo. El reino, todavía convaleciente de la Danza, aguanta sin fracturarse de nuevo.',
    rewards: {
      knowledge: 40,
      experience: 70,
    },
  },
  {
    id: 'boss_ch3_consejo',
    chapterId: 'ch3_targaryen',
    name: 'El Campeón de Harrenhal',
    type: 'politics',
    title: 'ASALTO AL CASTILLO',
    tagline: 'El torneo se abre paso entre guardias, arqueros y caballeros hasta el campeón del castillo.',
    icon: 'tower',
    victoryText:
      'El campeón cae en el patio de armas de Harrenhal. El nombre del vencedor del torneo se añadirá a las canciones... aunque nadie aún sospecha lo que esa corona de amor y belleza desatará.',
    rewards: {
      knowledge: 45,
      experience: 80,
    },
  },
  {
    id: 'boss_ch4_rebelion',
    chapterId: 'ch4_rebelion',
    name: 'La Marcha hacia el Trono',
    type: 'battle',
    title: 'LA REBELIÓN',
    tagline: 'Cada paso hacia Desembarco del Rey exige la decisión correcta.',
    icon: 'skull',
    victoryText:
      'El ejército rebelde alcanza las puertas de Desembarco del Rey. La dinastía Targaryen está a punto de llegar a su fin.',
    rewards: {
      knowledge: 50,
      experience: 90,
    },
  },
];

export function getBossForChapter(chapterId: string): BossData | undefined {
  return bosses.find((b) => b.chapterId === chapterId);
}

export function getBoss(id: string): BossData | undefined {
  return bosses.find((b) => b.id === id);
}
