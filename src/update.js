const path = require('path')
const axios = require('axios')
const config = require('./lib/config')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = function update () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID, POSTMAN_COLLECTION_FILENAME } = config.get()
  const collection = require(path.resolve(process.cwd(), POSTMAN_COLLECTION_FILENAME))
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const apiAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`

  axios.put(apiAddress, { collection })
  log.success('Postman updated!')
}
