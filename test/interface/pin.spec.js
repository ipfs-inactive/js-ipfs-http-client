/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const test = require('interface-ipfs-core')
const parallel = require('async/parallel')

const IPFSApi = require('../../src')

const DaemonFactory = require('ipfsd-ctl')

const nodes = []
const common = {
  setup: function (callback) {
    const df = DaemonFactory.create({remote: true, port: 30003})

    callback(null, {
      spawnNode: (cb) => {
        df.spawn((err, _ipfsd) => {
          if (err) {
            return cb(err)
          }

          nodes.push(_ipfsd)
          cb(null, IPFSApi(_ipfsd.apiAddr))
        })
      }
    })
  },
  teardown: function (callback) {
    parallel(nodes.map((node) => (cb) => node.stop(cb)), callback)
  }
}

test.pin(common)
