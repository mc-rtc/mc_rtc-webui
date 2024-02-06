import { ArrowConfig } from './ArrowConfig';

export class ForceConfig extends ArrowConfig {
  force_scale: number = 0.0015;

  fromMessage(data: any[]): void {
    super.fromMessage(data[0]);
    this.force_scale = data[1];
  }
}
