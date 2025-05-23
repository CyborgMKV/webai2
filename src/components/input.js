/**
 * InputComponent for handling keyboard controls.
 * Extend for mouse/touch/gamepad as needed.
 */
import Component from '../engine/component.js';

export default class InputComponent extends Component {
    constructor() {
        super();
        this.keys = {};
        this.speed = 5; // Units per second
        this._onKeyDown = (e) => { this.keys[e.code] = true; };
        this._onKeyUp = (e) => { this.keys[e.code] = false; };
    }

    init(entity) {
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    update(entity, deltaTime, game) {
        // Basic WASD movement
        if (this.keys['KeyW']) entity.position.z -= this.speed * deltaTime;
        if (this.keys['KeyS']) entity.position.z += this.speed * deltaTime;
        if (this.keys['KeyA']) entity.position.x -= this.speed * deltaTime;
        if (this.keys['KeyD']) entity.position.x += this.speed * deltaTime;
        // Add more controls as needed
    }

    destroy(entity) {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
}