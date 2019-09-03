'use strict'

function requireCommands () {
  return {
    // Files Regular (not MFS)
    ...require('../files-regular'),

    // Files MFS (Mutable Filesystem)
    files: require('../files-mfs'),

    // Block
    block: require('../block'),
    bitswap: require('../bitswap'),

    // Graph
    dag: require('../dag'),
    object: require('../object'),
    pin: require('../pin'),

    // Network
    bootstrap: require('../bootstrap'),
    dht: require('../dht'),
    name: require('../name'),
    ping: require('../ping'),
    pingReadableStream: require('../ping-readable-stream'),
    pingPullStream: require('../ping-pull-stream'),
    swarm: require('../swarm'),
    pubsub: require('../pubsub'),
    dns: require('../dns'),

    // Miscellaneous
    commands: require('../commands'),
    config: require('../config'),
    diag: require('../diag'),
    id: require('../id'),
    key: require('../key'),
    log: require('../log'),
    mount: require('../mount'),
    repo: require('../repo'),
    stop: require('../stop'),
    shutdown: require('../stop'),
    stats: require('../stats'),
    update: require('../update'),
    version: require('../version'),
    resolve: require('../resolve'),
    // ipfs-http-client instance
    getEndpointConfig: (send, config) => require('../get-endpoint-config')(config)
  }
}

function loadCommands (send, config) {
  const files = requireCommands()
  const cmds = {}

  Object.keys(files).forEach((file) => {
    cmds[file] = files[file](send, config)
  })

  return cmds
}

module.exports = loadCommands
