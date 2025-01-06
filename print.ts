import { Term, visit } from "./graph.js"
import { Process, homproc } from "./run.js"

// accept an AST and give a string.
// ignore the definition of save nodes.
// just print the name of share nodes.
export const print: (e: Term) => string = e => homproc((call, ret) => {
const
p: (c: boolean, t: string) => string = (c, t) => c ?`(${t})` : t,
l: (e: Term) => Process = e => () =>
  e.kind === "abs" ? call(l(e.body), dx => ret(` ${e.param}${dx}`)) :
  call(s(false, true)(e), dx => ret(`.${dx}`)),
s: (pr: boolean, rm: boolean) => (e: Term) => Process = (pr, rm) => visit({
  app: ({ lhs, rhs }) =>
    call(s(false, false)(lhs), dx =>
    call(s(true, rm || pr)(rhs), dy =>
    ret(p(pr, `${dx} ${dy}`)))),
  abs: ({ param, body }) =>
    call(l(body), dy =>
    ret(p(!rm, `\\${param}${dy}`))),
  var: ({ name }) => ret(name) })
return s(false, true)(e) })
