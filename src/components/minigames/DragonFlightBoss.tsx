import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../types';
import { PixelIcon } from '../PixelIcon';
import { audio } from '../../utils/audio';
import './DragonFlightBoss.css';

interface DragonFlightBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

// A diferencia de los otros dos jefes de barcos (Capítulos 3 y 5), aquí
// no hay un carril fijo: Drogon vuela libremente por el cielo (2D) y
// escupe fuego hacia abajo sobre la flota anclada en la bahía, mientras
// esquiva sus disparos en cualquier dirección, no solo lateralmente.

type EnemyKind = 'esclavista' | 'ballestero';

interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  driftDir: 1 | -1;
  hp: number;
  speed: number;
  lastShot: number;
  hurtUntil: number;
  dead: boolean;
}

interface Bolt {
  id: number;
  x: number;
  y: number;
  vy: number;
  dead: boolean;
}

interface GroundBlast {
  id: number;
  x: number;
  y: number;
  width: number;
  telegraphUntil: number;
  activeUntil: number;
  hit: boolean;
  spent: boolean;
}

interface WaveDef {
  count: number;
  spawnEvery: number;
  ballesteroRatio: number;
}

interface DifficultyConfig {
  waves: WaveDef[];
  flagshipHp: number;
  blastDamageMult: number;
  speed: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: {
    waves: [
      { count: 5, spawnEvery: 1300, ballesteroRatio: 0.1 },
      { count: 6, spawnEvery: 1100, ballesteroRatio: 0.22 },
    ],
    flagshipHp: 150,
    blastDamageMult: 0.85,
    speed: 3.6,
  },
  normal: {
    waves: [
      { count: 6, spawnEvery: 1050, ballesteroRatio: 0.16 },
      { count: 8, spawnEvery: 900, ballesteroRatio: 0.3 },
    ],
    flagshipHp: 200,
    blastDamageMult: 1,
    speed: 3.9,
  },
  dificil: {
    waves: [
      { count: 7, spawnEvery: 850, ballesteroRatio: 0.22 },
      { count: 10, spawnEvery: 700, ballesteroRatio: 0.4 },
    ],
    flagshipHp: 260,
    blastDamageMult: 1.2,
    speed: 4.3,
  },
};

const TICK_MS = 50;
const PLAYER_BOUNDS = { xMin: 4, xMax: 96, yMin: 8, yMax: 60 };
const SHIP_Y_MIN = 68;
const SHIP_Y_MAX = 88;
const BOLT_SPEED = 3.6;
const ENEMY_BOLT_SPEED = 2.4;
const BOLT_COOLDOWN_MS = 260;
const FLAGSHIP_Y = 78;

let nextId = 1;

function spawnFromWave(wave: WaveDef): Enemy {
  const isBallestero = Math.random() < wave.ballesteroRatio;
  return {
    id: nextId++,
    kind: isBallestero ? 'ballestero' : 'esclavista',
    x: 4 + Math.random() * 92,
    y: SHIP_Y_MIN + Math.random() * (SHIP_Y_MAX - SHIP_Y_MIN),
    driftDir: Math.random() < 0.5 ? 1 : -1,
    hp: isBallestero ? 2 : 1,
    speed: 0.12 + Math.random() * 0.08,
    lastShot: 0,
    hurtUntil: 0,
    dead: false,
  };
}

