/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const series = require('async/series')
const loadFixture = require('aegir/fixtures')
const FactoryClient = require('./ipfs-factory/client')

const testfile = isNode
  ? loadFixture(__dirname, '/fixtures/testfile.txt')
  : loadFixture(__dirname, 'fixtures/testfile.txt')

describe('.name', () => {
  let ipfs
  let other
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    series([
      (cb) => {
        fc.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfs = node
          cb()
        })
      },
      (cb) => {
        fc.spawnNode((err, node) => {
          expect(err).to.not.exist
          other = node
          cb()
        })
      },
      (cb) => {
        ipfs.id((err, id) => {
          expect(err).to.not.exist
          const ma = id.addresses[0]
          other.swarm.connect(ma, cb)
        })
      }
    ], done)
  })

  after((done) => fc.dismantle(done))

  describe('Callback API', () => {
    let name

    it('add file for testing', (done) => {
      const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

      ipfs.files.add(testfile, (err, res) => {
        expect(err).to.not.exist

        expect(res).to.have.length(1)
        expect(res[0].hash).to.equal(expectedMultihash)
        expect(res[0].path).to.equal(expectedMultihash)
        done()
      })
    })

    it('.name.publish', (done) => {
      ipfs.name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        expect(err).to.not.exist
        name = res
        expect(name).to.exist
        done()
      })
    })

    it('.name.resolve', (done) => {
      ipfs.name.resolve(name.Name, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.exist
        expect(res).to.be.eql({
          Path: name.Value
        })
        done()
      })
    })
  })

  describe('Promise API', () => {
    let name

    it('.name.publish', () => {
      return ipfs.name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        .then((res) => {
          name = res
          expect(name).to.exist
        })
    })

    it('.name.resolve', () => {
      return ipfs.name.resolve(name.Name)
        .then((res) => {
          expect(res).to.exist
          expect(res).to.be.eql({
            Path: name.Value
          })
        })
    })
  })
})
