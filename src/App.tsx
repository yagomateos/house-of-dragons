import { useGame } from './state/GameContext';
import { StartScreen } from './components/StartScreen';
import { CharacterCreation } from './components/CharacterCreation';
import { MapScreen } from './components/MapScreen';
import { EventScreen } from './components/EventScreen';
import { BossScreen } from './components/BossScreen';
import { DefeatScreen } from './components/DefeatScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { EncyclopediaScreen } from './components/EncyclopediaScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HUD } from './components/HUD';
import { BottomNav } from './components/BottomNav';
import { AchievementToast } from './components/AchievementToast';

function App() {
  const { state } = useGame();
  const { screen, save, viewingEventId, viewingBossId, retryToken } = state;

  const showHud = screen !== 'start' && screen !== 'create' && screen !== 'boss' && screen !== 'defeat';
  const showBottomNav = Boolean(save) && ['map', 'timeline', 'encyclopedia'].includes(screen);

  return (
    <div className="app-root">
      {showHud && <HUD />}
      <AchievementToast />

      {screen === 'start' && <StartScreen />}
      {screen === 'create' && <CharacterCreation />}
      {screen === 'map' && save && <MapScreen />}
      {screen === 'event' && viewingEventId && (
        <EventScreen key={`${viewingEventId}-${retryToken}`} eventId={viewingEventId} />
      )}
      {screen === 'boss' && viewingBossId && <BossScreen key={viewingBossId} bossId={viewingBossId} />}
      {screen === 'defeat' && <DefeatScreen />}
      {screen === 'timeline' && <TimelineScreen />}
      {screen === 'encyclopedia' && <EncyclopediaScreen />}
      {screen === 'settings' && <SettingsScreen />}

      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default App;
