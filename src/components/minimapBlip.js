import Component from '../engine/component.js';

/**
 * MinimapBlipComponent
 * Draws a blip for the entity on the minimap.
 * 
 * expand this to show icons, orientation, etc.
 * 
 */
export default class MinimapBlipComponent extends Component {
    /**
     * Called every frame to update the blip on the minimap.
     * @param {Entity} entity
     * @param {number} deltaTime
     * @param {Game} game
     */
    update(entity, deltaTime, game) {
        // Assume game.minimap is a reference to your minimap system
        if (!game.minimap || !game.minimap.ctx) return;

        // Get minimap context and settings
        const ctx = game.minimap.ctx;
        const minimapSize = game.minimap.size || 200;
        const worldRadius = game.minimap.worldRadius || 50; // Adjust as needed

        // Project entity position to minimap coordinates (top-down, XZ plane)
        const x = entity.position.x;
        const z = entity.position.z;

        // Center of minimap
        const centerX = minimapSize / 2;
        const centerY = minimapSize / 2;

        // Scale world position to minimap
        const scale = (minimapSize / 2) / worldRadius;
        const blipX = centerX + x * scale;
        const blipY = centerY + z * scale;

        // Choose color based on entity type
        let color = 'white';
        if (entity.type === 'player') color = 'lime';
        else if (entity.type === 'flyingRobot') color = 'red';
        else if (entity.type === 'Earth') color = 'blue';

        // Draw the blip
        ctx.save();
        ctx.beginPath();
        ctx.arc(blipX, blipY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.restore();
    }
}