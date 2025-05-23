/**
 * CollisionComponent for simple bounding-sphere collision detection.
 * Attach to any entity that needs a hitbox.
 */
import Component from '../engine/component.js';

export default class CollisionComponent extends Component {
    /**
     * @param {number} radius - Collision radius for the entity.
     */
    constructor(radius = 1) {
        super();
        this.radius = radius;
    }

    init(entity) {
        entity.collisionRadius = this.radius;
    }

    /**
     * Check collision with another entity.
     * @param {Entity} entity 
     * @param {Entity} other 
     * @returns {boolean}
     */
    isColliding(entity, other) {
        if (!other.position || !entity.position) return false;
        const dx = entity.position.x - other.position.x;
        const dy = entity.position.y - other.position.y;
        const dz = entity.position.z - other.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const combined = (entity.collisionRadius || 1) + (other.collisionRadius || 1);
        return distSq <= combined * combined;
    }
}