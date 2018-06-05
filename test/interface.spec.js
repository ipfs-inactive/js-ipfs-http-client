/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('./utils/interface-common-factory')
const IPFSApi = require('../src')

describe('interface-ipfs-core tests', () => {
  const defaultCommonFactory = CommonFactory.create()

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory)

  tests.dag(defaultCommonFactory, {
    skip: [
      // dag.tree
      //
      // FIXME vmx 2018-02-22: Currently the tree API is not exposed in go-ipfs
      'tree',
      // dag.get:
      //
      // FIXME vmx 2018-02-22: Currently not supported in go-ipfs, it might
      // be possible once https://github.com/ipfs/go-ipfs/issues/4728 is
      // done
      'should get a dag-pb node local value',
      'should get dag-pb value via dag-cbor node',
      'should get by CID string + path',
      // dag.put
      //
      // FIXME This works in go-ipfs because dag-pb will serialize any object. If
      // the object has neither a `data` nor `links` field it's serialized
      // as an empty object
      'should not put dag-cbor node with wrong multicodec'
    ]
  })

  tests.dht(defaultCommonFactory, {
    skip: [
      // dht.findpeer
      //
      // FIXME checking what is exactly go-ipfs returning
      // https://github.com/ipfs/go-ipfs/issues/3862#issuecomment-294168090
      'should fail to find other peer if peer does not exist',
      // dht.findprovs
      //
      // FIXME go-ipfs endpoint doesn't conform with the others
      // https://github.com/ipfs/go-ipfs/issues/5047
      'should provide from one node and find it through another node',
      // dht.get
      //
      // FIXME go-ipfs errors with  Error: key was not found (type 6)
      // https://github.com/ipfs/go-ipfs/issues/3862
      'should get a value after it was put on another node'
    ]
  })

  tests.files(defaultCommonFactory)

  tests.generic(CommonFactory.create({
    // No need to stop, because the test suite does a 'stop' test.
    createTeardown: cb => cb()
  }))

  tests.key(defaultCommonFactory)

  tests.object(defaultCommonFactory)

  tests.ping(defaultCommonFactory)

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { bits: 1024 }
    }
  }))

  tests.repo(defaultCommonFactory)

  tests.stats(defaultCommonFactory)

  tests.swarm(CommonFactory.create({
    createSetup ({ ipfsFactory, nodes }) {
      return callback => {
        callback(null, {
          spawnNode (repoPath, config, cb) {
            if (typeof repoPath === 'function') {
              cb = repoPath
              repoPath = undefined
            }

            if (typeof config === 'function') {
              cb = config
              config = undefined
            }

            const spawnOptions = { repoPath, config, initOptions: { bits: 1024 } }

            ipfsFactory.spawn(spawnOptions, (err, _ipfsd) => {
              if (err) {
                return cb(err)
              }

              nodes.push(_ipfsd)
              cb(null, IPFSApi(_ipfsd.apiAddr))
            })
          }
        })
      }
    }
  }))
})
