import { useEffect, useRef, useState } from 'react';
import type { Difficulty, IconKey } from '../../types';
import { PixelIcon } from '../PixelIcon';
import { audio } from '../../utils/audio';
import './WaveBrawlerBoss.css';

interface WaveBrawlerBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

const CHARACTER_OPTIONS: { icon: IconKey; name: string }[] = [
  { icon: 'portrait-male-blonde', name: 'Ser Rowan' },
  { icon: 'portrait-female-dark', name: 'Elara Tormenta' },
  { icon: 'portrait-male-silver', name: 'El Veterano' },
];

type EnemyKind = 'soldado' | 'guardia_pesado';

const ENEMY_ICON: Record<EnemyKind, IconKey> = {
  soldado: 'portrait-male-grey',
  guardia_pesado: 'portrait-old-warm',
};

interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  hp: number;
  maxHp: number;
  dmg: number;
  speed: number;
  range: number;
  atkCooldownMs: number;
  lastAttack: number;
  hurtUntil: number;
  dead: boolean;
}

interface WaveDef {
  count: number;
  heavyRatio: number;
  statMult: number;
}

interface DifficultyConfig {
  waves: WaveDef[];
  bossHp: number;
  bossDamageMult: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: {
    waves: [
      { count: 3, heavyRatio: 0, statMult: 0.85 },
      { count: 5, heavyRatio: 0.3, statMult: 0.9 },
      { count: 6, heavyRatio: 0.4, statMult: 1 },
    ],
    bossHp: 140,
    bossDamageMult: 0.8,
  },
  normal: {
    waves: [
      { count: 3, heavyRatio: 0, statMult: 1 },
      { count: 5, heavyRatio: 0.4, statMult: 1.05 },
      { count: 7, heavyRatio: 0.55, statMult: 1.2 },
    ],
    bossHp: 190,
    bossDamageMult: 1,
  },
  dificil: {
    waves: [
      { count: 4, heavyRatio: 0.1, statMult: 1.1 },
      { count: 6, heavyRatio: 0.5, statMult: 1.2 },
      { count: 8, heavyRatio: 0.6, statMult: 1.35 },
    ],
    bossHp: 250,
    bossDamageMult: 1.2,
  },
};

const TICK_MS = 50;
const PLAYER_Y = 80;
const MOVE_SPEED = 2.4;
const ATTACK_RANGE = 9;
const ATTACK_COOLDOWN_MS = 450;
const ATTACK_DMG = 12;
const BLOCK_REDUCTION = 0.75;
const HURT_COOLDOWN_MS = 550;
const BOSS_ATTACK_DMG = 10;
const BOSS_HEAVY_DMG = 22;
const BOSS_HEAVY_INTERVAL = 4200;

let nextId = 1;

function spawnEnemy(wave: WaveDef): Enemy {
  const heavy = Math.random() < wave.heavyRatio;
  const side = Math.random() < 0.5 ? 4 : 96;
  const kind: EnemyKind = heavy ? 'guardia_pesado' : 'soldado';
  const base = heavy ? { hp: 34, dmg: 13, speed: 0.7, range: 6.5, atkCooldownMs: 1100 } : { hp: 22, dmg: 8, speed: 1.1, range: 6, atkCooldownMs: 900 };
  return {
    id: nextId++,
    kind,
    x: side,
    hp: Math.round(base.hp * wave.statMult),
    maxHp: Math.round(base.hp * wave.statMult),
    dmg: base.dmg * wave.statMult,
    speed: base.speed,
    range: base.range,
    atkCooldownMs: base.atkCooldownMs,
    lastAttack: 0,
    hurtUntil: 0,
    dead: false,
  };
}

