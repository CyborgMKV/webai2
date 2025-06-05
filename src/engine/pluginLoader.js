import Shark from '../game/shark.js'; // Import Shark class

/**
 * PluginLoader for registering and loading plugins (entities, effects, UI, etc.).
 * Supports both JSON and JS module plugins.
 */
export default class PluginLoader {
    constructor(game) {
        this.game = game; // Store the game instance
        this.plugins = [];
    }

    /**
     * Register a plugin (object or function).
     * @param {Object|Function} plugin 
     */
    register(plugin) {
        this.plugins.push(plugin);
        console.log(`PluginLoader: Registering plugin - Name: ${plugin.name || 'N/A'}, Version: ${plugin.version || 'N/A'}`);


        // If it's a JSON plugin with entities or effects, process them
        if (plugin.entities && this.game) {
            plugin.entities.forEach(entityConfig => {
                console.log(`PluginLoader: Processing entity type: ${entityConfig.type} with config:`, entityConfig);
                if (entityConfig.type === 'heart') {
                    this.game.spawnHeart(entityConfig); // Assuming Game class has spawnHeart
                } else if (entityConfig.type === 'shark') {
                    console.log('PluginLoader: Attempting to spawn Shark with config:', entityConfig);

                    // Prepare options for the Shark constructor by spreading entityConfig 
                    // and then specifically adding health and points from sharkStats.
                    const sharkOptions = { ...entityConfig }; 

                    if (entityConfig.sharkStats) {
                        if (typeof entityConfig.sharkStats.health === 'number') {
                            sharkOptions.health = entityConfig.sharkStats.health;
                        }
                        if (typeof entityConfig.sharkStats.points === 'number') {
                            sharkOptions.points = entityConfig.sharkStats.points;
                        }
                        // Optionally, delete sharkOptions.sharkStats if you want to keep the final options object clean,
                        // though it's not strictly necessary for functionality.
                        // delete sharkOptions.sharkStats; 
                    }

                    // The Shark constructor takes 'game' as the first argument, then 'options'
                    const shark = new Shark(this.game, sharkOptions); 
                    this.game.addEntity(shark); // Add shark to game's entity list
                    // The Shark class itself handles adding its mesh to the scene in its loadModel method.
                    // Update log to show health if available in sharkOptions
                    let logMessage = `PluginLoader: Shark entity '${sharkOptions.name || 'Unnamed Shark'}' created and added to game.`;
                    if (typeof sharkOptions.health === 'number') {
                        logMessage += ` Health: ${sharkOptions.health}.`;
                    }
                     if (typeof sharkOptions.points === 'number') {
                        logMessage += ` Points: ${sharkOptions.points}.`;
                    }
                    console.log(logMessage);
                } else {
                    console.warn(`PluginLoader: Unknown entity type '${entityConfig.type}' in plugin '${plugin.name}'.`);
                }
                // Future: Add more entity types here or a more generic spawning mechanism
            });
        }

        if (plugin.effects && this.game && this.game.effects && typeof this.game.effects.register === 'function') {
            plugin.effects.forEach(effectConfig => {
                console.log('PluginLoader: Registering effect:', effectConfig);
                this.game.effects.register(effectConfig);
            });
        }

        // For JS module plugins that have an init function
        if (typeof plugin.init === 'function') {
            console.log(`PluginLoader: Initializing JS plugin: ${plugin.name || 'Unnamed JS Plugin'}`);
            try {
                 plugin.init(this.game);
            } catch (e) {
                // Fallback for init functions that don't expect an argument or other errors
                if (e instanceof TypeError && (e.message.includes("arguments") || e.message.includes("without 'new'"))) { 
                    console.warn(`PluginLoader: plugin.init for '${plugin.name || 'Unnamed Plugin'}' likely does not accept a game instance or is a class. Attempting fallback. Error: ${e.message}`);
                    try {
                        plugin.init();
                    } catch (e2) {
                         console.error(`PluginLoader: Error in fallback plugin.init for '${plugin.name || 'Unnamed Plugin'}':`, e2);
                    }
                } else if (e instanceof TypeError && e.message.includes("plugin.init is not a function")){
                     console.error(`PluginLoader: plugin.init was checked as function but error occurred for '${plugin.name || 'Unnamed Plugin'}':`, e);
                }
                 else {
                    console.error(`PluginLoader: Error initializing plugin '${plugin.name || 'Unnamed Plugin'}':`, e);
                }
            }
        }
    }

    /**
     * Load a plugin from a JS module or JSON file.
     * @param {string} path 
     * @returns {Promise<void>}
     */
    async load(path) {
        console.log(`PluginLoader: Attempting to load plugin from ${path}`);
        if (path.endsWith('.js')) {
            try {
                // Ensure the path is relative to the current module or an absolute path recognized by the module system.
                // For web, relative paths are usually relative to the HTML file or handled by a bundler.
                // The /* @vite-ignore */ might be needed if dynamic import path issues arise with Vite or similar tools.
                const module = await import(/* @vite-ignore */ path);
                this.register(module.default || module);
                console.log(`PluginLoader: JS plugin loaded and registered from ${path}`);
            } catch (error) {
                 console.error(`PluginLoader: Error loading JS plugin from ${path}:`, error);
            }
        } else if (path.endsWith('.json')) {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();
                this.register(json); 
                console.log(`PluginLoader: JSON plugin loaded and registered from ${path}`);
            } catch (error) {
                console.error(`PluginLoader: Failed to load JSON plugin from ${path}:`, error);
            }
        } else {
            console.warn(`PluginLoader: Unknown plugin type for path ${path}. Only .js and .json supported.`);
        }
    }

    /**
     * Initialize all plugins (call their init if present).
     * This is mostly for JS module plugins. JSON plugins are largely handled at registration.
     * The primary init call for JS plugins is now in register.
     */
    initAll() {
        console.log("PluginLoader: initAll called. Note: JS plugin init is primarily handled during registration.");
        for (const plugin of this.plugins) {
            if (typeof plugin.init === 'function') {
                // console.log(`PluginLoader: Checking init for plugin: ${plugin.name || 'Unnamed JS Plugin'} during initAll.`);
                // Init is called in register. If re-initialization is needed, this is where it could go.
            }
        }
    }

    /**
     * Call a hook on all plugins.
     * @param {string} hookName 
     * @param  {...any} args 
     */
    callHook(hookName, ...args) {
        for (const plugin of this.plugins) {
            if (typeof plugin[hookName] === 'function') {
                try {
                    plugin[hookName](...args);
                } catch (error) {
                    console.error(`PluginLoader: Error in hook '${hookName}' for plugin '${plugin.name || 'Unnamed Plugin'}':`, error);
                }
            }
        }
    }
}
