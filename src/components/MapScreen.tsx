import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { locations } from '../data/locations';
import { getEvent } from '../data/events';
import { chapters } from '../data/chapters';
import { bosses } from '../data/bosses';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import type { BossData, GameSaveState } from '../types';
import './MapScreen.css';

/** El jefe de un capítulo se ofrece en la localización de su último
 * acontecimiento, una vez completado — y sigue disponible para siempre
 * después, se haya superado ya o no, para poder volver a enfrentarlo.
 * Varios capítulos pueden compartir una misma localización (p. ej.
 * Desembarco del Rey), así que se devuelven todos los jefes que
 * correspondan, no solo el primero encontrado. */
function getBossesAvailableAtLocation(locationId: string, save: GameSaveState): BossData[] {
  const result: BossData[] = [];
  for (const boss of bosses) {
    const chapter = chapters.find((c) => c.id === boss.chapterId);
    if (!chapter || chapter.eventIds.length === 0) continue;
    const lastEventId = chapter.eventIds[chapter.eventIds.length - 1];
    const lastEvent = getEvent(lastEventId);
    if (!lastEvent || lastEvent.locationId !== locationId) continue;
    if (!save.completedEventIds.includes(lastEventId)) continue;
    result.push(boss);
  }
  return result;
}

/** Varios capítulos pueden compartir una misma localización (p. ej.
 * Desembarco del Rey, usada en los capítulos 2 y 5). Antes de que el
 * jugador llegue realmente a un capítulo posterior, sus acontecimientos
 * en esa localización no deben aparecer en la lista — se verían como
 * "bloqueados" junto a lo que sí toca jugar ahora, dando la falsa
 * impresión de que la historia se ha detenido ahí. */
function getReachableEventIds(eventIds: string[], save: GameSaveState): string[] {
  const currentChapter = chapters.find((c) => c.id === save.currentChapterId);
  const currentOrder = currentChapter?.order ?? Infinity;
  return eventIds.filter((id) => {
    const ev = getEvent(id);
    if (!ev) return false;
    const evChapter = chapters.find((c) => c.id === ev.chapterId);
    return !evChapter || evChapter.order <= currentOrder;
  });
}

type PinStatus = 'locked' | 'available' | 'done' | 'empty';

export function MapScreen() {
  const { state, dispatch } = useGame();
  const { save } = state;
  const [openLocationId, setOpenLocationId] = useState<string | null>(null);
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  const unlockedIds = save?.unlockedLocationIds ?? [];

  function getStatus(locationId: string, eventIds: string[]): PinStatus {
    if (!unlockedIds.includes(locationId)) return 'locked';
    // Un lugar sin acontecimientos todavía no es "disponible" — no hay
    // nada que hacer ahí, así que no debe invitar al jugador con el
    // mismo brillo dorado que un lugar con historia real que jugar.
    if (eventIds.length === 0) return 'empty';
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
  const availableBosses = openLocation && save ? getBossesAvailableAtLocation(openLocation.id, save) : [];
  const reachableEventIds = openLocation && save ? getReachableEventIds(openLocation.eventIds, save) : [];

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
          const reachableIds = save ? getReachableEventIds(loc.eventIds, save) : loc.eventIds;
          const status = getStatus(loc.id, reachableIds);
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
              {reachableEventIds.length === 0 && (
                <p className="location-empty-note">Aún no hay acontecimientos registrados en este lugar.</p>
              )}
              {reachableEventIds.map((eid) => {
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

            {availableBosses.length > 0 && (
              <div className="location-boss-block">
                <p className="location-modal-subtitle">Jefe del capítulo</p>
                {availableBosses.map((boss) => {
                  const bossDefeated = save.defeatedBossIds.includes(boss.id);
                  return (
                    <button
                      key={boss.id}
                      className="btn btn-primary location-boss-btn"
                      onClick={() => {
                        audio.click();
                        dispatch({ type: 'PLAY_BOSS', bossId: boss.id });
                        setOpenLocationId(null);
                      }}
                    >
                      <span>{boss.name}</span>
                      <span className="location-boss-btn-status">
                        {bossDefeated ? '✓ Superado · Volver a enfrentar' : 'Enfrentar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

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
