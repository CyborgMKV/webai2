<<<<<<< HEAD
import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js';
import gameConfig from '../config/gameConfig.json';
import Projectile from './projectile.js';

class Weapon {
    constructor(scene, weaponName, shooter) {
        this.scene = scene;
        this.weaponName = weaponName;
        this.shooter = shooter;

        if (!gameConfig.weapons || !gameConfig.weapons[weaponName]) {
            console.error(`Weapon: Config for "${weaponName}" not found! Using fallback.`);
            this.config = { model: "", scale: 0.1, attackType: 'none', fireRate: 1, damage: 0 };
        } else {
            this.config = gameConfig.weapons[weaponName];
        }
        
        this.model = null;
        this.lastShotTime = 0;
        
        if (this.config.attackType === 'raycast') {
            this.raycaster = new THREE.Raycaster();
        }
        this.loadModel();
    }

    loadModel() {
        if (!this.config.model) {
            console.warn(`Weapon: No model path for ${this.weaponName}.`);
            return;
        }
        const loader = new GLTFLoader();
        loader.load(this.config.model, (gltf) => {
            this.model = gltf.scene;
            // Player.equipWeapon handles scaling based on its own logic/config.
            console.log(`Weapon: Model for ${this.weaponName} loaded.`);
        }, undefined, (error) => {
            console.error(`Error loading weapon model ${this.weaponName} from ${this.config.model}:`, error);
        });
    }

    shoot(origin, direction) {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.config.fireRate * 1000) {
            return false; 
        }
        this.lastShotTime = currentTime;

        let firedSuccessfully = false;
        if (this.config.attackType === 'raycast') {
            this.performRaycast(origin, direction);
            firedSuccessfully = true;
        } else if (this.config.attackType === 'projectile') {
            this.launchProjectile(origin, direction);
            firedSuccessfully = true;
        } else {
            console.warn(`Weapon: Unknown attack type "${this.config.attackType}" for ${this.weaponName}.`);
        }
        return firedSuccessfully; // Return status
    }

    performRaycast(origin, direction) {
        this.raycaster.set(origin, direction);
        const potentialTargets = [];
        this.scene.traverse((object) => {
            if (object.isMesh && object.userData && object.userData.isShootable && object.userData.entityInstance !== this.shooter) {
                 let current = object;
                 let isShooterPart = false;
                 while(current) {
                     if (current.userData && current.userData.entityInstance === this.shooter) {
                         isShooterPart = true;
                         break;
                     }
                     current = current.parent;
                 }
                 if (!isShooterPart) potentialTargets.push(object);
            }
        });

        if (potentialTargets.length === 0) {
            this.showMissEffect(origin, direction);
            return;
        }
        const intersects = this.raycaster.intersectObjects(potentialTargets, false);
        if (intersects.length > 0) {
            const firstHit = intersects[0];
            const hitEntity = firstHit.object.userData.entityInstance;
            if (hitEntity && typeof hitEntity.takeDamage === 'function') {
                hitEntity.takeDamage(this.config.damage);
            }
            this.showHitEffect(firstHit.point);
        } else {
            this.showMissEffect(origin, direction);
        }
    }

    launchProjectile(origin, direction) {
        new Projectile({
            scene: this.scene,
            origin: origin,
            direction: direction,
            speed: this.config.projectileSpeed,
            damage: this.config.damage,
            lifespan: this.config.projectileLifespan,
            color: parseInt(this.config.projectileColor, 16),
            size: this.config.projectileSize,
            shooter: this.shooter,
            name: `${this.weaponName} Projectile`
        });
    }
    
    showHitEffect(position) {
        const hitMarkerGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const hitMarkerMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 });
        const hitMarker = new THREE.Mesh(hitMarkerGeo, hitMarkerMat);
        hitMarker.position.copy(position);
        this.scene.add(hitMarker);
        setTimeout(() => { this.scene.remove(hitMarker); hitMarkerGeo.dispose(); hitMarkerMat.dispose(); }, 500);
    }

    showMissEffect(origin, direction) {
        const tracerMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
        const endPoint = origin.clone().add(direction.clone().multiplyScalar(50)); 
        const tracerGeometry = new THREE.BufferGeometry().setFromPoints([origin, endPoint]);
        const tracerLine = new THREE.Line(tracerGeometry, tracerMaterial);
        this.scene.add(tracerLine);
        setTimeout(() => { this.scene.remove(tracerLine); tracerGeometry.dispose(); tracerMaterial.dispose(); }, 200);
    }

    update(deltaTime) { /* Not much here for now */ }
}

