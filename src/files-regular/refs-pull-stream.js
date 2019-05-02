'use strict'

const cleanCID = require('../utils/clean-cid')
const v = require('is-ipfs')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const deferred = require('pull-defer')
const moduleConfig = require('../utils/module-config')

module.exports = (send) => {
  send = moduleConfig(send)

  return (hash, opts) => {
    opts = opts || {}

    const p = deferred.source()

    try {
      hash = cleanCID(hash)
    } catch (err) {
      if (!v.ipfsPath(hash)) {
        return p.end(err)
      }
    }

    send({ path: 'refs', args: hash, qs: opts }, (err, stream) => {
      if (err) { return p.resolve(pull.error(err)) }

      p.resolve(pull(
        toPull.source(stream),
        pull.map(r => ({ ref: r.Ref, err: r.Err }))
      ))
    })

    return p
  }
}
