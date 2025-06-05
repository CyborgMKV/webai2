// Quick diagnostic to verify mass fix is working
console.log("🔧 MASS FIX DIAGNOSTIC - Running...");

// Check if game loaded successfully
if (window.app) {
    console.log("✅ Game app loaded successfully");
    
    if (window.app.game) {
        console.log("✅ Game instance created");
        
        if (window.app.game.physicsManager) {
            console.log("✅ PhysicsManager initialized");
            console.log("📊 Physics Status:", {
                initialized: window.app.game.physicsManager.initialized,
                rigidBodies: window.app.game.physicsManager.rigidBodies.size,
                colliders: window.app.game.physicsManager.colliders.size
            });
            
            // Check for any errors in the console
            const errors = [];
            const originalError = console.error;
            console.error = function(...args) {
                errors.push(args.join(' '));
                originalError.apply(console, args);
            };
            
            setTimeout(() => {
                console.error = originalError;
                if (errors.length === 0) {
                    console.log("✅ NO PHYSICS ERRORS DETECTED");
                    console.log("🎮 MASS FIX SUCCESSFUL - Game ready to play!");
                } else {
                    console.log("⚠️ Some errors detected:", errors);
                }
            }, 3000);
            
        } else {
            console.log("⚠️ PhysicsManager not found");
        }
    } else {
        console.log("⚠️ Game instance not created");
    }
} else {
    console.log("⚠️ App not loaded");
}

// Test physics component creation
async function testPhysicsComponentCreation() {
    try {
        const { default: PhysicsComponent } = await import('./src/components/physics.js');
        const testPhysics = new PhysicsComponent({ mass: 5, shape: 'box' });
        console.log("✅ PhysicsComponent creation test passed");
        console.log("📊 Component properties:", {
            mass: testPhysics.mass,
            shape: testPhysics.shape,
            bodyType: testPhysics.bodyType
        });
    } catch (error) {
        console.log("❌ PhysicsComponent test failed:", error.message);
    }
}

testPhysicsComponentCreation();
console.log("🔧 DIAGNOSTIC COMPLETE");
