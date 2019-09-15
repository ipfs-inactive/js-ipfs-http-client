/* eslint-env mocha */
'use strict'

const each = require('async/each')
const IPFSFactory = require('ipfsd-ctl')
const ipfsClient = require('../../src')
const merge = require('merge-options')

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
      teardown = callback => each(nodes, (node, cb) => {
        node
          .stop()
          .then(() => setImmediate(() => cb()))
          .catch(err => setImmediate(() => cb(err)))
      }, callback)
    }

    return { setup, teardown }
  }
}

exports.create = createFactory

function create2 (createFactoryOptions, createSpawnOptions) {
  return () => {
    const nodes = []
    const setup = async (factoryOptions = {}, spawnOptions) => {
      const ipfsFactory = IPFSFactory.create(merge(
        { IpfsClient: ipfsClient },
        factoryOptions,
        createFactoryOptions
      ))
      const node = await ipfsFactory.spawn(merge(
        { initOptions: { profile: 'test' } },
        spawnOptions,
        createSpawnOptions
      ))
      nodes.push(node)

      const id = await node.api.id()
      node.api.peerId = id

      console.log('spawned', id.id)
      return node.api
    }

    const teardown = () => {
      return Promise.all(nodes.map(n => n.stop()))
    }
    return {
      setup,
      teardown
    }
  }
}

exports.create2 = create2
