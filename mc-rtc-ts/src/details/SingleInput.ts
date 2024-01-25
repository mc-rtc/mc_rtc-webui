import { ImGui } from '@zhobo63/imgui-ts';
import { RequestHandler } from '../Request';
import { Widget } from '../Widget';

export abstract class SingleInput<DataT> extends Widget {
  busy: boolean = false;
  data: DataT;

  update(data: DataT) {
    this.data = data;
  }

  protected setupBuffer(): void {}

  protected abstract draw_input(label: string, flags: ImGui.ImGuiInputTextFlags): void;

  protected abstract dataFromBuffer(): DataT;

  draw() {
    ImGui.BeginTable(this.label('', 'Table'), 3, ImGui.TableFlags.SizingStretchProp);
    ImGui.TableNextColumn();
    ImGui.Text(`${this.name}`);
    ImGui.TableNextColumn();
    if (!this.busy) {
      if (ImGui.Button(this.label('Edit'))) {
        this.busy = true;
        this.setupBuffer();
      }
      ImGui.TableNextColumn();
      this.draw_input('', ImGui.InputTextFlags.ReadOnly);
    } else {
      const clicked: boolean = ImGui.Button(this.label('Done'));
      ImGui.TableNextColumn();
      this.draw_input(this.label('', 'Input'), ImGui.InputTextFlags.None);
      if (clicked || ImGui.IsKeyPressed(ImGui.ImGuiKey.Enter) || ImGui.IsKeyPressed(ImGui.ImGuiKey.KeyPadEnter)) {
        const nData: DataT = this.dataFromBuffer();
        if (nData !== this.data) {
          this.data = nData;
          this.sendRequest(this.data);
        }
        this.busy = false;
      }
    }
    ImGui.EndTable();
  }
}
