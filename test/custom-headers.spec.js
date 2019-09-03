/* eslint-env mocha */
'use strict'

const isNode = require('detect-node')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('custom headers', function () {
  // do not test in browser
  if (!isNode) { return }
  this.timeout(50 * 1000) // slow CI
  let ipfs
  let ipfsd
  // initialize ipfs with custom headers
  before(async () => {
    ipfsd = await f.spawn({
      initOptions: {
        bits: 1024,
        profile: 'test'
      }
    })

    ipfs = ipfsClient({
      host: 'localhost',
      port: 6001,
      protocol: 'http',
      headers: {
        authorization: 'Bearer ' + 'YOLO'
      }
    })
  })

  it('are supported', (done) => {
    // spin up a test http server to inspect the requests made by the library
    const server = require('http').createServer((req, res) => {
      req.on('data', () => {})
      req.on('end', () => {
        res.writeHead(200)
        res.end()
        // ensure custom headers are present
        expect(req.headers.authorization).to.equal('Bearer ' + 'YOLO')
        server.close()
        done()
      })
    })

    server.listen(6001, () => {
      ipfs.id((err, res) => {
        if (err) {
          throw new Error('Unexpected error.')
        }
        // this call is used to test that headers are being sent.
      })
    })
  })

  after(async () => {
    if (ipfsd) {
      await ipfsd.stop()
    }
  })
})
