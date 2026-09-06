import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { characters } from '../data/characters';
import { dragons } from '../data/dragons';
import { locations } from '../data/locations';
import { houses } from '../data/houses';
import { events } from '../data/events';
import { getCharacter } from '../data/characters';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import type { IconKey } from '../types';
import './EncyclopediaScreen.css';

type Tab = 'personajes' | 'casas' | 'dragones' | 'lugares' | 'acontecimientos';

interface Entry {
  id: string;
  icon: IconKey;
  name: string;
  subtitle?: string;
  unlocked: boolean;
  description?: string;
  lines?: string[];
  tvOnlyNote?: string;
}

export function EncyclopediaScreen() {
  const { state } = useGame();
  const { save } = state;
  const [tab, setTab] = useState<Tab>('personajes');
  const [detail, setDetail] = useState<Entry | null>(null);

  const discoveredChars = new Set(save?.discoveredCharacterIds ?? []);
  const discoveredDragons = new Set(save?.discoveredDragonIds ?? []);
  const unlockedLocations = new Set(save?.unlockedLocationIds ?? []);
  const completedEvents = new Set(save?.completedEventIds ?? []);

  let entries: Entry[] = [];

  if (tab === 'personajes') {
    entries = characters.map((c) => ({
      id: c.id,
      icon: c.portrait,
      name: c.name,
      subtitle: c.house,
      unlocked: discoveredChars.has(c.id),
      description: c.description,
      lines: [`Periodo: ${c.periodLabel}`, `Estado: ${c.status}`],
      tvOnlyNote: c.tvOnlyNote,
    }));
  } else if (tab === 'casas') {
    entries = houses.map((h) => {
      const unlocked = characters.some(
        (c) => discoveredChars.has(c.id) && h.matchKeys.some((k) => c.house.includes(k))
      );
      return {
        id: h.id,
        icon: h.icon,
        name: h.name,
        subtitle: h.seat,
        unlocked,
        description: h.description,
        lines: [`Asiento: ${h.seat}`, `Lema: "${h.words}"`],
      };
    });
  } else if (tab === 'dragones') {
    entries = dragons.map((d) => ({
      id: d.id,
      icon: d.portrait,
      name: d.name,
      subtitle: d.rider,
      unlocked: discoveredDragons.has(d.id),
      description: d.description,
      lines: [`Jinete: ${d.rider}`, `Tamaño: ${d.sizeLabel}`, `Periodo: ${d.periodLabel}`, `Estado: ${d.status}`],
      tvOnlyNote: d.tvOnlyNote,
    }));
  } else if (tab === 'lugares') {
    entries = locations.map((l) => ({
      id: l.id,
      icon: l.icon,
      name: l.name,
      subtitle: l.periodLabel,
      unlocked: unlockedLocations.has(l.id),
      description: l.description,
      lines: [`Periodo: ${l.periodLabel}`],
    }));
  } else {
    entries = events.map((e) => ({
      id: e.id,
      icon: 'scroll',
      name: e.title,
      subtitle: e.year,
      unlocked: completedEvents.has(e.id),
      description: e.summary,
      lines: [
        `Año: ${e.year}`,
        `Personajes: ${e.characterIds.map((id) => getCharacter(id)?.name ?? id).join(', ')}`,
      ],
      tvOnlyNote: e.tvOnlyNote,
    }));
  }

  return (
    <div className="ency-screen fade-in">
      <div className="ency-header">
        <h2 className="title-font map-title">Enciclopedia de Poniente</h2>
      </div>

      <div className="ency-tabs">
        {(
          [
            ['personajes', 'Personajes'],
            ['casas', 'Casas'],
            ['dragones', 'Dragones'],
            ['lugares', 'Lugares'],
            ['acontecimientos', 'Sucesos'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            className={`ency-tab ${tab === id ? 'ency-tab--active' : ''}`}
            onClick={() => {
              audio.click();
              setTab(id);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ency-grid">
        {entries.map((e) => (
          <button
            key={e.id}
            className={`ency-card ${e.unlocked ? '' : 'ency-card--locked'}`}
            onClick={() => {
              if (!e.unlocked) {
                audio.deny();
                return;
              }
              audio.select();
              setDetail(e);
            }}
          >
            <PixelIcon icon={e.icon} size={40} silhouette={!e.unlocked} />
            <span className="ency-card-name">{e.unlocked ? e.name : '???'}</span>
            {e.unlocked && e.subtitle && <span className="ency-card-sub">{e.subtitle}</span>}
          </button>
        ))}
      </div>

      {detail && (
        <div className="location-modal-backdrop" onClick={() => setDetail(null)}>
          <div className="rpg-panel location-modal slide-up" onClick={(ev) => ev.stopPropagation()}>
            <div className="location-modal-header">
              <PixelIcon icon={detail.icon} size={48} />
              <div>
                <h3 className="title-font location-modal-name">{detail.name}</h3>
                {detail.subtitle && <p className="location-modal-period">{detail.subtitle}</p>}
              </div>
            </div>
            {detail.description && <p className="location-modal-desc">{detail.description}</p>}
            {detail.lines && (
              <ul className="ency-detail-lines">
                {detail.lines.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            )}
            {detail.tvOnlyNote && <p className="event-tv-note">⚠ {detail.tvOnlyNote}</p>}
            <button
              className="btn btn-ghost"
              onClick={() => {
                audio.click();
                setDetail(null);
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
