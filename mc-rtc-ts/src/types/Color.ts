export class Color {
  data: [number, number, number, number] = [1, 0, 0, 1];
  constructor(data?: [number, number, number, number]) {
    if (data) {
      this.data = data;
    }
  }

  get r() {
    return this.data[0];
  }
  get g() {
    return this.data[1];
  }
  get b() {
    return this.data[2];
  }
  get a() {
    return this.data[3];
  }

  set r(r: number) {
    this.data[0] = r;
  }
  set g(g: number) {
    this.data[1] = g;
  }
  set b(b: number) {
    this.data[2] = b;
  }
  set a(a: number) {
    this.data[3] = a;
  }
}
