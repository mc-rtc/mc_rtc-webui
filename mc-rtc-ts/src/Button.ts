import { ImGui } from '@zhobo63/imgui-ts';
import { Widget } from './Widget';

export class Button extends Widget {
  draw() {
    if (ImGui.Button(this.label(this.name))) {
      this.sendRequest();
    }
  }
}
