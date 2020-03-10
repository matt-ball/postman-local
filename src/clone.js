const axios = require('axios')
const config = require('./lib/config')
const file = require('./lib/file')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = async function clone () {
  const { POSTMAN_CLONED_COLLECTION_ID, POSTMAN_CLONED_ENVIRONMENT_ID } = config.get()
  const collection = file.collection.read()
  const environment = file.environment.read()

  await checkForExistingResource(collection, POSTMAN_CLONED_COLLECTION_ID)
  await checkForExistingResource(environment, POSTMAN_CLONED_ENVIRONMENT_ID)
}

async function checkForExistingResource (resource, cloneId) {
  if (!resource) return

  const { POSTMAN_API_KEY } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const type = resource.info ? 'collections' : 'environments'

  if (cloneId) {
    try {
      const remoteResource = await axios.get(`${POSTMAN_API_BASE}/${type}/${cloneId}/${apiKeyParam}`)

      if (remoteResource) {
        await cloneResource(resource, type, 'update', cloneId)
      }
    } catch (e) {
      await cloneResource(resource, type, 'post')
    }
  } else {
    cloneResource(resource, type, 'post')
  }
}

async function cloneResource (resource, type, method, cloneId) {
  const { POSTMAN_API_KEY } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const singular = type.slice(0, -1)
  const message = method === 'update' ? 'updated in' : 'cloned to'

  try {
    if (method === 'update') {
      await axios.delete(`${POSTMAN_API_BASE}/${type}/${cloneId}/${apiKeyParam}`)
    }

    const resourceCreated = await axios.post(`${POSTMAN_API_BASE}/${type}/${apiKeyParam}`, { [singular]: resource })

    if (resourceCreated) {
      const configKey = type === 'collections' ? 'POSTMAN_CLONED_COLLECTION_ID' : 'POSTMAN_CLONED_ENVIRONMENT_ID'

      config.set({
        [configKey]: resourceCreated.data[singular].uid
      }, {
        merge: true
      })

      log.success(`${singular[0].toUpperCase()}${singular.slice(1)} ${message} My Workspace!`)
    }
  } catch (e) {
    log.error(`Failed to clone ${singular} to My Workspace.`)
  }
}
