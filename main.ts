import { scanner } from './scanner.js'
import { readFile } from 'fs/promises'
import { print } from './print.js'
import { tokenizer } from './tokenizer.js'
import { evaluate } from './evaluate.js'
import { read } from './read.js'

if (process.argv[2] === undefined) {
  throw new Error('No input file specified.') }

try {
  const s = await readFile(process.argv[2], { encoding: 'utf8' })
  const e = read(tokenizer(scanner(s, process.argv[2])))
  console.log(print(evaluate(e)))
}
catch (e) {
  console.log((e as Error).message) }