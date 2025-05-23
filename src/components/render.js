/**
 * RenderComponent for syncing entity state with its Three.js model.
 * Attach to any entity with a model (Mesh or Group).
 */
import Component from '../engine/component.js';

export default class RenderComponent extends Component {
    constructor() {
        super();
    }

    update(entity, deltaTime, game) {
        if (!entity.model) return;
        // Sync position, rotation, and scale
        entity.model.position.set(entity.position.x, entity.position.y, entity.position.z);
        if (entity.rotation) {
            entity.model.rotation.set(entity.rotation.x, entity.rotation.y, entity.rotation.z);
        }
        if (entity.scale) {
            entity.model.scale.set(entity.scale.x, entity.scale.y, entity.scale.z);
        }
    }
}