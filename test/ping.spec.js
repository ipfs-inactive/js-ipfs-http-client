/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const pull = require('pull-stream')
const collect = require('pull-stream/sinks/collect')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const series = require('async/series')

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.ping', function () {
  let ipfs
  let ipfsd
  let other
  let otherd
  let otherId

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
      },
      (cb) => {
        other.id((err, id) => {
          expect(err).to.not.exist()
          otherId = id.id
          cb()
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

  it('.ping with default n', (done) => {
    ipfs.ping(otherId, (err, res) => {
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

  it('.ping with count = 2', (done) => {
    ipfs.ping(otherId, { count: 2 }, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.be.an('array')
      expect(res).to.have.lengthOf(4)
      res.forEach(packet => {
        expect(packet).to.have.keys('Success', 'Time', 'Text')
        expect(packet.Time).to.be.a('number')
      })
      const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
      expect(resultMsg).to.exist()
      done()
    })
  })

  it('.ping with n = 2', (done) => {
    ipfs.ping(otherId, { n: 2 }, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.be.an('array')
      expect(res).to.have.lengthOf(4)
      res.forEach(packet => {
        expect(packet).to.have.keys('Success', 'Time', 'Text')
        expect(packet.Time).to.be.a('number')
      })
      const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
      expect(resultMsg).to.exist()
      done()
    })
  })

  it('.ping fails with count & n', function (done) {
    this.timeout(20 * 1000)

    ipfs.ping(otherId, {count: 2, n: 2}, (err, res) => {
      expect(err).to.exist()
      done()
    })
  })

  it('.ping with Promises', () => {
    return ipfs.ping(otherId)
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

  it('.pingPullStream', (done) => {
    pull(
      ipfs.pingPullStream(otherId),
      collect((err, data) => {
        expect(err).to.not.exist()
        expect(data).to.be.an('array')
        expect(data).to.have.lengthOf(3)
        data.forEach(packet => {
          expect(packet).to.have.keys('Success', 'Time', 'Text')
          expect(packet.Time).to.be.a('number')
        })
        const resultMsg = data.find(packet => packet.Text.includes('Average latency'))
        expect(resultMsg).to.exist()
        done()
      })
    )
  })

  it('.pingReadableStream', (done) => {
    let packetNum = 0
    ipfs.pingReadableStream(otherId)
      .on('data', data => {
        expect(data).to.be.an('object')
        expect(data).to.have.keys('Success', 'Time', 'Text')
        packetNum++
      })
      .on('error', err => {
        expect(err).not.to.exist()
      })
      .on('end', () => {
        expect(packetNum).to.be.above(2)
        done()
      })
  })
})
