import { TransformBase } from './details/TransformBase';

import { ControllerClient } from '../ControllerClient';

import { Axes } from '../types/Axes';

export class Transform extends TransformBase {
  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    super(client, category, name, sid, Axes.ALL);
  }
}
