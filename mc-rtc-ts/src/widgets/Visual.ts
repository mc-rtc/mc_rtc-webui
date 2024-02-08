import { Widget } from './Widget';

import { Visual as gui_Visual } from '../gui/Visual';
import { rbd_Visual } from '../types/rbd_Visual';

import { ControllerClient } from '../ControllerClient';

export class Visual extends Widget {
  private visual: gui_Visual;

  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    super(client, category, name, sid);
    this.visual = new gui_Visual(client);
  }

  update(visual: rbd_Visual, pt: number[]) {
    this.visual.update(visual, pt);
  }

  cleanup() {
    this.visual.cleanup();
  }
}
