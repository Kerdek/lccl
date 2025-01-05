import { Branch, Process } from './run.js'

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

// pattern for branching by table lookup
export const visit: Visit = o => e => (f => () => f(e))(o[e.kind as keyof typeof o])