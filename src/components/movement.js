/**
 * MovementComponent for velocity-based movement.
 * Attach to any entity that should move each frame.
 */
import Component from '../engine/component.js';

export default class MovementComponent extends Component {
    constructor() {
        super();
    }

    update(entity, deltaTime, game) {
        if (!entity.velocity) return;
        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
        entity.position.z += entity.velocity.z * deltaTime;

        if (entity.model) {
            entity.model.position.set(entity.position.x, entity.position.y, entity.position.z);
        }
    }
}