# Game Master System: Design Overview (Version 3)

## 1. Introduction

The Game Master (GM) system is a central component responsible for managing the overall flow, state, rules, and progression of the game. It acts as the "brain" or "director" of the game session, orchestrating events, tracking player progress, and enforcing the defined game mechanics. By centralizing this logic, we aim for a more modular, manageable, and extensible codebase. This system will allow for easier implementation of different game modes, levels, scoring systems, and dynamic events in the future.

## 2. Summary of Responsibilities

The Game Master system will handle the following core areas:

*   **Game Mode Initialization & Management:**
    *   Loads and interprets the configuration for a specific game mode (e.g., "Timed Survival," "Objective Collection") selected by the player or system.
    *   Manages the lifecycle of the active game mode.
*   **Game State Management:**
    *   Controls transitions between various game states such as `MainMenu`, `Loading`, `Countdown`, `Playing` (with mode-specific sub-states like `BossIntro` if needed), `Paused`, `RoundOver`, and `GameOver`.
    *   Ensures that game logic and player interactions behave appropriately for the current state and active game mode.
*   **Round/Level Progression (within a game mode):**
    *   Manages the sequence of rounds or levels, including initialization, starting, ending, and transitioning between them, as defined by the active game mode's configuration.
    *   Tracks objectives specific to each round/level.
*   **Scoring and Player Progression:**
    *   Maintains player scores, lives, and other relevant progression metrics based on rules from the active game mode.
    *   Provides a centralized way to update and query these values.
*   **Dynamic Entity Management & Spawning:**
    *   Governs the spawning of game entities (e.g., enemies, power-ups, objective items) during active gameplay. This is driven by the active game mode's configuration (e.g., timed waves, spawn patterns, specific boss encounters).
    *   Requests entity creation via the `Game` class, specifying entity types (as strings from config) and initial properties.
*   **Game Rules and Logic Enforcement:**
    *   Acts as the definitive authority for game-specific rules dictated by the active game mode, including win/loss conditions, time limits, and special conditions.
    *   Processes gameplay events from entities to evaluate rule adherence and game progression.
*   **Configuration Hub:**
    *   Utilizes the `gameConfig.json` (specifically the section for the active game mode) to allow designers to easily tweak parameters related to game rules, scoring, entity behavior, and level structure.

## 3. Key Interactions

The Game Master will interact with several other game systems:

*   **`Game` Class:**
    *   Instantiates the `GameMaster`.
    *   Informs the GM which game mode to initialize using its specific configuration block from `gameConfig.json`.
    *   The main game loop in `Game.js` calls `gameMaster.update(deltaTime)`.
    *   Provides services to the GM, such as `game.spawnEntityByType(typeString, options)`.
*   **`Player` & Other `Entities`:**
    *   Entities report significant gameplay events to the GM (e.g., `itemCollected`, `enemyDefeated`, `playerDamaged`, `bossHealthChanged`) via a method like `game.gameMaster.reportEvent(eventName, eventData)`.
    *   The GM may query entity states or provide directives based on game mode logic.
*   **UI System:**
    *   UI elements listen to GM events (e.g., `onGameStateChange`, `onScoreUpdated`) to update displays.
    *   User input from UI elements (like "Start Game" buttons for a specific mode) will trigger actions within the GM (often via the `Game` class).
*   **`PluginLoader`:**
    *   Indirectly. The GM tells the `Game` class *what* to spawn (by type string from config). The `Game` class might then use the `PluginLoader` if that entity type is defined in a plugin, or instantiate it directly if it's a known core entity class.
*   **Future Systems (Physics, AI):**
    *   The GM will process events from these systems to apply game rules and consequences.

## 4. Key Methods & Event Handling by Game Master (Conceptual)

*   **Initialization & Mode Management:**
    *   `constructor(gameInstance)`
    *   `initializeMode(modeConfigObject)`: Loads rules, objectives, spawn patterns, etc., for the selected game mode.
    *   `getCurrentModeConfig()`
*   **State Management:**
    *   `startGame()`: Transitions to `Playing` state, begins current mode logic.
    *   `pauseGame()`, `resumeGame()`, `endGame(reason)`
    *   `getCurrentState()`
*   **Gameplay Logic & Updates:**
    *   `update(deltaTime)`: Manages timers, checks win/loss conditions, triggers waves, etc., based on current mode and state.
    *   `reportEvent(eventName, eventData)`: Central handler for events from entities (e.g., 'itemCollected', 'enemyDefeated', 'objectiveProgress').
*   **Scoring & Stats:**
    *   `addScore(playerId, amount)`
    *   `getPlayerScore(playerId)`
    *   `setPlayerLives(playerId, lives)`
*   **Entity Spawning (Requests to Game class):**
    *   (Internal logic would call something like) `this.game.spawnEntityByType(typeString, options)`

## 5. Key Events Emitted by Game Master (Conceptual)

*   `onGameStateChange(newState, oldState, modeId)`
*   `onScoreUpdated(playerId, newScore, changeAmount)`
*   `onNewRound(roundNumber)`
*   `onRoundOver(summary)`
*   `onGameOver(summary)`
*   `onPlayerLivesChanged(playerId, currentLives)`
*   `onObjectiveUpdate(objectiveId, status, currentProgress, targetProgress)`

## 6. Goals of this Design

*   **Decoupling:** Separate high-level game flow logic from individual entity behaviors or core engine functionalities.
*   **Mode-Driven Flexibility:** Allow different game experiences by simply changing the game mode configuration.
*   **Extensibility:** Make it easier to add new game modes, rules, levels, or scoring systems by adding new configurations and, if necessary, new logic hooks in the GM.
*   **Clarity:** Provide a clear and centralized point for understanding and managing how the game progresses and operates.
*   **Data-Driven:** Enable game designers to modify game parameters through configuration files.

## 7. Future Considerations & Advanced Systems

While this document outlines the core responsibilities and interactions of the Game Master system for initial implementation, a production-ready GM and overall game would require further design and development in several advanced areas. These include:

*   **Error Handling & Recovery:** Strategies for handling malformed configurations, recovery from invalid requests, fallback mechanisms.
*   **Timing & Synchronization Subsystem:** Frame-rate independent timers, pause/resume effects on timers, reliable scheduled events.
*   **Save/Load & Persistence Layer:** Saving/restoring game progress, player stats, mid-game saves.
*   **Performance & Scalability Optimizations:** Efficient event processing, memory management, event batching/throttling.
*   **Multiplayer Architecture & Network Synchronization:** Handling multiple players, synchronizing GM state and events.
*   **Debugging & Development Tools:** Robust logging, runtime inspection, utilities for isolated testing.
*   **Dependency Management & Initialization:** Clear startup sequence, managing dependencies between GM and other systems.
*   **Advanced Event System Architecture:** Event priority, ordering, cancellation, advanced batching/replay.
*   **Configuration Validation & Management:** Schema validation, runtime validation, config versioning, hot-reloading.
*   **Resource Management Lifecycle:** Coordinated loading/unloading of assets per game mode/level, memory cleanup, preloading.
*   **Customization & Modding Support:** Allowing extensions beyond `gameConfig.json` via plugins interacting with GM.
*   **AI/Behavioral Integration:** Deeper coordination of complex AI with GM for game events or boss behaviors.
