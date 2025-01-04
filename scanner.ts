export type Pos = [string, number, number]

export type Scanner = {
  pos: () => Pos
  skip(many: number): void
  get(): string }

export function scanner(src: string, file: string) {
  const w: Pos = [file, 1, 1]

  function pos(): Pos {
    return [...w] }

  function fatal(msg: string): never {
    throw new Error(`(${w}): scanner: ${msg}`) }

  function skip(many: number): void {
    if (src.length < many) {
      fatal("unexpected end of file") }
    for (let i = 0; i < many; i++) {
      if (src[0] === '\n') {
        w[1] += 1
        w[2] = 1 }
      else {
        w[2] += 1 }
      src = src.substring(1) } }

  function get(): string {
    return src }

  return { skip, get, pos } }
