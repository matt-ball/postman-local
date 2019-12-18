const path = require('path')
const axios = require('axios')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = async function clone () {
  const config = require('./lib/config')
  const { POSTMAN_API_KEY } = config
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const collection = require(path.resolve(process.cwd(), config.POSTMAN_COLLECTION_FILENAME))
  const createCollection = await axios.post(`${POSTMAN_API_BASE}/${apiKeyParam}`, { collection })

  if (createCollection) {
    log.success('Collection cloned to My Workspace!')
  }
}
