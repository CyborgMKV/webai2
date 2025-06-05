import * as THREE from '../../libs/three/three.module.js';
import Entity from '../engine/entity.js';
import PhysicsComponent from '../components/physics.js';
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/loaders/DRACOLoader.js';
import { sanitizeGeometry } from '../utils/math.js';
import { geometryRepairTool } from '../utils/geometryRepairTool.js';

export default class Shark extends Entity {
    constructor(game, options = {}) {
        super(options); 
        this.game = game;
        this.name = options.name || 'Shark';
        this.type = 'shark';
        this.modelPath = options.modelPath || 'assets/models/shark.glb';

        // Default values
        this.defaultHealth = 100;
        this.defaultPoints = 200;

        // Initialize health and points from constructor options or defaults
        this.health = typeof options.health === 'number' ? options.health : this.defaultHealth;
        this.points = typeof options.points === 'number' ? options.points : this.defaultPoints;
        
        this.isDefeated = false; // Flag to track defeat status

        // Hitbox debugging
        this.showHitboxes = options.showHitboxes !== undefined ? options.showHitboxes : true; // Default to true, or allow option
        this.debugHitboxHelpers = [];

        const initialPosition = this.position || { x: 0, y: 0, z: 0 };
        const initialRotation = this.rotation || { x: 0, y: 0, z: 0 }; 
        const initialScale    = this.scale    || { x: 1, y: 1, z: 1 };        this.position = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z);
        this.rotation = new THREE.Euler(initialRotation.x, initialRotation.y, initialRotation.z, 'XYZ');
        this.scale    = new THREE.Vector3(initialScale.x, initialScale.y, initialScale.z);

        // Initialize physics component for shark
        const physicsOptions = {
            type: 'dynamic',
            shape: 'box',
            size: { x: 2, y: 1, z: 4 }, // Approximate shark dimensions
            mass: 5.0,
            friction: 0.3,
            restitution: 0.2,
            lockRotation: { x: true, y: false, z: true } // Allow Y rotation for turning
        };
        this.addComponent('physics', new PhysicsComponent(physicsOptions));

        console.log(`${this.name}: Initialized with position:`, this.position);
        console.log(`${this.name}: Initialized with rotation:`, this.rotation);
        console.log(`${this.name}: Initialized with scale:`, this.scale);
        console.log(`${this.name}: Initialized with health: ${this.health}, points: ${this.points}`);
        if (this.showHitboxes) console.log(`${this.name}: Hitbox display enabled.`);


