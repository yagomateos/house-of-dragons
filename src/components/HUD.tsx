import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getChapter } from '../data/chapters';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import './HUD.css';

export function HUD() {
  const { state, dispatch, displayHealth } = useGame();
  const { save } = state;
  const [confirmingExit, setConfirmingExit] = useState(false);
  const [hurt, setHurt] = useState(false);
  const prevHealth = useRef(displayHealth);

  useEffect(() => {
    if (displayHealth < prevHealth.current) {
      setHurt(true);
      const t = setTimeout(() => setHurt(false), 400);
      prevHealth.current = displayHealth;
      return () => clearTimeout(t);
    }
    prevHealth.current = displayHealth;
  }, [displayHealth]);

  const chapter = save ? getChapter(save.currentChapterId) : undefined;
  const healthPct = Math.max(0, Math.min(100, displayHealth));
  const healthTone = healthPct <= 25 ? 'hud-health--low' : healthPct <= 55 ? 'hud-health--mid' : '';

  function goToMenu() {
    audio.click();
    if (state.screen === 'event') {
      setConfirmingExit(true);
      return;
    }
    dispatch({ type: 'SET_SCREEN', screen: 'start' });
  }

  return (
    <div className="hud fade-in">
      <div className="hud-row hud-row--top">
        <button
          className="hud-menu-btn"
          onClick={goToMenu}
          title="Volver al menú principal"
          aria-label="Volver al menú principal"
        >
          <PixelIcon icon="scroll" size={20} />
          <span className="hud-menu-label">Menú</span>
        </button>

        {save && (
          <div className="hud-chapter-year">
            <span className="hud-chapter">Capítulo {chapter ? chapter.order : '-'}</span>
            <span className="hud-year">{save.currentYear}</span>
          </div>
        )}
      </div>

      {save && (
        <div className={`hud-row hud-row--stats ${hurt ? 'hud-row--hurt' : ''}`}>
          <div className="hud-health-block">
            <span className="hud-health-label">❤</span>
            <div className="hud-health-track">
              <div className={`hud-health-fill ${healthTone}`} style={{ width: `${healthPct}%` }} />
            </div>
            <span className="hud-health-value">{Math.round(displayHealth)}/100</span>
          </div>
          <div className="hud-mini-stat">
            <span className="hud-mini-label">📚</span>
            <span className="hud-mini-value">{save.knowledge}</span>
          </div>
          <div className="hud-mini-stat">
            <span className="hud-mini-label">⭐</span>
            <span className="hud-mini-value">{save.experience}</span>
          </div>
        </div>
      )}

      {confirmingExit && (
        <div className="hud-confirm-backdrop" onClick={() => setConfirmingExit(false)}>
          <div className="rpg-panel hud-confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>¿Salir al menú principal? Tu progreso ya guardado no se perderá.</p>
            <div className="hud-confirm-actions">
              <button
                className="btn btn-primary btn-small"
                onClick={() => {
                  audio.click();
                  setConfirmingExit(false);
                  dispatch({ type: 'ABANDON_ATTEMPT' });
                  dispatch({ type: 'SET_SCREEN', screen: 'start' });
                }}
              >
                Salir
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => {
                  audio.deny();
                  setConfirmingExit(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
