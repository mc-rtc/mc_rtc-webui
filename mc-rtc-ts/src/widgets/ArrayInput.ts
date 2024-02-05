import { ImGui } from '@zhobo63/imgui-ts';
import { TransformBase } from './details/TransformBase';
import { Widget } from './Widget';
import { isEditDone } from './utils';

export class ArrayInput extends Widget {
  busy: boolean = false;
  labels: string[] = [];
  data: number[];
  buffer: number[];
  tf_widget: TransformBase = null;

  update(labels: string[], data: number[], tf_widget: TransformBase = null) {
    this.labels = labels;
    this.data = data;
    this.tf_widget = tf_widget;
  }

  draw() {
    const flags: ImGui.InputTextFlags = this.busy ? ImGui.InputTextFlags.None : ImGui.InputTextFlags.ReadOnly;
    const source = this.busy ? this.buffer : this.data;
    const callback =
      (i: number) =>
      (_ = source[i]) =>
        (source[i] = _);
    let edit_done = false;
    ImGui.Text(`${this.name}`);
    ImGui.SameLine();
    edit_done = ImGui.Button(this.label(this.busy ? 'Done' : 'Edit'));
    if (this.tf_widget) {
      ImGui.SameLine();
      this.tf_widget.draw_visibility_toggle();
    }
    ImGui.BeginTable(this.label('', '_table_data'), this.data.length, ImGui.TableFlags.SizingStretchProp);
    for (const label of this.labels) {
      ImGui.TableNextColumn();
      ImGui.Text(label);
    }
    ImGui.TableNextRow();
    for (let i = 0; i < source.length; ++i) {
      ImGui.TableNextColumn();
      ImGui.InputDouble(this.label('', i.toString()), callback(i), 0.0, 0.0, '%.6g', flags);
      edit_done = edit_done || isEditDone();
    }
    ImGui.EndTable();
    if (edit_done) {
      if (this.busy) {
        if (this.buffer !== this.data) {
          this.data = this.buffer;
          this.sendRequest(this.data);
        }
      } else {
        this.buffer = this.data;
      }
      this.busy = !this.busy;
    }
  }
}
