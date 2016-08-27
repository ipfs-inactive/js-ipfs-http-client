'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    tail: promisify((callback) => {
      send({
        path: 'log/tail',
        ndjson: true
      }, callback)
    })
  }
}
