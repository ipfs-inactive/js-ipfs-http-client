/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const isNode = require('detect-node')
const CommonFactory = require('./utils/interface-common-factory')
const IPFSApi = require('../src')
const isWindows = process.platform && process.platform === 'win32'

describe('interface-ipfs-core tests', () => {
  const defaultCommonFactory = CommonFactory.create()

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory)

  tests.dag(defaultCommonFactory, {
    skip: [
      // dag.tree
      // TODO vmx 2018-02-22: Currently the tree API is not exposed in go-ipfs
      'tree',
      // dag.get:
      // FIXME vmx 2018-02-22: Currently not supported in go-ipfs, it might
      // be possible once https://github.com/ipfs/go-ipfs/issues/4728 is
      // done
      'should get a dag-pb node local value',
      'should get dag-pb value via dag-cbor node',
      'should get by CID string + path',
      // dag.put
      // FIXME This works in go-ipfs because dag-pb will serialize any object. If
      // the object has neither a `data` nor `links` field it's serialized
      // as an empty object
      'should not put dag-cbor node with wrong multicodec'
    ]
  })

  tests.dht(defaultCommonFactory, {
    skip: [
      // dht.findpeer
      // FIXME checking what is exactly go-ipfs returning
      // https://github.com/ipfs/go-ipfs/issues/3862#issuecomment-294168090
      'should fail to find other peer if peer does not exist',
      // dht.findprovs
      // FIXME go-ipfs endpoint doesn't conform with the others
      // https://github.com/ipfs/go-ipfs/issues/5047
      'should provide from one node and find it through another node',
      // dht.get
      // FIXME go-ipfs errors with  Error: key was not found (type 6)
      // https://github.com/ipfs/go-ipfs/issues/3862
      'should get a value after it was put on another node'
    ]
  })

  tests.files(defaultCommonFactory, {
    skip: [
      // files.add
      // FIXME https://github.com/ipfs/js-ipfs-api/issues/339
      isNode ? null : 'should add a nested directory as array of tupples',
      isNode ? null : 'should add a nested directory as array of tupples with progress',
      // files.addPullStream
      // FIXME https://github.com/ipfs/js-ipfs-api/issues/339
      isNode ? null : 'should add pull stream of valid files and dirs',
      // files.addReadableStream
      // FIXME https://github.com/ipfs/js-ipfs-api/issues/339
      isNode ? null : 'should add readable stream of valid files and dirs',
      // files.catPullStream
      // TODO not implemented in go-ipfs yet
      'should export a chunk of a file',
      'should export a chunk of a file in a Pull Stream',
      'should export a chunk of a file in a Readable Stream',
      // files.get
      // FIXME https://github.com/ipfs/js-ipfs-api/issues/339
      isNode ? null : 'should get a directory'
    ]
  })

  tests.key(defaultCommonFactory, {
    skip: [
      // key.export
      // TODO not implemented in go-ipfs yet
      'export',
      // key.import
      // TODO not implemented in go-ipfs yet
      'import'
    ]
  })

  tests.ls(defaultCommonFactory, {
    skip: [
      // lsPullStream
      // FIXME https://github.com/ipfs/js-ipfs-api/issues/339
      isNode ? null : 'should pull stream ls with a base58 encoded CID',
      // lsReadableStream
      // FIXME https://github.com/ipfs/js-ipfs-api/issues/339
      isNode ? null : 'should readable stream ls with a base58 encoded CID',
      // ls
      // FIXME https://github.com/ipfs/js-ipfs-api/issues/339
      isNode ? null : 'should ls with a base58 encoded CID'
    ]
  })

  tests.miscellaneous(defaultCommonFactory, {
    skip: [
      // stop
      // FIXME go-ipfs returns an error https://github.com/ipfs/go-ipfs/issues/4078
      'should stop the node'
    ]
  })

  tests.object(defaultCommonFactory)

  tests.pin(defaultCommonFactory)

  tests.ping(defaultCommonFactory)

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { bits: 1024 }
    }
  }), {
    skip: isNode ? [
      // pubsub.subscribe
      // FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246
      // and https://github.com/ipfs/go-ipfs/issues/4778
      isWindows ? 'should send/receive 100 messages' : null,
      isWindows ? 'should receive multiple messages' : null
    ] : true
  })

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

  tests.types(defaultCommonFactory, { skip: true })

  tests.util(defaultCommonFactory, { skip: true })
})
