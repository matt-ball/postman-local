const fs = require('fs')
const browserify = require('browserify')
const promisify = require('util').promisify
const config = require('./lib/config')
const file = require('./lib/file')
const recurseCollection = require('./lib/recurse-collection')

module.exports = async function sync () {
  const collection = await recurseCollection(mapFileToItem)

  file.collection.write(collection)
}

async function mapFileToItem (req, context = '', type) {
  const { POSTMAN_TEST_DIR } = config.get()
  const isScript = type === 'prerequest' || type === 'test'
  const fileExtension = isScript ? 'js' : 'json'
  const path = `${POSTMAN_TEST_DIR}/${context}/${req.name || ''}/${type}.${fileExtension}`
  const localFileExists = fs.existsSync(path)

  if (localFileExists) {
    if (isScript) {
      const index = req.event.findIndex((el) => el.listen === type)
      req.event[index].script.exec = await bundle(path)
    } else {
      req[type] = readItemFile(path)
    }
  }

  return req
}

async function bundle (path) {
  const b = browserify()
  b.add(path)

  const doBundle = promisify(b.bundle.bind(b))
  const buf = await doBundle()
  const script = buf.toString()

  return script.split('\n')
}

function readItemFile (path) {
  return JSON.parse(fs.readFileSync(path))
}
