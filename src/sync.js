const fs = require('fs')
const axios = require('axios')
const browserify = require('browserify')
const promisify = require('util').promisify
const config = require('./lib/config')
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')
let command, wroteFile

module.exports = function sync (cmd) {
  command = cmd._name
  exec()
}

async function exec () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID, POSTMAN_COLLECTION_FILENAME, POSTMAN_TEST_DIR } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const apiAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`
  const res = await axios.get(apiAddress)
  const collection = res.data.collection
  wroteFile = false

  if (collection.item) {
    await checkCollectionForScripts(collection)
    collection.item.pop()
  }

  if (command === 'bootstrap') {
    if (wroteFile) {
      log.success(`Files written to ${POSTMAN_TEST_DIR} directory!`)
    } else {
      log.info('Nothing to bootstrap. No scripts found within collection.')
    }
  }

  if (command === 'sync') {
    fs.writeFileSync(POSTMAN_COLLECTION_FILENAME, JSON.stringify(collection, null, 2))
    log.success(`${POSTMAN_COLLECTION_FILENAME} written!`)
  }
}

async function checkCollectionForScripts (collection, context) {
  const items = collection.item
  const atCollectionRoot = collection.info

  if (atCollectionRoot) {
    items.push({ event: collection.event })
  }

  for await (const item of items) {
    const itemContainsScript = item.request || item.event
    const folder = !item.request && item.item

    if (itemContainsScript) {
      if (command === 'bootstrap') {
        mapScriptToFile(item, context, 'prerequest')
        mapScriptToFile(item, context, 'test')
      } else {
        await mapFileToScript(item, context, 'prerequest')
        await mapFileToScript(item, context, 'test')
      }
    }

    if (folder) {
      context = context ? context + '/' : ''
      await checkCollectionForScripts(item, context + item.name)
    }
  }
}

function mapScriptToFile (req, context = '', scriptType) {
  const { POSTMAN_TEST_DIR } = config.get()
  const scriptObj = (req.event && req.event.find((el) => el.listen === scriptType)) || (!req.event && req.find((el) => el.listen === scriptType))
  const script = scriptObj && scriptObj.script.exec.join('\n')
  const path = `${POSTMAN_TEST_DIR}/${context}/${req.name || ''}`

  if (script && !fs.existsSync(`${path}/${scriptType}}.js`)) {
    wroteFile = true
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(`${path}/${scriptType}.js`, script)
  }
}

async function mapFileToScript (req, context = '', scriptType) {
  const index = req.event.findIndex((el) => el.listen === scriptType)

  req.event[index].script.exec = await bundle(req, context, scriptType)
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