export default Weapon;
=======
import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js';
// Removed: import gameConfig from '../config/gameConfig.json';
import Projectile from './projectile.js'; // Ensure this path is correct

// ---- THESE LINES ARE CRUCIAL ----
let gameConfig = null;
let globalConfigPromise = null;
// ------------------------------------

class Weapon {
    static async loadGlobalConfig(configPath = './src/config/gameConfig.json') { // User confirmed path
        console.log('[Weapon.loadGlobalConfig] Called. Current gameConfig:', gameConfig, 'Current globalConfigPromise:', globalConfigPromise, '(v2)');
        if (gameConfig) {
            console.log('[Weapon.loadGlobalConfig] Returning cached gameConfig. (v2)');
            return gameConfig;
        }
        if (globalConfigPromise) {
            console.log('[Weapon.loadGlobalConfig] Returning existing globalConfigPromise. (v2)');
            return globalConfigPromise;
        }

        console.log(`[Weapon.loadGlobalConfig] Attempting to load new config from: ${configPath} (v2)`);
        globalConfigPromise = (async () => {
            try {
                console.log(`[Weapon.loadGlobalConfig] Fetching from ${configPath}... (v2)`);
                const response = await fetch(configPath);
                console.log(`[Weapon.loadGlobalConfig] Response received. Status: ${response.status}, OK: ${response.ok} (v2)`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${configPath} (v2)`);
                }
                const jsonData = await response.json();
                gameConfig = jsonData; 
                console.log('[Weapon.loadGlobalConfig] Successfully fetched and parsed. gameConfig set to (v2):', gameConfig);
                return gameConfig; 
            } catch (error) {
                console.error(`[Weapon.loadGlobalConfig] Error loading/parsing config from ${configPath} (v2):`, error);
                globalConfigPromise = null; 
                throw error; 
            }
        })();
        return globalConfigPromise;
    }

    constructor(scene, weaponName, shooter) {
        this.scene = scene;
        this.weaponName = weaponName;
        this.shooter = shooter;

        if (!gameConfig) {
            console.error("Weapon Error: Global gameConfig not loaded. Ensure Weapon.loadGlobalConfig() was called and awaited before instantiating Weapons. (v2)");
            this.config = { model: "", scale: 0.1, attackType: 'none', fireRate: 1, damage: 0, projectileSpeed: 0, projectileLifespan: 0, projectileColor: "0xffffff", projectileSize: 0.1 };
        } else if (!gameConfig.weapons || !gameConfig.weapons[weaponName]) {
            console.warn(`Weapon: Config for "${weaponName}" not found in loaded gameConfig. Using fallback. (v2)`);
            this.config = { model: "", scale: 0.1, attackType: 'none', fireRate: 1, damage: 0, projectileSpeed: 0, projectileLifespan: 0, projectileColor: "0xffffff", projectileSize: 0.1 };
        } else {
            this.config = { ...gameConfig.weapons[weaponName] }; 
        }
        
        this.model = null;
        this.lastShotTime = 0;
        
        if (this.config.attackType === 'raycast') {
            this.raycaster = new THREE.Raycaster();
        }
        this.loadModel();
    }

    loadModel() {
        if (!this.config.model) {
            console.warn(`Weapon.loadModel: No model path for ${this.weaponName}. (v2)`);
            return;
        }
        const loader = new GLTFLoader();
        loader.load(this.config.model, (gltf) => {
            this.model = gltf.scene;
            console.log(`Weapon.loadModel: Model for ${this.weaponName} loaded. (v2)`);
        }, undefined, (error) => {
            console.error(`Weapon.loadModel: Error loading weapon model ${this.weaponName} from ${this.config.model} (v2):`, error);
        });
    }

    shoot(origin, direction) {
        console.log(`Weapon.shoot: Called for "${this.weaponName}". AttackType: ${this.config.attackType}. Origin:`, origin, "Direction:", direction, "(v2)");
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.config.fireRate * 1000) {
            console.log("Weapon.shoot: Firing too soon (within fireRate). (v2)");
            return false; 
        }
        this.lastShotTime = currentTime;

        let firedSuccessfully = false;
        if (this.config.attackType === 'raycast') {
            console.log("Weapon.shoot: Performing raycast. (v2)");
            this.performRaycast(origin, direction);
            firedSuccessfully = true;
        } else if (this.config.attackType === 'projectile') {
            console.log("Weapon.shoot: Launching projectile. (v2)");
            this.launchProjectile(origin, direction);
            firedSuccessfully = true;
        } else {
            console.warn(`Weapon.shoot: Unknown attack type "${this.config.attackType}" for ${this.weaponName}. (v2)`);
        }
        console.log("Weapon.shoot: Fired successfully flag:", firedSuccessfully, "(v2)");
        return firedSuccessfully; 
    }

    performRaycast(origin, direction) {
        console.log("Weapon.performRaycast: Performing raycast. (v2)");
        this.raycaster.set(origin, direction);
        const potentialTargets = [];
        this.scene.traverse((object) => {
            if (object.isMesh && object.userData && object.userData.isShootable && object.userData.entityInstance !== this.shooter) {
                 let current = object;
                 let isShooterPart = false;
                 while(current) {
                     if (current.userData && current.userData.entityInstance === this.shooter) {
                         isShooterPart = true;
                         break;
                     }
                     current = current.parent;
                 }
                 if (!isShooterPart) potentialTargets.push(object);
            }
        });

        if (potentialTargets.length === 0) {
            this.showMissEffect(origin, direction);
            return;
        }
        const intersects = this.raycaster.intersectObjects(potentialTargets, false);
        if (intersects.length > 0) {
            const firstHit = intersects[0];
            const hitEntity = firstHit.object.userData.entityInstance;
            console.log("Weapon.performRaycast: Ray hit object:", firstHit.object.name, "Entity:", hitEntity ? hitEntity.type : 'N/A', "(v2)");
            if (hitEntity && typeof hitEntity.takeDamage === 'function') {
                hitEntity.takeDamage(this.config.damage);
            }
            this.showHitEffect(firstHit.point);
        } else {
            console.log("Weapon.performRaycast: Ray missed all potential targets. (v2)");
            this.showMissEffect(origin, direction);
        }
    }

    launchProjectile(origin, direction) {
        console.log("Weapon.launchProjectile: Launching projectile with config (v2):", this.config);
        new Projectile({
            scene: this.scene,
            origin: origin,
            direction: direction,
            speed: this.config.projectileSpeed,
            damage: this.config.damage,
            lifespan: this.config.projectileLifespan,
            color: parseInt(this.config.projectileColor, 16), 
            size: this.config.projectileSize,
            shooter: this.shooter, 
            name: `${this.weaponName} Projectile (v2)`
        });
        console.log("Weapon.launchProjectile: Projectile instance created. (v2)");
    }
    
    showHitEffect(position) {
        const hitMarkerGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const hitMarkerMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 });
        const hitMarker = new THREE.Mesh(hitMarkerGeo, hitMarkerMat);
        hitMarker.position.copy(position);
        this.scene.add(hitMarker);
        setTimeout(() => { this.scene.remove(hitMarker); hitMarkerGeo.dispose(); hitMarkerMat.dispose(); }, 500);
    }

    showMissEffect(origin, direction) {
        const tracerMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
        const endPoint = origin.clone().add(direction.clone().multiplyScalar(50)); 
        const tracerGeometry = new THREE.BufferGeometry().setFromPoints([origin, endPoint]);
        const tracerLine = new THREE.Line(tracerGeometry, tracerMaterial);
        this.scene.add(tracerLine);
        setTimeout(() => { this.scene.remove(tracerLine); tracerGeometry.dispose(); tracerMaterial.dispose(); }, 200);
    }

    update(deltaTime) { /* Not much here for now */ }
}
export default Weapon;
>>>>>>> eae5216 (chore: Sync latest updates from cPanel)
