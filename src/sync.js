const fs = require('fs')
const browserify = require('browserify')
const detective = require('detective')
const promisify = require('util').promisify
const config = require('./lib/config')
const file = require('./lib/file')
const recurseCollection = require('./lib/recurse-collection')

// Reference: https://learning.postman.com/docs/writing-scripts/script-references/postman-sandbox-api-reference/
const sandboxBuiltins = [
  'ajv', 'atob', 'btoa', 'chai', 'cheerio', 'crypto-js',
  'csv-parse/lib/sync', 'lodash', 'moment', 'postman-collection',
  'tv4', 'uuid', 'xml2js', 'path', 'assert', 'buffer', 'util',
  'url', 'punycode', 'querystring', 'string-decoder', 'stream',
  'timers', 'events'
]

module.exports = async function sync () {
  const collection = await recurseCollection(mapFileToItem)

  file.collection.write(collection)
}

async function mapFileToItem (req, context = '', type) {
  const { POSTMAN_DIR } = config.get()
  const isScript = type === 'prerequest' || type === 'test'
  const fileExtension = isScript ? 'js' : 'json'
  const path = `${POSTMAN_DIR}/${context}/${req.name || ''}/${type}.${fileExtension}`
  const localFileExists = fs.existsSync(path)

  if (localFileExists) {
    if (isScript) {
      req.event = req.event || [{
        listen: type,
        script: {
          exec: []
        }
      }]

      const index = req.event.findIndex((el) => el.listen === type)
      req.event[index].script.exec = await maybeBundle(path)
    } else {
      req[type] = readItemFile(path)
    }
  }

  return req
}

async function maybeBundle (path) {
  const source = fs.readFileSync(path)
  const requires = detective(source).filter(r => !sandboxBuiltins.includes(r))

  return requires.length ? bundle(path) : source.toString('utf8')
}

async function bundle (path) {
  const b = browserify()
  b.external(sandboxBuiltins)
  b.add(path)

  const doBundle = promisify(b.bundle.bind(b))
  const buf = await doBundle()
  const script = buf.toString()

  return script.split('\n')
}

function readItemFile (path) {
  return JSON.parse(fs.readFileSync(path))
}
