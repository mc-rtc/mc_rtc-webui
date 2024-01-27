import * as THREE from 'three';

import { Color } from '../types/Color';

export function makeMaterial(color: Color) {
  const rgb = new THREE.Color(color[0], color[1], color[2]);
  const alpha = color[3];
  return new THREE.MeshBasicMaterial({ color: rgb, transparent: alpha != 1.0, opacity: alpha });
}
