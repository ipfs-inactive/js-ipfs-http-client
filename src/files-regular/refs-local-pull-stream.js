'use strict'

const cleanCID = require('../utils/clean-cid')
const v = require('is-ipfs')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const deferred = require('pull-defer')
const moduleConfig = require('../utils/module-config')

module.exports = (send) => {
  send = moduleConfig(send)

  return (opts) => {
    opts = opts || {}

    const p = deferred.source()

    send({ path: 'refs/local', qs: opts }, (err, stream) => {
      if (err) { return p.resolve(pull.error(err)) }

      p.resolve(toPull.source(stream))
    })

    return p
  }
}
