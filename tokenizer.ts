import { Pos, Scanner } from "./scanner"

export type NonEOFTokenKind =
  "lparen" | "rparen" | "dot" | "rsolidus" | "identifier"
export type Token = [NonEOFTokenKind, string] | ["eof"]

export type TokenKind = Token[0]
type TokenSorts = { [K in TokenKind]: [K, string] }

export type Tokenizer = {
  pos(): Pos
  take<K extends TokenKind>(k: K): TokenSorts[K] | undefined }

export function tokenizer(s: Scanner): Tokenizer {
  let t!: Token

  function fatal(msg: string): never {
    throw new Error(`(${s.pos()[0]}:${s.pos()[1]}:${s.pos()[2]}): tokenizer: ${msg}`) }

  function k(t: RegExp) {
    const matches = s.get().match(t);
    if (matches === null) {
      return null; }
    return matches[0]; }

  function pos(): Pos {
    return s.pos() }

  function take<K extends TokenKind>(k: K): TokenSorts[K] | undefined {
    if (t[0] === k) {
      const r = t as TokenSorts[K]
      skip()
      return r }
    return undefined }

  function ws(): void {
    const ws = k(/^(\s|\/\/([^\n\\]|\\.)*?(\n|$)|\/\*([^\*\\]|\\.|\*[^\/])*?(\*\/|$))*/)
    if (ws) {
      s.skip(ws.length) }  }

  function skip(): void {
    if (t[0] === "eof") {
      return }
    s.skip(t[1].length)
    ws()
    classify() }

  function classify(): void {
    if (s.get().length === 0) { t = ["eof"]; return }
    if (k(/^\(/)) { t = ["lparen", "("]; return }
    if (k(/^\)/)) { t = ["rparen", ")"]; return }
    if (k(/^\./)) { t = ["dot", "."]; return }
    if (k(/^\\/)) { t = ["rsolidus", "\\"]; return }
    const r = k(/^[A-Za-z0-9_]+/)
    if (r) { t = ["identifier", r]; return }
    fatal(`Unrecognized character sequence.`) }

  ws()
  classify()
  return { pos, take } }
