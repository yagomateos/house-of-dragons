import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { locations } from '../data/locations';
import { getEvent } from '../data/events';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import './MapScreen.css';

type PinStatus = 'locked' | 'available' | 'done';

export function MapScreen() {
  const { state, dispatch } = useGame();
  const { save } = state;
  const [openLocationId, setOpenLocationId] = useState<string | null>(null);
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  const unlockedIds = save?.unlockedLocationIds ?? [];

  function getStatus(locationId: string, eventIds: string[]): PinStatus {
    if (!unlockedIds.includes(locationId)) return 'locked';
    if (eventIds.length === 0) return 'available';
    const allDone = eventIds.every((id) => save?.completedEventIds.includes(id));
    if (allDone) return 'done';
    return 'available';
  }

  function handlePinClick(locationId: string, status: PinStatus) {
    if (status === 'locked') {
      audio.deny();
      setLockedToast(locationId);
      setTimeout(() => setLockedToast((cur) => (cur === locationId ? null : cur)), 1800);
      return;
    }
    audio.click();
    setOpenLocationId(locationId);
  }

  const openLocation = locations.find((l) => l.id === openLocationId);

  return (
    <div className="map-screen fade-in">
      <div className="map-header">
        <h2 className="title-font map-title">Mapa de Poniente</h2>
        <p className="map-hint">Toca un lugar dorado para continuar la crónica</p>
      </div>

      <div className="map-canvas">
        <svg className="map-landmass" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2f26" />
              <stop offset="100%" stopColor="#1c211a" />
            </linearGradient>
            <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#33455e" />
              <stop offset="100%" stopColor="#22314a" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="9.5" fill="url(#iceGrad)" opacity="0.8" />
          <path
            d="M36,4 C46,2 58,3 68,8 C74,11 76,16 82,17 C88,18 92,26 91,34 C90,40 84,42 85,48 C86,55 93,58 91,66 C89,73 80,72 77,78 C73,86 62,85 56,91 C48,98 36,94 30,88 C26,84 18,85 13,78 C8,71 11,64 7,57 C3,50 5,42 9,36 C6,30 9,23 15,20 C19,18 19,12 25,9 C29,7 31,6 36,4 Z"
            fill="url(#landGrad)"
            stroke="#8a6d1a"
            strokeWidth="0.6"
            opacity="0.95"
          />
          <line x1="0" y1="9.5" x2="100" y2="9.5" stroke="#c9a227" strokeWidth="0.4" strokeDasharray="1.4 1.2" opacity="0.55" />
        </svg>

        <div className="map-mountain" style={{ left: '34%', top: '18%' }} />
        <div className="map-mountain map-mountain--sm" style={{ left: '40%', top: '15%' }} />
        <div className="map-mountain" style={{ left: '58%', top: '30%' }} />
        <div className="map-mountain map-mountain--sm" style={{ left: '63%', top: '27%' }} />

        <div className="map-compass" aria-hidden="true">
          <div className="map-compass-ring">
            <span className="map-compass-n">N</span>
          </div>
        </div>

        {locations.map((loc) => {
          const status = getStatus(loc.id, loc.eventIds);
          return (
            <button
              key={loc.id}
              className={`map-pin map-pin--${status}`}
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              onClick={() => handlePinClick(loc.id, status)}
            >
              <span className={`map-pin-badge ${status === 'available' ? 'pulse-gold' : ''}`}>
                <PixelIcon icon={loc.icon} size={26} silhouette={status === 'locked'} />
                {status === 'done' && <span className="map-pin-check">✓</span>}
                {status === 'locked' && <span className="map-pin-lock">🔒</span>}
              </span>
              <span className="map-pin-ribbon">{loc.name}</span>
              {lockedToast === loc.id && <span className="map-pin-toast">Bloqueado — continúa la historia</span>}
            </button>
          );
        })}
      </div>

      {openLocation && save && (
        <div className="location-modal-backdrop" onClick={() => setOpenLocationId(null)}>
          <div className="rpg-panel location-modal slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="location-modal-header">
              <PixelIcon icon={openLocation.icon} size={44} />
              <div>
                <h3 className="title-font location-modal-name">{openLocation.name}</h3>
                <p className="location-modal-period">{openLocation.periodLabel}</p>
              </div>
            </div>
            <p className="location-modal-desc">{openLocation.description}</p>

            <p className="location-modal-subtitle">Acontecimientos disponibles</p>
            <div className="location-events-list">
              {openLocation.eventIds.length === 0 && (
                <p className="location-empty-note">Aún no hay acontecimientos registrados en este lugar.</p>
              )}
              {openLocation.eventIds.map((eid) => {
                const ev = getEvent(eid);
                if (!ev) return null;
                const completed = save.completedEventIds.includes(eid);
                const playable = completed || save.currentEventId === eid;
                return (
                  <button
                    key={eid}
                    className={`event-list-item ${completed ? 'event-list-item--done' : ''} ${
                      !playable ? 'event-list-item--locked' : ''
                    }`}
                    disabled={!playable}
                    onClick={() => {
                      audio.select();
                      dispatch({ type: 'PLAY_EVENT', eventId: eid });
                      setOpenLocationId(null);
                    }}
                  >
                    <span className="event-list-year">{ev.year}</span>
                    <span className="event-list-title">{ev.title}</span>
                    <span className="event-list-status">
                      {completed ? '✓ Completado' : playable ? 'Entrar' : '🔒'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              className="btn btn-ghost"
              onClick={() => {
                audio.click();
                setOpenLocationId(null);
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