export function WaveBrawlerBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: WaveBrawlerBossProps) {
  const cfg = CONFIG[difficulty];

  const gameRef = useRef({
    playerX: 50,
    keys: new Set<string>(),
    health: startingHealth,
    blocking: false,
    attackFlashUntil: 0,
    lastAttack: 0,
    invulnerableUntil: 0,
    enemies: [] as Enemy[],
    waveIndex: 0,
    spawnedInWave: 0,
    lastSpawn: 0,
    boss: null as
      | { hp: number; maxHp: number; x: number; lastAttack: number; nextHeavyAt: number; heavyTelegraphUntil: number; heavyActiveUntil: number; exploding: boolean; explodeAt: number }
      | null,
    bossSpawned: false,
    finished: false,
    paused: true,
  });

  const [, setTick] = useState(0);
  const [uiPhase, setUiPhase] = useState<'select' | 'briefing' | 'playing'>('select');
  const [selectedIcon, setSelectedIcon] = useState<IconKey>(CHARACTER_OPTIONS[0].icon);
  const briefingMountedAtRef = useRef<number | null>(null);

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
    const t = window.setTimeout(dismissBriefing, 4200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiPhase]);

  function attack() {
    const g = gameRef.current;
    if (g.finished || g.paused) return;
    const now = performance.now();
    if (now - g.lastAttack < ATTACK_COOLDOWN_MS) return;
    g.lastAttack = now;
    g.attackFlashUntil = now + 140;
    audio.click();

    let hitSomething = false;
    for (const e of g.enemies) {
      if (e.dead) continue;
      if (Math.abs(e.x - g.playerX) < ATTACK_RANGE) {
        e.hp -= ATTACK_DMG;
        e.hurtUntil = now + 150;
        hitSomething = true;
        if (e.hp <= 0) {
          e.dead = true;
          audio.enemyDeath();
        } else {
          audio.hitEnemy();
        }
      }
    }
    const b = g.boss;
    if (b && !b.exploding && Math.abs(b.x - g.playerX) < ATTACK_RANGE) {
      b.hp = Math.max(0, b.hp - ATTACK_DMG);
      hitSomething = true;
      if (b.hp > 0) audio.hitEnemy();
    }
    if (!hitSomething) audio.click();
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
      if (e.key === ' ' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        attack();
        return;
      }
      if (e.key === 'Shift' || e.key === 'z' || e.key === 'Z') {
        gameRef.current.blocking = true;
        return;
      }
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        gameRef.current.keys.add(dir);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Shift' || e.key === 'z' || e.key === 'Z') {
        gameRef.current.blocking = false;
        return;
      }
      const dir = keyMap[e.key];
      if (dir) gameRef.current.keys.delete(dir);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const interval = window.setInterval(() => {
      const g = gameRef.current;
      if (g.finished || g.paused) return;
      const now = performance.now();

      let dx = 0;
      if (g.keys.has('left')) dx -= MOVE_SPEED;
      if (g.keys.has('right')) dx += MOVE_SPEED;
      g.playerX = Math.min(85, Math.max(15, g.playerX + dx));

      const currentWave = cfg.waves[g.waveIndex];

      if (currentWave && !g.bossSpawned) {
        if (g.spawnedInWave < currentWave.count && now - g.lastSpawn > 1100) {
          g.lastSpawn = now;
          g.spawnedInWave += 1;
          g.enemies.push(spawnEnemy(currentWave));
        }

        for (const e of g.enemies) {
          if (e.dead) continue;
          const dist = g.playerX - e.x;
          const absDist = Math.abs(dist);
          if (absDist <= e.range) {
            if (now - e.lastAttack > e.atkCooldownMs) {
              e.lastAttack = now;
              if (now > g.invulnerableUntil) {
                const dmg = g.blocking ? e.dmg * (1 - BLOCK_REDUCTION) : e.dmg;
                g.health = Math.max(0, g.health - dmg);
                g.invulnerableUntil = now + HURT_COOLDOWN_MS;
                onDamage(g.health);
                if (!g.blocking) audio.playerHurt();
              }
            }
          } else {
            e.x += Math.sign(dist) * e.speed;
          }
        }
        g.enemies = g.enemies.filter((e) => !e.dead);

        const waveCleared = g.spawnedInWave >= currentWave.count && g.enemies.length === 0;
        if (waveCleared) {
          g.waveIndex += 1;
          g.spawnedInWave = 0;
          g.lastSpawn = now;
          if (g.waveIndex >= cfg.waves.length) {
            g.bossSpawned = true;
            g.boss = {
              hp: cfg.bossHp,
              maxHp: cfg.bossHp,
              x: 50,
              lastAttack: now,
              nextHeavyAt: now + BOSS_HEAVY_INTERVAL,
              heavyTelegraphUntil: 0,
              heavyActiveUntil: 0,
              exploding: false,
              explodeAt: 0,
            };
          }
        }
      } else if (g.boss) {
        const b = g.boss;
        if (!b.exploding) {
          const dist = g.playerX - b.x;
          const absDist = Math.abs(dist);
          if (absDist > 10) {
            b.x += Math.sign(dist) * 0.6;
          }

          if (now > b.nextHeavyAt && b.heavyTelegraphUntil === 0) {
            b.heavyTelegraphUntil = now + 600;
            b.heavyActiveUntil = now + 600 + 250;
          }
          if (b.heavyTelegraphUntil > 0) {
            if (now > b.heavyActiveUntil) {
              b.heavyTelegraphUntil = 0;
              b.heavyActiveUntil = 0;
              b.nextHeavyAt = now + BOSS_HEAVY_INTERVAL;
            } else if (now > b.heavyTelegraphUntil && now < b.heavyActiveUntil && now > g.invulnerableUntil) {
              if (Math.abs(g.playerX - b.x) < 14) {
                const dmg = (g.blocking ? BOSS_HEAVY_DMG * (1 - BLOCK_REDUCTION) : BOSS_HEAVY_DMG) * cfg.bossDamageMult;
                g.health = Math.max(0, g.health - dmg);
                g.invulnerableUntil = now + HURT_COOLDOWN_MS;
                onDamage(g.health);
                if (!g.blocking) audio.playerHurt();
              }
            }
          } else if (absDist <= 10 && now - b.lastAttack > 1000) {
            b.lastAttack = now;
            if (now > g.invulnerableUntil) {
              const dmg = (g.blocking ? BOSS_ATTACK_DMG * (1 - BLOCK_REDUCTION) : BOSS_ATTACK_DMG) * cfg.bossDamageMult;
              g.health = Math.max(0, g.health - dmg);
              g.invulnerableUntil = now + HURT_COOLDOWN_MS;
              onDamage(g.health);
              if (!g.blocking) audio.playerHurt();
            }
          }

          if (b.hp <= 0 && !g.finished) {
            b.exploding = true;
            b.explodeAt = now;
            audio.explosion();
          }
        } else if (now - b.explodeAt > 750 && !g.finished) {
          g.finished = true;
          onWin();
        }
      }

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
  const currentWave = cfg.waves[g.waveIndex];
  const waveLabel = g.boss ? null : currentWave ? `Oleada ${g.waveIndex + 1}/${cfg.waves.length}` : null;
  const bossPct = g.boss ? Math.max(0, (g.boss.hp / g.boss.maxHp) * 100) : 0;
  const blocking = g.blocking;
  const hurtFlash = now < g.invulnerableUntil && !blocking;

  return (
    <div className="brawl-game">
      <div className="brawl-hud">
        <div className="brawl-health">
          <span className="brawl-health-icon">❤</span>
          <div className="brawl-health-track">
            <div
              className={`brawl-health-fill ${healthPct <= 25 ? 'brawl-health-fill--low' : healthPct <= 55 ? 'brawl-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="brawl-health-value">{Math.round(healthPct)}/100</span>
        </div>
        {g.boss ? (
          <div className="brawl-boss-bar">
            <span className="brawl-boss-label">Jefe</span>
            <div className="brawl-boss-track">
              <div className="brawl-boss-fill" style={{ width: `${bossPct}%` }} />
            </div>
          </div>
        ) : (
          <div className="brawl-wave-label">{waveLabel}</div>
        )}
      </div>

      <div className={`brawl-arena ${hurtFlash ? 'brawl-arena--hit' : ''}`}>
        <div className="brawl-ground" />

        {g.enemies.map((e) => {
          const hit = now < e.hurtUntil;
          return (
            <div key={e.id} className={`brawl-enemy ${hit ? 'brawl-enemy--hit' : ''}`} style={{ left: `${e.x}%`, top: `${PLAYER_Y}%` }}>
              <PixelIcon icon={ENEMY_ICON[e.kind]} size={e.kind === 'guardia_pesado' ? 34 : 28} />
              <div className="brawl-enemy-hp-track">
                <div className="brawl-enemy-hp-fill" style={{ width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%` }} />
              </div>
            </div>
          );
        })}

        {g.boss && (
          <div
            className={`brawl-boss ${g.boss.heavyTelegraphUntil > 0 && now < g.boss.heavyActiveUntil ? 'brawl-boss--telegraph' : ''} ${g.boss.exploding ? 'brawl-boss--exploding' : ''}`}
            style={{ left: `${g.boss.x}%`, top: `${PLAYER_Y}%` }}
          >
            <PixelIcon icon="portrait-aemond" size={46} />
            {g.boss.exploding && (
              <>
                <div className="brawl-explosion brawl-explosion--1" />
                <div className="brawl-explosion brawl-explosion--2" />
                <div className="brawl-explosion brawl-explosion--3" />
              </>
            )}
          </div>
        )}

        <div
          className={`brawl-player ${blocking ? 'brawl-player--block' : ''} ${now < g.attackFlashUntil ? 'brawl-player--attack' : ''} ${hurtFlash ? 'brawl-player--hit' : ''}`}
          style={{ left: `${g.playerX}%`, top: `${PLAYER_Y}%` }}
        >
          <PixelIcon icon={selectedIcon} size={32} />
        </div>

        {uiPhase === 'select' && (
          <div className="brawl-briefing">
            <div className="brawl-briefing-box">
              <p className="brawl-briefing-title">Elige a tu guerrero</p>
              <div className="brawl-select-grid">
                {CHARACTER_OPTIONS.map((opt) => (
                  <button key={opt.icon} className="brawl-select-option" onClick={() => chooseCharacter(opt.icon)}>
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
            className="brawl-briefing"
            onClick={(e) => {
              e.stopPropagation();
              dismissBriefing();
            }}
          >
            <div className="brawl-briefing-box">
              <p className="brawl-briefing-title">⚔ La Batalla de Campo</p>
              <p className="brawl-briefing-text">
                Los enemigos llegan por ambos lados. Muévete con ◀▶, ataca con ⚔ y mantén 🛡 para
                bloquear y reducir el daño.
              </p>
              <p className="brawl-briefing-text">
                Sobrevive tres oleadas y derrota al jefe final. Su golpe cargado (con brillo rojo) hace
                mucho daño: bloquéalo o aléjate.
              </p>
              <p className="brawl-briefing-tap">Toca para empezar</p>
            </div>
          </div>
        )}
      </div>

      <div className="brawl-controls" aria-hidden="true">
        <div className="brawl-controls-move">
          <button
            className="brawl-btn"
            onPointerDown={() => gameRef.current.keys.add('left')}
            onPointerUp={() => gameRef.current.keys.delete('left')}
            onPointerLeave={() => gameRef.current.keys.delete('left')}
          >
            ◀
          </button>
          <button
            className="brawl-btn"
            onPointerDown={() => gameRef.current.keys.add('right')}
            onPointerUp={() => gameRef.current.keys.delete('right')}
            onPointerLeave={() => gameRef.current.keys.delete('right')}
          >
            ▶
          </button>
        </div>
        <div className="brawl-controls-action">
          <button
            className="brawl-btn brawl-btn--block"
            onPointerDown={() => (gameRef.current.blocking = true)}
            onPointerUp={() => (gameRef.current.blocking = false)}
            onPointerLeave={() => (gameRef.current.blocking = false)}
          >
            🛡
          </button>
          <button className="brawl-btn brawl-btn--attack" onClick={attack}>
            ⚔
          </button>
        </div>
      </div>
    </div>
  );
}
