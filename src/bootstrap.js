const fs = require('fs')
const axios = require('axios')
const config = require('./lib/config')
const constants = require('./lib/constants')
const file = require('./lib/file')
const log = require('./lib/log')
const recurseCollection = require('./lib/recurse-collection')
let wroteFile

module.exports = async function bootstrap () {
  wroteFile = false
  const { POSTMAN_DIR, POSTMAN_API_KEY, POSTMAN_ENVIRONMENTS } = config.get()
  const collection = await recurseCollection(mapItemToFile)
  const environments = file.environment.read()

  if (wroteFile) {
    log.success(`Files written to ${POSTMAN_DIR} directory!`)
    file.collection.write(collection)
  } else {
    log.info('Nothing to bootstrap. No or no new requests found within collection.')
  }

  if (!environments && POSTMAN_ENVIRONMENTS) {
    Object.values(POSTMAN_ENVIRONMENTS).forEach((id) => {
      writeEnvironment(id, POSTMAN_API_KEY)
    })
  }
}

async function writeEnvironment (id, POSTMAN_API_KEY) {
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const environment = await axios.get(`${constants.POSTMAN_API_BASE}/environments/${id}/${apiKeyParam}`)
  file.environment.write(environment.data.environment)
}

function mapItemToFile (item, context = '', type) {
  const { POSTMAN_DIR } = config.get()
  const obj = item[type]
  const scriptObj = (item.event && item.event.find((el) => el.listen === type)) || (!item.event && item.length && item.find((el) => el.listen === type))
  const script = scriptObj && scriptObj.script.exec.join('\n')
  const path = `${POSTMAN_DIR}/${context}/${item.name || ''}`
  const fileExtension = script ? 'js' : 'json'
  const filePath = `${path}/${type}.${fileExtension}`
  const fileNotBootstrapped = !fs.existsSync(filePath)

  if ((script || obj) && fileNotBootstrapped) {
    wroteFile = true
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(filePath, (script || JSON.stringify(obj, null, 2)))
  }

  return item
}
