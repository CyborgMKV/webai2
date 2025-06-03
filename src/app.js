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
        
        this.game = new Game(this); // Pass app instance to Game
<<<<<<< HEAD
        // Game related initializations (like loading config, gameMaster) happen within Game's constructor
        
        this.player = null; // Player will be set up in setupPlayer

        this.earth = new Earth();
        this.earth.addComponent('minimapBlip', new MinimapBlipComponent()); // Example component on Earth

        this.setupRenderer();
        this.setupCamera();
        // setupPlayer must be called after game config is loaded if player depends on it.
        // Game constructor is async due to config loading. We need to ensure config is ready.
        this.game.loadConfig('src/config/gameConfig.json').then(() => {
            console.log("App: Game config loaded, proceeding with player setup.");
            this.setupPlayer(); // Now safe to setup player
            this.game.start(); // Start game loop after essential setup
        }).catch(error => {
            console.error("App: Failed to load game config. Player setup and game start might be affected.", error);
=======
        
        this.player = null; 

        this.earth = new Earth();
        this.earth.addComponent('minimapBlip', new MinimapBlipComponent()); 

        this.setupRenderer();
        this.setupCamera();
        
        // Game constructor loads its own config. App should await player setup.
        this.game.loadConfig('src/config/gameConfig.json').then(async () => { // Make the callback async
            console.log("App: Game config loaded by Game instance, app proceeding with player setup.");
            // It's implied game.config is now populated from game's own loadConfig.
            await this.setupPlayer(); // Await the async setupPlayer
            console.log("App: Player setup awaited in App constructor. Starting game.");
            this.game.start(); // Start game loop after essential setup
        }).catch(error => {
            console.error("App: Error during game config loading or player setup chain:", error);
            // Potentially still start game but with player issues, or halt.
            // For now, let's try starting the game anyway to see other systems.
            // this.game.start(); 
>>>>>>> eae5216 (chore: Sync latest updates from cPanel)
        });
        
        this.setupEvents();
        this.setupScene(); 
        
        this.lastTime = performance.now();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
<<<<<<< HEAD
        this.camera.position.set(0, 2, 10); // Adjusted camera position
        this.camera.lookAt(0, 0, 0);
    }

    setupPlayer() {
        if (!this.game.config) {
            console.error("App.setupPlayer: Game config not loaded. Cannot setup player.");
            return;
        }
        // Player setup now uses the game instance which has the config
        this.player = new Player({
            position: { x: 0, y: 0, z: 0 },
            // Health can also be driven by game.config.player.maxHealth if desired
            health: (this.game.config.player && this.game.config.player.maxHealth) || 100,
            maxHealth: (this.game.config.player && this.game.config.player.maxHealth) || 100,
            game: this.game // Pass the game instance
        });

        // Add essential components
        this.player.addComponent('hud', new HUDComponent()); 
        this.player.addComponent('minimap', new MinimapComponent());
        this.player.addComponent('input', new InputComponent()); // Add InputComponent

        this.game.setPlayer(this.player); // Register player with the game

        // Add player model to scene if it exists (assuming player model is loaded within Player class or passed)
        // Player class should handle its own model loading and attachment.
        // For now, if player.model is a THREE object post-construction, add it.
        if (this.player.model) {
            this.scene.add(this.player.model);
        }
         console.log("App: Player setup complete.");
=======
        this.camera.position.set(0, 2, 10); 
        this.camera.lookAt(0, 0, 0);
    }

    async setupPlayer() { // Make the method async
        if (!this.game.config) {
            console.error("App.setupPlayer: Game config not loaded in game instance. Cannot setup player.");
            return;
        }
        
        console.log("App.setupPlayer: Instantiating Player...");
        this.player = new Player({
            position: { x: 0, y: 0, z: 0 },
            health: (this.game.config.player && this.game.config.player.maxHealth) || 100,
            maxHealth: (this.game.config.player && this.game.config.player.maxHealth) || 100,
            game: this.game, 
            model: new THREE.Group() // Provide placeholder model
        });
        console.log('Player instance model immediately after new Player():', this.player.model);

        this.player.addComponent('hud', new HUDComponent()); 
        this.player.addComponent('minimap', new MinimapComponent());
        this.player.addComponent('input', new InputComponent()); 

        console.log("App.setupPlayer: Calling player.setupInitialWeapon()...");
        try {
            await this.player.setupInitialWeapon(); // Call and await here
            console.log("App.setupPlayer: player.setupInitialWeapon() completed.");
        } catch (error) {
            console.error("App.setupPlayer: Error during player.setupInitialWeapon():", error);
        }

        this.game.setPlayer(this.player); 

        if (this.player.model) {
            this.scene.add(this.player.model);
            console.log("App.setupPlayer: Player model ADDED to scene.", this.player.model);
        } else {
            console.log("App.setupPlayer: Player model is NULL or undefined, NOT added to scene.");
        }
        console.log("App.setupPlayer: Player setup method complete."); // Changed log message
>>>>>>> eae5216 (chore: Sync latest updates from cPanel)
    }

    setupEvents() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupScene() {
<<<<<<< HEAD
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
=======
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6)); 
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); 
        dirLight.position.set(5, 10, 7); 
        this.scene.add(dirLight);

        if (this.earth.mesh) {
            this.scene.add(this.earth.mesh);
        }
        this.game.addEntity(this.earth); 

        const starGeo = new THREE.SphereGeometry(100, 32, 32); 
>>>>>>> eae5216 (chore: Sync latest updates from cPanel)
        const starMat = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('assets/textures/starfield3.jpg'),
            side: THREE.BackSide
        });
        const starfield = new THREE.Mesh(starGeo, starMat);
        this.scene.add(starfield);
        
<<<<<<< HEAD
        // Example FlyingRobot (ensure it's added to scene via its onModelLoaded or similar)
        const robot = new FlyingRobot({x: 10, y: 5, z: -20});
        this.game.addEntity(robot); // Game manages entities
        robot.onModelLoaded = (mesh) => { // Ensure robot adds its mesh to the scene
=======
        const robot = new FlyingRobot({x: 10, y: 5, z: -20}); // Example
        this.game.addEntity(robot); 
        robot.onModelLoaded = (mesh) => { 
>>>>>>> eae5216 (chore: Sync latest updates from cPanel)
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
        
<<<<<<< HEAD
        // Game loop updates all entities, including player and its components
        if (this.game && this.game.running) {
            this.game.loop(); // This should handle entity.update(deltaTime, game)
        } else {
            // If game isn't running yet (e.g. config loading), manually update critical parts if needed
            // For example, if earth had an animation before game start:
            // if (this.earth) this.earth.update(deltaTime, this.game);
=======
        if (this.game && this.game.running) {
            this.game.loop(); 
>>>>>>> eae5216 (chore: Sync latest updates from cPanel)
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}
