import * as THREE from 'three';
import Projection from './projection.js';

class SphericalProjection extends Projection {
  // false for monoscopic, 'LR' for left-right split, 'TB' for top-bottom split
  split = false

  createMesh() {
    throw new Error('Spherical projections must override "createMesh"');
  }

  createScreens() {
    // Monoscopic videos are simple
    if (!this.split)
      return [this.createMesh()];

    // Stereoscopic videos have two meshes, one for each eye
    const leftEye = this.createMesh();
    const rightEye = this.createMesh();
    leftEye.layers.set(1);
    rightEye.layers.set(2);

    const uvsL = leftEye.geometry.getAttribute('uv');
    const uvsR = rightEye.geometry.getAttribute('uv');

    // Set each mesh to half the video, depending on the split
    if (this.split === 'LR') {
      for (let i = 0; i < uvsL.count; i++) {
        uvsL.setX(i, uvsL.getX(i) * 0.5);
      }
      for (let i = 0; i < uvsR.count; i++) {
        uvsR.setX(i, uvsR.getX(i) * 0.5 + 0.5);
      }
    } else if (this.split === 'TB') {
      for (let i = 0; i < uvsL.count; i++) {
        uvsL.setY(i, uvsL.getY(i) * 0.5 + 0.5);
      }
      for (let i = 0; i < uvsR.count; i++) {
        uvsR.setY(i, uvsR.getY(i) * 0.5);
      }
    } else {
      throw new Error(`split should be false, "LR", or "TB". Found "${this.split}".`);
    }

    return [leftEye, rightEye];
  }
}

class Sphere360 extends SphericalProjection {
  createMesh() {
    const geometry = new THREE.SphereGeometry(
      this.options.sphereRadius,
      this.options.sphereDetail,
      this.options.sphereDetail
    );
    const material = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      side: THREE.BackSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = -1;
    mesh.quaternion.setFromAxisAngle({ x: 0, y: 1, z: 0 }, -Math.PI / 2);

    return mesh;
  }
}

class Sphere360_LR extends Sphere360 {
  split = 'LR'
}

class Sphere360_TB extends Sphere360 {
  split = 'TB'
}

class Sphere180 extends SphericalProjection {
  createMesh() {
    const geometry = new THREE.SphereGeometry(
      this.options.sphereRadius,
      this.options.sphereDetail,
      this.options.sphereDetail,
      Math.PI,
      Math.PI
    );

    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({ map: this.videoTexture });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
}

class Sphere180_LR extends Sphere180 {
  split = 'LR'
}

class Sphere180_TB extends Sphere180 {
  split = 'TB'
}

// FOV could be moved into options, like sphereRadius
class SphereFisheye extends SphericalProjection {
  split = 'LR' // No examples of mono fisheye found, defaulting to LR
  FOV = 180
  get rFOV() { return Math.PI * (this.FOV / 180); }

  createMesh() {
      const geometry = new THREE.SphereGeometry(
          this.options.sphereRadius,
          this.options.sphereDetail,
          this.options.sphereDetail,
          0,
          Math.PI * 2,
          0,
          this.rFOV / 2
      );
      const material = new THREE.MeshBasicMaterial({ map: this.videoTexture, side: THREE.BackSide });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.x = -1;
      mesh.rotation.x = -Math.PI/2;

      // Warp the mesh for fisheye textures
      const uvs = geometry.getAttribute('uv');
      for (let i = 0; i < uvs.count; i++) {
          const th = 2 * Math.PI * uvs.getX(i);
          const r = 1 - uvs.getY(i);
          const x2 = r * Math.cos(th);
          const y2 = r * Math.sin(th);

          uvs.setX(i, 0.5 + x2 / 2);
          uvs.setY(i, 0.5 + y2 / 2);
      }

      return mesh;
  }
}

class SphereFisheye190 extends SphereFisheye {
  FOV = 190
}

class SphereFisheye200 extends SphereFisheye {
  FOV = 200
}

export {
  SphericalProjection,
  Sphere360, Sphere360_LR, Sphere360_TB,
  Sphere180, Sphere180_LR, Sphere180_TB,
  SphereFisheye, SphereFisheye190, SphereFisheye200
};
