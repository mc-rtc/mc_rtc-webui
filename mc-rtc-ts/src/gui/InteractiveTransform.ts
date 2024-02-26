import * as THREE from 'three';

import { ImGui } from '@zhobo63/imgui-ts';

import { GUI } from '../GUI';

import { Box } from '../gui/Box';
import { Sphere } from '../gui/Sphere';
import { TransformControls } from '../gui/TransformControls';

import { Axes } from '../types/Axes';
import { PointConfig } from '../types/PointConfig';

export class InteractiveTransform {
  axes: Axes;
  private gui: GUI;
  private visual: Box | Sphere = null;
  private control: TransformControls = null;
  private visibility_label: string = '';
  private was_dragging: boolean = false;

  constructor(gui: GUI, axes: Axes, visibility_label: string = '') {
    this.gui = gui;
    this.axes = axes;
    if (visibility_label.length !== 0) {
      this.visibility_label = ' ' + visibility_label;
    }
  }

  update(pos: number[], ro: boolean, config: PointConfig = new PointConfig()) {
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
    if (!this.active()) {
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
        this.visual.setRotationFromEuler(new THREE.Euler(0, 0, pos[2]));
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
        console.error(`${JSON.stringify(this)} requested position update with data of length ${pos.length}`);
      }
    }
  }

  active(): boolean {
    return this.control && (this.control.dragging || this.was_dragging);
  }

  cleanup() {
    if (!this.control) {
      return;
    }
    this.gui.scene.remove(this.control);
    this.gui.controls.splice(this.gui.controls.indexOf(this.control), 1);
    this.visual.cleanup();
  }

  draw_visibility_toggle(get_label: (s: string) => string) {
    const visible: boolean = this.visual.visible;
    const hide = 'Hide' + this.visibility_label;
    const show = 'Show' + this.visibility_label;
    if (ImGui.Button(get_label(visible ? hide : show))) {
      this.visual.visible = !this.visual.visible;
      this.control.visible = this.visual.visible;
    }
  }

  draw3d() {
    if (!this.control) {
      return false;
    }
    const ret = this.control.dragging || this.was_dragging;
    this.was_dragging = this.control.dragging;
    return ret;
  }

  position() {
    if (this.control) {
      return this.visual.position;
    }
    return new THREE.Vector3();
  }

  orientation() {
    if (this.control) {
      return this.visual.quaternion;
    }
    return new THREE.Quaternion();
  }
}
