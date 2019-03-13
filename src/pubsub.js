'use strict'

const promisify = require('promisify-es6')
const EventEmitter = require('events')
const eos = require('end-of-stream')
const isNode = require('detect-node')
const setImmediate = require('async/setImmediate')
const PubsubMessageStream = require('./utils/pubsub-message-stream')
const stringlistToArray = require('./utils/stringlist-to-array')
const moduleConfig = require('./utils/module-config')

const NotSupportedError = () => new Error('pubsub is currently not supported when run in the browser')

/* Public API */
module.exports = (arg) => {
  const send = moduleConfig(arg)

  /* Internal subscriptions state and functions */
  const ps = new EventEmitter()
  const subscriptions = {}
  ps.id = Math.random()
  return {
    subscribe: (topic, handler, options, callback) => {
      const defaultOptions = {
        discover: false
      }

      if (typeof options === 'function') {
        callback = options
        options = defaultOptions
      }

      if (!options) {
        options = defaultOptions
      }

      // Throw an error if ran in the browsers
      if (!isNode) {
        if (!callback) {
          return Promise.reject(NotSupportedError())
        }

        return setImmediate(() => callback(NotSupportedError()))
      }

      // promisify doesn't work as we always pass a
      // function as last argument (`handler`)
      if (!callback) {
        return new Promise((resolve, reject) => {
          subscribe(topic, handler, options, (err) => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        })
      }

      subscribe(topic, handler, options, callback)
    },
    unsubscribe: (topic, handler, callback) => {
      if (!isNode) {
        if (!callback) {
          return Promise.reject(NotSupportedError())
        }

        return setImmediate(() => callback(NotSupportedError()))
      }

      if (ps.listenerCount(topic) === 0 || !subscriptions[topic]) {
        const err = new Error(`Not subscribed to '${topic}'`)

        if (!callback) {
          return Promise.reject(err)
        }

        return setImmediate(() => callback(err))
      }

      if (!handler && !callback) {
        ps.removeAllListeners(topic)
      } else {
        ps.removeListener(topic, handler)
      }

      // Drop the request once we are actually done
      if (ps.listenerCount(topic) === 0) {
        if (!callback) {
          return new Promise((resolve, reject) => {
            // When the response stream has ended, resolve the promise
            eos(subscriptions[topic].res, (err) => {
              // FIXME: Artificial timeout needed to ensure unsubscribed
              setTimeout(() => {
                if (err) return reject(err)
                resolve()
              })
            })
            subscriptions[topic].req.abort()
            subscriptions[topic] = null
          })
        }

        // When the response stream has ended, call the callback
        eos(subscriptions[topic].res, (err) => {
          // FIXME: Artificial timeout needed to ensure unsubscribed
          setTimeout(() => callback(err))
        })
        subscriptions[topic].req.abort()
        subscriptions[topic] = null
        return
      }

      if (!callback) {
        return Promise.resolve()
      }

      setImmediate(() => callback())
    },
    publish: promisify((topic, data, callback) => {
      if (!isNode) {
        return callback(NotSupportedError())
      }

      if (!Buffer.isBuffer(data)) {
        return callback(new Error('data must be a Buffer'))
      }

      const request = {
        path: 'pubsub/pub',
        args: [topic, data]
      }

      send(request, callback)
    }),
    ls: promisify((callback) => {
      if (!isNode) {
        return callback(NotSupportedError())
      }

      const request = {
        path: 'pubsub/ls'
      }

      send.andTransform(request, stringlistToArray, callback)
    }),
    peers: promisify((topic, callback) => {
      if (!isNode) {
        return callback(NotSupportedError())
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

  function subscribe (topic, handler, options, callback) {
    ps.on(topic, handler)

    if (subscriptions[topic]) {
      // TODO: should a callback error be returned?
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
    subscriptions[topic] = {}
    subscriptions[topic].req = send.andTransform(request, PubsubMessageStream.from, (err, stream) => {
      if (err) {
        subscriptions[topic] = null
        ps.removeListener(topic, handler)
        return callback(err)
      }

      subscriptions[topic].res = stream

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
        ps.removeListener(topic, handler)
      })

      callback()
    })
  }
}
