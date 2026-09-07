import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../types';
import { PixelIcon } from '../PixelIcon';
import './CastleAssaultBoss.css';

interface CastleAssaultBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

type EnemyKind = 'guardia' | 'arquero' | 'caballero';

interface Enemy {
  id: number;
  kind: EnemyKind;
  worldX: number;
  spawnX: number;
  hp: number;
  maxHp: number;
  dmg: number;
  speed: number;
  range: number;
  lastAction: number;
  hurtUntil: number;
  dead: boolean;
}

interface Arrow {
  id: number;
  worldX: number;
  vx: number;
  dead: boolean;
}

type BossPhase = 'idle' | 'telegraph-charge' | 'charging' | 'telegraph-slam' | 'slamming' | 'recover';

interface Boss {
  worldX: number;
  hp: number;
  maxHp: number;
  phase: BossPhase;
  phaseUntil: number;
  facing: 1 | -1;
  chargeTargetX: number;
}

const ENEMY_STATS: Record<EnemyKind, { hp: number; dmg: number; speed: number; range: number }> = {
  guardia: { hp: 26, dmg: 6, speed: 1.6, range: 5 },
  arquero: { hp: 16, dmg: 8, speed: 0.4, range: 30 },
  caballero: { hp: 36, dmg: 9, speed: 2.1, range: 5.5 },
};

interface DifficultyConfig {
  enemyDamageMult: number;
  bossDamageMult: number;
  bossHp: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: { enemyDamageMult: 0.75, bossDamageMult: 0.75, bossHp: 80 },
  normal: { enemyDamageMult: 1, bossDamageMult: 1, bossHp: 100 },
  dificil: { enemyDamageMult: 1.3, bossDamageMult: 1.25, bossHp: 130 },
};

const TICK_MS = 50;
const WORLD_WIDTH = 2200;
const VIEWPORT_WORLD_WIDTH = 900;
const GROUND_Y = 80;
const GRAVITY = 0.12;
const JUMP_VELOCITY = -1.9;
const MOVE_SPEED = 12;
const ATTACK_RANGE = 90;
const ATTACK_COOLDOWN_MS = 420;
const DODGE_COOLDOWN_MS = 1200;
const DODGE_DURATION_MS = 350;
const DODGE_SPEED_MULT = 2.4;
const HURT_COOLDOWN_MS = 700;
const WALLS = [
  { x: 380, width: 26 },
  { x: 1280, width: 26 },
];
const BOSS_ARENA_X = 1900;

let nextEntityId = 1;

