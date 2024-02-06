import { Color } from './Color';

export class ArrowConfig {
  head_diam: number = 0.015;
  head_len: number = 0.05;
  shaft_diam: number = 0.015;
  scale: number = 0.0015;
  start_point_scale: number = 0.0;
  end_point_scale: number = 0.0;
  color: Color = new Color();

  fromMessage(data: any[]) {
    this.head_diam = data[0];
    this.head_len = data[1];
    this.shaft_diam = data[2];
    this.scale = data[3];
    this.start_point_scale = data[4];
    this.end_point_scale = data[5];
    this.color = new Color(data[6]);
  }
}
