import { ImGui } from '@zhobo63/imgui-ts';
import { TransformBase } from './details/TransformBase';
import { Widget } from './Widget';
import { norm } from './utils';

export class ArrayLabel extends Widget {
  data: number[] = [];
  labels: string[] = [];
  tf_widget: TransformBase = null;

  draw() {
    ImGui.Text(this.name);
    if (this.tf_widget) {
      ImGui.SameLine();
      this.tf_widget.draw_visibility_toggle();
    }
    // "Long" data vector with no labels
    if (this.data.length > 6 && this.labels.length === 0) {
      const hovered: boolean = ImGui.IsItemHovered();
      ImGui.SameLine();
      ImGui.Text(`${+norm(this.data).toFixed(4)}`);
      if (hovered || ImGui.IsItemHovered()) {
        ImGui.BeginTooltip();
        ImGui.Text(`${this.data}`);
        ImGui.EndTooltip();
      }
      return;
    }
    let min: ImGui.ImVec2 = null;
    ImGui.BeginTable(
      this.label('', '_table_data'),
      Math.max(this.data.length, this.labels.length),
      ImGui.ImGuiTableFlags.SizingStretchProp
    );
    for (let i = 0; i < this.labels.length; ++i) {
      ImGui.TableNextColumn();
      ImGui.Text(this.labels[i]);
      if (i == 0) {
        min = ImGui.GetItemRectMin();
      }
    }
    ImGui.TableNextRow();
    let max: ImGui.ImVec2 = null;
    for (let i = 0; i < this.data.length; ++i) {
      ImGui.TableNextColumn();
      ImGui.Text(`${+this.data[i].toFixed(4)}`);
      if (i == 0 && min === null) {
        min = ImGui.GetItemRectMin();
      }
      if (i == this.data.length - 1) {
        max = ImGui.GetItemRectMax();
      }
    }
    ImGui.EndTable();
    if (ImGui.IsMouseHoveringRect(min, max)) {
      ImGui.BeginTooltip();
      ImGui.Text(`${+norm(this.data).toFixed(4)}`);
      ImGui.EndTooltip();
    }
  }

  update(labels: string[], data: number[], tf_widget: TransformBase = null) {
    this.labels = labels;
    this.data = data;
    this.tf_widget = tf_widget;
  }
}
