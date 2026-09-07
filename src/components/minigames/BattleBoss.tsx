import { useEffect, useRef, useState } from 'react';
import { audio } from '../../utils/audio';
import type { Difficulty } from '../../types';
import { DAMAGE_BOSS_HIT } from '../../state/GameContext';
import './BattleBoss.css';

interface BattleBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

type BattleAction = 'atacar' | 'defender' | 'avanzar' | 'retroceder';

const ACTION_LABELS: Record<BattleAction, string> = {
  atacar: 'Atacar',
  defender: 'Defender',
  avanzar: 'Avanzar',
  retroceder: 'Retroceder',
};

interface Encounter {
  situation: string;
  correctAction: BattleAction;
}

const ENCOUNTERS: Encounter[] = [
  { situation: 'Un soldado rebelde herido avanza solo, medio desarmado.', correctAction: 'atacar' },
  { situation: 'Una lluvia de flechas cae sobre la formación.', correctAction: 'defender' },
  { situation: 'El camino queda despejado por un momento.', correctAction: 'avanzar' },
  { situation: 'El terreno se estrecha: huele a emboscada.', correctAction: 'retroceder' },
  { situation: 'Un pequeño grupo de exploradores enemigos, desorganizados, bloquea el paso.', correctAction: 'atacar' },
  { situation: 'El enemigo carga en formación cerrada hacia la línea.', correctAction: 'defender' },
  { situation: 'Se abre un tramo tranquilo antes de la siguiente colina.', correctAction: 'avanzar' },
  { situation: 'El suelo removido delante indica una trampa oculta.', correctAction: 'retroceder' },
];

interface DifficultyConfig {
  encountersToWin: number;
  timePerEncounter: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: { encountersToWin: 5, timePerEncounter: 7 },
  normal: { encountersToWin: 7, timePerEncounter: 5.5 },
  dificil: { encountersToWin: 9, timePerEncounter: 4.5 },
};

const ACTIONS: BattleAction[] = ['atacar', 'defender', 'avanzar', 'retroceder'];

type Phase = 'choosing' | 'feedback';

export function BattleBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: BattleBossProps) {
  const cfg = CONFIG[difficulty];
  const [index, setIndex] = useState(0);
  const [health, setHealth] = useState(startingHealth);
  const [timeLeft, setTimeLeft] = useState(cfg.timePerEncounter);
  const [phase, setPhase] = useState<Phase>('choosing');
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const [finished, setFinished] = useState(false);

  const encounter = ENCOUNTERS[index % ENCOUNTERS.length];

  const resolvingRef = useRef(false);
  useEffect(() => {
    resolvingRef.current = false;
  }, [index]);

  useEffect(() => {
    if (phase !== 'choosing' || finished) return;
    const interval = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          window.clearInterval(interval);
          resolveEncounter(null);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase, finished]);

  function resolveEncounter(action: BattleAction | null) {
    if (finished || resolvingRef.current) return;
    resolvingRef.current = true;

    const correct = action === encounter.correctAction;
    setPhase('feedback');
    let nextHealth = health;
    if (correct) {
      setFeedback('hit');
      audio.success();
    } else {
      nextHealth = Math.max(0, health - DAMAGE_BOSS_HIT);
      setHealth(nextHealth);
      onDamage(nextHealth);
      setFeedback('miss');
      audio.error();
    }

    window.setTimeout(() => {
      if (nextHealth <= 0) {
        setFinished(true);
        onLose();
        return;
      }
      if (index + 1 >= cfg.encountersToWin) {
        setFinished(true);
        onWin();
        return;
      }
      setIndex((i) => i + 1);
      setTimeLeft(cfg.timePerEncounter);
      setPhase('choosing');
      setFeedback(null);
    }, 900);
  }

  const healthPct = Math.max(0, Math.min(100, health));
  const timePct = Math.max(0, (timeLeft / cfg.timePerEncounter) * 100);
  const progressPct = Math.min(100, (index / cfg.encountersToWin) * 100);

  return (
    <div className="battle-boss">
      <div className="battle-hud">
        <div className="battle-bar-group">
          <span className="battle-bar-label">❤ {Math.round(healthPct)}</span>
          <div className="battle-player-track">
            <div
              className={`battle-player-fill ${healthPct <= 25 ? 'battle-player-fill--low' : healthPct <= 55 ? 'battle-player-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>
        <div className="battle-bar-group">
          <span className="battle-bar-label">Avance</span>
          <div className="battle-progress-track">
            <div className="battle-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className={`battle-arena ${feedback ? `battle-arena--${feedback}` : ''}`}>
        <p className="battle-eyebrow">⚔ La Rebelión avanza hacia Desembarco del Rey</p>

        <div className="battle-lane">
          <span className="battle-lane-player">🛡</span>
          <div className="battle-lane-track">
            <div className="battle-lane-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="battle-lane-enemy">⚔</span>
        </div>

        {phase === 'choosing' && (
          <div className="battle-card">
            <div className="battle-timer-track">
              <div className="battle-timer-fill" style={{ width: `${timePct}%` }} />
            </div>
            <p className="battle-situation">{encounter.situation}</p>
            <div className="battle-actions">
              {ACTIONS.map((a) => (
                <button key={a} className="btn btn-small battle-action-btn" onClick={() => resolveEncounter(a)}>
                  {ACTION_LABELS[a]}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="battle-card battle-card--feedback">
            <p className="battle-feedback-text">
              {feedback === 'hit' ? 'La decisión correcta abre camino entre las líneas enemigas.' : 'La decisión equivocada cuesta sangre y terreno.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
