/* eslint-env mocha */

'use strict'

const test = require('interface-ipfs-core')
const FactoryClient = require('../factory/factory-client')
const PubsubMessage = require('../../src/pubsub-message')
const PubsubMessageUtils = require('../../src/pubsub-message-utils')

let fc

const common = {
  setup: function (callback) {
    fc = new FactoryClient()
    callback(null, fc)
  },
  teardown: function (callback) {
    fc.dismantle(callback)
  }
}

// Pass the components down to the tests
test.pubsubMessage(common, { 
  PubsubMessageUtils: PubsubMessageUtils, 
  PubsubMessage: PubsubMessage,
})
