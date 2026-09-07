import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { chapters } from '../data/chapters';
import { getEvent } from '../data/events';
import { getBossForChapter } from '../data/bosses';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import './TimelineScreen.css';

export function TimelineScreen() {
  const { state, dispatch } = useGame();
  const { save } = state;
  const [detailEventId, setDetailEventId] = useState<string | null>(null);

  const completedIds = save?.completedEventIds ?? [];
  const currentEventId = save?.currentEventId;

  const detailEvent = detailEventId ? getEvent(detailEventId) : null;

  return (
    <div className="timeline-screen fade-in">
      <div className="timeline-header">
        <h2 className="title-font map-title">Cronología de Poniente</h2>
      </div>

      <div className="timeline-scroll">
        <div className="timeline-line" />
        {chapters.map((chapter) => (
          <div key={chapter.id} className="timeline-chapter-block">
            <div className="timeline-chapter-label">
              <span className="timeline-chapter-order">Capítulo {chapter.order}</span>
              <span className="timeline-chapter-title">{chapter.title}</span>
              <span className="timeline-chapter-range">{chapter.yearRangeLabel}</span>
            </div>

            {chapter.eventIds.length === 0 && (
              <div className="timeline-card timeline-card--locked timeline-card--future">
                <PixelIcon icon="scroll" size={28} />
                <div>
                  <p className="timeline-card-year">{chapter.yearRangeLabel}</p>
                  <p className="timeline-card-title">Aún no disponible en esta versión</p>
                </div>
              </div>
            )}

            {chapter.eventIds.map((eid) => {
              const ev = getEvent(eid);
              if (!ev) return null;
              const completed = completedIds.includes(eid);
              const isCurrent = currentEventId === eid;
              const unlocked = completed || isCurrent;
              return (
                <button
                  key={eid}
                  className={`timeline-card ${unlocked ? '' : 'timeline-card--locked'} ${
                    completed ? 'timeline-card--done' : ''
                  }`}
                  onClick={() => {
                    audio.click();
                    setDetailEventId(eid);
                  }}
                  disabled={!unlocked}
                >
                  <PixelIcon icon={completed ? 'crown' : unlocked ? 'flame' : 'map-pin'} size={28} />
                  <div className="timeline-card-body">
                    <p className="timeline-card-year">{ev.year}</p>
                    <p className="timeline-card-title">{unlocked ? ev.title : '???'}</p>
                  </div>
                  {completed && <span className="timeline-card-check">✓</span>}
                </button>
              );
            })}

            {(() => {
              const boss = getBossForChapter(chapter.id);
              if (!boss || chapter.eventIds.length === 0) return null;
              const lastEventId = chapter.eventIds[chapter.eventIds.length - 1];
              const bossUnlocked = completedIds.includes(lastEventId);
              if (!bossUnlocked) return null;
              const bossDefeated = save?.defeatedBossIds.includes(boss.id) ?? false;
              return (
                <button
                  key={boss.id}
                  className="timeline-card timeline-card--boss"
                  onClick={() => {
                    audio.click();
                    dispatch({ type: 'PLAY_BOSS', bossId: boss.id });
                  }}
                >
                  <PixelIcon icon={boss.icon} size={28} />
                  <div className="timeline-card-body">
                    <p className="timeline-card-year">Jefe del capítulo</p>
                    <p className="timeline-card-title">{boss.name}</p>
                  </div>
                  <span className="timeline-card-boss-status">{bossDefeated ? '✓ Reenfrentar' : 'Enfrentar'}</span>
                </button>
              );
            })()}
          </div>
        ))}
      </div>

      {detailEvent && (
        <div className="location-modal-backdrop" onClick={() => setDetailEventId(null)}>
          <div className="rpg-panel location-modal slide-up" onClick={(e) => e.stopPropagation()}>
            <p className="location-modal-period">{detailEvent.year}</p>
            <h3 className="title-font location-modal-name">{detailEvent.title}</h3>
            <p className="location-modal-desc">{detailEvent.summary}</p>
            {detailEvent.tvOnlyNote && <p className="event-tv-note">⚠ {detailEvent.tvOnlyNote}</p>}
            <div className="timeline-detail-actions">
              <button
                className="btn btn-small"
                onClick={() => {
                  audio.select();
                  dispatch({ type: 'PLAY_EVENT', eventId: detailEvent.id });
                  setDetailEventId(null);
                }}
              >
                Revivir acontecimiento
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => {
                  audio.click();
                  setDetailEventId(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
