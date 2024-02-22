import { Color } from './Color';

export enum LineStyle {
  Solid = 0,
  Dotted = 1
}

export class LineConfig {
  color: Color;
  width: number;
  style: LineStyle;

  constructor(color?: Color, width?: number, style?: LineStyle) {
    this.color = color ?? new Color([1, 0, 0, 1]);
    this.width = width ?? 0.01;
    this.style = style ?? LineStyle.Solid;
  }

  static fromMessage(data: any[]) {
    return new LineConfig(new Color(data[0]), data[1], data[2]);
  }
}
