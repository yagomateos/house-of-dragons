import { useEffect, useRef, useState } from 'react';
import type { Difficulty, IconKey } from '../../types';
import { PixelIcon } from '../PixelIcon';
import { audio } from '../../utils/audio';
import './ArcherShooterBoss.css';

const CHARACTER_OPTIONS: { icon: IconKey; name: string }[] = [
  { icon: 'portrait-male-gold', name: 'Ser Aldric' },
  { icon: 'portrait-female-silver', name: 'Lyra de Plata' },
  { icon: 'portrait-knight', name: 'El Caballero Errante' },
];

const ENEMY_ICON: Record<EnemyKind, IconKey> = {
  soldado: 'portrait-male-dark',
  arquero: 'portrait-aemond',
};

interface ArcherShooterBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

type EnemyKind = 'soldado' | 'arquero';

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

interface FireBreath {
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
  archerRatio: number;
  enemySpeed: number;
}

interface DifficultyConfig {
  waves: WaveDef[];
  dragonHp: number;
  fireDamageMult: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: {
    waves: [
      { count: 5, spawnEvery: 1100, archerRatio: 0, enemySpeed: 0.32 },
      { count: 6, spawnEvery: 950, archerRatio: 0.2, enemySpeed: 0.36 },
    ],
    dragonHp: 160,
    fireDamageMult: 0.8,
  },
  normal: {
    waves: [
      { count: 6, spawnEvery: 950, archerRatio: 0, enemySpeed: 0.4 },
      { count: 8, spawnEvery: 800, archerRatio: 0.3, enemySpeed: 0.45 },
    ],
    dragonHp: 220,
    fireDamageMult: 1,
  },
  dificil: {
    waves: [
      { count: 7, spawnEvery: 800, archerRatio: 0, enemySpeed: 0.48 },
      { count: 10, spawnEvery: 650, archerRatio: 0.4, enemySpeed: 0.55 },
    ],
    dragonHp: 290,
    fireDamageMult: 1.2,
  },
};

const TICK_MS = 50;
const PLAYER_Y = 88;
const PLAYER_SPEED = 3.4;
const ARROW_SPEED = 3.4;
const ARROW_COOLDOWN_MS = 260;
const BREACH_Y = 90;
const DRAGON_Y = 16;

let nextId = 1;

function spawnEnemy(wave: WaveDef): Enemy {
  const isArcher = Math.random() < wave.archerRatio;
  return {
    id: nextId++,
    kind: isArcher ? 'arquero' : 'soldado',
    x: 4 + Math.random() * 92,
    y: 4,
    hp: isArcher ? 2 : 1,
    speed: wave.enemySpeed * (isArcher ? 0.8 : 1),
    lastShot: 0,
    hurtUntil: 0,
    dead: false,
  };
}

