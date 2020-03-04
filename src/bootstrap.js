const fs = require('fs')
const config = require('./lib/config')
const log = require('./lib/log')
const recurseCollection = require('./lib/recurse-collection')
let wroteFile

module.exports = async function bootstrap () {
  wroteFile = false
  const { POSTMAN_TEST_DIR } = config.get()
  await recurseCollection(mapScriptToFile)

  if (wroteFile) {
    log.success(`Files written to ${POSTMAN_TEST_DIR} directory!`)
  } else {
    log.info('Nothing to bootstrap. No scripts found within collection.')
  }
}

function mapScriptToFile (req, context = '', scriptType) {
  const { POSTMAN_TEST_DIR } = config.get()
  const scriptObj = (req.event && req.event.find((el) => el.listen === scriptType)) || (!req.event && req.find((el) => el.listen === scriptType))
  const script = scriptObj && scriptObj.script.exec.join('\n')
  const path = `${POSTMAN_TEST_DIR}/${context}/${req.name || ''}`
  const filePath = `${path}/${scriptType}.js`
  const fileNotBootstrapped = !fs.existsSync(filePath)

  if (script && fileNotBootstrapped) {
    wroteFile = true
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(filePath, script)
  }

  return req
}
