import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { getChapter } from '../data/chapters';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import './HUD.css';

export function HUD() {
  const { state, dispatch } = useGame();
  const { save } = state;
  const [confirmingExit, setConfirmingExit] = useState(false);

  const chapter = save ? getChapter(save.currentChapterId) : undefined;

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
      <button
        className="hud-menu-btn"
        onClick={goToMenu}
        title="Volver al menú principal"
        aria-label="Volver al menú principal"
      >
        <PixelIcon icon="scroll" size={22} />
        <span className="hud-menu-label">Menú</span>
      </button>

      {save && (
        <div className="hud-stats">
          <div className="hud-item">
            <span className="hud-label">Capítulo</span>
            <span className="hud-value">{chapter ? chapter.order : '-'}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Año</span>
            <span className="hud-value">{save.currentYear}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Vida</span>
            <span className="hud-value hud-value--red">{save.health}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Conocimiento</span>
            <span className="hud-value hud-value--gold">{save.knowledge}</span>
          </div>
          <div className="hud-item hud-item--hide-mobile">
            <span className="hud-label">Experiencia</span>
            <span className="hud-value">{save.experience}</span>
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
                  dispatch({ type: 'EXIT_EVENT' });
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
