import { ImGui } from '@zhobo63/imgui-ts';
import { Widget } from './Widget';

export class ComboInput extends Widget {
  values: string[];
  data: string;

  update(values: string[], data: string) {
    this.values = values;
    this.data = data;
  }

  draw() {
    const idx: number = this.values.findIndex((value: string) => value === this.data);
    const label: string = idx === -1 ? '' : this.data;
    ImGui.Text(this.name);
    ImGui.SameLine();
    if (ImGui.BeginCombo(this.label(''), label)) {
      for (let i = 0; i < this.values.length; ++i) {
        if (ImGui.Selectable(this.values[i], idx === i)) {
          if (i != idx) {
            this.data = this.values[i];
            this.sendRequest(this.data);
          }
        }
        if (idx === i) {
          ImGui.SetItemDefaultFocus();
        }
      }
      ImGui.EndCombo();
    }
  }
}
