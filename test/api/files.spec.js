'use strict'

let testfile

if (isNode) {
  testfile = require('fs').readFileSync(__dirname + '/../testfile.txt')
} else {
  testfile = require('raw!../testfile.txt')
}

describe('.files', function () {
  it('files.mkdir', function (done) {
    this.timeout(20000)

    apiClients['a'].files.mkdir('/test-folder', function (err) {
      expect(err).to.not.exist
      done()
    })
  })

  it('files.cp', function (done) {
    this.timeout(20000)

    apiClients['a'].files
      .cp(['/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', '/test-folder/test-file'], function (err) {
        expect(err).to.not.exist
        done()
      })
  })

  it('files.ls', function (done) {
    this.timeout(20000)

    apiClients['a'].files.ls('/test-folder', function (err, res) {
      expect(err).to.not.exist
      expect(res.Entries.length).to.equal(1)
      done()
    })
  })

  it('files.stat', function (done) {
    this.timeout(20000)

    apiClients['a'].files.stat('/test-folder/test-file', function (err, res) {
      expect(err).to.not.exist
      expect(res).to.deep.equal({
        Hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
        Size: 12,
        CumulativeSize: 20,
        Blocks: 0
      })

      done()
    })
  })

  it('files.stat file that does not exist', function (done) {
    this.timeout(20000)

    apiClients['a'].files.stat('/test-folder/does-not-exist', function (err, res) {
      expect(err).to.exist
      if (err.code === 0) {
        return done()
      }
      throw err
    })
  })

  it('files.read', function (done) {
    this.timeout(20000)

    if (!isNode) {
      return done()
    }

    apiClients['a'].files.read('/test-folder/test-file', function (err, stream) {
      expect(err).to.not.exist
      let buf = ''
      stream
        .on('error', function (err) {
          expect(err).to.not.exist
        })
        .on('data', function (data) {
          buf += data
        })
        .on('end', function () {
          expect(new Buffer(buf)).to.deep.equal(testfile)
          done()
        })
    })
  })

  // -

  it('files.rm', function (done) {
    this.timeout(20000)

    apiClients['a'].files.rm('/test-folder', { 'recursive': true }, function (err) {
      expect(err).to.not.exist
      done()
    })
  })
})
