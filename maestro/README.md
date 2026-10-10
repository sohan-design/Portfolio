# Maestro — Home dashboard

Pixel-faithful recreation of Figma node `169:510` (Home).

## Stack

Vite + vanilla TypeScript + CSS. No React.

## Develop

```bash
cd maestro
npm install
npm run dev
```

## Paper shaders

UV regions use Figma bitmaps + CSS blur for fidelity. Mount points:

- `[data-shader-mount="up-next"]`
- `[data-shader-mount="practice-0"…]`

Each includes `<canvas data-shader-canvas>`. Attach `@paper-design/shaders` / Paper MCP locally via `window.__maestroShaders` (see `src/shaders.ts`).

## Design

https://www.figma.com/design/cRl1JkLjUcTShY9YQorLeW/Maestro-Pilot?node-id=169-510
