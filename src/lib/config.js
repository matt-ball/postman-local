const path = require('path')
const log = require('./log')

try {
  module.exports = require(path.resolve(process.cwd(), '.postman.json'))
} catch (e) {
  log.error('No/invalid .postman.json file found! Run postman setup.')
  process.exit(1)
}
