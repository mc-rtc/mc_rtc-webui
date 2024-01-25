import { ImGui } from '@zhobo63/imgui-ts';
import { SingleInput } from './details/SingleInput';

export class NumberInput extends SingleInput<number> {
  private buffer: number = 0;

  protected setupBuffer() {
    this.buffer = this.data;
  }

  protected dataFromBuffer() {
    return this.buffer;
  }

  protected draw_input(label: string, flags: ImGui.ImGuiInputTextFlags) {
    const fun = (callback: ImGui.ImAccess<number>) => ImGui.InputFloat(label, callback, 0.0, 0.0, '%.6g', flags);
    if (!this.busy) {
      fun((_ = this.data) => (this.data = _));
    } else {
      fun((_ = this.buffer) => (this.buffer = _));
    }
  }
}
