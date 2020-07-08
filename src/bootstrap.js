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
  const { POSTMAN_DIR, POSTMAN_API_KEY, POSTMAN_ENVIRONMENT_ID } = config.get()
  const collection = await recurseCollection(mapItemToFile)
  file.collection.write(collection)

  if (POSTMAN_ENVIRONMENT_ID) {
    const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
    const environment = await axios.get(`${constants.POSTMAN_API_BASE}/environments/${POSTMAN_ENVIRONMENT_ID}/${apiKeyParam}`)
    file.environment.write(environment.data.environment)
  }

  if (wroteFile) {
    log.success(`Files written to ${POSTMAN_DIR} directory!`)
  } else {
    log.info('Nothing to bootstrap. No requests found within collection.')
  }
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
