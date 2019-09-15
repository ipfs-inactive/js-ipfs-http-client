/* eslint-env mocha */
'use strict'

const each = require('async/each')
const IPFSFactory = require('ipfsd-ctl')
const ipfsClient = require('../../src')

function createFactory (options) {
  options = options || {}

  options.factoryOptions = options.factoryOptions || { IpfsClient: ipfsClient }
  options.spawnOptions = options.spawnOptions || { initOptions: { bits: 1024, profile: 'test' } }

  const ipfsFactory = IPFSFactory.create(options.factoryOptions)

  return function createCommon () {
    const nodes = []
    let setup, teardown

    if (options.createSetup) {
      setup = options.createSetup({ ipfsFactory, nodes }, options)
    } else {
      setup = (callback) => {
        callback(null, {
          spawnNode (cb) {
            console.log('TCL: spawnNode -> spawn')
            ipfsFactory.spawn(options.spawnOptions)
              .then((ipfsd) => {
                nodes.push(ipfsd)
                console.log('TCL: spawnNode -> ipfsd', ipfsd._apiAddr.toString())
                console.log('TCL: spawnNode -> ipfsd', ipfsd.initialized)
                console.log('TCL: spawnNode -> ipfsd', ipfsd.started)

                setImmediate(() => cb(null, ipfsd.api))
              })
              .catch(err => {
                console.log('TCL: spawnNode -> err', err)
                setImmediate(() => cb(err))
              })
          }
        })
      }
    }

    if (options.createTeardown) {
      teardown = options.createTeardown({ ipfsFactory, nodes }, options)
    } else {
      teardown = callback => each(nodes, (node, cb) => node.stop().then(cb, cb), callback)
    }

    return { setup, teardown }
  }
}

exports.create = createFactory
