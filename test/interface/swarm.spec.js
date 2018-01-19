/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const test = require('interface-ipfs-core')
const IPFSApi = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

let ipfsd = null
const common = {
  setup: function (callback) {
    callback(null, {
      spawnNode: (repoPath, config, cb) => {
        if (typeof repoPath === 'function') {
          cb = repoPath
          repoPath = undefined
        }

        if (typeof config === 'function') {
          cb = config
          config = undefined
        }

        df.spawn({ repoPath, config }, (err, _ipfsd) => {
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

test.swarm(common)
