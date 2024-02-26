import { Color } from './Color';
import { LineConfig } from './LineConfig';
import { PointConfig } from './PointConfig';

export class PolyhedronConfig {
  triangle_color: Color = new Color();
  show_triangle: boolean = true;
  use_triangle_color: boolean = false;
  edge_config: LineConfig = new LineConfig();
  show_edges: boolean = true;
  fixed_edge_color: boolean = true;
  vertices_config: PointConfig = new PointConfig();
  show_vertices: boolean = true;
  fixed_vertices_color: boolean = true;

  static fromMessage(data: any[]) {
    const out = new PolyhedronConfig();
    out.triangle_color = new Color(data[0]);
    out.show_triangle = data[1];
    out.use_triangle_color = data[2];
    out.edge_config = LineConfig.fromMessage(data[3]);
    out.show_edges = data[4];
    out.fixed_edge_color = data[5];
    out.vertices_config = PointConfig.fromMessage(data[6]);
    out.show_vertices = data[7];
    out.fixed_vertices_color = data[8];
    return out;
  }
}
