/**
 * AnimationManagerComponent for controlling model animations.
 * Attach to any entity with an animated THREE.Group or Mesh.
 * Useful for animation/asset testing and plugin onboarding.
 */
import Component from '../engine/component.js';
import * as THREE from '../../libs/three/three.module.js';
// Add GLTFLoader/DRACOLoader if used

export default class AnimationManagerComponent extends Component {
    constructor() {
        super();
        this.mixer = null;
        this.actions = {};
        this.activeAction = null;
    }

    /**
     * @param {Entity} entity
     */
    init(entity) {
        if (!entity.model || !entity.model.animations || entity.model.animations.length === 0) return;
        if (!THREE.AnimationMixer) return;

        this.mixer = new THREE.AnimationMixer(entity.model);
        entity.model.animations.forEach((clip) => {
            this.actions[clip.name] = this.mixer.clipAction(clip);
        });
        // Play the first animation by default
        const first = Object.values(this.actions)[0];
        if (first) {
            first.play();
            this.activeAction = first;
        }
    }

    /**
     * Call every frame to update animation.
     */
    update(entity, deltaTime, game) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }

    /**
     * Play a specific animation by name.
     */
    play(name) {
        if (this.activeAction) this.activeAction.stop();
        if (this.actions[name]) {
            this.actions[name].play();
            this.activeAction = this.actions[name];
        }
    }

    /**
     * Set animation speed.
     */
    setSpeed(speed = 1) {
        if (this.activeAction) {
            this.activeAction.setEffectiveTimeScale(speed);
        }
    }

    /**
     * Stop all animations.
     */
    stopAll() {
        Object.values(this.actions).forEach(action => action.stop());
        this.activeAction = null;
    }

    destroy(entity) {
        this.stopAll();
        this.mixer = null;
        this.actions = {};
        this.activeAction = null;
    }
}