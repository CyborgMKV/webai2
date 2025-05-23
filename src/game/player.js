import Entity from '../engine/entity.js';

/**
 * Player entity for the game.
 * Handles movement, input, health, and extensibility.
 */
export default class Player extends Entity {
    /**
     * @param {Object} options - { position, model, health, ... }
     */
    constructor(options = {}) {
        super();
        this.type = 'player';
        this.state = 'active';
        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.velocity = options.velocity || { x: 0, y: 0, z: 0 };
        this.model = options.model || null; // THREE.Group or Mesh
        this.health = options.health || 100;
        this.maxHealth = options.maxHealth || 100;
        this.score = 0;
        this.input = options.input || null; // Input handler/component
        this.initComponents(options.components || []);
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
        // TODO: Handle player death, respawn, etc.
    }

    /**
     * Call when player scores points.
     */
    addScore(points) {
        this.score += points;
        // TODO: Update UI, trigger events, etc.
    }
}