import * as THREE from 'three';

import { ColoredMesh } from './ColoredMesh';

import { Color } from '../types/Color';

export class Box extends ColoredMesh {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, width: number, height: number, depth: number, color: Color) {
    super(new THREE.BoxGeometry(width, height, depth), color);
    this.scene = scene;
    this.scene.add(this);
  }

  update(width: number, height: number, depth: number) {
    if (this.geometry instanceof THREE.BoxGeometry) {
      if (
        this.geometry.parameters.width != width ||
        this.geometry.parameters.height != height ||
        this.geometry.parameters.depth != depth
      ) {
        this.geometry = new THREE.BoxGeometry(width, height, depth);
      }
    }
  }

  cleanup() {
    this.scene.remove(this);
  }
}
