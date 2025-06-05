/**
 * WebGL Fix Validation Script
 * Comprehensive testing and validation of the integrated WebGL context management
 * and geometry sanitization systems.
 */

class WebGLFixValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            overallStatus: 'TESTING',
            categories: {
                integration: { status: 'PENDING', tests: [], score: 0 },
                geometryValidation: { status: 'PENDING', tests: [], score: 0 },
                webglContext: { status: 'PENDING', tests: [], score: 0 },
                performance: { status: 'PENDING', tests: [], score: 0 },
                errorHandling: { status: 'PENDING', tests: [], score: 0 },
                realWorld: { status: 'PENDING', tests: [], score: 0 }
            },
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                criticalIssues: 0
            }
        };
        
        this.appInstance = null;
        this.gameInstance = null;
        this.webglManager = null;
        this.geometryValidator = null;
    }
    
    /**
     * Initialize validation by connecting to the game systems
     */
    async initialize() {
        console.log('🔍 WebGL Fix Validator: Initializing...');
        
        try {
            // Wait for global debug objects to be available
            await this.waitForGameSystems();
            
            this.appInstance = window.debugGame?.app || window.app;
            this.gameInstance = window.debugGame || window.game;
            this.webglManager = window.debugWebGLManager;
            this.geometryValidator = window.debugGeometryValidator;
            
            console.log('✅ Connected to game systems:', {
                app: !!this.appInstance,
                game: !!this.gameInstance,
                webglManager: !!this.webglManager,
                geometryValidator: !!this.geometryValidator
            });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize validator:', error);
            return false;
        }
    }
    
    /**
     * Wait for game systems to be available
     */
    async waitForGameSystems(maxWait = 10000, checkInterval = 100) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (window.debugGame || window.debugGeometryValidator || window.debugWebGLManager) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        
        throw new Error('Game systems not available within timeout period');
    }
    
    /**
     * Run all validation tests
     */
    async runValidation() {
        console.log('🧪 Starting comprehensive WebGL fix validation...');
        
        try {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize validator');
            }
            
            // Run test categories in sequence
            await this.testIntegration();
            await this.testGeometryValidation();
            await this.testWebGLContext();
            await this.testPerformance();
            await this.testErrorHandling();
            await this.testRealWorldScenarios();
            
            // Calculate final results
            this.calculateFinalScore();
            
            console.log('✅ Validation completed!');
            return this.results;
            
        } catch (error) {
            console.error('❌ Validation failed:', error);
            this.results.overallStatus = 'FAILED';
            this.results.summary.criticalIssues++;
            return this.results;
        }
    }
    
    /**
     * Test system integration
     */
    async testIntegration() {
        console.log('🔧 Testing system integration...');
        const category = this.results.categories.integration;
        
        // Test 1: Debug objects exposed
        this.addTest(category, 'Debug Objects Available', () => {
            const hasDebugGame = !!window.debugGame;
            const hasDebugValidator = !!window.debugGeometryValidator;
            const hasDebugManager = !!window.debugWebGLManager;
            
            if (hasDebugGame && hasDebugValidator && hasDebugManager) {
                return { status: 'PASS', message: 'All debug objects properly exposed' };
            } else {
                return { 
                    status: 'FAIL', 
                    message: `Missing debug objects: ${!hasDebugGame ? 'debugGame ' : ''}${!hasDebugValidator ? 'debugGeometryValidator ' : ''}${!hasDebugManager ? 'debugWebGLManager' : ''}` 
                };
            }
        });
        
        // Test 2: WebGL manager integration
        this.addTest(category, 'WebGL Manager Integration', () => {
            if (!this.webglManager) {
                return { status: 'FAIL', message: 'WebGL manager not available' };
            }
            
            const hasRenderer = !!this.webglManager.renderer;
            const hasStats = !!this.webglManager.stats;
            const hasEventListeners = typeof this.webglManager.handleContextLost === 'function';
            
            if (hasRenderer && hasStats && hasEventListeners) {
                return { status: 'PASS', message: 'WebGL manager properly integrated' };
            } else {
                return { status: 'FAIL', message: 'WebGL manager missing components' };
            }
        });
        
        // Test 3: Geometry validator integration
        this.addTest(category, 'Geometry Validator Integration', () => {
            if (!this.geometryValidator) {
                return { status: 'FAIL', message: 'Geometry validator not available' };
            }
            
            const hasValidateMethod = typeof this.geometryValidator.validateGeometry === 'function';
            const hasReconstructMethod = typeof this.geometryValidator.reconstructGeometry === 'function';
            const hasStats = !!this.geometryValidator.stats;
            
            if (hasValidateMethod && hasReconstructMethod && hasStats) {
                return { status: 'PASS', message: 'Geometry validator properly integrated' };
            } else {
                return { status: 'FAIL', message: 'Geometry validator missing methods' };
            }
        });
        
        // Test 4: App methods integration
        this.addTest(category, 'App Methods Integration', () => {
            if (!this.appInstance) {
                return { status: 'FAIL', message: 'App instance not available' };
            }
            
            const hasValidateScene = typeof this.appInstance.validateSceneGeometry === 'function';
            const hasRepairGeometry = typeof this.appInstance.repairGeometry === 'function';
            const hasGetSystemHealth = typeof this.appInstance.getSystemHealth === 'function';
            
            if (hasValidateScene && hasRepairGeometry && hasGetSystemHealth) {
                return { status: 'PASS', message: 'App methods properly integrated' };
            } else {
                return { status: 'FAIL', message: 'App missing validation/repair methods' };
            }
        });
        
        this.finalizeCategory(category);
    }
    
    /**
     * Test geometry validation system
     */
    async testGeometryValidation() {
        console.log('📐 Testing geometry validation...');
        const category = this.results.categories.geometryValidation;
        
        // Test 1: Basic geometry validation
        this.addTest(category, 'Basic Geometry Validation', () => {
            try {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const result = this.geometryValidator.validateGeometry(geometry, 'test-basic');
                
                if (result && typeof result.isValid === 'boolean') {
                    return { status: 'PASS', message: 'Basic validation working' };
                } else {
                    return { status: 'FAIL', message: 'Invalid validation result structure' };
                }
            } catch (error) {
                return { status: 'FAIL', message: `Validation error: ${error.message}` };
            }
        });
        
        // Test 2: NaN detection and repair
        this.addTest(category, 'NaN Detection and Repair', () => {
            try {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const positions = geometry.attributes.position.array;
                
                // Inject NaN values
                positions[0] = NaN;
                positions[3] = Infinity;
                positions[6] = -Infinity;
                
                const result = this.geometryValidator.validateGeometry(geometry, 'test-nan');
                
                if (!result.isValid && result.errors.some(e => e.includes('NaN') || e.includes('Infinity'))) {
                    // Test repair
                    const repaired = this.appInstance.repairGeometry(geometry, result.severity);
                    if (repaired) {
                        return { status: 'PASS', message: 'NaN detection and repair successful' };
                    } else {
                        return { status: 'FAIL', message: 'NaN detected but repair failed' };
                    }
                } else {
                    return { status: 'FAIL', message: 'NaN values not detected' };
                }
            } catch (error) {
                return { status: 'FAIL', message: `NaN test error: ${error.message}` };
            }
        });
        
        // Test 3: Large geometry handling
        this.addTest(category, 'Large Geometry Handling', () => {
            try {
                const startTime = performance.now();
                const geometry = new THREE.SphereGeometry(5, 128, 128);
                const result = this.geometryValidator.validateGeometry(geometry, 'test-large');
                const validationTime = performance.now() - startTime;
                
                if (result && validationTime < 1000) { // Should complete within 1 second
                    return { status: 'PASS', message: `Large geometry validated in ${validationTime.toFixed(2)}ms` };
                } else if (validationTime >= 1000) {
                    return { status: 'WARN', message: `Validation slow: ${validationTime.toFixed(2)}ms` };
                } else {
                    return { status: 'FAIL', message: 'Large geometry validation failed' };
                }
            } catch (error) {
                return { status: 'FAIL', message: `Large geometry test error: ${error.message}` };
            }
        });
        
        // Test 4: Scene-wide validation
        this.addTest(category, 'Scene-wide Validation', () => {
            try {
                if (!this.appInstance.scene) {
                    return { status: 'FAIL', message: 'No scene available for validation' };
                }
                
                const startTime = performance.now();
                this.appInstance.validateSceneGeometry();
                const validationTime = performance.now() - startTime;
                
                return { status: 'PASS', message: `Scene validated in ${validationTime.toFixed(2)}ms` };
            } catch (error) {
                return { status: 'FAIL', message: `Scene validation error: ${error.message}` };
            }
        });
        
        this.finalizeCategory(category);
    }
    
    /**
     * Test WebGL context management
     */
    async testWebGLContext() {
        console.log('🎮 Testing WebGL context management...');
        const category = this.results.categories.webglContext;
        
        // Test 1: Context loss detection
        this.addTest(category, 'Context Loss Detection', () => {
            if (!this.webglManager) {
                return { status: 'FAIL', message: 'WebGL manager not available' };
            }
            
            const hasContextLostProperty = typeof this.webglManager.isContextLost === 'boolean';
            const hasStats = this.webglManager.stats && typeof this.webglManager.stats.contextLostCount === 'number';
            
            if (hasContextLostProperty && hasStats) {
                return { status: 'PASS', message: 'Context loss detection available' };
            } else {
                return { status: 'FAIL', message: 'Context loss detection not properly implemented' };
            }
        });
        
        // Test 2: Context restoration
        this.addTest(category, 'Context Restoration Support', () => {
            const hasRestoreHandler = typeof this.webglManager?.handleContextRestored === 'function';
            const hasRestoreCount = typeof this.webglManager?.stats?.contextRestoreCount === 'number';
            
            if (hasRestoreHandler && hasRestoreCount) {
                return { status: 'PASS', message: 'Context restoration support available' };
            } else {
                return { status: 'FAIL', message: 'Context restoration not properly implemented' };
            }
        });
        
        // Test 3: Render error handling
        this.addTest(category, 'Render Error Handling', () => {
            if (!this.appInstance.renderer) {
                return { status: 'FAIL', message: 'Renderer not available' };
            }
            
            try {
                // Test that rendering doesn't crash with current scene
                this.appInstance.renderer.render(this.appInstance.scene, this.appInstance.camera);
                return { status: 'PASS', message: 'Render error handling operational' };
            } catch (error) {
                return { status: 'FAIL', message: `Render error: ${error.message}` };
            }
        });
        
        this.finalizeCategory(category);
    }
    
    /**
     * Test performance characteristics
     */
    async testPerformance() {
        console.log('⚡ Testing performance...');
        const category = this.results.categories.performance;
        
        // Test 1: Validation overhead
        this.addTest(category, 'Validation Overhead', () => {
            try {
                const geometries = [];
                for (let i = 0; i < 10; i++) {
                    geometries.push(new THREE.BoxGeometry(1, 1, 1));
                }
                
                const startTime = performance.now();
                geometries.forEach((geo, index) => {
                    this.geometryValidator.validateGeometry(geo, `perf-test-${index}`);
                });
                const totalTime = performance.now() - startTime;
                const avgTime = totalTime / geometries.length;
                
                if (avgTime < 10) { // Less than 10ms per geometry
                    return { status: 'PASS', message: `Average validation time: ${avgTime.toFixed(2)}ms` };
                } else if (avgTime < 50) {
                    return { status: 'WARN', message: `Validation slower than expected: ${avgTime.toFixed(2)}ms` };
                } else {
                    return { status: 'FAIL', message: `Validation too slow: ${avgTime.toFixed(2)}ms` };
                }
            } catch (error) {
                return { status: 'FAIL', message: `Performance test error: ${error.message}` };
            }
        });
        
        // Test 2: Memory usage
        this.addTest(category, 'Memory Usage', () => {
            if (!performance.memory) {
                return { status: 'WARN', message: 'Memory API not available' };
            }
            
            const memoryBefore = performance.memory.usedJSHeapSize;
            
            // Create and validate many geometries
            for (let i = 0; i < 100; i++) {
                const geo = new THREE.SphereGeometry(1, 32, 32);
                this.geometryValidator.validateGeometry(geo, `memory-test-${i}`);
            }
            
            const memoryAfter = performance.memory.usedJSHeapSize;
            const memoryIncrease = memoryAfter - memoryBefore;
            const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
            
            if (memoryIncreaseMB < 50) {
                return { status: 'PASS', message: `Memory increase: ${memoryIncreaseMB.toFixed(2)}MB` };
            } else {
                return { status: 'WARN', message: `High memory usage: ${memoryIncreaseMB.toFixed(2)}MB` };
            }
        });
        
        this.finalizeCategory(category);
    }
    
    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('🛡️ Testing error handling...');
        const category = this.results.categories.errorHandling;
        
        // Test 1: Invalid geometry handling
        this.addTest(category, 'Invalid Geometry Handling', () => {
            try {
                const result1 = this.geometryValidator.validateGeometry(null, 'null-test');
                const result2 = this.geometryValidator.validateGeometry(undefined, 'undefined-test');
                const result3 = this.geometryValidator.validateGeometry({}, 'invalid-test');
                
                // Should handle gracefully without crashing
                return { status: 'PASS', message: 'Invalid geometry handled gracefully' };
            } catch (error) {
                return { status: 'FAIL', message: `Invalid geometry crashed: ${error.message}` };
            }
        });
        
        // Test 2: Repair failure handling
        this.addTest(category, 'Repair Failure Handling', () => {
            try {
                // Test repair with completely invalid input
                const result = this.appInstance.repairGeometry(null, 'critical');
                
                // Should return false or handle gracefully
                if (result === false || result === null || result === undefined) {
                    return { status: 'PASS', message: 'Repair failure handled gracefully' };
                } else {
                    return { status: 'WARN', message: 'Repair returned unexpected result for invalid input' };
                }
            } catch (error) {
                return { status: 'FAIL', message: `Repair failure crashed: ${error.message}` };
            }
        });
        
        this.finalizeCategory(category);
    }
    
    /**
     * Test real-world scenarios
     */
    async testRealWorldScenarios() {
        console.log('🌍 Testing real-world scenarios...');
        const category = this.results.categories.realWorld;
        
        // Test 1: Model loading with validation
        this.addTest(category, 'Model Loading Validation', () => {
            if (!this.appInstance.loadModel) {
                return { status: 'FAIL', message: 'Model loading method not available' };
            }
            
            // Check if the loadModel method includes validation calls
            const loadModelSource = this.appInstance.loadModel.toString();
            const hasValidation = loadModelSource.includes('validateGeometry') || 
                                 loadModelSource.includes('geometryValidator');
            
            if (hasValidation) {
                return { status: 'PASS', message: 'Model loading includes geometry validation' };
            } else {
                return { status: 'FAIL', message: 'Model loading missing validation integration' };
            }
        });
        
        // Test 2: Render loop integration
        this.addTest(category, 'Render Loop Integration', () => {
            if (!this.appInstance.animate) {
                return { status: 'FAIL', message: 'Animate method not available' };
            }
            
            const animateSource = this.appInstance.animate.toString();
            const hasContextCheck = animateSource.includes('isContextLost') || 
                                   animateSource.includes('webglContextManager');
            const hasGeometryCheck = animateSource.includes('validateSceneGeometry');
            
            if (hasContextCheck && hasGeometryCheck) {
                return { status: 'PASS', message: 'Render loop includes WebGL and geometry checks' };
            } else {
                return { status: 'WARN', message: 'Render loop missing some safety checks' };
            }
        });
        
        // Test 3: System health reporting
        this.addTest(category, 'System Health Reporting', () => {
            try {
                const health = this.appInstance.getSystemHealth();
                
                const hasWebGLHealth = health.webgl && typeof health.webgl.contextLost === 'boolean';
                const hasGeometryHealth = health.geometry && typeof health.geometry.validationCount === 'number';
                const hasSceneHealth = health.scene && typeof health.scene.totalObjects === 'number';
                
                if (hasWebGLHealth && hasGeometryHealth && hasSceneHealth) {
                    return { status: 'PASS', message: 'Comprehensive health reporting available' };
                } else {
                    return { status: 'FAIL', message: 'Health reporting incomplete' };
                }
            } catch (error) {
                return { status: 'FAIL', message: `Health reporting error: ${error.message}` };
            }
        });
        
        this.finalizeCategory(category);
    }
    
    /**
     * Add a test to a category
     */
    addTest(category, testName, testFunction) {
        try {
            const result = testFunction();
            category.tests.push({
                name: testName,
                status: result.status,
                message: result.message,
                timestamp: new Date().toISOString()
            });
            
            this.results.summary.totalTests++;
            
            switch (result.status) {
                case 'PASS':
                    this.results.summary.passed++;
                    category.score += 10;
                    break;
                case 'WARN':
                    this.results.summary.warnings++;
                    category.score += 5;
                    break;
                case 'FAIL':
                    this.results.summary.failed++;
                    if (testName.includes('Integration') || testName.includes('Context')) {
                        this.results.summary.criticalIssues++;
                    }
                    break;
            }
        } catch (error) {
            category.tests.push({
                name: testName,
                status: 'FAIL',
                message: `Test execution error: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            
            this.results.summary.totalTests++;
            this.results.summary.failed++;
            this.results.summary.criticalIssues++;
        }
    }
    
    /**
     * Finalize a test category
     */
    finalizeCategory(category) {
        const totalTests = category.tests.length;
        const passedTests = category.tests.filter(t => t.status === 'PASS').length;
        const failedTests = category.tests.filter(t => t.status === 'FAIL').length;
        
        if (failedTests === 0 && passedTests > totalTests * 0.8) {
            category.status = 'PASS';
        } else if (failedTests < totalTests * 0.3) {
            category.status = 'WARN';
        } else {
            category.status = 'FAIL';
        }
    }
    
    /**
     * Calculate final validation score
     */
    calculateFinalScore() {
        const categories = Object.values(this.results.categories);
        const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
        const maxScore = categories.length * 40; // 4 tests per category * 10 points each
        const scorePercentage = (totalScore / maxScore) * 100;
        
        if (this.results.summary.criticalIssues > 0) {
            this.results.overallStatus = 'CRITICAL';
        } else if (scorePercentage >= 80) {
            this.results.overallStatus = 'EXCELLENT';
        } else if (scorePercentage >= 60) {
            this.results.overallStatus = 'GOOD';
        } else if (scorePercentage >= 40) {
            this.results.overallStatus = 'NEEDS_IMPROVEMENT';
        } else {
            this.results.overallStatus = 'POOR';
        }
        
        this.results.summary.scorePercentage = scorePercentage;
        this.results.summary.totalScore = totalScore;
        this.results.summary.maxScore = maxScore;
    }
    
    /**
     * Generate HTML report
     */
    generateHTMLReport() {
        const statusColors = {
            'EXCELLENT': '#00ff88',
            'GOOD': '#4CAF50',
            'NEEDS_IMPROVEMENT': '#ffaa00',
            'POOR': '#ff4444',
            'CRITICAL': '#ff0000'
        };
        
        const statusColor = statusColors[this.results.overallStatus] || '#888';
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGL Fix Validation Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            color: #fff;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .overall-status {
            font-size: 3em;
            font-weight: bold;
            color: ${statusColor};
            margin: 20px 0;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .summary-card {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .summary-value {
            font-size: 2em;
            font-weight: bold;
            color: ${statusColor};
        }
        
        .categories {
            margin: 40px 0;
        }
        
        .category {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #333;
            border-radius: 8px;
            margin: 20px 0;
            padding: 20px;
        }
        
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .category-status {
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        
        .status-PASS { background: #4CAF50; color: #000; }
        .status-WARN { background: #ffaa00; color: #000; }
        .status-FAIL { background: #ff4444; color: #fff; }
        
        .test {
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
            border-left: 4px solid #333;
        }
        
        .test-PASS { border-left-color: #4CAF50; }
        .test-WARN { border-left-color: #ffaa00; }
        .test-FAIL { border-left-color: #ff4444; }
        
        .test-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .test-message {
            color: #ccc;
            font-size: 0.9em;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #333;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ WebGL Fix Validation Report</h1>
        <div class="overall-status">${this.results.overallStatus}</div>
        <p>Generated on ${new Date(this.results.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <div class="summary-value">${this.results.summary.scorePercentage?.toFixed(1) || 0}%</div>
            <div>Overall Score</div>
        </div>
        <div class="summary-card">
            <div class="summary-value">${this.results.summary.passed}</div>
            <div>Tests Passed</div>
        </div>
        <div class="summary-card">
            <div class="summary-value">${this.results.summary.failed}</div>
            <div>Tests Failed</div>
        </div>
        <div class="summary-card">
            <div class="summary-value">${this.results.summary.criticalIssues}</div>
            <div>Critical Issues</div>
        </div>
    </div>
    
    <div class="categories">
        ${Object.entries(this.results.categories).map(([name, category]) => `
            <div class="category">
                <div class="category-header">
                    <h3>${name.charAt(0).toUpperCase() + name.slice(1)}</h3>
                    <span class="category-status status-${category.status}">${category.status}</span>
                </div>
                ${category.tests.map(test => `
                    <div class="test test-${test.status}">
                        <div class="test-name">${test.name}</div>
                        <div class="test-message">${test.message}</div>
                    </div>
                `).join('')}
            </div>
        `).join('')}
    </div>
    
    <div class="footer">
        <p>This report validates the WebGL context management and geometry sanitization fixes.</p>
        <p>Critical issues require immediate attention. Warnings should be addressed when possible.</p>
    </div>
</body>
</html>`;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.WebGLFixValidator = WebGLFixValidator;
}

export default WebGLFixValidator;
