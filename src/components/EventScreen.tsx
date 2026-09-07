import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getEvent } from '../data/events';
import { getCharacter } from '../data/characters';
import { getLocation } from '../data/locations';
import { getDragon } from '../data/dragons';
import { SceneBackground, type SceneBg } from './SceneBackground';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import { getBossForChapter } from '../data/bosses';
import { DAMAGE_WRONG_ANSWER, HEAL_CORRECT_ANSWER } from '../state/GameContext';
import type { DecisionOption } from '../types';
import './EventScreen.css';

export function EventScreen({ eventId }: { eventId: string }) {
  const { state, dispatch } = useGame();
  const event = getEvent(eventId);
  const location = event ? getLocation(event.locationId) : undefined;

  const [stepIndex, setStepIndex] = useState(0);
  const [decisionResult, setDecisionResult] = useState<DecisionOption | null>(null);
  const [answered, setAnswered] = useState<{ index: number; correct: boolean } | null>(null);
  const [background, setBackground] = useState<SceneBg>('castle');

  const step = event?.steps[stepIndex];

  // Cerrojo síncrono contra doble disparo (doble-tap táctil, doble
  // evento de click, etc.): sin esto una sola pulsación podría aplicar
  // el daño o la recompensa de una decisión/pregunta dos veces.
  const actionLockRef = useRef(false);
  useEffect(() => {
    actionLockRef.current = false;
  }, [stepIndex]);

  useEffect(() => {
    if (step?.type === 'narration' && step.background) {
      setBackground(step.background);
    }
  }, [step]);

  useEffect(() => {
    if (step?.type === 'reward' && event) {
      dispatch({ type: 'APPLY_REWARD', reward: step, eventId: event.id });
      audio.reward();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  if (!event || !step) {
    return null;
  }

  function goNext() {
    audio.pageTurn();
    setDecisionResult(null);
    setAnswered(null);
    setStepIndex((i) => i + 1);
  }

  function handleFinish() {
    audio.click();
    if (event!.nextEventId) {
      dispatch({ type: 'PLAY_EVENT', eventId: event!.nextEventId });
      return;
    }
    const boss = getBossForChapter(event!.chapterId);
    if (boss && state.save && !state.save.defeatedBossIds.includes(boss.id)) {
      dispatch({ type: 'PLAY_BOSS', bossId: boss.id });
      return;
    }
    dispatch({ type: 'EXIT_EVENT' });
  }

  const pendingBoss = !event.nextEventId ? getBossForChapter(event.chapterId) : undefined;
  const bossPending = Boolean(pendingBoss && state.save && !state.save.defeatedBossIds.includes(pendingBoss.id));
  const survivedWrongAnswer = (state.sessionHealth ?? state.save?.health ?? 0) > 0;

  return (
    <div className="event-screen fade-in">
      <SceneBackground variant={background} showDragon={false}>
        <div className="event-header">
          <span className="event-header-year">{event.year}</span>
          <span className="event-header-sep">·</span>
          <span className="event-header-loc">{location?.name}</span>
          <h2 className="title-font event-header-title">{event.title}</h2>
        </div>
      </SceneBackground>

      <div className="event-box-wrap">
        {step.type === 'narration' && (
          <div className="rpg-panel event-box slide-up">
            <p className="event-narration-text">{step.text}</p>
            <button className="btn btn-small event-continue" onClick={goNext}>
              Continuar
            </button>
          </div>
        )}

        {step.type === 'dialogue' && (
          <div className="rpg-panel event-box slide-up">
            <p className="event-speaker">{getCharacter(step.speakerId)?.name ?? step.speakerId}</p>
            <p className="event-dialogue-text">&ldquo;{step.text}&rdquo;</p>
            <button className="btn btn-small event-continue" onClick={goNext}>
              Continuar
            </button>
          </div>
        )}

        {step.type === 'decision' && !decisionResult && (
          <div className="rpg-panel event-box slide-up">
            <p className="event-prompt">{step.prompt}</p>
            <div className="decision-options">
              {step.options.map((opt) => (
                <button
                  key={opt.id}
                  className="btn btn-small decision-btn"
                  onClick={() => {
                    if (actionLockRef.current) return;
                    actionLockRef.current = true;
                    audio.select();
                    setDecisionResult(opt);
                    dispatch({
                      type: 'RECORD_DECISION',
                      eventId: event.id,
                      optionId: opt.id,
                      knowledgeBonus: opt.knowledgeBonus ?? 0,
                    });
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step.type === 'decision' && decisionResult && (
          <div className="rpg-panel event-box slide-up">
            <p className="event-narration-text">{decisionResult.resultText}</p>
            {decisionResult.knowledgeBonus ? (
              <p className="event-reward-line">+{decisionResult.knowledgeBonus} Conocimiento</p>
            ) : null}
            <button className="btn btn-small event-continue" onClick={goNext}>
              Continuar
            </button>
          </div>
        )}

        {step.type === 'question' && !answered && (
          <div className="rpg-panel event-box slide-up">
            <p className="event-prompt">{step.prompt}</p>
            <div className="question-options">
              {step.options.map((opt, i) => (
                <button
                  key={i}
                  className="btn btn-small question-btn"
                  onClick={() => {
                    if (actionLockRef.current) return;
                    actionLockRef.current = true;
                    const correct = i === step.correctIndex;
                    setAnswered({ index: i, correct });
                    dispatch({ type: 'RECORD_ANSWER', correct });
                    if (correct) audio.success();
                    else audio.error();
                  }}
                >
                  <span className="question-letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step.type === 'question' && answered && answered.correct && (
          <div className="rpg-panel event-box slide-up">
            <p className="question-verdict question-verdict--ok">
              CORRECTO · +10 Conocimiento · +{HEAL_CORRECT_ANSWER} <span className="heart-icon">❤</span>
            </p>
            <p className="event-narration-text">{step.explanation}</p>
            <button className="btn btn-small event-continue" onClick={goNext}>
              Continuar
            </button>
          </div>
        )}

        {step.type === 'question' && answered && !answered.correct && (
          <div className="rpg-panel event-box slide-up">
            <p className="question-verdict question-verdict--bad">
              INCORRECTO · -{DAMAGE_WRONG_ANSWER} <span className="heart-icon">❤</span>
            </p>
            <p className="event-narration-text">
              <strong>Respuesta correcta:</strong> {step.options[step.correctIndex]}
            </p>
            <p className="event-narration-text">{step.explanation}</p>
            {survivedWrongAnswer ? (
              <button
                className="btn btn-small event-continue"
                onClick={() => {
                  audio.click();
                  actionLockRef.current = false;
                  setAnswered(null);
                }}
              >
                Inténtalo de Nuevo
              </button>
            ) : (
              <button
                className="btn btn-primary event-continue"
                onClick={() => {
                  audio.deny();
                  dispatch({ type: 'SET_SCREEN', screen: 'defeat' });
                }}
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {step.type === 'reward' && (
          <div className="rpg-panel event-box slide-up event-reward-box">
            <p className="event-reward-title">Acontecimiento completado</p>
            <p className="event-narration-text">{step.text}</p>
            <div className="event-reward-grid">
              <span>+{step.knowledge} Conocimiento</span>
              <span>+{step.experience} Experiencia</span>
            </div>
            {(step.unlockCharacterIds?.length || step.unlockDragonIds?.length || step.unlockLocationIds?.length) && (
              <div className="event-unlocks">
                {step.unlockCharacterIds?.map((id) => {
                  const c = getCharacter(id);
                  return c ? (
                    <span key={id} className="unlock-chip">
                      <PixelIcon icon={c.portrait} size={22} /> {c.name}
                    </span>
                  ) : null;
                })}
                {step.unlockDragonIds?.map((id) => {
                  const d = getDragon(id);
                  return d ? (
                    <span key={id} className="unlock-chip">
                      <PixelIcon icon={d.portrait} size={22} /> {d.name}
                    </span>
                  ) : null;
                })}
                {step.unlockLocationIds?.map((id) => {
                  const loc = getLocation(id);
                  return loc ? (
                    <span key={id} className="unlock-chip">
                      <PixelIcon icon={loc.icon} size={22} /> {loc.name} desbloqueado
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {event.tvOnlyNote && <p className="event-tv-note">⚠ {event.tvOnlyNote}</p>}
            <button className="btn btn-primary event-continue" onClick={handleFinish}>
              {event.nextEventId ? 'Siguiente Acontecimiento' : bossPending ? 'Enfrentar al Jefe del Capítulo' : 'Volver al Mapa'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
