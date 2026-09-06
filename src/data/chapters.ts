import type { ChapterData } from '../types';

export const chapters: ChapterData[] = [
  {
    id: 'ch1_danza',
    order: 1,
    title: 'La Danza de los Dragones',
    subtitle: 'La guerra civil Targaryen',
    yearRangeLabel: '129 d.C. — 131 d.C.',
    eventIds: [
      'ev_muerte_viserys',
      'ev_reclamacion_rhaenyra',
      'ev_muerte_lucerys',
      'ev_batalla_bosque',
      'ev_cenizas_guerra',
    ],
  },
  {
    id: 'ch2_cenizas',
    order: 2,
    title: 'Las Cenizas',
    subtitle: 'El precio de la guerra',
    yearRangeLabel: '131 d.C. — 153 d.C. (fecha aproximada)',
    eventIds: ['ev_regencia_cenizas', 'ev_ultimo_dragon'],
  },
  {
    id: 'ch3_targaryen',
    order: 3,
    title: 'Los Targaryen',
    subtitle: 'El ocaso de una dinastía',
    yearRangeLabel: '153 d.C. — 282 d.C. (fecha aproximada)',
    eventIds: ['ev_generaciones_paz', 'ev_torneo_harrenhal'],
  },
  {
    id: 'ch4_rebelion',
    order: 4,
    title: 'La Rebelión',
    subtitle: 'La caída de los dragones',
    yearRangeLabel: '282 d.C. — 283 d.C. (fecha aproximada)',
    eventIds: ['ev_rapto_lyanna', 'ev_llamado_armas', 'ev_batalla_tridente', 'ev_saqueo_desembarco'],
  },
  {
    id: 'ch5_juego',
    order: 5,
    title: 'El Juego de Tronos',
    subtitle: 'La guerra de los Cinco Reyes',
    yearRangeLabel: '298 d.C. — 299 d.C.',
    eventIds: [],
  },
  {
    id: 'ch6_madre_dragones',
    order: 6,
    title: 'La Madre de Dragones',
    subtitle: 'El regreso de la magia',
    yearRangeLabel: '298 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: [],
  },
  {
    id: 'ch7_invierno',
    order: 7,
    title: 'El Invierno',
    subtitle: 'La larga noche',
    yearRangeLabel: '300 d.C. (fecha aproximada)',
    eventIds: [],
  },
];

export function getChapter(id: string) {
  return chapters.find((c) => c.id === id);
}
