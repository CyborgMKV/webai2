import Entity from '../engine/entity.js';
import Weapon from './weapon.js'; // Ensure this path is correct for your setup
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

        this.weapons = {}; 
        this.availableWeaponConfigs = (this.game && this.game.config && this.game.config.player && this.game.config.player.availableWeapons) || ['uzi', 'plasmaRifle']; 
        this.currentWeaponIndex = 0;
        this.currentWeapon = null; 
        this.weaponModelCheckInterval = null;

        this.ammo = 0;
        this.maxAmmo = 0;

        console.log(`Player initialized. Health: ${this.health}/${this.maxHealth}. Call setupInitialWeapon() to equip default weapon. (v2)`);
    }

    initComponents(components) {
        for (const { name, instance } of components) {
            this.addComponent(name, instance); 
        }
    }

    async setupInitialWeapon() {
        if (this.game && this.game.scene && this.availableWeaponConfigs.length > 0) {
            try {
                console.log('Player.setupInitialWeapon: Setting up initial weapon... (v2)');
                await this.equipWeapon(this.availableWeaponConfigs[this.currentWeaponIndex]);
                console.log('Player.setupInitialWeapon: Initial weapon setup complete. (v2)');
            } catch (error) {
                console.error("Player.setupInitialWeapon: Failed to equip initial weapon (v2):", error);
                this.currentWeapon = null;
            }
        } else {
            console.warn('Player.setupInitialWeapon: Game instance/scene not fully available, or no available weapons. Cannot initialize default weapon. (v2)');
            this.currentWeapon = null;
        }
    }

    async equipWeapon(weaponName) {
        console.log(`Player.equipWeapon: Equipping weapon "${weaponName}" (v2)`);
        console.log("Player.equipWeapon: About to call Weapon.loadGlobalConfig. Is Weapon.loadGlobalConfig a function? (v2)", typeof Weapon.loadGlobalConfig);
        
        try {
            await Weapon.loadGlobalConfig(); 
        } catch (error) {
            console.error(`Player.equipWeapon: Error during Weapon.loadGlobalConfig() for weapon "${weaponName}" (v2):`, error);
            return; 
        }
        
        console.log(`Player.equipWeapon: Weapon.loadGlobalConfig() awaited. Proceeding to instantiate Weapon "${weaponName}". (v2)`);

        if (this.weaponModelCheckInterval) {
            clearInterval(this.weaponModelCheckInterval);
            this.weaponModelCheckInterval = null;
        }

        if (this.currentWeapon && this.currentWeapon.model && this.model && this.currentWeapon.model.parent === this.model) {
            this.model.remove(this.currentWeapon.model);
        }
        this.currentWeapon = null; 

        this.currentWeapon = new Weapon(this.game.scene, weaponName, this);

        if (this.currentWeapon.config.attackType === 'none' && weaponName !== 'unarmed') { 
             console.warn(`Player.equipWeapon: Weapon "${weaponName}" was initialized with a fallback config. Check console for errors from Weapon constructor. (v2)`);
        }

        const currentWeaponConfig = this.currentWeapon.config; 
        if (currentWeaponConfig.maxAmmo === Infinity) { 
            this.ammo = Infinity;
            this.maxAmmo = Infinity;
        } else if (typeof currentWeaponConfig.maxAmmo === 'number') {
            this.ammo = currentWeaponConfig.maxAmmo; 
            this.maxAmmo = currentWeaponConfig.maxAmmo;
        } else { 
            this.ammo = 0; 
            this.maxAmmo = 0;
        }
        console.log(`Player.equipWeapon: Ammo for ${weaponName} set to ${this.ammo}/${this.maxAmmo} (v2)`);

        this.weaponModelCheckInterval = setInterval(() => {
            if (this.currentWeapon && this.currentWeapon.model) {
                console.log('Player model check in equipWeapon interval. this.model (v2):', this.model);
                if (this.model) {
                    let pos = this.currentWeapon.config.positionOffset || { x: 0, y: 0, z: 0.5 }; 
                    let rot = this.currentWeapon.config.rotationOffset || { x: 0, y: Math.PI, z: 0 }; 
                    let scaleVal = this.currentWeapon.config.scale || 0.1;
                    
                    this.currentWeapon.model.position.set(pos.x, pos.y, pos.z);
                    this.currentWeapon.model.rotation.set(rot.x, rot.y, rot.z);
                    this.currentWeapon.model.scale.set(scaleVal, scaleVal, scaleVal);

                    this.model.add(this.currentWeapon.model);
                    console.log(`Player.equipWeapon: Weapon model for "${weaponName}" ADDED to player model. (v2)`);
                } else {
                    console.warn(`Player.equipWeapon: Player model (this.model) is null. Cannot attach weapon model for "${weaponName}". (v2)`);
                }
                clearInterval(this.weaponModelCheckInterval);
                this.weaponModelCheckInterval = null;
            } else if (this.currentWeapon && (!this.currentWeapon.config || !this.currentWeapon.config.model)) {
                console.warn(`Player.equipWeapon: Weapon "${weaponName}" model will not load as config or model path is missing. (v2)`);
                clearInterval(this.weaponModelCheckInterval);
                this.weaponModelCheckInterval = null;
            }
        }, 100); 

        this.currentWeaponIndex = this.availableWeaponConfigs.indexOf(weaponName);
        console.log(`Player.equipWeapon: Completed equipping ${this.currentWeapon.weaponName}. Ammo: ${this.ammo}/${this.maxAmmo}. (v2)`);
        
        const hudComponent = this.getComponent('hud'); 
        if (hudComponent && typeof hudComponent.updateWeaponInfo === 'function') {
            hudComponent.updateWeaponInfo(this.currentWeapon.weaponName, this.ammo, this.maxAmmo);
        }
    }
    
    async switchToWeaponByIndex(index) {
        if (index >= 0 && index < this.availableWeaponConfigs.length) {
            const weaponNameToEquip = this.availableWeaponConfigs[index];
            if (!this.currentWeapon || this.currentWeapon.weaponName !== weaponNameToEquip) {
                 console.log(`Player.switchToWeaponByIndex: Switching to ${weaponNameToEquip} (v2)`);
                 await this.equipWeapon(weaponNameToEquip);
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
        console.log("Player.shoot: Method called. (v2)");
        if (!this.currentWeapon) {
            console.warn("Player.shoot: No current weapon equipped. (v2)");
            return;
        }
        if (!this.currentWeapon.model) {
            console.warn(`Player.shoot: Current weapon "${this.currentWeapon.weaponName}" has no model loaded yet. (v2)`);
            return;
        }
        if (!this.model) {
            console.warn("Player.shoot: Player has no model to shoot from. (v2)");
            return;
        }

        if (this.ammo === 0 && this.maxAmmo !== Infinity) { 
            console.log(`Player.shoot: Weapon "${this.currentWeapon.weaponName}" out of ammo! Current ammo: ${this.ammo} (v2)`);
            return;
        }
        console.log(`Player.shoot: Current ammo: ${this.ammo}/${this.maxAmmo}. Firing ${this.currentWeapon.weaponName}. (v2)`);

        const shootOrigin = new THREE.Vector3();
        this.currentWeapon.model.getWorldPosition(shootOrigin); 

        const shootDirection = new THREE.Vector3();
        let localForward = this.currentWeapon.config.localForwardVector || new THREE.Vector3(0, 0, 1); 
        
        const worldForward = this.currentWeapon.model.localToWorld(localForward.clone());
        shootDirection.subVectors(worldForward, shootOrigin).normalize();
        
        console.log("Player.shoot: Calling this.currentWeapon.shoot(). Origin:", shootOrigin, "Direction:", shootDirection, "(v2)");
        const fired = this.currentWeapon.shoot(shootOrigin, shootDirection);
        console.log("Player.shoot: this.currentWeapon.shoot() returned:", fired, "(v2)");

        if (fired && this.ammo !== Infinity) {
            this.ammo--;
            console.log(`Player.shoot: Ammo decremented. New ammo: ${this.ammo}/${this.maxAmmo} (v2)`);
            const hudComponent = this.getComponent('hud');
            if (hudComponent && typeof hudComponent.updateWeaponInfo === 'function') {
                hudComponent.updateWeaponInfo(this.currentWeapon.weaponName, this.ammo, this.maxAmmo);
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        console.log(`Player.takeDamage: Health is now ${this.health}/${this.maxHealth} (v2)`);
        if (this.health === 0) {
            this.state = 'dead';
            console.log("Player.takeDamage: Player is dead. (v2)");
        }
        const hudComponent = this.getComponent('hud');
        if (hudComponent && typeof hudComponent.updateHealth === 'function') {
            hudComponent.updateHealth(this.health, this.maxHealth);
        }
    }

    addScore(points) {
        this.score += points;
        const hudComponent = this.getComponent('hud');
        if (hudComponent && typeof hudComponent.updateScore === 'function') {
            hudComponent.updateScore(this.score);
        }
    }
}
