const axios = require('axios')
const config = require('./lib/config')
const file = require('./lib/file')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = function update () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID } = config.get()
  const collection = file.collection.read()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const apiAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`

  axios.put(apiAddress, { collection })
  log.success('Postman updated!')
}
