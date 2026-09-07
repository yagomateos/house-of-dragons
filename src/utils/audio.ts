// ============================================================
// Motor de audio retro (chiptune) generado por síntesis con la
// Web Audio API. No depende de ningún archivo externo.
// ============================================================

const PREFS_KEY = 'cronica-poniente-prefs-v1';

interface Prefs {
  music: boolean;
  sfx: boolean;
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignorar
  }
  return { music: true, sfx: true };
}

export function getAudioPrefs(): Prefs {
  return readPrefs();
}

export function setAudioPrefs(next: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // ignorar
  }
}

let ctx: AudioContext | null = null;
let theme: { stop: () => void } | null = null;
let bossTheme: { stop: () => void } | null = null;
let bossThemeKey: string | null = null;

// Los navegadores bloquean el audio hasta el primer gesto del usuario
// (clic, toque o tecla). Exponemos ese estado para poder avisar en la
// interfaz ("toca para activar el sonido") en vez de fallar en silencio.
let interacted = false;
const interactionListeners = new Set<() => void>();

export function hasInteracted(): boolean {
  return interacted;
}

export function onFirstInteraction(cb: () => void): () => void {
  if (interacted) {
    cb();
    return () => {};
  }
  interactionListeners.add(cb);
  return () => interactionListeners.delete(cb);
}

