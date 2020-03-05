const fs = require('fs')
const path = require('path')
const log = require('./log')
const { CONFIG_FILENAME } = require('./constants')

module.exports = {
  get: function () {
    try {
      return require(path.resolve(process.cwd(), CONFIG_FILENAME))
    } catch (e) {
      log.error(`No/invalid ${CONFIG_FILENAME} file found! Run postman setup.`)
      process.exit(1)
    }
  },
  set: function (config, options) {
    const settings = Object.assign(this.get(), config)

    try {
      fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(settings, null, 2))

      if (options && options.log) {
        log.success('Postman CLI config saved!')
      }
    } catch (e) {
      log.error(`Failed to write ${CONFIG_FILENAME} config file!`)
    }
  }
}
