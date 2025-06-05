/**
 * Geometry Validator and Repair System
 * Provides comprehensive geometry validation and repair for THREE.js BufferGeometry
 */

import * as THREE from '../../libs/three/three.module.js';
import { sanitizeGeometry, deepSanitizeGeometry } from './math.js';

export class GeometryValidator {
    constructor() {
        this.validationResults = new Map();
        this.repairHistory = [];
        this.stats = {
            validated: 0,
            repaired: 0,
            failed: 0,
            totalInvalidValues: 0
        };
    }
    
    /**
     * Validate a geometry and return detailed results
     * @param {THREE.BufferGeometry} geometry - The geometry to validate
     * @param {string} identifier - Optional identifier for tracking
     * @returns {Object} Validation results
     */
    validateGeometry(geometry, identifier = 'unknown') {
        this.stats.validated++;
        
        const result = {
            identifier,
            timestamp: Date.now(),
            isValid: true,
            errors: [],
            warnings: [],
            attributes: {},
            vertexCount: 0,
            triangleCount: 0
        };
        
        if (!geometry) {
            result.isValid = false;
            result.errors.push('Geometry is null or undefined');
            return result;
        }
        
        if (!geometry.attributes) {
            result.isValid = false;
            result.errors.push('Geometry has no attributes');
            return result;
        }
        
        // Validate position attribute (required)
        if (!geometry.attributes.position) {
            result.isValid = false;
            result.errors.push('Missing position attribute');
        } else {
            const positionResult = this.validateAttribute(geometry.attributes.position, 'position', 3);
            result.attributes.position = positionResult;
            result.vertexCount = positionResult.count / 3;
            
            if (!positionResult.isValid) {
                result.isValid = false;
            }
        }
        
        // Validate normal attribute (optional but common)
        if (geometry.attributes.normal) {
            const normalResult = this.validateAttribute(geometry.attributes.normal, 'normal', 3);
            result.attributes.normal = normalResult;
            
            if (!normalResult.isValid) {
                result.warnings.push('Invalid normal attribute detected');
            }
        }
        
        // Validate UV attribute (optional)
        if (geometry.attributes.uv) {
            const uvResult = this.validateAttribute(geometry.attributes.uv, 'uv', 2);
            result.attributes.uv = uvResult;
            
            if (!uvResult.isValid) {
                result.warnings.push('Invalid UV attribute detected');
            }
        }
        
        // Validate color attribute (optional)
        if (geometry.attributes.color) {
            const colorResult = this.validateAttribute(geometry.attributes.color, 'color', 3);
            result.attributes.color = colorResult;
            
            if (!colorResult.isValid) {
                result.warnings.push('Invalid color attribute detected');
            }
        }
        
        // Validate index attribute (optional)
        if (geometry.index) {
            const indexResult = this.validateIndex(geometry.index, result.vertexCount);
            result.attributes.index = indexResult;
            result.triangleCount = indexResult.count / 3;
            
            if (!indexResult.isValid) {
                result.isValid = false;
            }
        } else {
            result.triangleCount = result.vertexCount / 3;
        }
        
        // Validate bounding volumes
        this.validateBoundingVolumes(geometry, result);
        
        // Store result
        this.validationResults.set(identifier, result);
        
        return result;
    }
    
    /**
     * Validate a buffer attribute
     * @param {THREE.BufferAttribute} attribute - The attribute to validate
     * @param {string} name - Name of the attribute
     * @param {number} expectedItemSize - Expected item size
     * @returns {Object} Validation result
     */
    validateAttribute(attribute, name, expectedItemSize) {
        const result = {
            name,
            isValid: true,
            count: attribute.count,
            itemSize: attribute.itemSize,
            arrayLength: attribute.array.length,
            invalidValues: [],
            nanCount: 0,
            infinityCount: 0
        };
        
        // Check item size
        if (attribute.itemSize !== expectedItemSize) {
            result.isValid = false;
            result.invalidValues.push(`Expected itemSize ${expectedItemSize}, got ${attribute.itemSize}`);
        }
        
        // Check array length consistency
        const expectedArrayLength = attribute.count * attribute.itemSize;
        if (attribute.array.length !== expectedArrayLength) {
            result.isValid = false;
            result.invalidValues.push(`Array length mismatch: expected ${expectedArrayLength}, got ${attribute.array.length}`);
        }
        
        // Check for NaN and Infinity values
        for (let i = 0; i < attribute.array.length; i++) {
            const value = attribute.array[i];
            
            if (isNaN(value)) {
                result.nanCount++;
                if (result.invalidValues.length < 10) {
                    result.invalidValues.push(`NaN at index ${i}`);
                }
                result.isValid = false;
            } else if (!isFinite(value)) {
                result.infinityCount++;
                if (result.invalidValues.length < 10) {
                    result.invalidValues.push(`Infinity at index ${i}: ${value}`);
                }
                result.isValid = false;
            }
        }
        
        this.stats.totalInvalidValues += result.nanCount + result.infinityCount;
        
        return result;
    }
    
    /**
     * Validate index attribute
     * @param {THREE.BufferAttribute} index - The index attribute
     * @param {number} vertexCount - Number of vertices
     * @returns {Object} Validation result
     */
    validateIndex(index, vertexCount) {
        const result = {
            name: 'index',
            isValid: true,
            count: index.count,
            arrayLength: index.array.length,
            invalidValues: [],
            outOfRange: 0
        };
        
        for (let i = 0; i < index.array.length; i++) {
            const value = index.array[i];
            
            if (!Number.isInteger(value) || value < 0 || value >= vertexCount) {
                result.outOfRange++;
                if (result.invalidValues.length < 10) {
                    result.invalidValues.push(`Invalid index at ${i}: ${value} (vertex count: ${vertexCount})`);
                }
                result.isValid = false;
            }
        }
        
        return result;
    }
    
