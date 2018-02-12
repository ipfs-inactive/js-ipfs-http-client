'use strict'

const promisify = require('promisify-es6')
const Big = require('big.js')

const transform = function (res, callback) {
  callback(null, {
    numObjects: new Big(res.NumObjects),
    repoSize: new Big(res.RepoSize),
    repoPath: res.RepoPath,
    version: res.Version,
    storageMax: new Big(res.StorageMax)
  })
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'repo/stat',
      qs: opts
    }, transform, callback)
  })
}
