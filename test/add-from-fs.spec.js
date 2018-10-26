/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const path = require('path')
const fs = require('fs')
const os = require('os')

const IPFSApi = require('../src')
const f = require('./utils/factory')
const expectTimeout = require('./utils/expect-timeout')

describe('.addFromFs', () => {
  if (!isNode) { return }

  let ipfsd
  let ipfs

  before(function (done) {
    this.timeout(20 * 1000) // slow CI

    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after(function (done) {
    this.timeout(10 * 1000)
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  it('a directory', (done) => {
    const filesPath = path.join(__dirname, '/fixtures/test-folder')
    ipfs.addFromFs(filesPath, { recursive: true }, (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.be.above(8)
      done()
    })
  })

  it('a directory with an odd name', (done) => {
    const filesPath = path.join(__dirname, '/fixtures/weird name folder [v0]')
    ipfs.addFromFs(filesPath, { recursive: true }, (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.be.above(8)
      done()
    })
  })

  it('add and ignore a directory', (done) => {
    const filesPath = path.join(__dirname, '/fixtures/test-folder')
    ipfs.addFromFs(filesPath, { recursive: true, ignore: ['files/**'] }, (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.be.below(9)
      done()
    })
  })

  it('a file', (done) => {
    const filePath = path.join(__dirname, '/fixtures/testfile.txt')
    ipfs.addFromFs(filePath, (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.be.equal(1)
      expect(result[0].path).to.be.equal('testfile.txt')
      done()
    })
  })

  it('a hidden file in a directory', (done) => {
    const filesPath = path.join(__dirname, '/fixtures/test-folder')
    ipfs.addFromFs(filesPath, { recursive: true, hidden: true }, (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.be.above(10)
      expect(result.map(object => object.path)).to.include('test-folder/.hiddenTest.txt')
      expect(result.map(object => object.hash)).to.include('QmdbAjVmLRdpFyi8FFvjPfhTGB2cVXvWLuK7Sbt38HXrtt')
      done()
    })
  })

  it('with only-hash=true', function () {
    this.slow(10 * 1000)
    const content = String(Math.random() + Date.now())
    const filepath = path.join(os.tmpdir(), `${content}.txt`)
    fs.writeFileSync(filepath, content)

    return ipfs.addFromFs(filepath, { onlyHash: true })
      .then(out => {
        fs.unlinkSync(filepath)
        return expectTimeout(ipfs.object.get(out[0].hash), 4000)
      })
  })
})
