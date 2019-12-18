const fs = require('fs')
const axios = require('axios')
const { prompt } = require('enquirer')
const log = require('./lib/log')
const apiBase = 'https://api.getpostman.com'

module.exports = async function env () {
  const config = require('./lib/config')
  const { POSTMAN_API_KEY, POSTMAN_WORKSPACE_ID } = config
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const environments = await axios.get(`${apiBase}/workspaces/${POSTMAN_WORKSPACE_ID}/${apiKeyParam}`)
  const environmentChoices = createChoices(environments.data.workspace.environments)

  const selectedEnvironment = await prompt({
    name: 'id',
    type: 'autocomplete',
    message: 'Select the Environment you wish to fetch',
    limit: 10,
    choices: environmentChoices
  })

  const environment = await axios.get(`${apiBase}/environments/${selectedEnvironment.id}/${apiKeyParam}`)

  fs.writeFileSync('postman_environment.json', JSON.stringify(environment.data.environment, null, 2))
  log.success('Postman environment saved!')
}

function createChoices (arr) {
  return arr.map(({ name, id }) => { return { name, value: id } })
}
