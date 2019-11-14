'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const ndjson = require('iterable-ndjson')
const log = require('debug')('ipfs-http-client:dht:query')
const configure = require('../lib/configure')
const toIterable = require('../lib/stream-to-iterable')

module.exports = configure(({ ky }) => {
  return (peerId, options) => (async function * () {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${peerId}`)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    const res = await ky.get('dht/query', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const message of ndjson(toIterable(res.body))) {
      log(message)
      yield new PeerInfo(PeerId.createFromB58String(message.ID))
    }
  })()
})
