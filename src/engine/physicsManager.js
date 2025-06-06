/**
 * PhysicsManager - Integrates Rapier physics engine with the game
 * Handles physics world, rigid bodies, and collision detection
 */
import * as THREE from '../../libs/three/three.module.js';

export default class PhysicsManager {
    constructor() {
        this.world = null;
        this.RAPIER = null;
        this.initialized = false;
        this.rigidBodies = new Map(); // Entity -> RigidBody mapping
        this.colliders = new Map();   // Entity -> Collider mapping
    }

    /**
     * Initialize Rapier physics
     */
    async init() {
        try {            // Try to load Rapier from CDN first, then fallback to npm
            this.RAPIER = await import('https://cdn.skypack.dev/@dimforge/rapier3d-compat');
            
            // Use modern Rapier initialization API
            if (typeof this.RAPIER.init === 'function') {
                await this.RAPIER.init({});
            } else if (typeof this.RAPIER.default?.init === 'function') {
                await this.RAPIER.default.init({});
            }
            
            // Create physics world without gravity (space environment)
            const gravity = { x: 0.0, y: 0.0, z: 0.0 };
            this.world = new this.RAPIER.World(gravity);
            
            this.initialized = true;
            console.log('PhysicsManager: Rapier physics initialized successfully');
            return true;
        } catch (error) {
            console.warn('PhysicsManager: Failed to load Rapier from CDN, trying npm fallback:', error);            try {
                this.RAPIER = await import('@dimforge/rapier3d-compat');
                
                // Use modern Rapier initialization API
                if (typeof this.RAPIER.init === 'function') {
                    await this.RAPIER.init({});
                } else if (typeof this.RAPIER.default?.init === 'function') {
                    await this.RAPIER.default.init({});
                }
                
                const gravity = { x: 0.0, y: 0.0, z: 0.0 };
                this.world = new this.RAPIER.World(gravity);
                
                this.initialized = true;
                console.log('PhysicsManager: Rapier physics initialized successfully (npm)');
                return true;
            } catch (npmError) {
                console.error('PhysicsManager: Failed to initialize Rapier physics:', npmError);
                console.log('PhysicsManager: Falling back to existing collision detection');
                return false;
            }
        }
    }

    /**
     * Create a rigid body for an entity
     */    createRigidBody(entity, bodyType = 'dynamic', options = {}) {
        if (!this.initialized) return null;

        // Handle Vector3 or plain object position
        const position = entity.position || { x: 0, y: 0, z: 0 };
        const pos = {
            x: position.x || 0,
            y: position.y || 0, 
            z: position.z || 0
        };
        const rotation = entity.rotation || { x: 0, y: 0, z: 0, w: 1 };

        // Create rigid body descriptor
        let rigidBodyDesc;
        switch (bodyType) {
            case 'static':
                rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed();
                break;
            case 'kinematic':
                rigidBodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased();
                break;
            case 'dynamic':
            default:
                rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic();
                break;
        }

        rigidBodyDesc.setTranslation(pos.x, pos.y, pos.z);
        if (rotation.w !== undefined) {
            rigidBodyDesc.setRotation({ x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w });
        }        // Apply options
        if (options.lockRotation) rigidBodyDesc.lockRotations();

        const rigidBody = this.world.createRigidBody(rigidBodyDesc);
        this.rigidBodies.set(entity, rigidBody);
        
        // Store mass for later use in collider creation
        if (options.mass) {
            entity._physicsMass = options.mass;
        }

        return rigidBody;
    }