export function DragonFlightBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: DragonFlightBossProps) {
  const cfg = CONFIG[difficulty];
  const arenaRef = useRef<HTMLDivElement>(null);

  const gameRef = useRef({
    player: { x: 50, y: 34 },
    keys: new Set<string>(),
    health: startingHealth,
    bolts: [] as Bolt[],
    enemyShots: [] as Bolt[],
    enemies: [] as Enemy[],
    groundBlasts: [] as GroundBlast[],
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
          nextBlastAt: number;
          blastsCompleted: number;
          exploding: boolean;
          explodeAt: number;
        }
      | null,
    invulnerableUntil: 0,
    finished: false,
    paused: true,
  });

  const [, setTick] = useState(0);
  const [uiPhase, setUiPhase] = useState<'briefing' | 'playing'>('briefing');
  const briefingMountedAtRef = useRef<number | null>(performance.now());
  const draggingRef = useRef(false);

  function moveToPointer(e: { clientX: number; clientY: number }) {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    gameRef.current.player.x = Math.min(PLAYER_BOUNDS.xMax, Math.max(PLAYER_BOUNDS.xMin, x));
    gameRef.current.player.y = Math.min(PLAYER_BOUNDS.yMax, Math.max(PLAYER_BOUNDS.yMin, y));
  }

  function handleArenaPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (uiPhase !== 'playing') return;
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

  function dismissBriefing() {
    if (briefingMountedAtRef.current === null || performance.now() - briefingMountedAtRef.current < 500) return;
    gameRef.current.paused = false;
    gameRef.current.lastSpawn = performance.now();
    setUiPhase('playing');
  }

  useEffect(() => {
    const t = window.setTimeout(dismissBriefing, 4000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function shoot() {
    const g = gameRef.current;
    if (g.finished || g.paused) return;
    const now = performance.now();
    if (now - g.lastBolt < BOLT_COOLDOWN_MS) return;
    g.lastBolt = now;
    g.bolts.push({ id: nextId++, x: g.player.x, y: g.player.y + 3, vy: BOLT_SPEED, dead: false });
    audio.shoot();
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
      if (e.key === ' ' || e.key === 'x' || e.key === 'X') {
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
      // moverse en 2D y pulsar un botón de disparo a la vez, así que
      // Drogon escupe fuego solo mientras el jugador esquiva/se mueve.
      shoot();

      if (g.keys.has('left')) g.player.x -= cfg.speed;
      if (g.keys.has('right')) g.player.x += cfg.speed;
      if (g.keys.has('up')) g.player.y -= cfg.speed;
      if (g.keys.has('down')) g.player.y += cfg.speed;
      g.player.x = Math.min(PLAYER_BOUNDS.xMax, Math.max(PLAYER_BOUNDS.xMin, g.player.x));
      g.player.y = Math.min(PLAYER_BOUNDS.yMax, Math.max(PLAYER_BOUNDS.yMin, g.player.y));

      for (const b of g.bolts) b.y += b.vy;
      g.bolts = g.bolts.filter((b) => !b.dead && b.y < 100);
      for (const s of g.enemyShots) s.y += s.vy;

      const currentWave = cfg.waves[g.waveIndex];

      if (currentWave && !g.flagship) {
        if (g.spawnedInWave < currentWave.count && now - g.lastSpawn > currentWave.spawnEvery) {
          g.lastSpawn = now;
          g.spawnedInWave += 1;
          g.enemies.push(spawnFromWave(currentWave));
        }

        for (const e of g.enemies) {
          if (e.dead) continue;
          e.x += e.speed * e.driftDir;
          if (e.x < 4 || e.x > 96) e.driftDir = e.driftDir === 1 ? -1 : 1;
          if (e.kind === 'ballestero' && now - e.lastShot > 1700) {
            e.lastShot = now;
            g.enemyShots.push({ id: nextId++, x: e.x, y: e.y, vy: -ENEMY_BOLT_SPEED, dead: false });
            audio.enemyShoot();
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
              nextBlastAt: now + 1400,
              blastsCompleted: 0,
              exploding: false,
              explodeAt: 0,
            };
          }
        }
      } else if (g.flagship) {
        const f = g.flagship;
        f.x += f.dir * 0.3;
        if (f.x > 82 || f.x < 18) f.dir = f.dir === 1 ? -1 : 1;

        if (now > f.nextBlastAt && g.groundBlasts.every((gb) => gb.spent)) {
          // Ataque en área dirigido a la posición del jugador en el
          // momento del lanzamiento: como vuela libre en 2D, un único
          // carril fijo no tendría sentido aquí.
          g.groundBlasts.push({
            id: nextId++,
            x: g.player.x,
            y: g.player.y,
            width: 16,
            telegraphUntil: now + 750,
            activeUntil: now + 750 + 500,
            hit: false,
            spent: false,
          });
          audio.fireBreath();
        }

        for (const gb of g.groundBlasts) {
          if (now > gb.activeUntil) {
            gb.spent = true;
            if (!gb.hit) {
              f.blastsCompleted += 1;
              f.nextBlastAt = now + 1900;
            }
            continue;
          }
          if (now > gb.telegraphUntil && !gb.hit && now > g.invulnerableUntil) {
            const dx = g.player.x - gb.x;
            const dy = g.player.y - gb.y;
            if (Math.sqrt(dx * dx + dy * dy) < gb.width / 2) {
              gb.hit = true;
              g.health = Math.max(0, g.health - 15 * cfg.blastDamageMult);
              g.invulnerableUntil = now + 900;
              onDamage(g.health);
              audio.playerHurt();
              f.blastsCompleted += 1;
              f.nextBlastAt = now + 1900;
            }
          }
        }
        g.groundBlasts = g.groundBlasts.filter((gb) => !gb.spent);

        // El buque insignia es invulnerable hasta completar su primer
        // ataque en área: así el jugador siempre lo vive antes de poder
        // hundirlo a base de fuego.
        if (f.blastsCompleted >= 1 && !f.exploding) {
          for (const bolt of g.bolts) {
            if (bolt.dead) continue;
            if (Math.abs(bolt.x - f.x) < 15 && bolt.y > FLAGSHIP_Y - 10 && bolt.y < FLAGSHIP_Y + 10) {
              bolt.dead = true;
              f.hp = Math.max(0, f.hp - 6);
              if (f.hp > 0) audio.hitEnemy();
            }
          }
        }

        if (f.hp <= 0 && f.blastsCompleted >= 1 && !g.finished) {
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
        if (Math.abs(s.x - g.player.x) < 5 && Math.abs(s.y - g.player.y) < 6 && now > g.invulnerableUntil) {
          s.dead = true;
          g.health = Math.max(0, g.health - 8);
          g.invulnerableUntil = now + 500;
          onDamage(g.health);
          audio.playerHurt();
        }
      }
      g.enemyShots = g.enemyShots.filter((s) => !s.dead && s.y > -5);

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
    <div className="flight-game">
      <div className="flight-hud">
        <div className="flight-health">
          <span className="flight-health-icon">❤</span>
          <div className="flight-health-track">
            <div
              className={`flight-health-fill ${healthPct <= 25 ? 'flight-health-fill--low' : healthPct <= 55 ? 'flight-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="flight-health-value">{Math.round(healthPct)}/100</span>
        </div>
        {g.flagship ? (
          <div className="flight-boss-bar">
            <span className="flight-boss-label">Buque Insignia</span>
            <div className="flight-boss-track">
              <div className="flight-boss-fill" style={{ width: `${flagshipPct}%` }} />
            </div>
          </div>
        ) : (
          <div className="flight-wave-label">{waveLabel}</div>
        )}
      </div>

      <div
        className={`flight-arena ${flashHit ? 'flight-arena--hit' : ''}`}
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        onPointerMove={handleArenaPointerMove}
        onPointerUp={handleArenaPointerUp}
        onPointerCancel={handleArenaPointerUp}
        onPointerLeave={handleArenaPointerUp}
      >
        <div className="flight-water" />

        {g.flagship && (
          <div
            className={`flight-flagship ${g.flagship.blastsCompleted < 1 ? 'flight-flagship--shielded' : ''} ${g.flagship.exploding ? 'flight-flagship--exploding' : ''}`}
            style={{ left: `${g.flagship.x}%`, top: `${FLAGSHIP_Y}%` }}
          >
            <PixelIcon icon="ship" size={90} />
            {g.flagship.exploding && (
              <>
                <div className="flight-explosion flight-explosion--1" />
                <div className="flight-explosion flight-explosion--2" />
                <div className="flight-explosion flight-explosion--3" />
              </>
            )}
          </div>
        )}

        {g.enemies.map((e) => {
          const hit = now < e.hurtUntil;
          return (
            <div
              key={e.id}
              className={`flight-enemy flight-enemy--${e.kind} ${hit ? 'flight-enemy--hit' : ''}`}
              style={{ left: `${e.x}%`, top: `${e.y}%` }}
            >
              <PixelIcon icon="ship" size={30} />
            </div>
          );
        })}

        {g.groundBlasts.map((gb) => {
          const telegraphing = now < gb.telegraphUntil;
          return (
            <div
              key={gb.id}
              className={`flight-groundblast ${telegraphing ? 'flight-groundblast--warn' : 'flight-groundblast--active'}`}
              style={{ left: `${gb.x}%`, top: `${gb.y}%`, width: `${gb.width}%`, height: `${gb.width}%` }}
            />
          );
        })}

        {g.bolts.map((b) => (
          <div key={b.id} className="flight-bolt" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}

        {g.enemyShots.map((s) => (
          <div key={s.id} className="flight-enemy-shot" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
        ))}

        <div
          className={`flight-player ${flashHit ? 'flight-player--hit' : ''}`}
          style={{ left: `${g.player.x}%`, top: `${g.player.y}%` }}
        >
          <PixelIcon icon="dragon-black" size={38} />
        </div>

        {uiPhase === 'briefing' && (
          <div
            className="flight-briefing"
            onClick={(e) => {
              e.stopPropagation();
              dismissBriefing();
            }}
          >
            <div className="flight-briefing-box">
              <p className="flight-briefing-title">🐉 La Batalla de la Bahía</p>
              <p className="flight-briefing-text">
                Drogon vuela libre por el cielo: muévete en cualquier dirección con ◀▶▲▼ o arrastrando el
                dedo. Escupe fuego hacia abajo automáticamente mientras vuelas.
              </p>
              <p className="flight-briefing-text">
                El buque insignia lanza salvas de pólvora dirigidas a tu posición: no tienen un carril fijo,
                así que muévete en cuanto veas el círculo de aviso.
              </p>
              <p className="flight-briefing-tap">Toca para empezar</p>
            </div>
          </div>
        )}
      </div>

      <div className="flight-controls" aria-hidden="true">
        <div className="flight-dpad">
          <button
            className="flight-btn"
            onPointerDown={() => gameRef.current.keys.add('up')}
            onPointerUp={() => gameRef.current.keys.delete('up')}
            onPointerLeave={() => gameRef.current.keys.delete('up')}
          >
            ▲
          </button>
          <div className="flight-dpad-row">
            <button
              className="flight-btn"
              onPointerDown={() => gameRef.current.keys.add('left')}
              onPointerUp={() => gameRef.current.keys.delete('left')}
              onPointerLeave={() => gameRef.current.keys.delete('left')}
            >
              ◀
            </button>
            <button
              className="flight-btn"
              onPointerDown={() => gameRef.current.keys.add('down')}
              onPointerUp={() => gameRef.current.keys.delete('down')}
              onPointerLeave={() => gameRef.current.keys.delete('down')}
            >
              ▼
            </button>
            <button
              className="flight-btn"
              onPointerDown={() => gameRef.current.keys.add('right')}
              onPointerUp={() => gameRef.current.keys.delete('right')}
              onPointerLeave={() => gameRef.current.keys.delete('right')}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
