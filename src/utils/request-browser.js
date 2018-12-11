'use strict'

const http = require('stream-http')

module.exports = (protocol) => {
  return http.request
}
