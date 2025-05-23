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
        this.baseSize = options.baseSize || 0.3;
        this.color = options.color || 0xff3366;
        this.health = options.health || 10;
        
        this.mesh = createHeartMesh();

        // Create a simple sphere mesh for the heart
      //  this.mesh = new THREE.Mesh(
       //     new THREE.SphereGeometry(this.baseSize, 16, 16),
      //      new THREE.MeshPhongMaterial({ color: this.color })
     //   );
        this.mesh.position.copy(this.position);
    }
}





function createHeartMesh(size = 1, color = 0xff3366) {
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
  let firstPoint = true;
  
  // Generate points using parametric heart equation
  for (let t = 0; t <= Math.PI * 2; t += 0.05) {
    // Classic heart equation with natural roundness
    const heartX = 16 * Math.pow(Math.sin(t), 3);
    const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    
    const px = x + heartX * scale;
    const py = y + heartY * scale;
    
    if (firstPoint) {
      heartShape.moveTo(px, py);
      firstPoint = false;
    } else {
      heartShape.lineTo(px, py);
    }
  }
    heartShape.closePath(); // Close the shape

    const geometry = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.2,
        bevelEnabled: false
    });
    const material = new THREE.MeshPhongMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(size, size, size);
    mesh.position.set(0, 0, 0);
    return mesh;
}