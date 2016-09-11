'use strict'

const promisify = require('promisify-es6')
const bs58 = require('bs58')
const Base64 = require('js-base64').Base64
const Stream = require('stream')
const Readable = Stream.Readable
const http = require('http')

let activeSubscriptions = []

const subscriptionExists = (subscriptions, topic) => {
  return subscriptions.indexOf(topic) !== -1
}
const removeSubscription = (subscriptions, topic) => {
  const indexToRemove = subscriptions.indexOf(topic)
  return subscriptions.filter((el, index) => {
    return index !== indexToRemove
  })
}
const addSubscription = (subscriptions, topic) => {
  return subscriptions.concat([topic])
}
const parseMessage = (message) => {
  return Object.assign({}, message, {
    from: bs58.encode(message.from),
    data: Base64.decode(message.data),
    seqno: Base64.decode(message.seqno)
  })
}

module.exports = (send, config) => {
  return {
    subscribe: (topic, options) => {
      if (!options) {
        options = {}
      }

      var rs = new Readable({objectMode: true})
      rs._read = () => {}

      if (!subscriptionExists(activeSubscriptions, topic)) {
        activeSubscriptions = addSubscription(activeSubscriptions, topic)
      } else {
        throw new Error('Already subscribed to ' + topic)
      }

      let url = '/api/v0/pubsub/sub/' + topic
      if (options.discover) {
        url = url + '?discover=true'
      }
      // we're using http.get here to have more control over the request
      // and avoid refactoring of the request-api where wreck is gonna be
      // replaced by fetch (https://github.com/ipfs/js-ipfs-api/pull/355)
      const request = http.get({
        host: config.host,
        port: config.port,
        path: url
      }, (response) => {
        response.on('data', function (d) {
          let data
          try {
            data = JSON.parse(d)
          } catch (err) {
            return rs.emit('error', err)
          }

          // skip "double subscription" error
          if (!data.Message) {
            rs.emit('data', parseMessage(data))
          }
        })
        response.on('end', function () {
          rs.emit('end')
        })
      })
      rs.cancel = () => {
        request.abort()
        activeSubscriptions = removeSubscription(activeSubscriptions, topic)
      }
      return rs
    },
    publish: promisify((topic, data, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      const isBuffer = Buffer.isBuffer(data)
      const buf = isBuffer ? data : new Buffer(data)

      send({
        path: 'pubsub/pub',
        args: [topic, buf]
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, true)
      })
    })
  }
}
