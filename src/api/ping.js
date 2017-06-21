'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../stream-to-value')

module.exports = (send) => {
  return promisify((id, callback) => {
    const request = {
      path: 'ping',
      args: id,
      qs: { n: 1 }
    }

    // Transform the response stream to a value:
    // { Success: <boolean>, Time: <number>, Text: <string> }
    const transform = (res, callback) => {
      streamToValue(res, (err, res) => {
        if (err) {
          return callback(err)
        }

        // go-ipfs http api currently returns 3 lines for a ping.
        // they're a little messed, so take the correct values from each lines.
        const Success = res[1].Success
        const Time = res[1].Time
        const Text = res.length > 2 ? res[2].Text : res[1].Text

        const pingResult = {
          Success: Success,
          Time: Time,
          Text: Text
        }

        callback(null, pingResult)
      })
    }

    send.andTransform(request, transform, callback)
  })
}
