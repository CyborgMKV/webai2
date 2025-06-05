/**
 * PhysicsComponent - Adds Rapier physics simulation to entities
 * Handles rigid body creation and physics properties
 */
import Component from '../engine/component.js';

export default class PhysicsComponent extends Component {
    constructor(options = {}) {
        super();
        this.bodyType = options.bodyType || 'dynamic'; // 'static', 'kinematic', 'dynamic'
        this.shape = options.shape || 'box'; // 'box', 'sphere', 'capsule'
        this.size = options.size || { x: 1, y: 1, z: 1 };
        this.mass = options.mass || 1;
        this.lockRotation = options.lockRotation || false;
        this.rigidBody = null;
        this.collider = null;
    }

    init(entity) {
        // Physics will be initialized when PhysicsManager is available
        this.entity = entity;
    }    /**
     * Initialize physics body when PhysicsManager becomes available
     */
    initPhysics(physicsManager) {
        if (!physicsManager || !physicsManager.isEnabled()) return;

        // Create rigid body
        this.rigidBody = physicsManager.createRigidBody(this.entity, this.bodyType, {
            mass: this.mass,
            lockRotation: this.lockRotation
        });

        // Create collider
        this.collider = physicsManager.createCollider(this.entity, this.shape, this.size, this.rigidBody);

        // For space game, only zero out initial velocity for non-controllable entities
        // Player and other controllable entities should be able to move via input
        if (this.rigidBody && this.entity.type !== 'player') {
            this.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
            this.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }

        console.log(`PhysicsComponent: Initialized physics for entity ${this.entity.type || 'unknown'}`);
    }

    /**
     * Apply force to the physics body
     */
    applyForce(force, point = null) {
        if (this.rigidBody) {
            if (point) {
                this.rigidBody.addForceAtPoint(force, point, true);
            } else {
                this.rigidBody.addForce(force, true);
            }
        }
    }

    /**
     * Apply impulse to the physics body
     */
    applyImpulse(impulse, point = null) {
        if (this.rigidBody) {
            if (point) {
                this.rigidBody.applyImpulseAtPoint(impulse, point, true);
            } else {
                this.rigidBody.applyImpulse(impulse, true);
            }
        }
    }

    /**
     * Set velocity of the physics body
     */
    setVelocity(velocity) {
        if (this.rigidBody) {
            this.rigidBody.setLinvel(velocity, true);
        }
    }

    /**
     * Get current velocity
     */
    getVelocity() {
        if (this.rigidBody) {
            return this.rigidBody.linvel();
        }
        return { x: 0, y: 0, z: 0 };
    }

    /**
     * Set position of the physics body
     */
    setPosition(position) {
        if (this.rigidBody) {
            this.rigidBody.setTranslation(position, true);
        }
    }

    /**
     * Get current position
     */
    getPosition() {
        if (this.rigidBody) {
            return this.rigidBody.translation();
        }
        return this.entity.position || { x: 0, y: 0, z: 0 };
    }

    update(entity, deltaTime, game) {
        // Physics update is handled by PhysicsManager
        // This component just provides an interface to physics properties
    }

    destroy(entity) {
        // Cleanup is handled by PhysicsManager when entity is removed
        this.rigidBody = null;
        this.collider = null;
    }
}
