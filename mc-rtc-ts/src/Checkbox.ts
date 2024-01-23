import { ImGui } from '@zhobo63/imgui-ts';
import { RequestHandler } from './Request';
import { Widget } from './Widget';

export class Checkbox extends Widget {
  data : boolean = false;

  draw(rh: RequestHandler) {
    if (ImGui.Checkbox(this.label(this.name), (_ = this.data) => this.data = _)) {
      rh({ category: this.category, name: this.name });
    }
  }

  update(data: boolean) : void {
    this.data = data;
  }
}
