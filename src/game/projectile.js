import * as THREE from '../../libs/three/three.module.js';
import Entity from '../engine/entity.js';

class Projectile extends Entity {
    constructor(options = {}) {
        super();
        this.type = 'projectile';
        this.name = options.name || 'Projectile';
        
        this.scene = options.scene;
        this.origin = options.origin.clone();
        this.direction = options.direction.clone().normalize();
        this.speed = options.speed || 10;
        this.damage = options.damage || 5;
        this.lifespan = options.lifespan || 2; 
        this.color = options.color || 0xffffff;
        this.size = options.size || 0.1;
        this.shooter = options.shooter; 

        this.startTime = performance.now();
        this.active = true;

        const geometry = new THREE.SphereGeometry(this.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.origin);
        this.mesh.userData.entityInstance = this; 
        
        if (this.scene) {
            this.scene.add(this.mesh);
        } else {
            console.error("Projectile: Scene not provided.");
        }
        
        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 0.01;
    }

    update(deltaTime, game) {
        if (!this.active) return;

        const elapsedTime = (performance.now() - this.startTime) / 1000;
        if (elapsedTime > this.lifespan) {
            this.destroy();
            return;
        }

        const distanceThisFrame = this.speed * deltaTime;
        const oldPosition = this.mesh.position.clone();
        this.mesh.position.addScaledVector(this.direction, distanceThisFrame);

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
            if (firstHit.distance <= distanceThisFrame) {
                const hitEntity = firstHit.object.userData.entityInstance;
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
        if (this.scene && this.mesh) {
            this.scene.remove(this.mesh);
        }
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
    }
}

export default Projectile;
