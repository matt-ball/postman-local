const axios = require('axios')
const config = require('./lib/config')
const file = require('./lib/file')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = async function clone () {
  const { POSTMAN_CLONED_COLLECTION_ID, POSTMAN_CLONED_ENVIRONMENTS } = config.get()
  const collection = file.collection.read()
  const environments = file.environment.read()

  if (!collection && !environments) {
    log.error('No collection or environment found to clone!')
    process.exit(1)
  }

  if (POSTMAN_CLONED_COLLECTION_ID || POSTMAN_CLONED_ENVIRONMENTS) {
    await deleteExistingClones(POSTMAN_CLONED_COLLECTION_ID, POSTMAN_CLONED_ENVIRONMENTS)
  }

  log.info('Creating clone(s)..')

  if (collection) {
    const clonedCollection = await cloneResource(collection, 'collections')

    config.set({
      POSTMAN_CLONED_COLLECTION_ID: clonedCollection.uid
    }, {
      merge: true
    })
  }

  if (environments) {
    const clonedEnvironmentIds = {}

    for await (const environment of environments) {
      const clonedEnvironment = await cloneResource(environment, 'environments')
      clonedEnvironmentIds[clonedEnvironment.name] = clonedEnvironment.uid
    }

    config.set({
      POSTMAN_CLONED_ENVIRONMENTS: clonedEnvironmentIds
    }, {
      merge: true
    })
  }
}

async function deleteExistingClones (collectionId, environments) {
  const { POSTMAN_API_KEY } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`

  log.info('Deleting existing clone(s)..')

  try {
    await axios.delete(`${POSTMAN_API_BASE}/collections/${collectionId}/${apiKeyParam}`)
  } catch (e) {}

  try {
    Object.values(environments).forEach(async (environment) => {
      await axios.delete(`${POSTMAN_API_BASE}/environments/${environment}/${apiKeyParam}`)
    })
  } catch (e) {}
}

async function cloneResource (resource, type) {
  const { POSTMAN_API_KEY } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const singular = type.slice(0, -1)

  try {
    const resourceCreated = await axios.post(`${POSTMAN_API_BASE}/${type}/${apiKeyParam}`, { [singular]: resource })

    if (resourceCreated) {
      const resource = resourceCreated.data[singular]
      log.success(`${singular[0].toUpperCase()}${singular.slice(1)} ${resource.name} cloned to My Workspace!`)

      return resource
    }
  } catch (e) {
    log.error(`Failed to clone ${singular} to My Workspace.`)
  }
}
