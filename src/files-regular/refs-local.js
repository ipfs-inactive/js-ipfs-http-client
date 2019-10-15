'use strict'

const configure = require('../lib/configure')
const ndjson = require('iterable-ndjson')
const toIterable = require('../lib/stream-to-iterable')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * refsLocal (options) {
    options = options || {}

    const searchParams = new URLSearchParams()

    if (options.multihash !== undefined) {
      searchParams.set('multihash', options.multihash)
    }

    const res = await ky.get('refs/local', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const file of ndjson(toIterable(res.body))) {
      yield toCamel(file)
    }
  }
})
