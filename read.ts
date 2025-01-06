import { di } from "./di.js"
import { Term } from "./graph.js"
import { Branch, Process, homproc, jmp } from "./run.js"
import { Tokenizer } from "./tokenizer.js"

// accept a tokenizer and give an AST.
export const read: (src: Tokenizer) => Term = tk => homproc((call, ret) => {
const
fatal: (msg: string) => never = m => {
  const w = tk.pos()
  throw new Error(`(${w[0]}:${w[1]}:${w[2]}): parser: ${m}`) },
parameters: Process = () =>
  tk.take("dot") ? jmp(expression) :
  di(tk.take("identifier"), i =>
  !i ? fatal(`Expected \`.\`.`) :
  call(parameters, dx =>
  ret({ kind: "abs", env: {}, param: i[1], body: dx }))),
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
