'use strict'
const { createTestsInterface } = require('ipfsd-ctl')
const { findBin } = require('ipfsd-ctl/src/utils')

const factory = createTestsInterface({
  type: 'go',
  ipfsBin: findBin('go'),
  ipfsHttp: {
    path: require.resolve('../../src'),
    ref: require('../../src')
  }
})

module.exports = factory
