import { Color } from './Color';

export class PointConfig {
  color: Color;
  scale: number;

  constructor(color?: Color, scale?: number) {
    this.color = color ?? new Color([1, 0, 0, 0.5]);
    this.scale = 2 * scale ?? 0.04;
  }

  static fromMessage(data: any[]) {
    return new PointConfig(new Color(data[0]), data[1]);
  }
}
