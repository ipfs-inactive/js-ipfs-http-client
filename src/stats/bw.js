'use strict'

const promisify = require('promisify-es6')
const pump = require('pump')
const ndjson = require('ndjson')

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send({
      path: 'stats/bw',
      qs: opts
    }, (err, response) => {
      if (err) {
        return callback(err)
      }
      const outputStream = pump(response, ndjson.parse())
      callback(null, outputStream)
    })
  })
}
