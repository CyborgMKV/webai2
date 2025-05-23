# WebAI Arcade Game

A modular, extensible WebGL/Three.js arcade game with plugin support, entity/component system, and modern UI.

## Features

- Entity/component architecture for all game objects
- Plugin system (JSON or JS) for new entities, effects, UI, and controls
- State machine pattern for entity behaviors
- Config-driven (JSON) for levels, spawn rates, etc.
- 3D HUD, minimap/radar, countdowns, notifications
- Animation manager and asset testing tool
- Dynamic quality scaling and performance options
- Online leaderboard and event calendar
- Easy onboarding for new plugins and assets

## Folder Structure

```
src/
  app.js
  index.js
  engine/
  game/
  components/
  plugins/
  config/
  tools/
  utils/
assets/
libs/
index.html
```

## Getting Started

1. Install dependencies (if any).
2. Open `index.html` in a browser with a local server.
3. Edit or add plugins in `src/plugins/`.
4. See `.github/instructions/ultimateplan.instructions.md` for architecture and coding standards.

## Contributing

- Follow the [Ultimate Plan & Coding Standards](.github/instructions/ultimateplan.instructions.md).
- Add new features as plugins or components.
- Use JSDoc for all public classes/functions.

---

*For onboarding, see plugin templates in `src/plugins/` and the asset/model tester in `src/tools/`.*