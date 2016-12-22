'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  /**
   * @alias mount
   * @method
   * @returns {Promise|undefined}
   * @memberof IpfsApi#
   */
  return promisify((ipfs, ipns, callback) => {
    if (typeof ipfs === 'function') {
      callback = ipfs
      ipfs = null
    } else if (typeof ipns === 'function') {
      callback = ipns
      ipns = null
    }
    const opts = {}
    if (ipfs) {
      opts.f = ipfs
    }
    if (ipns) {
      opts.n = ipns
    }

    send({
      path: 'mount',
      qs: opts
    }, callback)
  })
}
