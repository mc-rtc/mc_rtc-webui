import { ImGui } from '@zhobo63/imgui-ts';
import { Widget } from './Widget';

export class Label extends Widget {
  data: string = '';
  draw() {
    const str: string = (() => {
      if (this.data.length != 0) {
        return `${this.name} ${this.data}`;
      }
      return `${this.name}`;
    })();
    ImGui.Text(str);
  }
  update(data: string) {
    this.data = data;
  }
}
