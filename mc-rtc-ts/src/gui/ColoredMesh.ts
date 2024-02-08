import * as THREE from 'three';

import { Color } from '../types/Color';

import { makeMaterial, updateMaterial } from './utils';

export class ColoredMesh extends THREE.Mesh {
  constructor(geometry: THREE.BufferGeometry, color: Color) {
    super(geometry, makeMaterial(color));
  }

  setColor(color: Color) {
    if (this.material instanceof THREE.MeshStandardMaterial) {
      updateMaterial(this.material, color);
    }
  }
}
