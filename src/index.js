'use strict'

const isIPFS = require('is-ipfs')
const { Buffer } = require('buffer')
const CID = require('cids')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihash = require('multihashes')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

function ipfsClient (config) {
  return {
    add: require('./add')(config),
    addFromFs: require('./add-from-fs')(config),
    addFromURL: require('./add-from-url')(config),
    bitswap: require('./bitswap')(config),
    block: require('./block')(config),
    bootstrap: require('./bootstrap')(config),
    cat: require('./cat')(config),
    commands: require('./commands')(config),
    config: require('./config')(config),
    dag: require('./dag')(config),
    dht: require('./dht')(config),
    diag: require('./diag')(config),
    dns: require('./dns')(config),
    files: require('./files')(config),
    get: require('./get')(config),
    getEndpointConfig: require('./get-endpoint-config')(config),
    id: require('./id')(config),
    key: require('./key')(config),
    log: require('./log')(config),
    ls: require('./ls')(config),
    mount: require('./mount')(config),
    name: require('./name')(config),
    object: require('./object')(config),
    pin: require('./pin')(config),
    ping: require('./ping')(config),
    pubsub: require('./pubsub')(config),
    refs: require('./refs')(config),
    repo: require('./repo')(config),
    resolve: require('./resolve')(config),
    stats: require('./stats')(config),
    stop: require('./stop')(config),
    shutdown: require('./stop')(config),
    swarm: require('./swarm')(config),
    version: require('./version')(config)
  }
}

Object.assign(ipfsClient, { isIPFS, Buffer, CID, multiaddr, multibase, multicodec, multihash, PeerId, PeerInfo })

module.exports = ipfsClient
