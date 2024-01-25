import { ControllerClient } from './ControllerClient';
import { ImGui } from '@zhobo63/imgui-ts';
import { Widget } from './Widget';

type Ctor<T> = new (...args: any[]) => T;

export class Category extends Widget {
  widgets: Widget[] = [];
  subs: Category[] = [];

  constructor(client: ControllerClient, category: string[], name: string) {
    super(client, category, name, -1);
  }

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

  private getWidget<Type extends Widget>(T: Ctor<Type>, name: string, sid: number): Type {
    const wIdx = this.widgets.findIndex((w) => w.name === name);
    if (wIdx >= 0 && this.widgets[wIdx] instanceof T) {
      const widget: Type = this.widgets[wIdx] as Type;
      widget.visited = true;
      return widget;
    } else {
      if (wIdx >= 0) {
        this.widgets.splice(wIdx, 1);
      }
      const widget_category = (() => {
        if (this.name.length) {
          return this.category.concat(this.name);
        }
        return this.category;
      })();
      const out = new T(this.client, widget_category, name, sid);
      this.widgets.push(out);
      return out;
    }
  }

  widget<Type extends Widget>(T: Ctor<Type>, name: string, sid: number, ...args: any): Type {
    const widget: Type = this.getWidget(T, name, sid);
    if (widget.update) {
      widget.update(...args);
    }
    return widget;
  }

  draw() {
    for (let i = 0; i < this.widgets.length; ) {
      const w: Widget = this.widgets[i];
      if (w.sid == -1) {
        w.draw();
        ++i;
      } else {
        let j = i + 1;
        while (j < this.widgets.length && this.widgets[j].sid == w.sid) {
          ++j;
        }
        ImGui.BeginTable(`${w.category}_table_${i}`, j - i, ImGui.ImGuiTableFlags.SizingStretchProp);
        for (; i < j; ++i) {
          ImGui.TableNextColumn();
          this.widgets[i].draw();
        }
        ImGui.EndTable();
      }
      if (i != this.widgets.length) {
        ImGui.Separator();
      }
    }
    if (this.subs.length) {
      ImGui.Indent();
      if (ImGui.BeginTabBar(this.name, ImGui.ImGuiTabBarFlags.Reorderable)) {
        for (const c of this.subs) {
          if (ImGui.BeginTabItem(c.name)) {
            c.draw();
            ImGui.EndTabItem();
          }
        }
        ImGui.EndTabBar();
      }
      ImGui.Unindent();
    }
  }

  draw3d() {
    for (const w of this.widgets) {
      w.draw3d();
    }
    for (const c of this.subs) {
      c.draw3d();
    }
  }
}
