import type { CharacterData } from '../types';

// Nota: los personajes de capítulos futuros (4-7) se incluyen ya en la
// enciclopedia para dar contexto de alcance, pero permanecen "no descubiertos"
// hasta que el contenido de esos capítulos se juegue en futuras versiones.
export const characters: CharacterData[] = [
  // --- Capítulo 1: La Danza de los Dragones ---
  {
    id: 'char_viserys',
    name: 'Viserys I Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-old',
    description:
      'Quinto rey de la dinastía Targaryen. Su reinado fue en gran parte pacífico, pero su indecisión sobre la sucesión sembró las semillas de la guerra civil.',
    periodLabel: '77 d.C. — 129 d.C.',
    eventIds: ['ev_muerte_viserys'],
    status: 'muerto',
  },
  {
    id: 'char_rhaenyra',
    name: 'Rhaenyra Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-female-silver',
    description:
      'Única hija superviviente de Viserys I, nombrada heredera por su padre. Su reclamación del Trono de Hierro desató la Danza de los Dragones.',
    periodLabel: '97 d.C. — 130 d.C.',
    eventIds: ['ev_muerte_viserys', 'ev_reclamacion_rhaenyra', 'ev_muerte_lucerys', 'ev_cenizas_guerra'],
    status: 'muerto',
  },
  {
    id: 'char_aegon2',
    name: 'Aegon II Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-male-silver',
    description:
      'Hijo mayor de Viserys I y la reina Alicent Hightower. Coronado rey por el partido Verde tras la muerte de su padre, disputando el trono a su media hermana.',
    periodLabel: '107 d.C. — 131 d.C.',
    eventIds: ['ev_muerte_viserys', 'ev_batalla_bosque'],
    status: 'muerto',
  },
  {
    id: 'char_alicent',
    name: 'Alicent Hightower',
    house: 'Hightower',
    portrait: 'portrait-female',
    description:
      'Reina consorte de Viserys I y madre de Aegon II. Lideró al partido Verde para asegurar el trono para su hijo.',
    periodLabel: '97 d.C. — 145 d.C. (fecha aproximada)',
    eventIds: ['ev_muerte_viserys'],
    status: 'muerto',
  },
  {
    id: 'char_daemon',
    name: 'Daemon Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-male-dark',
    description:
      'Hermano menor de Viserys I, temerario jinete de dragón y esposo de Rhaenyra. Guerrero formidable y figura clave del partido Negro.',
    periodLabel: '81 d.C. — 130 d.C.',
    eventIds: ['ev_reclamacion_rhaenyra', 'ev_batalla_bosque'],
    status: 'muerto',
  },
  {
    id: 'char_otto',
    name: 'Otto Hightower',
    house: 'Hightower',
    portrait: 'portrait-old-warm',
    description:
      'Mano del Rey durante gran parte del reinado de Viserys I. Arquitecto principal del ascenso de Aegon II al trono.',
    periodLabel: '68 d.C. — 130 d.C. (fecha aproximada)',
    eventIds: ['ev_muerte_viserys'],
    status: 'muerto',
  },
  {
    id: 'char_lucerys',
    name: 'Lucerys Velaryon',
    house: 'Velaryon',
    portrait: 'portrait-male',
    description:
      'Segundo hijo de Rhaenyra, jinete del dragón Arrax. Su muerte en Bosque Susurrante marcó el punto de no retorno de la guerra.',
    periodLabel: '114 d.C. — 129 d.C.',
    eventIds: ['ev_muerte_lucerys'],
    status: 'muerto',
  },
  {
    id: 'char_aemond',
    name: 'Aemond Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-aemond',
    description:
      'Hijo de Alicent y Viserys I, jinete de la dragona Vhagar. Su persecución de Lucerys terminó en tragedia y en el inicio abierto de las hostilidades.',
    periodLabel: '110 d.C. — 130 d.C. (fecha aproximada)',
    eventIds: ['ev_muerte_lucerys', 'ev_batalla_bosque'],
    status: 'muerto',
  },
  {
    id: 'char_criston',
    name: 'Criston Cole',
    house: 'Guardia Real',
    portrait: 'portrait-knight',
    description: 'Caballero de la Guardia Real, luego Mano del Rey de Aegon II. Firme defensor del partido Verde.',
    periodLabel: '98 d.C. — 130 d.C. (fecha aproximada)',
    eventIds: ['ev_muerte_viserys', 'ev_batalla_bosque'],
    status: 'muerto',
  },
  {
    id: 'char_corlys',
    name: 'Corlys Velaryon',
    house: 'Velaryon',
    portrait: 'portrait-old-tan',
    description:
      'Llamado "la Serpiente Marina". Señor de Marcaderiva y el mayor navegante de su época, aliado del partido Negro.',
    periodLabel: '53 d.C. — 132 d.C. (fecha aproximada)',
    eventIds: ['ev_reclamacion_rhaenyra'],
    status: 'muerto',
  },
  {
    id: 'char_rhaenys',
    name: 'Rhaenys Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-female-dark',
    description:
      'Llamada "la Reina que Nunca Fue". Prima de Viserys I y esposa de Corlys, jinete de la dragona Meleys.',
    periodLabel: '81 d.C. — 130 d.C.',
    eventIds: ['ev_batalla_bosque'],
    status: 'muerto',
  },

  // --- Personajes de capítulos futuros (aparecerán bloqueados) ---
  { id: 'char_robert', name: 'Robert Baratheon', house: 'Baratheon', portrait: 'portrait-male', description: 'Señor de Bastión de Tormentas que encabezó la rebelión contra los Targaryen.', periodLabel: '262 d.C. — 298 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_eddard', name: 'Eddard Stark', house: 'Stark', portrait: 'portrait-male', description: 'Señor de Invernalia, conocido por su honor inquebrantable.', periodLabel: '263 d.C. — 298 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_rhaegar', name: 'Rhaegar Targaryen', house: 'Targaryen', portrait: 'portrait-male', description: 'Príncipe heredero cuyas acciones desencadenaron la Rebelión de Robert.', periodLabel: '259 d.C. — 283 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_aerys2', name: 'Aerys II Targaryen', house: 'Targaryen', portrait: 'portrait-old', description: 'El "Rey Loco", último Targaryen en ocupar el Trono de Hierro antes de la rebelión.', periodLabel: '244 d.C. — 283 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_jon_arryn', name: 'Jon Arryn', house: 'Arryn', portrait: 'portrait-old', description: 'Señor del Valle y Mano del Rey de Robert Baratheon.', periodLabel: '244 d.C. — 298 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_ned_stark_kl', name: 'Eddard Stark en Desembarco', house: 'Stark', portrait: 'portrait-male', description: 'Nombrado Mano del Rey tras la muerte de Jon Arryn.', periodLabel: '298 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_daenerys', name: 'Daenerys Targaryen', house: 'Targaryen', portrait: 'portrait-female', description: 'Última Targaryen conocida, madre de dragones.', periodLabel: '284 d.C. — 300 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_jon_snow', name: 'Jon Nieve', house: 'Stark / Targaryen', portrait: 'portrait-male', description: 'Hijo criado como bastardo en Invernalia, figura central del conflicto final.', periodLabel: '283 d.C. — 300 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_night_king', name: 'El Rey de la Noche', house: 'Desconocida', portrait: 'skull', description: 'Líder de los Caminantes Blancos.', periodLabel: 'Fecha desconocida', eventIds: [], status: 'desconocido', tvOnlyNote: 'Este personaje y su rol final proceden de la adaptación televisiva; su desarrollo en las novelas aún no se ha publicado.' },
];

export function getCharacter(id: string): CharacterData | undefined {
  return characters.find((c) => c.id === id);
}
