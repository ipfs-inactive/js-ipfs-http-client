'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('../lib/stream-to-iterable')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return (cid, options) => (async function * () {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${cid}`)
    if (options.numProviders) searchParams.set('num-providers', options.numProviders)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    const res = await ky.get('dht/findprovs', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (let message of ndjson(toIterable(res.body))) {
      message = toCamel(message)
      if (message.responses) {
        message.responses = message.responses.map(({ ID, Addrs }) => {
          const peerInfo = new PeerInfo(PeerId.createFromB58String(ID))
          if (Addrs) Addrs.forEach(addr => peerInfo.multiaddrs.add(multiaddr(addr)))
          return peerInfo
        })
      }
      yield message
    }
  })()
})
