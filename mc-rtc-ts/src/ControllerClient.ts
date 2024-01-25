import { ArrayInput } from './ArrayInput';
import { ArrayLabel } from './ArrayLabel';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { ComboInput } from './ComboInput';
import { DataComboInput } from './DataComboInput';
import { IntegerInput } from './IntegerInput';
import { Label } from './Label';
import { NumberInput } from './NumberInput';
import { NumberSlider } from './NumberSlider';
import { StringInput } from './StringInput';

import { Category } from './Category';
import { Elements } from './Elements';
import { Request } from './Request';
import { PROTOCOL_VERSION } from './ProtocolVersion';

import { ImGui } from '@zhobo63/imgui-ts';

export class ControllerClient {
  root: Category = new Category(this, [], '');
  data: object;
  socket: WebSocket;
  constructor(socket: WebSocket) {
    this.socket = socket;
  }
  sendRequest(req: Request) {
    this.socket.send(JSON.stringify({ request: 'requestGUI', data: req }));
  }
  draw() {
    ImGui.Begin('mc_rtc');
    this.root.draw();
    ImGui.End();
  }
  draw3d() {
    this.root.draw3d();
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
    for (const c of category.filter((c) => c.length)) {
      const cat = ret.subs.find((cat) => cat.name == c);
      if (cat) {
        ret = cat;
      } else {
        if (ret.name.length) {
          ret.subs.push(new Category(this, ret.category.concat(ret.name), c));
        } else {
          ret.subs.push(new Category(this, [], c));
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
      const sid = widget_data[2] === null ? -1 : widget_data[2];
      switch (widget_tid) {
        case Elements.Label:
          cat.widget(Label, widget_name, sid, widget_data[3]);
          break;
        case Elements.ArrayLabel:
          cat.widget(ArrayLabel, widget_name, sid, widget_data[4] || [], widget_data[3]);
          break;
        case Elements.Button:
          cat.widget(Button, widget_name, sid);
          break;
        case Elements.Checkbox:
          cat.widget(Checkbox, widget_name, sid, widget_data[3]);
          break;
        case Elements.StringInput:
          cat.widget(StringInput, widget_name, sid, widget_data[3]);
          break;
        case Elements.IntegerInput:
          cat.widget(IntegerInput, widget_name, sid, widget_data[3]);
          break;
        case Elements.NumberInput:
          cat.widget(NumberInput, widget_name, sid, widget_data[3]);
          break;
        case Elements.NumberSlider:
          cat.widget(NumberSlider, widget_name, sid, ...widget_data.slice(3, 6));
          break;
        case Elements.ArrayInput:
          cat.widget(ArrayInput, widget_name, sid, widget_data[4] || [], widget_data[3]);
          break;
        case Elements.ComboInput:
          cat.widget(ComboInput, widget_name, sid, widget_data[4], widget_data[3]);
          break;
        case Elements.DataComboInput:
          cat.widget(DataComboInput, widget_name, sid, widget_data[4], widget_data[3]);
          break;
        default:
          break;
        // console.error(`Cannot handle widget type: ${widget_tid}`);
      }
    }
    let next_category: string[] = parent;
    if (category.length) {
      next_category = next_category.concat(category);
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
