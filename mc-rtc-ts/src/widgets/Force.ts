import * as THREE from 'three';

import { ArrowBase } from './ArrowBase';

import { ForceConfig } from '../types/ForceConfig';

import { pt_to_matrix4 } from './utils';

export class Force extends ArrowBase {
  update(requestName: string, wrench: number[], pt: number[], config: ForceConfig) {
    const start = new THREE.Vector3(pt[9], pt[10], pt[11]);
    // FIXME Maybe multiply other side?
    const force = pt_to_matrix4(pt).multiply(
      new THREE.Matrix4().makeTranslation(
        new THREE.Vector3(wrench[3], wrench[4], wrench[5]).multiplyScalar(config.force_scale)
      )
    );
    const end = new THREE.Vector3().setFromMatrixPosition(force);
    super.update_impl(requestName, start, end, config, true);
  }
}
