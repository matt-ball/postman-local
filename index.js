#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const program = require('commander')
const browserify = require('browserify')
const promisify = require('util').promisify
const config = require(path.resolve(process.cwd(), '.postmancli'))
const directory = config.POSTMAN_TEST_DIR
const apiAddress = `https://api.getpostman.com/collections/${config.POSTMAN_COLLECTION_ID}?apikey=${config.POSTMAN_API_KEY}`

program
  .option('-f, --files', 'Generate local files from Postman Collection')
  .option('-s, --sync', 'Sync local files to Postman Collection')

program.parse(process.argv)

if (!program.files && !program.sync) {
  console.log('Syncing direction must be specified with -p or -f')
  process.exit(1)
}

exec()

async function exec () {
  const res = await axios.get(apiAddress)
  const collection = res.data.collection

  if (collection.item) {
    await checkCollectionItems(collection.item)
  }

  if (program.files) {
    console.log('Files written!')
  }

  if (program.sync) {
    axios.put(apiAddress, { collection })
    console.log('Postman updated!')
  }
}

async function checkCollectionItems (items, context) {
  for await (const item of items) {
    if (item.request) {
      if (program.files) {
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
  const path = `${directory}/${context}/${req.name}`

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
  const testPath = `${directory}/${context}/${req.name}/test.js`
  const preRequestPath = `${directory}/${context}/${req.name}/preRequest.js`

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
