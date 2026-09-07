import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../types';
import { PixelIcon } from '../PixelIcon';
import './StrategyBoss.css';

// Una brecha en el castillo duele menos que un golpe directo de jefe:
// aquí no hay ataques cuerpo a cuerpo contra el jugador, solo el coste
// de no llegar a tiempo a defender un frente.
const BREACH_DAMAGE = 8;

interface StrategyBossProps {
  difficulty: Difficulty;
  startingHealth: number;
  onDamage: (newHealth: number) => void;
  onWin: () => void;
  onLose: () => void;
}

type Side = 'player' | 'enemy';
type UnitKind = 'soldado' | 'arquero' | 'caballeria' | 'asaltante' | 'asaltante_arco';

interface Unit {
  id: number;
  side: Side;
  kind: UnitKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  dmg: number;
  range: number;
  speed: number;
  atkCooldownMs: number;
  lastAttack: number;
  targetX: number | null;
  targetY: number | null;
  flashUntil: number;
  dead: boolean;
}

const LABELS: Record<UnitKind, string> = {
  soldado: 'Soldado',
  arquero: 'Arquero',
  caballeria: 'Caballería',
  asaltante: 'Enemigo',
  asaltante_arco: 'Enemigo arquero',
};

interface UnitBase {
  hp: number;
  dmg: number;
  range: number;
  speed: number;
  atkCooldownMs: number;
}

const PLAYER_STATS: Record<'soldado' | 'arquero' | 'caballeria', UnitBase> = {
  soldado: { hp: 40, dmg: 8, range: 7, speed: 1.7, atkCooldownMs: 700 },
  arquero: { hp: 25, dmg: 9, range: 26, speed: 1.4, atkCooldownMs: 900 },
  caballeria: { hp: 55, dmg: 12, range: 8, speed: 2.6, atkCooldownMs: 650 },
};

interface DifficultyConfig {
  duration: number;
  spawnEvery: number;
  enemySpeed: number;
  archerChance: number;
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: { duration: 32, spawnEvery: 4600, enemySpeed: 0.18, archerChance: 0.08 },
  normal: { duration: 45, spawnEvery: 3800, enemySpeed: 0.25, archerChance: 0.14 },
  dificil: { duration: 60, spawnEvery: 3000, enemySpeed: 0.34, archerChance: 0.2 },
};

const TICK_MS = 60;
const BASE = { x: 50, y: 92 };
const BREACH_Y = 89;
const ARENA_BOUNDS = { xMin: 4, xMax: 96, yMin: 6, yMax: 90 };
const ALERT_RADIUS = 38;

let nextUnitId = 1;

function makePlayerUnit(kind: 'soldado' | 'arquero' | 'caballeria', x: number, y: number): Unit {
  const s = PLAYER_STATS[kind];
  return {
    id: nextUnitId++,
    side: 'player',
    kind,
    x,
    y,
    hp: s.hp,
    maxHp: s.hp,
    dmg: s.dmg,
    range: s.range,
    speed: s.speed,
    atkCooldownMs: s.atkCooldownMs,
    lastAttack: 0,
    targetX: null,
    targetY: null,
    flashUntil: 0,
    dead: false,
  };
}

function spawnEnemy(cfg: DifficultyConfig): Unit {
  const isArcher = Math.random() < cfg.archerChance;
  const kind: UnitKind = isArcher ? 'asaltante_arco' : 'asaltante';
  const hp = isArcher ? 14 : 20;
  const dmg = isArcher ? 6 : 5;
  const range = isArcher ? 22 : 7;
  const atkCooldownMs = isArcher ? 1000 : 800;
  return {
    id: nextUnitId++,
    side: 'enemy',
    kind,
    x: 10 + Math.random() * 80,
    y: 6,
    hp,
    maxHp: hp,
    dmg,
    range,
    speed: cfg.enemySpeed * (isArcher ? 0.85 : 1),
    atkCooldownMs,
    lastAttack: 0,
    targetX: null,
    targetY: null,
    flashUntil: 0,
    dead: false,
  };
}

