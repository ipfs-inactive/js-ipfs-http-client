/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CID = require('cids')
const ipfsPath = require('../src/utils/ipfs-path')

describe('utils/ipfs-path', () => {
  it('should parse input as string CID', () => {
    const input = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
    const { cid, path } = ipfsPath(input)

    expect(cid.toBaseEncodedString()).to.equal('QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn')
    expect(path).to.equal('')
  })

  it('should parse input as buffer CID', () => {
    const input = Buffer.from('017012207252523e6591fb8fe553d67ff55a86f84044b46a3e4176e10c58fa529a4aabd5', 'hex')
    const { cid, path } = ipfsPath(input)

    expect(cid.toBaseEncodedString()).to.equal('zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS')
    expect(path).to.equal('')
  })

  it('should parse input as CID instance', () => {
    const input = new CID('zdpuArHMUAYi3VtD3f7iSkXxYK9xo687SoNf5stAQNCMzd77k')
    const { cid, path } = ipfsPath(input)

    expect(cid.equals(input)).to.equal(true)
    expect(path).to.equal('')
  })

  it('should parse input as string with path and without namespace', () => {
    const input = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn/path/to'
    const { cid, path } = ipfsPath(input)

    expect(cid.toBaseEncodedString()).to.equal('QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn')
    expect(path).to.equal('/path/to')
  })

  it('should parse input as string without leading slash', () => {
    const input = 'ipfs/QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn/path/to'
    const { cid, path } = ipfsPath(input)

    expect(cid.toBaseEncodedString()).to.equal('QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn')
    expect(path).to.equal('/path/to')
  })

  it('should parse input as string with trailing slash', () => {
    const input = '/ipfs/QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn/path/to/'
    const { cid, path } = ipfsPath(input)

    expect(cid.toBaseEncodedString()).to.equal('QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn')
    expect(path).to.equal('/path/to')
  })

  it('should throw on unknown namespace', () => {
    const input = '/junk/stuff'
    expect(() => ipfsPath(input)).to.throw('unknown namespace: junk')
  })

  it('should throw on invalid CID in string', () => {
    const input = '/ipfs/notACID/some/path'
    expect(() => ipfsPath(input)).to.throw('invalid CID')
  })

  it('should throw on invalid CID in buffer', () => {
    const input = Buffer.from('notaCID')
    expect(() => ipfsPath(input)).to.throw('invalid CID')
  })

  it('should throw on invalid path', () => {
    const input = 42
    expect(() => ipfsPath(input)).to.throw('invalid path')
  })
})
