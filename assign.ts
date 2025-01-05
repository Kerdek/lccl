// Delete all properties on `e` and and copy all properties from `x`.
// Must be self-assignment safe.
type Assign = <K extends { [i: string]: any }>(e: { [i: string]: any }, x: K) => K
export const assign: Assign = (e, x) => {
  if (e === x) {
    return e }
  for (const k in e) {
    delete e[k] }
  for (const k in x) {
    e[k] = x[k] }
  return e as any }
