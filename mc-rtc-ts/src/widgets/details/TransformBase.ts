import * as THREE from 'three';

import { ControllerClient } from '../../ControllerClient';
import { Widget } from '../Widget';

import { Box } from '../../gui/Box';
import { Sphere } from '../../gui/Sphere';
import { TransformControls } from '../../gui/TransformControls';

import { Axes } from '../../types/Axes';
import { PointConfig } from '../../types/PointConfig';

export class TransformBase extends Widget {
  private axes: Axes;
  private visual: Box | Sphere = null;
  private control: TransformControls = null;
  private requestName: string = null;
  private was_dragging: boolean = false;

  constructor(client: ControllerClient, category: string[], name: string, sid: number, axes: Axes) {
    super(client, category, name, sid);
    this.axes = axes;
  }

  update(requestName: string, ro: boolean, pos: number[], config: PointConfig = new PointConfig()) {
    this.requestName = requestName;
    if (!this.visual) {
      // Display rotation and transforms with a box, points with a sphere
      if (pos.length !== 3) {
        this.visual = this.gui.box(config.scale, config.scale, config.scale, config.color);
      } else {
        this.visual = this.gui.sphere(config.scale, config.color);
      }
      this.control = this.gui.control();
      this.control.setAxes(this.axes);
      this.control.attach(this.visual);
    }
    (<any>this.control).enabled = !ro;
    if (!this.control.dragging && !this.was_dragging) {
      if (pos.length === 3) {
        // TRANSLATION
        this.visual.position.x = pos[0];
        this.visual.position.y = pos[1];
        this.visual.position.z = pos[2];
      } else if (pos.length === 4) {
        // XYZTHETA
        this.visual.position.x = pos[0];
        this.visual.position.y = pos[1];
        this.visual.position.z = pos[3];
        this.visual.setRotationFromEuler(new THREE.Euler(0, 0, -pos[2]));
      } else if (pos.length === 7) {
        // ALL
        this.visual.quaternion.w = pos[0];
        this.visual.quaternion.x = -pos[1];
        this.visual.quaternion.y = -pos[2];
        this.visual.quaternion.z = -pos[3];
        this.visual.position.x = pos[4];
        this.visual.position.y = pos[5];
        this.visual.position.z = pos[6];
      } else {
        console.log(`${this.name} requested position update with data of length ${pos.length}`);
      }
    }
  }

  draw3d() {
    if (!this.visual) {
      return;
    }
    if (this.control.dragging || this.was_dragging) {
      let request: number[] = [];
      if ((this.axes & Axes.ROTATION) === Axes.ROTATION) {
        request.push(
          this.visual.quaternion.w,
          -this.visual.quaternion.x,
          -this.visual.quaternion.y,
          -this.visual.quaternion.z
        );
      }
      if ((this.axes & Axes.TRANSLATION) === Axes.TRANSLATION) {
        request.push(this.visual.position.x, this.visual.position.y, this.visual.position.z);
      }
      if (this.axes === Axes.XYZTHETA || this.axes === Axes.XYTHETA) {
        // Push theta
        const euler: THREE.Euler = new THREE.Euler();
        euler.setFromQuaternion(this.visual.quaternion.clone().invert());
        request = [this.visual.position.x, this.visual.position.y, euler.z];
        if (this.axes === Axes.XYZTHETA) {
          request.push(this.visual.position.z);
        }
      }
      if (request.length !== 0) {
        this.sendRequest(request, this.requestName);
      }
    }
    this.was_dragging = this.control.dragging;
  }

  cleanup() {
    if (!this.control) {
      return;
    }
    this.gui.scene.remove(this.control);
    this.gui.controls.splice(this.gui.controls.indexOf(this.control), 1);
    this.visual.cleanup();
  }
}
