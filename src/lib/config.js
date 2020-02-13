const path = require('path')
const log = require('./log')

try {
  console.log(process.cwd())
  console.log(path.resolve(process.cwd(), '.postman.json'))
  module.exports = require(path.resolve(process.cwd(), '.postman.json'))
} catch (e) {
  log.error('No .postman.json file found! Run postman setup.')
  process.exit(1)
}
