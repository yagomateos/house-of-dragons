import { useEffect, useRef, useState } from 'react';
import { PixelIcon } from '../PixelIcon';
import type { Difficulty, IconKey } from '../../types';
import { DAMAGE_BOSS_HIT } from '../../state/GameContext';
import './DragonDodgeGame.css';

interface DragonDodgeGameProps {
  difficulty: Difficulty;
  dragonIcon: IconKey;
  /** Vida real del jugador (0-100) con la que entra a la batalla. */
  startingHealth: number;
  /** Se llama cada vez que el jugador recibe un golpe, con el nuevo valor de vida (0-100). */
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

type AttackKind = 'fireball' | 'beam' | 'lateral' | 'blast';

interface Attack {
  id: number;
  kind: AttackKind;
  x: number;
  y: number;
  vy?: number;
  width: number;
  telegraphUntil: number;
  activeUntil: number;
  hit: boolean;
  spent: boolean;
}

interface DifficultyConfig {
  duration: number;
  spawnEvery: number;
  telegraph: number;
  speed: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: { duration: 28, spawnEvery: 1300, telegraph: 900, speed: 3.4 },
  normal: { duration: 36, spawnEvery: 950, telegraph: 700, speed: 3.7 },
  dificil: { duration: 45, spawnEvery: 650, telegraph: 550, speed: 4.1 },
};

const TICK_MS = 50;
const PLAYER_BOUNDS = { xMin: 4, xMax: 96, yMin: 50, yMax: 94 };

let nextAttackId = 1;

function spawnAttack(cfg: DifficultyConfig, now: number): Attack {
  const roll = Math.random();
  const kind: AttackKind = roll < 0.4 ? 'fireball' : roll < 0.65 ? 'beam' : roll < 0.85 ? 'lateral' : 'blast';
  const id = nextAttackId++;

  if (kind === 'fireball') {
    return {
      id,
      kind,
      x: 10 + Math.random() * 80,
      y: 14,
      vy: 1.6 + Math.random() * 0.6,
      width: 6,
      telegraphUntil: now,
      activeUntil: now + 20000,
      hit: false,
      spent: false,
    };
  }
  if (kind === 'beam') {
    return {
      id,
      kind,
      x: 15 + Math.random() * 70,
      y: 0,
      width: 14,
      telegraphUntil: now + cfg.telegraph,
      activeUntil: now + cfg.telegraph + 500,
      hit: false,
      spent: false,
    };
  }
  if (kind === 'lateral') {
    return {
      id,
      kind,
      x: 50,
      y: 54 + Math.random() * 36,
      width: 7,
      telegraphUntil: now + cfg.telegraph * 0.85,
      activeUntil: now + cfg.telegraph * 0.85 + 600,
      hit: false,
      spent: false,
    };
  }
  return {
    id,
    kind: 'blast',
    x: 15 + Math.random() * 70,
    y: 58 + Math.random() * 30,
    width: 17,
    telegraphUntil: now + cfg.telegraph * 1.3,
    activeUntil: now + cfg.telegraph * 1.3 + 450,
    hit: false,
    spent: false,
  };
}

export function DragonDodgeGame({
  difficulty,
  dragonIcon,
  startingHealth,
  onDamage,
  onWin,
  onLose,
}: DragonDodgeGameProps) {
  const cfg = CONFIG[difficulty];

  const gameRef = useRef({
    player: { x: 50, y: 80 },
    keys: new Set<string>(),
    attacks: [] as Attack[],
    health: startingHealth,
    timeLeft: cfg.duration,
    lastSpawn: 0,
    invulnerableUntil: 0,
    finished: false,
  });

  const [, setTick] = useState(0);

  useEffect(() => {
    const keyMap: Record<string, string> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
      W: 'up',
      S: 'down',
      A: 'left',
      D: 'right',
    };

    function onKeyDown(e: KeyboardEvent) {
      const dir = keyMap[e.key];
      if (!dir) return;
      e.preventDefault();
      gameRef.current.keys.add(dir);
    }
    function onKeyUp(e: KeyboardEvent) {
      const dir = keyMap[e.key];
      if (!dir) return;
      gameRef.current.keys.delete(dir);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const interval = window.setInterval(() => {
      const g = gameRef.current;
      if (g.finished) return;
      const now = performance.now();

      const speed = cfg.speed;
      if (g.keys.has('left')) g.player.x -= speed;
      if (g.keys.has('right')) g.player.x += speed;
      if (g.keys.has('up')) g.player.y -= speed;
      if (g.keys.has('down')) g.player.y += speed;
      g.player.x = Math.min(PLAYER_BOUNDS.xMax, Math.max(PLAYER_BOUNDS.xMin, g.player.x));
      g.player.y = Math.min(PLAYER_BOUNDS.yMax, Math.max(PLAYER_BOUNDS.yMin, g.player.y));

      if (now - g.lastSpawn > cfg.spawnEvery * (0.8 + Math.random() * 0.4)) {
        g.lastSpawn = now;
        g.attacks.push(spawnAttack(cfg, now));
      }

      for (const atk of g.attacks) {
        if (atk.kind === 'fireball' && atk.vy) {
          atk.y += atk.vy;
          if (atk.y > 100) atk.spent = true;
        }
        if (now > atk.activeUntil + 300) atk.spent = true;

        const isActive = now >= atk.telegraphUntil && now <= atk.activeUntil && !atk.hit;
        if (isActive && now > g.invulnerableUntil) {
          let hit = false;
          if (atk.kind === 'fireball') {
            hit = Math.abs(g.player.x - atk.x) < atk.width / 2 + 2.5 && Math.abs(g.player.y - atk.y) < 5;
          } else if (atk.kind === 'beam') {
            hit = Math.abs(g.player.x - atk.x) < atk.width / 2 + 2;
          } else if (atk.kind === 'lateral') {
            hit = Math.abs(g.player.y - atk.y) < atk.width / 2 + 2;
          } else if (atk.kind === 'blast') {
            const dx = g.player.x - atk.x;
            const dy = (g.player.y - atk.y) * 0.6;
            hit = Math.sqrt(dx * dx + dy * dy) < atk.width / 2 + 2;
          }
          if (hit) {
            atk.hit = true;
            g.health = Math.max(0, g.health - DAMAGE_BOSS_HIT);
            g.invulnerableUntil = now + 900;
            onDamage(g.health);
          }
        }
      }
      g.attacks = g.attacks.filter((a) => !a.spent);

      g.timeLeft -= TICK_MS / 1000;

      if (g.health <= 0 && !g.finished) {
        g.finished = true;
        onLose();
      } else if (g.timeLeft <= 0 && !g.finished) {
        g.finished = true;
        onWin();
      }

      setTick((t) => t + 1);
    }, TICK_MS);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function press(dir: string) {
    gameRef.current.keys.add(dir);
  }
  function release(dir: string) {
    gameRef.current.keys.delete(dir);
  }

  const g = gameRef.current;
  const healthPct = Math.max(0, Math.min(100, g.health));
  const timePct = Math.max(0, (g.timeLeft / cfg.duration) * 100);
  const now = performance.now();
  const flashHit = now < g.invulnerableUntil;

  return (
    <div className="dodge-game">
      <div className="dodge-hud">
        <div className="dodge-health">
          <span className="dodge-health-icon">❤</span>
          <div className="dodge-health-track">
            <div
              className={`dodge-health-fill ${healthPct <= 25 ? 'dodge-health-fill--low' : healthPct <= 55 ? 'dodge-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="dodge-health-value">{Math.round(healthPct)}/100</span>
        </div>
        <div className="dodge-timer-track">
          <div className="dodge-timer-fill" style={{ width: `${timePct}%` }} />
        </div>
      </div>

      <div className={`dodge-arena ${flashHit ? 'dodge-arena--hit' : ''}`}>
        <div className="dodge-dragon">
          <PixelIcon icon={dragonIcon} size={90} />
        </div>

        {g.attacks.map((atk) => {
          const telegraphing = now < atk.telegraphUntil;
          if (atk.kind === 'fireball') {
            return (
              <div
                key={atk.id}
                className="dodge-fireball"
                style={{ left: `${atk.x}%`, top: `${atk.y}%` }}
              />
            );
          }
          if (atk.kind === 'beam') {
            return (
              <div
                key={atk.id}
                className={`dodge-beam ${telegraphing ? 'dodge-beam--warn' : 'dodge-beam--active'}`}
                style={{ left: `${atk.x - atk.width / 2}%`, width: `${atk.width}%` }}
              />
            );
          }
          if (atk.kind === 'lateral') {
            return (
              <div
                key={atk.id}
                className={`dodge-lateral ${telegraphing ? 'dodge-lateral--warn' : 'dodge-lateral--active'}`}
                style={{ top: `${atk.y}%` }}
              />
            );
          }
          return (
            <div
              key={atk.id}
              className={`dodge-blast ${telegraphing ? 'dodge-blast--warn' : 'dodge-blast--active'}`}
              style={{
                left: `${atk.x}%`,
                top: `${atk.y}%`,
                width: `${atk.width}%`,
                height: `${atk.width * 1.6}%`,
              }}
            />
          );
        })}

        <div
          className={`dodge-player ${flashHit ? 'dodge-player--hit' : ''}`}
          style={{ left: `${g.player.x}%`, top: `${g.player.y}%` }}
        />
      </div>

      <div className="dodge-controls" aria-hidden="true">
        <div className="dodge-dpad">
          <button
            className="dodge-btn dodge-btn--up"
            onPointerDown={() => press('up')}
            onPointerUp={() => release('up')}
            onPointerLeave={() => release('up')}
          >
            ▲
          </button>
          <div className="dodge-dpad-row">
            <button
              className="dodge-btn"
              onPointerDown={() => press('left')}
              onPointerUp={() => release('left')}
              onPointerLeave={() => release('left')}
            >
              ◀
            </button>
            <button
              className="dodge-btn"
              onPointerDown={() => press('down')}
              onPointerUp={() => release('down')}
              onPointerLeave={() => release('down')}
            >
              ▼
            </button>
            <button
              className="dodge-btn"
              onPointerDown={() => press('right')}
              onPointerUp={() => release('right')}
              onPointerLeave={() => release('right')}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
