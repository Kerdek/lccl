import { Branch, jmp, Process, homproc } from './run.js'
import { Tokenizer } from './tokenizer.js'

// Three node types used at parse time.

// Application node. Represents a term applied to some other term.
export type App = { kind: "app", lhs: Graph, rhs: Graph }
// Abstraction node. Represents a function.
export type Abs = { kind: "abs", param: string, body: Graph }
// Variable node. Represents a usage of a variable.
export type Var = { kind: "var", name: string }

// Two node types used at runtime.

// Save node. Stores the values of a variable for beta reduction.
// Kind of like a let.
export type Sav = { kind: "sav", definition: Shr, body: Graph }
// Share node. Used wherever a value has been substituted to avoid copying.
// Mutated for re-use when evaluated.
export type Shr = { kind: "shr", name: string, ptr: Graph }

// A normal form is an abstraction node.
export type Normal = Abs
// Terms handled by `evaluate`
export type Term = Normal | App | Var | Shr
// Terms handled by `bubble`.
export type Graph = Term | Sav

// Sets up a table called `Sorts` that looks up each node type by its kind.
export type Kind = Graph['kind']
type Rest<i, Graph> = Graph extends { kind: i } & infer R ? R : never
type Sorts = { [i in Kind]: Rest<i, Graph> }
type Visit = <K extends Kind>(o: { [i in K]: (e: Sorts[i]) => Branch }) => <I extends K>(e: Sorts[I]) => Process

// Types of the functions exported
export type Read = (src: Tokenizer) => Term
export type Print = (e: Graph) => string
export type Bubble = (e: Sav) => Term
export type Evaluate = (e: Graph) => Normal

// Delete all properties on `e` and and copy all properties from `x`.
// Must be self-assignment safe.
type Assign = <K extends { [i: string]: any }>(e: { [i: string]: any }, x: K) => K
const assign: Assign = (e, x) => {
  if (e === x) {
    return e }
  for (const k in e) {
    delete e[k] }
  for (const k in x) {
    e[k] = x[k] }
  return e as any }

// pattern for branching by table lookup
export const visit: Visit = o => e => (f => () => f(e))(o[e.kind as keyof typeof o])

// pattern for left-to-right IIFEs
const di: <X, Y, F extends (x: X) => Y>(x: X, f: F) => Y = (x, f) => f(x)

// accept a tokenizer and give an AST.
export const read: Read = tk => homproc((call, ret) => {
const
fatal: (msg: string) => never = m => {
  throw new Error(`(${tk.pos()[0]}:${tk.pos()[1]}:${tk.pos()[2]}): parser: ${m}`) },
parameters: Process = () =>
  tk.take("dot") ? jmp(expression) :
  di(tk.take("identifier"), i =>
  !i ? fatal(`Expected \`.\`.`) :
  call(parameters, dx =>
  ret({ kind: "abs", param: i[1], body: dx }))),
try_primary: () => Process | null = () =>
  tk.take("rsolidus") ? parameters :
  tk.take("lparen") ? () =>
    call(expression, x =>
    tk.take("rparen") ? ret(x) :
    fatal(`Expected \`)\`.`)) :
  di(tk.take("identifier"), r =>
  r ? () => ret({ kind: "var", name: r[1] }) :
  null),
primary: Process = () =>
  di(try_primary(), up =>
  up === null ? fatal("Expected a term.") :
  jmp(up)),
juxt_rhs: (lhs: Term) => Branch = lhs =>
  di(try_primary(), up =>
  up === null ? ret(lhs) :
  call(up, rhs =>
  juxt_rhs({ kind: "app", lhs, rhs }))),
juxt: Process = () => call(primary, juxt_rhs),
expression = juxt,
all: Process = () =>
  call(expression, e =>
  !tk.take("eof") ? fatal(`Expected end of file.`) :
  ret(e))
return all })

// accept an AST and give a string.
// ignore the definition of save nodes.
// just print the name of share nodes.
export const print: Print = e => homproc((call, ret) => {
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

// accept a save node and return a non-save node by
// bubbling the definition over the body
export const bubble: Bubble = e => homproc((call, ret) => {
const sp = visit({
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
  shr: ret })
const s: (e: Sav) => Process = e => () =>
  call(sp(e.body), de =>
  ret(assign(e, de)))
return s(e) })

// evaluate an AST and return another AST
// mutates share nodes in the input
// for save nodes, bubble and retry.
// for application nodes, evaluate the lhs and generate a save node.
// for share nodes, evalute the pointed node
export const evaluate: Evaluate = e => homproc((call, ret) => {
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