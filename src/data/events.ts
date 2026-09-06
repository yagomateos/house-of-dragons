import type { HistoricalEvent } from '../types';

export const events: HistoricalEvent[] = [
  // =========================================================
  // EVENTO 1 — La Muerte del Rey
  // =========================================================
  {
    id: 'ev_muerte_viserys',
    chapterId: 'ch1_danza',
    locationId: 'dragonstone',
    order: 1,
    year: '129 d.C.',
    title: 'La Muerte del Rey',
    characterIds: ['char_viserys', 'char_alicent', 'char_otto', 'char_aegon2'],
    summary: 'La muerte de Viserys I desata la disputa por la sucesión del Trono de Hierro.',
    tvOnlyNote:
      'La escena del lecho de muerte del rey y el malentendido de la reina Alicent sobre unas palabras del rey es una dramatización de la serie "La Casa del Dragón"; no aparece narrada de esta forma en el libro "Fuego y Sangre".',
    nextEventId: 'ev_reclamacion_rhaenyra',
    steps: [
      {
        type: 'narration',
        background: 'castle',
        text: 'En Desembarco del Rey, el rey Viserys I Targaryen agoniza tras años de enfermedad. Ha reinado durante más de veinticinco años, en gran parte en paz.',
      },
      {
        type: 'narration',
        background: 'hall',
        text: 'Viserys había nombrado heredera a su hija Rhaenyra años atrás, obligando a los señores del reino a jurarle lealtad como su sucesora. Pero en la corte, el partido de la reina Alicent Hightower y su padre Otto maniobraba para asegurar el trono al hijo varón mayor del rey, Aegon.',
      },
      { type: 'dialogue', speakerId: 'char_otto', text: 'El reino necesita un rey fuerte en el trono, no una reina que deba repartir su autoridad con extraños.' },
      { type: 'dialogue', speakerId: 'char_alicent', text: 'Mi hijo es mayor y varón. El Consejo no debe olvidarlo cuando llegue la hora.' },
      {
        type: 'narration',
        background: 'throne',
        text: 'Horas después de la muerte del rey, y sin que Rhaenyra ni su esposo Daemon lo supieran aún, el Consejo Privado corona apresuradamente a Aegon como el segundo de su nombre en el Gran Sept de Baelor.',
      },
      {
        type: 'decision',
        prompt: 'Como cronista viajero, ¿qué quieres investigar primero sobre esta sucesión?',
        options: [
          {
            id: 'sucesion',
            label: 'LA SUCESIÓN',
            resultText:
              'Consultas viejos registros: en el año 101 d.C., el rey Viserys I convocó un Gran Consejo que confirmó a Rhaenyra como su heredera, y exigió juramentos de lealtad a todos los grandes señores del reino.',
            knowledgeBonus: 3,
          },
          {
            id: 'dragones',
            label: 'LOS DRAGONES',
            resultText:
              'Anotas qué dragones respaldan a cada bando: Rhaenyra monta a Syrax; Aegon, a Sunfyre. Ambos bandos cuentan con jinetes y dragones jóvenes, un factor que decidirá buena parte de la guerra que se avecina.',
            knowledgeBonus: 3,
          },
          {
            id: 'verdes',
            label: 'LOS VERDES',
            resultText:
              'El partido Verde, llamado así por los colores de la Casa Hightower, se forma en torno a Alicent, Otto y sus aliados, decidido a coronar a Aegon.',
            knowledgeBonus: 3,
          },
          {
            id: 'negros',
            label: 'LOS NEGROS',
            resultText:
              'El partido Negro, en referencia al luto y a los colores de la Casa Targaryen, se forma en torno a Rhaenyra y su reclamación como heredera legítima.',
            knowledgeBonus: 3,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿A quién nombró Viserys I como su heredera del Trono de Hierro?',
        options: ['Alicent Hightower', 'Rhaenyra Targaryen', 'Rhaenys Targaryen', 'Helaena Targaryen'],
        correctIndex: 1,
        explanation:
          'Viserys I nombró a su hija Rhaenyra heredera tras el Gran Consejo de 101 d.C. y exigió a los señores del reino que le juraran lealtad como su sucesora.',
      },
      {
        type: 'reward',
        knowledge: 15,
        experience: 10,
        unlockCharacterIds: ['char_viserys', 'char_rhaenyra', 'char_aegon2', 'char_alicent', 'char_otto'],
        unlockDragonIds: ['drag_syrax', 'drag_sunfyre'],
        text: 'Has comenzado a comprender el origen de la Danza de los Dragones.',
      },
    ],
  },

  // =========================================================
  // EVENTO 2 — La Reina Reclama su Trono
  // =========================================================
  {
    id: 'ev_reclamacion_rhaenyra',
    chapterId: 'ch1_danza',
    locationId: 'dragonstone',
    order: 2,
    year: '129 d.C.',
    title: 'La Reina Reclama su Trono',
    characterIds: ['char_rhaenyra', 'char_daemon', 'char_corlys'],
    summary: 'Rhaenyra rechaza la coronación de Aegon II y reúne a sus aliados para la guerra.',
    nextEventId: 'ev_muerte_lucerys',
    steps: [
      {
        type: 'narration',
        background: 'castle',
        text: 'La noticia de la coronación de Aegon II llega a Rocadragón, donde Rhaenyra reside junto a su esposo y tío, Daemon Targaryen. La traición se respira en los pasillos de piedra de dragón.',
      },
      { type: 'dialogue', speakerId: 'char_rhaenyra', text: 'El reino no permanecerá en silencio. Mi padre me nombró heredera ante todos los señores del reino.' },
      { type: 'dialogue', speakerId: 'char_daemon', text: 'Entonces reclamemos lo que es tuyo por derecho de sangre, con fuego si es necesario.' },
      {
        type: 'narration',
        background: 'sea',
        text: 'Rhaenyra convoca a sus aliados. Corlys Velaryon, la Serpiente Marina, pone su poderosa flota al servicio de la causa junto a varias grandes casas, formando el partido Negro que se opone abiertamente a los Verdes.',
      },
      {
        type: 'decision',
        prompt: 'Antes de continuar, ¿qué quieres registrar en tu crónica?',
        options: [
          {
            id: 'flota',
            label: 'LA FLOTA VELARYON',
            resultText: 'La Casa Velaryon controla una de las flotas más poderosas de Poniente, un recurso decisivo para el bando de Rhaenyra.',
            knowledgeBonus: 3,
          },
          {
            id: 'daemon',
            label: 'DAEMON TARGARYEN',
            resultText: 'Daemon es un guerrero experimentado y antiguo comandante de la Guardia de la Ciudad, temido tanto por aliados como por enemigos.',
            knowledgeBonus: 3,
          },
          {
            id: 'legitimidad',
            label: 'LA LEGITIMIDAD DEL RECLAMO',
            resultText: 'Los maestres y señores leales a Rhaenyra insisten en que su juramento de lealtad de 101 d.C. hace ilegítima la coronación de Aegon.',
            knowledgeBonus: 3,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Quién es el esposo de Rhaenyra y su principal apoyo militar al inicio de la guerra?',
        options: ['Otto Hightower', 'Daemon Targaryen', 'Corlys Velaryon', 'Criston Cole'],
        correctIndex: 1,
        explanation: 'Daemon Targaryen, hermano menor de Viserys I y esposo de Rhaenyra, se convierte en su principal apoyo militar y jinete de dragón.',
      },
      {
        type: 'reward',
        knowledge: 15,
        experience: 10,
        unlockCharacterIds: ['char_daemon', 'char_corlys'],
        unlockDragonIds: ['drag_caraxes'],
        text: 'Rhaenyra se prepara para la guerra. La Danza de los Dragones ha comenzado.',
      },
    ],
  },

  // =========================================================
  // EVENTO 3 — Fuego y Sangre en el Cielo (muerte de Lucerys)
  // =========================================================
  {
    id: 'ev_muerte_lucerys',
    chapterId: 'ch1_danza',
    locationId: 'dragonstone',
    order: 3,
    year: '129 d.C. (fecha aproximada)',
    title: 'Fuego y Sangre en el Cielo',
    characterIds: ['char_lucerys', 'char_aemond'],
    summary: 'La muerte de Lucerys Velaryon a manos de Aemond y Vhagar marca el punto sin retorno de la guerra.',
    tvOnlyNote:
      'Tanto la serie como el libro "Fuego y Sangre" coinciden en el suceso, pero las fuentes internas del propio relato (los maestres y cronistas de la ficción) no se ponen de acuerdo en si Aemond ordenó el ataque deliberadamente o si su dragona actuó por voluntad propia.',
    nextEventId: 'ev_batalla_bosque',
    steps: [
      {
        type: 'narration',
        background: 'sea',
        text: 'Rhaenyra envía a su hijo Lucerys, jinete del dragón Arrax, a Bastión de Tormentas para asegurar el apoyo de Lord Borros Baratheon antes de que los Verdes lo consigan.',
      },
      {
        type: 'narration',
        background: 'battle',
        text: 'Pero Aemond Targaryen, montado en la colosal Vhagar, ya se encuentra allí. El encuentro entre ambos jóvenes príncipes, cada uno sobre su dragón, se torna hostil en pleno vuelo, en medio de una tormenta.',
      },
      { type: 'dialogue', speakerId: 'char_aemond', text: 'Has volado muy lejos de casa, sobrino.' },
      { type: 'dialogue', speakerId: 'char_lucerys', text: 'Solo quiero irme en paz. No busco pelea contigo.' },
      {
        type: 'narration',
        background: 'battle',
        text: 'A pesar de las intenciones de Lucerys, la persecución termina en tragedia: Vhagar mata a Arrax y a su joven jinete. La noticia llega a Rocadragón, donde una Rhaenyra destrozada jura venganza. Este es el punto sin retorno de la guerra.',
      },
      {
        type: 'decision',
        prompt: '¿Cómo interpretas este suceso en tu crónica?',
        options: [
          {
            id: 'accidente',
            label: 'UN ACCIDENTE DE GUERRA',
            resultText: 'Anotas que, según algunas fuentes, Vhagar podría haber actuado por su propio instinto salvaje, sin una orden clara de Aemond.',
            knowledgeBonus: 3,
          },
          {
            id: 'asesinato',
            label: 'UN ASESINATO DELIBERADO',
            resultText: 'Anotas que otras fuentes acusan directamente a Aemond de ordenar el ataque como venganza por un incidente anterior entre ambos.',
            knowledgeBonus: 3,
          },
          {
            id: 'incierto',
            label: 'NO SE PUEDE SABER CON CERTEZA',
            resultText: 'Como buen cronista, anotas que las fuentes históricas se contradicen, y que la verdad exacta de lo ocurrido en el cielo aquel día se ha perdido.',
            knowledgeBonus: 4,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Qué dragón mató a Lucerys Velaryon y a su dragón Arrax?',
        options: ['Caraxes', 'Syrax', 'Vhagar', 'Sunfyre'],
        correctIndex: 2,
        explanation: 'Vhagar, la dragona montada por Aemond Targaryen y la más grande y vieja con vida en aquel momento, mató a Arrax y a Lucerys.',
      },
      {
        type: 'reward',
        knowledge: 15,
        experience: 15,
        unlockCharacterIds: ['char_lucerys', 'char_aemond'],
        unlockDragonIds: ['drag_arrax', 'drag_vhagar'],
        text: 'La guerra abierta ya no tiene marcha atrás.',
      },
    ],
  },

  // =========================================================
  // EVENTO 4 — La Batalla de Rook's Rest
  // =========================================================
  {
    id: 'ev_batalla_bosque',
    chapterId: 'ch1_danza',
    locationId: 'dragonstone',
    order: 4,
    year: '129 d.C. (fecha aproximada)',
    title: "La Batalla de Rook's Rest",
    characterIds: ['char_aegon2', 'char_rhaenys', 'char_aemond', 'char_criston'],
    summary: 'Rhaenys ataca en solitario a tres dragones Verdes, hiriendo gravemente al rey Aegon II.',
    nextEventId: 'ev_cenizas_guerra',
    steps: [
      {
        type: 'narration',
        background: 'battle',
        text: "Semanas después de la muerte de Lucerys, el partido Verde planea una emboscada: atraer a Rhaenys y a su dragona Meleys hasta Rook's Rest, cerca de Marcaderiva, con tres dragones esperando en tierra.",
      },
      {
        type: 'narration',
        background: 'battle',
        text: 'Rhaenys descubre la trampa, pero decide igualmente atacar en solitario contra los tres dragones enemigos: Sunfyre, montado por el propio rey Aegon II; Vhagar, con Aemond; y Tessarion.',
      },
      { type: 'dialogue', speakerId: 'char_rhaenys', text: 'Si debo morir hoy, que sea llevándome a un rey conmigo.' },
      {
        type: 'narration',
        background: 'battle',
        text: 'La batalla es devastadora. Meleys hiere gravemente a Sunfyre y estuvo a punto de matar al rey Aegon II, pero Vhagar interviene y mata a Rhaenys y a su dragona. Aegon II sobrevive, pero queda gravemente herido y desfigurado para el resto de su vida.',
      },
      {
        type: 'decision',
        prompt: '¿Qué aspecto de la batalla quieres registrar con más detalle?',
        options: [
          { id: 'dragones', label: 'EL PAPEL DE LOS DRAGONES', resultText: 'Tres dragones contra uno: la batalla demuestra que incluso en inferioridad numérica, un solo dragón bien montado puede cambiar el curso de una guerra.', knowledgeBonus: 3 },
          { id: 'bajas', label: 'LAS BAJAS', resultText: 'La muerte de Rhaenys y Meleys es una pérdida irreparable para el partido Negro, tanto militar como simbólicamente.', knowledgeBonus: 3 },
          { id: 'consecuencias', label: 'LAS CONSECUENCIAS POLÍTICAS', resultText: 'Las heridas de Aegon II lo dejan incapacitado durante meses, obligando a su hermano Aemond a gobernar en su nombre como Protector del Reino.', knowledgeBonus: 3 },
        ],
      },
      {
        type: 'question',
        prompt: "¿Qué le ocurrió al rey Aegon II en la Batalla de Rook's Rest?",
        options: ['Murió en la batalla', 'Resultó gravemente herido y desfigurado', 'Huyó sin luchar', 'Capturó a Rhaenyra'],
        correctIndex: 1,
        explanation: "En la Batalla de Rook's Rest, Aegon II fue gravemente herido por Meleys y quedó desfigurado, aunque sobrevivió gracias a la intervención de Vhagar.",
      },
      {
        type: 'reward',
        knowledge: 15,
        experience: 15,
        unlockCharacterIds: ['char_rhaenys', 'char_criston'],
        unlockDragonIds: ['drag_meleys'],
        text: 'El equilibrio de fuerzas entre Verdes y Negros ha cambiado para siempre.',
      },
    ],
  },

  // =========================================================
  // EVENTO 5 — Las Cenizas de la Guerra
  // =========================================================
  {
    id: 'ev_cenizas_guerra',
    chapterId: 'ch1_danza',
    locationId: 'dragonstone',
    order: 5,
    year: '130 d.C. — 131 d.C. (fecha aproximada)',
    title: 'Las Cenizas de la Guerra',
    characterIds: ['char_rhaenyra', 'char_aegon2'],
    summary: 'Rhaenyra ocupa brevemente el Trono de Hierro antes de su caída, marcando el fin de la Danza de los Dragones.',
    tvOnlyNote:
      'El detalle de que el Trono de Hierro hiere físicamente a quienes considera "indignos" es un elemento simbólico desarrollado por la ficción (libro y serie) y no debe tomarse como un hecho verificado dentro de la propia historia narrada.',
    steps: [
      {
        type: 'narration',
        background: 'throne',
        text: 'Tras meses de guerra, pérdidas de dragones y ciudades devastadas, Rhaenyra logra ocupar brevemente Desembarco del Rey y sentarse en el Trono de Hierro. El propio trono, forjado con las espadas fundidas de los enemigos de Aegon el Conquistador, la hiere gravemente, un presagio que muchos interpretan como un mal augurio.',
      },
      {
        type: 'narration',
        background: 'castle',
        text: 'Su reinado en la capital es breve. Sin apoyo popular suficiente y con la ciudad sublevada por el hambre y el descontento, Rhaenyra se ve obligada a huir. Finalmente es capturada y ejecutada por orden de Aegon II, quien recupera el Trono de Hierro.',
      },
      { type: 'dialogue', speakerId: 'char_aegon2', text: 'El trono es mío. Que el reino entero lo recuerde.' },
      {
        type: 'narration',
        background: 'snow',
        text: 'La Danza de los Dragones termina con un reino devastado y la mayoría de los dragones de Poniente muertos. Aegon II gobernará poco tiempo más antes de morir, y el trono pasará finalmente al hijo de Rhaenyra, Aegon III, quien sería recordado como "el Destructor de Dragones" por la desconfianza que la guerra sembró hacia las grandes bestias aladas.',
      },
      {
        type: 'decision',
        prompt: '¿Cómo resumirías en tu crónica el resultado final de la Danza de los Dragones?',
        options: [
          { id: 'victoria_vacia', label: 'UNA VICTORIA VACÍA PARA LOS VERDES', resultText: 'Los Verdes conservan el trono, pero a un coste que ninguna de las dos partes podría considerar una verdadera victoria.', knowledgeBonus: 4 },
          { id: 'fin_dragones', label: 'EL FIN DE LA ERA DE LOS DRAGONES', resultText: 'La mayoría de los dragones de Poniente mueren durante la guerra, marcando el declive definitivo del poder Targaryen basado en estas criaturas.', knowledgeBonus: 4 },
          { id: 'herida_abierta', label: 'UNA HERIDA QUE EL REINO NUNCA CERRÓ', resultText: 'La desconfianza y la división sembradas por la Danza perdurarán en la memoria del reino durante generaciones.', knowledgeBonus: 4 },
        ],
      },
      {
        type: 'question',
        prompt: '¿Quién terminó ocupando el Trono de Hierro tras el final de la Danza de los Dragones?',
        options: ['Rhaenyra Targaryen', 'Aegon II Targaryen', 'Daemon Targaryen', 'Aemond Targaryen'],
        correctIndex: 1,
        explanation: 'Aegon II recuperó el Trono de Hierro tras la caída de Rhaenyra, aunque su reinado posterior fue breve.',
      },
      {
        type: 'reward',
        knowledge: 20,
        experience: 20,
        unlockLocationIds: ['kings_landing'],
        unlockDragonIds: ['drag_vermithor', 'drag_silverwing'],
        text: 'Capítulo completado. Las cenizas de la Danza de los Dragones marcarán el destino de Poniente durante generaciones.',
      },
    ],
  },
];

export function getEvent(id: string): HistoricalEvent | undefined {
  return events.find((e) => e.id === id);
}
