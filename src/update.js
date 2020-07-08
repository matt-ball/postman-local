const axios = require('axios')
const config = require('./lib/config')
const file = require('./lib/file')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = function update () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID, POSTMAN_ENVIRONMENT_ID } = config.get()
  const collection = file.collection.read()
  const environment = file.environment.read()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const collectionAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`
  const environmentAddress = `${POSTMAN_API_BASE}/environments/${POSTMAN_ENVIRONMENT_ID}/${apiKeyParam}`

  axios.put(collectionAddress, { collection })

  if (environment) {
    axios.put(environmentAddress, { environment })
  }

  log.success('Postman updated!')
}