        this.mesh = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        this.loadModel(this.modelPath);
    }

    loadModel(path) {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../../libs/three/draco/gltf/');
        loader.setDRACOLoader(dracoLoader);

        loader.load(
            path,
            (gltf) => {
                this.mesh = gltf.scene;
                console.log(`${this.name}: Model loaded successfully from ${path}`, this.mesh);

                // --- REPAIR GEOMETRY FOR ALL MESHES (fix NaN before any bounding sphere/box) ---
                geometryRepairTool.batchRepairGeometries(this.mesh);

                this.mesh.scale.copy(this.scale);
                this.mesh.position.copy(this.position);
                this.mesh.rotation.copy(this.rotation);

                this.mesh.userData.entityInstance = this;
                this.mesh.userData.isShootable = true;
                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.userData.entityInstance = this;
                        child.userData.isShootable = true;
                        // VALIDATE geometry after repair
                        if (child.geometry && child.geometry.attributes && child.geometry.attributes.position) {
                            const positions = child.geometry.attributes.position.array;
                            let hasNaN = false;
                            for (let i = 0; i < positions.length; i++) {
                                if (!isFinite(positions[i])) {
                                    hasNaN = true;
                                    positions[i] = 0; // Force to 0 as absolute last resort
                                }
                            }
                            if (hasNaN) {
                                console.error(`Shark.loadModel: Geometry for child ${child.name} is still invalid after all repairs. Removing mesh from scene to prevent further errors.`);
                                if (child.parent) child.parent.remove(child);
                                return;
                            }
                        }
                    }
                });

                if (this.game && this.game.scene) {
                    this.game.scene.add(this.mesh);                    console.log(`${this.name}: Mesh added to game scene.`);

                    // Add BoxHelpers for debugging
                    if (this.showHitboxes) {
                        const worldPos = new THREE.Vector3(); // For getting world position
                        this.mesh.traverse((child) => {
                            if (child.isMesh) {
                                // Safely get world position to prevent NaN propagation
                                child.getWorldPosition(worldPos);
                                // Validate world position and sanitize if needed
                                if (!isFinite(worldPos.x) || !isFinite(worldPos.y) || !isFinite(worldPos.z)) {
                                    console.warn(`Shark.loadModel: Child mesh has invalid world position, sanitizing:`, worldPos);
                                    worldPos.set(0, 0, 0); // Reset to origin
                                }
                                // Detailed logging for child mesh identification
                                console.log(`Shark.loadModel: Child mesh identified: Name='${child.name}', UUID='${child.uuid}', Position:`, child.position, `WorldPosition:`, worldPos);
                                // Validate geometry before creating BoxHelper
                                let skipBoxHelper = false;
                                if (child.geometry && child.geometry.attributes && child.geometry.attributes.position) {
                                    const positions = child.geometry.attributes.position.array;
                                    for (let i = 0; i < positions.length; i++) {
                                        if (!isFinite(positions[i])) {
                                            skipBoxHelper = true;
                                            console.warn(`Shark.loadModel: Skipping BoxHelper for child ${child.name} due to NaN/Infinity in geometry.`);
                                            break;
                                        }
                                    }
                                }
                                if (skipBoxHelper) return;
                                const boxHelper = new THREE.BoxHelper(child, 0xffff00); // Yellow for children
                                boxHelper.userData.isShootable = false; // Helpers are not shootable
                                boxHelper.name = `BoxHelper_for_${child.name || 'unnamed_child'}`;
                                this.game.scene.add(boxHelper);
                                this.debugHitboxHelpers.push(boxHelper);
                            }
                        });
                        // Optional: BoxHelper for the main group
                        // const mainBoxHelper = new THREE.BoxHelper(this.mesh, 0x00ff00); // Green for main group
                        // mainBoxHelper.userData.isShootable = false;
                        // mainBoxHelper.name = `BoxHelper_for_${this.name || 'main_shark_group'}`;
                        // this.game.scene.add(mainBoxHelper);
                        // this.debugHitboxHelpers.push(mainBoxHelper);
                        console.log(`${this.name}: Added ${this.debugHitboxHelpers.length} hitbox helpers to the scene.`);
                    }
                } else {
                    console.error(`${this.name}: Game scene not found to add mesh or hitbox helpers.`);
                }

                if (gltf.animations && gltf.animations.length) {
                    this.mixer = new THREE.AnimationMixer(this.mesh);
                    const action = this.mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                if (typeof this.onModelLoaded === 'function') {
                    this.onModelLoaded(this.mesh);
                }
            },
            undefined, // onProgress callback not used here
            (error) => {
                console.error(`${this.name}: Error loading model from ${path}:`, error);
            }
        );
    }

    takeDamage(damageAmount) {
        if (this.isDefeated) return;

        this.health -= damageAmount;
        console.log(`Shark ${this.name} took ${damageAmount} damage, health is now ${this.health}`);

        if (this.health <= 0) {
            this.isDefeated = true;
            console.log(`Shark ${this.name} defeated! Awarded ${this.points} points.`);
            
            if (this.game && typeof this.game.addScore === 'function') {
                this.game.addScore(this.points);
            }

            // Clean up hitbox helpers before removing entity
            this.cleanupHitboxHelpers();


            if (this.game && typeof this.game.removeEntity === 'function') {
                this.game.removeEntity(this); // removeEntity should handle removing this.mesh from scene
            } else {
                // Fallback if removeEntity isn't available or doesn't handle mesh removal
                this.destroy(); // Call our own destroy if game.removeEntity isn't robust
            }
        }
    }

    cleanupHitboxHelpers() {
        if (this.showHitboxes && this.debugHitboxHelpers.length > 0) {
            console.log(`${this.name}: Removing ${this.debugHitboxHelpers.length} hitbox helpers.`);
            for (const helper of this.debugHitboxHelpers) {
                if (this.game && this.game.scene) {
                    this.game.scene.remove(helper);
                }
                if (helper.geometry) helper.geometry.dispose();
                if (helper.material) helper.material.dispose();
            }
            this.debugHitboxHelpers = [];
        }
    }

    update(deltaTime, game) {
        super.update(deltaTime, game);
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }        if (this.showHitboxes && this.debugHitboxHelpers.length > 0) {
            for (const helper of this.debugHitboxHelpers) {
                try {
                    // Safely update BoxHelper, catching any NaN-related errors
                    helper.update();
                } catch (error) {
                    console.warn(`Shark.update: BoxHelper update failed, likely due to NaN geometry:`, error);
                    // Remove the problematic helper
                    if (this.game && this.game.scene) {
                        this.game.scene.remove(helper);
                    }
                    // Remove from our tracking array
                    const index = this.debugHitboxHelpers.indexOf(helper);
                    if (index > -1) {
                        this.debugHitboxHelpers.splice(index, 1);
                    }
                }
            }
        }
    }
    
    destroy() {
        console.log(`${this.name}: Destroy sequence initiated.`);
        // Clean up hitbox helpers
        this.cleanupHitboxHelpers();

        // Remove main mesh from scene
        if (this.mesh && this.game && this.game.scene) {
            this.game.scene.remove(this.mesh);
            console.log(`${this.name}: Main mesh removed from scene.`);
        }
        
        // Dispose of mesh resources (geometry, material)
        if (this.mesh) {
            this.mesh.traverse(object => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            console.log(`${this.name}: Mesh resources disposed.`);
        }
        this.mesh = null; // Release reference to the mesh
        console.log(`${this.name}: Resources disposed and references released.`);
    }
}
