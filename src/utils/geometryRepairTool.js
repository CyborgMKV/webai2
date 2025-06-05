/**
 * Advanced Geometry Repair Tool
 * Specialized for handling massive geometry corruption like the mt-103__rig_v1.3.4.glb model
 */

import * as THREE from '../../libs/three/three.module.js';

export class GeometryRepairTool {
    constructor() {
        this.repairStats = {
            totalRepaired: 0,
            nanValues: 0,
            infinityValues: 0,
            fallbacksUsed: 0
        };
    }

    /**
     * Advanced geometry repair that handles massive corruption
     * @param {THREE.BufferGeometry} geometry - The corrupted geometry
     * @param {string} identifier - For logging
     * @returns {boolean} Success status
     */
    repairGeometry(geometry, identifier = 'unknown') {
        if (!geometry || !geometry.attributes) {
            return false;
        }

        let repaired = false;

        try {
            // Repair position attribute (critical)
            if (geometry.attributes.position) {
                repaired = this.repairAttribute(geometry.attributes.position, 'position') || repaired;
            }

            // Repair normal attribute
            if (geometry.attributes.normal) {
                repaired = this.repairAttribute(geometry.attributes.normal, 'normal') || repaired;
            }

            // Repair UV attribute
            if (geometry.attributes.uv) {
                repaired = this.repairAttribute(geometry.attributes.uv, 'uv') || repaired;
            }

            // Clear and recompute bounding volumes after repair
            if (repaired) {
                geometry.boundingBox = null;
                geometry.boundingSphere = null;
                
                try {
                    geometry.computeBoundingBox();
                    geometry.computeBoundingSphere();
                } catch (error) {
                    console.warn(`GeometryRepairTool: Could not recompute bounds for ${identifier}:`, error.message);
                    // Create safe fallback bounds
                    this.createFallbackBounds(geometry);
                }

                this.repairStats.totalRepaired++;
                console.log(`GeometryRepairTool: Successfully repaired geometry ${identifier}`);
            }

            return repaired;

        } catch (error) {
            console.error(`GeometryRepairTool: Error repairing geometry ${identifier}:`, error);
            return false;
        }
    }

    /**
     * Repair a specific buffer attribute
     * @param {THREE.BufferAttribute} attribute - The attribute to repair
     * @param {string} type - Type of attribute (position, normal, uv)
     * @returns {boolean} Whether repairs were made
     */
    repairAttribute(attribute, type) {
        if (!attribute.array) return false;

        let repairsMade = false;
        const array = attribute.array;
        let nanFixedInThisAttribute = 0;
        let infinityFixedInThisAttribute = 0;
        
        for (let i = 0; i < array.length; i++) {
            const value = array[i];
            
            if (isNaN(value)) {
                array[i] = this.getFallbackValue(type, i % attribute.itemSize);
                this.repairStats.nanValues++;
                nanFixedInThisAttribute++;
                repairsMade = true;
            } else if (!isFinite(value)) {
                array[i] = this.getFallbackValue(type, i % attribute.itemSize);
                this.repairStats.infinityValues++;
                infinityFixedInThisAttribute++;
                repairsMade = true;
            }
        }

        if (repairsMade) {
            console.log(`GeometryRepairTool.repairAttribute: Repaired attribute '${type}'. NaN fixed: ${nanFixedInThisAttribute}, Infinity fixed: ${infinityFixedInThisAttribute}`);
            attribute.needsUpdate = true;
        }

        return repairsMade;
    }

    /**
     * Get appropriate fallback value based on attribute type and component
     * @param {string} type - Attribute type
     * @param {number} component - Component index (0=x, 1=y, 2=z, etc.)
     * @returns {number} Fallback value
     */
    getFallbackValue(type, component) {
        switch (type) {
            case 'position':
                return 0; // Safe center position
            case 'normal':
                // Return unit normal pointing up
                return component === 1 ? 1 : 0; // (0, 1, 0)
            case 'uv':
                return 0.5; // Center UV coordinate
            case 'color':
                return 1; // White color
            default:
                return 0;
        }
    }

    /**
     * Create safe fallback bounding volumes
     * @param {THREE.BufferGeometry} geometry - The geometry
     */
    createFallbackBounds(geometry) {
        const size = 1;
        
        // Safe bounding box
        geometry.boundingBox = new THREE.Box3(
            new THREE.Vector3(-size, -size, -size),
            new THREE.Vector3(size, size, size)
        );

        // Safe bounding sphere
        geometry.boundingSphere = new THREE.Sphere(
            new THREE.Vector3(0, 0, 0),
            size * Math.sqrt(3) // Radius to contain the box
        );

        this.repairStats.fallbacksUsed++;
    }

    /**
     * Batch repair all geometries in a scene or object
     * @param {THREE.Object3D} object - Root object to traverse
     * @returns {Object} Repair summary
     */
    batchRepairGeometries(object) {
        const startStats = { ...this.repairStats };
        let geometriesProcessed = 0;
        let geometriesRepaired = 0;

        object.traverse((child) => {
            if (child.isMesh && child.geometry) {
                geometriesProcessed++;
                
                const wasRepaired = this.repairGeometry(
                    child.geometry, 
                    `batch:${child.name || child.uuid}`
                );
                
                if (wasRepaired) {
                    geometriesRepaired++;
                }
            }
        });

        const newRepairs = this.repairStats.totalRepaired - startStats.totalRepaired;
        const newNanFixed = this.repairStats.nanValues - startStats.nanValues;
        const newInfinityFixed = this.repairStats.infinityValues - startStats.infinityValues;

        return {
            geometriesProcessed,
            geometriesRepaired,
            nanValuesFixed: newNanFixed,
            infinityValuesFixed: newInfinityFixed,
            fallbacksUsed: this.repairStats.fallbacksUsed - startStats.fallbacksUsed
        };
    }

    /**
     * Get repair statistics
     * @returns {Object} Current stats
     */
    getStats() {
        return { ...this.repairStats };
    }

    /**
     * Reset repair statistics
     */
    resetStats() {
        this.repairStats = {
            totalRepaired: 0,
            nanValues: 0,
            infinityValues: 0,
            fallbacksUsed: 0
        };
    }
}

// Create singleton instance
export const geometryRepairTool = new GeometryRepairTool();
