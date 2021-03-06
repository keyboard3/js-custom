#!/usr/bin/env node

import { resolve } from 'path'
import parseArgs from 'minimist'
import { spawn } from 'cross-spawn';

const defaultCommand = 'dev'
const commands = new Set([
  defaultCommand,
  'build',
  'start'
])

let cmd = process.argv[2]
let args

if (commands.has(cmd)) {
  args = process.argv.slice(3)
} else {
  cmd = defaultCommand
  args = process.argv.slice(2)
}

const bin = resolve(__dirname, 'next-' + cmd)

const proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] })
proc.on('close', (code) => process.exit(code))
proc.on('error', (err) => {
  console.log(err)
  process.exit(1)
})
