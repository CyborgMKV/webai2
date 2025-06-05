import * as THREE from '../../libs/three/three.module.js';

/**
 * Base Entity class for all game objects.
 * Supports components and update loop.
 */
export default class Entity {
    constructor(options = {}) {
        this.components = {};
        this.position = options.position ? 
            new THREE.Vector3(options.position.x || 0, options.position.y || 0, options.position.z || 0) :
            new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || { x: 0, y: 0, z: 0 };
        this.scale = options.scale || { x: 1, y: 1, z: 1 };
        this.type = options.type || 'entity';
        this.model = options.model || null; // THREE.Mesh or Group
    }

    addComponent(name, instance) {
        this.components[name] = instance;
        if (instance.init) instance.init(this);
    }
    
    getComponent(name) {
        return this.components[name];
    }

    update(deltaTime, game) {
        for (const name in this.components) {
            const comp = this.components[name];
            if (comp.update) comp.update(this, deltaTime, game);
        }
    }
}