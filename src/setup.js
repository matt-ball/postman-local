const axios = require('axios')
const { prompt } = require('enquirer')
const config = require('./lib/config')
const createChoices = require('./lib/create-choices')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = setup

async function setup () {
  const apiKey = await prompt({
    type: 'password',
    name: 'value',
    message: 'Enter your Postman API key'
  })

  beginSetup(apiKey)
}

async function beginSetup (apiKey) {
  try {
    const apiKeyParam = `?apikey=${apiKey.value}`
    const workspaces = await axios.get(`${POSTMAN_API_BASE}/workspaces/${apiKeyParam}`)
    const workspaceChoices = createChoices(workspaces.data.workspaces)

    const selectedWorkspace = await prompt({
      name: 'id',
      type: 'autocomplete',
      message: 'Select the Workspace your Collection resides within',
      limit: 10,
      choices: workspaceChoices
    })

    const collections = await axios.get(`${POSTMAN_API_BASE}/workspaces/${selectedWorkspace.id}/${apiKeyParam}`)
    const collectionList = collections.data.workspace.collections

    if (collectionList) {
      continueSetup(collectionList, apiKey, selectedWorkspace.id)
    } else {
      log.error('Workspace has no collections. Select another workspace.')
      beginSetup(apiKey)
    }
  } catch (e) {
    log.error('Invalid Postman API key!')
    setup()
  }
}

async function continueSetup (collectionList, apiKey, selectedWorkspaceId) {
  const settings = {}
  const apiKeyParam = `?apikey=${apiKey.value}`
  const collectionChoices = createChoices(collectionList)

  const selectedCollection = await prompt({
    name: 'id',
    type: 'autocomplete',
    message: 'Select the Collection you wish to work with',
    limit: 10,
    choices: collectionChoices
  })

  const fetchEnvironment = await prompt({
    name: 'value',
    type: 'confirm',
    message: 'Would you like to include an Environment?'
  })

  if (fetchEnvironment.value) {
    const environmentList = await axios.get(`${POSTMAN_API_BASE}/workspaces/${selectedWorkspaceId}/${apiKeyParam}`)
    const environmentChoices = createChoices(environmentList.data.workspace.environments)

    const selectedEnvironment = await prompt({
      name: 'id',
      type: 'autocomplete',
      message: 'Select the Environment you wish to work with',
      limit: 10,
      choices: environmentChoices
    })

    settings.POSTMAN_ENVIRONMENT_ID = selectedEnvironment.id
  }

  const directory = await prompt({
    type: 'input',
    name: 'name',
    initial: 'postman',
    message: 'Enter directory for Postman files'
  })

  const collectionFile = await prompt({
    type: 'input',
    name: 'name',
    initial: 'postman_collection.json',
    message: 'Enter filename for collection JSON file'
  })

  const environmentFile = await prompt({
    type: 'input',
    name: 'name',
    initial: 'postman_environment.json',
    message: 'Enter filename for environment JSON file'
  })

  Object.assign(settings, {
    POSTMAN_API_KEY: apiKey.value,
    POSTMAN_COLLECTION_ID: selectedCollection.id,
    POSTMAN_WORKSPACE_ID: selectedWorkspaceId,
    POSTMAN_DIR: directory.name,
    POSTMAN_COLLECTION_FILENAME: collectionFile.name,
    POSTMAN_ENVIRONMENT_FILENAME: environmentFile.name
  })

  config.set(settings, { log: true })
}
