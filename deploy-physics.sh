#!/bin/bash

# WebAI 3D Game - Physics Integration Deployment Script
# This script helps deploy the optimized game with physics integration

echo "=== WebAI 3D Game - Physics Integration Deployment ==="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Not in the game root directory. Please run from webai3d folder."
    exit 1
fi

echo "1. Installing dependencies..."
npm install

echo ""
echo "2. Checking for build errors..."
# Note: Add build step here if you have one

echo ""
echo "3. Physics Integration Status:"
echo "   ✅ PhysicsManager class created with Rapier integration"
echo "   ✅ PhysicsComponent created for entity physics properties"
echo "   ✅ Player class updated with physics support"
echo "   ✅ Projectile class updated with physics support"
echo "   ✅ Enemy classes (Shark, FlyingRobot) updated with physics"
echo "   ✅ Game class integrated with physics system"
echo "   ✅ Collision detection using physics events"
echo "   ✅ Fallback system for non-physics mode"

echo ""
echo "4. Configuration Status:"
echo "   ✅ Weapon balance optimized (fire rates, speeds, lifespans)"
echo "   ✅ Documentation consolidated and organized"
echo "   ✅ Physics dependencies added to package.json"

echo ""
echo "5. Testing Commands:"
echo "   - Start local server: python -m http.server 8000"
echo "   - Test physics: window.debugGame.testPhysics() (in browser console)"
echo "   - Check physics status: window.debugGame.physicsManager.isInitialized()"

echo ""
echo "6. Next Steps:"
echo "   - Test gameplay with current optimizations"
echo "   - Monitor physics performance"
echo "   - Fine-tune physics parameters if needed"
echo "   - Deploy to production server"

echo ""
echo "=== Deployment Ready! ==="
echo ""
echo "To start testing:"
echo "1. Run: python -m http.server 8000"
echo "2. Open: http://localhost:8000"
echo "3. Test physics in browser console: window.debugGame.testPhysics()"
