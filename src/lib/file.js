const fs = require('fs')
const path = require('path')
const config = require('./config')
const log = require('./log')

module.exports = {
  collection: {
    read: () => {
      try {
        const { POSTMAN_COLLECTION_FILENAME } = config.get()
        const collection = require(path.resolve(process.cwd(), POSTMAN_COLLECTION_FILENAME))

        return collection
      } catch (e) {}
    },
    write: (collection) => {
      try {
        const { POSTMAN_COLLECTION_FILENAME } = config.get()
        fs.writeFileSync(POSTMAN_COLLECTION_FILENAME, JSON.stringify(collection, null, 2))
        log.success(`Postman collection written to ${POSTMAN_COLLECTION_FILENAME}!`)
      } catch (e) {
        log.error('Failed to write Postman collection.')
      }
    }
  },
  environment: {
    read: () => {
      try {
        const { POSTMAN_ENVIRONMENT_FILENAME } = config.get()
        const environment = require(path.resolve(process.cwd(), POSTMAN_ENVIRONMENT_FILENAME))

        return environment
      } catch (e) {}
    },
    write: (environment) => {
      try {
        const { POSTMAN_ENVIRONMENT_FILENAME } = config.get()
        fs.writeFileSync(POSTMAN_ENVIRONMENT_FILENAME, JSON.stringify(environment, null, 2))
        log.success(`Postman environment written to ${POSTMAN_ENVIRONMENT_FILENAME}!`)
      } catch (e) {
        log.error('Failed to write Postman environment.')
      }
    }
  }
}
