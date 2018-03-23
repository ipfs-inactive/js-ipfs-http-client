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

describe.only('.ping', () => {
  let ipfs
  let ipfsd
  let other
  let otherd

  before(function (done) {
    this.timeout(20 * 1000) // slow CI

    series([
      (cb) => {
        f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
          expect(err).to.not.exist()
          ipfsd = _ipfsd
          ipfs = IPFSApi(_ipfsd.apiAddr)
          cb()
        })
      },
      (cb) => {
        console.log('going to spawn second node')
        f.spawn({ initOptions: { bits: 1024 } }, (err, node) => {
          expect(err).to.not.exist()
          other = node.api
          otherd = node
          cb()
        })
      },
      (cb) => {
        ipfsd.api.id((err, id) => {
          expect(err).to.not.exist()
          const ma = id.addresses[0]
          other.swarm.connect(ma, cb)
        })
      }
    ], done)
  })

  after((done) => {
    parallel([
      (cb) => ipfsd.stop(cb),
      (cb) => otherd.stop(cb)
    ], done)
  })

  describe('callback API', () => {
    it('ping another peer', (done) => {
      other.id((err, id) => {
        expect(err).to.not.exist()

        ipfs.ping(id.id, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.be.an('array')
          expect(res).to.have.lengthOf(3)
					res.forEach(packet => {
						expect(packet).to.have.keys('Success', 'Time', 'Text')
						expect(packet.Time).to.be.a('number')
					})
					const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
          done()
        })
      })
    })
  })

  describe('promise API', () => {
    it('ping another peer', () => {
      return other.id()
        .then((id) => {
          return ipfs.ping(id.id)
        })
        .then((res) => {
          expect(res).to.be.an('array')
          expect(res).to.have.lengthOf(3)
					res.forEach(packet => {
						expect(packet).to.have.keys('Success', 'Time', 'Text')
						expect(packet.Time).to.be.a('number')
					})
					const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
        })
    })
  })
})
