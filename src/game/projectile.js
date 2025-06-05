import * as THREE from '../../libs/three/three.module.js';
import Entity from '../engine/entity.js';
import PhysicsComponent from '../components/physics.js';

class Projectile extends Entity {
    constructor(options = {}) {
        super(); 
        this.type = 'projectile';
        this.name = options.name || 'Projectile (v4)'; // Changed to v4
          this.scene = options.scene;
        this.origin = options.origin ? options.origin.clone() : new THREE.Vector3(0,0,0); 
        
        // Safely handle direction vector to prevent NaN in BufferGeometry
        if (options.direction) {
            const dir = options.direction.clone();
            const length = dir.length();
            
            // Check for zero or invalid length before normalizing
            if (length === 0 || !isFinite(length)) {
                console.warn('Projectile created with zero or invalid direction vector, using default direction');
                this.direction = new THREE.Vector3(0, 0, 1);
            } else {
                this.direction = dir.normalize();
            }
        } else {
            this.direction = new THREE.Vector3(0, 0, 1);
        }
        
        this.speed = options.speed || 10;
        this.damage = options.damage || 5;
        this.lifespan = options.lifespan || 2; 
        this.color = options.color || 0xffffff;
        this.size = options.size || 0.1;
        this.shooter = options.shooter; 
        this.game = this.shooter ? this.shooter.game : null;        this.startTime = performance.now();
        this.active = true;

        // Initialize physics component for projectiles
        const physicsOptions = {
            type: 'kinematic', // Kinematic for controlled movement
            shape: 'sphere',
            radius: this.size,
            mass: 0.1,
            friction: 0.0,
            restitution: 0.0,
            isSensor: true // Make it a sensor for collision detection without physics response
        };
        this.addComponent('physics', new PhysicsComponent(physicsOptions));

        console.log(`Projectile.constructor: Creating projectile "${this.name}". Origin:`, this.origin, `Direction:`, this.direction, `Speed: ${this.speed}, Damage: ${this.damage}, Shooter:`, this.shooter ? this.shooter.type : 'N/A', '(v4)');

        const geometry = new THREE.SphereGeometry(this.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.origin);
        this.mesh.userData.entityInstance = this; 
        
        if (this.scene) {
            this.scene.add(this.mesh);
            console.log(`Projectile.constructor: Projectile "${this.name}" mesh added to scene. (v4)`);
        } else {
            console.error(`Projectile.constructor: Scene not provided for projectile "${this.name}". It will not be visible. (v4)`);
        }

        if (this.game && typeof this.game.addEntity === 'function') {
            this.game.addEntity(this);
            console.log(`Projectile.constructor: Projectile "${this.name}" entity added to game for updates. (v4)`);
        } else {
            console.error(`Projectile.constructor: Could not add projectile "${this.name}" to game's entity list. It will not update. Shooter's game instance:`, this.game, "(v4)");
        }
        
        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 0.01; 
    }    update(deltaTime, game) { 
        if (!this.active) return;

        const elapsedTime = (performance.now() - this.startTime) / 1000;
        if (elapsedTime > this.lifespan) {
            console.log(`Projectile.update: Projectile "${this.name}" lifespan ${this.lifespan}s exceeded. Destroying. (v4)`);
            this.destroy();
            return;
        }

        const distanceThisFrame = this.speed * deltaTime;
        const oldPosition = this.mesh.position.clone();
        
        // Update position using physics if available, otherwise fallback to direct movement
        const physicsComponent = this.getComponent('physics');
        if (physicsComponent && physicsComponent.rigidBody && game.physicsManager) {
            // Move using physics
            const newPos = oldPosition.clone().addScaledVector(this.direction, distanceThisFrame);
            physicsComponent.rigidBody.setTranslation(newPos, true);
            this.mesh.position.copy(newPos);
        } else {
            // Fallback to direct movement
            this.mesh.position.addScaledVector(this.direction, distanceThisFrame);
        }
        
        // console.log(`Projectile.update: Projectile "${this.name}" moved to:`, this.mesh.position, `Old pos:`, oldPosition, `Distance: ${distanceThisFrame} (v4)`);

        // Keep existing collision detection for now (will be replaced by physics collision events later)
        this.raycaster.set(oldPosition, this.direction);
        this.raycaster.far = distanceThisFrame * 1.1;

        const potentialTargets = [];
        if (this.scene) { 
            this.scene.traverse((object) => {
                if (object.isMesh && object.userData && object.userData.isShootable) {
                    let current = object;
                    let isShooterOrPartOfShooter = false;
                    while(current) {
                        if (current.userData && current.userData.entityInstance === this.shooter) {
                            isShooterOrPartOfShooter = true;
                            break;
                        }
                        current = current.parent; 
                    }
                    if (!isShooterOrPartOfShooter) {
                        potentialTargets.push(object);
                    }
                }
            });
        }
        
        const intersects = this.raycaster.intersectObjects(potentialTargets, false); 

        if (intersects.length > 0) {
            const firstHit = intersects[0];

            // ---- DETAILED LOGGING FOR COLLISION ----
            console.log(`---- Projectile Hit Details ----`);
            console.log(`Projectile Name: ${this.name}`);
            console.log(`Hit Object Name: ${firstHit.object.name}`);
            console.log(`Hit Object UUID: ${firstHit.object.uuid}`);
            console.log(`Hit Distance (Raycaster): ${firstHit.distance.toFixed(3)}`);
            console.log(`Hit Point (World Coords): X=${firstHit.point.x.toFixed(3)}, Y=${firstHit.point.y.toFixed(3)}, Z=${firstHit.point.z.toFixed(3)}`);
            console.log(`Projectile's Target Movement Distance This Frame (distanceThisFrame): ${distanceThisFrame.toFixed(3)}`);
            console.log(`Projectile Position (Old): X=${oldPosition.x.toFixed(3)}, Y=${oldPosition.y.toFixed(3)}, Z=${oldPosition.z.toFixed(3)}`);
            console.log(`Projectile Position (New/Current): X=${this.mesh.position.x.toFixed(3)}, Y=${this.mesh.position.y.toFixed(3)}, Z=${this.mesh.position.z.toFixed(3)}`);
            console.log(`Shooter: ${this.shooter ? this.shooter.type + (this.shooter.name ? ' (' + this.shooter.name + ')' : '') : 'N/A'}`);
            console.log(`--------------------------------`);
            // ---- END OF DETAILED LOGGING ----

            if (firstHit.distance <= distanceThisFrame) { 
                const hitEntity = firstHit.object.userData.entityInstance;
                console.log(`Projectile.update: Projectile "${this.name}" HIT object:`, firstHit.object.name, "Entity:", hitEntity ? hitEntity.type : 'N/A', "at distance:", firstHit.distance, "(v4)");
                if (hitEntity && typeof hitEntity.takeDamage === 'function') {
                    hitEntity.takeDamage(this.damage);
                }
                this.destroy(); 
                return;
            }
        }
    }

    destroy() {
        if (!this.active) return;
        this.active = false;
        console.log(`Projectile.destroy: Destroying projectile "${this.name}". (v4)`); 
        if (this.scene && this.mesh) {
            this.scene.remove(this.mesh);
        }
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
        if (this.game && typeof this.game.removeEntity === 'function') {
            this.game.removeEntity(this); 
            console.log(`Projectile.destroy: Projectile "${this.name}" entity removed from game. (v4)`);
        } else {
            console.warn(`Projectile.destroy: Could not remove projectile "${this.name}" from game's entity list. Game instance:`, this.game, "(v4)");
        }
    }
}

export default Projectile;
