/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('.log', function () {
  this.timeout(100 * 1000)

  let ipfsd

  before((done) => {
    df.spawn((err, node) => {
      expect(err).to.not.exist()
      ipfsd = node
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('Callback API', function () {
    this.timeout(100 * 1000)

    it('.log.tail', (done) => {
      const req = ipfsd.api.log.tail((err, res) => {
        expect(err).to.not.exist()
        expect(req).to.exist()

        res.once('data', (obj) => {
          expect(obj).to.be.an('object')
          done()
        })
      })
    })

    it('.log.ls', (done) => {
      ipfsd.api.log.ls((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        expect(res).to.be.an('array')

        done()
      })
    })

    it('.log.level', (done) => {
      ipfsd.api.log.level('all', 'error', (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        expect(res).to.be.an('object')
        expect(res).to.not.have.property('Error')
        expect(res).to.have.property('Message')

        done()
      })
    })
  })

  describe('Promise API', function () {
    this.timeout(100 * 1000)

    it('.log.tail', () => {
      return ipfsd.api.log.tail()
        .then((res) => {
          res.once('data', (obj) => {
            expect(obj).to.be.an('object')
          })
        })
    })

    it('.log.ls', () => {
      return ipfsd.api.log.ls()
        .then((res) => {
          expect(res).to.exist()

          expect(res).to.be.an('array')
        })
    })

    it('.log.level', () => {
      return ipfsd.api.log.level('all', 'error')
        .then((res) => {
          expect(res).to.exist()

          expect(res).to.be.an('object')
          expect(res).to.not.have.property('Error')
          expect(res).to.have.property('Message')
        })
    })
  })
})
