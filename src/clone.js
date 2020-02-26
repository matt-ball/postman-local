const path = require('path')
const axios = require('axios')
const config = require('./lib/config')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = async function clone () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_FILENAME } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const collection = require(path.resolve(process.cwd(), POSTMAN_COLLECTION_FILENAME))

  try {
    const createCollection = await axios.post(`${POSTMAN_API_BASE}/collections/${apiKeyParam}`, { collection })

    if (createCollection) {
      log.success('Collection cloned to My Workspace!')
    }
  } catch (e) {
    log.error('Failed to clone collection to My Workspace.')
  }
}
