'use strict'

const pump = require('pump')
const through = require('through2')
const promisify = require('promisify-es6')
const PeerId = require('peer-id')

module.exports = (send) => {
  return {
    pub: promisify((topic, payload, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'pubsub/pub',
        args: [topic, payload],
        qs: opts
      }, callback)
    }),
    ls: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'pubsub/ls',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        if (result.Strings) {
          callback(null, result.Strings.map((topic) => {
            return topic
          }))
        } else {
          callback(null, [])
        }
      })
    }),
    peers: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'pubsub/peers',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        if (result.Strings) {
          callback(null, result.Strings.map((topic) => {
            return topic
          }))
        } else {
          callback(null, [])
        }
      })
    }),
    sub: promisify((topic, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      return send({
        path: 'pubsub/sub',
        args: topic,
        qs: opts
      }, (err, response) => {
        if (err) {
          return callback(err)
        }
        const outputStream = pump(response, through.obj(opts, (obj, enc, cb) => {
          if (obj.from) {
            obj.from = PeerId.createFromBytes(new Buffer(obj.from, 'base64')).toB58String()
          }
          if (obj.data) {
            obj.data = new Buffer(obj.data, 'base64')
          }
          if (obj.seqno) {
            const buffer = new Buffer(obj.seqno, 'base64')
            obj.seqno = buffer.readUIntBE(0, buffer.length)
          }
          cb(null, obj)
        }))
        callback(null, outputStream)
      })
    })
  }
}
