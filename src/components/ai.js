/**
 * AIComponent for simple autonomous behavior.
 * Attach to flyingRobot or other entities for basic AI.
 */
import Component from '../engine/component.js';

export default class AIComponent extends Component {
    constructor(options = {}) {
        super();
        this.behavior = options.behavior || 'chase'; // 'chase', 'patrol', 'random', etc.
        this.target = options.target || null; // Entity to chase or interact with
        this.speed = options.speed || 2;
    }

    update(entity, deltaTime, game) {
        if (this.behavior === 'chase' && this.target) {
            // Move toward the target (e.g., player)
            const dx = this.target.position.x - entity.position.x;
            const dy = this.target.position.y - entity.position.y;
            const dz = this.target.position.z - entity.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
            entity.velocity.x = (dx / dist) * this.speed;
            entity.velocity.y = (dy / dist) * this.speed;
            entity.velocity.z = (dz / dist) * this.speed;
        }
        // Add more behaviors as needed
    }
}