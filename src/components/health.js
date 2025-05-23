/**
 * HealthComponent for managing health, damage, and death.
 * Attach to any entity that needs health logic.
 */
import Component from '../engine/component.js';

export default class HealthComponent extends Component {
    constructor(maxHealth = 100) {
        super();
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }

    init(entity) {
        entity.health = this.health;
        entity.maxHealth = this.maxHealth;
    }

    /**
     * Deal damage to the entity.
     * @param {Entity} entity 
     * @param {number} amount 
     * @param {Game} game 
     */
    takeDamage(entity, amount, game) {
        this.health -= amount;
        entity.health = this.health;
        if (this.health <= 0) {
            this.onDeath(entity, game);
        }
    }

    /**
     * Called when health reaches zero.
     * Override for custom death logic.
     */
    onDeath(entity, game) {
        entity.state = 'destroyed';
        // Optionally remove from game or trigger effects
        // game.removeEntity(entity);
    }
}