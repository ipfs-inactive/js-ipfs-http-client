/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const test = require('interface-ipfs-core')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

const common = {
  setup: function (callback) {
    callback(null, df)
  }
}

test.files(common)
