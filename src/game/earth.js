import * as THREE from '../../libs/three/three.module.js';
import Entity from '../engine/entity.js';

function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

class Earth extends Entity {
    constructor() {
        super();
        this.name = 'Earthy';
        this.type = 'Earth';
        this.geometry = new THREE.SphereGeometry(5, 64, 64);
        this.textureLoader = new THREE.TextureLoader();

        // Use a smaller texture on mobile devices
        const texturePath = isMobile()
            ? 'assets/textures/land_ocean_ice_cloud_1024.jpg'
            : 'assets/textures/land_ocean_ice_cloud_2048.jpg';

        this.earthTexture = this.textureLoader.load(texturePath);
        this.material = new THREE.MeshPhongMaterial({
            map: this.earthTexture,
            shininess: 5
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.z = -30;
    }

    update(deltaTime) {
        this.mesh.rotation.y += 0.2 * deltaTime;
    }
}

export default Earth;