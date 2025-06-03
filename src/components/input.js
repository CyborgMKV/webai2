import Component from '../engine/component.js';

export default class InputComponent extends Component {
    constructor() {
        super();
        this.keys = {};
        this.speed = 5; // Units per second
        this.shootKeyPressed = false; // Flag to handle single press for shoot

        // Bind methods to ensure 'this' context is correct in event listeners
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
    }

    init(entity) {
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        console.log("InputComponent initialized, listening for key events. (v2)"); // Added v2
    }

    _onKeyDown(e) {
        this.keys[e.code] = true;
    }

    _onKeyUp(e) {
        this.keys[e.code] = false;
        if (e.code === 'Space') {
            this.shootKeyPressed = false; 
            // console.log("Spacebar released (keyup event) (v2)"); // Optional: uncomment if needed
        }
    }

    update(entity, deltaTime, game) {
        // Basic WASD movement
        if (this.keys['KeyW']) entity.position.z -= this.speed * deltaTime;
        if (this.keys['KeyS']) entity.position.z += this.speed * deltaTime;
        if (this.keys['KeyA']) entity.position.x -= this.speed * deltaTime;
        if (this.keys['KeyD']) entity.position.x += this.speed * deltaTime;

        // Shooting action
        if (this.keys['Space']) {
            if (!this.shootKeyPressed) { 
                if (typeof entity.shoot === 'function') {
                    console.log(`InputComponent.update: Spacebar pressed. Calling shoot() on entity: ${entity.type} (v2)`);
                    entity.shoot();
                } else {
                    console.warn(`InputComponent.update: Entity ${entity.type} does not have a shoot method. (v2)`);
                }
                this.shootKeyPressed = true; 
            }
        } else {
            this.shootKeyPressed = false; 
        }
    }

    destroy(entity) {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        console.log("InputComponent destroyed, removed key event listeners. (v2)"); // Added v2
    }
}
