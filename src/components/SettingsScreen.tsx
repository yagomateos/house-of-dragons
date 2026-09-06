import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { audio, getAudioPrefs, setAudioPrefs } from '../utils/audio';
import { isInstallable, isInstalled, isIOS, promptInstall, subscribeInstallState } from '../utils/pwaInstall';
import './SettingsScreen.css';

export function SettingsScreen() {
  const { state, dispatch, hasSave } = useGame();
  const [prefs, setPrefs] = useState(getAudioPrefs);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [installTick, setInstallTick] = useState(0);

  useEffect(() => subscribeInstallState(() => setInstallTick((t) => t + 1)), []);

  function toggle(key: 'music' | 'sfx') {
    const next = { ...prefs, [key]: !prefs[key] };
    audio.rawBlip(next[key]);
    setPrefs(next);
    setAudioPrefs(next);
    if (key === 'music') audio.setMusicEnabled(next.music);
  }

  function handleBack() {
    audio.click();
    dispatch({ type: 'SET_SCREEN', screen: state.save ? 'map' : 'start' });
  }

  function handleReset() {
    audio.click();
    dispatch({ type: 'RESET_GAME' });
  }

  async function handleInstall() {
    audio.click();
    await promptInstall();
  }

  return (
    <div className="settings-screen fade-in">
      <div className="settings-header">
        <h2 className="title-font map-title">Ajustes</h2>
      </div>

      <div className="rpg-panel settings-panel">
        <div className="settings-row">
          <span>Música</span>
          <button className={`toggle ${prefs.music ? 'toggle--on' : ''}`} onClick={() => toggle('music')}>
            {prefs.music ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="settings-row">
          <span>Efectos de sonido</span>
          <button className={`toggle ${prefs.sfx ? 'toggle--on' : ''}`} onClick={() => toggle('sfx')}>
            {prefs.sfx ? 'ON' : 'OFF'}
          </button>
        </div>
        <p className="settings-note">
          Sonidos de ambiente y efectos retro generados en el propio juego, sin archivos externos. El
          navegador exige un primer toque o clic antes de dejar sonar cualquier audio.
        </p>

        <div className="settings-divider" />

        <p className="settings-label" key={installTick}>
          Instalar en el dispositivo
        </p>
        {isInstalled() ? (
          <p className="settings-note">✓ Ya tienes Crónica de Poniente instalada como app.</p>
        ) : isInstallable() ? (
          <button className="btn btn-primary" onClick={handleInstall}>
            Instalar como App
          </button>
        ) : isIOS() ? (
          <p className="settings-note">
            En iPhone/iPad: pulsa el botón compartir de Safari (□↑) y elige "Añadir a pantalla de inicio".
          </p>
        ) : (
          <p className="settings-note">
            Tu navegador aún no ofrece instalación automática. Navega un poco por el sitio o usa el menú
            del navegador (⋮) → "Instalar aplicación".
          </p>
        )}

        <div className="settings-divider" />

        <p className="settings-note">
          Partida guardada: {hasSave ? 'sí' : 'no'}
        </p>

        {!confirmingReset ? (
          <button
            className="btn btn-ghost"
            disabled={!hasSave}
            onClick={() => {
              audio.click();
              setConfirmingReset(true);
            }}
          >
            Borrar partida
          </button>
        ) : (
          <div className="settings-confirm">
            <p>¿Seguro que quieres borrar tu partida? Esta acción no se puede deshacer.</p>
            <div className="settings-confirm-actions">
              <button className="btn btn-primary btn-small" onClick={handleReset}>
                Sí, borrar
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => {
                  audio.deny();
                  setConfirmingReset(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="btn" onClick={handleBack}>
        Volver
      </button>
    </div>
  );
}
