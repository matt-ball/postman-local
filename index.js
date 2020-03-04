#!/usr/bin/env node

const program = require('commander')
const bootstrap = require('./src/bootstrap')
const clone = require('./src/clone')
const env = require('./src/env')
const setup = require('./src/setup')
const sync = require('./src/sync')
const update = require('./src/update')

program
  .command('setup')
  .description('Configure Postman CLI for first use')
  .action(setup)

program
  .command('bootstrap')
  .description('Generate local files from Postman Collection')
  .action(bootstrap)

program
  .command('sync')
  .description('Sync local files to Postman Collection')
  .action(sync)

program
  .command('update')
  .description('Update collection in the Postman app')
  .action(update)

program
  .command('clone')
  .description('Clone collection into My Workspace')
  .action(clone)

program
  .command('env')
  .description('Fetch an environment')
  .action(env)

program.parse(process.argv)
