import { useMemo } from 'react';
import { PixelIcon } from './PixelIcon';
import './SceneBackground.css';

export type SceneBg = 'castle' | 'throne' | 'battle' | 'sea' | 'snow' | 'hall';

interface Props {
  variant?: SceneBg;
  showDragon?: boolean;
  children?: React.ReactNode;
}

export function SceneBackground({ variant = 'castle', showDragon = true, children }: Props) {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 55,
        delay: Math.random() * 3,
        id: i,
      })),
    []
  );

  const smoke = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        left: 20 + Math.random() * 60,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2,
        id: i,
      })),
    []
  );

  const snow = useMemo(
    () =>
      Array.from({ length: 35 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 5,
        id: i,
      })),
    []
  );

  const showSnow = variant === 'snow';

  return (
    <div className={`scene-bg scene-bg--${variant}`}>
      <div className="scene-sky">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>

      {showDragon && (
        <div className="scene-dragon-fly">
          <PixelIcon icon="dragon-black" size={64} />
        </div>
      )}

      {variant === 'throne' && (
        <div className="scene-throne">
          <PixelIcon icon="iron-throne" size={140} />
        </div>
      )}

      <div className="scene-ground" />

      <div className="scene-castle">
        <PixelIcon icon="castle" size={220} />
      </div>

      <div className="scene-torch scene-torch--left">
        <div className="flicker">
          <PixelIcon icon="flame" size={36} />
        </div>
      </div>
      <div className="scene-torch scene-torch--right">
        <div className="flicker">
          <PixelIcon icon="flame" size={36} />
        </div>
      </div>

      {smoke.map((s) => (
        <div
          key={s.id}
          className="smoke-particle"
          style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}

      {showSnow &&
        snow.map((s) => (
          <div
            key={s.id}
            className="snow-particle"
            style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
          />
        ))}

      <div className="scene-vignette" />
      <div className="scene-content">{children}</div>
    </div>
  );
}
