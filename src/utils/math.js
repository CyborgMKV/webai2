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

/**
 * Calculate the magnitude (length) of a vector.
 */
export function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize a vector to unit length.
 */
export function normalize(v) {
    const mag = magnitude(v);
    
    // Handle zero-magnitude vectors to prevent NaN
    if (mag === 0 || !isFinite(mag)) {
        console.warn('Attempting to normalize zero or invalid magnitude vector:', v);
        return { x: 0, y: 0, z: 1 }; // Return a default unit vector pointing in Z direction
    }
    
    return {
        x: v.x / mag,
        y: v.y / mag,
        z: v.z / mag
    };
}

/**
 * Safely normalize a THREE.js Vector3, handling zero-length vectors.
 * @param {THREE.Vector3} vector - The vector to normalize
 * @param {THREE.Vector3} fallback - Optional fallback vector if normalization fails
 * @returns {THREE.Vector3} The normalized vector or fallback
 */
export function safeNormalize(vector, fallback = null) {
    const length = vector.length();
    
    if (length === 0 || !isFinite(length)) {
        console.warn('Attempting to normalize zero or invalid length vector:', vector);
        if (fallback) {
            return fallback.clone();
        }
        // Return a default unit vector
        return new (vector.constructor)(0, 0, 1);
    }
    
    return vector.clone().normalize();
}

/**
 * Validate and sanitize a position vector to prevent NaN values.
 * @param {THREE.Vector3} position - The position vector to validate
 * @returns {THREE.Vector3} A sanitized position vector
 */
export function sanitizePosition(position) {
    const sanitized = position.clone();
    
    // Check each component and replace NaN/Infinity with zero
    if (!isFinite(sanitized.x)) {
        console.warn('Position has invalid x component:', sanitized.x, 'replacing with 0');
        sanitized.x = 0;
    }
    if (!isFinite(sanitized.y)) {
        console.warn('Position has invalid y component:', sanitized.y, 'replacing with 0');
        sanitized.y = 0;
    }
    if (!isFinite(sanitized.z)) {
        console.warn('Position has invalid z component:', sanitized.z, 'replacing with 0');
        sanitized.z = 0;
    }
    
    return sanitized;
}

/**
 * Sanitize a THREE.js BufferGeometry to remove NaN/Infinity values.
 * @param {THREE.BufferGeometry} geometry - The geometry to sanitize
 * @returns {boolean} True if sanitization was needed, false otherwise
 */
