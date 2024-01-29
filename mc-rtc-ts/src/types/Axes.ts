export enum Axes {
  NONE = 0,
  TX = 1,
  TY = 1 << 2,
  TZ = 1 << 3,
  RX = 1 << 4,
  RY = 1 << 5,
  RZ = 1 << 6,
  TRANSLATION = TX | TY | TZ,
  ROTATION = RX | RY | RZ,
  XYTHETA = TX | TY | RZ,
  XYZTHETA = XYTHETA | TZ,
  ALL = TRANSLATION | ROTATION
}
