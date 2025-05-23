# Contributing to WebAI Arcade Game

Thank you for your interest in contributing!  
Please read and follow these guidelines to keep the project consistent and maintainable.

## Coding Standards

- Use ES6+ JavaScript (TypeScript in the future).
- One class/component per file.
- Use JSDoc for all public functions/classes.
- Prefer descriptive variable and function names.
- Use async/await for asynchronous code.

## Architecture

- All game entities (player, flyingRobot, heart, etc.) use the entity/component system.
- Add new features as plugins (JSON or JS) or as components.
- Use the state machine pattern for entity behaviors.
- Prefer event-driven logic (emit/listen for game events).
- Use JSON/config for levels, spawn rates, and settings.

## UI/UX

- Use modular UI components (HUD, minimap, notifications, etc.).
- Place UI logic in `src/components/`.

## Plugins

- Place plugins in `src/plugins/`.
- Use the provided plugin templates (`pluginTemplate.js` and `pluginTemplate.json`).
- Document your plugin with JSDoc and comments.

## Testing & Onboarding

- Use the model/animation tester in `src/tools/` for asset/plugin QA.
- Update `.github/instructions/ultimateplan.instructions.md` if you add new architectural features.

## Submitting Changes

1. Fork the repo and create a new branch.
2. Make your changes, following the standards above.
3. Test your changes locally.
4. Submit a pull request with a clear description.

---

For more details, see [Ultimate Plan & Coding Standards](.github/instructions/ultimateplan.instructions.md).