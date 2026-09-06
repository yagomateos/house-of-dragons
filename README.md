# Crónica de Poniente

Aventura narrativa en pixel art 16-bit sobre la historia de Poniente: del reinado de Viserys I (*La Casa del Dragón*) al final de *Juego de Tronos*.

El jugador crea un viajero cronista, recorre un mapa de Poniente, revive acontecimientos históricos jugables (narración, diálogos, decisiones y preguntas) y va desbloqueando personajes, dragones y localizaciones en la Enciclopedia y la Cronología.

## Estado de esta versión

Vertical slice completo y jugable: menú, creación de personaje, mapa, el Capítulo 1 completo ("La Danza de los Dragones", 5 acontecimientos), preguntas, decisiones, cronología, enciclopedia, logros y guardado automático en `localStorage`. La arquitectura de datos (`src/data/`) está pensada para añadir los siguientes capítulos sin tocar los componentes.

## Tecnología

- React + TypeScript + Vite
- CSS puro (sin frameworks de UI)
- `localStorage` para el guardado (sin backend)
- Pixel art propio dibujado por CSS (sin imágenes externas)
- Audio retro sintetizado con la Web Audio API (sin archivos de sonido)
- PWA instalable (manifest + service worker vía `vite-plugin-pwa`)

## Desarrollo

```bash
yarn install
yarn dev
```

## Build de producción

```bash
yarn build
yarn preview
```

## Regenerar los iconos de la PWA

```bash
yarn generate-icons
```