    /**
     * Create a collider for an entity
     */
    createCollider(entity, shape = 'box', size = { x: 1, y: 1, z: 1 }, rigidBody = null) {
        if (!this.initialized) return null;

        if (!rigidBody) {
            rigidBody = this.rigidBodies.get(entity);
        }
        if (!rigidBody) return null;

        let colliderDesc;
        switch (shape) {
            case 'sphere':
                colliderDesc = this.RAPIER.ColliderDesc.ball(size.radius || 1);
                break;
            case 'capsule':
                colliderDesc = this.RAPIER.ColliderDesc.capsule(size.height || 1, size.radius || 0.5);
                break;
            case 'box':
            default:
                colliderDesc = this.RAPIER.ColliderDesc.cuboid(
                    size.x / 2 || 0.5,
                    size.y / 2 || 0.5,
                    size.z / 2 || 0.5
                );                break;
        }

        // Set mass/density if specified with error handling for API compatibility
        if (entity._physicsMass) {
            try {
                if (typeof colliderDesc.setMass === 'function') {
                    colliderDesc.setMass(entity._physicsMass);
                } else if (typeof colliderDesc.setDensity === 'function') {
                    // If mass API not available, try density (mass will be calculated from volume)
                    colliderDesc.setDensity(entity._physicsMass);
                } else if (typeof colliderDesc.mass !== 'undefined') {
                    colliderDesc.mass = entity._physicsMass;
                } else if (typeof colliderDesc.density !== 'undefined') {
                    colliderDesc.density = entity._physicsMass;
                } else {
                    console.warn('PhysicsManager: Cannot set mass/density - API method not found');
                }
            } catch (error) {
                console.warn('PhysicsManager: Error setting mass/density:', error.message);
            }
        }

        const collider = this.world.createCollider(colliderDesc, rigidBody);
        this.colliders.set(entity, collider);

        return collider;
    }

    /**
     * Update physics simulation
     */
    update(deltaTime) {
        if (!this.initialized) return;

        // Step the physics simulation
        this.world.step();        // Sync physics bodies with entities
        for (const [entity, rigidBody] of this.rigidBodies) {
            const position = rigidBody.translation();
            const rotation = rigidBody.rotation();

            // Ensure entity.position is a THREE.Vector3, converting if necessary
            const currentEntityPosition = entity.position;
            if (!currentEntityPosition || typeof currentEntityPosition.set !== 'function') {
                const entityIdentifier = entity.name || entity.type || 'Unnamed Entity';
                console.warn(`PhysicsManager: Entity '${entityIdentifier}' position is not a THREE.Vector3. Converting now.`);

                // Preserve original x,y,z values if they exist on the plain object
                const px = currentEntityPosition ? (currentEntityPosition.x || 0) : 0;
                const py = currentEntityPosition ? (currentEntityPosition.y || 0) : 0;
                const pz = currentEntityPosition ? (currentEntityPosition.z || 0) : 0;
                entity.position = new THREE.Vector3(px, py, pz);
            }

            // Now, entity.position is guaranteed to be a THREE.Vector3.
            // Update entity position from the physics simulation (using 'position' from rigidBody.translation())
            entity.position.set(position.x, position.y, position.z);

            // Update entity rotation if it has one
            if (entity.rotation && entity.rotation.setFromQuaternion) {
                entity.rotation.setFromQuaternion({ x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w });
            }

            // Update visual model if present
            if (entity.model) {
                entity.model.position.copy(entity.position);
                entity.model.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
            }
            
            // Also update mesh if present (some entities use 'mesh' instead of 'model')
            if (entity.mesh && entity.mesh !== entity.model) {
                entity.mesh.position.copy(entity.position);
                entity.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
            }
        }
    }

    /**
     * Apply force to an entity's rigid body
     */
    applyForce(entity, force, point = null) {
        if (!this.initialized) return;

        const rigidBody = this.rigidBodies.get(entity);
        if (!rigidBody) return;

        if (point) {
            rigidBody.addForceAtPoint(force, point, true);
        } else {
            rigidBody.addForce(force, true);
        }
    }

    /**
     * Apply impulse to an entity's rigid body
     */
    applyImpulse(entity, impulse, point = null) {
        if (!this.initialized) return;

        const rigidBody = this.rigidBodies.get(entity);
        if (!rigidBody) return;

        if (point) {
            rigidBody.applyImpulseAtPoint(impulse, point, true);
        } else {
            rigidBody.applyImpulse(impulse, true);
        }
    }

    /**
     * Set velocity of an entity's rigid body
     */
    setVelocity(entity, velocity) {
        if (!this.initialized) return;

        const rigidBody = this.rigidBodies.get(entity);
        if (!rigidBody) return;

        rigidBody.setLinvel(velocity, true);
    }

    /**
     * Remove physics body for an entity
     */
    removeEntity(entity) {
        if (!this.initialized) return;

        const collider = this.colliders.get(entity);
        if (collider) {
            this.world.removeCollider(collider, false);
            this.colliders.delete(entity);
        }

        const rigidBody = this.rigidBodies.get(entity);
        if (rigidBody) {
            this.world.removeRigidBody(rigidBody);
            this.rigidBodies.delete(entity);
        }
    }    /**
     * Check if physics is enabled/available
     */
    isEnabled() {
        return this.initialized;
    }

