/* eslint-env mocha */

'use strict'

const test = require('interface-ipfs-core')
const IPFSApi = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

let ipfsd = null
const common = {
  setup: function (callback) {
    callback(null, {
      spawnNode: (cb) => {
        df.spawn((err, _ipfsd) => {
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

test.generic(common)
