/**
 * ModelTester - Standalone tool for loading and previewing models/animations.
 * Useful for onboarding, plugin QA, and asset debugging.
 */
import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/loaders/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/loaders/DRACOLoader.js';
import { sanitizeGeometry } from '../utils/math.js';

export default class ModelTester {
    constructor(containerId = null) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 3);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x222233, 1);

        if (containerId) {
            document.getElementById(containerId).appendChild(this.renderer.domElement);
        } else {
            document.body.appendChild(this.renderer.domElement);
        }

        this.mixer = null;
        this.clock = new THREE.Clock();
        this.model = null;
        this.animations = [];
        this.activeAction = null;

        this.setupLight();
        this.animate();
    }

    setupLight() {
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
        hemi.position.set(0, 20, 0);
        this.scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(3, 10, 10);
        this.scene.add(dir);
    }    async loadModel(url) {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../../libs/three/draco/gltf/');
        loader.setDRACOLoader(dracoLoader);

        const gltf = await loader.loadAsync(url);
        if (this.model) this.scene.remove(this.model);
        this.model = gltf.scene;
        
        // Sanitize geometry to prevent NaN values in BufferGeometry
        this.model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const wasSanitized = sanitizeGeometry(child.geometry);
                if (wasSanitized) {
                    console.log(`ModelTester: Sanitized geometry for mesh in model from ${url}`);
                }
            }
        });
        
        this.scene.add(this.model);

        if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            this.animations = gltf.animations;
            this.playAnimation(this.animations[0].name);
        }
    }

    playAnimation(name) {
        if (!this.mixer || !this.animations.length) return;
        if (this.activeAction) this.activeAction.stop();
        const clip = this.animations.find(a => a.name === name);
        if (clip) {
            this.activeAction = this.mixer.clipAction(clip);
            this.activeAction.play();
        }
    }

    setAnimationSpeed(speed = 1) {
        if (this.activeAction) {
            this.activeAction.setEffectiveTimeScale(speed);
        }
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        if (this.mixer) this.mixer.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }
}

// Usage example (in a separate script or dev/test page):
// const tester = new ModelTester();
// tester.loadModel('assets/models/robot.glb');