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

  // =========================================================
  // CAPÍTULO 2 — LAS CENIZAS
  // =========================================================

  {
    id: 'ev_regencia_cenizas',
    chapterId: 'ch2_cenizas',
    locationId: 'kings_landing',
    order: 1,
    year: '131 d.C. — 135 d.C. (fecha aproximada)',
    title: 'El Reinado de las Cenizas',
    characterIds: ['char_aegon3'],
    summary: 'El joven Aegon III hereda un Trono de Hierro y un reino devastados por la Danza de los Dragones.',
    nextEventId: 'ev_ultimo_dragon',
    steps: [
      {
        type: 'narration',
        background: 'throne',
        text: 'Con solo diez años, Aegon III Targaryen —hijo de Rhaenyra— se sienta en el Trono de Hierro tras la muerte de Aegon II. Hereda un reino agotado por la guerra, arcas vacías y un pueblo que ya no confía en los dragones.',
      },
      {
        type: 'narration',
        background: 'hall',
        text: 'El joven rey rara vez sonríe: ha visto morir a su madre y a la mayoría de su familia en la Danza. La corte lo apoda "Aegon el Apacible", aunque algunos susurran otro nombre —"el Destructor de Dragones"— por el resentimiento que siente hacia las criaturas que devastaron su casa.',
      },
      { type: 'dialogue', speakerId: 'char_aegon3', text: 'No quiero volver a ver arder un dragón mientras viva.' },
      {
        type: 'decision',
        prompt: '¿Qué aspecto del nuevo reinado prefieres registrar?',
        options: [
          {
            id: 'arcas',
            label: 'LAS ARCAS VACÍAS',
            resultText: 'La guerra ha dejado la Corona al borde de la ruina económica; reconstruir la capital llevará años.',
            knowledgeBonus: 3,
          },
          {
            id: 'desconfianza',
            label: 'LA DESCONFIANZA HACIA LOS DRAGONES',
            resultText: 'El pueblo, que vio caer fuego sobre sus propias calles, empieza a temer a las criaturas que antes admiraba.',
            knowledgeBonus: 3,
          },
          {
            id: 'regentes',
            label: 'LOS REGENTES',
            resultText: 'Un consejo de regencia gobierna en nombre del joven rey mientras este crece, intentando estabilizar el reino.',
            knowledgeBonus: 3,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Quién era la madre de Aegon III?',
        options: ['Alicent Hightower', 'Rhaenyra Targaryen', 'Rhaenys Targaryen', 'Helaena Targaryen'],
        correctIndex: 1,
        explanation: 'Aegon III era hijo de Rhaenyra Targaryen, la reina depuesta y ejecutada al final de la Danza de los Dragones.',
      },
      {
        type: 'reward',
        knowledge: 15,
        experience: 15,
        unlockCharacterIds: ['char_aegon3'],
        text: 'Has comenzado a comprender el precio que pagó Poniente por la guerra civil Targaryen.',
      },
    ],
  },

  {
    id: 'ev_ultimo_dragon',
    chapterId: 'ch2_cenizas',
    locationId: 'kings_landing',
    order: 2,
    year: '153 d.C. (fecha aproximada)',
    title: 'El Último Dragón',
    characterIds: ['char_aegon3'],
    summary: 'Con el paso de las décadas, los dragones de Poniente se extinguen, cerrando la era iniciada por Aegon el Conquistador.',
    steps: [
      {
        type: 'narration',
        background: 'castle',
        text: 'Durante su reinado, Aegon III recibe un huevo de dragón que nunca llega a eclosionar: es el último intento conocido de la Casa Targaryen por vincularse a un dragón en generaciones.',
      },
      {
        type: 'narration',
        background: 'snow',
        text: 'Con el paso de las décadas, los dragones de Poniente —diezmados por la Danza— se extinguen uno a uno. Cuando muere el último, la era de fuego y sangre que dio poder a los Targaryen durante siglo y medio llega discretamente a su fin.',
      },
      { type: 'dialogue', speakerId: 'char_aegon3', text: 'Quizás el reino esté mejor sin ellos. Quizás no.' },
      {
        type: 'decision',
        prompt: '¿Cómo interpretas el fin de la era de los dragones?',
        options: [
          {
            id: 'precio',
            label: 'EL PRECIO DE LA DANZA',
            resultText: 'La guerra civil fue la causa directa: nunca antes murieron tantos dragones juntos en tan poco tiempo.',
            knowledgeBonus: 3,
          },
          {
            id: 'destino',
            label: 'EL DESTINO DE TODO PODER',
            resultText: 'Ninguna dinastía conserva para siempre la fuente de su fuerza; los dragones no fueron la excepción.',
            knowledgeBonus: 3,
          },
          {
            id: 'alivio',
            label: 'UN ALIVIO PARA EL REINO',
            resultText: 'Para buena parte del pueblo llano, que solo conoció el fuego como arma de guerra, su desaparición trae cierta paz.',
            knowledgeBonus: 4,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Qué suceso marcó el principio del fin de los dragones de Poniente?',
        options: ['La Rebelión de Robert', 'La Danza de los Dragones', 'La Maldición de Valyria', 'El Torneo de Harrenhal'],
        correctIndex: 1,
        explanation: 'La Danza de los Dragones diezmó a la mayoría de los dragones de Poniente; los pocos que sobrevivieron se extinguieron en las generaciones siguientes.',
      },
      {
        type: 'reward',
        knowledge: 20,
        experience: 15,
        unlockLocationIds: ['harrenhal'],
        text: 'Capítulo completado. Sin dragones, el poder de los Targaryen empieza a depender, por primera vez en siglo y medio, solo de sus alianzas y su ejército.',
      },
    ],
  },

  // =========================================================
  // CAPÍTULO 3 — LOS TARGARYEN
  // =========================================================

  {
    id: 'ev_generaciones_paz',
    chapterId: 'ch3_targaryen',
    locationId: 'harrenhal',
    order: 1,
    year: '153 d.C. — 262 d.C. (fecha aproximada)',
    title: 'Generaciones de Silencio',
    characterIds: ['char_aerys2'],
    summary: 'Más de un siglo sin guerra civil termina con la transformación de Aerys II en el "Rey Loco".',
    nextEventId: 'ev_torneo_harrenhal',
    steps: [
      {
        type: 'narration',
        background: 'hall',
        text: 'Durante más de un siglo, el Trono de Hierro pasa de generación en generación sin otra gran guerra civil. El reino sana lentamente las heridas de la Danza, aunque la memoria del fuego y la sangre nunca desaparece del todo.',
      },
      {
        type: 'narration',
        background: 'throne',
        text: 'El último de estos reyes, Aerys II Targaryen, comienza su reinado alabado como un gobernante justo y generoso. Pero tras ser secuestrado por un señor rebelde durante el Desafío de Duskendale, algo en él se quiebra para siempre.',
      },
      { type: 'dialogue', speakerId: 'char_aerys2', text: 'Nadie volverá a encerrarme. Nunca más.' },
      {
        type: 'decision',
        prompt: '¿Qué quieres investigar sobre la transformación de Aerys II?',
        options: [
          {
            id: 'duskendale',
            label: 'EL DESAFÍO DE DUSKENDALE',
            resultText: 'Un señor menor mantuvo al rey cautivo durante meses; Aerys nunca volvió a sentirse a salvo entre sus propios súbditos.',
            knowledgeBonus: 3,
          },
          {
            id: 'desconfianza',
            label: 'SU DESCONFIANZA CRECIENTE',
            resultText: 'Con los años, Aerys llega a sospechar hasta de su propia Mano, alejando a quienes antes lo aconsejaban con lealtad.',
            knowledgeBonus: 3,
          },
          {
            id: 'apodo',
            label: 'EL APODO "REY LOCO"',
            resultText: 'El pueblo y la nobleza por igual empiezan a llamarlo así en voz baja, temiendo sus cambios de humor cada vez más violentos.',
            knowledgeBonus: 3,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Qué apodo recibió Aerys II Targaryen debido a su comportamiento errático?',
        options: ['El Rey Loco', 'El Rey Cruel', 'El Rey Ciego', 'El Rey Silencioso'],
        correctIndex: 0,
        explanation: 'Aerys II pasó a la historia como "el Rey Loco" por su paranoia y crueldad crecientes, especialmente tras el Desafío de Duskendale.',
      },
      {
        type: 'reward',
        knowledge: 15,
        experience: 15,
        unlockCharacterIds: ['char_aerys2'],
        text: 'Has comenzado a comprender cómo un reinado prometedor se torció hacia la tragedia.',
      },
    ],
  },

  {
    id: 'ev_torneo_harrenhal',
    chapterId: 'ch3_targaryen',
    locationId: 'harrenhal',
    order: 2,
    year: '281 d.C. — 282 d.C. (fecha aproximada)',
    title: 'El Torneo de Harrenhal',
    characterIds: ['char_rhaegar', 'char_lyanna'],
    summary: 'Rhaegar Targaryen corona a Lyanna Stark como reina de amor y belleza, sembrando la tensión que desatará la rebelión.',
    tvOnlyNote:
      'La coronación de Lyanna solo se conoce por el relato posterior de otros personajes en las novelas; la serie de televisión no llegó a adaptar este torneo como escena propia.',
    steps: [
      {
        type: 'narration',
        background: 'hall',
        text: 'En Harrenhal se celebra el mayor torneo que el reino ha visto en generaciones. Cientos de señores y caballeros acuden, entre ellos el príncipe heredero, Rhaegar Targaryen, célebre por su melancolía y su amor por la música y las profecías antiguas.',
      },
      {
        type: 'narration',
        background: 'hall',
        text: 'Durante la justa, un misterioso caballero con una armadura remendada —conocido después como "el Caballero del Árbol Riente"— defiende a un escudero humillado y desaparece sin revelar su identidad, un misterio que ni los propios maestres lograron resolver jamás.',
      },
      {
        type: 'narration',
        background: 'hall',
        text: 'Rhaegar vence el torneo y, en un gesto que escandaliza a la corte, corona como reina de amor y belleza a Lyanna Stark —una joven ya prometida a Robert Baratheon— en lugar de a su propia esposa, Elia Martell.',
      },
      { type: 'dialogue', speakerId: 'char_rhaegar', text: 'Hay canciones que aún no se han cantado.' },
      {
        type: 'decision',
        prompt: '¿Qué llama tu atención en el Torneo de Harrenhal?',
        options: [
          {
            id: 'corona',
            label: 'LA CORONA DE LYANNA',
            resultText: 'El gesto público de Rhaegar hacia Lyanna, ignorando a su propia esposa, no pasa desapercibido para nadie en la corte.',
            knowledgeBonus: 3,
          },
          {
            id: 'caballero',
            label: 'EL CABALLERO DEL ÁRBOL RIENTE',
            resultText: 'Su identidad sigue siendo, dentro de la propia historia, un misterio deliberadamente sin resolver.',
            knowledgeBonus: 4,
          },
          {
            id: 'tension',
            label: 'LA TENSIÓN CON ROBERT',
            resultText: 'El prometido de Lyanna presencia la coronación con evidente enfado, aunque decide no actuar ese mismo día.',
            knowledgeBonus: 3,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿A quién coronó Rhaegar Targaryen como reina del amor y la belleza en el Torneo de Harrenhal?',
        options: ['Elia Martell (su esposa)', 'Lyanna Stark', 'Cersei Lannister', 'Ashara Dayne'],
        correctIndex: 1,
        explanation: 'Rhaegar coronó a Lyanna Stark, ya prometida a Robert Baratheon, ignorando públicamente a su esposa Elia Martell.',
      },
      {
        type: 'reward',
        knowledge: 20,
        experience: 20,
        unlockCharacterIds: ['char_rhaegar', 'char_lyanna'],
        unlockLocationIds: ['storms_end'],
        text: 'Capítulo completado. La semilla de la Rebelión de Robert ha sido plantada, aunque nadie en Harrenhal parece saberlo todavía.',
      },
    ],
  },

  // =========================================================
  // CAPÍTULO 4 — LA REBELIÓN
  // =========================================================

  {
    id: 'ev_rapto_lyanna',
    chapterId: 'ch4_rebelion',
    locationId: 'storms_end',
    order: 1,
    year: '282 d.C. (fecha aproximada)',
    title: 'La Desaparición de Lyanna',
    characterIds: ['char_lyanna', 'char_rhaegar', 'char_brandon_stark', 'char_rickard_stark', 'char_aerys2'],
    summary: 'Lyanna Stark desaparece con Rhaegar; la muerte de Brandon y Rickard Stark a manos de Aerys II enciende la rebelión.',
    tvOnlyNote:
      'La muerte de Rickard y Brandon Stark solo se conoce por el relato posterior de otros personajes en las novelas; la serie de televisión únicamente la menciona, sin mostrarla.',
    nextEventId: 'ev_llamado_armas',
    steps: [
      {
        type: 'narration',
        background: 'castle',
        text: 'Poco después del torneo, Lyanna Stark desaparece. Algunos dicen que Rhaegar la raptó contra su voluntad; otros, que la joven loba del norte partió con él por voluntad propia. Ni los libros ni la propia historia del reino se ponen de acuerdo, y probablemente nunca lo hagan.',
      },
      {
        type: 'decision',
        prompt: 'Como cronista, ¿qué versión registras?',
        options: [
          {
            id: 'rapto',
            label: 'UN RAPTO',
            resultText: 'Registras la versión oficial de las Casas Stark y Baratheon: Lyanna fue tomada contra su voluntad.',
            knowledgeBonus: 3,
          },
          {
            id: 'huida',
            label: 'UNA HUIDA VOLUNTARIA',
            resultText: 'Registras los indicios de que Lyanna y Rhaegar ya se conocían y podrían haberse enamorado antes del torneo.',
            knowledgeBonus: 3,
          },
          {
            id: 'incierto',
            label: 'LA VERDAD SE PERDIÓ',
            resultText: 'Como buen cronista, anotas honestamente que ninguna fuente disponible es concluyente.',
            knowledgeBonus: 4,
          },
        ],
      },
      {
        type: 'narration',
        background: 'throne',
        text: 'Brandon Stark, hermano mayor de Lyanna y heredero de Invernalia, cabalga furioso hasta Desembarco del Rey exigiendo la cabeza de Rhaegar. El rey Aerys II lo hace arrestar por traición, junto a los amigos que lo acompañaban.',
      },
      { type: 'dialogue', speakerId: 'char_aerys2', text: 'Llamad a su padre. Que Lord Rickard Stark venga a reclamar a su hijo... si se atreve.' },
      {
        type: 'narration',
        background: 'battle',
        text: 'Cuando Lord Rickard Stark llega a la corte para pedir clemencia, Aerys II lo condena a morir quemado con su propia armadura puesta, mientras obliga a Brandon a presenciarlo, atado con una cuerda que se aprieta a medida que forcejea por alcanzar una espada fuera de su alcance. Ambos mueren ese día.',
      },
      {
        type: 'question',
        prompt: '¿Qué le ocurrió a Lord Rickard Stark, padre de Lyanna y Brandon, a manos de Aerys II?',
        options: ['Fue exiliado', 'Fue quemado vivo', 'Fue encarcelado de por vida', 'Fue perdonado'],
        correctIndex: 1,
        explanation: 'Aerys II condenó a Rickard Stark a morir quemado con su propia armadura, mientras obligaba a su hijo Brandon a presenciarlo.',
      },
      {
        type: 'reward',
        knowledge: 20,
        experience: 20,
        unlockCharacterIds: ['char_brandon_stark', 'char_rickard_stark'],
        text: 'La casa Stark exige venganza. El reino entero contiene la respiración.',
      },
    ],
  },

  {
    id: 'ev_llamado_armas',
    chapterId: 'ch4_rebelion',
    locationId: 'storms_end',
    order: 2,
    year: '282 d.C. — 283 d.C. (fecha aproximada)',
    title: 'El Llamado a las Armas',
    characterIds: ['char_aerys2', 'char_jon_arryn', 'char_robert', 'char_eddard'],
    summary: 'Jon Arryn se niega a entregar a sus pupilos para su ejecución, dando inicio a la Rebelión de Robert.',
    nextEventId: 'ev_batalla_tridente',
    steps: [
      {
        type: 'narration',
        background: 'castle',
        text: 'Temiendo por su vida tras la muerte de los Stark, Aerys II exige a Jon Arryn, Señor del Valle y tutor de Robert Baratheon y Eddard Stark, que le entregue a ambos jóvenes para ejecutarlos.',
      },
      { type: 'dialogue', speakerId: 'char_jon_arryn', text: 'Antes reuniré a mis banderizos que entregar a mis pupilos a la hoguera.' },
      {
        type: 'narration',
        background: 'battle',
        text: 'Jon Arryn se niega y alza sus estandartes en rebelión. Robert Baratheon, prometido de la desaparecida Lyanna Stark, y Eddard Stark, hermano de Brandon y Lyanna, se unen a él. Comienza la Rebelión de Robert, también llamada la Guerra del Usurpador.',
      },
      {
        type: 'decision',
        prompt: '¿Qué motivo crees que pesó más en el estallido de la rebelión?',
        options: [
          {
            id: 'venganza',
            label: 'LA MUERTE DE BRANDON Y RICKARD',
            resultText: 'Para los Stark, esto ya no es una cuestión de honor sino de sangre por sangre.',
            knowledgeBonus: 3,
          },
          {
            id: 'amor',
            label: 'LA DESAPARICIÓN DE LYANNA',
            resultText: 'Para Robert, recuperar —o vengar— a su prometida es una motivación tan personal como política.',
            knowledgeBonus: 3,
          },
          {
            id: 'locura',
            label: 'LA LOCURA DE AERYS II',
            resultText: 'Para buena parte del reino, ningún señor se siente ya a salvo bajo un rey cada vez más inestable.',
            knowledgeBonus: 3,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Quién se negó a entregar a Robert Baratheon y Eddard Stark para su ejecución, iniciando así la rebelión?',
        options: ['Tywin Lannister', 'Jon Arryn', 'Rhaegar Targaryen', 'Jaime Lannister'],
        correctIndex: 1,
        explanation: 'Jon Arryn, Señor del Valle y tutor de ambos jóvenes, se negó a entregarlos y alzó sus banderas en rebelión.',
      },
      {
        type: 'reward',
        knowledge: 20,
        experience: 20,
        unlockCharacterIds: ['char_jon_arryn', 'char_robert', 'char_eddard'],
        text: 'El reino se divide en dos bandos. La guerra ya es inevitable.',
      },
    ],
  },

  {
    id: 'ev_batalla_tridente',
    chapterId: 'ch4_rebelion',
    locationId: 'storms_end',
    order: 3,
    year: '283 d.C. (fecha aproximada)',
    title: 'La Batalla del Tridente',
    characterIds: ['char_robert', 'char_rhaegar'],
    summary: 'Robert Baratheon mata a Rhaegar Targaryen en el vado del río Tridente, decidiendo el curso de la guerra.',
    nextEventId: 'ev_saqueo_desembarco',
    steps: [
      {
        type: 'narration',
        background: 'battle',
        text: 'Tras meses de guerra, los ejércitos rebeldes se enfrentan a las fuerzas leales a la Corona junto al río Tridente. El propio príncipe Rhaegar acude a comandar la batalla.',
      },
      {
        type: 'narration',
        background: 'battle',
        text: 'En el vado del río, Robert Baratheon y Rhaegar Targaryen se encuentran cara a cara. Robert lleva un enorme mazo de guerra; Rhaegar, una armadura grabada con dragones de rubí.',
      },
      { type: 'dialogue', speakerId: 'char_robert', text: '¡Toda mi vida he soñado con este día!' },
      {
        type: 'narration',
        background: 'battle',
        text: 'El combate es breve pero decisivo: el mazo de Robert destroza el peto de rubíes de Rhaegar. El príncipe cae al agua del Tridente y muere. Sin su comandante, el ejército leal a la Corona se desmorona.',
      },
      {
        type: 'decision',
        prompt: '¿Qué quieres destacar de la Batalla del Tridente?',
        options: [
          {
            id: 'duelo',
            label: 'EL DUELO ENTRE ROBERT Y RHAEGAR',
            resultText: 'El enfrentamiento personal entre ambos hombres decidió, de facto, el resultado de toda la guerra.',
            knowledgeBonus: 3,
          },
          {
            id: 'fin_causa',
            label: 'EL FIN DE LA CAUSA TARGARYEN',
            resultText: 'Sin Rhaegar, la defensa de la Corona pierde a su único líder militar capaz de unir al ejército leal.',
            knowledgeBonus: 3,
          },
          {
            id: 'rubies',
            label: 'LOS RUBÍES EN EL RÍO',
            resultText: 'Según la leyenda popular, los rubíes de la armadura de Rhaegar quedaron dispersos para siempre en el lecho del Tridente.',
            knowledgeBonus: 3,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Quién mató al príncipe Rhaegar Targaryen en la Batalla del Tridente?',
        options: ['Eddard Stark', 'Robert Baratheon', 'Jon Arryn', 'Tywin Lannister'],
        correctIndex: 1,
        explanation: 'Robert Baratheon mató a Rhaegar en un duelo personal en el vado del río Tridente, decidiendo el resultado de la rebelión.',
      },
      {
        type: 'reward',
        knowledge: 20,
        experience: 25,
        text: 'Con la muerte de Rhaegar, el camino hacia Desembarco del Rey queda abierto.',
      },
    ],
  },

  {
    id: 'ev_saqueo_desembarco',
    chapterId: 'ch4_rebelion',
    locationId: 'storms_end',
    order: 4,
    year: '283 d.C. (fecha aproximada)',
    title: 'El Saqueo de Desembarco del Rey',
    characterIds: ['char_aerys2', 'char_tywin', 'char_jaime'],
    summary: 'Jaime Lannister mata a Aerys II para impedir que incendie la capital, poniendo fin a la dinastía Targaryen.',
    steps: [
      {
        type: 'narration',
        background: 'castle',
        text: 'Con Rhaegar muerto, Tywin Lannister —Señor de Roca Casterly, que había permanecido neutral durante toda la guerra— marcha hacia Desembarco del Rey con su ejército, ofreciendo una lealtad de última hora al rey Aerys II.',
      },
      {
        type: 'narration',
        background: 'castle',
        text: 'Aerys II, desconfiado incluso de sus aliados más leales, abre las puertas de la ciudad a los Lannister. Es un error fatal: en cuanto entran, las tropas de Tywin saquean la capital sin piedad.',
      },
      { type: 'dialogue', speakerId: 'char_aerys2', text: '¡Quemadlos a todos! ¡Que ardan como hojas secas!' },
      {
        type: 'narration',
        background: 'battle',
        text: 'Aterrado, Aerys II ordena a los piromantes de la ciudad prender la pólvora líquida oculta bajo Desembarco del Rey para destruirla junto a sus enemigos. Jaime Lannister, joven caballero de la Guardia Real jurado a proteger al rey, le da muerte por la espalda antes de que pueda cumplir la orden.',
      },
      {
        type: 'decision',
        prompt: '¿Cómo juzgas la decisión de Jaime Lannister?',
        options: [
          {
            id: 'traicion',
            label: 'UN ACTO DE TRAICIÓN',
            resultText: 'Rompió el juramento sagrado de la Guardia Real de proteger al rey con su propia vida.',
            knowledgeBonus: 3,
          },
          {
            id: 'heroismo',
            label: 'UN ACTO DE HEROÍSMO OCULTO',
            resultText: 'Salvó a cientos de miles de vidas de morir calcinadas en un solo instante.',
            knowledgeBonus: 3,
          },
          {
            id: 'ambas',
            label: 'AMBAS COSAS A LA VEZ',
            resultText: 'Reconoces la complejidad moral del acto, que le costaría el apodo de "Matarreyes" durante el resto de su vida.',
            knowledgeBonus: 4,
          },
        ],
      },
      {
        type: 'question',
        prompt: '¿Quién mató al rey Aerys II Targaryen, poniendo fin a la dinastía Targaryen en el Trono de Hierro?',
        options: ['Robert Baratheon', 'Eddard Stark', 'Jaime Lannister', 'Tywin Lannister'],
        correctIndex: 2,
        explanation: 'Jaime Lannister mató a Aerys II por la espalda para impedir que incendiara Desembarco del Rey con su propia gente dentro.',
      },
      {
        type: 'reward',
        knowledge: 25,
        experience: 30,
        unlockCharacterIds: ['char_tywin', 'char_jaime'],
        text: 'Capítulo completado. Robert Baratheon será coronado rey, dando inicio a una nueva dinastía... aunque la paz, como el reino pronto descubrirá, será frágil y breve.',
      },
    ],
  },
];

export function getEvent(id: string): HistoricalEvent | undefined {
  return events.find((e) => e.id === id);
}
