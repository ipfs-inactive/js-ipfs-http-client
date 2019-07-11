/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const { DAGNode } = require('ipld-dag-pb')
const CID = require('cids')
const ipfsClient = require('../src')
const f = require('./utils/factory')

let ipfsd
let ipfs

describe('.dag', function () {
  this.timeout(20 * 1000)
  before(function (done) {
    series([
      (cb) => f.spawn({ initOptions: { bits: 1024, profile: 'test' } }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        ipfs = ipfsClient(_ipfsd.apiAddr)
        cb()
      })
    ], done)
  })

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  it('should be able to put and get a DAG node with format dag-pb', (done) => {
    const data = Buffer.from('some data')
    const node = DAGNode.create(data)

    ipfs.dag.put(node, { format: 'dag-pb', hashAlg: 'sha2-256' }, (err, cid) => {
      expect(err).to.not.exist()
      cid = cid.toV0()
      expect(cid.codec).to.equal('dag-pb')
      cid = cid.toBaseEncodedString('base58btc')
      // expect(cid).to.equal('bafybeig3t3eugdchignsgkou3ly2mmy4ic4gtfor7inftnqn3yq4ws3a5u')
      expect(cid).to.equal('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
      ipfs.dag.get(cid, (err, result) => {
        expect(err).to.not.exist()
        expect(result.value.Data).to.deep.equal(data)
        done()
      })
    })
  })

  it('should be able to put and get a DAG node with format dag-cbor', (done) => {
    const cbor = { foo: 'dag-cbor-bar' }
    ipfs.dag.put(cbor, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
      expect(err).to.not.exist()
      expect(cid.codec).to.equal('dag-cbor')
      cid = cid.toBaseEncodedString('base32')
      expect(cid).to.equal('bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce')
      ipfs.dag.get(cid, (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.deep.equal(cbor)
        done()
      })
    })
  })

  it('should callback with error when missing DAG resolver for multicodec from requested CID', (done) => {
    ipfs.block.put(Buffer.from([0, 1, 2, 3]), {
      cid: new CID('z8mWaJ1dZ9fH5EetPuRsj8jj26pXsgpsr')
    }, (err, block) => {
      expect(err).to.not.exist()

      ipfs.dag.get(block.cid, (err, result) => {
        expect(result).to.not.exist()
        expect(err.message).to.equal('Missing IPLD format "git-raw"')
        done()
      })
    })
  })
})
