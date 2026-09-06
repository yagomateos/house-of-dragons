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

// Composición original de ambientación (8-bit, tono oscuro medieval),
// inspirada en el género pero sin reproducir ninguna melodía existente.
const THEME_EIGHTH = 0.29;
const THEME_BASS = [
  110, 110, 130.81, 130.81, 110, 110, 98, 98, 87.31, 87.31, 110, 110, 98, 98, 82.41, 82.41,
];
const THEME_LEAD: (number | null)[] = [
  440, null, 659.25, null, 523.25, null, 880, null, 783.99, null, 659.25, null, 587.33, null, 440, null,
];
const THEME_LOOP_SECONDS = THEME_BASS.length * THEME_EIGHTH;

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
  toggle() {
    if (!sfxEnabled()) return;
    tone(440, 0, 0.05, 'square', 0.05);
  },

  /**
   * Tema principal en 8-bit (composición original), en bucle continuo.
   * Suena desde que se abre la página (en cuanto el navegador permite
   * audio) y no se detiene al navegar por el juego.
   */
  startTheme() {
    if (!readPrefs().music) return;
    const c = getCtx();
    if (!c || theme) return;

    const master = c.createGain();
    master.gain.value = 0.06;
    master.connect(c.destination);

    let stopped = false;
    let timer = 0;

    function scheduleLoop(startAt: number) {
      if (stopped || !c) return;
      THEME_BASS.forEach((freq, i) => {
        scheduleNoteAt(c, master, freq, startAt + i * THEME_EIGHTH, THEME_EIGHTH * 0.95, 'triangle', 0.07);
      });
      THEME_LEAD.forEach((freq, i) => {
        if (freq) scheduleNoteAt(c, master, freq, startAt + i * THEME_EIGHTH, THEME_EIGHTH * 1.9, 'square', 0.05);
      });
      scheduleDrumAt(c, master, startAt);
      scheduleDrumAt(c, master, startAt + 8 * THEME_EIGHTH);

      const nextStart = startAt + THEME_LOOP_SECONDS;
      const delayMs = (nextStart - c.currentTime - 0.2) * 1000;
      timer = window.setTimeout(() => scheduleLoop(nextStart), Math.max(50, delayMs));
    }

    scheduleLoop(c.currentTime + 0.05);

    theme = {
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
  },

  stopTheme() {
    if (theme) {
      theme.stop();
      theme = null;
    }
  },

  setMusicEnabled(on: boolean) {
    if (on) this.startTheme();
    else this.stopTheme();
  },
};
