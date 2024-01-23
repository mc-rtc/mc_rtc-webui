import { RequestHandler } from './Request';

export class Widget {
  constructor(category: string[], name: string, sid?: number) { this.category = category; this.name = name; this.sid = sid; }
  category: string[] = [];
  name: string = "";
  sid: number = -1;
  visited: boolean = true;
  draw?(request?: RequestHandler): void;
  draw3d?(request? : RequestHandler): void;
  label(label: string, extra: string = "") : string {
    return `${label}##${this.category}${this.name}${extra}`;
  }
}
