import * as THREE from '../libs/three/three.module.js';
import { GLTFLoader } from '../libs/three/loaders/GLTFLoader.js'; // Assuming GLTFLoader is used for player/weapon models
import { DRACOLoader } from '../libs/three/loaders/DRACOLoader.js'; // If DRACO is used

import Game from './game/game.js';
import Player from './game/player.js'; // Ensure this is the player.new.js content
import Earth from './game/earth.js';
import HUDComponent from './components/hud.js';
import MinimapComponent from './components/minimap.js';
import MinimapBlipComponent from './components/minimapBlip.js'; 
import FlyingRobot from './game/flyingRobot.js';
import InputComponent from './components/input.js'; // Import InputComponent

export default class App {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Correct color space
        
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('../libs/three/draco/gltf/'); // Adjusted path
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
        
        this.game = new Game(this); // Pass app instance to Game
        // Game related initializations (like loading config, gameMaster) happen within Game's constructor
        
        this.player = null; // Player will be set up in setupPlayer

        this.earth = new Earth();
        this.earth.addComponent('minimapBlip', new MinimapBlipComponent()); // Example component on Earth

        this.setupRenderer();
        this.setupCamera();
        // setupPlayer must be called after game config is loaded if player depends on it.
        // Game constructor is async due to config loading. We need to ensure config is ready.
        this.game.loadConfig('src/config/gameConfig.json').then(async () => { // Add async here
            console.log("App: Game config loaded, proceeding with player setup.");
            await this.setupPlayer(); // Add await here
            console.log("App: Player setup process in App constructor finished. Starting game."); // New log
            this.game.start(); 
        }).catch(error => {
            console.error("App: Failed to load game config or complete player setup. Player setup and game start might be affected.", error); // Modified log
        });
        
        this.setupEvents();
        this.setupScene(); 
        
        this.lastTime = performance.now();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    async loadModel(path) {
        console.log(`App.loadModel: Attempting to load model from ${path}`);
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(path, (gltf) => {
                console.log(`App.loadModel: Successfully loaded model from ${path}`);
                resolve(gltf.scene);
            }, undefined, (error) => {
                console.error(`App.loadModel: Error loading model from ${path}:`, error);
                reject(error);
            });
        });
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 2, 10); // Adjusted camera position
        this.camera.lookAt(0, 0, 0);
    }

    async setupPlayer() {
        if (!this.game.config) {
            console.error("App.setupPlayer: Game config not loaded. Cannot setup player.");
            return;
        }

        let playerModel;
        try {
            // Use 'assets/models/mt-103__rig_v1.3.4.glb' as the player model path
            playerModel = await this.loadModel('assets/models/mt-103__rig_v1.3.4.glb'); 
            console.log("App.setupPlayer: Player model loaded successfully.");
        } catch (error) {
            console.error("App.setupPlayer: Failed to load player model. Proceeding without player model.", error);
            // playerModel will remain undefined, Player constructor handles null model
        }

        // Player setup now uses the game instance which has the config
        this.player = new Player({
            position: { x: 0, y: 0, z: 0 },
            health: (this.game.config.player && this.game.config.player.maxHealth) || 100,
            maxHealth: (this.game.config.player && this.game.config.player.maxHealth) || 100,
            game: this.game,
            model: playerModel // Pass the loaded model here
        });

        // Add essential components
        this.player.addComponent('hud', new HUDComponent()); 
        this.player.addComponent('minimap', new MinimapComponent());
        this.player.addComponent('input', new InputComponent()); // Add InputComponent

        try {
            console.log("App.setupPlayer: Calling player.setupInitialWeapon()...");
            await this.player.setupInitialWeapon();
            console.log("App.setupPlayer: player.setupInitialWeapon() completed.");
        } catch (error) {
            console.error("App.setupPlayer: Error during player.setupInitialWeapon():", error);
        }

        this.game.setPlayer(this.player); // Register player with the game

        // Add player model to scene if it exists (assuming player model is loaded within Player class or passed)
        // Player class should handle its own model loading and attachment.
        // For now, if player.model is a THREE object post-construction, add it.
        if (this.player.model) {
            this.scene.add(this.player.model);
        }
         console.log("App: Player setup complete.");
    }

    setupEvents() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupScene() {
        // Basic lighting
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // Soft ambient light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // Brighter directional light
        dirLight.position.set(5, 10, 7); // Position light
        this.scene.add(dirLight);

        // Add Earth to scene (assuming Earth class handles its mesh creation)
        if (this.earth.mesh) {
            this.scene.add(this.earth.mesh);
        }
        this.game.addEntity(this.earth); // Register Earth with game logic if needed

        // Starfield background
        const starGeo = new THREE.SphereGeometry(100, 32, 32); // Increased radius for better coverage
        // The line above is from HEAD, the starfield texture code below is from the previous turn's modification
        const starTexture = new THREE.TextureLoader().load('assets/textures/starfield.jpg');
        starTexture.minFilter = THREE.LinearFilter; 
        starTexture.magFilter = THREE.LinearFilter;
        starTexture.anisotropy = Math.max(1, this.renderer.capabilities.getMaxAnisotropy()); 
        
        const starMat = new THREE.MeshBasicMaterial({
            map: starTexture,
            side: THREE.BackSide
        });
        const starfield = new THREE.Mesh(starGeo, starMat);
        this.scene.add(starfield);
        
        // Example FlyingRobot (ensure it's added to scene via its onModelLoaded or similar)
        const robot = new FlyingRobot({x: 10, y: 5, z: -20});
        this.game.addEntity(robot); // Game manages entities
        robot.onModelLoaded = (mesh) => { // Ensure robot adds its mesh to the scene
            if(mesh) this.scene.add(mesh);
        };
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        // Game loop updates all entities, including player and its components
        if (this.game && this.game.running) {
            this.game.loop(); // This should handle entity.update(deltaTime, game)
        } else {
            // If game isn't running yet (e.g. config loading), manually update critical parts if needed
            // For example, if earth had an animation before game start:
            // if (this.earth) this.earth.update(deltaTime, this.game);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}
