import * as THREE from 'three';

import { ArrowConfig } from '../types/ArrowConfig';

import { makeColor } from './utils';

export class Arrow extends THREE.ArrowHelper {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    super();
    this.scene = scene;
    this.scene.add(this);
  }

  cleanup() {
    this.scene.remove(this);
  }

  update(start: THREE.Vector3, end: THREE.Vector3, config: ArrowConfig) {
    const dir = end.clone().sub(start);
    this.setLength(dir.length(), config.head_len, config.head_diam);
    this.setDirection(dir.normalize());
    this.position.x = start.x;
    this.position.y = start.y;
    this.position.z = start.z;
    this.setColor(makeColor(config.color));
    // FIXME Use scale/shaft_diam/start_point_scale/end_point_scale
  }
}
