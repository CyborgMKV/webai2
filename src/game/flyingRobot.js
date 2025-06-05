import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js';
import Entity from '../engine/entity.js';
import PhysicsComponent from '../components/physics.js';
import Heart from './heart.js';
import { sanitizeGeometry } from '../utils/math.js';

/**
 * flyingRobot entity for the arcade game.
 * Supports modular parts, heart, and extensible behaviors.
 */
export default class FlyingRobot extends Entity {
    /**
     * @param {Object} options - { mode, position, speed, model, ... }
     */
    constructor(options = {}) {
        super();
        this.name = 'FlyingRobot';
        this.type = 'flyingRobot';
        this.mode = options.mode || 'enemy';
        this.state = 'active';
        this.position = new THREE.Vector3(
            (options.position && options.position.x) || 0,
            (options.position && options.position.y) || 0,
            (options.position && options.position.z) || 0
        );
        this.velocity = new THREE.Vector3(
            (options.velocity && options.velocity.x) || 0,
            (options.velocity && options.velocity.y) || 0,
            (options.velocity && options.velocity.z) || 1
        );
        this.speed = options.speed || 1;
        this.model = null;
        this.parts = options.parts || {};
        
        this.heart = options.heart || null; // Heart mesh/entity
          
        this.heartBaseSize = options.heartBaseSize || 0.3;
        this.heartColor = options.heartColor || 0xff3366;
        this.heartHealth = 10;
        this.spawnTime = performance.now();
        this.regrowTimer = null;
        this.isSilver = !!options.isSilver;
        this.isGold = !!options.isGold;        this.scoreValue = options.scoreValue || 100;
        this.initComponents(options.components || []);
        this.mesh = null;        // Initialize physics component for flying robot with stable settings
        const physicsOptions = {
            type: 'dynamic',
            shape: 'box',
            size: { x: 1.5, y: 1.5, z: 1.5 }, // Approximate robot dimensions
            mass: 1.0, // Reduced mass for better responsiveness
            friction: 0.2, // Increased friction for stability
            restitution: 0.1, // Reduced bounce for stability
            lockRotation: { x: true, y: false, z: true }, // Lock X and Z rotation to prevent tumbling
            linearDamping: 0.3, // Add linear damping to prevent excessive speed
            angularDamping: 0.5 // Add angular damping to prevent spinning
        };
        this.addComponent('physics', new PhysicsComponent(physicsOptions));

        // Create the heart entity
        this.heart = new Heart({
            position: { x: 0, y: 1, z: 0 },
            baseSize: this.heartBaseSize,
            color: this.heartColor,
            health: this.heartHealth
        });

        // Attach the heart mesh to the robot's mesh after model is loaded
        this.onModelLoaded = (robotModel) => {
            if (this.heart && this.heart.mesh) {
                this.heart.mesh.position.set(0, 1, 0); // Offset above robot
                robotModel.add(this.heart.mesh);
            }
        };        // Load the GLB model
        const loader = new GLTFLoader();
        loader.load(
            'assets/models/flyingRobot.glb',
            (gltf) => {
                this.mesh = gltf.scene;
                
                // Sanitize geometry to prevent NaN values in BufferGeometry
                this.mesh.traverse((child) => {
                    if (child.isMesh && child.geometry) {
                        const wasSanitized = sanitizeGeometry(child.geometry);
                        if (wasSanitized) {
                            console.log(`FlyingRobot: Sanitized geometry for flying robot mesh`);
                        }
                    }
                });
                
                this.mesh.position.copy(this.position);
                this.heart.mesh.position.set(0, 1, 0); // Offset above robot
                this.setMeshTransparent(this.mesh, 0.5); //Make model semitransparent
                this.setMeshTransparent(this.heart.mesh, 1); //Make model semitransparent
               this.mesh.add(this.heart.mesh);
               if (this.onModelLoaded) 
               this.onModelLoaded(this.mesh);
            // if (this.heart && this.heart.mesh) {
            this.heart.mesh.position.set(0, 1, 0); // Offset above robot
           //    this.mesh.add(this.heart.mesh);
           // }
     
            },
            undefined,
            (error) => {
                console.error('Error loading flyingRobot.glb:', error);
            }
        );
        
       
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
        // State machine
        switch (this.state) {
            case 'active':
                this.updateActive(deltaTime, game);
                break;
            case 'heart':
                this.updateHeart(deltaTime, game);
                break;
            case 'regrowing':
                this.updateRegrowing(deltaTime, game);
                break;
        }
        super.update(deltaTime, game);
    }    updateActive(deltaTime, game) {
        // Apply AI movement using physics if available
        const physicsComponent = this.getComponent('physics');
        if (physicsComponent && physicsComponent.rigidBody) {
            // Use physics-based movement for AI behavior only
            const aiForce = {
                x: this.velocity.x * this.speed * 2,
                y: this.velocity.y * this.speed * 2,
                z: this.velocity.z * this.speed * 2
            };
            // Validate force values before applying
            if (isFinite(aiForce.x) && isFinite(aiForce.y) && isFinite(aiForce.z)) {
                try {
                    physicsComponent.rigidBody.addForce(aiForce, true);
                } catch (e) {
                    console.error('FlyingRobot: Error applying force to rigidBody:', e, aiForce);
                }
            } else {
                console.warn('FlyingRobot: Skipping addForce due to invalid aiForce:', aiForce);
            }
            // Update entity position from physics (this is the single source of truth)
            let physicsPos;
            try {
                physicsPos = physicsComponent.rigidBody.translation();
            } catch (e) {
                console.error('FlyingRobot: Error reading rigidBody position:', e);
                return;
            }
            if (
                physicsPos &&
                isFinite(physicsPos.x) &&
                isFinite(physicsPos.y) &&
                isFinite(physicsPos.z)
            ) {
                this.position.set(physicsPos.x, physicsPos.y, physicsPos.z);
                if (this.mesh) {
                    this.mesh.position.set(physicsPos.x, physicsPos.y, physicsPos.z);
                }
            } else {
                console.warn('FlyingRobot: Skipping position sync due to invalid physicsPos:', physicsPos);
            }
        } else {
            // Fallback to direct movement if no physics
            this.position.addScaledVector(this.velocity, this.speed * deltaTime);
            if (this.mesh) {
                this.mesh.position.copy(this.position);
            }
        }
        // Simple AI: fly toward player if available
        if (game && game.player) {
            const direction = new THREE.Vector3().subVectors(game.player.position, this.position);
            const length = direction.length();
            if (length === 0 || !isFinite(length)) {
                console.warn('FlyingRobot direction has zero or invalid length, skipping movement');
                return; // Skip movement this frame
            }
            direction.normalize();
            // Only update velocity if direction is valid
            if (isFinite(direction.x) && isFinite(direction.y) && isFinite(direction.z)) {
                this.velocity.lerp(direction, deltaTime * 0.5);
            } else {
                console.warn('FlyingRobot: Skipping velocity update due to invalid direction:', direction);
            }
        }
    }

    updateHeart(deltaTime, game) {
        // Heart bounces, spins, and pulses
        if (this.heart && this.heart.mesh) {
            this.heart.mesh.rotation.y += deltaTime * 2;
            const t = performance.now() * 0.003;
            const scale = 1 + 0.2 * Math.abs(Math.sin(t * 2));
            this.heart.mesh.scale.set(
                this.heartBaseSize * scale,
                this.heartBaseSize * scale,
                this.heartBaseSize * scale
            );
        }
        // TODO: Handle hitbox, health, countdown, regrow logic
    }

    updateRegrowing(deltaTime, game) {
        // Countdown and regrow logic
        // TODO: Show countdown, regrow model after timer
    }

    onDestroyed(game) {
        this.state = 'heart';
        // TODO: Remove model, play explosion, detach parts, bounce heart
    }

    onHeartDestroyed(game) {
        this.state = 'destroyed';
        // TODO: Play heart explosion, remove heart, double points
    }
    
    setMeshTransparent(mesh, opacity = 0.8) {
    mesh.traverse((child) => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = opacity;
                });
            } else {
                child.material.transparent = true;
                child.material.opacity = opacity;
            }
        }
    });
}
}