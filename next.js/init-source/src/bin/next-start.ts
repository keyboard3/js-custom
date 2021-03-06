#!/usr/bin/env node

import parseArgs from 'minimist'
import Server from '../server'
import { exit } from "process";

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    h: 'help',
    p: 'port'
  },
  boolean: ['h'],
  default: {
    p: 3000
  }
})

const dir = argv._[0] || '.'

const srv = new Server(dir)
srv.start(argv.port)
  .then(() => {
    console.log('> Ready on http://localhost:%d', argv.port);
  })
  .catch((err) => {
    console.error(err)
    exit(1)
  })
