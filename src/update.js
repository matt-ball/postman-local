const axios = require('axios')
const config = require('./lib/config')
const file = require('./lib/file')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = async function update () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID } = config.get()
  const collection = file.collection.read()
  const environments = file.environment.read()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const collectionAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`

  await axios.put(collectionAddress, { collection })

  if (environments && environments.length) {
    environments.forEach(async (environment) => {
      const environmentAddress = `${POSTMAN_API_BASE}/environments/${environment.id}/${apiKeyParam}`
      await axios.put(environmentAddress, { environment })
    })
  }

  log.success('Postman updated!')
}
