import { Graph, visit } from "./graph"
import { Process, homproc } from "./run"

// accept an AST and give a string.
// ignore the definition of save nodes.
// just print the name of share nodes.
export const print: (e: Graph) => string = e => homproc((call, ret) => {
const
p: (q: boolean, t: string) => string = (q, t) => q ?`(${t})` : t,
l: (e: Graph) => Process = e => () =>
  e.kind === "abs" ? call(l(e.body), dx => ret(`${e.param} ${dx}`)) :
  call(s(false, true)(e), dx => ret(`.${dx}`)),
s: (pr: boolean, rm: boolean) => (e: Graph) => Process = (pr, rm) => visit({
  app: ({ lhs, rhs }) =>
    call(s(false, false)(lhs), dx =>
    call(s(true, rm || pr)(rhs), dy =>
    ret(p(pr, `${dx} ${dy}`)))),
  abs: ({ param, body }) =>
    call(l(body), dy =>
    ret(p(!rm, `\\${param}${dy}`))),
  var: ({ name }) => ret(name),
  sav: ({ body }) => jmp(s(pr, rm)(body)),
  shr: ({ name }) => ret(name) })
return s(false, true)(e) })
