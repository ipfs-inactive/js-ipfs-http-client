/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const waterfall = require('async/waterfall')
const path = require('path')

const FactoryClient = require('./ipfs-factory/client')

describe('.ls', function () {
  this.timeout(40 * 1000)

  if (!isNode) { return }

  let ipfs
  let fc
  let folder

  before((done) => {
    fc = new FactoryClient()
    waterfall([
      (cb) => fc.spawnNode(cb),
      (node, cb) => {
        ipfs = node
        const filesPath = path.join(__dirname, '/fixtures/test-folder')
        ipfs.util.addFromFs(filesPath, { recursive: true }, cb)
      },
      (hashes, cb) => {
        folder = hashes[hashes.length - 1].hash
        expect(folder).to.be.eql('QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh')
        cb()
      }
    ], done)
  })

  after((done) => fc.dismantle(done))

  it('should correctly handle a nonexist()ing hash', function (done) {
    ipfs.ls('surelynotavalidhashheh?', (err, res) => {
      expect(err).to.exist()
      expect(res).to.not.exist()
      done()
    })
  })

  it('should correctly handle a nonexist()ing path', function (done) {
    ipfs.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW/folder_that_isnt_there', (err, res) => {
      expect(err).to.exist()
      expect(res).to.not.exist()
      done()
    })
  })
})
