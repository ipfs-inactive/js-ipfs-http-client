/* eslint-env mocha */

'use strict'

const test = require('interface-ipfs-core')
const isNode = require('detect-node')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

if (isNode) {
  const common = {
    setup: function (callback) {
      callback(null, df)
    }
  }

  test.pubsub(common)
}
