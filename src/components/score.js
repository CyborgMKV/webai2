/**
 * ScoreComponent for managing score and point events.
 * Attach to the player or any entity that can earn points.
 */
import Component from '../engine/component.js';

export default class ScoreComponent extends Component {
    constructor() {
        super();
        this.score = 0;
    }

    init(entity) {
        entity.score = this.score;
    }

    /**
     * Add points to the entity's score.
     * @param {Entity} entity 
     * @param {number} points 
     */
    addPoints(entity, points) {
        this.score += points;
        entity.score = this.score;
        // Optionally trigger UI update or event
    }
}