export function sanitizeGeometry(geometry) {
    if (!geometry || !geometry.attributes) {
        console.warn('sanitizeGeometry: Invalid geometry passed');
        return false;
    }
    
    let sanitized = false;
    let invalidCount = 0;
    
    // Check position attribute (most critical)
    if (geometry.attributes.position) {
        const positions = geometry.attributes.position.array;
        let positionSanitized = false;
        
        for (let i = 0; i < positions.length; i++) {
            if (!isFinite(positions[i])) {
                if (invalidCount < 10) { // Limit console spam
                    console.warn(`sanitizeGeometry: Found invalid position value at index ${i}:`, positions[i]);
                }
                positions[i] = 0;
                positionSanitized = true;
                invalidCount++;
            }
        }
        
        if (positionSanitized) {
            geometry.attributes.position.needsUpdate = true;
            sanitized = true;
        }
    }
    
    // Check normal attribute
    if (geometry.attributes.normal) {
        const normals = geometry.attributes.normal.array;
        let normalSanitized = false;
        
        for (let i = 0; i < normals.length; i++) {
            if (!isFinite(normals[i])) {
                if (invalidCount < 10) {
                    console.warn(`sanitizeGeometry: Found invalid normal value at index ${i}:`, normals[i]);
                }
                normals[i] = i % 3 === 2 ? 1 : 0; // Default normal pointing up (0, 0, 1)
                normalSanitized = true;
                invalidCount++;
            }
        }
        
        if (normalSanitized) {
            geometry.attributes.normal.needsUpdate = true;
            sanitized = true;
        }
    }
    
    // Check UV attribute
    if (geometry.attributes.uv) {
        const uvs = geometry.attributes.uv.array;
        let uvSanitized = false;
        
        for (let i = 0; i < uvs.length; i++) {
            if (!isFinite(uvs[i])) {
                if (invalidCount < 10) {
                    console.warn(`sanitizeGeometry: Found invalid UV value at index ${i}:`, uvs[i]);
                }
                uvs[i] = i % 2; // Default UVs to 0 or 1
                uvSanitized = true;
                invalidCount++;
            }
        }
        
        if (uvSanitized) {
            geometry.attributes.uv.needsUpdate = true;
            sanitized = true;
        }
    }
    
    // Check color attribute
    if (geometry.attributes.color) {
        const colors = geometry.attributes.color.array;
        let colorSanitized = false;
        
        for (let i = 0; i < colors.length; i++) {
            if (!isFinite(colors[i])) {
                if (invalidCount < 10) {
                    console.warn(`sanitizeGeometry: Found invalid color value at index ${i}:`, colors[i]);
                }
                colors[i] = 1; // Default to white
                colorSanitized = true;
                invalidCount++;
            }
        }
        
        if (colorSanitized) {
            geometry.attributes.color.needsUpdate = true;
            sanitized = true;
        }
    }
    
    // Check index attribute
    if (geometry.index) {
        const indices = geometry.index.array;
        let indexSanitized = false;
        
        for (let i = 0; i < indices.length; i++) {
            if (!isFinite(indices[i]) || indices[i] < 0) {
                if (invalidCount < 10) {
                    console.warn(`sanitizeGeometry: Found invalid index value at index ${i}:`, indices[i]);
                }
                indices[i] = 0; // Default to first vertex
                indexSanitized = true;
                invalidCount++;
            }
        }
        
        if (indexSanitized) {
            geometry.index.needsUpdate = true;
            sanitized = true;
        }
    }
    
    // Safely recompute bounding volumes if we made changes
    if (sanitized) {
        try {
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
            
            // Validate bounding box
            if (geometry.boundingBox) {
                const box = geometry.boundingBox;
                if (!isFinite(box.min.x) || !isFinite(box.min.y) || !isFinite(box.min.z) ||
                    !isFinite(box.max.x) || !isFinite(box.max.y) || !isFinite(box.max.z)) {
                    console.warn('sanitizeGeometry: Invalid bounding box detected, resetting');
                    geometry.boundingBox = null;
                }
            }
            
            // Validate bounding sphere
            if (geometry.boundingSphere) {
                const sphere = geometry.boundingSphere;
                if (!isFinite(sphere.center.x) || !isFinite(sphere.center.y) || !isFinite(sphere.center.z) ||
                    !isFinite(sphere.radius) || sphere.radius < 0) {
                    console.warn('sanitizeGeometry: Invalid bounding sphere detected, resetting');
                    geometry.boundingSphere = null;
                }
            }
            
            if (invalidCount > 10) {
                console.warn(`sanitizeGeometry: Found ${invalidCount} invalid values (showing first 10)`);
            }
            console.log(`sanitizeGeometry: Geometry sanitized, fixed ${invalidCount} invalid values`);
        } catch (error) {
            console.error('sanitizeGeometry: Error during bounding volume computation:', error);
        }
    }
    
    return sanitized;
}

/**
 * Deep sanitization for geometry that may be severely corrupted
 * @param {THREE.BufferGeometry} geometry - The geometry to sanitize
 * @returns {boolean} True if sanitization was successful
 */
export function deepSanitizeGeometry(geometry) {
    if (!geometry || !geometry.attributes) {
        return false;
    }
    
    try {
        // First try normal sanitization
        const basicSanitized = sanitizeGeometry(geometry);
        
        // If geometry is still problematic, try more aggressive measures
        if (geometry.attributes.position) {
            const positions = geometry.attributes.position.array;
            let hasValidData = false;
            
            // Check if we have any valid position data
            for (let i = 0; i < positions.length; i += 3) {
                if (isFinite(positions[i]) && isFinite(positions[i + 1]) && isFinite(positions[i + 2])) {
                    hasValidData = true;
                    break;
                }
            }
            
            if (!hasValidData) {
                console.error('deepSanitizeGeometry: No valid position data found, geometry is completely corrupted');
                return false;
            }
        }
        
        // Force update all attributes
        Object.keys(geometry.attributes).forEach(key => {
            geometry.attributes[key].needsUpdate = true;
        });
        
        if (geometry.index) {
            geometry.index.needsUpdate = true;
        }
        
        return true;
    } catch (error) {
        console.error('deepSanitizeGeometry: Failed to sanitize geometry:', error);
        return false;
    }
}