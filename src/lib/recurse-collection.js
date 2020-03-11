const axios = require('axios')
const config = require('./config')
const { POSTMAN_API_BASE } = require('./constants')

module.exports = async function recurseCollection (cb) {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const apiAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`
  const res = await axios.get(apiAddress)
  const collection = res.data.collection

  if (collection.item) {
    await recurseCollectionForItems(collection, null, cb)
    collection.item.pop()
    return collection
  }
}

async function recurseCollectionForItems (collection, context, cb) {
  const items = collection.item
  const atCollectionRoot = collection.info

  if (atCollectionRoot) {
    items.push({ event: collection.event })
  }

  for await (let item of items) {
    const validItem = item.request || item.event
    const folder = !item.request && item.item

    if (validItem) {
      item = await cb(item, context, 'request')
      item = await cb(item, context, 'response')
      item = await cb(item, context, 'prerequest')
      item = await cb(item, context, 'test')
    }

    if (folder) {
      context = context ? context + '/' : ''
      await recurseCollectionForItems(item, context + item.name, cb)
    }
  }
}
