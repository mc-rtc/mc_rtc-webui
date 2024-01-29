import { ControllerClient } from '../ControllerClient';
import { GUI } from '../GUI';
import { Request } from '../types/Request';

export class Widget {
  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    this.client = client;
    this.gui = client.gui;
    this.category = category;
    this.name = name;
    this.sid = sid;
  }
  client: ControllerClient = null;
  gui: GUI = null;
  category: string[] = [];
  name: string = '';
  sid: number = -1;
  visited: boolean = true;
  draw(): void {}
  draw3d(): void {}
  update?(...args: any): void;
  cleanup(): void {}
  label(label: string, extra: string = ''): string {
    return `${label}##${this.category}${this.name}${extra}`;
  }
  sendRequest(payload?: any, requestName?: string) {
    const request: Request = { category: this.category, name: requestName || this.name };
    if (payload !== null) {
      request.payload = payload;
    }
    this.client.sendRequest(request);
  }
}
