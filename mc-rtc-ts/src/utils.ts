import { ImGui } from '@zhobo63/imgui-ts';

export function norm(data: number[]): number {
  let res: number = 0;
  for (const n of data) {
    res += n * n;
  }
  return Math.sqrt(res);
}

export function isEditDone() {
  return (
    ImGui.IsItemDeactivatedAfterEdit() &&
    (ImGui.IsKeyPressed(ImGui.Key.Enter) || ImGui.IsKeyPressed(ImGui.Key.KeyPadEnter))
  );
}
