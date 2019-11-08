#!/usr/bin/env node

const program = require('commander')
const sync = require('./src/sync')

program
  .command('bootstrap')
  .description('Generate local files from Postman Collection')
  .action(sync)

program
  .command('sync')
  .description('Sync local files to Postman Collection')
  .action(sync)

program.parse(process.argv)
