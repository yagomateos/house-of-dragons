import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.tsx';
import { GameProvider } from './state/GameContext';
import { audio, markInteracted } from './utils/audio';

// El tema en 8-bit arranca en cuanto el navegador lo permita. Si la
// página aún no ha recibido ningún gesto del usuario, el propio
// navegador retiene el audio hasta el primer toque/clic/tecla: por eso
// además escuchamos el primer gesto para reintentarlo justo entonces.
audio.startTheme();
function unlockThemeOnFirstGesture() {
  markInteracted();
  audio.startTheme();
}
window.addEventListener('pointerdown', unlockThemeOnFirstGesture, { once: true });
window.addEventListener('keydown', unlockThemeOnFirstGesture, { once: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>
);
