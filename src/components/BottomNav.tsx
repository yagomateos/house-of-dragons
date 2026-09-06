import { useGame } from '../state/GameContext';
import type { ScreenId } from '../types';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import './BottomNav.css';

const ITEMS: { screen: ScreenId; label: string; icon: 'map-pin' | 'scroll' | 'book' }[] = [
  { screen: 'map', label: 'Mapa', icon: 'map-pin' },
  { screen: 'timeline', label: 'Cronología', icon: 'scroll' },
  { screen: 'encyclopedia', label: 'Enciclopedia', icon: 'book' },
];

export function BottomNav() {
  const { state, dispatch } = useGame();

  return (
    <nav className="bottom-nav fade-in">
      {ITEMS.map((item) => (
        <button
          key={item.screen}
          className={`bottom-nav-btn ${state.screen === item.screen ? 'bottom-nav-btn--active' : ''}`}
          onClick={() => {
            audio.click();
            dispatch({ type: 'SET_SCREEN', screen: item.screen });
          }}
        >
          <PixelIcon icon={item.icon} size={26} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
