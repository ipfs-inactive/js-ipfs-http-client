'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const errCode = require('err-code')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (peerId, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${peerId}`)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    const res = await ky.get('dht/findpeer', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    // 2 = FinalPeer
    // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L18
    if (res.Type !== 2) {
      throw errCode(new Error('final peer not found'), 'ERR_TYPE_2_NOT_FOUND')
    }

    const { ID, Addrs } = res.Responses[0]
    const peerInfo = new PeerInfo(PeerId.createFromB58String(ID))
    Addrs.forEach(addr => peerInfo.multiaddrs.add(multiaddr(addr)))

    return peerInfo
  }
})
