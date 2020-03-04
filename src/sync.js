const fs = require('fs')
const browserify = require('browserify')
const promisify = require('util').promisify
const config = require('./lib/config')
const log = require('./lib/log')
const recurseCollection = require('./lib/recurse-collection')

module.exports = async function sync () {
  const { POSTMAN_COLLECTION_FILENAME } = config.get()
  const collection = await recurseCollection(mapFileToScript)

  fs.writeFileSync(POSTMAN_COLLECTION_FILENAME, JSON.stringify(collection, null, 2))
  log.success(`${POSTMAN_COLLECTION_FILENAME} written!`)
}

async function mapFileToScript (req, context = '', scriptType) {
  const index = req.event.findIndex((el) => el.listen === scriptType)

  req.event[index].script.exec = await bundle(req, context, scriptType)

  return req
}

async function bundle (req, context, scriptType) {
  const { POSTMAN_TEST_DIR } = config.get()
  const path = `${POSTMAN_TEST_DIR}/${context}/${req.name || ''}/${scriptType}.js`

  if (fs.existsSync(path)) {
    const b = browserify()
    b.add(path)

    const doBundle = promisify(b.bundle.bind(b))
    const buf = await doBundle()
    const script = buf.toString()

    return script.split('\n')
  } else {
    return ''
  }
}
