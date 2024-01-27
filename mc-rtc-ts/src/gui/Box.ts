import * as THREE from 'three';

import { Color } from '../types/Color';
import { makeMaterial } from './utils';

export class Box extends THREE.Mesh {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, width: number, height: number, depth: number, color: Color) {
    super(new THREE.BoxGeometry(width, height, depth), makeMaterial(color));
    this.scene = scene;
    this.scene.add(this);
  }

  cleanup() {
    this.scene.remove(this);
  }
}
