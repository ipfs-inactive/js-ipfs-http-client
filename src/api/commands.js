'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  /**
   * @alias commands
   * @method
   * @returns {Promise|undefined}
   * @memberof Api#
   */
  return promisify((callback) => {
    send({
      path: 'commands'
    }, callback)
  })
}
