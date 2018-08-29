'use strict'

const promisify = require('promisify-es6')
const Big = require('big.js')
const CID = require('cids')

const transform = function (res, callback) {
  callback(null, {
    provideBufLen: res.ProvideBufLen,
    wantlist: (res.Wantlist || []).map(item => new CID(item['/'])),
    peers: res.Peers || [],
    blocksReceived: new Big(res.BlocksReceived),
    dataReceived: new Big(res.DataReceived),
    blocksSent: new Big(res.BlocksSent),
    dataSent: new Big(res.DataSent),
    dupBlksReceived: new Big(res.DupBlksReceived),
    dupDataReceived: new Big(res.DupDataReceived)
  })
}

module.exports = (send) => {
  return promisify((options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}

    send.andTransform({ path: 'bitswap/stat' }, transform, callback)
  })
}
