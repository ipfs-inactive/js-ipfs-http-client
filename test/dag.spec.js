/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const CID = require('cids')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.dag', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs
  let ipfsd

  const obj = {
    a: 1,
    b: [1, 2, 3],
    c: {
      ca: [5, 6, 7],
      cb: 'foo'
    }
  }

  before((done) => {
    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  describe('.dag.tree', () => {
    it('should return all the paths', (done) => {
      const expectedPaths = [
        'a', 'b', 'b/0', 'b/1', 'b/2', 'c', 'c/ca',
        'c/ca/0', 'c/ca/1', 'c/ca/2', 'c/cb'
      ]
      ipfs.dag.put(obj, (err, cid) => {
        expect(err).to.not.exist()
        ipfs.dag.tree(cid, (err, paths) => {
          expect(err).to.not.exist()
          expect(paths).deep.equal(expectedPaths)
          done()
        })
      })
    })

    it('should return error when codec for cid is invalid', (done) => {
      let cid = new CID('zdpuArMWc9Ee3B7zUDucRjvA1bDgYpWt8rpUXXjY3tbmBw619')
      cid.codec = 'invalid-codec'
      ipfs.dag.tree(cid, (err, paths) => {
        expect(err).to.exist()
        done()
      })
    })
  })

  it('.dag.put', (done) => {
    let expectedCidStr = 'zdpuArMWc9Ee3B7zUDucRjvA1bDgYpWt8rpUXXjY3tbmBw619'
    ipfs.dag.put(obj, (err, cid) => {
      expect(err).to.not.exist()
      let cidStr = cid.toBaseEncodedString()
      expect(cidStr).to.be.equal(expectedCidStr)
      done()
    })
  })

  it('.dag.get', (done) => {
    ipfs.dag.put(obj, (err, cid) => {
      expect(err).to.not.exist()
      ipfs.dag.get(cid, (err, data) => {
        expect(err).to.not.exist()
        expect(data.value).deep.equal(obj)
        done()
      })
    })
  })
})
