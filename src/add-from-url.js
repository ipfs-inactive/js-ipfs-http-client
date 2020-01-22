'use strict'

const kyDefault = require('ky-universal').default
const toAsyncIterable = require('./lib/stream-to-async-iterable')

module.exports = config => {
  const add = require('./add')(config)

  return async function * addFromURL (url, options) {
    options = options || {}

    const res = await kyDefault.get(url)

    const input = {
      path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
      content: toAsyncIterable(res)
    }

    yield * add(input, options)
  }
}
