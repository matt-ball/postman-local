const path = require('path')
const log = require('./log')

module.exports = function config () {
  try {
    return require(path.resolve(process.cwd(), '.postman'))
  } catch (e) {
    log.error('No .postman.json file found!')
  }
}
