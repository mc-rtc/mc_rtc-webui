import { ArrowBase } from './ArrowBase';

import { ArrowConfig } from '../types/ArrowConfig';

export class Arrow extends ArrowBase {
  update(requestName: string, start: THREE.Vector3, end: THREE.Vector3, config: ArrowConfig, ro: boolean) {
    super.update_impl(requestName, start, end, config, ro);
  }
}
