/*

run.ts
Theodoric Stier
All rights reserved 2024

This module assists in writing
non-recursive algorithms on recursive
data structures.

`run` accepts a `Process`, runs it,
then returns.

A `Process` takes no arguments and returns
a `Stack` whose contents are pushed onto
the existing stack.

`ret` is an empty `Stack`, which indicates
successful completion of a subroutine.

*/

type Stack = Process[]
export type Branch = [] | [Process] | [Process, Process]
export type Process = () => Branch
export type Run = (x: Process) => void

type HomProc = <T>(e: (c: (u: Process, v: (x: T) => Branch) => Branch, r: (x: T) => Branch) => Process) => T

export const ret: Branch = []
export const jmp: (destination: Process) => Branch = x => [x] as any
export const call: (destination: Process, then: Process) => Branch = (x, y) => [x, y] as any

export const run: Run = s => {
const y: Stack = [s]
let ops: number = 0
for (;;) {
  if (ops++ > 1e7) {
    throw new Error("Too many steps.") }
  const f = y.shift()
  if (!f) {
    return }
  y.unshift(...f()) } }

export const homproc: HomProc = e => {
let d!: any
run(e((x, v) => call(x, () => v(d)), v => (d = v, ret)))
return d }
