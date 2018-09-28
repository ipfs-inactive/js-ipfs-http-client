/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')
const mh = require('multihashes')
const CID = require('cids')
const path = require('path')
const { Readable } = require('stream')
const pull = require('pull-stream')
const IPFSApi = require('../src')
const f = require('./utils/factory')
const expectTimeout = require('./utils/expect-timeout')
const testfile = loadFixture('test/fixtures/2048')

// TODO: Test against all algorithms Object.keys(mh.names)
// This subset is known to work with both go-ipfs and js-ipfs as of 2017-09-05
const HASH_ALGS = [
  'sha1',
  'sha2-256',
  'sha2-512',
  'keccak-224',
  'keccak-256',
  'keccak-384',
  'keccak-512'
]

const runs = [
  {name: 'chunked', options: {experimental: true, chunkSize: 2 * 1024}},
  {name: 'non-chunked', options: {experimental: true}},
  {name: 'current non-chunked', options: {}}
]

describe.only('experimental add', function () {
  this.timeout(120 * 1000)

  let ipfsd
  let ipfs

  ipfs = IPFSApi('localhost', '5002')
  const expectedMultihash = 'QmcfPue16BgM2UqRg7tkoqbLgW4PKZok2HKyn9YEu1Eiyz'

  //   before((done) => {
  //     f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
  //       expect(err).to.not.exist()
  //       ipfsd = _ipfsd
  //       ipfs = IPFSApi(_ipfsd.apiAddr)
  //       done()
  //     })
  //   })

  //   after((done) => {
  //     if (!ipfsd) return done()
  //     ipfsd.stop(done)
  //   })
  runs.forEach(run => {
    it(`files.add ${run.name} - file for testing`, (done) => {
      ipfs.files.add(testfile, run.options, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.length(1)
        expect(res[0].hash).to.equal(expectedMultihash)
        expect(res[0].path).to.equal(expectedMultihash)
        done()
      })
    })

    it(`files.add ${run.name} - with Buffer module`, (done) => {
      let Buffer = require('buffer').Buffer

      let expectedBufferMultihash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
      let file = Buffer.from('hello')

      ipfs.files.add(file, run.options, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.length(1)
        expect(res[0].hash).to.equal(expectedBufferMultihash)
        expect(res[0].path).to.equal(expectedBufferMultihash)
        done()
      })
    })
    it(`files.add ${run.name} with empty path and buffer content`, (done) => {
      const expectedHash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
      const content = Buffer.from('hello')

      ipfs.files.add([{ path: '', content }], run.options, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.length(1)
        expect(res[0].hash).to.equal(expectedHash)
        expect(res[0].path).to.equal(expectedHash)
        done()
      })
    })
    it(`files.add ${run.name} with cid-version=1 and raw-leaves=false`, (done) => {
      const expectedCid = 'zdj7WjkeH54wf9wuC9MQrrNgDRuJiFq37DstbjWSwvuiSod9v'
      const options = Object.assign({}, run.options, { 'cid-version': 1, 'raw-leaves': false })

      ipfs.files.add(testfile, options, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.length(1)
        expect(res[0].hash).to.equal(expectedCid)
        expect(res[0].path).to.equal(expectedCid)
        done()
      })
    })

    it(`files.add ${run.name} with only-hash=true`, function () {
      this.slow(10 * 1000)
      const content = String(Math.random() + Date.now())
      const options = Object.assign({}, run.options, { onlyHash: true, experimental: true })

      return ipfs.files.add(Buffer.from(content), options)
        .then(files => {
          expect(files).to.have.length(1)

          // 'ipfs.object.get(<hash>)' should timeout because content wasn't actually added
          return expectTimeout(ipfs.object.get(files[0].hash), 4000)
        })
    })

    it(`files.add ${run.name} with options`, (done) => {
      const options = Object.assign({}, run.options, { pin: false })
      ipfs.files.add(testfile, options, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.length(1)
        expect(res[0].hash).to.equal(expectedMultihash)
        expect(res[0].path).to.equal(expectedMultihash)
        done()
      })
    })

    HASH_ALGS.forEach((name) => {
      it(`files.add ${run.name} with hash=${name} and raw-leaves=false`, (done) => {
        const content = String(Math.random() + Date.now())
        const file = {
          path: content + '.txt',
          content: Buffer.from(content)
        }

        const options = Object.assign(
          {},
          run.options,
          { hash: name, 'raw-leaves': false, experimental: true }
        )

        ipfs.files.add([file], options, (err, res) => {
          if (err) return done(err)
          expect(res).to.have.length(1)
          const cid = new CID(res[0].hash)
          expect(mh.decode(cid.multihash).name).to.equal(name)
          done()
        })
      })
    })

    it(`files.add ${run.name} file with progress option`, (done) => {
      let progress

      const options = Object.assign({}, run.options, { progress: p => (progress = p) })
      ipfs.files.add(testfile, options, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.length(1)
        expect(progress).to.be.equal(testfile.byteLength)
        done()
      })
    })

    // TODO: needs to be using a big file
    it.skip(`files.add ${run.name} - big file with progress option`, (done) => {
      let progress = 0
      const options = Object.assign({}, run.options, { progress: p => (progress = p) })
      ipfs.files.add(testfile, options, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.length(1)
        expect(progress).to.be.equal(testfile.byteLength)
        done()
      })
    })

    // TODO: needs to be using a directory
    it(`files.add ${run.name} - directory with progress option`, (done) => {
      let progress = 0

      const options = Object.assign({}, run.options, { progress: p => (progress = p) })
      ipfs.files.add(testfile, options, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.length(1)
        expect(progress).to.be.equal(testfile.byteLength)
        done()
      })
    })

    it(`files.addPullStream ${run.name} - with object chunks and pull stream content`, (done) => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'
      pull(
        pull.values([{ content: pull.values([Buffer.from('test')]) }]),
        ipfs.files.addPullStream(run.options),
        pull.collect((err, res) => {
          if (err) return done(err)

          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
          done()
        })
      )
    })

    it(`files.add ${run.name} - with pull stream (callback)`, (done) => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      ipfs.files.add(pull.values([Buffer.from('test')]), run.options, (err, res) => {
        if (err) return done(err)
        expect(res).to.have.length(1)
        expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        done()
      })
    })

    it(`files.add ${run.name} - with pull stream (promise)`, () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return ipfs.files.add(pull.values([Buffer.from('test')]), run.options)
        .then((res) => {
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        })
    })

    it(`files.add ${run.name} - with array of objects with pull stream content`, () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return ipfs.files.add(
        [{ content: pull.values([Buffer.from('test')]) }],
        run.options)
        .then((res) => {
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        })
    })

    // tests from interface-core add
    it(`files.add ${run.name} - should not be able to add by path`, (done) => {
      const validPath = path.join(process.cwd() + '/package.json')

      ipfs.files.add(validPath, run.options, (err, res) => {
        expect(err).to.exist()
        done()
      })
    })

    it(`files.add ${run.name} - should add readable stream`, (done) => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      ipfs.files.add(rs, run.options, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const file = filesAdded[0]
        expect(file.path).to.equal(expectedCid)
        expect(file.size).to.equal(17)
        expect(file.hash).to.equal(expectedCid)
        done()
      })
    })

    it(`files.add ${run.name} - should add array of objects with readable stream content`, (done) => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      const tuple = { path: 'data.txt', content: rs }

      ipfs.files.add([tuple], run.options, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const file = filesAdded[0]
        expect(file.path).to.equal('data.txt')
        expect(file.size).to.equal(17)
        expect(file.hash).to.equal(expectedCid)
        done()
      })
    })

    it(`files.add ${run.name} - should add array of objects with readable stream content`, (done) => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      const tuple = { path: 'data.txt', content: rs }

      ipfs.files.add([tuple], run.options, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const file = filesAdded[0]
        expect(file.path).to.equal('data.txt')
        expect(file.size).to.equal(17)
        expect(file.hash).to.equal(expectedCid)
        done()
      })
    })

    it(`files.add ${run.name} - should add array of objects with pull stream content (promised)`, () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return ipfs.files.add([{ content: pull.values([Buffer.from('test')]) }], run.options)
        .then((res) => {
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        })
    })

    it(`files.add ${run.name} - should add a nested directory as array of tupples`, function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: Buffer.from('test')
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      ipfs.files.add(dirs, run.options, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-folder')
        expect(root.hash).to.equal('QmT7pf89dqQYf4vdHryzMUPhcFLCsvW2xmzCk9DbmKiVj3')
        done()
      })
    })

    it(`files.add ${run.name} - should fail when passed invalid input`, (done) => {
      const nonValid = 'sfdasfasfs'

      ipfs.files.add(nonValid, run.options, (err, result) => {
        expect(err).to.exist()
        done()
      })
    })

    // TODO: fix current implementation fails here
    it.skip(`files.add ${run.name} - should wrap content in a directory`, (done) => {
      const data = { path: 'testfile.txt', content: Buffer.from('test') }
      const options = Object.assign({}, run.options, {
        wrapWithDirectory: true
      })

      ipfs.files.add(data, options, (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded).to.have.length(2)
        const file = filesAdded[0]
        const wrapped = filesAdded[1]
        expect(file.hash).to.equal('QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm')
        expect(file.path).to.equal('testfile.txt')
        expect(wrapped.path).to.equal('')
        done()
      })
    })

    // tests from interface-core add-pullstream

    it(`files.add ${run.name} - should add pull stream of valid files and dirs`, function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: Buffer.from('test')
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const files = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const stream = ipfs.files.addPullStream(run.options)

      pull(
        pull.values(files),
        stream,
        pull.collect((err, filesAdded) => {
          expect(err).to.not.exist()

          filesAdded.forEach((file) => {
            if (file.path === 'test-folder') {
              expect(file.hash).to.equal('QmT7pf89dqQYf4vdHryzMUPhcFLCsvW2xmzCk9DbmKiVj3')
              done()
            }
          })
        })
      )
    })

    it(`files.add ${run.name} - should add with object chunks and pull stream content`, (done) => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      pull(
        pull.values([{ content: pull.values([Buffer.from('test')]) }]),
        ipfs.files.addPullStream(run.options),
        pull.collect((err, res) => {
          if (err) return done(err)
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
          done()
        })
      )
    })
    // tests from interface-core add-readable-stream

    it(`files.add ${run.name} - should add readable stream of valid files and dirs`, function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: Buffer.from('test')
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const files = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const stream = ipfs.files.addReadableStream(run.options)

      stream.on('error', (err) => {
        expect(err).to.not.exist()
      })

      stream.on('data', (file) => {
        if (file.path === 'test-folder') {
          expect(file.hash).to.equal('QmT7pf89dqQYf4vdHryzMUPhcFLCsvW2xmzCk9DbmKiVj3')
          done()
        }
      })

      files.forEach((file) => stream.write(file))
      stream.end()
    })
    // end runs
  })

  it.skip('files.add pins by default', (done) => {
    const newContent = Buffer.from(String(Math.random()))

    ipfs.pin.ls((err, pins) => {
      expect(err).to.not.exist()
      const initialPinCount = pins.length
      ipfs.files.add(newContent, { experimental: true }, (err, res) => {
        expect(err).to.not.exist()

        ipfs.pin.ls((err, pins) => {
          expect(err).to.not.exist()
          expect(pins.length).to.eql(initialPinCount + 1)
          done()
        })
      })
    })
  })

  it.skip('files.add with pin=false', (done) => {
    const newContent = Buffer.from(String(Math.random()))

    ipfs.pin.ls((err, pins) => {
      expect(err).to.not.exist()
      const initialPinCount = pins.length
      ipfs.files.add(newContent, { pin: false, experimental: true }, (err, res) => {
        expect(err).to.not.exist()

        ipfs.pin.ls((err, pins) => {
          expect(err).to.not.exist()
          expect(pins.length).to.eql(initialPinCount)
          done()
        })
      })
    })
  })
})
