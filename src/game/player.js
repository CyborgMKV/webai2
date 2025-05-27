import Entity from '../engine/entity.js';

/**
 * Player entity for the game.
 * Handles movement, input, health, and extensibility.
 */
export default class Player extends Entity {
    /**
     * @param {Object} options - { position, model, health, maxHealth, game, ... }
     */
    constructor(options = {}) {
        super();
        this.type = 'player';
        this.state = 'active';
        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.velocity = options.velocity || { x: 0, y: 0, z: 0 };
        this.model = options.model || null; // THREE.Group or Mesh
        
        let initialMaxHealth = 100; // Default maxHealth

        // Prioritize game config for maxHealth if game instance and config are passed in options
        if (options.game && 
            options.game.config && 
            options.game.config.player && 
            typeof options.game.config.player.maxHealth === 'number') {
            initialMaxHealth = options.game.config.player.maxHealth;
            console.log(`Player: Using maxHealth from game.config: ${initialMaxHealth}`);
        } else if (typeof options.maxHealth === 'number') {
            initialMaxHealth = options.maxHealth;
            console.log(`Player: Using maxHealth from options: ${initialMaxHealth}`);
        } else {
            console.log(`Player: Using default maxHealth: ${initialMaxHealth}`);
        }
        
        this.maxHealth = initialMaxHealth;
        // Initialize health to maxHealth, unless options.health is specifically provided
        this.health = (typeof options.health === 'number') ? options.health : this.maxHealth;

        this.score = 0;
        this.input = options.input || null; // Input handler/component
        this.initComponents(options.components || []);

        console.log(`Player initialized with health: ${this.health}/${this.maxHealth}`);
    }

    /**
     * Attach initial components.
     */
    initComponents(components) {
        for (const { name, instance } of components) {
            this.addComponent(name, instance);
        }
    }

    /**
     * Called every frame.
     */
    update(deltaTime, game) {
        // Example: update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Update model position
        if (this.model) {
            this.model.position.set(this.position.x, this.position.y, this.position.z);
        }

        // Handle input (if using a component, this can be handled there)
        // TODO: Add input handling logic or delegate to input component

        super.update(deltaTime, game);
    }

    /**
     * Call when player takes damage.
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        console.log(`Player health: ${this.health}/${this.maxHealth}`);
        // TODO: Handle player death, respawn, etc.
        if (this.health === 0) {
            console.log("Player has died.");
            // Potentially set this.state = 'dead'; or call a game over method on the game instance
        }
    }

    /**
     * Call when player scores points.
     */
    addScore(points) {
        this.score += points;
        // TODO: Update UI, trigger events, etc.
    }
}
