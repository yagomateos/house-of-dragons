import type { BossData } from '../types';

// Un jefe por capítulo, cada uno con un minijuego distinto (ver
// src/components/minigames/). El capítulo 7 aún no tiene acontecimientos
// narrativos, así que su jefe se añadirá cuando tenga contenido jugable
// que lleve hasta él.
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
    name: 'El Dragón de Harren el Negro',
    type: 'politics',
    title: 'EL ARQUERO DE HARRENHAL',
    tagline: 'Harrenhal ardió una vez bajo fuego de dragón. Durante el torneo, algunos juran que las llamas nunca se apagaron del todo.',
    icon: 'dragon-crimson',
    victoryText:
      'El fuego se apaga entre las ruinas ennegrecidas del castillo maldito. Sea leyenda o advertencia, el torneo continúa como si nada hubiera pasado... aunque los guardias no dejan de mirar hacia las torres quemadas.',
    rewards: {
      knowledge: 45,
      experience: 80,
    },
  },
  {
    id: 'boss_ch4_rebelion',
    chapterId: 'ch4_rebelion',
    name: 'El Rey Loco',
    type: 'battle',
    title: 'LA PÓLVORA DEL REY LOCO',
    tagline: '"¡Quemadlos a todos!" Aerys II ordena prender la pólvora líquida oculta bajo la ciudad.',
    icon: 'portrait-old-silver',
    victoryText:
      'Esquivas el fuego valyrio que arde bajo Desembarco del Rey el tiempo suficiente para que la hoja de la Guardia Real llegue antes que la orden de Aerys. La dinastía Targaryen está a punto de llegar a su fin.',
    rewards: {
      knowledge: 50,
      experience: 90,
    },
  },
  {
    id: 'boss_ch5_aguasnegras',
    chapterId: 'ch5_juego',
    name: 'La Flota de Stannis',
    type: 'naval',
    title: 'LA BATALLA DE AGUASNEGRAS',
    tagline: '"Ganaremos con fuego." La flota de Stannis Baratheon entra en la bahía dispuesta a tomarlo todo.',
    icon: 'ship',
    victoryText:
      'La pólvora líquida devora la flota de Stannis entre llamas verdes, y los estandartes dorados de Tywin Lannister deciden lo que quedaba de la batalla. Desembarco del Rey sobrevive una noche más, aunque el precio en vidas es incalculable.',
    rewards: {
      knowledge: 55,
      experience: 100,
    },
  },
  {
    id: 'boss_ch6_bahia',
    chapterId: 'ch6_madre_dragones',
    name: 'La Flota Esclavista',
    type: 'flight',
    title: 'LA BATALLA DE LA BAHÍA',
    tagline: '"Dracarys." La flota esclavista bloquea la Bahía de los Dragones, dispuesta a hundir Meereen y acabar con su reina.',
    icon: 'dragon-black',
    victoryText:
      'Drogon desciende en picado sobre la flota esclavista, y el mar arde. Los Hijos de la Arpía pierden a sus últimos aliados extranjeros, y Meereen respira, al menos por ahora, bajo la protección de sus dragones.',
    rewards: {
      knowledge: 60,
      experience: 110,
    },
  },
];

export function getBossForChapter(chapterId: string): BossData | undefined {
  return bosses.find((b) => b.chapterId === chapterId);
}

export function getBoss(id: string): BossData | undefined {
  return bosses.find((b) => b.id === id);
}
