/**
 * ExamplePlugin - Template for JS plugin modules.
 * Fill in the fields and logic for your custom plugin.
 */
export default {
    name: 'YourPluginName',
    version: '1.0.0',
    description: 'Describe what your plugin adds or changes.',
    /**
     * Called when the plugin is loaded.
     * @param {Game} game - The main game instance.
     */
    init(game) {
        // Example: Register a new entity
        // game.spawnHeart({
        //     color: '#00ffff',
        //     baseSize: 0.5,
        //     health: 20,
        //     scoreValue: 500
        // });

        // Example: Register a custom effect
        // if (game.effects) {
        //     game.effects.register({
        //         type: 'particle',
        //         name: 'myCustomEffect',
        //         color: '#ff00ff',
        //         intensity: 2
        //     });
        // }
    }
};