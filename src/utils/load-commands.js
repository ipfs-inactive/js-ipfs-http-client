'use strict'

function requireCommands () {
  const cmds = {
    // add and createAddStream alias
    add: require('../files/add'),
    addReadableStream: require('../files/add-readable-stream'),
    addPullStream: require('../files/add-pull-stream'),
    cat: require('../files/cat'),
    catReadableStream: require('../files/cat-readable-stream'),
    catPullStream: require('../files/cat-pull-stream'),
    get: require('../files/get'),
    getReadableStream: require('../files/get-readable-stream'),
    getPullStream: require('../files/get-pull-stream'),
    bitswap: require('../bitswap'),
    block: require('../block'),
    bootstrap: require('../bootstrap'),
    commands: require('../commands'),
    config: require('../config'),
    dht: require('../dht'),
    diag: require('../diag'),
    id: require('../id'),
    key: require('../key'),
    log: require('../log'),
    ls: require('../ls'),
    mount: require('../mount'),
    name: require('../name'),
    object: require('../object'),
    pin: require('../pin'),
    ping: require('../ping'),
    refs: require('../refs'),
    repo: require('../repo'),
    swarm: require('../swarm'),
    pubsub: require('../pubsub'),
    update: require('../update'),
    version: require('../version')
  }

  // TODO: crowding the 'files' namespace temporarily for interface-ipfs-core
  // compatibility, until 'files vs mfs' naming decision is resolved.
  cmds.files = function (send) {
    const files = require('../files')(send)

    return files
  }

  cmds.util = function (send) {
    const util = {
      addFromFs: require('../util/fs-add')(send),
      addFromStream: require('../files/add')(send),
      addFromURL: require('../util/url-add')(send)
    }
    return util
  }

  return cmds
}

function loadCommands (send) {
  const files = requireCommands()
  const cmds = {}

  Object.keys(files).forEach((file) => {
    cmds[file] = files[file](send)
  })

  return cmds
}

module.exports = loadCommands