export function ArcherShooterBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: ArcherShooterBossProps) {
  const cfg = CONFIG[difficulty];
  const arenaRef = useRef<HTMLDivElement>(null);

  const gameRef = useRef({
    playerX: 50,
    keys: new Set<string>(),
    health: startingHealth,
    arrows: [] as Projectile[],
    enemyShots: [] as Projectile[],
    enemies: [] as Enemy[],
    lastArrow: 0,
    lastSpawn: 0,
    waveIndex: 0,
    spawnedInWave: 0,
    dragon: null as
      | {
          hp: number;
          maxHp: number;
          x: number;
          dir: 1 | -1;
          fire: FireBreath | null;
          nextFireAt: number;
          firesCompleted: number;
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
    if (now - g.lastArrow < ARROW_COOLDOWN_MS) return;
    g.lastArrow = now;
    g.arrows.push({ id: nextId++, x: g.playerX, y: PLAYER_Y - 4, vy: -ARROW_SPEED, dead: false });
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

      // Disparo automático: en móvil un solo dedo no puede arrastrar para
      // moverse y pulsar un botón de disparo a la vez, así que el arquero
      // dispara solo mientras el jugador se concentra en esquivar/moverse.
      shoot();

      if (g.keys.has('left')) g.playerX -= PLAYER_SPEED;
      if (g.keys.has('right')) g.playerX += PLAYER_SPEED;
      g.playerX = Math.min(96, Math.max(4, g.playerX));

      for (const a of g.arrows) a.y += a.vy;
      g.arrows = g.arrows.filter((a) => !a.dead && a.y > -5);

      for (const s of g.enemyShots) s.y += s.vy;

      const currentWave = cfg.waves[g.waveIndex];

      if (currentWave && !g.dragon) {
        if (g.spawnedInWave < currentWave.count && now - g.lastSpawn > currentWave.spawnEvery) {
          g.lastSpawn = now;
          g.spawnedInWave += 1;
          g.enemies.push(spawnEnemy(currentWave));
        }

        for (const e of g.enemies) {
          if (e.dead) continue;
          e.y += e.speed;
          if (e.kind === 'arquero' && now - e.lastShot > 1800 && e.y > 15 && e.y < 70) {
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

        for (const arrow of g.arrows) {
          for (const e of g.enemies) {
            if (e.dead || arrow.dead) continue;
            if (Math.abs(arrow.x - e.x) < 5 && Math.abs(arrow.y - e.y) < 6) {
              arrow.dead = true;
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
            g.dragon = {
              hp: cfg.dragonHp,
              maxHp: cfg.dragonHp,
              x: 50,
              dir: 1,
              fire: null,
              nextFireAt: now + 1500,
              firesCompleted: 0,
              exploding: false,
              explodeAt: 0,
            };
          }
        }
      } else if (g.dragon) {
        const d = g.dragon;
        d.x += d.dir * 0.35;
        if (d.x > 90 || d.x < 10) d.dir = d.dir === 1 ? -1 : 1;

        if (!d.fire && now > d.nextFireAt) {
          d.fire = { id: nextId++, x: d.x, width: 26, telegraphUntil: now + 700, activeUntil: now + 700 + 1100, hit: false };
          audio.fireBreath();
        }
        if (d.fire) {
          if (now > d.fire.activeUntil) {
            d.fire = null;
            d.firesCompleted += 1;
            d.nextFireAt = now + 2200;
          } else if (now > d.fire.telegraphUntil && !d.fire.hit && now > g.invulnerableUntil) {
            if (Math.abs(g.playerX - d.fire.x) < d.fire.width / 2) {
              d.fire.hit = true;
              g.health = Math.max(0, g.health - 15 * cfg.fireDamageMult);
              g.invulnerableUntil = now + 500;
              onDamage(g.health);
              audio.playerHurt();
            }
          }
        }

        // El dragón es invulnerable hasta completar su primer aliento de
        // fuego: así el jugador siempre vive al menos un ataque real
        // antes de poder derrotarlo, en vez de matarlo a flechazos antes
        // de que el patrón de fuego llegue a activarse.
        if (d.firesCompleted >= 1 && !d.exploding) {
          for (const arrow of g.arrows) {
            if (arrow.dead) continue;
            if (Math.abs(arrow.x - d.x) < 15 && arrow.y < DRAGON_Y + 13 && arrow.y > DRAGON_Y - 8) {
              arrow.dead = true;
              d.hp = Math.max(0, d.hp - 6);
              if (d.hp > 0) audio.hitEnemy();
            }
          }
        }

        if (d.hp <= 0 && d.firesCompleted >= 1 && !g.finished) {
          if (!d.exploding) {
            d.exploding = true;
            d.explodeAt = now;
            audio.explosion();
          } else if (now - d.explodeAt > 750) {
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
  const waveLabel = g.dragon ? null : currentWave ? `Oleada ${g.waveIndex + 1}/${cfg.waves.length}` : null;
  const dragonPct = g.dragon ? Math.max(0, (g.dragon.hp / g.dragon.maxHp) * 100) : 0;

  return (
    <div className="archer-game">
      <div className="archer-hud">
        <div className="archer-health">
          <span className="archer-health-icon">❤</span>
          <div className="archer-health-track">
            <div
              className={`archer-health-fill ${healthPct <= 25 ? 'archer-health-fill--low' : healthPct <= 55 ? 'archer-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="archer-health-value">{Math.round(healthPct)}/100</span>
        </div>
        {g.dragon ? (
          <div className="archer-boss-bar">
            <span className="archer-boss-label">Dragón</span>
            <div className="archer-boss-track">
              <div className="archer-boss-fill" style={{ width: `${dragonPct}%` }} />
            </div>
          </div>
        ) : (
          <div className="archer-wave-label">{waveLabel}</div>
        )}
      </div>

      <div
        className={`archer-arena ${flashHit ? 'archer-arena--hit' : ''}`}
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        onPointerMove={handleArenaPointerMove}
        onPointerUp={handleArenaPointerUp}
        onPointerCancel={handleArenaPointerUp}
        onPointerLeave={handleArenaPointerUp}
      >
        {g.dragon && (
          <div
            className={`archer-dragon ${g.dragon.firesCompleted < 1 ? 'archer-dragon--shielded' : ''} ${g.dragon.exploding ? 'archer-dragon--exploding' : ''}`}
            style={{ left: `${g.dragon.x}%`, top: `${DRAGON_Y}%` }}
          >
            <PixelIcon icon="dragon-crimson" size={104} />
            {g.dragon.fire && (
              <div
                className={`archer-fire ${now > g.dragon.fire.telegraphUntil ? 'archer-fire--active' : 'archer-fire--warn'}`}
                style={{ left: `${g.dragon.fire.x}%`, width: `${g.dragon.fire.width}%` }}
              />
            )}
            {g.dragon.exploding && (
              <>
                <div className="archer-explosion archer-explosion--1" />
                <div className="archer-explosion archer-explosion--2" />
                <div className="archer-explosion archer-explosion--3" />
              </>
            )}
          </div>
        )}

        {g.enemies.map((e) => {
          const hit = now < e.hurtUntil;
          return (
            <div
              key={e.id}
              className={`archer-enemy archer-enemy--${e.kind} ${hit ? 'archer-enemy--hit' : ''}`}
              style={{ left: `${e.x}%`, top: `${e.y}%` }}
            >
              <PixelIcon icon={ENEMY_ICON[e.kind]} size={26} />
            </div>
          );
        })}

        {g.arrows.map((a) => (
          <div key={a.id} className="archer-arrow" style={{ left: `${a.x}%`, top: `${a.y}%` }} />
        ))}

        {g.enemyShots.map((s) => (
          <div key={s.id} className="archer-enemy-shot" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
        ))}

        <div
          className="archer-track"
          style={{ top: `${PLAYER_Y}%` }}
          onPointerDown={handleArenaPointerDown}
          onPointerMove={handleArenaPointerMove}
          onPointerUp={handleArenaPointerUp}
          onPointerCancel={handleArenaPointerUp}
        >
          <div className="archer-track-handle" style={{ left: `${g.playerX}%` }} />
        </div>

        <div
          className={`archer-player ${flashHit ? 'archer-player--hit' : ''}`}
          style={{ left: `${g.playerX}%`, top: `${PLAYER_Y}%` }}
        >
          <PixelIcon icon={selectedIcon} size={30} />
        </div>

        {uiPhase === 'select' && (
          <div className="archer-briefing">
            <div className="archer-briefing-box">
              <p className="archer-briefing-title">Elige a tu arquero</p>
              <div className="archer-select-grid">
                {CHARACTER_OPTIONS.map((opt) => (
                  <button key={opt.icon} className="archer-select-option" onClick={() => chooseCharacter(opt.icon)}>
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
            className="archer-briefing"
            onClick={(e) => {
              e.stopPropagation();
              dismissBriefing();
            }}
          >
            <div className="archer-briefing-box">
              <p className="archer-briefing-title">🏹 El Arquero de Harrenhal</p>
              <p className="archer-briefing-text">
                Muévete arrastrando el dedo o con ◀▶: disparas flechas automáticamente. Derrota las
                oleadas de soldados y luego al dragón que ronda el castillo maldito.
              </p>
              <p className="archer-briefing-text">
                El dragón esquiva flechas hasta lanzar su primer aliento de fuego: sobrevívelo esquivando
                la columna de llamas y luego dispárale para hacerle daño real.
              </p>
              <p className="archer-briefing-tap">Toca para empezar</p>
            </div>
          </div>
        )}
      </div>

      <div className="archer-controls" aria-hidden="true">
        <div className="archer-controls-move">
          <button
            className="archer-btn"
            onPointerDown={() => gameRef.current.keys.add('left')}
            onPointerUp={() => gameRef.current.keys.delete('left')}
            onPointerLeave={() => gameRef.current.keys.delete('left')}
          >
            ◀
          </button>
          <button
            className="archer-btn"
            onPointerDown={() => gameRef.current.keys.add('right')}
            onPointerUp={() => gameRef.current.keys.delete('right')}
            onPointerLeave={() => gameRef.current.keys.delete('right')}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
