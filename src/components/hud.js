/**
 * HUDComponent for displaying player info (score, health, etc.).
 * Expand for minimap, countdowns, notifications, etc.
 */
import Component from '../engine/component.js';

export default class HUDComponent extends Component {
    constructor() {
        super();
        this.ui = null;
    }

    init(entity) {
        // Create HUD container
        this.ui = document.createElement('div');
        this.ui.id = 'game-ui';
        this.ui.style.position = 'absolute';
        this.ui.style.top = '20px';
        this.ui.style.left = '20px';
        this.ui.style.color = 'white';
        this.ui.style.fontFamily = 'Arial, sans-serif';
        this.ui.style.zIndex = '10';

        // Score display
        this.scoreElem = document.createElement('div');
        this.scoreElem.className = 'score';
        this.ui.appendChild(this.scoreElem);

        // Health bar
        this.healthBar = document.createElement('div');
        this.healthBar.className = 'health-bar';
        this.health = document.createElement('div');
        this.health.className = 'health';
        this.healthBar.appendChild(this.health);
        this.ui.appendChild(this.healthBar);

        document.body.appendChild(this.ui);
    }

    update(entity, deltaTime, game) {
        // Update score
        this.scoreElem.textContent = `Score: ${entity.score || 0}`;
        // Update health bar
        const healthPercent = entity.health / (entity.maxHealth || 1);
        this.health.style.width = `${Math.max(0, Math.min(1, healthPercent)) * 100}%`;
    }

    destroy(entity) {
        if (this.ui && this.ui.parentNode) {
            this.ui.parentNode.removeChild(this.ui);
        }
    }
}