export function StrategyBoss({ difficulty, startingHealth, onDamage, onWin, onLose }: StrategyBossProps) {
  const cfg = CONFIG[difficulty];
  const arenaRef = useRef<HTMLDivElement>(null);

  const gameRef = useRef({
    units: [
      makePlayerUnit('soldado', 32, 78),
      makePlayerUnit('soldado', 68, 78),
      makePlayerUnit('arquero', 50, 84),
      makePlayerUnit('caballeria', 50, 70),
    ] as Unit[],
    health: startingHealth,
    timeLeft: cfg.duration,
    lastSpawn: performance.now(),
    selectedId: null as number | null,
    finished: false,
    paused: true,
  });

  const [, setTick] = useState(0);
  const [briefingVisible, setBriefingVisible] = useState(true);
  // Evita que un tap que coincide en la misma posición que el botón
  // "Comenzar" del jefe cierre la explicación al instante sin dar
  // tiempo a leerla.
  const briefingMountedAtRef = useRef(performance.now());

  function dismissBriefing() {
    if (performance.now() - briefingMountedAtRef.current < 500) return;
    gameRef.current.paused = false;
    gameRef.current.lastSpawn = performance.now();
    setBriefingVisible(false);
  }

  useEffect(() => {
    const t = window.setTimeout(dismissBriefing, 3500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const g = gameRef.current;
      if (g.finished || g.paused) return;
      const now = performance.now();

      if (now - g.lastSpawn > cfg.spawnEvery * (0.8 + Math.random() * 0.4)) {
        g.lastSpawn = now;
        g.units.push(spawnEnemy(cfg));
      }

      for (const unit of g.units) {
        if (unit.dead) continue;

        let nearestEnemy: Unit | null = null;
        let nearestDist = Infinity;
        for (const other of g.units) {
          if (other.dead || other.side === unit.side) continue;
          const dx = other.x - unit.x;
          const dy = other.y - unit.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = other;
          }
        }

        if (nearestEnemy && nearestDist <= unit.range) {
          if (now - unit.lastAttack >= unit.atkCooldownMs) {
            unit.lastAttack = now;
            unit.flashUntil = now + 150;
            nearestEnemy.hp = Math.max(0, nearestEnemy.hp - unit.dmg);
            nearestEnemy.flashUntil = now + 200;
          }
          continue;
        }

        if (unit.side === 'enemy') {
          const dx = BASE.x - unit.x;
          const dy = BASE.y - unit.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          unit.x += (dx / dist) * unit.speed;
          unit.y += (dy / dist) * unit.speed;
        } else if (unit.targetX !== null && unit.targetY !== null) {
          const dx = unit.targetX - unit.x;
          const dy = unit.targetY - unit.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1.2) {
            unit.targetX = null;
            unit.targetY = null;
          } else {
            unit.x += (dx / dist) * unit.speed;
            unit.y += (dy / dist) * unit.speed;
          }
        } else if (nearestEnemy && nearestDist <= ALERT_RADIUS) {
          // Postura "agresiva": sin orden manual, una unidad se acerca
          // sola a la amenaza más cercana en vez de quedarse quieta. El
          // jugador solo necesita intervenir para reforzar o priorizar,
          // no para que cada unidad sobreviva.
          const dx = nearestEnemy.x - unit.x;
          const dy = nearestEnemy.y - unit.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          unit.x += (dx / dist) * unit.speed;
          unit.y += (dy / dist) * unit.speed;
        }

        unit.x = Math.min(ARENA_BOUNDS.xMax, Math.max(ARENA_BOUNDS.xMin, unit.x));
        unit.y = Math.min(ARENA_BOUNDS.yMax, Math.max(ARENA_BOUNDS.yMin, unit.y));

        if (unit.side === 'enemy' && unit.y >= BREACH_Y) {
          unit.dead = true;
          g.health = Math.max(0, g.health - BREACH_DAMAGE);
          onDamage(g.health);
        }
      }

      for (const unit of g.units) {
        if (unit.hp <= 0) unit.dead = true;
      }
      g.units = g.units.filter((u) => !u.dead);

      g.timeLeft -= TICK_MS / 1000;

      const playerAlive = g.units.some((u) => u.side === 'player');

      if ((g.health <= 0 || !playerAlive) && !g.finished) {
        g.finished = true;
        onLose();
      } else if (g.timeLeft <= 0 && !g.finished) {
        g.finished = true;
        onWin();
      }

      setTick((t) => t + 1);
    }, TICK_MS);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleArenaClick(e: React.MouseEvent<HTMLDivElement>) {
    const g = gameRef.current;
    if (g.finished || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    const clicked = g.units.find(
      (u) => u.side === 'player' && !u.dead && Math.hypot(u.x - px, u.y - py) < 6
    );
    if (clicked) {
      g.selectedId = clicked.id;
      setTick((t) => t + 1);
      return;
    }
    if (g.selectedId !== null) {
      const selected = g.units.find((u) => u.id === g.selectedId);
      if (selected) {
        selected.targetX = Math.min(ARENA_BOUNDS.xMax, Math.max(ARENA_BOUNDS.xMin, px));
        selected.targetY = Math.min(ARENA_BOUNDS.yMax, Math.max(ARENA_BOUNDS.yMin, py));
      }
      setTick((t) => t + 1);
    }
  }

  const g = gameRef.current;
  const healthPct = Math.max(0, Math.min(100, g.health));
  const timePct = Math.max(0, (g.timeLeft / cfg.duration) * 100);
  const now = performance.now();

  return (
    <div className="war-game">
      <div className="war-hud">
        <div className="war-health">
          <span className="war-health-icon">❤</span>
          <div className="war-health-track">
            <div
              className={`war-health-fill ${healthPct <= 25 ? 'war-health-fill--low' : healthPct <= 55 ? 'war-health-fill--mid' : ''}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <span className="war-health-value">{Math.round(healthPct)}/100</span>
        </div>
        <div className="war-timer-track">
          <div className="war-timer-fill" style={{ width: `${timePct}%` }} />
        </div>
      </div>

      <div className="war-objective">
        Defiende el castillo durante {cfg.duration}s · <span className="war-objective-you">Verde = tuyo</span> ·{' '}
        <span className="war-objective-enemy">Rojo = enemigo</span>
      </div>

      <div className="war-arena" ref={arenaRef} onClick={handleArenaClick}>
        <div className="war-base" style={{ left: `${BASE.x}%`, top: `${BASE.y}%` }}>
          <PixelIcon icon="castle" size={40} />
          <span className="war-base-label">Tu castillo</span>
        </div>
        <div className="war-breach-line" style={{ top: `${BREACH_Y}%` }} />

        {g.units.map((u) => {
          const hpPct = Math.max(0, (u.hp / u.maxHp) * 100);
          const hit = now < u.flashUntil;
          const selected = g.selectedId === u.id;
          return (
            <div
              key={u.id}
              className={`war-unit war-unit--${u.side} ${hit ? 'war-unit--hit' : ''} ${selected ? 'war-unit--selected' : ''}`}
              style={{ left: `${u.x}%`, top: `${u.y}%` }}
            >
              <span className={`war-unit-badge war-unit-badge--${u.kind}`} />
              <span className="war-unit-label">{LABELS[u.kind]}</span>
              <div className="war-unit-hp-track">
                <div
                  className={`war-unit-hp-fill ${u.side === 'enemy' ? 'war-unit-hp-fill--enemy' : ''}`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>
          );
        })}

        {briefingVisible && (
          <div
            className="war-briefing"
            onClick={(e) => {
              e.stopPropagation();
              dismissBriefing();
            }}
          >
            <div className="war-briefing-box">
              <p className="war-briefing-title">⚔ La Guerra en las Fronteras</p>
              <p className="war-briefing-text">
                Defiende el castillo durante <strong>{cfg.duration} segundos</strong>.
              </p>
              <p className="war-briefing-text">
                <span className="war-objective-you">● Verde</span> son tus tropas.{' '}
                <span className="war-objective-enemy">● Rojo</span> son los enemigos.
              </p>
              <p className="war-briefing-text">
                Toca una de tus unidades para seleccionarla y luego toca el mapa para moverla y
                enfrentar a los enemigos antes de que lleguen al castillo.
              </p>
              <p className="war-briefing-tap">Toca para empezar</p>
            </div>
          </div>
        )}
      </div>

      <p className="war-hint">Toca una unidad para seleccionarla, luego toca el mapa para moverla.</p>
    </div>
  );
}
