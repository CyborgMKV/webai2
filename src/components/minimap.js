/**
 * MinimapComponent for displaying a radar/minimap overlay.
 * Shows player and other entities in 2D.
 */
import Component from '../engine/component.js';
import Earth from '../game/earth.js';

export default class MinimapComponent extends Component {
    constructor(options = {}) {
        super();
        this.size = options.size || 150;
        this.range = options.range || 100; // World units shown on minimap
        this.canvas = null;
        this.ctx = null;
    }

    init(entity) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.position = 'absolute';
        this.canvas.style.bottom = '20px';
        this.canvas.style.left = '20px';
        this.canvas.style.background = 'rgba(40,40,40,0.7)';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.zIndex = '20';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    update(entity, deltaTime, game) {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.size, this.size);

        // Draw player at center
        const center = this.size / 2;
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(center, center, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw other entities (robots, hearts, etc.)
        for (const e of game.entities) {
            if (e === entity) continue; // Skip player
            let color = '#ff4444';
            if (e.type === 'earth' || e instanceof Earth) color = '#3399ff'; // Earth is blue

            // Calculate relative position
            const dx = (e.position.x - entity.position.x) / this.range * center;
            const dz = (e.position.z - entity.position.z) / this.range * center;
            const x = center + dx;
            const y = center + dz;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, e.type === 'earth' ? 8 : 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    destroy(entity) {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}