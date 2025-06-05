/**
 * WebGL Context Manager
 * Handles WebGL context loss/restore and provides real-time monitoring
 */

import * as THREE from '../../libs/three/three.module.js';
import { sanitizeGeometry } from './math.js';

export class WebGLContextManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.gl = renderer.getContext();
        this.isContextLost = false;
        this.restoreAttempts = 0;
        this.maxRestoreAttempts = 3;
        
        // Statistics
        this.stats = {
            contextLostCount: 0,
            contextRestoreCount: 0,
            geometryValidationCount: 0,
            sanitizationCount: 0
        };
        
        this.setupContextListeners();
        this.startMonitoring();
        
        console.log('WebGLContextManager: Initialized');
    }
    
    setupContextListeners() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('webglcontextlost', (event) => {
            console.error('WebGLContextManager: WebGL context lost!', event);
            event.preventDefault();
            this.isContextLost = true;
            this.stats.contextLostCount++;
            this.handleContextLost();
        });
        
        canvas.addEventListener('webglcontextrestored', (event) => {
            console.log('WebGLContextManager: WebGL context restored!', event);
            this.isContextLost = false;
            this.stats.contextRestoreCount++;
            this.handleContextRestored();
        });
        
        canvas.addEventListener('webglcontextcreationerror', (event) => {
            console.error('WebGLContextManager: WebGL context creation failed!', event);
        });
    }
    
    handleContextLost() {
        console.warn('WebGLContextManager: Handling context loss...');
        
        // Stop any ongoing operations
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Attempt to restore context
        this.attemptContextRestore();
    }
    
    handleContextRestored() {
        console.log('WebGLContextManager: Handling context restoration...');
        this.restoreAttempts = 0;
        
        // Restart monitoring
        this.startMonitoring();
        
        // Force renderer to reinitialize
        this.renderer.setSize(this.renderer.domElement.width, this.renderer.domElement.height);
        
        // Trigger a frame to test restoration
        this.renderer.render(new THREE.Scene(), new THREE.Camera());
    }
    
    attemptContextRestore() {
        if (this.restoreAttempts >= this.maxRestoreAttempts) {
            console.error('WebGLContextManager: Maximum restore attempts reached. Manual intervention required.');
            this.displayContextLostMessage();
            return;
        }
        
        this.restoreAttempts++;
        console.log(`WebGLContextManager: Attempting context restore (attempt ${this.restoreAttempts})`);
        
        setTimeout(() => {
            try {
                // Force context restore by getting WebGL extensions
                const ext = this.gl.getExtension('WEBGL_lose_context');
                if (ext) {
                    ext.restoreContext();
                }
            } catch (error) {
                console.error('WebGLContextManager: Context restore attempt failed:', error);
            }
        }, 1000 * this.restoreAttempts); // Increasing delay
    }
    
    startMonitoring() {
        // Monitor WebGL state every 5 seconds
        this.monitoringInterval = setInterval(() => {
            this.checkWebGLState();
        }, 5000);
        
        console.log('WebGLContextManager: Monitoring started');
    }
    
    checkWebGLState() {
        if (this.isContextLost) return;
        
        try {
            // Check if context is still valid
            const error = this.gl.getError();
            if (error !== this.gl.NO_ERROR) {
                console.warn(`WebGLContextManager: WebGL error detected: ${this.getErrorString(error)}`);
            }
            
            // Check memory usage
            const info = this.renderer.info;
            if (info.memory.geometries > 1000) {
                console.warn(`WebGLContextManager: High geometry count: ${info.memory.geometries}`);
            }
            
            if (info.memory.textures > 500) {
                console.warn(`WebGLContextManager: High texture count: ${info.memory.textures}`);
            }
            
        } catch (error) {
            console.error('WebGLContextManager: Error during state check:', error);
        }
    }
    
    getErrorString(error) {
        const errorNames = {
            [this.gl.NO_ERROR]: 'NO_ERROR',
            [this.gl.INVALID_ENUM]: 'INVALID_ENUM',
            [this.gl.INVALID_VALUE]: 'INVALID_VALUE',
            [this.gl.INVALID_OPERATION]: 'INVALID_OPERATION',
            [this.gl.INVALID_FRAMEBUFFER_OPERATION]: 'INVALID_FRAMEBUFFER_OPERATION',
            [this.gl.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
            [this.gl.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL'
        };
        
        return errorNames[error] || `UNKNOWN_ERROR (${error})`;
    }
    
    /**
     * Validate and sanitize a THREE.js Object3D and all its children
     */
    validateAndSanitizeObject(object) {
        if (!object) return false;
        
        let sanitized = false;
        
        object.traverse((child) => {
            if (child.isMesh && child.geometry) {
                this.stats.geometryValidationCount++;
                
                if (this.validateGeometry(child.geometry)) {
                    const wasSanitized = sanitizeGeometry(child.geometry);
                    if (wasSanitized) {
                        this.stats.sanitizationCount++;
                        sanitized = true;
                        console.log('WebGLContextManager: Sanitized geometry in object3D');
                    }
                }
            }
        });
        
        return sanitized;
    }
    
    /**
     * Validate geometry for NaN/Infinity values
     */
    validateGeometry(geometry) {
        if (!geometry || !geometry.attributes) return false;
        
        // Check position attribute
        if (geometry.attributes.position) {
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < Math.min(positions.length, 100); i++) {
                if (!isFinite(positions[i])) {
                    console.warn(`WebGLContextManager: Invalid position value found at index ${i}: ${positions[i]}`);
                    return true;
                }
            }
        }
        
        // Check normal attribute
        if (geometry.attributes.normal) {
            const normals = geometry.attributes.normal.array;
            for (let i = 0; i < Math.min(normals.length, 100); i++) {
                if (!isFinite(normals[i])) {
                    console.warn(`WebGLContextManager: Invalid normal value found at index ${i}: ${normals[i]}`);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Force cleanup of WebGL resources
     */
    forceCleanup() {
        console.log('WebGLContextManager: Forcing WebGL cleanup...');
        
        // Clear renderer info
        this.renderer.info.reset();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        console.log('WebGLContextManager: Cleanup completed');
    }
    
    displayContextLostMessage() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            text-align: center;
        `;
        
        overlay.innerHTML = `
            <div>
                <h2>WebGL Context Lost</h2>
                <p>The graphics context has been lost due to a rendering error.</p>
                <p>Please refresh the page to continue.</p>
                <button onclick="window.location.reload()" style="
                    padding: 10px 20px;
                    font-size: 16px;
                    margin-top: 20px;
                    cursor: pointer;
                ">Reload Page</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    getStats() {
        return {
            ...this.stats,
            isContextLost: this.isContextLost,
            restoreAttempts: this.restoreAttempts
        };
    }
    
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        console.log('WebGLContextManager: Destroyed');
    }
}

export default WebGLContextManager;
