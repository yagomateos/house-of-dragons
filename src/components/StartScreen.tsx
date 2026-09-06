import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { SceneBackground } from './SceneBackground';
import { audio, hasInteracted, onFirstInteraction } from '../utils/audio';
import './StartScreen.css';

export function StartScreen() {
  const { dispatch, hasSave } = useGame();
  const [confirmingNew, setConfirmingNew] = useState(false);
  const [showSoundHint, setShowSoundHint] = useState(!hasInteracted());

  useEffect(() => onFirstInteraction(() => setShowSoundHint(false)), []);

  function handleNewGame() {
    audio.click();
    if (hasSave) {
      setConfirmingNew(true);
      return;
    }
    dispatch({ type: 'SET_SCREEN', screen: 'create' });
  }

  function handleContinue() {
    audio.click();
    dispatch({ type: 'CONTINUE_GAME' });
  }

  function goTo(screen: 'timeline' | 'encyclopedia' | 'settings') {
    audio.click();
    dispatch({ type: 'SET_SCREEN', screen });
  }

  return (
    <SceneBackground variant="throne">
      <div className="start-screen">
        <div className="start-title-block fade-in">
          <h1 className="title-font start-title">CRÓNICA DE PONIENTE</h1>
          <p className="start-subtitle ui-font">
            Del fuego de los Targaryen al final del Trono de Hierro
          </p>
        </div>

        <div className="start-menu slide-up">
          <button className="btn btn-primary" onMouseEnter={() => audio.hover()} onClick={handleNewGame}>
            Nueva Partida
          </button>
          <button
            className="btn"
            disabled={!hasSave}
            onMouseEnter={() => hasSave && audio.hover()}
            onClick={handleContinue}
            title={hasSave ? 'Continuar tu partida guardada' : 'No hay ninguna partida guardada'}
          >
            Continuar
          </button>
          <button className="btn btn-small btn-ghost" onMouseEnter={() => audio.hover()} onClick={() => goTo('timeline')}>
            Cronología
          </button>
          <button className="btn btn-small btn-ghost" onMouseEnter={() => audio.hover()} onClick={() => goTo('encyclopedia')}>
            Enciclopedia
          </button>
          <button className="btn btn-small btn-ghost" onMouseEnter={() => audio.hover()} onClick={() => goTo('settings')}>
            Ajustes
          </button>
        </div>

        {showSoundHint && (
          <p className="start-sound-hint ui-font pulse-gold">🔊 Toca un botón para activar la música</p>
        )}

        <p className="start-footer ui-font">129 d.C. — El reino aguarda su Danza</p>
      </div>

      {confirmingNew && (
        <div className="hud-confirm-backdrop" onClick={() => setConfirmingNew(false)}>
          <div className="rpg-panel hud-confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>Ya tienes una partida guardada. Empezar una nueva la sobrescribirá para siempre. ¿Continuar?</p>
            <div className="hud-confirm-actions">
              <button
                className="btn btn-primary btn-small"
                onClick={() => {
                  audio.click();
                  setConfirmingNew(false);
                  dispatch({ type: 'SET_SCREEN', screen: 'create' });
                }}
              >
                Sí, empezar de nuevo
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => {
                  audio.deny();
                  setConfirmingNew(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </SceneBackground>
  );
}
