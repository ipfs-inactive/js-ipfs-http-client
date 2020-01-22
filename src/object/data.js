'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const configure = require('../lib/configure')
const toAsyncIterable = require('../lib/stream-to-async-iterable')

module.exports = configure(({ ky }) => {
  return async function * data (cid, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    const res = await ky.post('object/data', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const chunk of toAsyncIterable(res)) {
      yield Buffer.from(chunk)
    }
  }
})
