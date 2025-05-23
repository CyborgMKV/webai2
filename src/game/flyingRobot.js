import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js';
import Entity from '../engine/entity.js';
import Heart from './heart.js';

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
        this.isGold = !!options.isGold;
        this.scoreValue = options.scoreValue || 100;
        this.initComponents(options.components || []);
        this.mesh = null;

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
        };

        // Load the GLB model
        const loader = new GLTFLoader();
        loader.load(
            'assets/models/flyingRobot.glb',
            (gltf) => {
                this.mesh = gltf.scene;
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
    }

    updateActive(deltaTime, game) {
        // Move robot
        this.position.addScaledVector(this.velocity, this.speed * deltaTime);

        // Sync mesh position with entity position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        // TODO: Add AI, lock-on, etc.
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