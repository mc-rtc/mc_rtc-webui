import * as THREE from 'three';

import { Color } from '../types/Color';
import { makeMaterial } from './utils';

export class Sphere extends THREE.Mesh {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, radius: number, color: Color) {
    super(new THREE.SphereGeometry(radius), makeMaterial(color));
    this.scene = scene;
    this.scene.add(this);
  }

  cleanup() {
    this.scene.remove(this);
  }
}
