/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const loadFixture = require('aegir/fixtures')

const f = require('./utils/factory')

describe('.get (specific go-ipfs features)', function () {
  this.timeout(60 * 1000)

  const smallFile = {
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core')
  }

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
    await ipfs.add(smallFile.data)
  })

  after(() => f.clean())

  it('archive true', async () => {
    const files = await ipfs.get(smallFile.cid, { archive: true })

    expect(files).to.be.length(1)
    expect(files[0].content.toString()).to.contain(smallFile.data.toString())
  })

  it('err with out of range compression level', async () => {
    await expect(ipfs.get(smallFile.cid, {
      compress: true,
      compressionLevel: 10
    })).to.be.rejectedWith('compression level must be between 1 and 9')
  })

  it('with compression level', async () => {
    await ipfs.get(smallFile.cid, { compress: true, 'compression-level': 1 })
  })

  it('get path containing "+"s', async () => {
    const filename = 'ti,c64x+mega++mod-pic.txt'
    const subdir = 'tmp/c++files'
    const cid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
    const path = `${subdir}/${filename}`
    await ipfs.add([{
      path,
      content: Buffer.from(path)
    }])
    const files = await ipfs.get(cid)

    expect(files).to.be.an('array').with.lengthOf(3)
    expect(files[0]).to.have.property('path', cid)
    expect(files[1]).to.have.property('path', `${cid}/c++files`)
    expect(files[2]).to.have.property('path', `${cid}/c++files/ti,c64x+mega++mod-pic.txt`)
  })
})
