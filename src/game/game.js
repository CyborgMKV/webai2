// Reminder: User will need to ensure this PluginLoader import points to the version 
// capable of handling sharks (e.g., content of pluginLoader.js).
import PluginLoader from '../engine/pluginLoader.js'; 
import GameMaster from './gameMaster.js';
import FlyingRobot from './flyingRobot.js';
import Heart from './heart.js'; 
// Assuming player.js is the intended final version, not player.new.js for this integration.
import Player from './player.js'; 

/**
 * Main Game class.
 * Manages entities, plugins, game loop, core systems, and game configuration via GameMaster.
 * Now designed to be instantiated with an App instance to get access to the main scene.
 */
export default class Game {
    constructor(app, options = {}) { // Modified constructor: Added 'app'
        this.app = app; // Store the app instance
        this.scene = app.scene; // Convenient direct access to the scene
        
        console.log("Game: Initializing with App instance. Scene available:", !!this.scene);

        this.entities = [];
        this.pluginLoader = new PluginLoader(this); // 'this' is the game instance
        this.gameMaster = null; 
        this.config = null;
        this.running = false;
        this.lastTime = performance.now();
        this.deltaTime = 0;
        this.options = options; // Game specific options (currently not used much, but good for future)
        this.player = null; // Player entity

        // Mock effects manager for plugin compatibility
        // Consider if App should provide this or if a dedicated EffectsManager is better.
        if (!this.effects) {
            this.effects = {
                _effects: {},
                register: function(effectConfig) {
                    console.log('Game.effects.register called with:', effectConfig);
                    this._effects[effectConfig.name] = effectConfig;
                },
                get: function(name) {
                    return this._effects[name];
                }
            };
            console.log("Game: Initialized mock 'effects' manager for plugin compatibility.");
        }

        // Load game configuration, then initialize GameMaster, then load plugins
        this.loadConfig('src/config/gameConfig.json')
            .then(() => {
                console.log('Game: Game config loaded successfully:', this.config);
                
                // Notify the App instance that config is loaded, if it has a handler
                if (this.app && typeof this.app.gameConfigLoaded === 'function') {
                   this.app.gameConfigLoaded(this.config);
                }

                this.gameMaster = new GameMaster(this.config);
                console.log('Game: GameMaster instance created:', this.gameMaster);

                // Load example plugin
                console.log('Game: Proceeding to load examplePlugin.json.');
                return this.pluginLoader.load('src/plugins/examplePlugin.json');
            })
            .then(() => {
                console.log('Game: examplePlugin.json load attempt finished.');
                
                // Load shark plugin
                // Assuming 'sharkPlugin.json' is the final name. 
                // If previous steps created 'sharkPlugin.new.json', that path should be used.
                console.log('Game: Proceeding to load sharkPlugin.json.');
                return this.pluginLoader.load('src/plugins/sharkPlugin.json');
            })
            .then(() => {
                console.log('Game: sharkPlugin.json load attempt finished.');
                // All plugins processed. Game is ready for further setup or start.
            })
            .catch(error => {
                console.error('Game: Error during initial setup (config, GameMaster, or plugin loading):', error);
            });
    }

    /**
     * Load game configuration from a JSON file.
     * @param {string} configPath - Path to the configuration file.
     */
    async loadConfig(configPath) {
        try {
            const response = await fetch(configPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${configPath}`);
            }
            this.config = await response.json();
        } catch (error) {
            console.error(`Game: Could not load game config from ${configPath}:`, error);
            throw error; 
        }
    }

    /**
     * Add an entity to the game.
     * The entity itself is responsible for adding its mesh to this.scene if needed.
     * @param {Entity} entity 
     */
    addEntity(entity) {
        this.entities.push(entity);
        console.log(`Game: Added entity - Name: ${entity.name || entity.type}, Type: ${entity.type}. Current entity count: ${this.entities.length}`);
        // If the entity has a mesh and it's not yet in a scene, and this.scene is available
        // This is an alternative place to add meshes, but entities like Shark add themselves.
        // if (entity.mesh && !entity.mesh.parent && this.scene) {
        //     console.log(`Game: Adding mesh for entity ${entity.name || entity.type} to scene in addEntity.`);
        //     this.scene.add(entity.mesh);
        // }
    }

    /**
     * Remove an entity from the game.
     * Also removes the entity's mesh from the scene if it exists.
     * @param {Entity} entity 
     */
    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
        if (entity.mesh && entity.mesh.parent === this.scene) { // Check if it's in *this* scene
            this.scene.remove(entity.mesh);
            console.log(`Game: Removed mesh for entity ${entity.name || entity.type} from scene.`);
        }
        console.log(`Game: Removed entity - Name: ${entity.name || entity.type}. Remaining entities: ${this.entities.length}`);
    }

    /**
     * Start the game loop.
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        console.log("Game: Starting main loop.");
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Main game loop.
     */
    loop() {
        if (!this.running) return;
        const now = performance.now();
        this.deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        for (const entity of this.entities) {
            if (typeof entity.update === 'function') {
                entity.update(this.deltaTime, this); // Pass 'this' (game instance)
            }
        }

        this.pluginLoader.callHook('onUpdate', this.deltaTime, this);
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Stop the game loop.
     */
    stop() {
        this.running = false;
        console.log("Game: Stopping main loop.");
    }

    // --- Spawning methods ---
    // These are typically called by plugins or game logic.
    // Options passed here can be from plugin JSON or hardcoded.

    /**
     * Spawn a new flyingRobot.
     * @param {Object} options 
     */
    spawnFlyingRobot(options = {}) {
        // Could use GameMaster here to get default config for flyingRobot
        // const defaultConfig = (this.gameMaster && this.gameMaster.getFlyingRobotConfig()) || {};
        // const finalOptions = { ...defaultConfig, ...options };
        const robot = new FlyingRobot(options); // Pass combined options
        this.addEntity(robot);
        return robot;
    }

    /**
     * Spawn a new heart.
     * @param {Object} options 
     */
    spawnHeart(options = {}) {
        // const defaultConfig = (this.gameMaster && this.gameMaster.getHeartConfig()) || {};
        // const finalOptions = { ...defaultConfig, ...options };
        const heart = new Heart(options); // Pass combined options
        this.addEntity(heart);
        return heart;
    }

    /**
     * Set the player entity.
     * @param {Player} player 
     */
    setPlayer(player) {
        // If there's an existing player, remove it first
        if (this.player) {
            this.removeEntity(this.player);
        }
        this.player = player;
        this.addEntity(player); // Player is also an entity
        console.log("Game: Player set:", player);
    }

    /**
     * Returns the GameMaster instance.
     * @returns {GameMaster | null}
     */
    getGameMaster() {
        return this.gameMaster;
    }
}
