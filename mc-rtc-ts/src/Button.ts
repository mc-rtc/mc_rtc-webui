import { ImGui } from '@zhobo63/imgui-ts';
import { RequestHandler } from './Request';
import { Widget } from './Widget';

export class Button extends Widget {
  draw() {
    if (ImGui.Button(this.label(this.name))) {
      this.sendRequest();
    }
  }
}
