import * as THREE from 'three';

import { ColoredMesh } from './ColoredMesh';

import { Color } from '../types/Color';

export class Sphere extends ColoredMesh {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, radius: number, color: Color) {
    super(new THREE.SphereGeometry(radius), color);
    this.scene = scene;
    this.scene.add(this);
  }

  update(radius: number) {
    if (this.geometry instanceof THREE.SphereGeometry && this.geometry.parameters.radius != radius) {
      this.geometry = new THREE.SphereGeometry(radius);
    }
  }

  cleanup() {
    this.scene.remove(this);
  }
}
