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

  // --- Capítulo 2: Las Cenizas ---
  {
    id: 'char_aegon3',
    name: 'Aegon III Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-male',
    description:
      'Hijo de Rhaenyra, coronado con solo diez años tras el final de la Danza de los Dragones. Su resentimiento hacia los dragones le valió el apodo de "el Destructor de Dragones".',
    periodLabel: '120 d.C. — 157 d.C. (fecha aproximada)',
    eventIds: ['ev_regencia_cenizas', 'ev_ultimo_dragon'],
    status: 'muerto',
  },

  // --- Capítulo 3: Los Targaryen ---
  {
    id: 'char_aerys2',
    name: 'Aerys II Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-old-silver',
    description:
      'El "Rey Loco", último Targaryen en ocupar el Trono de Hierro antes de la rebelión. Su reinado, inicialmente prometedor, degeneró en paranoia tras el Desafío de Duskendale.',
    periodLabel: '244 d.C. — 283 d.C. (fecha aproximada)',
    eventIds: ['ev_generaciones_paz', 'ev_rapto_lyanna', 'ev_llamado_armas', 'ev_saqueo_desembarco'],
    status: 'muerto',
  },
  {
    id: 'char_rhaegar',
    name: 'Rhaegar Targaryen',
    house: 'Targaryen',
    portrait: 'portrait-male-silver',
    description:
      'Príncipe heredero, célebre por su melancolía y su afición a la música y las profecías antiguas. Sus acciones en el Torneo de Harrenhal precipitaron la Rebelión de Robert.',
    periodLabel: '259 d.C. — 283 d.C. (fecha aproximada)',
    eventIds: ['ev_torneo_harrenhal', 'ev_rapto_lyanna', 'ev_batalla_tridente'],
    status: 'muerto',
  },
  {
    id: 'char_lyanna',
    name: 'Lyanna Stark',
    house: 'Stark',
    portrait: 'portrait-female-dark',
    description:
      'Hija de Lord Rickard Stark, prometida a Robert Baratheon. Su desaparición junto al príncipe Rhaegar —rapto o huida voluntaria, según la fuente— encendió la mecha de la rebelión.',
    periodLabel: '264 d.C. — 283 d.C. (fecha aproximada)',
    eventIds: ['ev_torneo_harrenhal', 'ev_rapto_lyanna'],
    status: 'muerto',
  },

  // --- Capítulo 4: La Rebelión ---
  {
    id: 'char_brandon_stark',
    name: 'Brandon Stark',
    house: 'Stark',
    portrait: 'portrait-male-blonde',
    description:
      'Hermano mayor de Lyanna y Eddard, heredero de Invernalia. Su furiosa cabalgata hasta Desembarco del Rey para exigir la cabeza de Rhaegar acabó en tragedia.',
    periodLabel: '263 d.C. — 282 d.C. (fecha aproximada)',
    eventIds: ['ev_rapto_lyanna'],
    status: 'muerto',
  },
  {
    id: 'char_rickard_stark',
    name: 'Rickard Stark',
    house: 'Stark',
    portrait: 'portrait-old-noble',
    description:
      'Señor de Invernalia, padre de Brandon, Eddard y Lyanna. Acudió a la corte a pedir clemencia para su hijo y no volvió a salir con vida.',
    periodLabel: '234 d.C. — 282 d.C. (fecha aproximada)',
    eventIds: ['ev_rapto_lyanna'],
    status: 'muerto',
  },
  {
    id: 'char_jon_arryn',
    name: 'Jon Arryn',
    house: 'Arryn',
    portrait: 'portrait-old-warm',
    description:
      'Señor del Valle y tutor de Robert Baratheon y Eddard Stark. Su negativa a entregarlos para su ejecución encendió la Rebelión de Robert.',
    periodLabel: '244 d.C. — 298 d.C. (fecha aproximada)',
    eventIds: ['ev_llamado_armas'],
    status: 'muerto',
  },
  {
    id: 'char_robert',
    name: 'Robert Baratheon',
    house: 'Baratheon',
    portrait: 'portrait-male-dark',
    description:
      'Señor de Bastión de Tormentas, prometido de Lyanna Stark. Encabezó la rebelión contra los Targaryen y mató a Rhaegar en la Batalla del Tridente.',
    periodLabel: '262 d.C. — 298 d.C. (fecha aproximada)',
    eventIds: ['ev_llamado_armas', 'ev_batalla_tridente'],
    status: 'muerto',
  },
  {
    id: 'char_eddard',
    name: 'Eddard Stark',
    house: 'Stark',
    portrait: 'portrait-male-grey',
    description:
      'Hermano menor de Brandon y Lyanna, conocido por su honor inquebrantable. Se unió a la rebelión de Robert tras la muerte de su padre y su hermano.',
    periodLabel: '263 d.C. — 298 d.C. (fecha aproximada)',
    eventIds: ['ev_llamado_armas'],
    status: 'muerto',
  },
  {
    id: 'char_tywin',
    name: 'Tywin Lannister',
    house: 'Lannister',
    portrait: 'portrait-old',
    description:
      'Señor de Roca Casterly, permaneció neutral durante la mayor parte de la rebelión hasta ofrecer una lealtad de última hora que resultó fatal para Aerys II.',
    periodLabel: '242 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_saqueo_desembarco'],
    status: 'muerto',
  },
  {
    id: 'char_jaime',
    name: 'Jaime Lannister',
    house: 'Lannister',
    portrait: 'portrait-male-gold',
    description:
      'Joven caballero de la Guardia Real jurado a proteger al rey. Puso fin a la dinastía Targaryen y ganó el apodo de "Matarreyes" por ello.',
    periodLabel: '266 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_saqueo_desembarco'],
    status: 'muerto',
  },

  // --- Capítulo 5: El Juego de Tronos ---
  {
    id: 'char_cersei',
    name: 'Cersei Lannister',
    house: 'Lannister',
    portrait: 'portrait-female',
    description:
      'Reina consorte de Robert Baratheon e hija de Tywin Lannister. Sus hijos son en realidad fruto de su relación con su hermano gemelo Jaime, un secreto que desató la Guerra de los Cinco Reyes al salir a la luz.',
    periodLabel: '266 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_mano_del_rey', 'ev_caida_stark'],
    status: 'vivo',
  },
  {
    id: 'char_joffrey',
    name: 'Joffrey Baratheon',
    house: 'Baratheon / Lannister',
    portrait: 'portrait-male-blonde',
    description:
      'Hijo mayor de Cersei y heredero oficial de Robert, aunque en realidad hijo de Jaime Lannister. Su coronación y su crueldad precipitaron la caída de Eddard Stark.',
    periodLabel: '286 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_caida_stark'],
    status: 'vivo',
  },
  {
    id: 'char_tyrion',
    name: 'Tyrion Lannister',
    house: 'Lannister',
    portrait: 'portrait-male-blonde',
    description:
      'Hijo menor de Tywin, apodado "el Gnomo" por su estatura. Nombrado Mano del Rey en funciones, organizó la defensa de Desembarco del Rey con pólvora líquida durante la Batalla de Aguasnegras.',
    periodLabel: '273 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_aguasnegras'],
    status: 'vivo',
  },
  {
    id: 'char_robb',
    name: 'Robb Stark',
    house: 'Stark',
    portrait: 'portrait-knight',
    description:
      'Hijo mayor de Eddard Stark. Tras la ejecución de su padre, fue proclamado Rey en el Norte por sus banderizos, iniciando la Guerra de los Cinco Reyes.',
    periodLabel: '283 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_rey_en_el_norte'],
    status: 'vivo',
  },
  {
    id: 'char_catelyn',
    name: 'Catelyn Stark',
    house: 'Tully / Stark',
    portrait: 'portrait-female-dark',
    description:
      'Esposa de Eddard Stark y señora de Aguasdulces. Reunió a los banderizos del Norte y las Tierras de los Ríos en apoyo de su hijo Robb.',
    periodLabel: '264 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_rey_en_el_norte'],
    status: 'vivo',
  },
  {
    id: 'char_stannis',
    name: 'Stannis Baratheon',
    house: 'Baratheon',
    portrait: 'portrait-male-dark',
    description:
      'Hermano menor de Robert, severo y de estricta rectitud. Reclamó el Trono de Hierro para sí y estuvo a punto de tomar Desembarco del Rey en la Batalla de Aguasnegras.',
    periodLabel: '260 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_rey_en_el_norte', 'ev_aguasnegras'],
    status: 'vivo',
  },
  {
    id: 'char_hound',
    name: 'Sandor Clegane, "El Perro"',
    house: 'Clegane',
    portrait: 'portrait-knight',
    description:
      'Guardaespaldas de Joffrey, curtido y desfigurado por el fuego desde niño. Su terror al fuego lo puso a prueba durante la Batalla de Aguasnegras.',
    periodLabel: '270 d.C. — 300 d.C. (fecha aproximada)',
    eventIds: ['ev_aguasnegras'],
    status: 'vivo',
  },

  // --- Personajes de capítulos futuros (aparecerán bloqueados) ---
  { id: 'char_daenerys', name: 'Daenerys Targaryen', house: 'Targaryen', portrait: 'portrait-female', description: 'Última Targaryen conocida, madre de dragones.', periodLabel: '284 d.C. — 300 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_jon_snow', name: 'Jon Nieve', house: 'Stark / Targaryen', portrait: 'portrait-male', description: 'Hijo criado como bastardo en Invernalia, figura central del conflicto final.', periodLabel: '283 d.C. — 300 d.C. (fecha aproximada)', eventIds: [], status: 'desconocido' },
  { id: 'char_night_king', name: 'El Rey de la Noche', house: 'Desconocida', portrait: 'skull', description: 'Líder de los Caminantes Blancos.', periodLabel: 'Fecha desconocida', eventIds: [], status: 'desconocido', tvOnlyNote: 'Este personaje y su rol final proceden de la adaptación televisiva; su desarrollo en las novelas aún no se ha publicado.' },
];

export function getCharacter(id: string): CharacterData | undefined {
  return characters.find((c) => c.id === id);
}
