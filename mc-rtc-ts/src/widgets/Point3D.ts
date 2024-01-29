import { ControllerClient } from '../ControllerClient';
import { Widget } from './Widget';

import { Box } from '../gui/Box';
import { TransformControls } from '../gui/TransformControls';

import { Axes } from '../types/Axes';
import { PointConfig } from '../types/PointConfig';

export class Point3D extends Widget {
  box: Box = null;
  control: TransformControls = null;
  requestName: string = null;
  private was_dragging: boolean = false;

  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    super(client, category, name, sid);
  }

  update(requestName: string, ro: boolean, pos: number[], config: PointConfig) {
    this.requestName = requestName;
    if (!this.box) {
      this.box = this.gui.box(config.scale, config.scale, config.scale, config.color);
      this.control = this.gui.control();
      this.control.setAxes(Axes.TRANSLATION);
      this.control.attach(this.box);
    }
    (<any>this.control).enabled = !ro;
    if (!this.control.dragging && !this.was_dragging) {
      this.box.position.x = pos[0];
      this.box.position.y = pos[1];
      this.box.position.z = pos[2];
    }
  }

  draw3d() {
    if (!this.box) {
      return;
    }
    if (this.control.dragging || this.was_dragging) {
      this.sendRequest([this.box.position.x, this.box.position.y, this.box.position.z], this.requestName);
    }
    this.was_dragging = this.control.dragging;
  }

  cleanup() {
    this.gui.scene.remove(this.control);
    this.gui.controls.splice(this.gui.controls.indexOf(this.control), 1);
  }
}
