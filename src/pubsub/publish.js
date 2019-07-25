'use strict'

const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const { objectToQuery } = require('../lib/querystring')
const { ok } = require('../lib/fetch')

module.exports = configure(({ fetch, apiAddr, apiPath, headers }) => {
  return async (topic, data, options) => {
    options = options || {}

    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer')
    }

    let qs = objectToQuery(options.qs)
    qs = qs ? `&${qs.slice(1)}` : qs

    const url = `${apiAddr}${apiPath}/pubsub/pub?arg=${encodeURIComponent(topic)}&arg=${encodeBuffer(data)}${qs}`
    const res = await ok(fetch(url, {
      method: 'POST',
      signal: options.signal,
      headers: options.headers || headers
    }))

    return res.text()
  }
})

function encodeBuffer (buf) {
  let uriEncoded = ''
  for (const byte of buf) {
    // https://tools.ietf.org/html/rfc3986#page-14
    // ALPHA (%41-%5A and %61-%7A), DIGIT (%30-%39), hyphen (%2D), period (%2E),
    // underscore (%5F), or tilde (%7E)
    if (
      (byte >= 0x41 && byte <= 0x5A) ||
      (byte >= 0x61 && byte <= 0x7A) ||
      (byte >= 0x30 && byte <= 0x39) ||
      (byte === 0x2D) ||
      (byte === 0x2E) ||
      (byte === 0x5F) ||
      (byte === 0x7E)
    ) {
      uriEncoded += String.fromCharCode(byte)
    } else {
      uriEncoded += `%${byte.toString(16).padStart(2, '0')}`
    }
  }
  return uriEncoded
}
