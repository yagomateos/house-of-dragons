import { useEffect, useRef, useState } from 'react';
import type { Difficulty, IconKey } from '../../types';
import { PixelIcon } from '../PixelIcon';
import { audio } from '../../utils/audio';
import './NavalBattleBoss.css';

const CHARACTER_OPTIONS: { icon: IconKey; name: string }[] = [
  { icon: 'portrait-male-blonde', name: 'Tyrion Lannister' },
  { icon: 'portrait-knight', name: 'Sandor Clegane, "El Perro"' },
  { icon: 'portrait-male-dark', name: 'Un Ballestero de la Guardia' },
];

interface NavalBattleBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

type EnemyKind = 'galera' | 'ballestero';

interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  hp: number;
  speed: number;
  lastShot: number;
  hurtUntil: number;
  dead: boolean;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vy: number;
  dead: boolean;
}

interface Wildfire {
  id: number;
  x: number;
  width: number;
  telegraphUntil: number;
  activeUntil: number;
  hit: boolean;
}

interface WaveDef {
  count: number;
  spawnEvery: number;
  ballesteroRatio: number;
  enemySpeed: number;
}

interface DifficultyConfig {
  waves: WaveDef[];
  flagshipHp: number;
  wildfireDamageMult: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: {
    waves: [
      { count: 5, spawnEvery: 1100, ballesteroRatio: 0, enemySpeed: 0.32 },
      { count: 6, spawnEvery: 950, ballesteroRatio: 0.2, enemySpeed: 0.36 },
    ],
    flagshipHp: 160,
    wildfireDamageMult: 0.8,
  },
  normal: {
    waves: [
      { count: 6, spawnEvery: 950, ballesteroRatio: 0, enemySpeed: 0.4 },
      { count: 8, spawnEvery: 800, ballesteroRatio: 0.3, enemySpeed: 0.45 },
    ],
    flagshipHp: 220,
    wildfireDamageMult: 1,
  },
  dificil: {
    waves: [
      { count: 7, spawnEvery: 800, ballesteroRatio: 0, enemySpeed: 0.48 },
      { count: 10, spawnEvery: 650, ballesteroRatio: 0.4, enemySpeed: 0.55 },
    ],
    flagshipHp: 290,
    wildfireDamageMult: 1.2,
  },
};

const TICK_MS = 50;
const PLAYER_Y = 88;
const PLAYER_SPEED = 3.4;
const BOLT_SPEED = 3.4;
const BOLT_COOLDOWN_MS = 260;
const BREACH_Y = 90;
const FLAGSHIP_Y = 16;

let nextId = 1;

function spawnEnemy(wave: WaveDef): Enemy {
  const isBallestero = Math.random() < wave.ballesteroRatio;
  return {
    id: nextId++,
    kind: isBallestero ? 'ballestero' : 'galera',
    x: 8 + Math.random() * 84,
    y: 4,
    hp: isBallestero ? 2 : 1,
    speed: wave.enemySpeed * (isBallestero ? 0.8 : 1),
    lastShot: 0,
    hurtUntil: 0,
    dead: false,
  };
}

