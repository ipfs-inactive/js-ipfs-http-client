'use strict'

const Stream = require('readable-stream')
const refs = require('./refs')

module.exports = (arg) => {
  const refsFn = refs(arg)

  return (args, opts) => {
    const pt = new Stream.PassThrough({ objectMode: true })

    refsFn(args, opts, (err, res) => {
      if (err) {
        return pt.emit('error', err)
      }
      res.forEach((item) => pt.write(item))
      pt.end()
    })

    return pt
  }
}
