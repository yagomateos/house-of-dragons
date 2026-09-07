import type { BossData } from '../types';

// Un jefe por capítulo, cada uno con un minijuego distinto (ver
// src/components/minigames/).
export const bosses: BossData[] = [
  {
    id: 'boss_ch1_dragon',
    chapterId: 'ch1_danza',
    name: 'Vhagar Desatada',
    type: 'dragon',
    title: 'LA DANZA DE LOS DRAGONES',
    tagline: 'El fuego decide quién sobrevivirá.',
    howToPlay: 'Arrastra el dedo (o usa ◀▶▲▼) para esquivar los ataques del dragón. Aguanta con vida hasta que se acabe el tiempo.',
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
    howToPlay: 'Toca una de tus unidades (verde) para seleccionarla y luego toca el mapa para moverla contra los enemigos (rojo). Defiende el castillo hasta que se acabe el tiempo.',
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
    howToPlay: 'Arrastra el dedo (o usa ◀▶) para moverte: disparas flechas en automático. Revienta los huevos antes de que eclosionen en dragoncillos, y esquiva su fuego.',
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
    howToPlay: 'Arrastra el dedo (o usa ◀▶▲▼) para esquivar la pólvora líquida antes de que Aerys pueda quemar la ciudad entera.',
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
    howToPlay: 'Arrastra el dedo (o usa ◀▶) para moverte: disparas flechas en llamas en automático. Hunde la flota antes de que llegue a las murallas.',
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
    howToPlay: 'Vuela libremente arrastrando el dedo (o con ◀▶▲▼): escupes fuego hacia abajo en automático. Esquiva las salvas de pólvora del buque insignia en cuanto veas el aviso.',
    icon: 'dragon-black',
    victoryText:
      'Drogon desciende en picado sobre la flota esclavista, y el mar arde. Los Hijos de la Arpía pierden a sus últimos aliados extranjeros, y Meereen respira, al menos por ahora, bajo la protección de sus dragones.',
    rewards: {
      knowledge: 60,
      experience: 110,
    },
  },
  {
    id: 'boss_ch7_invernalia',
    chapterId: 'ch7_invierno',
    name: 'El Rey de la Noche',
    type: 'survival',
    title: 'LA LARGA NOCHE',
    tagline: 'Ocho mil años de espera terminan esta noche, en el bosque de dioses de Invernalia.',
    howToPlay: 'Arrastra el dedo (o usa ◀▶▲▼) para esquivar los ataques del Rey de la Noche. Sobrevive hasta que Arya pueda asestar el golpe final.',
    icon: 'skull',
    victoryText:
      'Mientras el Rey de la Noche avanza hacia Bran, una sombra se mueve entre los árboles. La daga de acero valyrio de Arya Stark encuentra su corazón de hielo, y él, junto a todo su ejército, se hace añicos como cristal. La Larga Noche, después de ocho mil años, por fin ha terminado.',
    rewards: {
      knowledge: 65,
      experience: 120,
      // Pyke, El Valle y Antigua nunca tuvieron un capítulo propio: sin
      // esto quedarían con un candado permanente e injustificado incluso
      // tras terminar toda la crónica.
      unlockLocationIds: ['pyke', 'the_eyrie', 'oldtown'],
    },
  },
];

export function getBossForChapter(chapterId: string): BossData | undefined {
  return bosses.find((b) => b.chapterId === chapterId);
}

export function getBoss(id: string): BossData | undefined {
  return bosses.find((b) => b.id === id);
}
