/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const series = require('async/series')

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.name-pubsub', () => {
  let ipfs
  let ipfsd
  let otherd

  before(function (done) {
    this.timeout(30 * 1000)

    series([
      (cb) => {
        f.spawn({
          initOptions: { bits: 1024 },
          args: ['--enable-namesys-pubsub']
        }, (err, _ipfsd) => {
          expect(err).to.not.exist()
          ipfsd = _ipfsd
          ipfs = IPFSApi(_ipfsd.apiAddr)
          cb()
        })
      },
      (cb) => {
        f.spawn({ initOptions: { bits: 1024 } }, (err, node) => {
          expect(err).to.not.exist()
          otherd = node
          cb()
        })
      }
    ], done)
  })

  after(function (done) {
    this.timeout(10 * 1000)

    parallel([
      (cb) => {
        if (!ipfsd) return cb()
        ipfsd.stop(cb)
      },
      (cb) => {
        if (!otherd) return cb()
        otherd.stop(cb)
      }
    ], done)
  })

  it('.name.pubsub.state', (done) => {
    ipfs.name.pubsub.state((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res).to.have.property('enabled')
      expect(res.enabled).to.be.eql(true)
      done()
    })
  })

  it('.name.pubsub.subs', (done) => {
    ipfs.name.pubsub.subs((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res).to.have.property('strings')
      done()
    })
  })

  it('.name.pubsub.cancel', (done) => {
    ipfs.name.pubsub.cancel('QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res).to.have.property('canceled')
      done()
    })
  })
})
