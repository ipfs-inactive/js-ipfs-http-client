'use strict'

const promisify = require('promisify-es6')
const EventEmitter = require('events')
const eos = require('end-of-stream')
const PubsubMessageStream = require('../pubsub-message-stream')
const stringlistToArray = require('../stringlist-to-array')

/* Internal subscriptions state and functions */
const ps = new EventEmitter()
const subscriptions = {}

/* Public API */
module.exports = (send) => {
  return {
    subscribe: (topic, options, handler, callback) => {
      const defaultOptions = {
        discover: false
      }

      if (typeof options === 'function') {
        callback = handler
        handler = options
        options = defaultOptions
      }

      if (!options) {
        options = defaultOptions
      }

      // promisify doesn't work as we always pass a
      // function as last argument (`handler`)
      if (!callback) {
        return new Promise((resolve, reject) => {
          subscribe(topic, options, handler, (err) => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        })
      }

      subscribe(topic, options, handler, callback)
    },
    unsubscribe (topic, handler) {
      ps.removeListener(topic, handler)
      if (ps.listenerCount(topic) === 0) {
        subscriptions[topic].abort()
      }
    },
    publish: promisify((topic, data, callback) => {
      const buf = Buffer.isBuffer(data) ? data : new Buffer(data)

      const request = {
        path: 'pubsub/pub',
        args: [topic, buf]
      }

      send(request, callback)
    }),
    ls: promisify((callback) => {
      const request = {
        path: 'pubsub/ls'
      }

      send.andTransform(request, stringlistToArray, callback)
    }),
    peers: promisify((topic, callback) => {
      if (!subscriptions[topic]) {
        return callback(new Error(`Not subscribed to '${topic}'`))
      }

      const request = {
        path: 'pubsub/peers',
        args: [topic]
      }

      send.andTransform(request, stringlistToArray, callback)
    }),
    setMaxListeners (n) {
      return ps.setMaxListeners(n)
    }
  }

  function subscribe (topic, options, handler, callback) {
    ps.on(topic, handler)

    if (subscriptions[topic]) {
      return callback()
    }

    // Request params
    const request = {
      path: 'pubsub/sub',
      args: [topic],
      qs: {
        discover: options.discover
      }
    }

    // Start the request and transform the response
    // stream to Pubsub messages stream
    subscriptions[topic] = send.andTransform(request, PubsubMessageStream.from, (err, stream) => {
      if (err) {
        subscriptions[topic] = null
        return callback(err)
      }

      stream.on('data', (msg) => {
        ps.emit(topic, msg)
      })

      stream.on('error', (err) => {
        ps.emit('error', err)
      })

      eos(stream, (err) => {
        if (err) {
          ps.emit('error', err)
        }

        subscriptions[topic] = null
      })

      callback()
    })
  }
}
