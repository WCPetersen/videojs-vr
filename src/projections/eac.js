import * as THREE from 'three';
import Projection from './projection.js';

// TODO: Clean and document
class EAC extends Projection {
  createMesh(mapMatrix, scaleMatrix) {
    // "Continuity correction?": because of discontinuous faces and aliasing,
    // we truncate the 2-pixel-wide strips on all discontinuous edges,
    const contCorrect = 2;

    const geometry = new THREE.BoxBufferGeometry(256, 256, 256);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        mapped: { value: this.videoTexture },
        mapMatrix: { value: mapMatrix },
        contCorrect: { value: contCorrect },
        faceWH: { value: new THREE.Vector2(1 / 3, 1 / 2).applyMatrix3(scaleMatrix) },
        vidWH: { value: new THREE.Vector2(this.videoTexture.image.videoWidth, this.videoTexture.image.videoHeight).applyMatrix3(scaleMatrix) }
      },
      vertexShader: `
varying vec2 vUv;
uniform mat3 mapMatrix;

void main() {
  vUv = (mapMatrix * vec3(uv, 1.)).xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`,
      fragmentShader: `
varying vec2 vUv;
uniform sampler2D mapped;
uniform vec2 faceWH;
uniform vec2 vidWH;
uniform float contCorrect;

const float PI = 3.1415926535897932384626433832795;

void main() {
  vec2 corner = vUv - mod(vUv, faceWH) + vec2(0, contCorrect / vidWH.y);

  vec2 faceWHadj = faceWH - vec2(0, contCorrect * 2. / vidWH.y);

  vec2 p = (vUv - corner) / faceWHadj - .5;
  vec2 q = 2. / PI * atan(2. * p) + .5;

  vec2 eUv = corner + q * faceWHadj;

  gl_FragColor = texture2D(mapped, eUv);
}`
    });

    const right = [new THREE.Vector2(0, 1 / 2), new THREE.Vector2(1 / 3, 1 / 2), new THREE.Vector2(1 / 3, 1), new THREE.Vector2(0, 1)];
    const front = [new THREE.Vector2(1 / 3, 1 / 2), new THREE.Vector2(2 / 3, 1 / 2), new THREE.Vector2(2 / 3, 1), new THREE.Vector2(1 / 3, 1)];
    const left = [new THREE.Vector2(2 / 3, 1 / 2), new THREE.Vector2(1, 1 / 2), new THREE.Vector2(1, 1), new THREE.Vector2(2 / 3, 1)];
    const bottom = [new THREE.Vector2(1 / 3, 0), new THREE.Vector2(1 / 3, 1 / 2), new THREE.Vector2(0, 1 / 2), new THREE.Vector2(0, 0)];
    const back = [new THREE.Vector2(1 / 3, 1 / 2), new THREE.Vector2(1 / 3, 0), new THREE.Vector2(2 / 3, 0), new THREE.Vector2(2 / 3, 1 / 2)];
    const top = [new THREE.Vector2(1, 0), new THREE.Vector2(1, 1 / 2), new THREE.Vector2(2 / 3, 1 / 2), new THREE.Vector2(2 / 3, 0)];

    for (const face of [right, front, left, bottom, back, top]) {
      const height = this.videoTexture.image.videoHeight;
      let lowY = 1;
      let highY = 0;

      for (const vector of face) {
        if (vector.y < lowY) {
          lowY = vector.y;
        }
        if (vector.y > highY) {
          highY = vector.y;
        }
      }

      for (const vector of face) {
        if (Math.abs(vector.y - lowY) < Number.EPSILON) {
          vector.y += contCorrect / height;
        }
        if (Math.abs(vector.y - highY) < Number.EPSILON) {
          vector.y -= contCorrect / height;
        }

        vector.x = vector.x / height * (height - contCorrect * 2) + contCorrect / height;
      }
    }

    const uvs = geometry.getAttribute('uv');

    uvs.setXYZ(0, right[2], right[1], right[3]);
    uvs.setXYZ(1, right[1], right[0], right[3]);

    uvs.setXYZ(2, left[2], left[1], left[3]);
    uvs.setXYZ(3, left[1], left[0], left[3]);

    uvs.setXYZ(4, top[2], top[1], top[3]);
    uvs.setXYZ(5, top[1], top[0], top[3]);

    uvs.setXYZ(6, bottom[2], bottom[1], bottom[3]);
    uvs.setXYZ(7, bottom[1], bottom[0], bottom[3]);

    uvs.setXYZ(8, front[2], front[1], front[3]);
    uvs.setXYZ(9, front[1], front[0], front[3]);

    uvs.setXYZ(10, back[2], back[1], back[3]);
    uvs.setXYZ(11, back[1], back[0], back[3]);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = -Math.PI;

    return mesh;
  }

  createScreens() {
    return [this.createMesh(new THREE.Matrix3(), new THREE.Matrix3())];
  }
}

class EAC_LR extends EAC {
  createScreens() {
    const scaleMatrix = new THREE.Matrix3().set(
      0, 0.5, 0,
      1, 0, 0,
      0, 0, 1
    );

    const leftMap = new THREE.Matrix3().set(
      0, -0.5, 0.5,
      1, 0, 0,
      0, 0, 1
    );
    const rightMap = new THREE.Matrix3().set(
      0, -0.5, 1,
      1, 0, 0,
      0, 0, 1
    )

    const leftEye = this.createMesh(leftMap, scaleMatrix);
    const rightEye = this.createMesh(rightMap, scaleMatrix);
    leftEye.layers.set(1);
    rightEye.layers.set(2);

    return [leftEye, rightEye];
  }
}

export { EAC, EAC_LR };
