import { Button } from './Button';
import { Label } from './Label';

import { Category } from './Category';
import { Elements } from './Elements';
import { Request } from './Request';
import { PROTOCOL_VERSION } from './ProtocolVersion';

import { ImGui } from '@zhobo63/imgui-ts';

export class ControllerClient {
  root: Category = new Category([], "");
  data: object;
  socket: WebSocket;
  constructor(socket: WebSocket) {
    this.socket = socket;
  }
  sendRequest(req: Request) {
    this.socket.send(JSON.stringify({ "request": "requestGUI", "data": req }));
  }
  draw() {
    ImGui.Begin("mc_rtc");
    this.root.draw((req: Request) => this.sendRequest(req));
    ImGui.End();
  }
  draw3d() {
    this.root.draw3d(this.sendRequest);
  }
  update(data: Array<any>) {
    this.root.startUpdate();
    this.doUpdate(data);
    this.root.endUpdate();
  }

  doUpdate(data: Array<any>) {
    if (data.length === 0) {
      return;
    }
    const version: number = data[0];
    if (version > PROTOCOL_VERSION) {
      console.error(`Cannot handle GUI version ${version}, this can only handle update to version ${PROTOCOL_VERSION}`);
      return;
    }
    this.data = data[1];
    this.onCategory([], '', data[2]);
    if (data.length > 3) {
      const plots: object[] = data[3];
      for (const p of plots) {
        this.onPlot(p);
      }
    }
  }

  // Gets a Category object, creates it if needed
  getCategory(category: string[]): Category {
    let ret = this.root;
    for (const c of category.filter(c => c.length)) {
      const cat = ret.subs.find(cat => cat.name == c);
      if (cat) {
        ret = cat;
      }
      else {
        if (ret.name.length) {
          ret.subs.push(new Category([...ret.category, ret.name], c));
        }
        else {
          ret.subs.push(new Category([], c));
        }
        ret = ret.subs[ret.subs.length - 1];
      }
    }
    ret.visited = true;
    return ret;
  }

  onCategory(parent: string[], category: string, data: []) {
    // No more data to process
    if (data.length < 2) {
      return;
    }
    const cat: Category = this.getCategory([...parent, category]);
    for (let i = 1; i < data.length - 1; ++i) {
      const widget_data: [string, number, number?, ...any] = data[i];
      const widget_name: string = widget_data[0];
      const widget_tid: number = widget_data[1];
      const sid = widget_data[2] || -1;
      switch (widget_tid) {
        case (Elements.Label):
          const label_str: string = widget_data[3];
          const label: Label = cat.getWidget(Label, [widget_name, sid]);
          label.update(label_str);
          break;
        case (Elements.Button):
          cat.getWidget(Button, [widget_name, sid]);
          break;
        default:
          console.error(`Cannot handle widget type: ${widget_tid}`);
      }
    }
    let next_category: string[] = parent;
    if (category.length) {
      next_category.concat(category);
    }
    const cat_data: [...any] = data[data.length - 1];
    for (let i = 0; i < cat_data.length; ++i) {
      this.onCategory(next_category, cat_data[i][0], cat_data[i]);
    }
  }

  onPlot(plot: object) {
    // XXX Implement
  }
}
