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

Thank you for your interest in contributing! Please follow these guidelines:

### Coding Standards
- Use ES6+ JavaScript (TypeScript in the future)
- One class/component per file
- Use JSDoc for all public functions/classes
- Prefer descriptive variable and function names
- Use async/await for asynchronous code

### Architecture
- All game entities use the entity/component system
- Add new features as plugins (JSON or JS) or as components
- Use the state machine pattern for entity behaviors
- Prefer event-driven logic (emit/listen for game events)
- Use JSON/config for levels, spawn rates, and settings

### Development
- Place plugins in `src/plugins/` using the provided templates
- Place UI logic in `src/components/`
- Use the model/animation tester in `src/tools/` for asset/plugin QA
- Test changes locally before submitting

For detailed architecture and coding standards, see [Ultimate Plan](.github/instructions/ultimateplan.instructions.md).

---

*For onboarding, see plugin templates in `src/plugins/` and the asset/model tester in `src/tools/`.*