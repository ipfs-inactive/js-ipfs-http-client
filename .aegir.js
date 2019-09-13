'use strict'

const promisify = require('promisify-es6')
const createServer = require('ipfsd-ctl').createServer
const EchoServer = require('interface-ipfs-core/src/utils/echo-http-server')
const server = createServer()
const echoServer = EchoServer.createServer()

const echoServeStart = promisify(echoServer.start)
const echoServeStop = promisify(echoServer.stop)
module.exports = {
  bundlesize: { maxSize: '245kB' },
  webpack: {
    resolve: {
      mainFields: ['browser', 'main']
    }
  },
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 210 * 1000,
    singleRun: true
  },
  hooks: {
    node: {
      pre: () => echoServeStart(),
      post: () => echoServeStop()
    },
    browser: {
      pre: () => {
        return Promise.all([
          server.start(),
          echoServeStart()

        ])
      },
      post: () => {
        return Promise.all([
          server.stop(),
          echoServeStop()
        ])
      }
    }
  }
}
