import { assign } from "./assign.js"
import { Graph, Normal, Sav, Term, visit } from "./graph.js"
import { Process, homproc, jmp } from "./run.js"

// accept a save node and return a non-save node by
// bubbling the definition over the body
const bubble: (e: Sav) => Term = e => homproc((call, ret) => {
const s: (e: Sav) => Process = e => () =>
  call(visit({
    sav: y => call(s(y), () => jmp(s(e))),
    app: ({ lhs, rhs }) =>
      ret({ kind: "app",
        lhs: { kind: "sav", definition: e.definition, body: lhs },
        rhs: { kind: "sav", definition: e.definition, body: rhs } }),
    abs: y =>
      y.param === e.definition.name ? ret(y) :
      ret({ kind: "abs", param: y.param,
        body: { kind: "sav", definition: e.definition, body: y.body } }),
    var: y => ret(y.name === e.definition.name ? e.definition : y),
    shr: ret })(e.body), de =>
  ret(assign(e, de)))
return s(e) })

// evaluate an AST and return another AST
// mutates share nodes in the input
// for save nodes, bubble and retry.
// for application nodes, evaluate the lhs and generate a save node.
// for share nodes, evalute the pointed node and assign the pointer.
// for variable nodes, throw an error.
// do nothing for abstraction nodes.
export const evaluate: (e: Graph) => Normal = e => homproc((call, ret) => {
const s: (e: Graph) => Process = visit({
  sav: e => jmp(s(bubble(e))),
  app: ({ lhs, rhs }) =>
    call(s(lhs), dx =>
    jmp(s({ kind: "sav", definition: { kind: "shr", name: dx.param, ptr: rhs }, body: dx.body }))),
  shr: e =>
    call(s(e.ptr), dx => (
    e.ptr = dx,
    ret(dx))),
  var: ({ name }) => { throw new Error(`Undefined reference to \`${name}\`.`)},
  abs: ret })
return s(e) })