import Entity from '../engine/entity.js';
import Weapon from './weapon.js';
import * as THREE from '../../libs/three/three.module.js';

export default class Player extends Entity {
    constructor(options = {}) {
        super();
        this.type = 'player';
        this.state = 'active';
        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.velocity = options.velocity || { x: 0, y: 0, z: 0 };
        this.model = options.model || null; 
        this.game = options.game; 

        let initialMaxHealth = 100;
        if (this.game && this.game.config && this.game.config.player && typeof this.game.config.player.maxHealth === 'number') {
            initialMaxHealth = this.game.config.player.maxHealth;
        } else if (typeof options.maxHealth === 'number') {
            initialMaxHealth = options.maxHealth;
        }
        this.maxHealth = initialMaxHealth;
        this.health = (typeof options.health === 'number') ? options.health : this.maxHealth;
        this.score = 0;
        
        this.initComponents(options.components || []);

        // Weapon inventory and management
        this.weapons = {}; 
        this.availableWeaponConfigs = ['uzi', 'plasmaRifle']; 
        this.currentWeaponIndex = 0;
        this.currentWeapon = null; 
        this.weaponModelCheckInterval = null;

        // Ammo properties
        this.ammo = 0;
        this.maxAmmo = 0;

        if (this.game && this.game.scene && this.game.config) {
            this.equipWeapon(this.availableWeaponConfigs[this.currentWeaponIndex]);
        } else {
            console.warn('Player: Game instance, scene, or config not provided. Cannot initialize weapons.');
        }

        console.log(`Player initialized. Health: ${this.health}/${this.maxHealth}.`);
    }

    initComponents(components) {
        for (const { name, instance } of components) {
            this.addComponent(name, instance);
        }
    }

    equipWeapon(weaponName) {
        if (!this.game || !this.game.config || !this.game.config.weapons || !this.game.config.weapons[weaponName]) {
            console.error(`Player.equipWeapon: Config for "${weaponName}" not found.`);
            return;
        }
        
        console.log(`Player: Equipping weapon "${weaponName}"`);

        if (this.weaponModelCheckInterval) {
            clearInterval(this.weaponModelCheckInterval);
            this.weaponModelCheckInterval = null;
        }

        if (this.currentWeapon && this.currentWeapon.model && this.model && this.currentWeapon.model.parent === this.model) {
            this.model.remove(this.currentWeapon.model);
        }
        this.currentWeapon = null; 

        this.currentWeapon = new Weapon(this.game.scene, weaponName, this);

        // Set ammo based on weapon type
        if (weaponName === 'uzi') {
            this.ammo = Infinity;
            this.maxAmmo = Infinity;
        } else if (weaponName === 'plasmaRifle') {
            this.ammo = 100;
            this.maxAmmo = 100;
        } else {
            this.ammo = 0; // Default for unknown weapons
            this.maxAmmo = 0;
        }
        console.log(`Player: Ammo for ${weaponName} set to ${this.ammo}/${this.maxAmmo}`);


        this.weaponModelCheckInterval = setInterval(() => {
            if (this.currentWeapon && this.currentWeapon.model) {
                if (this.model) {
                    let pos = { x: 0, y: 0, z: 0.5 }; 
                    let rot = { x: 0, y: Math.PI, z: 0 }; 
                    let scale = this.currentWeapon.config.scale || 0.1;

                    if (weaponName === 'uzi') {
                        pos = { x: 0, y: 0.05, z: 0.25 };
                        rot = { x: 0, y: Math.PI, z: 0};
                        scale = this.currentWeapon.config.scale || 0.08; 
                    } else if (weaponName === 'plasmaRifle') {
                        pos = { x: 0.05, y: -0.05, z: 0.3 };
                        rot = { x: 0, y: Math.PI, z: 0 }; 
                        scale = this.currentWeapon.config.scale || 0.05;
                    }
                    
                    this.currentWeapon.model.position.set(pos.x, pos.y, pos.z);
                    this.currentWeapon.model.rotation.set(rot.x, rot.y, rot.z);
                    this.currentWeapon.model.scale.set(scale,scale,scale);

                    this.model.add(this.currentWeapon.model);
                }
                clearInterval(this.weaponModelCheckInterval);
                this.weaponModelCheckInterval = null;
            } else if (this.currentWeapon && !this.currentWeapon.config) {
                clearInterval(this.weaponModelCheckInterval);
                this.weaponModelCheckInterval = null;
            }
        }, 100); 

        this.currentWeaponIndex = this.availableWeaponConfigs.indexOf(weaponName);
        console.log(`Player: Equipped ${this.currentWeapon.weaponName}. Ammo: ${this.ammo}/${this.maxAmmo}.`);
         // Manually trigger a HUD update after equipping, if HUD component is available
        const hudComponent = this.getComponent('hud');
        if (hudComponent && typeof hudComponent.updateWeaponInfo === 'function') {
            hudComponent.updateWeaponInfo(this.currentWeapon.weaponName, this.ammo, this.maxAmmo);
        }
    }
    
    switchToWeaponByIndex(index) {
        if (index >= 0 && index < this.availableWeaponConfigs.length) {
            const weaponNameToEquip = this.availableWeaponConfigs[index];
            if (!this.currentWeapon || this.currentWeapon.weaponName !== weaponNameToEquip) {
                 this.equipWeapon(weaponNameToEquip);
            }
        }
    }

    update(deltaTime, game) {
        if (this.model) {
            this.model.position.copy(this.position);
        }
        if (this.currentWeapon) {
            this.currentWeapon.update(deltaTime);
        }
        super.update(deltaTime, game);
    }

    shoot() {
        if (!this.currentWeapon) return;
        if (!this.currentWeapon.model) return;
        if (!this.model) return;

        // Basic ammo check (actual consumption not part of this subtask)
        if (this.currentWeapon.weaponName === 'plasmaRifle' && this.ammo === 0) {
            console.log("Plasma Rifle: Out of ammo!");
            // Optionally play an empty click sound or show a HUD message
            return;
        }

        const shootOrigin = new THREE.Vector3();
        const shootDirection = new THREE.Vector3();
        this.currentWeapon.model.getWorldPosition(shootOrigin);

        let localForward = new THREE.Vector3(0, 0, -1); 
        if (this.currentWeapon.weaponName === 'plasmaRifle') {
            localForward = new THREE.Vector3(0, 0, 1); 
        }
        
        const worldForward = this.currentWeapon.model.localToWorld(localForward.clone());
        shootDirection.subVectors(worldForward, shootOrigin).normalize();
        
        const fired = this.currentWeapon.shoot(shootOrigin, shootDirection);

        // For this subtask, ammo consumption logic is not implemented.
        // if (fired && this.currentWeapon.weaponName === 'plasmaRifle' && this.ammo !== Infinity) {
        //     this.ammo--;
        //     console.log(`Plasma Rifle ammo: ${this.ammo}/${this.maxAmmo}`);
        //     // Manually trigger a HUD update after shooting
        //     const hudComponent = this.getComponent('hud');
        //     if (hudComponent && typeof hudComponent.updateWeaponInfo === 'function') {
        //         hudComponent.updateWeaponInfo(this.currentWeapon.weaponName, this.ammo, this.maxAmmo);
        //     }
        // }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        if (this.health === 0) this.state = 'dead';
    }

    addScore(points) {
        this.score += points;
    }
}
