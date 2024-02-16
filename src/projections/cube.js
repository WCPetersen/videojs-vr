import * as THREE from 'three';
import Projection from './projection.js';

// TODO: Clean and document
class Cube360 extends Projection {
  createMesh() {
    const geometry = new THREE.BoxBufferGeometry(256, 256, 256);
    const material = new THREE.MeshBasicMaterial({ map: this.videoTexture, side: THREE.BackSide });

    const uvs = geometry.getAttribute('uv');

    const front = [new THREE.Vector2(1.0 / 3.0, 1.0 / 2.0), new THREE.Vector2(1.0 / 3.0, 1), new THREE.Vector2(0, 1), new THREE.Vector2(0, 1.0 / 2.0)];
    const right = [new THREE.Vector2(2.0 / 3.0, 1.0 / 2.0), new THREE.Vector2(2.0 / 3.0, 1), new THREE.Vector2(1.0 / 3.0, 1), new THREE.Vector2(1.0 / 3.0, 1.0 / 2.0)];
    const top = [new THREE.Vector2(1, 1), new THREE.Vector2(2.0 / 3.0, 1), new THREE.Vector2(2.0 / 3.0, 1.0 / 2.0), new THREE.Vector2(1, 1.0 / 2.0)];
    const bottom = [new THREE.Vector2(0, 0), new THREE.Vector2(1.0 / 3.0, 0), new THREE.Vector2(1.0 / 3.0, 1.0 / 2.0), new THREE.Vector2(0, 1.0 / 2.0)];
    const back = [new THREE.Vector2(2.0 / 3.0, 0), new THREE.Vector2(2.0 / 3.0, 1.0 / 2.0), new THREE.Vector2(1.0 / 3.0, 1.0 / 2.0), new THREE.Vector2(1.0 / 3.0, 0)];
    const left = [new THREE.Vector2(1, 0), new THREE.Vector2(1, 1.0 / 2.0), new THREE.Vector2(2.0 / 3.0, 1.0 / 2.0), new THREE.Vector2(2.0 / 3.0, 0)];

    // LEFT
    uvs.setXY(0, left[2].x, left[2].y);
    uvs.setXY(1, left[1].x, left[1].y);
    uvs.setXY(2, left[3].x, left[3].y);
    uvs.setXY(3, left[0].x, left[0].y);

    // BACK
    uvs.setXY(4, back[2].x, back[2].y);
    uvs.setXY(5, back[1].x, back[1].y);
    uvs.setXY(6, back[3].x, back[3].y);
    uvs.setXY(7, back[0].x, back[0].y);

    // TOP/UP
    uvs.setXY(8, top[2].x, top[2].y);
    uvs.setXY(9, top[1].x, top[1].y);
    uvs.setXY(10, top[3].x, top[3].y);
    uvs.setXY(11, top[0].x, top[0].y);

    // BOTTOM/DOWN
    uvs.setXY(12, bottom[2].x, bottom[2].y);
    uvs.setXY(13, bottom[1].x, bottom[1].y);
    uvs.setXY(14, bottom[3].x, bottom[3].y);
    uvs.setXY(15, bottom[0].x, bottom[0].y);

    // FRONT
    uvs.setXY(16, front[2].x, front[2].y);
    uvs.setXY(17, front[1].x, front[1].y);
    uvs.setXY(18, front[3].x, front[3].y);
    uvs.setXY(19, front[0].x, front[0].y);

    // RIGHT
    uvs.setXY(20, right[2].x, right[2].y);
    uvs.setXY(21, right[1].x, right[1].y);
    uvs.setXY(22, right[3].x, right[3].y);
    uvs.setXY(23, right[0].x, right[0].y);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = -Math.PI;
    mesh.scale.x = -1;

    return mesh;
  }

  createScreens() {
    this.screen = this.createMesh();
    return [this.screen];
  }
}

export default Cube360;
