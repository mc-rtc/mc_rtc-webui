import * as THREE from 'three';

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

export function pt_to_array(pos: number[]) {
  // prettier-ignore
  const m: THREE.Matrix4 = new THREE.Matrix4(pos[0], pos[1], pos[2], 0,
    pos[3], pos[4], pos[5], 0,
    pos[6], pos[7], pos[8], 0,
    0, 0, 0, 1);
  const q: THREE.Quaternion = new THREE.Quaternion().setFromRotationMatrix(m);
  return [q.w, q.x, q.y, q.z, pos[9], pos[10], pos[11]];
}

export function pt_to_matrix4(pos: number[]) {
  // prettier-ignore
  const m: THREE.Matrix4 = new THREE.Matrix4(pos[0], pos[1], pos[2], pos[9],
    pos[3], pos[4], pos[5], pos[10],
    pos[6], pos[7], pos[8], pos[11],
    0, 0, 0, 1);
  const q = new THREE.Quaternion().setFromRotationMatrix(m).invert();
  const t = new THREE.Vector3().setFromMatrixPosition(m);
  return new THREE.Matrix4().compose(t, q, new THREE.Vector3(1, 1, 1));
}
