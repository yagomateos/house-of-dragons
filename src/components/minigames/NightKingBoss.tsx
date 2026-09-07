import { useEffect, useRef, useState } from 'react';
import { PixelIcon } from '../PixelIcon';
import { audio } from '../../utils/audio';
import type { Difficulty, IconKey } from '../../types';
import { DAMAGE_BOSS_HIT } from '../../state/GameContext';
import './NightKingBoss.css';

interface NightKingBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

const CHARACTER_OPTIONS: { icon: IconKey; name: string }[] = [
  { icon: 'portrait-male', name: 'Jon Nieve' },
  { icon: 'portrait-female-dark', name: 'Arya Stark' },
  { icon: 'portrait-male-grey', name: 'Samwell Tarly' },
];

type AttackKind = 'iceSpike' | 'frostBeam' | 'wightLunge' | 'coldBurst';

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
  const kind: AttackKind = roll < 0.4 ? 'iceSpike' : roll < 0.65 ? 'frostBeam' : roll < 0.85 ? 'wightLunge' : 'coldBurst';
  const id = nextAttackId++;

  if (kind === 'iceSpike') {
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
  if (kind === 'frostBeam') {
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
  if (kind === 'wightLunge') {
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
    kind: 'coldBurst',
    x: 15 + Math.random() * 70,
    y: 58 + Math.random() * 30,
    width: 17,
    telegraphUntil: now + cfg.telegraph * 1.3,
    activeUntil: now + cfg.telegraph * 1.3 + 450,
    hit: false,
    spent: false,
  };
}

export function NightKingBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: NightKingBossProps) {
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
    paused: true,
  });

  const [, setTick] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState<IconKey | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function chooseCharacter(icon: IconKey) {
    setSelectedIcon(icon);
    gameRef.current.paused = false;
    gameRef.current.lastSpawn = performance.now();
  }

  function moveToPointer(e: { clientX: number; clientY: number }) {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    gameRef.current.player.x = Math.min(PLAYER_BOUNDS.xMax, Math.max(PLAYER_BOUNDS.xMin, x));
    gameRef.current.player.y = Math.min(PLAYER_BOUNDS.yMax, Math.max(PLAYER_BOUNDS.yMin, y));
  }

  function handleArenaPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!selectedIcon) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveToPointer(e);
  }
  function handleArenaPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    moveToPointer(e);
  }
  function handleArenaPointerUp() {
    draggingRef.current = false;
  }

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
      if (g.finished || g.paused) return;
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
        audio.fireBreath();
      }

      for (const atk of g.attacks) {
        if (atk.kind === 'iceSpike' && atk.vy) {
          atk.y += atk.vy;
          if (atk.y > 100) atk.spent = true;
        }
        if (now > atk.activeUntil + 300) atk.spent = true;

        const isActive = now >= atk.telegraphUntil && now <= atk.activeUntil && !atk.hit;
        if (isActive && now > g.invulnerableUntil) {
          let hit = false;
          if (atk.kind === 'iceSpike') {
            hit = Math.abs(g.player.x - atk.x) < atk.width / 2 + 2.5 && Math.abs(g.player.y - atk.y) < 5;
          } else if (atk.kind === 'frostBeam') {
            hit = Math.abs(g.player.x - atk.x) < atk.width / 2 + 2;
          } else if (atk.kind === 'wightLunge') {
            hit = Math.abs(g.player.y - atk.y) < atk.width / 2 + 2;
          } else if (atk.kind === 'coldBurst') {
            const dx = g.player.x - atk.x;
            const dy = (g.player.y - atk.y) * 0.6;
            hit = Math.sqrt(dx * dx + dy * dy) < atk.width / 2 + 2;
          }
          if (hit) {
            atk.hit = true;
            g.health = Math.max(0, g.health - DAMAGE_BOSS_HIT);
            g.invulnerableUntil = now + 900;
            onDamage(g.health);
            audio.playerHurt();
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
        audio.explosion();
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
    <div className="night-game">
      <div className="night-hud">
        <div className="night-health">
          <span className="night-health-icon">❤</span>
          <div className="night-health-track">
            <div
              className={`night-health-fill ${healthPct <= 25 ? 'night-health-fill--low' : healthPct <= 55 ? 'night-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="night-health-value">{Math.round(healthPct)}/100</span>
        </div>
        <div className="night-timer-track">
          <div className="night-timer-fill" style={{ width: `${timePct}%` }} />
        </div>
      </div>

      <div
        className={`night-arena ${flashHit ? 'night-arena--hit' : ''}`}
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        onPointerMove={handleArenaPointerMove}
        onPointerUp={handleArenaPointerUp}
        onPointerCancel={handleArenaPointerUp}
        onPointerLeave={handleArenaPointerUp}
      >
        <div className="night-king">
          <PixelIcon icon="skull" size={90} />
        </div>

        {g.attacks.map((atk) => {
          const telegraphing = now < atk.telegraphUntil;
          if (atk.kind === 'iceSpike') {
            return <div key={atk.id} className="night-spike" style={{ left: `${atk.x}%`, top: `${atk.y}%` }} />;
          }
          if (atk.kind === 'frostBeam') {
            return (
              <div
                key={atk.id}
                className={`night-beam ${telegraphing ? 'night-beam--warn' : 'night-beam--active'}`}
                style={{ left: `${atk.x - atk.width / 2}%`, width: `${atk.width}%` }}
              />
            );
          }
          if (atk.kind === 'wightLunge') {
            return (
              <div
                key={atk.id}
                className={`night-lunge ${telegraphing ? 'night-lunge--warn' : 'night-lunge--active'}`}
                style={{ top: `${atk.y}%` }}
              />
            );
          }
          return (
            <div
              key={atk.id}
              className={`night-burst ${telegraphing ? 'night-burst--warn' : 'night-burst--active'}`}
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
          className={`night-player ${flashHit ? 'night-player--hit' : ''}`}
          style={{ left: `${g.player.x}%`, top: `${g.player.y}%` }}
        >
          {selectedIcon && <PixelIcon icon={selectedIcon} size={26} />}
        </div>

        {!selectedIcon && (
          <div className="night-select">
            <div className="night-select-box">
              <p className="night-select-title">Elige a tu defensor</p>
              <p className="night-select-text">
                Sobrevive al asedio del Rey de la Noche en el bosque de dioses hasta que Arya pueda asestar el golpe final.
              </p>
              <div className="night-select-grid">
                {CHARACTER_OPTIONS.map((opt) => (
                  <button key={opt.icon} className="night-select-option" onClick={() => chooseCharacter(opt.icon)}>
                    <PixelIcon icon={opt.icon} size={56} />
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="night-controls" aria-hidden="true">
        <div className="night-dpad">
          <button
            className="night-btn night-btn--up"
            onPointerDown={() => press('up')}
            onPointerUp={() => release('up')}
            onPointerLeave={() => release('up')}
          >
            ▲
          </button>
          <div className="night-dpad-row">
            <button
              className="night-btn"
              onPointerDown={() => press('left')}
              onPointerUp={() => release('left')}
              onPointerLeave={() => release('left')}
            >
              ◀
            </button>
            <button
              className="night-btn"
              onPointerDown={() => press('down')}
              onPointerUp={() => release('down')}
              onPointerLeave={() => release('down')}
            >
              ▼
            </button>
            <button
              className="night-btn"
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
