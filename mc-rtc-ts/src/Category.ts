import { RequestHandler } from './Request';
import { Widget } from './Widget';

type Ctor<T> = new (...args: any[]) => T;

export class Category extends Widget {
  widgets: Widget[] = [];
  subs: Category[] = [];

  // Start an update cycle
  startUpdate() {
    for (const w of this.widgets) {
      w.visited = false;
    }
    for (const s of this.subs) {
      s.visited = false;
      s.startUpdate();
    }
  }

  // End of an update cycle
  endUpdate() {
    this.widgets = this.widgets.filter((w: Widget) => w.visited);
    this.subs = this.subs.filter((s: Category) => s.visited);
    for (const s of this.subs) {
      s.endUpdate();
    }
  }

  getWidget<Type extends Widget>(T: Ctor<Type>, data: [name: string, sid: number, ...any]): Type {
    const wIdx = this.widgets.findIndex(w => w.name === data[0]);
    if (wIdx >= 0 && this.widgets[wIdx] instanceof T) {
      const widget : Type = this.widgets[wIdx] as Type;
      widget.visited = true;
      return widget;
    }
    else {
      if (wIdx >= 0) {
        this.widgets.splice(wIdx, 1);
      }
      const widget_id = (() => {
        if(this.name.length) {
          return [...this.category, this.name];
        }
        return [...this.category];
      })();
      const out = new T(widget_id, ...data);
      this.widgets.push(out);
      return out;
    }
  }

  draw(rh : RequestHandler) {
    for (const w of this.widgets) {
      w.draw(rh);
    }
    for (const c of this.subs) {
      c.draw(rh);
    }
  }

  draw3d(rh : RequestHandler) {
    for (const w of this.widgets.filter(w => w.draw3d)) {
      w.draw3d(rh);
    }
    for (const c of this.subs) {
      c.draw3d(rh);
    }
  }
}
