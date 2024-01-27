export enum Axes {
  TX = 1,
  TY = 1 << 2,
  TZ = 1 << 3,
  RX = 1 << 4,
  RY = 1 << 5,
  RZ = 1 << 6,
  TXYZ = TX | TY | TZ,
  RXYZ = RX | RY | RZ,
  XYTHETA = TX | TY | RZ,
  XYZTHETA = XYTHETA | TZ,
  ALL = TXYZ | RXYZ
}
