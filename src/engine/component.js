/**
 * Base class for all components in the ECS.
 * Extend this for HUD, Minimap, etc.
 */
export default class Component {
   // update(deltaTime) {
   // for (const entity of this.entities) {
   //     if (typeof entity.update === 'function') {
   //         entity.update(deltaTime, this);
   //     }
  //  }
//}
    /**
     * Called when the component is added to an entity.
     * @param {Entity} entity
     */
    init(entity) {}

    /**
     * Called every frame.
     * @param {Entity} entity
     * @param {number} deltaTime
     * @param {Game} game
     */
    update(entity, deltaTime, game) {}

    /**
     * Called when the component is removed or the entity is destroyed.
     * @param {Entity} entity
     */
    destroy(entity) {}
}