export function markInteracted(): void {
  if (interacted) return;
  interacted = true;
  interactionListeners.forEach((l) => l());
  interactionListeners.clear();
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'square',
  peakGain = 0.09
) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + startOffset;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst(startOffset: number, duration: number, peakGain = 0.06) {
  const c = getCtx();
  if (!c) return;
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1800;
  const gain = c.createGain();
  const t0 = c.currentTime + startOffset;
  gain.gain.setValueAtTime(peakGain, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(t0);
}

/** Como noiseBurst, pero con paso bajo: para golpes graves/explosiones en vez de silbidos agudos. */
function lowNoiseBurst(startOffset: number, duration: number, peakGain = 0.08, cutoff = 220) {
  const c = getCtx();
  if (!c) return;
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  const gain = c.createGain();
  const t0 = c.currentTime + startOffset;
  gain.gain.setValueAtTime(peakGain, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(t0);
}

function sfxEnabled(): boolean {
  return readPrefs().sfx;
}

function scheduleNoteAt(
  c: AudioContext,
  dest: AudioNode,
  freq: number,
  atTime: number,
  duration: number,
  type: OscillatorType,
  peakGain: number
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, atTime);
  gain.gain.linearRampToValueAtTime(peakGain, atTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, atTime + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(atTime);
  osc.stop(atTime + duration + 0.03);
}

function scheduleDrumAt(c: AudioContext, dest: AudioNode, atTime: number) {
  const duration = 0.18;
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 220;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.24, atTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, atTime + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(atTime);
}

// Composición original de ambientación (8-bit, modo menor natural de La,
// tono oscuro medieval), inspirada en el género pero sin reproducir
// ninguna melodía existente. Cuatro frases de 8 compases (A-B-A'-cadencia)
// para que el bucle dure ~20s en vez de repetirse cada pocos segundos.
const THEME_EIGHTH = 0.32;
const THEME_BASS = [
  // Frase A (La menor)
  110, 110, 164.81, 164.81, 174.61, 174.61, 164.81, 164.81, 110, 110, 196, 196, 174.61, 174.61, 164.81, 164.81,
  // Frase B (Do mayor / Sol, más luminosa)
  130.81, 130.81, 196, 196, 220, 220, 196, 196, 146.83, 146.83, 220, 220, 196, 196, 174.61, 174.61,
  // Frase A' (variación descendente de la frase A)
  110, 110, 130.81, 130.81, 164.81, 164.81, 146.83, 146.83, 110, 110, 174.61, 174.61, 164.81, 164.81, 146.83, 146.83,
  // Cadencia (resuelve de vuelta a La)
  196, 196, 174.61, 174.61, 164.81, 164.81, 146.83, 146.83, 130.81, 130.81, 123.47, 123.47, 110, 110, 110, 110,
];
const THEME_LEAD: (number | null)[] = [
  // Frase A
  329.63, null, 293.66, null, 261.63, null, 293.66, null, 329.63, null, 349.23, null, 329.63, null, 293.66, null,
  // Frase B
  392, null, 349.23, null, 329.63, null, 349.23, null, 440, null, 392, null, 349.23, null, 329.63, null,
  // Frase A'
  523.25, null, 493.88, null, 440, null, 392, null, 329.63, null, 293.66, null, 261.63, null, 246.94, null,
  // Cadencia (la melodía se apaga y deja resolver al bajo)
  440, null, 392, null, 349.23, null, 329.63, null, 293.66, null, null, null, null, null, null, null,
];
// Voz de armonía añadida: una quinta sostenida sobre el bajo cada 4
// pasos, para dar cuerpo de "coro/cuerdas" 8-bit al tema y que suene
// más legendario sin dejar de ser chiptune.
const THEME_HARMONY: (number | null)[] = THEME_BASS.map((freq, i) => (i % 4 === 0 ? freq * 1.5 : null));
const THEME_LOOP_STEPS = THEME_BASS.length;

// ------------------------------------------------------------------
// Motor genérico de temas multi-voz (bajo + melodía + armonía +
// percusión) reutilizado tanto por el tema principal como por los
// temas de cada jefe final. Todo sintetizado, sin archivos externos.
// ------------------------------------------------------------------

interface ThemeVoice {
  notes: (number | null)[];
  type: OscillatorType;
  peakGain: number;
  /** Duración de cada nota como múltiplo de la corchea del tema. */
  sustain: number;
}

interface ThemeDef {
  eighth: number;
  loopSteps: number;
  masterGain: number;
  voices: ThemeVoice[];
  /** Pasos (dentro de un bucle) en los que suena un golpe de tambor grave. */
  drumSteps: number[];
}

const MODE_HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];
const MODE_PHRYGIAN = [0, 1, 3, 5, 7, 8, 10];
const MODE_DORIAN = [0, 2, 3, 5, 7, 9, 10];

/** Convierte un grado de escala (puede superar la octava) a frecuencia. */
function degreeToFreq(root: number, mode: number[], degree: number): number {
  const len = mode.length;
  const octave = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  const semitone = mode[idx] + 12 * octave;
  return root * Math.pow(2, semitone / 12);
}

function buildVoice(
  root: number,
  mode: number[],
  pattern: (number | null)[],
  type: OscillatorType,
  peakGain: number,
  sustain: number
): ThemeVoice {
  return {
    notes: pattern.map((d) => (d === null ? null : degreeToFreq(root, mode, d))),
    type,
    peakGain,
    sustain,
  };
}

function playThemeDef(def: ThemeDef): { stop: () => void } {
  const c = getCtx();
  if (!c) return { stop() {} };
  const master = c.createGain();
  master.gain.value = def.masterGain;
  master.connect(c.destination);

  let stopped = false;
  let timer = 0;
  const loopSeconds = def.loopSteps * def.eighth;

  function scheduleLoop(startAt: number) {
    if (stopped || !c) return;
    for (const voice of def.voices) {
      voice.notes.forEach((freq, i) => {
        if (freq) scheduleNoteAt(c, master, freq, startAt + i * def.eighth, def.eighth * voice.sustain, voice.type, voice.peakGain);
      });
    }
    for (const step of def.drumSteps) {
      scheduleDrumAt(c, master, startAt + step * def.eighth);
    }
    const nextStart = startAt + loopSeconds;
    const delayMs = (nextStart - c.currentTime - 0.2) * 1000;
    timer = window.setTimeout(() => scheduleLoop(nextStart), Math.max(50, delayMs));
  }

  scheduleLoop(c.currentTime + 0.05);

  return {
    stop() {
      stopped = true;
      window.clearTimeout(timer);
      try {
        master.disconnect();
      } catch {
        // ya desconectado
      }
    },
  };
}

const MAIN_THEME_DEF: ThemeDef = {
  eighth: THEME_EIGHTH,
  loopSteps: THEME_LOOP_STEPS,
  masterGain: 0.066,
  voices: [
    { notes: THEME_BASS, type: 'triangle', peakGain: 0.07, sustain: 0.95 },
    { notes: THEME_LEAD, type: 'triangle', peakGain: 0.055, sustain: 1.9 },
    { notes: THEME_HARMONY, type: 'triangle', peakGain: 0.03, sustain: 3.8 },
  ],
  // Pulso de tambor cada media frase (no solo al inicio de cada una),
  // para un compás más firme y "legendario".
  drumSteps: [0, 8, 16, 24, 32, 40, 48, 56],
};

// ------------------------------------------------------------------
// Temas de jefe: una composición original distinta por cada tipo de
// combate final, con su propio tono, modo y timbre — pensados para
// sonar épicos ("legendarios") dentro del lenguaje 8-bit del resto
// del juego, no como una imitación de ninguna banda sonora existente.
// ------------------------------------------------------------------

const BOSS_THEME_DEFS: Partial<Record<string, ThemeDef>> = {
  // Capítulo 1 — dragón: feroz y caótico, modo menor armónico con
  // séptima elevada para tensión, ritmo rápido y percusión constante.
  dragon: {
    eighth: 0.2,
    loopSteps: 16,
    masterGain: 0.072,
    voices: [
      buildVoice(164.81, MODE_HARMONIC_MINOR, [0, 0, 2, 2, 4, 4, 3, 3, 0, 0, 4, 4, 5, 5, 4, 4], 'sawtooth', 0.08, 0.9),
      buildVoice(164.81, MODE_HARMONIC_MINOR, [null, 7, null, 6, null, 7, null, 9, null, 7, null, 6, null, 4, null, 6], 'sawtooth', 0.06, 1.6),
      buildVoice(164.81, MODE_HARMONIC_MINOR, [4, null, null, null, null, null, null, null, 4, null, null, null, null, null, null, null], 'triangle', 0.035, 7.5),
    ],
    drumSteps: [0, 4, 8, 12],
  },
  // Capítulo 2 — estrategia: marcha militar en modo dorio, fanfarria
  // de corte cuadrado y percusión firme a cada tiempo.
  strategy: {
    eighth: 0.26,
    loopSteps: 16,
    masterGain: 0.07,
    voices: [
      buildVoice(146.83, MODE_DORIAN, [0, 0, 0, 0, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 0, 0], 'square', 0.075, 0.9),
      buildVoice(146.83, MODE_DORIAN, [7, null, 9, null, 7, null, 4, null, 9, null, 11, null, 9, null, 7, null], 'square', 0.06, 1.7),
      buildVoice(146.83, MODE_DORIAN, [4, null, null, null, 4, null, null, null, 4, null, null, null, 4, null, null, null], 'triangle', 0.03, 3.8),
    ],
    drumSteps: [0, 2, 4, 6, 8, 10, 12, 14],
  },
  // Capítulo 3 — política/arquero: misterioso y maldito, modo frigio
  // (segunda bemol) para el color de castillo encantado, muy espaciado.
  politics: {
    eighth: 0.32,
    loopSteps: 16,
    masterGain: 0.065,
    voices: [
      buildVoice(195.998, MODE_PHRYGIAN, [0, null, null, 0, null, 1, null, null, 0, null, null, 5, null, null, 1, null], 'triangle', 0.07, 2.2),
      buildVoice(195.998, MODE_PHRYGIAN, [null, null, 7, null, null, null, 6, null, null, null, 8, null, null, null, 7, null], 'triangle', 0.05, 2.4),
      buildVoice(195.998, MODE_PHRYGIAN, [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null], 'sawtooth', 0.025, 7.8),
    ],
    drumSteps: [0, 8],
  },
  // Capítulo 4 — batalla/pólvora: frenético, modo menor armónico a
  // gran velocidad, percusión constante evocando el caos del incendio.
  battle: {
    eighth: 0.16,
    loopSteps: 16,
    masterGain: 0.07,
    voices: [
      buildVoice(130.81, MODE_HARMONIC_MINOR, [0, 2, 0, 2, 3, 5, 3, 5, 0, 2, 0, 2, 4, 6, 4, 6], 'sawtooth', 0.08, 0.85),
      buildVoice(130.81, MODE_HARMONIC_MINOR, [7, null, 9, 7, null, 6, 9, null, 7, 11, null, 9, 7, null, 6, null], 'sawtooth', 0.055, 0.7),
      buildVoice(130.81, MODE_HARMONIC_MINOR, [4, null, null, null, null, null, null, 4, null, null, null, null, 4, null, null, null], 'triangle', 0.03, 1.5),
    ],
    drumSteps: [0, 2, 4, 6, 8, 10, 12, 14],
  },
  // Capítulo 5 — naval: heroico y marinero, modo dorio con bajo que
  // "rueda" como el oleaje y fanfarria cuadrada de corte de bronce.
  naval: {
    eighth: 0.28,
    loopSteps: 16,
    masterGain: 0.07,
    voices: [
      buildVoice(110, MODE_DORIAN, [0, 0, 4, 4, 3, 3, 4, 4, 0, 0, 5, 5, 4, 4, 3, 3], 'triangle', 0.075, 1.4),
      buildVoice(110, MODE_DORIAN, [7, null, 4, null, 9, null, 7, null, 11, null, 9, null, 7, null, 4, null], 'square', 0.06, 1.7),
      buildVoice(110, MODE_DORIAN, [4, null, null, null, 4, null, null, null, 4, null, null, null, 4, null, null, null], 'triangle', 0.032, 3.9),
    ],
    drumSteps: [0, 4, 8, 12],
  },
  // Capítulo 6 — vuelo de dragón: triunfal y ascendente, arpegios que
  // "elevan el vuelo" sobre un modo dorio más brillante.
  flight: {
    eighth: 0.22,
    loopSteps: 16,
    masterGain: 0.072,
    voices: [
      buildVoice(123.47, MODE_DORIAN, [0, 0, 4, 4, 3, 3, 4, 4, 0, 0, 5, 5, 4, 4, 3, 3], 'sawtooth', 0.075, 0.9),
      buildVoice(123.47, MODE_DORIAN, [0, 2, 4, 7, 9, 7, 4, 2, 0, 4, 7, 9, 11, 9, 7, 4], 'sawtooth', 0.06, 1.1),
      buildVoice(123.47, MODE_DORIAN, [4, null, null, null, null, null, null, null, 4, null, null, null, null, null, null, null], 'triangle', 0.03, 7.5),
    ],
    drumSteps: [0, 4, 8, 12],
  },
  // Capítulo 7 — el jefe final: el tema más oscuro y grandioso del
  // juego, modo frigio para el máximo pavor, bajo pesado y pulso lento
  // e inexorable.
  survival: {
    eighth: 0.3,
    loopSteps: 16,
    masterGain: 0.076,
    voices: [
      buildVoice(138.59, MODE_PHRYGIAN, [0, 0, null, 0, 1, 1, null, 1, 0, 0, null, 0, 5, 5, null, 5], 'sawtooth', 0.09, 1.3),
      buildVoice(138.59, MODE_PHRYGIAN, [null, 7, null, null, 8, null, null, 7, null, null, 9, null, null, 8, null, 7], 'sawtooth', 0.05, 1.6),
      buildVoice(138.59, MODE_PHRYGIAN, [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null], 'triangle', 0.028, 7.8),
    ],
    drumSteps: [0, 4, 8, 12],
  },
};

export const audio = {
  /** Blip audible siempre, incluso si los efectos están desactivados (feedback de los propios interruptores de Ajustes). */
  rawBlip(on: boolean) {
    tone(on ? 660 : 330, 0, 0.07, 'square', 0.06);
  },
  click() {
    if (!sfxEnabled()) return;
    tone(520, 0, 0.07, 'square', 0.07);
  },
  hover() {
    if (!sfxEnabled()) return;
    tone(300, 0, 0.05, 'triangle', 0.03);
  },
  select() {
    if (!sfxEnabled()) return;
    tone(523.25, 0, 0.09, 'triangle', 0.08);
  },
  pageTurn() {
    if (!sfxEnabled()) return;
    noiseBurst(0, 0.09, 0.05);
  },
  success() {
    if (!sfxEnabled()) return;
    tone(523.25, 0, 0.11, 'square', 0.08);
    tone(659.25, 0.09, 0.11, 'square', 0.08);
    tone(783.99, 0.18, 0.16, 'square', 0.09);
  },
  error() {
    if (!sfxEnabled()) return;
    tone(220, 0, 0.14, 'sawtooth', 0.07);
    tone(164.81, 0.1, 0.2, 'sawtooth', 0.07);
  },
  reward() {
    if (!sfxEnabled()) return;
    tone(523.25, 0, 0.1, 'square', 0.08);
    tone(659.25, 0.1, 0.1, 'square', 0.08);
    tone(783.99, 0.2, 0.1, 'square', 0.08);
    tone(1046.5, 0.3, 0.22, 'square', 0.09);
  },
  achievement() {
    if (!sfxEnabled()) return;
    tone(659.25, 0, 0.1, 'triangle', 0.09);
    tone(783.99, 0.1, 0.1, 'triangle', 0.09);
    tone(987.77, 0.2, 0.1, 'triangle', 0.09);
    tone(1318.5, 0.32, 0.3, 'triangle', 0.1);
  },
  deny() {
    if (!sfxEnabled()) return;
    tone(160, 0, 0.16, 'square', 0.06);
  },

  // ---- Sonidos de combate para los minijuegos de jefe ----

  /** El jugador dispara (flecha). */
  shoot() {
    if (!sfxEnabled()) return;
    tone(880, 0, 0.045, 'square', 0.05);
    tone(1100, 0.02, 0.04, 'square', 0.03);
  },
  /** Un enemigo dispara al jugador. */
  enemyShoot() {
    if (!sfxEnabled()) return;
    tone(260, 0, 0.07, 'sawtooth', 0.05);
  },
  /** Un golpe conecta contra un enemigo (sin matarlo). */
  hitEnemy() {
    if (!sfxEnabled()) return;
    noiseBurst(0, 0.05, 0.07);
    tone(180, 0, 0.05, 'square', 0.05);
  },
  /** Un enemigo muere. */
  enemyDeath() {
    if (!sfxEnabled()) return;
    tone(420, 0, 0.05, 'square', 0.06);
    tone(210, 0.05, 0.09, 'square', 0.05);
  },
  /** El jugador recibe daño real (contacto, proyectil, fuego). */
  playerHurt() {
    if (!sfxEnabled()) return;
    tone(200, 0, 0.09, 'sawtooth', 0.07);
    tone(140, 0.06, 0.12, 'sawtooth', 0.06);
  },
  /** Aliento de fuego de un dragón. */
  fireBreath() {
    if (!sfxEnabled()) return;
    lowNoiseBurst(0, 0.4, 0.1, 300);
    tone(100, 0, 0.4, 'sawtooth', 0.05);
  },
  /** Explosión grande: el jefe final cae derrotado. */
  explosion() {
    if (!sfxEnabled()) return;
    lowNoiseBurst(0, 0.7, 0.16, 220);
    tone(90, 0, 0.55, 'sawtooth', 0.09);
    tone(50, 0.08, 0.6, 'sawtooth', 0.08);
  },
  toggle() {
    if (!sfxEnabled()) return;
    tone(440, 0, 0.05, 'square', 0.05);
  },

  /**
   * Tema principal en 8-bit (composición original), en bucle continuo.
   * Suena desde que se abre la página (en cuanto el navegador permite
   * audio). Se detiene automáticamente mientras hay un combate de jefe
   * activo (ver startBossTheme/stopBossTheme) y se retoma al salir.
   */
  startTheme() {
    if (!readPrefs().music) return;
    if (theme) return;
    theme = playThemeDef(MAIN_THEME_DEF);
  },

  stopTheme() {
    if (theme) {
      theme.stop();
      theme = null;
    }
  },

  /**
   * Sustituye el tema principal por la composición específica del
   * combate de jefe indicado (una por cada BossType) mientras dure el
   * enfrentamiento. Es idempotente: llamarlo de nuevo con el mismo
   * tipo de jefe no reinicia la composición en curso.
   */
  startBossTheme(bossType: string) {
    if (!readPrefs().music) {
      bossThemeKey = bossType;
      return;
    }
    if (bossThemeKey === bossType && bossTheme) return;
    if (theme) {
      theme.stop();
      theme = null;
    }
    if (bossTheme) {
      bossTheme.stop();
      bossTheme = null;
    }
    bossThemeKey = bossType;
    const def = BOSS_THEME_DEFS[bossType];
    if (!def) return;
    bossTheme = playThemeDef(def);
  },

  /** Detiene el tema de jefe activo (si lo hay) y retoma el tema principal. */
  stopBossTheme() {
    if (bossTheme) {
      bossTheme.stop();
      bossTheme = null;
    }
    bossThemeKey = null;
    if (readPrefs().music && !theme) {
      this.startTheme();
    }
  },

  setMusicEnabled(on: boolean) {
    if (on) {
      if (bossThemeKey) {
        const def = BOSS_THEME_DEFS[bossThemeKey];
        if (def) bossTheme = playThemeDef(def);
      } else {
        this.startTheme();
      }
    } else {
      this.stopTheme();
      if (bossTheme) {
        bossTheme.stop();
        bossTheme = null;
      }
    }
  },
};
