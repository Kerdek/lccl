import { read, evaluate, print } from './lc.js';
import { scanner } from './scanner.js';
import { readFile } from 'fs/promises'
import { tokenizer } from './tokenizer.js';

if (process.argv[2] === undefined) {
  throw new Error('No input file specified.') }

try {
  console.log(print(evaluate(read(tokenizer(scanner(await readFile(process.argv[2], { encoding: 'utf8' }), process.argv[2])))))) }
catch (e) {
  console.log((e as Error).message) }