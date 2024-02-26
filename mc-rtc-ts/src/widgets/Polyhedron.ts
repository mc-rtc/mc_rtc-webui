import * as THREE from 'three';

import { Widget } from './Widget';

import { ControllerClient } from '../ControllerClient';

import { PolyhedronConfig } from '../types/PolyhedronConfig';

import { makeMaterial, updateMaterial } from './../gui/utils';

export class Polyhedron extends Widget {
  private visual: THREE.Mesh = null;

  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    super(client, category, name, sid);
  }

  update(points: THREE.Vector3[], indices: number[], colors: number[], config: PolyhedronConfig) {
    // FIXME Better handle PolyhedronConfig
    if (!this.visual) {
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true
      });
      this.visual = new THREE.Mesh(new THREE.BufferGeometry(), material);
      this.client.gui.scene.add(this.visual);
    }
    if (colors.length != 4 * points.length) {
      console.error(`Expected ${4 * points.length} data in colors but got ${colors.length}`);
      return;
    }
    this.visual.geometry.setFromPoints(points);
    this.visual.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    this.visual.geometry.setIndex(indices);
    this.visual.geometry.computeVertexNormals();
  }

  cleanup() {
    if (this.visual) {
      this.client.gui.scene.remove(this.visual);
    }
  }
}
