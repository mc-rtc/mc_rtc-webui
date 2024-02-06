import * as THREE from 'three';

import { Color } from '../types/Color';

export function makeColor(color: Color) {
  return new THREE.Color(color.r, color.g, color.b);
}

export function makeMaterial(color: Color) {
  const rgb = makeColor(color);
  return new THREE.MeshBasicMaterial({ color: rgb, transparent: color.a != 1.0, opacity: color.a });
}
