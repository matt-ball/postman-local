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
        const filename = `${collection.info.name}.postman_collection.json`

        config.set({ POSTMAN_COLLECTION_FILENAME: filename }, { merge: true })
        fs.writeFileSync(filename, JSON.stringify(collection, null, 2))
        log.success(`Postman collection written to ${filename}!`)
      } catch (e) {
        log.error('Failed to write Postman collection.')
      }
    }
  },
  environment: {
    read: () => {
      try {
        const { POSTMAN_ENVIRONMENTS } = config.get()

        return Object.keys(POSTMAN_ENVIRONMENTS).map((name) => {
          const filename = `${name}.postman_environment.json`
          return require(path.resolve(process.cwd(), filename))
        })
      } catch (e) {}
    },
    write: (environment) => {
      try {
        const filename = `${environment.name}.postman_environment.json`

        fs.writeFileSync(filename, JSON.stringify(environment, null, 2))
        log.success(`Postman environment written to ${filename}!`)
      } catch (e) {
        log.error('Failed to write Postman environment.')
      }
    }
  }
}
