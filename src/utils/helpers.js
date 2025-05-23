import * as THREE from '../../libs/three/three.module.js';

/**
 * General utility functions for the game.
 */

/**
 * Deep clone an object (simple version).
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge two objects (shallow).
 */
export function merge(target, source) {
    return Object.assign({}, target, source);
}

/**
 * Generate a unique ID.
 */
let _id = 0;
export function generateId() {
    _id += 1;
    return _id;
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Load a texture using THREE.TextureLoader.
 */
export function loadTexture(url) {
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, resolve, undefined, reject);
    });
}

/**
 * Load a GLTF model using THREE.GLTFLoader.
 * Note: Pass an instance of GLTFLoader as the second argument.
 */
export function loadModel(url, GLTFLoader) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url, resolve, undefined, reject);
    });
}

/**
 * Create a DOM element with optional class and text.
 */
export function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
}

/**
 * Placeholder for setting game state.
 */
export function setGameState(state) {
    // Logic to set the current game state
}

/**
 * Placeholder for getting game state.
 */
export function getGameState() {
    // Logic to get the current game state
}