    /**
     * Check if physics is initialized
     */
    isInitialized() {
        return this.initialized;
    }    /**
     * Get collision events
     */    getCollisionEvents() {
        if (!this.initialized || !this.world) return [];

        try {
            const events = [];
            
            // Try the newer Rapier API first
            if (typeof this.world.contactPairs === 'function') {
                this.world.contactPairs((collider1Handle, collider2Handle, manifold, flipped) => {
                    // Find entities for these colliders
                    const entity1 = [...this.colliders.entries()].find(([, c]) => c.handle === collider1Handle)?.[0];
                    const entity2 = [...this.colliders.entries()].find(([, c]) => c.handle === collider2Handle)?.[0];
                    
                    if (entity1 && entity2) {
                        events.push({
                            entity1,
                            entity2,
                            started: true,
                            collider1: null,
                            collider2: null
                        });
                    }
                });            }
            // Fallback for older API
            else if (typeof this.world.contactsWith === 'function') {
                this.world.contactsWith((collider1, collider2, started) => {
                    const entity1 = [...this.colliders.entries()].find(([, c]) => c === collider1)?.[0];
                    const entity2 = [...this.colliders.entries()].find(([, c]) => c === collider2)?.[0];

                    if (entity1 && entity2) {
                        events.push({
                            entity1,
                            entity2,
                            started,
                            collider1,
                            collider2
                        });
                    }                });
            }
            
            return events;
        } catch (error) {
            console.warn('PhysicsManager: Error getting collision events, disabling physics collision detection:', error);
            this.initialized = false; // Disable physics to prevent spam
            return [];
        }
    }    /**
     * Initialize physics body for an entity's physics component
     */    initializePhysicsBody(physicsComponent) {
        if (!this.initialized) {
            console.warn('PhysicsManager: Cannot initialize physics body - physics not initialized');
            return null;
        }

        try {
            // Get the entity from the physics component
            const entity = physicsComponent.entity;
            if (!entity) {
                console.error('PhysicsManager: Physics component has no entity reference');
                return null;
            }            // Create rigid body - pass the entity, not the physicsComponent
            const rigidBodyOptions = { 
                mass: physicsComponent.mass || 1,
                lockRotation: physicsComponent.lockRotation
            };
            console.log('PhysicsManager: Creating rigid body with options:', rigidBodyOptions);
            
            const rigidBody = this.createRigidBody(entity, physicsComponent.bodyType || 'dynamic', rigidBodyOptions);
            if (!rigidBody) {
                console.error('PhysicsManager: Failed to create rigid body');
                return null;
            }

            // Set the rigidBody reference in the physics component
            physicsComponent.rigidBody = rigidBody;

            // Set initial position from physics component or entity
            const position = physicsComponent.position || entity.position || { x: 0, y: 0, z: 0 };
            rigidBody.setTranslation(position, true);            // For space game: Only zero velocity for static/non-movable entities
            // Allow player, flying robot, and other dynamic entities to move
            const entityType = entity.type || 'unknown';
            if (!['player', 'flyingRobot', 'projectile'].includes(entityType)) {
                rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }

            // Create collider - pass the entity, not the physicsComponent
            const collider = this.createCollider(
                entity, 
                physicsComponent.shape || 'box', 
                physicsComponent.size || physicsComponent.radius || { x: 1, y: 1, z: 1 }, 
                rigidBody
            );

            if (!collider) {
                console.error('PhysicsManager: Failed to create collider');
                this.world.removeRigidBody(rigidBody);
                return null;
            }

            // Store references
            physicsComponent.rigidBody = rigidBody;
            physicsComponent.collider = collider;            console.log(`PhysicsManager: Successfully initialized physics body for ${physicsComponent.shape} shape (${entityType}) at position`, position);
            return rigidBody;

        } catch (error) {
            console.error('PhysicsManager: Error initializing physics body:', error);
            return null;
        }
    }

    /**
     * Remove rigid body from physics world
     */
    removeRigidBody(rigidBody) {
        if (!this.initialized || !rigidBody) return;
        
        try {
            this.world.removeRigidBody(rigidBody);
        } catch (error) {
            console.error('PhysicsManager: Error removing rigid body:', error);
        }
    }
}
