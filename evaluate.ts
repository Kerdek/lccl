import { Term, Normal, visit, Env } from "./graph.js"
import { Process, homproc, jmp } from "./run.js"

// evaluate an AST and return another AST
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