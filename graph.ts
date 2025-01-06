import { Branch, Process } from './run.js'

// Three node types used at parse time.

// Application node. Represents a term applied to some other term.
export type App = { kind: "app", lhs: Term, rhs: Term }
// Abstraction node. Represents a function with a capture.
export type Abs = { kind: "abs", env: Env, param: string, body: Term }
// Variable node. Represents a usage of a variable.
export type Var = { kind: "var", name: string }

// An environment is a map from strings to share nodes
export type Env = { [i: string]: Shr }

// Used in the environment as a pointer to avoid copying.
// Mutated for re-use when evaluated.
export type Shr = { env: Env, ptr: Term }

// A normal form is an abstraction node.
export type Normal = Abs
// Terms handled by `evaluate`
export type Term = Normal | App | Var

// Sets up a table called `Sorts` that looks up each node type by its kind.
export type Kind = Term['kind']
type Rest<i, Graph> = Graph extends { kind: i } & infer R ? R : never
type Sorts = { [i in Kind]: Rest<i, Term> }
type Visit = <K extends Kind>(o: { [i in K]: (e: Sorts[i]) => Branch }) => <I extends K>(e: Sorts[I]) => Process

// pattern for branching by table lookup
export const visit: Visit = o => e => (f => () => f(e))(o[e.kind as keyof typeof o])
