/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const f = require('./utils/factory')

describe('.commands', function () {
  this.timeout(60 * 1000)

  let ipfs

  before(async () => {
    ipfs = await f.setup()
  })

  after(() => f.teardown())

  it('lists commands', async () => {
    const res = await ipfs.commands()

    expect(res).to.exist()
  })
})
