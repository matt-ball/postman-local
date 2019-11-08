const fs = require('fs')
const path = require('path')
const axios = require('axios')
const browserify = require('browserify')
const promisify = require('util').promisify
const log = require('./lib/log')
let config, command

module.exports = function sync (cmd) {
  command = cmd._name

  try {
    config = require(path.resolve(process.cwd(), '.postman'))
    exec()
  } catch (e) {
    log.error('No .postman.json file found!')
    process.exit(1)
  }
}

async function exec () {
  const apiAddress = `https://api.getpostman.com/collections/${config.POSTMAN_COLLECTION_ID}?apikey=${config.POSTMAN_API_KEY}`
  const res = await axios.get(apiAddress)
  const collection = res.data.collection

  if (collection.item) {
    await checkCollectionItems(collection.item)
  }

  if (command === 'bootstrap') {
    log.success('Files written!')
  }

  if (command === 'sync') {
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
  const tests = req.event.find((el) => el.listen === 'test') && req.event.find((el) => el.listen === 'test').script.exec.join('\n')
  const preRequest = req.event.find((el) => el.listen === 'prerequest') && req.event.find((el) => el.listen === 'prerequest').script.exec.join('\n')
  const path = `${config.POSTMAN_TEST_DIR}/${context}/${req.name}`

  if (tests && !fs.existsSync(`${path}/test.js`)) {
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(`${path}/test.js`, tests)
  }

  if (preRequest && !fs.existsSync(`${path}/preRequest.js`)) {
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(`${path}/preRequest.js`, preRequest)
  }
}

async function mapFileToScript (req, context = '') {
  const testPath = `${config.POSTMAN_TEST_DIR}/${context}/${req.name}/test.js`
  const preRequestPath = `${config.POSTMAN_TEST_DIR}/${context}/${req.name}/preRequest.js`

  if (fs.existsSync(testPath)) {
    const b = browserify()
    b.add(testPath)

    const doBundle = promisify(b.bundle.bind(b))
    const buf = await doBundle()
    const script = buf.toString()
    const index = req.event.findIndex((el) => el.listen === 'test')

    req.event[index].script.exec = script.split('\n')
  }

  if (fs.existsSync(preRequestPath)) {
    const b = browserify()
    b.add(preRequestPath)

    const doBundle = promisify(b.bundle.bind(b))
    const buf = await doBundle()
    const script = buf.toString()
    const index = req.event.findIndex((el) => el.listen === 'prerequest')

    req.event[index].script.exec = script.split('\n')
  }
}

// TODO
// - Any way to clean up browserify more?
// - When things are deleted
// - Does browserify work outside of this dir
