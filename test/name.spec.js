/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const isNode = require('detect-node')
const series = require('async/series')
const loadFixture = require('aegir/fixtures')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

const testfile = isNode
  ? loadFixture(__dirname, '/fixtures/testfile.txt')
  : loadFixture(__dirname, 'fixtures/testfile.txt')

describe('.name', function () {
  this.timeout(50 * 1000)

  let ipfsd
  let other

  before((done) => {
    series([
      (cb) => {
        df.spawn((err, node) => {
          expect(err).to.not.exist()
          ipfsd = node
          cb()
        })
      },
      (cb) => {
        df.spawn((err, node) => {
          expect(err).to.not.exist()
          other = node
          cb()
        })
      },
      (cb) => {
        ipfsd.api.id((err, id) => {
          expect(err).to.not.exist()
          const ma = id.addresses[0]
          other.api.swarm.connect(ma, cb)
        })
      }
    ], done)
  })

  after((done) => {
    parallel([
      (cb) => ipfsd.stop(cb),
      (cb) => other.stop(cb)
    ], done)
  })

  describe('Callback API', () => {
    let name

    it('add file for testing', (done) => {
      const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

      ipfsd.api.files.add(testfile, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.length(1)
        expect(res[0].hash).to.equal(expectedMultihash)
        expect(res[0].path).to.equal(expectedMultihash)
        done()
      })
    })

    it('.name.publish', (done) => {
      ipfsd.api.name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        expect(err).to.not.exist()
        name = res
        expect(name).to.exist()
        done()
      })
    })

    it('.name.resolve', (done) => {
      ipfsd.api.name.resolve(name.name, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.be.eql(name.value)
        done()
      })
    })
  })

  describe('Promise API', () => {
    let name

    it('.name.publish', () => {
      return ipfsd.api.name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        .then((res) => {
          name = res
          expect(name).to.exist()
        })
    })

    it('.name.resolve', () => {
      return ipfsd.api.name.resolve(name.name)
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.be.eql(name.value)
        })
    })
  })
})