export function NavalBattleBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: NavalBattleBossProps) {
  const cfg = CONFIG[difficulty];
  const arenaRef = useRef<HTMLDivElement>(null);

  const gameRef = useRef({
    playerX: 50,
    keys: new Set<string>(),
    health: startingHealth,
    bolts: [] as Projectile[],
    enemyShots: [] as Projectile[],
    enemies: [] as Enemy[],
    lastBolt: 0,
    lastSpawn: 0,
    waveIndex: 0,
    spawnedInWave: 0,
    flagship: null as
      | {
          hp: number;
          maxHp: number;
          x: number;
          dir: 1 | -1;
          wildfire: Wildfire | null;
          nextWildfireAt: number;
          eruptionsCompleted: number;
          exploding: boolean;
          explodeAt: number;
        }
      | null,
    invulnerableUntil: 0,
    finished: false,
    paused: true,
  });

  const [, setTick] = useState(0);
  const [uiPhase, setUiPhase] = useState<'select' | 'briefing' | 'playing'>('select');
  const [selectedIcon, setSelectedIcon] = useState<IconKey>(CHARACTER_OPTIONS[0].icon);
  const briefingMountedAtRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  function moveToPointer(clientX: number) {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    gameRef.current.playerX = Math.min(96, Math.max(4, x));
  }

  function handleArenaPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (uiPhase !== 'playing') return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveToPointer(e.clientX);
  }
  function handleArenaPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    moveToPointer(e.clientX);
  }
  function handleArenaPointerUp() {
    draggingRef.current = false;
  }

  function chooseCharacter(icon: IconKey) {
    setSelectedIcon(icon);
    setUiPhase('briefing');
    briefingMountedAtRef.current = performance.now();
  }

  function dismissBriefing() {
    if (briefingMountedAtRef.current === null || performance.now() - briefingMountedAtRef.current < 500) return;
    gameRef.current.paused = false;
    gameRef.current.lastSpawn = performance.now();
    setUiPhase('playing');
  }

  useEffect(() => {
    if (uiPhase !== 'briefing') return;
    const t = window.setTimeout(dismissBriefing, 4000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiPhase]);

  function shoot() {
    const g = gameRef.current;
    if (g.finished || g.paused) return;
    const now = performance.now();
    if (now - g.lastBolt < BOLT_COOLDOWN_MS) return;
    g.lastBolt = now;
    g.bolts.push({ id: nextId++, x: g.playerX, y: PLAYER_Y - 4, vy: -BOLT_SPEED, dead: false });
    audio.shoot();
  }

  useEffect(() => {
    const keyMap: Record<string, string> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      a: 'left',
      d: 'right',
      A: 'left',
      D: 'right',
    };
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'x' || e.key === 'X' || e.key === 'ArrowUp') {
        e.preventDefault();
        shoot();
        return;
      }
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        gameRef.current.keys.add(dir);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      const dir = keyMap[e.key];
      if (dir) gameRef.current.keys.delete(dir);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const interval = window.setInterval(() => {
      const g = gameRef.current;
      if (g.finished || g.paused) return;
      const now = performance.now();

      if (g.keys.has('left')) g.playerX -= PLAYER_SPEED;
      if (g.keys.has('right')) g.playerX += PLAYER_SPEED;
      g.playerX = Math.min(96, Math.max(4, g.playerX));

      for (const b of g.bolts) b.y += b.vy;
      g.bolts = g.bolts.filter((b) => !b.dead && b.y > -5);

      for (const s of g.enemyShots) s.y += s.vy;

      const currentWave = cfg.waves[g.waveIndex];

      if (currentWave && !g.flagship) {
        if (g.spawnedInWave < currentWave.count && now - g.lastSpawn > currentWave.spawnEvery) {
          g.lastSpawn = now;
          g.spawnedInWave += 1;
          g.enemies.push(spawnEnemy(currentWave));
        }

        for (const e of g.enemies) {
          if (e.dead) continue;
          e.y += e.speed;
          if (e.kind === 'ballestero' && now - e.lastShot > 1800 && e.y > 15 && e.y < 70) {
            e.lastShot = now;
            g.enemyShots.push({ id: nextId++, x: e.x, y: e.y, vy: 2.2, dead: false });
            audio.enemyShoot();
          }
          if (e.y >= BREACH_Y) {
            e.dead = true;
            if (now > g.invulnerableUntil) {
              g.health = Math.max(0, g.health - 10);
              g.invulnerableUntil = now + 500;
              onDamage(g.health);
              audio.playerHurt();
            }
          }
        }

        for (const bolt of g.bolts) {
          for (const e of g.enemies) {
            if (e.dead || bolt.dead) continue;
            if (Math.abs(bolt.x - e.x) < 5 && Math.abs(bolt.y - e.y) < 6) {
              bolt.dead = true;
              e.hp -= 1;
              e.hurtUntil = now + 150;
              if (e.hp <= 0) {
                e.dead = true;
                audio.enemyDeath();
              } else {
                audio.hitEnemy();
              }
            }
          }
        }
        g.enemies = g.enemies.filter((e) => !e.dead || now - e.hurtUntil < 300);

        const waveCleared = g.spawnedInWave >= currentWave.count && g.enemies.length === 0;
        if (waveCleared) {
          g.waveIndex += 1;
          g.spawnedInWave = 0;
          g.lastSpawn = now;
          if (g.waveIndex >= cfg.waves.length) {
            g.flagship = {
              hp: cfg.flagshipHp,
              maxHp: cfg.flagshipHp,
              x: 50,
              dir: 1,
              wildfire: null,
              nextWildfireAt: now + 1500,
              eruptionsCompleted: 0,
              exploding: false,
              explodeAt: 0,
            };
          }
        }
      } else if (g.flagship) {
        const f = g.flagship;
        f.x += f.dir * 0.35;
        if (f.x > 82 || f.x < 18) f.dir = f.dir === 1 ? -1 : 1;

        if (!f.wildfire && now > f.nextWildfireAt) {
          f.wildfire = { id: nextId++, x: f.x, width: 26, telegraphUntil: now + 700, activeUntil: now + 700 + 1100, hit: false };
          audio.fireBreath();
        }
        if (f.wildfire) {
          if (now > f.wildfire.activeUntil) {
            f.wildfire = null;
            f.eruptionsCompleted += 1;
            f.nextWildfireAt = now + 2200;
          } else if (now > f.wildfire.telegraphUntil && !f.wildfire.hit && now > g.invulnerableUntil) {
            if (Math.abs(g.playerX - f.wildfire.x) < f.wildfire.width / 2) {
              f.wildfire.hit = true;
              g.health = Math.max(0, g.health - 15 * cfg.wildfireDamageMult);
              g.invulnerableUntil = now + 500;
              onDamage(g.health);
              audio.playerHurt();
            }
          }
        }

        // El buque insignia es invulnerable hasta completar su primera
        // erupción de pólvora líquida: así el jugador siempre vive al
        // menos un ataque real antes de poder hundirlo.
        if (f.eruptionsCompleted >= 1 && !f.exploding) {
          for (const bolt of g.bolts) {
            if (bolt.dead) continue;
            if (Math.abs(bolt.x - f.x) < 15 && bolt.y < FLAGSHIP_Y + 13 && bolt.y > FLAGSHIP_Y - 8) {
              bolt.dead = true;
              f.hp = Math.max(0, f.hp - 6);
              if (f.hp > 0) audio.hitEnemy();
            }
          }
        }

        if (f.hp <= 0 && f.eruptionsCompleted >= 1 && !g.finished) {
          if (!f.exploding) {
            f.exploding = true;
            f.explodeAt = now;
            audio.explosion();
          } else if (now - f.explodeAt > 750) {
            g.finished = true;
            onWin();
          }
        }
      }

      for (const s of g.enemyShots) {
        if (s.dead) continue;
        if (Math.abs(s.x - g.playerX) < 5 && Math.abs(s.y - PLAYER_Y) < 6 && now > g.invulnerableUntil) {
          s.dead = true;
          g.health = Math.max(0, g.health - 8);
          g.invulnerableUntil = now + 500;
          onDamage(g.health);
          audio.playerHurt();
        }
      }
      g.enemyShots = g.enemyShots.filter((s) => !s.dead && s.y < 100);

      if (g.health <= 0 && !g.finished) {
        g.finished = true;
        onLose();
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

  const g = gameRef.current;
  const now = performance.now();
  const healthPct = Math.max(0, Math.min(100, g.health));
  const flashHit = now < g.invulnerableUntil;
  const currentWave = cfg.waves[g.waveIndex];
  const waveLabel = g.flagship ? null : currentWave ? `Oleada ${g.waveIndex + 1}/${cfg.waves.length}` : null;
  const flagshipPct = g.flagship ? Math.max(0, (g.flagship.hp / g.flagship.maxHp) * 100) : 0;

  return (
    <div className="naval-game">
      <div className="naval-hud">
        <div className="naval-health">
          <span className="naval-health-icon">❤</span>
          <div className="naval-health-track">
            <div
              className={`naval-health-fill ${healthPct <= 25 ? 'naval-health-fill--low' : healthPct <= 55 ? 'naval-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="naval-health-value">{Math.round(healthPct)}/100</span>
        </div>
        {g.flagship ? (
          <div className="naval-boss-bar">
            <span className="naval-boss-label">Buque Insignia</span>
            <div className="naval-boss-track">
              <div className="naval-boss-fill" style={{ width: `${flagshipPct}%` }} />
            </div>
          </div>
        ) : (
          <div className="naval-wave-label">{waveLabel}</div>
        )}
      </div>

      <div
        className={`naval-arena ${flashHit ? 'naval-arena--hit' : ''}`}
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        onPointerMove={handleArenaPointerMove}
        onPointerUp={handleArenaPointerUp}
        onPointerCancel={handleArenaPointerUp}
        onPointerLeave={handleArenaPointerUp}
      >
        {g.flagship && (
          <div
            className={`naval-flagship ${g.flagship.eruptionsCompleted < 1 ? 'naval-flagship--shielded' : ''} ${g.flagship.exploding ? 'naval-flagship--exploding' : ''}`}
            style={{ left: `${g.flagship.x}%`, top: `${FLAGSHIP_Y}%` }}
          >
            <PixelIcon icon="ship" size={100} />
            {g.flagship.wildfire && (
              <div
                className={`naval-wildfire ${now > g.flagship.wildfire.telegraphUntil ? 'naval-wildfire--active' : 'naval-wildfire--warn'}`}
                style={{ left: `${g.flagship.wildfire.x}%`, width: `${g.flagship.wildfire.width}%` }}
              />
            )}
            {g.flagship.exploding && (
              <>
                <div className="naval-explosion naval-explosion--1" />
                <div className="naval-explosion naval-explosion--2" />
                <div className="naval-explosion naval-explosion--3" />
              </>
            )}
          </div>
        )}

        {g.enemies.map((e) => {
          const hit = now < e.hurtUntil;
          return (
            <div
              key={e.id}
              className={`naval-enemy naval-enemy--${e.kind} ${hit ? 'naval-enemy--hit' : ''}`}
              style={{ left: `${e.x}%`, top: `${e.y}%` }}
            >
              <PixelIcon icon="ship" size={24} />
            </div>
          );
        })}

        {g.bolts.map((b) => (
          <div key={b.id} className="naval-bolt" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}

        {g.enemyShots.map((s) => (
          <div key={s.id} className="naval-enemy-shot" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
        ))}

        <div
          className={`naval-player ${flashHit ? 'naval-player--hit' : ''}`}
          style={{ left: `${g.playerX}%`, top: `${PLAYER_Y}%` }}
        >
          <PixelIcon icon={selectedIcon} size={30} />
        </div>

        {uiPhase === 'select' && (
          <div className="naval-briefing">
            <div className="naval-briefing-box">
              <p className="naval-briefing-title">Elige a tu defensor</p>
              <div className="naval-select-grid">
                {CHARACTER_OPTIONS.map((opt) => (
                  <button key={opt.icon} className="naval-select-option" onClick={() => chooseCharacter(opt.icon)}>
                    <PixelIcon icon={opt.icon} size={56} />
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {uiPhase === 'briefing' && (
          <div
            className="naval-briefing"
            onClick={(e) => {
              e.stopPropagation();
              dismissBriefing();
            }}
          >
            <div className="naval-briefing-box">
              <p className="naval-briefing-title">🚢 La Batalla de Aguasnegras</p>
              <p className="naval-briefing-text">
                Muévete con ◀▶, dispara flechas en llamas con el botón de ataque. Hunde las naves de la
                flota de Stannis antes de que desembarquen junto a las murallas.
              </p>
              <p className="naval-briefing-text">
                El buque insignia esquiva tus disparos hasta provocar su primera erupción de pólvora
                líquida: sobrevive a la columna de fuego verde y luego ataca sus flancos para hundirlo.
              </p>
              <p className="naval-briefing-tap">Toca para empezar</p>
            </div>
          </div>
        )}
      </div>

      <div className="naval-controls" aria-hidden="true">
        <div className="naval-controls-move">
          <button
            className="naval-btn"
            onPointerDown={() => gameRef.current.keys.add('left')}
            onPointerUp={() => gameRef.current.keys.delete('left')}
            onPointerLeave={() => gameRef.current.keys.delete('left')}
          >
            ◀
          </button>
          <button
            className="naval-btn"
            onPointerDown={() => gameRef.current.keys.add('right')}
            onPointerUp={() => gameRef.current.keys.delete('right')}
            onPointerLeave={() => gameRef.current.keys.delete('right')}
          >
            ▶
          </button>
        </div>
        <button className="naval-btn naval-btn--shoot" onClick={shoot}>
          🏹
        </button>
      </div>
    </div>
  );
}
