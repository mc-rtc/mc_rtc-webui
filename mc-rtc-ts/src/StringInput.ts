import { ImGui } from '@zhobo63/imgui-ts';
import { SingleInput } from './details/SingleInput';

export class StringInput extends SingleInput<string> {
  private buffer: ImGui.ImStringBuffer = new ImGui.ImStringBuffer(256);

  protected setupBuffer() {
    this.buffer.buffer = this.data;
  }

  protected dataFromBuffer() {
    return this.buffer.buffer;
  }

  protected draw_input(label: string, flags: ImGui.ImGuiInputTextFlags) {
    if (!this.busy) {
      ImGui.InputText(label, (_ = this.data) => (this.data = _), null, flags);
    } else {
      ImGui.InputText(label, this.buffer);
    }
  }
}
