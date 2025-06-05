import Component from '../engine/component.js';

export default class InputComponent extends Component {
    constructor() {
        super();
        this.keys = {};
        this.speed = 10; // Movement speed in space
        this.fastSpeed = 20; // Fast movement speed with Shift
        this.shootKeyPressed = false; // Flag to handle single press for shoot
        this.mouseSensitivity = 0.002; // Mouse sensitivity for camera
        this.zoomSpeed = 2; // Scroll zoom speed

        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.isPointerLocked = false;

        // Camera control
        this.pitch = 0; // Up/down rotation
        this.yaw = 0;   // Left/right rotation
        this.maxPitch = Math.PI / 2 - 0.1; // Prevent full vertical flip

        // Bind methods to ensure 'this' context is correct in event listeners
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onPointerLockChange = this._onPointerLockChange.bind(this);
    }

    init(entity) {
        // Keyboard events
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        
        // Mouse events
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('wheel', this._onWheel);
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', this._onPointerLockChange);
        
        console.log("InputComponent initialized with movement and camera controls");
    }

    _onKeyDown(e) {
        this.keys[e.code] = true;
    }

    _onKeyUp(e) {
        this.keys[e.code] = false;
        if (e.code === 'Space') {
            this.shootKeyPressed = false;
        }
    }

    _onMouseMove(e) {
        if (this.isPointerLocked) {
            this.yaw -= e.movementX * this.mouseSensitivity;
            this.pitch -= e.movementY * this.mouseSensitivity;
            this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
        }
    }

    _onMouseDown(e) {
        // Request pointer lock on mouse click
        if (!this.isPointerLocked) {
            document.body.requestPointerLock();
        }
    }

    _onWheel(e) {
        // Zoom in/out with scroll wheel
        const zoomDelta = e.deltaY > 0 ? this.zoomSpeed : -this.zoomSpeed;
        this.applyZoom(zoomDelta);
    }

    _onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;
    }

    applyZoom(delta) {
        // This will be handled by the camera system
        if (this.entity && this.entity.game && this.entity.game.app && this.entity.game.app.camera) {
            const camera = this.entity.game.app.camera;
            camera.position.multiplyScalar(1 + delta * 0.1);
        }
    }

    update(entity, deltaTime, game) {
        this.entity = entity; // Store reference for zoom
        
        // Calculate movement vector based on input
        const movement = { x: 0, y: 0, z: 0 };
        const currentSpeed = this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? this.fastSpeed : this.speed;

        // Movement controls: W/S forward/back, A/D left/right, Q/E up/down
        if (this.keys['KeyW']) movement.z -= currentSpeed;
        if (this.keys['KeyS']) movement.z += currentSpeed;
        if (this.keys['KeyA']) movement.x -= currentSpeed;
        if (this.keys['KeyD']) movement.x += currentSpeed;
        if (this.keys['KeyQ']) movement.y -= currentSpeed; // Down
        if (this.keys['KeyE']) movement.y += currentSpeed; // Up

        // Apply movement using physics if available
        this.applyMovement(entity, movement, deltaTime);

        // Apply camera rotation
        this.updateCamera(entity, game);

        // Shooting action
        if (this.keys['Space']) {
            if (!this.shootKeyPressed) {
                if (typeof entity.shoot === 'function') {
                    console.log(`InputComponent: Shooting with ${entity.type}`);
                    entity.shoot();
                } else {
                    console.warn(`InputComponent: Entity ${entity.type} does not have a shoot method`);
                }
                this.shootKeyPressed = true;
            }
        } else {
            this.shootKeyPressed = false;
        }
    }    applyMovement(entity, movement, deltaTime) {
        const physicsComponent = entity.getComponent('physics');
        
        if (physicsComponent && physicsComponent.rigidBody) {
            // Use physics-based movement with reduced force to prevent glitching
            const force = {
                x: movement.x * 20, // Reduced from 50 to 20
                y: movement.y * 20,
                z: movement.z * 20
            };
            
            // Apply force to physics body
            physicsComponent.rigidBody.addForce(force, true);
            
            // Improved damping to prevent erratic movement
            const currentVel = physicsComponent.rigidBody.linvel();
            const damping = 0.85; // Stronger damping for better control
            physicsComponent.rigidBody.setLinvel({
                x: currentVel.x * damping,
                y: currentVel.y * damping,
                z: currentVel.z * damping
            }, true);
            
            // Update entity position from physics body
            const physicsPos = physicsComponent.rigidBody.translation();
            entity.position.set(physicsPos.x, physicsPos.y, physicsPos.z);
            
        } else {
            // Fallback to direct position modification
            entity.position.x += movement.x * deltaTime;
            entity.position.y += movement.y * deltaTime;
            entity.position.z += movement.z * deltaTime;
        }
    }

    updateCamera(entity, game) {
        if (!game || !game.app || !game.app.camera) return;

        const camera = game.app.camera;
        
        // Update camera rotation based on mouse movement
        camera.rotation.order = 'YXZ';
        camera.rotation.y = this.yaw;
        camera.rotation.x = this.pitch;

        // Position camera relative to player
        const offset = { x: 0, y: 2, z: 5 }; // Camera offset behind and above player
        const playerPos = entity.position;
        
        // Apply rotation to offset
        const cos = Math.cos(this.yaw);
        const sin = Math.sin(this.yaw);
        
        camera.position.set(
            playerPos.x + offset.z * sin + offset.x * cos,
            playerPos.y + offset.y,
            playerPos.z + offset.z * cos - offset.x * sin
        );
        
        // Make camera look at player
        camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
    }

    destroy(entity) {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('wheel', this._onWheel);
        document.removeEventListener('pointerlockchange', this._onPointerLockChange);
        
        console.log("InputComponent destroyed, removed all event listeners");
    }
}
