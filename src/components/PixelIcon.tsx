import { useMemo } from 'react';
import type { IconKey } from '../types';
import { getSprite } from './sprites';

interface PixelIconProps {
  icon: IconKey;
  size?: number;
  className?: string;
  title?: string;
  /** Dibuja la silueta correcta (misma forma) en un tono oscuro uniforme, para entradas aún no descubiertas. */
  silhouette?: boolean;
}

const SILHOUETTE_COLOR = '#2c2f3a';

export function PixelIcon({ icon, size = 48, className, title, silhouette = false }: PixelIconProps) {
  const sprite = getSprite(icon);
  const rows = sprite.grid.length;
  const cols = sprite.cols;
  const unit = size / cols;

  const boxShadow = useMemo(() => {
    const shadows: string[] = [];
    sprite.grid.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === undefined) continue;
        const color = silhouette ? SILHOUETTE_COLOR : sprite.legend[ch];
        if (!color) continue;
        shadows.push(`${(x * unit).toFixed(2)}px ${(y * unit).toFixed(2)}px 0 0 ${color}`);
      }
    });
    return shadows.join(', ');
  }, [sprite, unit, silhouette]);

  return (
    <div
      className={`pixel-icon ${className ?? ''}`}
      style={{ width: size, height: rows * unit, position: 'relative', flexShrink: 0 }}
      role="img"
      aria-label={silhouette ? '???' : (title ?? icon)}
      title={title}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: Math.max(unit, 1),
          height: Math.max(unit, 1),
          boxShadow,
        }}
      />
    </div>
  );
}
