// pattern for left-to-right IIFEs
const di: <X, Y, F extends (x: X) => Y>(x: X, f: F) => Y = (x, f) => f(x)