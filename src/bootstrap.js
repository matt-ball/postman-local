const fs = require('fs')
const config = require('./lib/config')
const log = require('./lib/log')
const recurseCollection = require('./lib/recurse-collection')
let wroteFile

module.exports = async function bootstrap () {
  wroteFile = false
  const { POSTMAN_TEST_DIR } = config.get()
  await recurseCollection(mapItemToFile)

  if (wroteFile) {
    log.success(`Files written to ${POSTMAN_TEST_DIR} directory!`)
  } else {
    log.info('Nothing to bootstrap. No scripts found within collection.')
  }
}

function mapItemToFile (item, context = '', type) {
  const { POSTMAN_TEST_DIR } = config.get()
  const obj = item[type]
  const scriptObj = (item.event && item.event.find((el) => el.listen === type)) || (!item.event && item.find((el) => el.listen === type))
  const script = scriptObj && scriptObj.script.exec.join('\n')
  const path = `${POSTMAN_TEST_DIR}/${context}/${item.name || ''}`
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
