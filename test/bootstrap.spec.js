/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')
const f = require('./utils/factory')

const invalidArg = 'this/Is/So/Invalid/'
const validIp4 = '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'

describe('.bootstrap', function () {
  this.timeout(100 * 1000)

  let ipfsd
  let ipfs

  before((done) => {
    f.spawn((err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  let peers

  describe('.add', () => {
    it('returns an error when called with an invalid arg', (done) => {
      ipfs.bootstrap.add(invalidArg, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('returns a list of containing the bootstrap peer when called with a valid arg (ip4)', (done) => {
      ipfs.bootstrap.add(validIp4, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.eql({ Peers: [validIp4] })
        peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(1)
        done()
      })
    })

    it('returns a list of bootstrap peers when called with the default option', (done) => {
      ipfs.bootstrap.add({ default: true }, (err, res) => {
        expect(err).to.not.exist()
        peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.above(1)
        done()
      })
    })
  })

  describe('.list', () => {
    it('returns a list of peers', (done) => {
      ipfs.bootstrap.list((err, res) => {
        expect(err).to.not.exist()
        peers = res.Peers
        expect(peers).to.exist()
        done()
      })
    })
  })

  describe('.rm', () => {
    it('returns an error when called with an invalid arg', (done) => {
      ipfs.bootstrap.rm(invalidArg, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('returns empty list because no peers removed when called without an arg or options', (done) => {
      ipfs.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist()
        peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('returns list containing the peer removed when called with a valid arg (ip4)', (done) => {
      ipfs.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist()
        peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('returns list of all peers removed when all option is passed', (done) => {
      ipfs.bootstrap.rm(null, { all: true }, (err, res) => {
        expect(err).to.not.exist()
        peers = res.Peers
        expect(peers).to.exist()
        done()
      })
    })
  })
})
