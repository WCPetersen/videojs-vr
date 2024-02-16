import * as THREE from 'three';
import Projection from './projection.js';

// TODO: Clean and document
class EAC extends Projection {
  createMesh(mapMatrix, scaleMatrix) {
    // "Continuity correction?": because of discontinuous faces and aliasing,
    // we truncate the 2-pixel-wide strips on all discontinuous edges,
    const contCorrect = 2;

    const geometry = new THREE.BoxGeometry(256, 256, 256);
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

    const left = [new THREE.Vector2(1, 1), new THREE.Vector2(2 / 3, 1), new THREE.Vector2(1, 1 / 2), new THREE.Vector2(2 / 3, 1 / 2)];
    const right = [new THREE.Vector2(1 / 3, 1), new THREE.Vector2(0, 1), new THREE.Vector2(1 / 3, 1 / 2), new THREE.Vector2(0, 1 / 2)];
    const top = [new THREE.Vector2(1, 0), new THREE.Vector2(1, 1 / 2), new THREE.Vector2(2 / 3, 0), new THREE.Vector2(2 / 3, 1 / 2)];
    const bottom = [new THREE.Vector2(1 / 3, 0), new THREE.Vector2(1 / 3, 1 / 2), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1 / 2)];
    const back = [new THREE.Vector2(2 / 3, 0), new THREE.Vector2(2 / 3, 1 / 2), new THREE.Vector2(1 / 3, 0), new THREE.Vector2(1 / 3, 1 / 2)];
    const front = [new THREE.Vector2(2 / 3, 1), new THREE.Vector2(1 / 3, 1), new THREE.Vector2(2 / 3, 1 / 2), new THREE.Vector2(1 / 3, 1 / 2)];

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

    // LEFT
    uvs.setXY(0, left[0].x, left[0].y);
    uvs.setXY(1, left[1].x, left[1].y);
    uvs.setXY(2, left[2].x, left[2].y);
    uvs.setXY(3, left[3].x, left[3].y);

    // RIGHT
    uvs.setXY(4, right[0].x, right[0].y);
    uvs.setXY(5, right[1].x, right[1].y);
    uvs.setXY(6, right[2].x, right[2].y);
    uvs.setXY(7, right[3].x, right[3].y);

    // TOP/UP
    uvs.setXY(8, top[0].x, top[0].y);
    uvs.setXY(9, top[1].x, top[1].y);
    uvs.setXY(10, top[2].x, top[2].y);
    uvs.setXY(11, top[3].x, top[3].y);

    // BOTTOM/DOWN
    uvs.setXY(12, bottom[0].x, bottom[0].y);
    uvs.setXY(13, bottom[1].x, bottom[1].y);
    uvs.setXY(14, bottom[2].x, bottom[2].y);
    uvs.setXY(15, bottom[3].x, bottom[3].y);

    // BACK
    uvs.setXY(16, back[0].x, back[0].y);
    uvs.setXY(17, back[1].x, back[1].y);
    uvs.setXY(18, back[2].x, back[2].y);
    uvs.setXY(19, back[3].x, back[3].y);

    // FRONT
    uvs.setXY(20, front[0].x, front[0].y);
    uvs.setXY(21, front[1].x, front[1].y);
    uvs.setXY(22, front[2].x, front[2].y);
    uvs.setXY(23, front[3].x, front[3].y);

    const mesh = new THREE.Mesh(geometry, material);

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
