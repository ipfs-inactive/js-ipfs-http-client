'use strict'

const pullError = require('pull-stream/sources/error')
const pullValues = require('pull-stream/sources/values')
const pullDefer = require('pull-defer')
const refs = require('./refs')

module.exports = (arg) => {
  const refsFn = refs(arg)

  return (args, opts) => {
    const p = pullDefer.source()

    refsFn(args, opts, (err, res) => {
      if (err) {
        return p.resolve(pullError(err))
      }
      p.resolve(pullValues(res))
    })

    return p
  }
}
