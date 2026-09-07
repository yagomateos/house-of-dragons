import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../types';
import { DAMAGE_BOSS_HIT, HEAL_CORRECT_ANSWER } from '../../state/GameContext';
import './PoliticsBoss.css';

interface PoliticsBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

type FallKind = 'lie' | 'truth';

interface FallingItem {
  id: number;
  kind: FallKind;
  x: number;
  y: number;
  dead: boolean;
}

interface DifficultyConfig {
  duration: number;
  spawnEvery: number;
  speed: number;
  lieRatio: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: { duration: 28, spawnEvery: 900, speed: 1.9, lieRatio: 0.62 },
  normal: { duration: 34, spawnEvery: 700, speed: 2.3, lieRatio: 0.72 },
  dificil: { duration: 40, spawnEvery: 520, speed: 2.8, lieRatio: 0.8 },
};

const TICK_MS = 50;
const PLAYER_BOUNDS = { xMin: 4, xMax: 96, yMin: 12, yMax: 92 };
const CATCH_RADIUS = 7;

let nextItemId = 1;

function spawnItem(cfg: DifficultyConfig): FallingItem {
  const kind: FallKind = Math.random() < cfg.lieRatio ? 'lie' : 'truth';
  return {
    id: nextItemId++,
    kind,
    x: 8 + Math.random() * 84,
    y: -6,
    dead: false,
  };
}

export function PoliticsBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: PoliticsBossProps) {
  const cfg = CONFIG[difficulty];

  const gameRef = useRef({
    player: { x: 50, y: 80 },
    keys: new Set<string>(),
    items: [] as FallingItem[],
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

      const speed = 3.4;
      if (g.keys.has('left')) g.player.x -= speed;
      if (g.keys.has('right')) g.player.x += speed;
      if (g.keys.has('up')) g.player.y -= speed;
      if (g.keys.has('down')) g.player.y += speed;
      g.player.x = Math.min(PLAYER_BOUNDS.xMax, Math.max(PLAYER_BOUNDS.xMin, g.player.x));
      g.player.y = Math.min(PLAYER_BOUNDS.yMax, Math.max(PLAYER_BOUNDS.yMin, g.player.y));

      if (now - g.lastSpawn > cfg.spawnEvery) {
        g.lastSpawn = now;
        g.items.push(spawnItem(cfg));
      }

      for (const item of g.items) {
        if (item.dead) continue;
        item.y += cfg.speed;
        if (item.y > 100) {
          item.dead = true;
          continue;
        }

        const dx = g.player.x - item.x;
        const dy = g.player.y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CATCH_RADIUS) {
          item.dead = true;
          if (item.kind === 'lie') {
            if (now > g.invulnerableUntil) {
              g.health = Math.max(0, g.health - DAMAGE_BOSS_HIT);
              g.invulnerableUntil = now + 700;
              onDamage(g.health);
            }
          } else {
            g.health = Math.min(100, g.health + HEAL_CORRECT_ANSWER);
            onDamage(g.health);
          }
        }
      }
      g.items = g.items.filter((i) => !i.dead);

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
    <div className="council-game">
      <div className="council-hud">
        <div className="council-health">
          <span className="council-health-icon">❤</span>
          <div className="council-health-track">
            <div
              className={`council-health-fill ${healthPct <= 25 ? 'council-health-fill--low' : healthPct <= 55 ? 'council-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="council-health-value">{Math.round(healthPct)}/100</span>
        </div>
        <div className="council-timer-track">
          <div className="council-timer-fill" style={{ width: `${timePct}%` }} />
        </div>
      </div>

      <div className={`council-arena ${flashHit ? 'council-arena--hit' : ''}`}>
        {g.items.map((item) => (
          <div
            key={item.id}
            className={`council-item ${item.kind === 'lie' ? 'council-item--lie' : 'council-item--truth'}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.kind === 'lie' ? '👁' : '📜'}
          </div>
        ))}

        <div
          className={`council-player ${flashHit ? 'council-player--hit' : ''}`}
          style={{ left: `${g.player.x}%`, top: `${g.player.y}%` }}
        >
          🎙
        </div>
      </div>

      <div className="council-controls" aria-hidden="true">
        <div className="council-dpad">
          <button
            className="council-btn"
            onPointerDown={() => press('up')}
            onPointerUp={() => release('up')}
            onPointerLeave={() => release('up')}
          >
            ▲
          </button>
          <div className="council-dpad-row">
            <button
              className="council-btn"
              onPointerDown={() => press('left')}
              onPointerUp={() => release('left')}
              onPointerLeave={() => release('left')}
            >
              ◀
            </button>
            <button
              className="council-btn"
              onPointerDown={() => press('down')}
              onPointerUp={() => release('down')}
              onPointerLeave={() => release('down')}
            >
              ▼
            </button>
            <button
              className="council-btn"
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
