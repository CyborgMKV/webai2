// Reminder: User will need to ensure this PluginLoader import points to the version 
// capable of handling sharks (e.g., content of pluginLoader.js).
import PluginLoader from '../engine/pluginLoader.js'; 
import PhysicsManager from '../engine/physicsManager.js';
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
        this.physicsManager = new PhysicsManager(); // Initialize physics manager
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

                // Initialize physics manager
                return this.physicsManager.init();
            })
            .then((physicsInitialized) => {
                if (physicsInitialized) {
                    console.log('Game: Physics initialized successfully');
                } else {
                    console.log('Game: Physics initialization failed, using fallback collision detection');
                }

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
    }    /**
     * Add an entity to the game.
     * The entity itself is responsible for adding its mesh to this.scene if needed.
     * @param {Entity} entity 
     */
    addEntity(entity) {
        this.entities.push(entity);
        console.log(`Game: Added entity - Name: ${entity.name || entity.type}, Type: ${entity.type}. Current entity count: ${this.entities.length}`);
        
        // Initialize physics for the entity if it has a physics component
        this.initializeEntityPhysics(entity);
        
        // If the entity has a mesh and it's not yet in a scene, and this.scene is available
        // This is an alternative place to add meshes, but entities like Shark add themselves.
        // if (entity.mesh && !entity.mesh.parent && this.scene) {
        //     console.log(`Game: Adding mesh for entity ${entity.name || entity.type} to scene in addEntity.`);
        //     this.scene.add(entity.mesh);
        // }
    }    /**
     * Remove an entity from the game.
     * Also removes the entity's mesh from the scene if it exists.
     * @param {Entity} entity 
     */
    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
        
        // Remove physics body if it exists
        this.removeEntityPhysics(entity);
        
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
        this.lastTime = now;        // Update physics simulation
        if (this.physicsManager && this.physicsManager.isEnabled()) {
            try {
                this.physicsManager.update(this.deltaTime);
                
                // Process collision events
                this.processCollisionEvents();
                
                // Initialize physics for entities that just loaded their models
                this.initializePendingPhysics();
            } catch (error) {
                console.error('Game: Error during physics update:', error);
            }
        }

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

    /**
     * Process physics collision events
     */
    processCollisionEvents() {
        if (!this.physicsManager || !this.physicsManager.isEnabled()) {
            return;
        }

        const collisionEvents = this.physicsManager.getCollisionEvents();
        
        for (const event of collisionEvents) {
            const { entity1, entity2, started } = event;
            
            if (!started) continue; // Only process new collisions
            
            // Handle projectile collisions
            if (entity1.type === 'projectile' || entity2.type === 'projectile') {
                const projectile = entity1.type === 'projectile' ? entity1 : entity2;
                const target = entity1.type === 'projectile' ? entity2 : entity1;
                
                // Don't collide with shooter
                if (target === projectile.shooter) continue;
                
                console.log(`Physics Collision: Projectile ${projectile.name} hit ${target.type}`);
                
                // Apply damage if target can take damage
                if (typeof target.takeDamage === 'function') {
                    target.takeDamage(projectile.damage);
                }
                
                // Destroy projectile
                if (typeof projectile.destroy === 'function') {
                    projectile.destroy();
                }
            }
            
            // Handle other collision types here as needed
            // For example: player-enemy, player-powerup, etc.
        }
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
    }    /**
     * Initialize physics for an entity if it has a physics component
     * @param {Entity} entity 
     */
    initializeEntityPhysics(entity) {
        if (!this.physicsManager || !this.physicsManager.isInitialized()) {
            console.log(`Game: Physics manager not ready, skipping physics initialization for ${entity.type}`);
            return;
        }

        const physicsComponent = entity.getComponent('physics');
        if (!physicsComponent) {
            return; // Entity doesn't have physics
        }

        try {
            // Set initial position from entity
            physicsComponent.position = entity.position || { x: 0, y: 0, z: 0 };
            
            // Initialize the physics body
            this.physicsManager.initializePhysicsBody(physicsComponent);
            
            // For zero-gravity space game, only zero velocity for non-controllable entities
            // Player and other movable entities should maintain ability to move
            if (physicsComponent.rigidBody && entity.type !== 'player' && entity.type !== 'flyingRobot') {
                physicsComponent.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                physicsComponent.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
            
            console.log(`Game: Initialized physics for ${entity.type} entity at position`, physicsComponent.position);
        } catch (error) {
            console.error(`Game: Failed to initialize physics for ${entity.type}:`, error);
        }
    }

    /**
     * Remove physics body for an entity
     * @param {Entity} entity 
     */
    removeEntityPhysics(entity) {
        if (!this.physicsManager || !this.physicsManager.isInitialized()) {
            return;
        }

        const physicsComponent = entity.getComponent('physics');
        if (!physicsComponent || !physicsComponent.rigidBody) {
            return;
        }

        try {
            this.physicsManager.removeRigidBody(physicsComponent.rigidBody);
            physicsComponent.rigidBody = null;
            console.log(`Game: Removed physics body for ${entity.type} entity`);
        } catch (error) {
            console.error(`Game: Failed to remove physics body for ${entity.type}:`, error);
        }
    }    /**
     * Initialize physics for entities that have loaded their models
     * This should be called periodically or when models are loaded
     */
    initializePendingPhysics() {
        if (!this.physicsManager || !this.physicsManager.isInitialized()) {
            return;
        }

        for (const entity of this.entities) {
            const physicsComponent = entity.getComponent('physics');
            if (physicsComponent && !physicsComponent.rigidBody && entity.mesh) {
                // Entity has physics component but no rigid body, and now has a mesh
                console.log(`Game: Initializing physics for ${entity.type} after model load at position`, entity.position);
                this.initializeEntityPhysics(entity);
                
                // Ensure the entity maintains its spawn position in zero gravity
                if (physicsComponent.rigidBody) {
                    physicsComponent.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    physicsComponent.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
                }
            }
        }
    }/**
     * Debug method to test physics integration
     */
    async testPhysics() {
        if (!this.physicsManager || !this.physicsManager.isInitialized()) {
            console.log('Game: Physics not available for testing');
            return;
        }

        console.log('Game: Creating physics test entity...');
        
        // Import THREE for mesh creation
        const THREE = await import('../../libs/three/three.module.js');
        
        // Create a simple test entity with physics
        const testEntity = {
            type: 'test',
            name: 'PhysicsTest',
            position: { x: 5, y: 5, z: -10 },
            mesh: null,
            components: new Map(),
            addComponent: function(name, component) {
                this.components.set(name, component);
            },
            getComponent: function(name) {
                return this.components.get(name);
            },
            update: function(deltaTime, game) {
                // Update mesh position from physics if available
                const physicsComponent = this.getComponent('physics');
                if (physicsComponent && physicsComponent.rigidBody) {
                    const pos = physicsComponent.rigidBody.translation();
                    this.position.x = pos.x;
                    this.position.y = pos.y;
                    this.position.z = pos.z;
                    if (this.mesh) {
                        this.mesh.position.set(pos.x, pos.y, pos.z);
                    }
                }
            }
        };

        // Create a visible mesh for the test entity
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        testEntity.mesh = new THREE.Mesh(geometry, material);
        testEntity.mesh.position.set(testEntity.position.x, testEntity.position.y, testEntity.position.z);
        
        // Add mesh to scene
        if (this.scene) {
            this.scene.add(testEntity.mesh);
        }

        // Add physics component
        const PhysicsComponent = (await import('../components/physics.js')).default;
        const physicsOptions = {
            type: 'dynamic',
            shape: 'box',
            size: { x: 1, y: 1, z: 1 },
            mass: 1.0
        };
        testEntity.addComponent('physics', new PhysicsComponent(physicsOptions));

        // Add to game
        this.addEntity(testEntity);
        
        console.log('Game: Physics test entity created and added - should float in space without falling');
        return testEntity;
    }

    /**
     * Check physics status for all entities - useful for debugging
     */
    checkPhysicsStatus() {
        console.log('=== Physics Status Report ===');
        console.log(`Physics Manager Initialized: ${this.physicsManager ? this.physicsManager.isInitialized() : 'No PhysicsManager'}`);
        console.log(`Total Entities: ${this.entities.length}`);
        
        let entitiesWithPhysics = 0;
        let entitiesWithRigidBodies = 0;
        
        for (const entity of this.entities) {
            const physicsComponent = entity.getComponent('physics');
            if (physicsComponent) {
                entitiesWithPhysics++;
                if (physicsComponent.rigidBody) {
                    entitiesWithRigidBodies++;
                    const pos = physicsComponent.rigidBody.translation();
                    const vel = physicsComponent.rigidBody.linvel();
                    console.log(`${entity.type}: pos(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}) vel(${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}, ${vel.z.toFixed(2)})`);
                }
            }
        }
        
        console.log(`Entities with Physics Component: ${entitiesWithPhysics}`);
        console.log(`Entities with Rigid Bodies: ${entitiesWithRigidBodies}`);
        console.log('==============================');
    }
}
