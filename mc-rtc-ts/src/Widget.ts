import { ControllerClient } from './ControllerClient';
import { Request } from './Request';

export class Widget {
  constructor(client: ControllerClient, category: string[], name: string, sid: number) {
    this.client = client;
    this.category = category;
    this.name = name;
    this.sid = sid;
  }
  client: ControllerClient = null;
  category: string[] = [];
  name: string = '';
  sid: number = -1;
  visited: boolean = true;
  draw(): void {}
  draw3d(): void {}
  update?(...args: any): void;
  label(label: string, extra: string = ''): string {
    return `${label}##${this.category}${this.name}${extra}`;
  }
  sendRequest(payload?: any) {
    const request: Request = { category: this.category, name: this.name };
    if (payload !== null) {
      request.payload = payload;
    }
    this.client.sendRequest(request);
  }
}
