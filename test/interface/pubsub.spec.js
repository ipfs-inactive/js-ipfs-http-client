/* eslint-env mocha */

'use strict'

const test = require('interface-ipfs-core')
const isNode = require('detect-node')

const IPFSApi = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

if (isNode) {
  let ipfsd = null
  const common = {
    setup: function (callback) {
      callback(null, {
        spawnNode: (cb) => {
          df.spawn({ args: ['--enable-pubsub-experiment'] }, (err, _ipfsd) => {
            if (err) {
              return cb(err)
            }

            ipfsd = _ipfsd
            cb(null, IPFSApi(_ipfsd.apiAddr))
          })
        }
      })
    },
    teardown: function (callback) {
      ipfsd.stop(callback)
    }
  }

  test.pubsub(common)
}
