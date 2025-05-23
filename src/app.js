import * as THREE from '../libs/three/three.module.js';
// If you use GLTFLoader or DRACOLoader here, add:
import { GLTFLoader } from '../libs/three/loaders/GLTFLoader.js';
import { DRACOLoader } from '../libs/three/loaders/DRACOLoader.js';

import Game from './game/game.js';
import Player from './game/player.js';
import Earth from './game/earth.js';
import HUDComponent from './components/hud.js';
import MinimapComponent from './components/minimap.js';
import MinimapBlipComponent from './components/minimapBlip.js'; 
import FlyingRobot from './game/flyingRobot.js';

export default class App {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.game = new Game();
        this.game.start();
        this.player = null;

        this.earth = new Earth();
this.earth.addComponent('minimapBlip', new MinimapBlipComponent());
        this.setupRenderer();
        this.setupCamera();
        this.setupPlayer();
        this.setupEvents();
        this.setupScene(); // <-- Added this line
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 10, 10);
this.scene.add(dirLight);
        
        this.game.addEntity(this.earth); // Register Earth as an entity
        this.scene.add(this.earth.mesh);

        const starGeo = new THREE.SphereGeometry(100, 32, 32);
        const starMat = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('assets/textures/starfield3.jpg'),
            side: THREE.BackSide
        });
        const starfield = new THREE.Mesh(starGeo, starMat);
        this.scene.add(starfield);
        
        const robot = new FlyingRobot({x: 10, y: 5, z: -20});
this.game.addEntity(robot);
//if (robot.mesh) {
//    this.scene.add(robot.mesh);
//}


// Add mesh to scene after it's loaded
robot.onModelLoaded = (mesh) => {
    this.scene.add(robot.mesh);
};



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
        this.camera.position.set(0, 2, 10);
        this.camera.lookAt(0, 0, 0);
    }


    setupPlayer() {
    this.player = new Player({
        position: { x: 0, y: 0, z: 0 },
        health: 100,
        maxHealth: 100
    });
    this.player.addComponent('hud', new HUDComponent());
    this.player.addComponent('minimap', new MinimapComponent());
    this.game.setPlayer(this.player);
    this.game.addEntity(this.player);
    if (this.player.mesh) {
        this.scene.add(this.player.mesh);
    }
    }

    setupEvents() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupScene() {
        this.scene.add(this.earth.mesh);
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
        
        //for(let i=0; i<this.game.entities.length; i++)
       // this.game.entities[i].update(deltaTime,this.game);

        if (this.earth) this.earth.update(deltaTime);
        
  

        this.renderer.render(this.scene, this.camera);
    }
}

window.app = new App();