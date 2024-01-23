export function norm(data: number[]) : number {
  let res : number = 0;
  for(const n of data) {
    res += n * n;
  }
  return Math.sqrt(res);
}
