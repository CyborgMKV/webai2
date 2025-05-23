/**
 * Simple game state manager.
 */
export default class GameState {
    constructor(initialState = 'menu') {
        this.state = initialState;
        this.listeners = [];
    }

    setState(newState) {
        this.state = newState;
        this.listeners.forEach(fn => fn(newState));
    }

    getState() {
        return this.state;
    }

    onChange(fn) {
        this.listeners.push(fn);
    }
}