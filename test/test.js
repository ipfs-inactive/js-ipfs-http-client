// var ipfsd = require('ipfsd-ctl')
var ipfsApi = require('../src/index.js')
var assert = require('assert')
// TODO not sure how to deal with these in the browser
// var fs = require('fs')
// var path = require('path')
// var File = require('vinyl')

// this comment is used by mocha, do not delete
/*global describe, before, it, xit*/

// this comment is for temporary undefined variables
/*global File, path, testfile, fs*/

var test_string = 'IPFS workcs'
var test_string_hash = 'QmcJRDiJUw5TehYkidky4Gcxgn6dc9LiDPDbotNabD5say'

// TODO files in the browser?
// var testfile = __dirname + '/testfile.txt'

describe('ipfs node api', function () {
  var ipfs
  before(function () {
    ipfs = ipfsApi('localhost', '5001')
    // TODO maybe optionally load ipfsd in nodejs environment
    //  this.timeout(20000)
    //  log('ipfs node setup')

    //  ipfsd.disposable(function (err, node) {
    //    if (err) throw err
    //    log('ipfs init done')
    //    ipfsNode = node

    //    ipfsNode.startDaemon(function (err, ignore) {
    //      if (err) throw err
    //      log('ipfs daemon running')

  //      ipfs = ipfsApi(ipfsNode.apiAddr)
  //      done()
  //    })
  //  })
  })

  it('has the api object', function () {
    assert(ipfs)
    assert(ipfs.id)
  })

  // TODO need vinyl in browser
  xit('add file', function (done) {
    this.timeout(10000)

    var file = new File({
      cwd: path.dirname(testfile),
      base: path.dirname(testfile),
      path: testfile,
      contents: fs.createReadStream(testfile)
    })

    ipfs.add(file, function (err, res) {
      if (err) throw err

      var added = res[0]
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      assert.equal(added.Name, path.basename(testfile))
      done()
    })
  })

  it('add buffer', function (done) {
    this.timeout(10000)

    var buf = new Buffer(test_string)
    ipfs.add(buf, function (err, res) {
      if (err) throw err
      assert.equal(res.Hash, test_string_hash)
      done()
    })
  })

  // TODO not sure how to deal with this is a browser either
  xit('add path', function (done) {
    this.timeout(10000)

    ipfs.add(testfile, function (err, res) {
      if (err) throw err

      var added = res[0]
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('cat', function (done) {
    this.timeout(10000)

    ipfs.cat(test_string_hash, function (err, res) {
      if (err) throw err
      assert.equal(res, test_string)
      done()
    })
  })

  var initDocs = 'Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj'
  var initDocsLs = {
    'help': 'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7',
    'about': 'QmfE3nUohq2nEYwieF7YFnJF1VfiL4i3wDxkMq8aGUg8Mt',
    'readme': 'QmUFtMrBHqdjTtbebsL6YGebvjShh3Jud1insUv12fEVdA',
    'contact': 'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y',
    'quick-start': 'QmeEqpsKrvdhuuuVsguHaVdJcPnnUHHZ5qEWjCHavYbNqU',
    'security-notes': 'QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ'
  }
  it('ls', function (done) {
    this.timeout(10000)

    ipfs.ls(initDocs, function (err, res) {
      if (err) throw err

      var dir = res.Objects[0]
      for (var i in dir.Links) {
        var link = dir.Links[i]
        assert.equal(link.Hash, initDocsLs[link.Name])
      }
      assert.equal(dir.Hash, initDocs)
      assert.equal(dir.Links.length, 6)
      assert.equal(dir.Links[0].Name, 'about')
      assert.equal(dir.Links[5].Name, 'security-notes')

      done()
    })
  })

  // TODO not sure how to deal with this
  // var testConfPath = __dirname + '/testconfig.json'
  // var testConf = fs.readFileSync(testConfPath).toString()
  // var readConf
  // before(function (done) {
  //  ipfs.config.replace(testConfPath, function (err) {
  //    if (err) throw err
  //    ipfs.config.show(function (err, res) {
  //      if (err) throw err
  //      readConf = res
  //      done()
  //    })
  //  })
  // })

  // it('config replace/show', function () {
  //   assert.equal(testConf,
  //                readConf)
  // })

  it('config set/get', function (done) {
    this.timeout(10000)

    var confKey = 'arbitraryKey'
    var confVal = 'arbitraryVal'

    ipfs.config.set(confKey, confVal, function (err, res) {
      if (err) throw err
      ipfs.config.get(confKey, function (err, res) {
        if (err) throw err
        assert.equal(res.Value, confVal)
        done()
      })
    })
  })

  var blorb = Buffer('blorb')
  var blorbKey = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
  it('block.put', function (done) {
    this.timeout(10000)

    ipfs.block.put(blorb, function (err, res) {
      if (err) throw err
      var store = res.Key
      assert.equal(store, 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
      done()
    })
  })

  // TODO not working because of buffer probably
  xit('block.get', function (done) {
    this.timeout(10000)

    ipfs.block.get(blorbKey, function (err, res) {
      if (err) throw err
      var buf = ''
      res
        .on('data', function (data) { buf += data })
        .on('end', function () {
          assert.equal(buf, 'blorb')
          done()
        })
    })
  })

  var testObject = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
  var testObjectHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'

  it('object.put', function (done) {
    ipfs.object.put(testObject, 'json', function (err, res) {
      if (err) throw err
      var obj = res
      assert.equal(obj.Hash, testObjectHash)
      assert.equal(obj.Links.length, 0)
      done()
    })
  })

  it('object.get', function (done) {
    ipfs.object.get(testObjectHash, function (err, res) {
      if (err) throw err
      var obj = res
      assert.equal(obj.Data, 'testdata')
      assert.equal(obj.Links.length, 0)
      done()
    })
  })

  // TODO buffers
  xit('object.data', function (done) {
    this.timeout(10000)
    ipfs.object.data(testObjectHash, function (err, stream) {
      if (err) throw err
      var buf = ''
      stream
        .on('error', function (err) { throw err })
        .on('data', function (data) { buf += data })
        .on('end', function () {
          assert.equal(buf, 'testdata')
          done()
        })
    })
  })

  // TODO
  xit('refs', function (done) {
    this.timeout(10000)
    ipfs.refs(initDocs, {'format': '<src> <dst> <linkname>'}, function (err, objs) {
      if (err) throw err
      for (var i in objs) {
        var ref = objs[i]
        var refp = ref.Ref.replace('\n', '').split(' ')
        assert.equal(refp[0], initDocs)
        assert(initDocsLs[refp[2]])
        assert.equal(refp[1], initDocsLs[refp[2]])
        assert.equal(ref.Err, '')
      }
      done()
    })
  })

  it('id', function (done) {
    this.timeout(10000)
    ipfs.id(function (err, res) {
      if (err) throw err
      var id = res
      assert(id.ID)
      assert(id.PublicKey)
      done()
    })
  })

  it('returns an error when getting a non-existent key from the DHT',
    function (done) {
      this.timeout(20000)
      ipfs.dht.get('non-existent', {timeout: '100ms'}, function (err, value) {
        assert(err)
        done()
      })
    })

  // TODO
  xit('puts and gets a key value pair in the DHT', function (done) {
    this.timeout(20000)

    ipfs.dht.put('scope', 'interplanetary', function (err, cb) {
      assert(!err)
      if (err) {
        done()
        return
      }

      ipfs.dht.get('scope', function (err, value) {
        if (err) console.error(err)
        assert.equal(value, 'interplanetary')
        done()
      })
    })
  })

  // TODO not applicable anymore
  // it('test for error after daemon stops', function (done) {
  //  this.timeout(6000)
  //  var nodeStopped
  //  ipfsNode.stopDaemon(function () {
  //    if (!nodeStopped) {
  //      nodeStopped = true
  //      ipfs.id(function (err, res) {
  //        assert.equal(err.code, 'ECONNREFUSED')
  //        done()
  //      })
  //    }
  //  })
  // })

  // TODO incomplete test
  xit('can return a valid list of peers from findprovs', function (done) {
    ipfs.dht.findprovs(testObjectHash, function (err, peers) {
      console.log(typeof peers)
      console.log(typeof [])
      console.log(err, peers)
      // Should be more than one items since there is always at least one
      // "routing not found" error in the array
      console.log(peers.length)
      assert(peers.length > 1)
      done()
    })
  })
})
