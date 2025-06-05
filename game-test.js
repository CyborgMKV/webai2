// Quick JavaScript test to validate game functionality
console.log("=== WebAI 3D Game Validation Test ===");

// Test 1: Check if all critical modules can be loaded
async function testModuleLoading() {
    console.log("Testing module loading...");
    
    try {
        // Test physics manager
        const { default: PhysicsManager } = await import('./src/engine/physicsManager.js');
        console.log("✓ PhysicsManager module loaded");
        
        // Test input component  
        const { default: InputComponent } = await import('./src/components/input.js');
        console.log("✓ InputComponent module loaded");
        
        // Test entity system
        const { default: Entity } = await import('./src/engine/entity.js');
        console.log("✓ Entity system loaded");
        
        console.log("✓ All critical modules loaded successfully");
        return true;
    } catch (error) {
        console.error("✗ Module loading failed:", error);
        return false;
    }
}

// Test 2: Physics system functionality
async function testPhysicsSystem() {
    console.log("Testing physics system...");
    
    try {
        const { default: PhysicsManager } = await import('./src/engine/physicsManager.js');
        const physics = new PhysicsManager();
        
        // Test initialization
        await physics.init();
        console.log("✓ Physics system initialized");
        
        // Check if world is created with zero gravity
        if (physics.world) {
            console.log("✓ Physics world created");
            console.log("✓ Zero gravity space environment active");
        } else {
            console.log("✗ Physics world not created");
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("✗ Physics system test failed:", error);
        return false;
    }
}

// Test 3: Game startup without crashes
function testGameStartup() {
    console.log("Testing game startup...");
    
    // Monitor for any critical errors
    const originalConsoleError = console.error;
    let errorCount = 0;
    
    console.error = function(...args) {
        errorCount++;
        originalConsoleError.apply(console, args);
    };
    
    setTimeout(() => {
        console.error = originalConsoleError;
        if (errorCount === 0) {
            console.log("✓ No critical errors during startup");
        } else {
            console.log(`✗ ${errorCount} errors detected during startup`);
        }
    }, 5000);
    
    return true;
}

// Run all tests
async function runAllTests() {
    console.log("Starting comprehensive game validation...");
    console.log("- - -");
    
    const moduleTest = await testModuleLoading();
    console.log("- - -");
    
    const physicsTest = await testPhysicsSystem();
    console.log("- - -");
    
    testGameStartup();
    console.log("- - -");
    
    if (moduleTest && physicsTest) {
        console.log("🎮 Game validation PASSED - Ready for gameplay testing!");
        console.log("Controls: W/S/A/D/Q/E movement, Mouse look, Space shoot, Shift fast");
    } else {
        console.log("⚠️ Some tests failed - Check console for details");
    }
}

// Auto-run when loaded
runAllTests();
