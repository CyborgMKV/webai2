/**
 * Math utilities for the game.
 */

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation.
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Get a random float between min and max.
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get a random integer between min and max (inclusive).
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate distance between two points in 3D.
 */
export function distance3D(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// This file contains utility functions for mathematical calculations used in the game, such as vector operations.

function addVectors(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}

function subtractVectors(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };
}

function multiplyVectorByScalar(v, scalar) {
    return {
        x: v.x * scalar,
        y: v.y * scalar,
        z: v.z * scalar
    };
}

function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize(v) {
    const mag = magnitude(v);
    return {
        x: v.x / mag,
        y: v.y / mag,
        z: v.z / mag
    };
}