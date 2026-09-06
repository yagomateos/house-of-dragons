import { useGame } from '../state/GameContext';
import { audio } from '../utils/audio';
import { SceneBackground } from './SceneBackground';
import './DefeatScreen.css';

export function DefeatScreen() {
  const { dispatch } = useGame();

  return (
    <SceneBackground variant="snow" showDragon={false}>
      <div className="defeat-screen">
        <p className="defeat-eyebrow">💀</p>
        <h2 className="title-font defeat-title">HAS CAÍDO</h2>
        <p className="defeat-text">
          Tu viaje por Poniente termina aquí, por ahora. Tu partida guardada sigue intacta: no has perdido
          ningún capítulo ya completado.
        </p>
        <div className="defeat-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              audio.reward();
              dispatch({ type: 'RETRY_ATTEMPT' });
            }}
          >
            Reintentar Nivel
          </button>
          <button
            className="btn"
            onClick={() => {
              audio.click();
              dispatch({ type: 'CONTINUE_GAME' });
            }}
          >
            Reintentar desde el Último Guardado
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              audio.click();
              dispatch({ type: 'ABANDON_ATTEMPT' });
            }}
          >
            Volver al Mapa
          </button>
        </div>
      </div>
    </SceneBackground>
  );
}
