'use strict'

const { Readable } = require('stream')
const toPull = require('stream-to-pull-stream')
const promiseNodeify = require('promise-nodeify')
const concatStream = require('concat-stream')
const pump = require('pump')
const SendStream = require('./send-stream')

/** @module api/add */

/**
 * Converts an array to a stream
 *
 * @private
 * @param {Array} data
 * @returns {Readable}
 */
const arrayToStream = (data) => {
  let i = 0
  return new Readable({
    objectMode: true,
    read () {
      this.push(i < data.length ? data[i++] : null)
    }
  })
}

/**
 * @typedef {Object} AddOptions
 * @property  {number} chunkSize - Value of array element
 * @property {number} [cidVersion=0] - Defaults to 0. The CID version to use when storing the data (storage keys are based on the CID, including it's version)
 * @property {function(bytes: number): void} progress - function that will be called with the byte length of chunks as a file is added to ipfs.
 * @property {Boolean} recursive - When a Path is passed, this option can be enabled to add recursively all the files.
 * @property {string} hashAlg - Multihash hashing algorithm to use. (default: sha2-256) The list of all possible values {@link https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343 hashAlg values}
 * @property {Boolean} wrapWithDirectory - Adds a wrapping node around the content.
 * @property {Boolean} onlyHash - Doesn't actually add the file to IPFS, but rather calculates its hash.
 * @property {Boolean} [pin=true] - Defaults to true. Pin this object when adding.
 * @property {Boolean} [rawLeaves=false] - Defaults to false. If true, DAG leaves will contain raw file data and not be wrapped in a protobuf
 * @property {string} [chunker=size-262144] Chunking algorithm used to build ipfs DAGs. Available formats:
 * - size-{size}
 * - rabin
 * - rabin-{avg}
 * - rabin-{min}-{avg}-{max}
 */

/**
 * @typedef {Object} AddResult
 * @property {string} path
 * @property {string} hash
 * @property {number} size
 */

/**
 * This callback is displayed as a global member.
 * @callback AddCallback
 * @param {Error} err
 * @param {AddResult[]} res
 */

/** @typedef {Function} PullStream */
/** @typedef {(Object[]|Readable|File|PullStream|Buffer)} AddData */
/**
 * @typedef {function(AddData, AddOptions, AddCallback): (Promise.<AddResult[]>|void)} AddFunction
 */

/**
 * Add to data to ipfs
 *
 * @param {Function} send
 * @returns {AddFunction}
 * @memberof api/add
 */
const add = (send) => (files, options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  let result = []
  const r = new Promise((resolve, reject) => {
    pump(
      arrayToStream([].concat(files)),
      new SendStream(send, options),
      concatStream(r => (result = r)),
      (err) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      }
    )
  })

  return promiseNodeify(r, callback)
}

/**
 * Add to data to ipfs
 *
 * @param {Function} send
 * @returns {function(AddOptions): Readable}
 * @memberof api/add
 */
const addReadableStream = (send) => (options = {}) => {
  return new SendStream(send, options)
}

/**
 * Add to data to ipfs
 *
 * @param {Function} send
 * @returns {function(AddOptions): PullStream}
 * @memberof api/add
 */
const addPullStream = (send) => (options = {}) => {
  return toPull(new SendStream(send, options))
}

module.exports = {
  add,
  addReadableStream,
  addPullStream
}
