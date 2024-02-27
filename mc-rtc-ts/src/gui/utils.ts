import * as THREE from 'three';

import { Color } from '../types/Color';
import { LineConfig, LineStyle } from '../types/LineConfig';

export function makeColor(color: Color) {
  return new THREE.Color(color.r, color.g, color.b);
}

export function makeMaterial(color: Color) {
  const rgb = makeColor(color);
  return new THREE.MeshStandardMaterial({ color: rgb, transparent: color.a != 1.0, opacity: color.a });
}

export function updateMaterial(
  material: THREE.MeshStandardMaterial | THREE.LineBasicMaterial | THREE.LineDashedMaterial,
  color: Color
) {
  material.color = makeColor(color);
  material.transparent = color.a != 1.0;
  material.opacity = color.a;
}

export function updateLineMaterial(
  material: THREE.LineBasicMaterial | THREE.LineDashedMaterial,
  config: LineConfig
): THREE.LineBasicMaterial | THREE.LineDashedMaterial {
  if (material instanceof THREE.LineBasicMaterial && config.style === LineStyle.Dotted) {
    return updateLineMaterial(new THREE.LineDashedMaterial({ dashSize: 0.1, gapSize: 0.1 }), config);
  }
  if (material instanceof THREE.LineDashedMaterial && config.style === LineStyle.Solid) {
    return updateLineMaterial(new THREE.LineBasicMaterial(), config);
  }
  updateMaterial(material, config.color);
  material.linewidth = config.width;
  return material;
}
