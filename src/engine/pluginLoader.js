/**
 * PluginLoader for registering and loading plugins (entities, effects, UI, etc.).
 * Supports both JSON and JS module plugins.
 */
export default class PluginLoader {
    constructor() {
        this.plugins = [];
    }

    /**
     * Register a plugin (object or function).
     * @param {Object|Function} plugin 
     */
    register(plugin) {
        this.plugins.push(plugin);
        if (typeof plugin.init === 'function') {
            plugin.init();
        }
    }

    /**
     * Load a plugin from a JS module or JSON file.
     * @param {string} path 
     * @returns {Promise<void>}
     */
    async load(path) {
        if (path.endsWith('.js')) {
            const module = await import(/* @vite-ignore */ path);
            this.register(module.default || module);
        } else if (path.endsWith('.json')) {
            const response = await fetch(path);
            const json = await response.json();
            this.register(json);
        }
    }

    /**
     * Initialize all plugins (call their init if present).
     */
    initAll() {
        for (const plugin of this.plugins) {
            if (typeof plugin.init === 'function') {
                plugin.init();
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
                plugin[hookName](...args);
            }
        }
    }
}