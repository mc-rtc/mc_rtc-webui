import * as THREE from 'three';

import { ControllerClient } from '../../ControllerClient';
import { Widget } from '../Widget';

import { InteractiveTransform } from '../../gui/InteractiveTransform';

import { Axes } from '../../types/Axes';
import { PointConfig } from '../../types/PointConfig';

export class TransformBase extends Widget {
  private control: InteractiveTransform = null;
  private requestName: string = null;

  constructor(client: ControllerClient, category: string[], name: string, sid: number, axes: Axes) {
    super(client, category, name, sid);
    this.control = new InteractiveTransform(client.gui, axes);
  }

  update(requestName: string, ro: boolean, pos: number[], config: PointConfig = new PointConfig()) {
    this.requestName = requestName;
    this.control.update(pos, ro, config);
  }

  draw_visibility_toggle() {
    this.control.draw_visibility_toggle((s) => this.label(s));
  }

  draw3d() {
    if (this.control.draw3d()) {
      let request: number[] = [];
      if ((this.control.axes & Axes.ROTATION) === Axes.ROTATION) {
        const q = this.control.orientation();
        request.push(q.w, -q.x, -q.y, -q.z);
      }
      if ((this.control.axes & Axes.TRANSLATION) === Axes.TRANSLATION) {
        const t = this.control.position();
        request.push(t.x, t.y, t.z);
      }
      if (this.control.axes === Axes.XYZTHETA || this.control.axes === Axes.XYTHETA) {
        // Push theta
        const euler: THREE.Euler = new THREE.Euler();
        euler.setFromQuaternion(this.control.orientation().clone());
        const t = this.control.position();
        request = [t.x, t.y, euler.z];
        if (this.control.axes === Axes.XYZTHETA) {
          request.push(t.z);
        }
      }
      if (request.length !== 0) {
        this.sendRequest(request, this.requestName);
      }
    }
  }

  cleanup() {
    this.control.cleanup();
  }
}
