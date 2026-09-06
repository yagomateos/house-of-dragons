import type { IconKey } from '../types';

export interface HouseData {
  id: string;
  name: string;
  icon: IconKey;
  seat: string;
  words: string;
  description: string;
  /** subcadena(s) usadas para detectar coincidencia con CharacterData.house */
  matchKeys: string[];
}

export const houses: HouseData[] = [
  {
    id: 'house_targaryen',
    name: 'Casa Targaryen',
    icon: 'dragon-black',
    seat: 'Rocadragón / Desembarco del Rey',
    words: 'Fuego y Sangre',
    description:
      'Dinastía de origen valyrio que conquistó los Siete Reinos gracias a sus dragones. Gobernó el Trono de Hierro durante generaciones.',
    matchKeys: ['Targaryen'],
  },
  {
    id: 'house_hightower',
    name: 'Casa Hightower',
    icon: 'tower',
    seat: 'Antigua',
    words: 'Iluminando el Camino',
    description: 'Una de las casas más antiguas y ricas de Poniente, guardiana de la ciudad de Antigua.',
    matchKeys: ['Hightower'],
  },
  {
    id: 'house_velaryon',
    name: 'Casa Velaryon',
    icon: 'ship',
    seat: 'Marcaderiva',
    words: 'La Marea Nunca Cede',
    description: 'Antigua casa de origen valyrio conocida por su poderosa flota y sus lazos con la Casa Targaryen.',
    matchKeys: ['Velaryon'],
  },
  {
    id: 'house_stark',
    name: 'Casa Stark',
    icon: 'wolf',
    seat: 'Invernalia',
    words: 'Se Acerca el Invierno',
    description: 'Señores del Norte desde hace miles de años, conocidos por su honor y resistencia.',
    matchKeys: ['Stark'],
  },
  {
    id: 'house_baratheon',
    name: 'Casa Baratheon',
    icon: 'stag',
    seat: 'Bastión de Tormentas',
    words: 'Nuestra es la Furia',
    description: 'Casa fundada tras la Conquista de Aegon, emparentada por matrimonio con los Targaryen.',
    matchKeys: ['Baratheon'],
  },
  {
    id: 'house_lannister',
    name: 'Casa Lannister',
    icon: 'lion',
    seat: 'Roca Casterly',
    words: 'Oye Mi Rugido',
    description: 'La casa más rica de Poniente, señores del Occidente.',
    matchKeys: ['Lannister'],
  },
  {
    id: 'house_arryn',
    name: 'Casa Arryn',
    icon: 'falcon',
    seat: 'El Nido de Águilas',
    words: 'Tan Alto Como el Honor',
    description: 'Antigua casa de reyes de la montaña y el Valle, gobernantes de una de las regiones más inexpugnables de Poniente.',
    matchKeys: ['Arryn'],
  },
  {
    id: 'house_greyjoy',
    name: 'Casa Greyjoy',
    icon: 'kraken',
    seat: 'Pyke',
    words: 'Nosotros No Sembramos',
    description: 'Señores de las Islas de Hierro, herederos de una tradición de saqueo naval.',
    matchKeys: ['Greyjoy'],
  },
  {
    id: 'house_tully',
    name: 'Casa Tully',
    icon: 'trout',
    seat: 'Aguasdulces',
    words: 'Familia, Deber, Honor',
    description: 'Señores de las Tierras de los Ríos, elevados a la nobleza tras la Conquista de Aegon.',
    matchKeys: ['Tully'],
  },
];

export function getHouse(id: string): HouseData | undefined {
  return houses.find((h) => h.id === id);
}