    /**
     * Validate bounding volumes
     * @param {THREE.BufferGeometry} geometry - The geometry
     * @param {Object} result - Validation result to update
     */
    validateBoundingVolumes(geometry, result) {
        // Check bounding box
        if (geometry.boundingBox) {
            const box = geometry.boundingBox;
            if (!isFinite(box.min.x) || !isFinite(box.min.y) || !isFinite(box.min.z) ||
                !isFinite(box.max.x) || !isFinite(box.max.y) || !isFinite(box.max.z)) {
                result.warnings.push('Invalid bounding box detected');
            }
        }
        
        // Check bounding sphere
        if (geometry.boundingSphere) {
            const sphere = geometry.boundingSphere;
            if (!isFinite(sphere.center.x) || !isFinite(sphere.center.y) || !isFinite(sphere.center.z) ||
                !isFinite(sphere.radius) || sphere.radius < 0) {
                result.warnings.push('Invalid bounding sphere detected');
            }
        }
    }
    
    /**
     * Attempt to repair a geometry
     * @param {THREE.BufferGeometry} geometry - The geometry to repair
     * @param {string} identifier - Optional identifier
     * @returns {Object} Repair result
     */
    repairGeometry(geometry, identifier = 'unknown') {
        const repairResult = {
            identifier,
            timestamp: Date.now(),
            success: false,
            method: 'none',
            errors: []
        };
        
        try {
            // First, validate the geometry
            const validation = this.validateGeometry(geometry, identifier);
            
            if (validation.isValid) {
                repairResult.success = true;
                repairResult.method = 'no_repair_needed';
                return repairResult;
            }
            
            // Try basic sanitization first
            const basicSanitized = sanitizeGeometry(geometry);
            if (basicSanitized) {
                const revalidation = this.validateGeometry(geometry, identifier + '_basic_repair');
                if (revalidation.isValid) {
                    repairResult.success = true;
                    repairResult.method = 'basic_sanitization';
                    this.stats.repaired++;
                    this.repairHistory.push(repairResult);
                    return repairResult;
                }
            }
            
            // Try deep sanitization
            const deepSanitized = deepSanitizeGeometry(geometry);
            if (deepSanitized) {
                const revalidation = this.validateGeometry(geometry, identifier + '_deep_repair');
                if (revalidation.isValid) {
                    repairResult.success = true;
                    repairResult.method = 'deep_sanitization';
                    this.stats.repaired++;
                    this.repairHistory.push(repairResult);
                    return repairResult;
                }
            }
            
            // Try reconstruction as last resort
            const reconstructed = this.reconstructGeometry(geometry);
            if (reconstructed) {
                repairResult.success = true;
                repairResult.method = 'reconstruction';
                this.stats.repaired++;
                this.repairHistory.push(repairResult);
                return repairResult;
            }
            
            repairResult.errors.push('All repair methods failed');
            this.stats.failed++;
            
        } catch (error) {
            repairResult.errors.push(`Repair failed with error: ${error.message}`);
            this.stats.failed++;
        }
        
        return repairResult;
    }
    
    /**
     * Attempt to reconstruct geometry from valid data
     * @param {THREE.BufferGeometry} geometry - The geometry to reconstruct
     * @returns {boolean} Success status
     */
    reconstructGeometry(geometry) {
        try {
            if (!geometry.attributes.position) {
                return false;
            }
            
            const positions = geometry.attributes.position.array;
            const validPositions = [];
            
            // Extract valid position data
            for (let i = 0; i < positions.length; i += 3) {
                if (isFinite(positions[i]) && isFinite(positions[i + 1]) && isFinite(positions[i + 2])) {
                    validPositions.push(positions[i], positions[i + 1], positions[i + 2]);
                }
            }
            
            if (validPositions.length < 9) { // Need at least 3 vertices
                console.error('GeometryValidator: Not enough valid position data for reconstruction');
                return false;
            }
            
            // Create new position attribute
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(validPositions, 3));
            
            // Remove or rebuild other attributes
            if (geometry.attributes.normal) {
                geometry.deleteAttribute('normal');
                geometry.computeVertexNormals();
            }
            
            // Remove invalid UV data
            if (geometry.attributes.uv) {
                geometry.deleteAttribute('uv');
            }
            
            // Remove invalid color data
            if (geometry.attributes.color) {
                geometry.deleteAttribute('color');
            }
            
            // Remove invalid index
            if (geometry.index) {
                geometry.setIndex(null);
            }
            
            // Recompute bounding volumes
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
            
            console.log(`GeometryValidator: Reconstructed geometry with ${validPositions.length / 3} vertices`);
            return true;
            
        } catch (error) {
            console.error('GeometryValidator: Reconstruction failed:', error);
            return false;
        }
    }
    
    /**
     * Get validation statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            validationCount: this.validationResults.size,
            repairHistoryCount: this.repairHistory.length
        };
    }
    
    /**
     * Get recent validation results
     * @param {number} limit - Maximum number of results
     * @returns {Array} Recent validation results
     */
    getRecentValidations(limit = 10) {
        return Array.from(this.validationResults.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
    
    /**
     * Clear validation history
     */
    clearHistory() {
        this.validationResults.clear();
        this.repairHistory = [];
        console.log('GeometryValidator: History cleared');
    }
}

// Create a global instance
export const geometryValidator = new GeometryValidator();

export default geometryValidator;
