import { Term, Normal, visit, Env } from "./graph.js"
import { Process, homproc, jmp } from "./run.js"

// evaluate an AST and return another AST
// for save nodes, bubble and retry.
// for application nodes, evaluate the lhs and generate a save node.
// for share nodes, evalute the pointed node and assign the pointer.
// for variable nodes, look it up in the environment,
// evaluate it and update the pointer.
// for abstraction nodes, save the environment.
export const evaluate: (e: Term, env: Env) => Normal = (e, env) => homproc((call, ret) => {
const s: (e: Term, env: Env) => Process = (e, env) => visit({
  app: ({ lhs, rhs }) =>
    call(s(lhs, env), dx =>
    jmp(s(dx.body, { ...env, ...dx.env, [dx.param]: { env, ptr: rhs } }))),
  var: ({ name }) => {
    const u = env[name]
    if (!u) {
      throw new Error(`Undefined reference to \`${name}\`.`) }
    return call(s(u.ptr, u.env), dx => (u.ptr = dx, ret(dx))) },
  abs: ({ param, body, env: saved }) =>
    ret({ kind: "abs", param, body, env: { ...env, ...saved } }) })(e)
return s(e, env) })