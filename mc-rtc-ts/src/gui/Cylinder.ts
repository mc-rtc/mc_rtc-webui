import * as THREE from 'three';

import { ColoredMesh } from './ColoredMesh';

import { Color } from '../types/Color';

export class Cylinder extends ColoredMesh {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, radius: number, height: number, color: Color) {
    super(new THREE.CylinderGeometry(radius, radius, height), color);
    this.geometry.rotateX(3.14 / 2);
    this.scene = scene;
    this.scene.add(this);
  }

  update(radius: number, height: number) {
    if (this.geometry instanceof THREE.CylinderGeometry) {
      if (this.geometry.parameters.radiusTop != radius || this.geometry.parameters.height != height) {
        this.geometry = new THREE.CylinderGeometry(radius, radius, height);
        this.geometry.rotateX(3.14 / 2);
      }
    }
  }

  cleanup() {
    this.scene.remove(this);
  }
}
