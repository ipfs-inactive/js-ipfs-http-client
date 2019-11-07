'use strict'

const promisify = require('promisify-es6')
const Big = require('bignumber.js')

const transform = ({ human }) => (res, callback) => {
  callback(null, {
    numObjects: human ? res.NumObjects : new Big(res.NumObjects),
    repoSize: human ? res.RepoSize : new Big(res.RepoSize),
    repoPath: res.RepoPath,
    version: res.Version,
    storageMax: human ? res.StorageMax : new Big(res.StorageMax)
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
    }, transform(opts), callback)
  })
}