export function CastleAssaultBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: CastleAssaultBossProps) {
  const cfg = CONFIG[difficulty];
  const arenaRef = useRef<HTMLDivElement>(null);

  const gameRef = useRef({
    player: {
      worldX: 60,
      y: GROUND_Y,
      vy: 0,
      facing: 1 as 1 | -1,
      grounded: true,
      hp: startingHealth,
      attackUntil: 0,
      attackCooldownUntil: 0,
      dodgeUntil: 0,
      dodgeCooldownUntil: 0,
      hurtUntil: 0,
    },
    keys: new Set<string>(),
    enemies: [
      { id: nextEntityId++, kind: 'guardia' as EnemyKind, worldX: 620, spawnX: 620, hp: ENEMY_STATS.guardia.hp, maxHp: ENEMY_STATS.guardia.hp, dmg: ENEMY_STATS.guardia.dmg * cfg.enemyDamageMult, speed: ENEMY_STATS.guardia.speed, range: ENEMY_STATS.guardia.range, lastAction: 0, hurtUntil: 0, dead: false },
      { id: nextEntityId++, kind: 'arquero' as EnemyKind, worldX: 1050, spawnX: 1050, hp: ENEMY_STATS.arquero.hp, maxHp: ENEMY_STATS.arquero.hp, dmg: ENEMY_STATS.arquero.dmg * cfg.enemyDamageMult, speed: ENEMY_STATS.arquero.speed, range: ENEMY_STATS.arquero.range, lastAction: 0, hurtUntil: 0, dead: false },
      { id: nextEntityId++, kind: 'caballero' as EnemyKind, worldX: 1520, spawnX: 1520, hp: ENEMY_STATS.caballero.hp, maxHp: ENEMY_STATS.caballero.hp, dmg: ENEMY_STATS.caballero.dmg * cfg.enemyDamageMult, speed: ENEMY_STATS.caballero.speed, range: ENEMY_STATS.caballero.range, lastAction: 0, hurtUntil: 0, dead: false },
    ] as Enemy[],
    arrows: [] as Arrow[],
    boss: null as Boss | null,
    bossSpawned: false,
    finished: false,
    paused: true,
  });

  const [, setTick] = useState(0);
  const [briefingVisible, setBriefingVisible] = useState(true);
  const briefingMountedAtRef = useRef(performance.now());

  function dismissBriefing() {
    if (performance.now() - briefingMountedAtRef.current < 500) return;
    gameRef.current.paused = false;
    setBriefingVisible(false);
  }

  useEffect(() => {
    const t = window.setTimeout(dismissBriefing, 4200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function attack() {
    const g = gameRef.current;
    if (g.finished || g.paused) return;
    const now = performance.now();
    if (now < g.player.attackCooldownUntil) return;
    g.player.attackCooldownUntil = now + ATTACK_COOLDOWN_MS;
    g.player.attackUntil = now + 160;

    const reach = g.player.worldX + g.player.facing * ATTACK_RANGE;
    for (const e of g.enemies) {
      if (e.dead) continue;
      const inRange = g.player.facing === 1 ? e.worldX >= g.player.worldX && e.worldX <= reach : e.worldX <= g.player.worldX && e.worldX >= reach;
      if (inRange) {
        e.hp -= 14;
        e.hurtUntil = now + 150;
      }
    }
    if (g.boss && !g.boss.hp) return;
    if (g.boss) {
      const b = g.boss;
      const inRange = g.player.facing === 1 ? b.worldX >= g.player.worldX && b.worldX <= reach : b.worldX <= g.player.worldX && b.worldX >= reach;
      if (inRange && b.hp > 0) {
        b.hp = Math.max(0, b.hp - 10);
      }
    }
  }

  function dodge() {
    const g = gameRef.current;
    if (g.finished || g.paused) return;
    const now = performance.now();
    if (now < g.player.dodgeCooldownUntil) return;
    g.player.dodgeUntil = now + DODGE_DURATION_MS;
    g.player.dodgeCooldownUntil = now + DODGE_COOLDOWN_MS;
  }

  function jump() {
    const g = gameRef.current;
    if (g.finished || g.paused) return;
    if (g.player.grounded) {
      g.player.vy = JUMP_VELOCITY;
      g.player.grounded = false;
    }
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
        dodge();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
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
      const p = g.player;
      const dodgingActive = now < p.dodgeUntil;
      const speedMult = dodgingActive ? DODGE_SPEED_MULT : 1;

      let dx = 0;
      if (g.keys.has('left')) {
        dx -= MOVE_SPEED * speedMult;
        p.facing = -1;
      }
      if (g.keys.has('right')) {
        dx += MOVE_SPEED * speedMult;
        p.facing = 1;
      }

      const nextX = p.worldX + (dx * TICK_MS) / 1000;
      const blockedByWall = WALLS.some(
        (w) => nextX + 14 > w.x && nextX - 14 < w.x + w.width && p.grounded && p.y >= GROUND_Y - 1
      );
      if (!blockedByWall) {
        p.worldX = Math.min(WORLD_WIDTH - 20, Math.max(20, nextX));
      }

      p.vy += GRAVITY;
      p.y += p.vy;
      if (p.y >= GROUND_Y) {
        p.y = GROUND_Y;
        p.vy = 0;
        p.grounded = true;
      } else {
        p.grounded = false;
      }

      for (const e of g.enemies) {
        if (e.dead) continue;
        if (e.hp <= 0) {
          e.dead = true;
          continue;
        }
        const dist = p.worldX - e.worldX;
        const absDist = Math.abs(dist);

        if (e.kind === 'arquero') {
          if (absDist < 420 && now - e.lastAction > 1500) {
            e.lastAction = now;
            g.arrows.push({ id: nextEntityId++, worldX: e.worldX, vx: dist > 0 ? 5.5 : -5.5, dead: false });
          }
        } else {
          if (absDist > e.range && absDist < 260) {
            e.worldX += Math.sign(dist) * e.speed;
          } else if (absDist <= e.range && now - e.lastAction > 900) {
            e.lastAction = now;
            if (!dodgingActive && now > p.hurtUntil) {
              p.hp = Math.max(0, p.hp - e.dmg);
              p.hurtUntil = now + HURT_COOLDOWN_MS;
              onDamage(p.hp);
            }
          }
        }
      }
      g.enemies = g.enemies.filter((e) => !e.dead || now - e.hurtUntil < 400);

      for (const a of g.arrows) {
        a.worldX += a.vx;
        if (Math.abs(a.worldX - p.worldX) < 24 && !dodgingActive && now > p.hurtUntil) {
          a.dead = true;
          p.hp = Math.max(0, p.hp - 8 * cfg.enemyDamageMult);
          p.hurtUntil = now + HURT_COOLDOWN_MS;
          onDamage(p.hp);
        }
        if (a.worldX < -50 || a.worldX > WORLD_WIDTH + 50) a.dead = true;
      }
      g.arrows = g.arrows.filter((a) => !a.dead);

      if (!g.bossSpawned && p.worldX >= BOSS_ARENA_X - 60) {
        g.bossSpawned = true;
        g.boss = {
          worldX: BOSS_ARENA_X + 120,
          hp: cfg.bossHp,
          maxHp: cfg.bossHp,
          phase: 'idle',
          phaseUntil: now + 1200,
          facing: -1,
          chargeTargetX: p.worldX,
        };
      }

      if (g.boss) {
        const b = g.boss;
        b.facing = p.worldX < b.worldX ? -1 : 1;
        if (b.hp <= 0) {
          if (!g.finished) {
            g.finished = true;
            onWin();
          }
        } else if (now > b.phaseUntil) {
          if (b.phase === 'idle') {
            b.phase = Math.random() < 0.5 ? 'telegraph-charge' : 'telegraph-slam';
            b.phaseUntil = now + 800;
            b.chargeTargetX = p.worldX;
          } else if (b.phase === 'telegraph-charge') {
            b.phase = 'charging';
            b.phaseUntil = now + 500;
          } else if (b.phase === 'charging') {
            b.phase = 'recover';
            b.phaseUntil = now + 1000;
          } else if (b.phase === 'telegraph-slam') {
            b.phase = 'slamming';
            b.phaseUntil = now + 300;
          } else if (b.phase === 'slamming') {
            b.phase = 'recover';
            b.phaseUntil = now + 1000;
          } else {
            b.phase = 'idle';
            b.phaseUntil = now + 900;
          }
        }

        if (b.phase === 'charging') {
          b.worldX += Math.sign(b.chargeTargetX - b.worldX || 1) * 9;
        }

        const bDist = Math.abs(p.worldX - b.worldX);
        if (
          (b.phase === 'charging' && bDist < 45) ||
          (b.phase === 'slamming' && bDist < 90)
        ) {
          if (!dodgingActive && now > p.hurtUntil) {
            const dmg = (b.phase === 'charging' ? 18 : 15) * cfg.bossDamageMult;
            p.hp = Math.max(0, p.hp - dmg);
            p.hurtUntil = now + HURT_COOLDOWN_MS;
            onDamage(p.hp);
          }
        }
      }

      if (p.hp <= 0 && !g.finished) {
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
  const p = g.player;
  const now = performance.now();
  const camX = Math.min(WORLD_WIDTH - VIEWPORT_WORLD_WIDTH, Math.max(0, p.worldX - VIEWPORT_WORLD_WIDTH / 2));
  const toScreen = (worldX: number) => ((worldX - camX) / VIEWPORT_WORLD_WIDTH) * 100;

  const healthPct = Math.max(0, Math.min(100, p.hp));
  const bossPct = g.boss ? Math.max(0, Math.min(100, (g.boss.hp / g.boss.maxHp) * 100)) : 0;
  const dodging = now < p.dodgeUntil;
  const distanceToBoss = Math.max(0, BOSS_ARENA_X - p.worldX);

  return (
    <div className="castle-game">
      <div className="castle-hud">
        <div className="castle-health">
          <span className="castle-health-icon">❤</span>
          <div className="castle-health-track">
            <div
              className={`castle-health-fill ${healthPct <= 25 ? 'castle-health-fill--low' : healthPct <= 55 ? 'castle-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="castle-health-value">{Math.round(healthPct)}/100</span>
        </div>
        {g.boss ? (
          <div className="castle-boss-bar">
            <span className="castle-boss-label">Guardián del Castillo</span>
            <div className="castle-boss-track">
              <div className="castle-boss-fill" style={{ width: `${bossPct}%` }} />
            </div>
          </div>
        ) : (
          <div className="castle-progress">Al jefe: {Math.round(distanceToBoss)}m</div>
        )}
      </div>

      <div className="castle-arena" ref={arenaRef}>
        <div className="castle-ground" />

        {WALLS.map((w, i) => (
          <div
            key={i}
            className="castle-wall"
            style={{ left: `${toScreen(w.x)}%`, width: `${(w.width / VIEWPORT_WORLD_WIDTH) * 100}%` }}
          />
        ))}

        {g.enemies.map((e) => {
          const hit = now < e.hurtUntil;
          const sx = toScreen(e.worldX);
          if (sx < -10 || sx > 110) return null;
          return (
            <div key={e.id} className={`castle-enemy castle-enemy--${e.kind} ${hit ? 'castle-enemy--hit' : ''}`} style={{ left: `${sx}%`, top: `${GROUND_Y}%` }}>
              <span className="castle-enemy-sprite" />
              <div className="castle-enemy-hp-track">
                <div className="castle-enemy-hp-fill" style={{ width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%` }} />
              </div>
            </div>
          );
        })}

        {g.arrows.map((a) => {
          const sx = toScreen(a.worldX);
          if (sx < -5 || sx > 105) return null;
          return <div key={a.id} className="castle-arrow" style={{ left: `${sx}%`, top: `${GROUND_Y}%` }} />;
        })}

        {g.boss && (
          <div
            className={`castle-boss ${g.boss.phase.startsWith('telegraph') ? 'castle-boss--telegraph' : ''} ${g.boss.phase === 'charging' || g.boss.phase === 'slamming' ? 'castle-boss--attacking' : ''}`}
            style={{ left: `${toScreen(g.boss.worldX)}%`, top: `${GROUND_Y}%` }}
          >
            <PixelIcon icon="crown" size={48} />
          </div>
        )}

        <div
          className={`castle-player ${dodging ? 'castle-player--dodge' : ''} ${now < p.attackUntil ? 'castle-player--attack' : ''}`}
          style={{ left: `${toScreen(p.worldX)}%`, top: `${p.y}%`, transform: `translate(-50%, -50%) scaleX(${p.facing})` }}
        >
          <span className="castle-player-sprite" />
        </div>

        {briefingVisible && (
          <div
            className="castle-briefing"
            onClick={(e) => {
              e.stopPropagation();
              dismissBriefing();
            }}
          >
            <div className="castle-briefing-box">
              <p className="castle-briefing-title">🏰 Asalto al Castillo</p>
              <p className="castle-briefing-text">
                Avanza hacia la derecha, derrota a los enemigos en el camino y llega hasta el jefe final.
              </p>
              <p className="castle-briefing-text">
                <strong>Mover:</strong> ◀▶ &nbsp; <strong>Saltar:</strong> ▲ &nbsp; <strong>Atacar:</strong> ⚔ &nbsp;{' '}
                <strong>Esquivar:</strong> 💨
              </p>
              <p className="castle-briefing-text">
                Salta las flechas y las cargas del jefe; esquiva para ganar una ventana segura.
              </p>
              <p className="castle-briefing-tap">Toca para empezar</p>
            </div>
          </div>
        )}
      </div>

      <div className="castle-controls" aria-hidden="true">
        <div className="castle-controls-move">
          <button
            className="castle-btn"
            onPointerDown={() => gameRef.current.keys.add('left')}
            onPointerUp={() => gameRef.current.keys.delete('left')}
            onPointerLeave={() => gameRef.current.keys.delete('left')}
          >
            ◀
          </button>
          <button
            className="castle-btn"
            onPointerDown={() => gameRef.current.keys.add('right')}
            onPointerUp={() => gameRef.current.keys.delete('right')}
            onPointerLeave={() => gameRef.current.keys.delete('right')}
          >
            ▶
          </button>
        </div>
        <div className="castle-controls-action">
          <button className="castle-btn castle-btn--jump" onClick={jump}>
            ▲
          </button>
          <button className="castle-btn castle-btn--dodge" onClick={dodge}>
            💨
          </button>
          <button className="castle-btn castle-btn--attack" onClick={attack}>
            ⚔
          </button>
        </div>
      </div>
    </div>
  );
}
