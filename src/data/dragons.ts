import type { DragonData } from '../types';

export const dragons: DragonData[] = [
  {
    id: 'drag_syrax',
    name: 'Syrax',
    rider: 'Rhaenyra Targaryen',
    periodLabel: '97 d.C. — 130 d.C. (fecha aproximada)',
    description: 'Dragona de color amarillo dorado, montura de Rhaenyra desde su nacimiento.',
    sizeLabel: 'Grande',
    status: 'muerto',
    portrait: 'dragon-gold',
  },
  {
    id: 'drag_caraxes',
    name: 'Caraxes',
    rider: 'Daemon Targaryen',
    periodLabel: 'Fecha aproximada de nacimiento: c. 70 d.C.',
    description: 'Llamado "la Serpiente Roja Sangre" por su cuerpo alargado y sinuoso de color rojo oscuro.',
    sizeLabel: 'Grande',
    status: 'vivo',
    portrait: 'dragon-red',
  },
  {
    id: 'drag_vhagar',
    name: 'Vhagar',
    rider: 'Aemond Targaryen',
    periodLabel: 'Nacida en Valyria antes de la Maldición, c. 30 d.C. (fecha aproximada)',
    description:
      'La dragona viva más vieja y grande de Poniente durante la Danza de los Dragones. Antes montada por la reina Visenya Targaryen.',
    sizeLabel: 'Colosal',
    status: 'vivo',
    portrait: 'dragon-green',
  },
  {
    id: 'drag_sunfyre',
    name: 'Sunfyre',
    rider: 'Aegon II Targaryen',
    periodLabel: 'c. 120 d.C. (fecha aproximada) — 131 d.C.',
    description: 'Dragón de escamas doradas, considerado el más hermoso de su generación.',
    sizeLabel: 'Grande',
    status: 'muerto',
    portrait: 'dragon-gold-bright',
  },
  {
    id: 'drag_meleys',
    name: 'Meleys',
    rider: 'Rhaenys Targaryen',
    periodLabel: 'Fecha aproximada de nacimiento: c. 75 d.C.',
    description: 'Llamada "la Reina Roja Sangre", una de las dragonas más veloces jamás conocidas.',
    sizeLabel: 'Grande',
    status: 'muerto',
    portrait: 'dragon-crimson',
  },
  {
    id: 'drag_arrax',
    name: 'Arrax',
    rider: 'Lucerys Velaryon',
    periodLabel: 'c. 114 d.C. (fecha aproximada) — 129 d.C.',
    description: 'Dragón de menor tamaño, ágil y veloz, montado por Lucerys en su fatídico vuelo a Bosque Susurrante.',
    sizeLabel: 'Mediano',
    status: 'muerto',
    portrait: 'dragon-pale',
  },
  {
    id: 'drag_vermithor',
    name: 'Vermithor',
    rider: 'Sin jinete (antes Jaehaerys I)',
    periodLabel: 'Fecha aproximada de nacimiento: c. 20 d.C.',
    description: 'Llamado "el Furor de Bronce", uno de los dragones más grandes vivos durante la Danza.',
    sizeLabel: 'Colosal',
    status: 'vivo',
    portrait: 'dragon-bronze',
  },
  {
    id: 'drag_silverwing',
    name: 'Plateada (Silverwing)',
    rider: 'Sin jinete (antes Alysanne Targaryen)',
    periodLabel: 'Fecha aproximada de nacimiento: c. 25 d.C.',
    description: 'Dragona de color plata y blanco, antigua montura de la reina Buena Reina Alysanne.',
    sizeLabel: 'Grande',
    status: 'vivo',
    portrait: 'dragon-silver',
  },
];

export function getDragon(id: string): DragonData | undefined {
  return dragons.find((d) => d.id === id);
}
