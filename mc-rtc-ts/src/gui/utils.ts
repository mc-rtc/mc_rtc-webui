import * as THREE from 'three';

import { Color } from '../types/Color';

export function makeMaterial(color: Color) {
  const rgb = new THREE.Color(color.r, color.g, color.b);
  return new THREE.MeshBasicMaterial({ color: rgb, transparent: color.a != 1.0, opacity: color.a });
}
