const fs = require('fs')
const axios = require('axios')
const { prompt } = require('enquirer')
const log = require('./lib/log')
const apiBase = 'https://api.getpostman.com/workspaces'

module.exports = async function setup () {
  const apiKey = await prompt({
    type: 'input',
    name: 'value',
    message: 'Enter your Postman API key'
  })

  const apiKeyParam = `?apikey=${apiKey.value}`

  const workspaces = await axios.get(`${apiBase}/${apiKeyParam}`)
  const workspaceChoices = createChoices(workspaces.data.workspaces)

  const selectedWorkspace = await prompt({
    name: 'id',
    type: 'autocomplete',
    message: 'Select the Workspace your Collection resides within',
    limit: 10,
    choices: workspaceChoices
  })

  const collections = await axios.get(`${apiBase}/${selectedWorkspace.id}/${apiKeyParam}`)
  const collectionChoices = createChoices(collections.data.workspace.collections)

  const selectedCollection = await prompt({
    name: 'id',
    type: 'autocomplete',
    message: 'Select the Collection you wish to work with',
    limit: 10,
    choices: collectionChoices
  })

  const directory = await prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the directory for Postman tests'
  })

  const settings = {
    POSTMAN_API_KEY: apiKey.value,
    POSTMAN_COLLECTION_ID: selectedCollection.id,
    POSTMAN_TEST_DIR: directory.name
  }

  fs.writeFileSync('.postman.json', JSON.stringify(settings, null, 2))
  log.success('Postman CLI config saved!')
}

function createChoices (arr) {
  return arr.map(({ name, id }) => { return { name, value: id } })
}
