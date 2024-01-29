import { ArrayInput } from './widgets/ArrayInput';
import { ArrayLabel } from './widgets/ArrayLabel';
import { Button } from './widgets/Button';
import { Checkbox } from './widgets/Checkbox';
import { ComboInput } from './widgets/ComboInput';
import { DataComboInput } from './widgets/DataComboInput';
import { IntegerInput } from './widgets/IntegerInput';
import { Label } from './widgets/Label';
import { NumberInput } from './widgets/NumberInput';
import { NumberSlider } from './widgets/NumberSlider';
import { Point3D } from './widgets/Point3D';
import { StringInput } from './widgets/StringInput';

import { Category } from './widgets/Category';
import { Elements } from './types/Elements';
import { Request } from './types/Request';
import { PROTOCOL_VERSION } from './types/ProtocolVersion';

import { PointConfig } from './types/PointConfig';

import { GUI } from './GUI';

import { ImGui } from '@zhobo63/imgui-ts';

export class ControllerClient {
  root: Category = new Category(this, [], '');
  data: object;
  socket: WebSocket;
  gui: GUI;
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
    if (!this.gui) {
      return;
    }
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
        case Elements.Point3D: {
          const pos: number[] = widget_data[3];
          const ro: boolean = widget_data[4];
          const config: PointConfig =
            widget_data.length > 5 ? PointConfig.fromMessage(widget_data[5]) : new PointConfig();
          const ctor = ro ? ArrayLabel : ArrayInput;
          cat.widget(ctor, widget_name, sid, ['x', 'y', 'z'], pos);
          cat.widget(Point3D, widget_name + '_point3d', sid, widget_name, ro, pos, config);
          break;
        }
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
