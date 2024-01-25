import { ImGui } from '@zhobo63/imgui-ts';
import { Widget } from './Widget';

export class NumberSlider extends Widget {
  data: number;
  min: number;
  max: number;

  update(data: number, min: number, max: number) {
    this.data = data;
    this.min = min;
    this.max = max;
  }

  draw() {
    ImGui.BeginTable(this.label('', 'Table'), 2, ImGui.TableFlags.SizingStretchProp);
    ImGui.TableNextColumn();
    ImGui.Text(`${this.name}`);
    ImGui.TableNextColumn();
    if (ImGui.SliderFloat(this.label(''), (_ = this.data) => (this.data = _), this.min, this.max)) {
      this.sendRequest(this.data);
    }
    ImGui.EndTable();
  }
}
