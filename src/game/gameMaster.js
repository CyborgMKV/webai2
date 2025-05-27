/**
 * GameMaster class to manage game rules, configuration, and overall game state.
 */
export default class GameMaster {
    constructor(config) {
        this.config = config || {};
        console.log('GameMaster initialized with config:', this.config);
    }

    /**
     * Returns the full game configuration object.
     * @returns {Object}
     */
    getFullConfig() {
        return this.config;
    }

    /**
     * Returns the player-specific configuration.
     * @returns {Object | null}
     */
    getPlayerConfig() {
        return this.config && this.config.player ? this.config.player : null;
    }

    /**
     * Returns the flying robot-specific configuration.
     * @returns {Object | null}
     */
    getFlyingRobotConfig() {
        return this.config && this.config.flyingRobot ? this.config.flyingRobot : null;
    }

    /**
     * Returns the heart-specific configuration.
     * @returns {Object | null}
     */
    getHeartConfig() {
        return this.config && this.config.heart ? this.config.heart : null;
    }

    /**
     * Returns the level-specific configuration.
     * @returns {Object | null}
     */
    getLevelConfig() {
        return this.config && this.config.level ? this.config.level : null;
    }
}
