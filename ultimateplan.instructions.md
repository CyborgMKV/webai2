---
applyTo: '**'
---

# Ultimate Plan & Coding Standards

## Coding Standards
- Use ES6+ JavaScript (or TypeScript in future).
- Modular file structure: one class/component per file.
- Use JSDoc for all public functions/classes.
- Prefer descriptive variable and function names.
- Use async/await for async code.

## Architecture & Extensibility
- All game entities (player, flyingRobot, heart, etc.) use a component/entity system.
- Use a plugin system for new entities, effects, UI, and controls. Plugins can be JSON or JS modules.
- State machine pattern for entity behaviors.
- Event-driven logic (emit/listen for game events).
- Config-driven: use JSON/config for levels, spawn rates, etc.

## Game Design & Features
- Arcade mode first, extensible to open world/multiplayer.
- Radar/minimap, lock-on, camera modes, haptics, audio, fonts.
- Modular flyingRobot with detachable parts and heart.
- Particle effects for explosions, heart, etc.
- Animation manager for all animated models.
- Animation/asset testing tool as part of onboarding for plugins.

## Performance
- Dynamic quality scaling: auto-detect device and adjust lighting, shadows, and effects.
- Use instancing, LOD, and culling for large numbers of objects.
- Allow user override for performance/quality.

## UI/UX
- 3D HUD, minimap/radar, countdowns, and notifications in Three.js.
- Player info/preferences page.
- Online leaderboard and event calendar.

## Multiplayer (future)
- Architect entities and events for network sync.
- Player IDs, chat, and replay support.

## Onboarding & Testing
- Animation/asset testing tool for static and animated models.
- Plugin onboarding: clear API and documentation for adding new features.

---

*Update this file as the project evolves. Reference it in PRs and onboarding docs.*