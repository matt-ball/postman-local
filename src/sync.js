const fs = require('fs')
const axios = require('axios')
const browserify = require('browserify')
const promisify = require('util').promisify
const log = require('./lib/log')
const { POSTMAN_API_BASE } = require('./lib/constants')
let command

module.exports = function sync (cmd) {
  command = cmd._name
  exec()
}

async function exec () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID, POSTMAN_COLLECTION_FILENAME } = require('./lib/config')
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const apiAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`
  const res = await axios.get(apiAddress)
  const collection = res.data.collection

  if (collection.item) {
    await checkCollectionItems(collection.item)
  }

  if (command === 'bootstrap') {
    log.success('Files written!')
  }

  if (command === 'sync') {
    fs.writeFileSync(POSTMAN_COLLECTION_FILENAME, JSON.stringify(collection, null, 2))
    log.success(`${POSTMAN_COLLECTION_FILENAME} written!`)
  }

  if (command === 'update') {
    axios.put(apiAddress, { collection })
    log.success('Postman updated!')
  }
}

async function checkCollectionItems (items, context) {
  for await (const item of items) {
    if (item.request) {
      if (command === 'bootstrap') {
        mapScriptToFile(item, context)
      } else {
        await mapFileToScript(item, context)
      }
    } else {
      // is folder
      context = context ? context + '/' : ''
      await checkCollectionItems(item.item, context + item.name)
    }
  }
}

function mapScriptToFile (req, context = '') {
  const config = require('./lib/config')
  const tests = req.event && req.event.find((el) => el.listen === 'test')
  const testScript = tests && tests.script.exec.join('\n')
  const preRequest = req.event && req.event.find((el) => el.listen === 'prerequest')
  const preRequestScript = preRequest && preRequest.script.exec.join('\n')
  const path = `${config.POSTMAN_TEST_DIR}/${context}/${req.name}`

  if (testScript && !fs.existsSync(`${path}/test.js`)) {
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(`${path}/test.js`, testScript)
  }

  if (preRequestScript && !fs.existsSync(`${path}/preRequest.js`)) {
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(`${path}/preRequest.js`, preRequestScript)
  }
}

async function mapFileToScript (req, context = '') {
  const config = require('./lib/config')
  const testPath = `${config.POSTMAN_TEST_DIR}/${context}/${req.name}/test.js`
  const preRequestPath = `${config.POSTMAN_TEST_DIR}/${context}/${req.name}/preRequest.js`
  const testIndex = req.event.findIndex((el) => el.listen === 'test')
  const preRequestindex = req.event.findIndex((el) => el.listen === 'prerequest')

  if (fs.existsSync(testPath)) {
    const b = browserify()
    b.add(testPath)

    const doBundle = promisify(b.bundle.bind(b))
    const buf = await doBundle()
    const script = buf.toString()

    req.event[testIndex].script.exec = script.split('\n')
  } else {
    req.event[testIndex].script.exec = ''
  }

  if (fs.existsSync(preRequestPath)) {
    const b = browserify()
    b.add(preRequestPath)

    const doBundle = promisify(b.bundle.bind(b))
    const buf = await doBundle()
    const script = buf.toString()

    req.event[preRequestindex].script.exec = script.split('\n')
  } else {
    req.event[preRequestindex].script.exec = ''
  }
}
