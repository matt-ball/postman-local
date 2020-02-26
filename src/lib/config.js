const fs = require('fs')
const path = require('path')
const log = require('./log')
const { CONFIG_FILENAME } = require('./constants')

module.exports = {
  get: () => {
    try {
      return require(path.resolve(process.cwd(), CONFIG_FILENAME))
    } catch (e) {
      log.error(`No/invalid ${CONFIG_FILENAME} file found! Run postman setup.`)
      process.exit(1)
    }
  },
  set: (config, options) => {
    try {
      fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(config, null, 2))

      if (options.log) {
        log.success('Postman CLI config saved!')
      }
    } catch (e) {
      log.error(`Failed to write ${CONFIG_FILENAME} config file!`)
    }
  }
}
