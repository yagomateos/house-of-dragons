import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { getBoss } from '../data/bosses';
import { getCharacter } from '../data/characters';
import { getLocation } from '../data/locations';
import { chapters } from '../data/chapters';
import { PixelIcon } from './PixelIcon';
import { DragonDodgeGame } from './minigames/DragonDodgeGame';
import { audio } from '../utils/audio';
import type { Difficulty } from '../types';
import './BossScreen.css';

type Phase = 'intro' | 'playing' | 'won' | 'lost';

const DIFFICULTY_LABELS: { id: Difficulty; label: string }[] = [
  { id: 'facil', label: 'Fácil' },
  { id: 'normal', label: 'Normal' },
  { id: 'dificil', label: 'Difícil' },
];

export function BossScreen({ bossId }: { bossId: string }) {
  const { state, dispatch } = useGame();
  const boss = getBoss(bossId);
  const [phase, setPhase] = useState<Phase>('intro');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [attempt, setAttempt] = useState(0);
  const [rewardApplied, setRewardApplied] = useState(false);

  if (!boss || !state.save) return null;

  const currentHealth = state.sessionHealth ?? state.save.health;

  function handleWin() {
    audio.achievement();
    if (!rewardApplied) {
      dispatch({ type: 'DEFEAT_BOSS', bossId: boss!.id });
      setRewardApplied(true);
    }
    setPhase('won');
  }

  function handleLose() {
    audio.error();
    // Se descarta el daño de este intento: el punto de guardado no se
    // toca, así que el jugador vuelve a intentarlo con la vida de su
    // última partida guardada, no con 0.
    dispatch({ type: 'DISCARD_BOSS_ATTEMPT' });
    setPhase('lost');
  }

  function handleRetry() {
    audio.click();
    dispatch({ type: 'RESTART_BOSS_ATTEMPT' });
    setAttempt((a) => a + 1);
    setPhase('playing');
  }

  function handleExitToMap() {
    audio.click();
    dispatch({ type: 'EXIT_BOSS' });
  }

  function handleBackToLastLevel() {
    audio.click();
    const chapter = chapters.find((c) => c.id === boss!.chapterId);
    const lastEventId = chapter?.eventIds[chapter.eventIds.length - 1];
    if (lastEventId) {
      dispatch({ type: 'PLAY_EVENT', eventId: lastEventId });
    } else {
      dispatch({ type: 'EXIT_BOSS' });
    }
  }

  return (
    <div className="boss-screen fade-in">
      {(phase === 'intro' || phase === 'playing') && (
        <button className="boss-exit-btn" onClick={handleExitToMap} title="Salir al mapa" aria-label="Salir al mapa">
          ✕
        </button>
      )}

      {phase === 'intro' && (
        <div className="boss-intro">
          <p className="boss-eyebrow">⚔ Jefe Final</p>
          <h2 className="title-font boss-title">{boss.title}</h2>
          <div className="boss-portrait pulse-gold">
            <PixelIcon icon={boss.icon} size={110} />
          </div>
          <p className="boss-name">{boss.name}</p>
          <p className="boss-tagline">&ldquo;{boss.tagline}&rdquo;</p>

          <p className="boss-health-preview">
            Llegas con <span className="heart-icon">❤ {currentHealth}/100</span>
          </p>

          <div className="boss-difficulty">
            <p className="boss-difficulty-label">Dificultad</p>
            <div className="boss-difficulty-options">
              {DIFFICULTY_LABELS.map((d) => (
                <button
                  key={d.id}
                  className={`btn btn-small ${difficulty === d.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    audio.click();
                    setDifficulty(d.id);
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary boss-start-btn"
            onClick={() => {
              audio.reward();
              setPhase('playing');
            }}
          >
            Comenzar
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <DragonDodgeGame
          key={attempt}
          difficulty={difficulty}
          dragonIcon={boss.icon}
          startingHealth={currentHealth}
          onDamage={(value) => dispatch({ type: 'SET_SESSION_HEALTH', value })}
          onWin={handleWin}
          onLose={handleLose}
        />
      )}

      {phase === 'won' && (
        <div className="boss-result">
          <p className="boss-result-title boss-result-title--win">¡HAS SOBREVIVIDO AL DRAGÓN!</p>
          <p className="boss-result-text">{boss.victoryText}</p>
          <div className="boss-reward-grid">
            <span>+{boss.rewards.knowledge} Conocimiento</span>
            <span>+{boss.rewards.experience} Experiencia</span>
          </div>
          {(boss.rewards.unlockCharacterIds?.length || boss.rewards.unlockLocationIds?.length) && (
            <div className="event-unlocks">
              {boss.rewards.unlockCharacterIds?.map((id) => {
                const c = getCharacter(id);
                return c ? (
                  <span key={id} className="unlock-chip">
                    <PixelIcon icon={c.portrait} size={22} /> {c.name}
                  </span>
                ) : null;
              })}
              {boss.rewards.unlockLocationIds?.map((id) => {
                const loc = getLocation(id);
                return loc ? (
                  <span key={id} className="unlock-chip">
                    <PixelIcon icon={loc.icon} size={22} /> {loc.name} desbloqueado
                  </span>
                ) : null;
              })}
            </div>
          )}
          <p className="boss-result-sub">Capítulo completado.</p>
          <button className="btn btn-primary boss-start-btn" onClick={handleExitToMap}>
            Continuar
          </button>
        </div>
      )}

      {phase === 'lost' && (
        <div className="boss-result">
          <p className="boss-result-title boss-result-title--lose">HAS SIDO DERROTADO</p>
          <p className="boss-result-text">
            El dragón resulta demasiado fiero esta vez. Tu progreso del capítulo está a salvo: puedes
            volver a intentarlo cuando quieras, con la vida de tu última partida guardada.
          </p>
          <div className="boss-result-actions">
            <button className="btn btn-primary" onClick={handleRetry}>
              Reintentar
            </button>
            <button className="btn btn-ghost" onClick={handleBackToLastLevel}>
              Volver al Último Nivel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
