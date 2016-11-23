'use strict'

const promisify = require('promisify-es6')
const PubsubMessageStream = require('../pubsub-message-stream')
const stringlistToArray = require('../stringlist-to-array')

/* Internal subscriptions state and functions */
let subscriptions = {}

const addSubscription = (topic, request) => {
  subscriptions[topic] = { request: request }
}

const removeSubscription = promisify((topic, callback) => {
  if (!subscriptions[topic]) {
    return callback(new Error(`Not subscribed to ${topic}`))
  }

  subscriptions[topic].request.abort()
  delete subscriptions[topic]

  if (callback) {
    callback(null)
  }
})

/* Public API */
module.exports = (send) => {
  return {
    subscribe: promisify((topic, options, callback) => {
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

      // If we're already subscribed, return an error
      if (subscriptions[topic]) {
        return callback(new Error(`Already subscribed to '${topic}'`))
      }

      // Request params
      const request = {
        path: 'pubsub/sub',
        args: [topic],
        qs: { discover: options.discover }
      }

      // Start the request and transform the response stream to Pubsub messages stream
      const req = send.andTransform(request, PubsubMessageStream.from, (err, stream) => {
        if (err) {
          return callback(err)
        }
        // Add a cancel method to the stream so that the subscription can be cleanly cancelled
        stream.cancel = promisify((cb) => removeSubscription(topic, cb))
        // Add the request to the active subscriptions and return the stream
        addSubscription(topic, req)
        callback(null, stream)
      })
    }),
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
    })
  }
}
