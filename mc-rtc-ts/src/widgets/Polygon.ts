import * as THREE from 'three';

import { Widget } from './Widget';

import { ControllerClient } from '../ControllerClient';

import { LineConfig, LineStyle } from '../types/LineConfig';

import { makeColor } from '../gui/utils';

export class Polygon extends Widget {
  private scene: THREE.Scene;
  private visuals: THREE.Line[] = [];
  private material: THREE.LineBasicMaterial | THREE.LineDashedMaterial = null;

  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    super(client, category, name, sid);
    this.scene = client.gui.scene;
  }

  update(polys: THREE.Vector3[][], config: LineConfig) {
    if (config.style === LineStyle.Solid && !(this.material instanceof THREE.LineBasicMaterial)) {
      this.material = new THREE.LineBasicMaterial();
    } else if (config.style === LineStyle.Dotted && !(this.material instanceof THREE.LineDashedMaterial)) {
      this.material = new THREE.LineDashedMaterial({ dashSize: 0.1, gapSize: 0.1 });
    }
    this.material.linewidth = config.width;
    this.material.color = makeColor(config.color);
    this.material.transparent = config.color.a != 1.0;
    this.material.opacity = config.color.a;
    for (let i = 0; i < polys.length; ++i) {
      if (this.visuals.length <= i) {
        this.visuals.push(new THREE.Line(new THREE.BufferGeometry(), this.material));
        this.scene.add(this.visuals[i]);
      }
      this.visuals[i].material = this.material;
      this.visuals[i].geometry.setFromPoints(polys[i]);
      if (this.material instanceof THREE.LineDashedMaterial) {
        this.visuals[i].computeLineDistances();
      }
    }
    for (let i = polys.length; i < this.visuals.length; ++i) {
      this.scene.remove(this.visuals[i]);
    }
    this.visuals.splice(polys.length, this.visuals.length - polys.length);
  }

  cleanup() {
    for (const visual of this.visuals) {
      this.scene.remove(visual);
    }
  }
}
