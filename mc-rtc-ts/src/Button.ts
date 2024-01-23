import { ImGui } from '@zhobo63/imgui-ts';
import { RequestHandler } from './Request';
import { Widget } from './Widget';

export class Button extends Widget {
  draw(rh: RequestHandler) {
    if (ImGui.Button(this.label(this.name))) {
      rh({ category: this.category, name: this.name });
    }
  }
}
