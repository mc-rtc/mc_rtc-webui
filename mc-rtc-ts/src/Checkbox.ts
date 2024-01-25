import { ImGui } from '@zhobo63/imgui-ts';
import { Widget } from './Widget';

export class Checkbox extends Widget {
  data: boolean = false;

  draw() {
    if (ImGui.Checkbox(this.label(this.name), (_ = this.data) => (this.data = _))) {
      this.sendRequest();
    }
  }

  update(data: boolean): void {
    this.data = data;
  }
}
