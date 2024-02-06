import * as THREE from 'three';

import { ImGui } from '@zhobo63/imgui-ts';

import { Widget } from './Widget';

import { Arrow as gui_Arrow } from '../gui/Arrow';
import { Axes } from '../types/Axes';
import { ArrowConfig } from '../types/ArrowConfig';
import { InteractiveTransform } from '../gui/InteractiveTransform';

export class ArrowBase extends Widget {
  private arrow: gui_Arrow = null;
  private start_control: InteractiveTransform = null;
  private end_control: InteractiveTransform = null;
  private requestName: string;

  update_impl(requestName: string, start: THREE.Vector3, end: THREE.Vector3, config: ArrowConfig, ro: boolean) {
    this.requestName = requestName;
    if (!this.arrow) {
      this.arrow = this.gui.arrow();
    }
    if (!ro && !this.start_control) {
      this.start_control = new InteractiveTransform(this.gui, Axes.TRANSLATION, 'start');
      this.end_control = new InteractiveTransform(this.gui, Axes.TRANSLATION, 'end');
    }
    if (ro && this.start_control) {
      this.start_control.cleanup();
      this.start_control = null;
      this.end_control.cleanup();
      this.end_control = null;
    }
    this.arrow.update(start, end, config);
    if (this.start_control) {
      this.start_control.update(start.toArray(), ro);
      this.end_control.update(end.toArray(), ro);
    }
  }

  draw3d() {
    if (this.start_control) {
      const update: boolean = this.start_control.draw3d();
      if (this.end_control.draw3d() || update) {
        const request: number[] = this.start_control.position().toArray().concat(this.end_control.position().toArray());
        this.sendRequest(request, this.requestName);
      }
    }
  }

  draw_visibility_toggle() {
    if (!this.start_control) {
      return;
    }
    this.start_control.draw_visibility_toggle((s) => this.label(s, '_start_control'));
    ImGui.SameLine();
    this.end_control.draw_visibility_toggle((s) => this.label(s, '_end_control'));
  }

  cleanup() {
    this.arrow.cleanup();
    if (this.start_control) {
      this.start_control.cleanup();
      this.end_control.cleanup();
    }
  }
}
