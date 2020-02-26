const fs = require('fs')
const axios = require('axios')
const { prompt } = require('enquirer')
const config = require('./lib/config')
const createChoices = require('./lib/create-choices')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')

module.exports = async function env () {
  const { POSTMAN_API_KEY, POSTMAN_WORKSPACE_ID, POSTMAN_ENVIRONMENT_FILENAME } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const environments = await axios.get(`${POSTMAN_API_BASE}/workspaces/${POSTMAN_WORKSPACE_ID}/${apiKeyParam}`)
  const environmentChoices = createChoices(environments.data.workspace.environments)

  const selectedEnvironment = await prompt({
    name: 'id',
    type: 'autocomplete',
    message: 'Select the Environment you wish to fetch',
    limit: 10,
    choices: environmentChoices
  })

  const environment = await axios.get(`${POSTMAN_API_BASE}/environments/${selectedEnvironment.id}/${apiKeyParam}`)

  fs.writeFileSync(POSTMAN_ENVIRONMENT_FILENAME, JSON.stringify(environment.data.environment, null, 2))
  log.success('Postman environment saved!')
}
