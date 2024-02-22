import * as THREE from 'three';

import { Widget } from './Widget';

import { ControllerClient } from '../ControllerClient';

import { LineConfig, LineStyle } from '../types/LineConfig';

import { makeColor } from '../gui/utils';

export class Trajectory extends Widget {
  private scene: THREE.Scene;
  private visual: THREE.Line = null;
  private material: THREE.LineBasicMaterial | THREE.LineDashedMaterial = null;
  private points: THREE.Vector3[] = [];

  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    super(client, category, name, sid);
    this.scene = client.gui.scene;
  }

  update(points: THREE.Vector3[], config: LineConfig) {
    if (!this.visual) {
      this.visual = new THREE.Line(new THREE.BufferGeometry(), null);
      this.scene.add(this.visual);
    }
    if (config.style === LineStyle.Solid && !(this.material instanceof THREE.LineBasicMaterial)) {
      this.material = new THREE.LineBasicMaterial();
      this.visual.material = this.material;
    } else if (config.style === LineStyle.Dotted && !(this.material instanceof THREE.LineDashedMaterial)) {
      this.material = new THREE.LineDashedMaterial();
      this.visual.material = this.material;
    }
    this.material.linewidth = config.width;
    this.material.color = makeColor(config.color);
    this.material.transparent = config.color.a != 1.0;
    this.material.opacity = config.color.a;
    if (points.length === 1) {
      this.points.push(points[0]);
    } else {
      this.points = points;
    }
    this.visual.geometry.setFromPoints(this.points);
  }

  cleanup() {
    if (this.visual) {
      this.scene.remove(this.visual);
    }
  }
}
