import * as THREE from '../../libs/three/three.module.js';
import Entity from '../engine/entity.js';

/**
 * Heart entity for flyingRobot.
 */
export default class Heart extends Entity {
    /**
     * @param {Object} options - { position, baseSize, color, health }
     */
    constructor(options = {}) {
        super();
        this.name = 'Heart';
        this.type = 'heart';
        this.position = new THREE.Vector3(
            (options.position && options.position.x) || 0,
            (options.position && options.position.y) || 0,
            (options.position && options.position.z) || 0
        );
        this.baseSize = options.baseSize || 0.3; // This baseSize will be used for the overall mesh scale
        this.color = options.color || 0xff3366;
        this.health = options.health || 10;
        
        // Create the heart mesh using the new function, passing baseSize for scaling
        this.mesh = createHeartMesh(this.baseSize, this.color); 

        // The old sphere mesh code is commented out, which is fine.
        // this.mesh = new THREE.Mesh(
        //     new THREE.SphereGeometry(this.baseSize, 16, 16),
        //     new THREE.MeshPhongMaterial({ color: this.color })
        // );
        this.mesh.position.copy(this.position);
    }
}

/**
 * Creates a 3D heart mesh.
 * @param {number} overallSize - The desired overall size (scale) of the heart mesh.
 * @param {number} color - The color of the heart material.
 * @returns {THREE.Mesh} The heart mesh.
 */
function createHeartMesh(overallSize = 1, color = 0xff3366) {
    const x = 0, y = 0; // Center of the shape on the XY plane before extrusion
    const heartShape = new THREE.Shape();
    let firstPoint = true;
  
    // Generate points using parametric heart equation
    for (let t = 0; t <= Math.PI * 2; t += 0.05) { // Increased points for smoother curve
        // Classic heart equation
        const heartX = 16 * Math.pow(Math.sin(t), 3);
        const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        // Introduce shapeScaleFactor to manage the raw output size of the parametric equation
        const shapeScaleFactor = 0.05; // Adjust this factor to get a reasonably sized base shape
                                      // before overallSize is applied.
        
        const px = x + heartX * shapeScaleFactor; // Use shapeScaleFactor
        const py = y + heartY * shapeScaleFactor; // Use shapeScaleFactor
        
        if (firstPoint) {
            heartShape.moveTo(px, py);
            firstPoint = false;
        } else {
            heartShape.lineTo(px, py);
        }
    }
    heartShape.closePath(); // Close the shape

    const extrudeSettings = {
        steps: 2,
        depth: 0.5, // Depth of the extrusion, relative to the shape's scaled size
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 1
    };

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);

    // Normalize the generated shape's size if necessary, then apply overallSize.
    // This might involve computing the bounding box of the generated shape first
    // then scaling it down to a unit size, then applying 'overallSize'.
    // For simplicity here, we assume shapeScaleFactor + overallSize gives decent results.
    // A more robust approach would be:
    // geometry.computeBoundingBox();
    // const currentSize = new THREE.Vector3();
    // geometry.boundingBox.getSize(currentSize);
    // const desiredScale = overallSize / Math.max(currentSize.x, currentSize.y, currentSize.z);
    // mesh.scale.set(desiredScale, desiredScale, desiredScale);
    
    // Apply the overall size scaling
    mesh.scale.set(overallSize, overallSize, overallSize); 
    
    mesh.position.set(0, 0, 0); // Center the mesh; actual position set by Heart class
    mesh.rotation.x = Math.PI; // Optional: flip it if it's upside down by default
    
    return mesh;
}
