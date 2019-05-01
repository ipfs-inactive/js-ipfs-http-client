'use strict'

const IsIpfs = require('is-ipfs')
const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')
const moduleConfig = require('../utils/module-config')
const cleanCID = require('../utils/clean-cid')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    const request = {
      path: 'refs/local',
      qs: opts
    }

    send.andTransform(request, streamToValue, callback)
  })
}
