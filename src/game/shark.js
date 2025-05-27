import * as THREE from '../../libs/three/three.module.js';
import Entity from '../engine/entity.js';
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/loaders/DRACOLoader.js';

export default class Shark extends Entity {
    constructor(game, options = {}) {
        super(options); 
        this.game = game;
        this.name = options.name || 'Shark';
        this.type = 'shark';
        this.modelPath = options.modelPath || 'assets/models/shark.glb';

        const initialPosition = this.position || { x: 0, y: 0, z: 0 };
        const initialRotation = this.rotation || { x: 0, y: 0, z: 0 }; 
        const initialScale    = this.scale    || { x: 1, y: 1, z: 1 };

        this.position = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z);
        this.rotation = new THREE.Euler(initialRotation.x, initialRotation.y, initialRotation.z, 'XYZ');
        this.scale    = new THREE.Vector3(initialScale.x, initialScale.y, initialScale.z);

        console.log(`${this.name}: Initialized with position:`, this.position);
        console.log(`${this.name}: Initialized with rotation:`, this.rotation);
        console.log(`${this.name}: Initialized with scale:`, this.scale);

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

                // Apply initial entity scale, position, and rotation to the loaded mesh using .copy()
                this.mesh.scale.copy(this.scale);
                this.mesh.position.copy(this.position);
                this.mesh.rotation.copy(this.rotation);

                if (this.game && this.game.scene) {
                    this.game.scene.add(this.mesh);
                    console.log(`${this.name}: Mesh added to game scene.`);
                } else {
                    console.error(`${this.name}: Game scene not found to add mesh.`);
                }

                if (gltf.animations && gltf.animations.length) {
                    this.mixer = new THREE.AnimationMixer(this.mesh);
                    const action = this.mixer.clipAction(gltf.animations[0]);
                    action.play();
                    console.log(`${this.name}: Playing animation ${gltf.animations[0].name}`);
                }

                if (typeof this.onModelLoaded === 'function') {
                    this.onModelLoaded(this.mesh);
                }
            },
            (xhr) => {
                // console.log(`${this.name}: ${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            (error) => {
                console.error(`${this.name}: Error loading model from ${path}:`, error);
            }
        );
    }

    update(deltaTime, game) {
        super.update(deltaTime, game);
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
}
