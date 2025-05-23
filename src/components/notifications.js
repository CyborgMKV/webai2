/**
 * NotificationsComponent for displaying temporary messages.
 * Use for level up, pickups, errors, etc.
 */
import Component from '../engine/component.js';

export default class NotificationsComponent extends Component {
    constructor() {
        super();
        this.container = null;
    }

    init(entity) {
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '40px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.zIndex = '200';
        this.container.style.pointerEvents = 'none';
        document.body.appendChild(this.container);
    }

    /**
     * Show a notification message for a set duration.
     * @param {string} message
     * @param {number} duration (ms)
     */
    show(message, duration = 2000) {
        const note = document.createElement('div');
        note.className = 'notification';
        note.style.background = 'rgba(0,0,0,0.7)';
        note.style.color = '#fff';
        note.style.padding = '12px 24px';
        note.style.margin = '8px 0';
        note.style.borderRadius = '8px';
        note.style.fontSize = '24px';
        note.style.textAlign = 'center';
        note.style.boxShadow = '0 2px 8px #0008';
        note.textContent = message;
        this.container.appendChild(note);
        setTimeout(() => {
            if (note.parentNode) note.parentNode.removeChild(note);
        }, duration);
    }

    destroy(entity) {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}