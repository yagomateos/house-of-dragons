import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { getAchievement } from '../data/achievements';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import './AchievementToast.css';

export function AchievementToast() {
  const { state, dispatch } = useGame();
  const ids = state.newlyUnlockedAchievements;

  useEffect(() => {
    if (ids.length === 0) return;
    audio.achievement();
    const t = setTimeout(() => dispatch({ type: 'CLEAR_ACHIEVEMENT_TOAST' }), 3800);
    return () => clearTimeout(t);
  }, [ids, dispatch]);

  if (ids.length === 0) return null;

  return (
    <div className="achievement-toast-stack">
      {ids.map((id) => {
        const ach = getAchievement(id);
        if (!ach) return null;
        return (
          <div key={id} className="achievement-toast slide-up">
            <PixelIcon icon="crown" size={30} />
            <div>
              <p className="achievement-toast-label">Logro desbloqueado</p>
              <p className="achievement-toast-name">{ach.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
