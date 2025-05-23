import PluginLoader from '../engine/pluginLoader.js';
import FlyingRobot from './flyingRobot.js';
import Heart from './heart.js';
import Player from './player.js';

/**
 * Main Game class.
 * Manages entities, plugins, game loop, and core systems.
 */
export default class Game {
    constructor(options = {}) {
        this.entities = [];
        this.pluginLoader = new PluginLoader();
        this.player = null;
        this.running = false;
        this.lastTime = performance.now();
        this.deltaTime = 0;
        this.options = options;
    }

    /**
     * Add an entity to the game.
     * @param {Entity} entity 
     */
    addEntity(entity) {
        this.entities.push(entity);
    }

    /**
     * Remove an entity from the game.
     * @param {Entity} entity 
     */
    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    /**
     * Start the game loop.
     */
    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Main game loop.
     */
    loop() {
        if (!this.running) return;
        const now = performance.now();
        this.deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Update all entities
        for (const entity of this.entities) {
            entity.update(this.deltaTime, this);
        }

        // Call plugin hooks
        this.pluginLoader.callHook('onUpdate', this.deltaTime, this);

        // Render, UI, etc. (handled elsewhere or via plugins)

        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Stop the game loop.
     */
    stop() {
        this.running = false;
    }

    /**
     * Spawn a new flyingRobot.
     * @param {Object} options 
     */
    spawnFlyingRobot(options = {}) {
        const robot = new FlyingRobot(options);
        this.addEntity(robot);
            // Add mesh to the Three.js scene
robot.onModelLoaded = (mesh) => {
    app.scene.add(mesh);
};
        return robot;
    }





    /**
     * Spawn a new heart.
     * @param {Object} options 
     */
    spawnHeart(options = {}) {
        const heart = new Heart(options);
        this.addEntity(heart);
        return heart;
    }

    /**
     * Set the player entity.
     * @param {Player} player 
     */
    setPlayer(player) {
        this.player = player;
        this.addEntity(player);
    }
}