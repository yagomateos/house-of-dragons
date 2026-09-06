import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { SceneBackground } from './SceneBackground';
import { PixelIcon } from './PixelIcon';
import { audio } from '../utils/audio';
import type { ClassId } from '../types';
import './CharacterCreation.css';

const CLASSES: { id: ClassId; name: string; desc: string; icon: 'sword' | 'scroll' | 'book' }[] = [
  {
    id: 'guerrero',
    name: 'Guerrero',
    desc: 'Curtido en combate, resiste mejor los peligros del camino.',
    icon: 'sword',
  },
  {
    id: 'explorador',
    name: 'Explorador',
    desc: 'Conoce los caminos de Poniente mejor que nadie.',
    icon: 'scroll',
  },
  {
    id: 'cronista',
    name: 'Cronista',
    desc: 'Devora libros y registros; aprende más rápido de cada suceso.',
    icon: 'book',
  },
];

export function CharacterCreation() {
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<ClassId>('cronista');

  const canStart = name.trim().length >= 2;

  function handleStart() {
    if (!canStart) return;
    audio.reward();
    dispatch({ type: 'NEW_GAME', player: { name: name.trim(), classId } });
  }

  return (
    <SceneBackground variant="hall" showDragon={false}>
      <div className="creation-screen">
        <div className="rpg-panel creation-panel fade-in">
          <h2 className="title-font creation-title">Crea tu Viajero</h2>
          <p className="creation-hint">
            Eres un viajero que recorre Poniente para presenciar y registrar su historia. No cambiarás
            el destino de reyes ni dragones, pero serás testigo de él.
          </p>

          <label className="creation-label" htmlFor="char-name">
            Nombre
          </label>
          <input
            id="char-name"
            className="creation-input"
            value={name}
            maxLength={20}
            placeholder="Escribe un nombre..."
            onChange={(e) => setName(e.target.value)}
          />

          <p className="creation-label">Elige tu vocación</p>
          <div className="class-grid">
            {CLASSES.map((c) => (
              <button
                key={c.id}
                className={`class-card ${classId === c.id ? 'class-card--active' : ''}`}
                onMouseEnter={() => audio.hover()}
                onClick={() => {
                  audio.select();
                  setClassId(c.id);
                }}
                type="button"
              >
                <PixelIcon icon={c.icon} size={40} />
                <span className="class-name">{c.name}</span>
                <span className="class-desc">{c.desc}</span>
              </button>
            ))}
          </div>

          <div className="creation-stats">
            <span>VIDA 100</span>
            <span>CONOCIMIENTO 0</span>
            <span>EXPERIENCIA 0</span>
          </div>

          <div className="creation-actions">
            <button
              className="btn btn-ghost"
              onClick={() => {
                audio.click();
                dispatch({ type: 'SET_SCREEN', screen: 'start' });
              }}
            >
              Volver
            </button>
            <button className="btn btn-primary" disabled={!canStart} onClick={handleStart}>
              Comenzar Viaje
            </button>
          </div>
        </div>
      </div>
    </SceneBackground>
  );
}
