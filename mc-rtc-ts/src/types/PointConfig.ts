import { Color } from './Color';

export class PointConfig {
  color: Color;
  scale: number;

  constructor(color?: Color, scale?: number) {
    this.color = color ?? new Color();
    this.scale = scale ?? 0.02;
  }

  static fromMessage(data: any[]) {
    return new PointConfig(new Color(data[0]), data[1]);
  }
}
