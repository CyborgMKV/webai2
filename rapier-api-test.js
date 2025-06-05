// Rapier API compatibility test
console.log("=== Rapier API Compatibility Test ===");

async function testRapierAPI() {
    try {
        // Load Rapier
        const RAPIER = await import('https://cdn.skypack.dev/@dimforge/rapier3d-compat');
        await RAPIER.init();
        
        console.log("✓ Rapier loaded successfully");
        
        // Test RigidBodyDesc methods
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
        console.log("✓ RigidBodyDesc created");
        
        // Test available methods on RigidBodyDesc
        console.log("RigidBodyDesc methods:", {
            setMass: typeof rigidBodyDesc.setMass,
            mass: typeof rigidBodyDesc.mass,
            lockRotations: typeof rigidBodyDesc.lockRotations
        });
        
        // Test ColliderDesc methods
        const colliderDesc = RAPIER.ColliderDesc.cuboid(1, 1, 1);
        console.log("✓ ColliderDesc created");
        
        console.log("ColliderDesc methods:", {
            setMass: typeof colliderDesc.setMass,
            setDensity: typeof colliderDesc.setDensity,
            mass: typeof colliderDesc.mass,
            density: typeof colliderDesc.density
        });
        
        // Test World creation
        const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
        console.log("✓ World created");
        
        console.log("World methods:", {
            contactPairs: typeof world.contactPairs,
            contactsWith: typeof world.contactsWith,
            createRigidBody: typeof world.createRigidBody,
            createCollider: typeof world.createCollider
        });
        
        console.log("=== API Test Complete ===");
        
    } catch (error) {
        console.error("API Test failed:", error);
    }
}

testRapierAPI();
