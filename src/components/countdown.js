/**
 * CountdownComponent for displaying a countdown overlay.
 * Use for heart regrow, respawn, or event timers.
 */
import Component from '../engine/component.js';

export default class CountdownComponent extends Component {
    constructor() {
        super();
        this.overlay = null;
        this.timeLeft = 0;
        this.active = false;
    }

    /**
     * Start the countdown.
     * @param {number} seconds
     */
    start(seconds) {
        this.timeLeft = seconds;
        this.active = true;
        if (this.overlay) this.overlay.style.display = 'block';
    }

    init(entity) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'countdown-overlay';
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '50%';
        this.overlay.style.left = '50%';
        this.overlay.style.transform = 'translate(-50%, -50%)';
        this.overlay.style.fontSize = '64px';
        this.overlay.style.color = '#fff';
        this.overlay.style.fontWeight = 'bold';
        this.overlay.style.textShadow = '2px 2px 8px #000';
        this.overlay.style.zIndex = '100';
        this.overlay.style.display = 'none';
        document.body.appendChild(this.overlay);
    }

    update(entity, deltaTime, game) {
        if (!this.active) return;
        this.timeLeft -= deltaTime;
        if (this.timeLeft > 0) {
            this.overlay.textContent = Math.ceil(this.timeLeft);
        } else {
            this.overlay.textContent = '';
            this.overlay.style.display = 'none';
            this.active = false;
            // Optionally emit an event or callback here
        }
    }

    destroy(entity) {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}