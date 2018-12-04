'use strict'

const ls = require('./ls')
const defer = require('pull-defer')
const values = require('pull-stream/sources/values')

module.exports = (send) => {
  return (args, opts) => {
    const deferred = defer.source()

    ls(send)(args, opts, (err, entries) => {
      if (err) {
        return deferred.abort(err)
      }

      return deferred.resolve(values(entries))
    })

    return deferred
  }
}
