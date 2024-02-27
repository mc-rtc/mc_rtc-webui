import * as THREE from 'three';

import { ImGui } from '@zhobo63/imgui-ts';

import { Widget } from './Widget';

import { ControllerClient } from '../ControllerClient';

import { Color } from '../types/Color';
import { PolyhedronConfig } from '../types/PolyhedronConfig';

import { updateMaterial, updateLineMaterial } from '../gui/utils';

function ColorFromImGui(label: string, color: Color) {
  const im_color = new ImGui.Vec4(...color.data);
  ImGui.ColorEdit4(label, im_color);
  color.data = [im_color.x, im_color.y, im_color.z, im_color.w];
}

export class Polyhedron extends Widget {
  private visual: THREE.Mesh = null;
  private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: true
  });
  private wireframe_visual: THREE.LineSegments = null;
  private config: PolyhedronConfig = null;

  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    super(client, category, name, sid);
  }

  draw() {
    if (!this.config) {
      return;
    }
    if (ImGui.CollapsingHeader(this.label(`${this.name} configuration`))) {
      ImGui.Checkbox(this.label('Show triangles'), (_ = this.config.show_triangle) => (this.config.show_triangle = _));
      ColorFromImGui(this.label('Triangle color'), this.config.triangle_color);
      ImGui.Checkbox(
        this.label('Use triangle color'),
        (_ = this.config.use_triangle_color) => (this.config.use_triangle_color = _)
      );
      ImGui.Checkbox('Show edges', (_ = this.config.show_edges) => (this.config.show_edges = _));
      ColorFromImGui(this.label('Edge color'), this.config.edge_config.color);
      ImGui.Checkbox(
        this.label('Fix edge color'),
        (_ = this.config.fixed_edge_color) => (this.config.fixed_edge_color = _)
      );
    }
  }

  update(points: THREE.Vector3[], indices: number[], colors: number[], config: PolyhedronConfig) {
    if (!this.visual) {
      this.visual = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
      this.wireframe_visual = new THREE.LineSegments();
      this.client.gui.scene.add(this.visual, this.wireframe_visual);
      this.config = config;
    }
    if (colors.length != 4 * points.length) {
      console.error(`Expected ${4 * points.length} data in colors but got ${colors.length}`);
      return;
    }
    this.visual.geometry.setFromPoints(points);
    this.visual.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    this.visual.geometry.setIndex(indices);
    this.visual.geometry.computeVertexNormals();
    // FIXME Handle show_vertices
    if (this.config.show_triangle) {
      this.visual.visible = true;
      if (this.config.use_triangle_color) {
        updateMaterial(this.material, this.config.triangle_color);
        this.material.vertexColors = false;
      } else {
        this.material.color = new THREE.Color(0xffffff);
        this.material.transparent = true;
        this.material.vertexColors = true;
      }
    } else {
      this.visual.visible = false;
    }
    if (this.config.show_edges) {
      this.wireframe_visual.visible = true;
      this.wireframe_visual.geometry = new THREE.WireframeGeometry(this.visual.geometry);
      this.wireframe_visual.geometry.setAttribute('color', this.visual.geometry.getAttribute('color'));
      this.wireframe_visual.material = updateLineMaterial(
        <THREE.LineBasicMaterial | THREE.LineDashedMaterial>this.wireframe_visual.material,
        this.config.edge_config
      );
      (<THREE.LineBasicMaterial | THREE.LineDashedMaterial>this.wireframe_visual.material).vertexColors =
        !this.config.fixed_edge_color;
      if (!this.config.fixed_edge_color) {
        (<THREE.LineBasicMaterial | THREE.LineDashedMaterial>this.wireframe_visual.material).color = new THREE.Color(
          0xffffff
        );
      }
    } else {
      this.wireframe_visual.visible = false;
    }
  }

  cleanup() {
    if (this.visual) {
      this.client.gui.scene.remove(this.visual);
      this.client.gui.scene.remove(this.wireframe_visual);
    }
  }
}
