'use strict'

const isStream = require('isstream')
const promisify = require('promisify-es6')
const DAGNodeStream = require('../dagnode-stream')

module.exports = (send) => {
  /**
   * Add content to IPFS.
   *
   * @alias add
   * @method
   * @param {(Buffer|Stream|Array<Buffer|Stream>)} files - The content to add.
   * @param {function(Error, {hash: string})} [callback]
   * @returns {Promise<{hash: string}>|undefined}
   *
   * @memberof IpfsApi#
   *
   * @example
   * api.add(new Buffer('hello world')).then((res) => {
   *   console.log('saved with hash %s', res.hash)
   * })
   *
   */
  return promisify((files, callback) => {
    const ok = Buffer.isBuffer(files) ||
               isStream.isReadable(files) ||
               Array.isArray(files)

    if (!ok) {
      return callback(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    const request = {
      path: 'add',
      files: files
    }

    // Transform the response stream to DAGNode values
    const transform = (res, callback) => DAGNodeStream.streamToValue(send, res, callback)
    send.andTransform(request, transform, callback)
  })
}
