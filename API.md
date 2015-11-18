      - running against version 0.3.9
# TOC
   - [IPFS Node.js API wrapper tests](#ipfs-nodejs-api-wrapper-tests)
     - [.send](#ipfs-nodejs-api-wrapper-tests-send)
     - [.add](#ipfs-nodejs-api-wrapper-tests-add)
     - [.cat](#ipfs-nodejs-api-wrapper-tests-cat)
     - [.ls](#ipfs-nodejs-api-wrapper-tests-ls)
     - [.config](#ipfs-nodejs-api-wrapper-tests-config)
     - [.update (currently disabled, wait for IPFS 0.4.0 release](#ipfs-nodejs-api-wrapper-tests-update-currently-disabled-wait-for-ipfs-040-release)
     - [.version](#ipfs-nodejs-api-wrapper-tests-version)
     - [.commands](#ipfs-nodejs-api-wrapper-tests-commands)
     - [.mount](#ipfs-nodejs-api-wrapper-tests-mount)
     - [.diag](#ipfs-nodejs-api-wrapper-tests-diag)
     - [.block](#ipfs-nodejs-api-wrapper-tests-block)
     - [.object](#ipfs-nodejs-api-wrapper-tests-object)
     - [.swarm](#ipfs-nodejs-api-wrapper-tests-swarm)
     - [.ping](#ipfs-nodejs-api-wrapper-tests-ping)
     - [.id](#ipfs-nodejs-api-wrapper-tests-id)
     - [.pin](#ipfs-nodejs-api-wrapper-tests-pin)
     - [.log](#ipfs-nodejs-api-wrapper-tests-log)
     - [.name](#ipfs-nodejs-api-wrapper-tests-name)
     - [.refs](#ipfs-nodejs-api-wrapper-tests-refs)
     - [.dht](#ipfs-nodejs-api-wrapper-tests-dht)
<a name=""></a>
 
<a name="ipfs-nodejs-api-wrapper-tests"></a>
# IPFS Node.js API wrapper tests
connect Node a to b and c.

```js
this.timeout(5000)
var addrs = {}
var counter = 0
collectAddr('b', finish)
collectAddr('c', finish)
function finish () {
  counter++
  if (counter === 2) {
    dial()
  }
}
function collectAddr (key, cb) {
  apiClients[key].id(function (err, id) {
    if (err) {
      throw err
    }
    // note to self: HTTP API port !== Node port
    addrs[key] = id.Addresses[0]
    cb()
  })
}
function dial () {
  apiClients['a'].swarm.connect(addrs['b'], function (err, res) {
    if (err) {
      throw err
    }
    apiClients['a'].swarm.connect(addrs['c'], function (err) {
      if (err) {
        throw err
      }
      done()
    })
  })
}
```

has the api object.

```js
assert(apiClients['a'])
assert(apiClients['a'].id)
```

<a name="ipfs-nodejs-api-wrapper-tests-send"></a>
## .send
<a name="ipfs-nodejs-api-wrapper-tests-add"></a>
## .add
add file.

```js
if (!isNode) {
  return done()
}
this.timeout(10000)
var file = new File({
  cwd: path.dirname(testfilePath),
  base: path.dirname(testfilePath),
  path: testfilePath,
  contents: new Buffer(testfile)
})
apiClients['a'].add(file, function (err, res) {
  if (err) throw err
  var added = res[0] != null ? res[0] : res
  assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  assert.equal(added.Name, path.basename(testfilePath))
  done()
})
```

add buffer.

```js
this.timeout(10000)
var buf = new Buffer(testfile)
apiClients['a'].add(buf, function (err, res) {
  if (err) throw err
  // assert.equal(res.length, 1)
  var added = res[0] != null ? res[0] : res
  assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  done()
})
```

add path.

```js
if (!isNode) {
  return done()
}
this.timeout(10000)
apiClients['a'].add(testfilePath, function (err, res) {
  if (err) throw err
  var added = res[0] != null ? res[0] : res
  assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  done()
})
```

add a nested dir.

```js
this.timeout(10000)
apiClients['a'].add(__dirname + '/test-folder', { recursive: true }, function (err, res) {
  if (isNode) {
    if (err) throw err
    var added = res[res.length - 1]
    assert.equal(added.Hash, 'QmZdsefMGMeG6bL719gX44XSVQrL6psEgRZdw1SGadFaK2')
    done()
  } else {
    assert.equal(err.message, 'Recursive uploads are not supported in the browser')
    done()
  }
})
```

add stream.

```js
this.timeout(10000)
var stream = new Readable()
stream.push('Hello world')
stream.push(null)
apiClients['a'].add(stream, function (err, res) {
  if (err) throw err
  var added = res[0] != null ? res[0] : res
  assert.equal(added.Hash, 'QmNRCQWfgze6AbBCaT1rkrkV5tJ2aP4oTNPb5JZcXYywve')
  done()
})
```

add url.

```js
this.timeout(10000)
var url = 'https://raw.githubusercontent.com/ipfs/js-ipfs-api/2a9cc63d7427353f2145af6b1a768a69e67c0588/README.md'
apiClients['a'].add(url, function (err, res) {
  if (err) throw err
  var added = res[0] != null ? res[0] : res
  assert.equal(added.Hash, 'QmZmHgEX9baxUn3qMjsEXQzG6DyNcrVnwieQQTrpDdrFvt')
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-cat"></a>
## .cat
cat.

```js
this.timeout(10000)
apiClients['a'].cat('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', function (err, res) {
  if (err) {
    throw err
  }
  if (typeof res === 'string') {
    // Just  a string
    assert.equal(res, testfile)
    done()
    return
  }
  var buf = ''
  res
    .on('error', function (err) { throw err })
    .on('data', function (data) { buf += data })
    .on('end', function () {
      assert.equal(buf, testfile)
      done()
    })
})
```

<a name="ipfs-nodejs-api-wrapper-tests-ls"></a>
## .ls
ls.

```js
if (!isNode) {
  return done()
}
this.timeout(100000)
apiClients['a'].ls(folder, function (err, res) {
  if (err) {
    throw err
  }
  var objs = {
    Hash: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q',
    Links: [{
      Name: 'add.js',
      Hash: 'QmaeuuKLHzirbVoTjb3659fyyV381amjaGrU2pecHEWPrN',
      Size: 481,
      Type: 2
    }, {
      Name: 'cat.js',
      Hash: 'QmTQhTtDWeaaP9pttDd1CuoVTLQm1w51ABfjgmGUbCUF6i',
      Size: 364,
      Type: 2
    }, {
      Name: 'files',
      Hash: 'QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy',
      Size: 132,
      Type: 1
    }, {
      Name: 'ipfs-add.js',
      Hash: 'QmTjXxUemcuMAZ2KNN3iJGWHwrkMsW8SWEwkYVSBi1nFD9',
      Size: 315,
      Type: 2
    }, {
      Name: 'ls.js',
      Hash: 'QmXYUXDFNNh1wgwtX5QDG7MsuhAAcE9NzDYnz8SjnhvQrK',
      Size: 428,
      Type: 2
    }, {
      Name: 'version.js',
      Hash: 'QmUmDmH4hZgN5THnVP1VjJ1YWh5kWuhLGUihch8nFiD9iy',
      Size: 153,
      Type: 2 }]
  }
  assert.deepEqual(res.Objects[0], objs)
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-config"></a>
## .config
.config.{set, get}.

```js
this.timeout(10000)
var confKey = 'arbitraryKey'
var confVal = 'arbitraryVal'
apiClients['a'].config.set(confKey, confVal, function (err, res) {
  if (err) throw err
  apiClients['a'].config.get(confKey, function (err, res) {
    if (err) throw err
    assert.equal(res.Value, confVal)
    done()
  })
})
```

.config.show.

```js
this.timeout(10000)
apiClients['c'].config.show(function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  done()
})
```

.config.replace.

```js
this.timeout(10000)
if (!isNode) {
  return done()
}
apiClients['c'].config.replace(__dirname + '/r-config.json', function (err, res) {
  if (err) {
    throw err
  }
  assert.equal(res, '')
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-update-currently-disabled-wait-for-ipfs-040-release"></a>
## .update (currently disabled, wait for IPFS 0.4.0 release
<a name="ipfs-nodejs-api-wrapper-tests-version"></a>
## .version
checks the version.

```js
this.timeout(10000)
apiClients['a'].version(function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  assert(res.Version)
  console.log('      - running against version', res.Version)
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-commands"></a>
## .commands
lists commands.

```js
this.timeout(10000)
apiClients['a'].commands(function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-diag"></a>
## .diag
.diag.net.

```js
this.timeout(1000000)
apiClients['a'].diag.net(function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-block"></a>
## .block
block.put.

```js
this.timeout(10000)
apiClients['a'].block.put(blorb, function (err, res) {
  if (err) throw err
  var store = res.Key
  assert.equal(store, 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
  done()
})
```

block.get.

```js
this.timeout(10000)
apiClients['a'].block.get(blorbKey, function (err, res) {
  if (err) throw err
  if (typeof res === 'string') {
    // Just  a string
    assert.equal(res, 'blorb')
    done()
    return
  }
  var buf = ''
  res
    .on('data', function (data) { buf += data })
    .on('end', function () {
      assert.equal(buf, 'blorb')
      done()
    })
})
```

<a name="ipfs-nodejs-api-wrapper-tests-object"></a>
## .object
object.put.

```js
apiClients['a'].object.put(testObject, 'json', function (err, res) {
  if (err) throw err
  var obj = res
  assert.equal(obj.Hash, testObjectHash)
  assert.equal(obj.Links.length, 0)
  done()
})
```

object.get.

```js
apiClients['a'].object.get(testObjectHash, function (err, res) {
  if (err) {
    throw err
  }
  var obj = res
  assert.equal(obj.Data, 'testdata')
  assert.equal(obj.Links.length, 0)
  done()
})
```

object.data.

```js
this.timeout(10000)
apiClients['a'].object.data(testObjectHash, function (err, res) {
  if (err) throw err
  if (typeof res === 'string') {
    // Just  a string
    assert.equal(res, 'testdata')
    done()
    return
  }
  var buf = ''
  res
    .on('error', function (err) { throw err })
    .on('data', function (data) { buf += data })
    .on('end', function () {
      assert.equal(buf, 'testdata')
      done()
    })
})
```

object.stat.

```js
this.timeout(10000)
apiClients['a'].object.stat(testObjectHash, function (err, res) {
  if (err) {
    throw err
  }
  assert.deepEqual(res, {
    Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
    NumLinks: 0,
    BlockSize: 10,
    LinksSize: 2,
    DataSize: 8,
    CumulativeSize: 10
  })
  done()
})
```

object.links.

```js
this.timeout(10000)
apiClients['a'].object.links(testObjectHash, function (err, res) {
  if (err) {
    throw err
  }
  assert.deepEqual(res, {
    Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
    Links: []
  })
  done()
})
```

object.patch.

```js
this.timeout(10000)
apiClients['a'].object.put(testPatchObject, 'json', function (err, res) {
  if (err) {
    throw err
  }
  apiClients['a'].object.patch(testObjectHash, ['add-link', 'next', testPatchObjectHash], function (err, res) {
    if (err) {
      throw err
    }
    assert.deepEqual(res, {
      Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd',
      Links: null
    })
    apiClients['a'].object.get(res.Hash, function (err, res2) {
      if (err) {
        throw err
      }
      assert.deepEqual(res2, {
        Data: 'testdata',
        Links: [{
          Name: 'next',
          Hash: 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2',
          Size: 15
        }]
      })
      done()
    })
  })
})
```

<a name="ipfs-nodejs-api-wrapper-tests-swarm"></a>
## .swarm
.swarm.peers.

```js
this.timeout(5000)
apiClients['a'].swarm.peers(function (err, res) {
  if (err) {
    throw err
  }
  assert(res.Strings.length >= 2)
  done()
})
```

.swarm.connect.

```js
// Done in the 'before' segment
done()
```

<a name="ipfs-nodejs-api-wrapper-tests-ping"></a>
## .ping
ping another peer.

```js
apiClients['b'].id(function (err, id) {
  if (err) {
    throw err
  }
  apiClients['a'].ping(id.ID, function (err, res) {
    if (err) {
      throw err
    }
    assert(res)
    assert(res.Success)
    done()
  })
})
```

<a name="ipfs-nodejs-api-wrapper-tests-id"></a>
## .id
id.

```js
this.timeout(10000)
apiClients['a'].id(function (err, res) {
  if (err) throw err
  var id = res
  assert(id.ID)
  assert(id.PublicKey)
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-pin"></a>
## .pin
.pin.add.

```js
this.timeout(5000)
apiClients['b'].pin.add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, function (err, res) {
  if (err) {
    throw err
  }
  assert.equal(res.Pinned[0], 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  done()
})
```

.pin.list.

```js
this.timeout(5000)
apiClients['b'].pin.list(function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  done()
})
```

.pin.remove.

```js
this.timeout(5000)
apiClients['b'].pin.remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  apiClients['b'].pin.list('direct', function (err, res) {
    if (err) {
      throw err
    }
    assert(res)
    assert.equal(Object.keys(res.Keys).length, 0)
    done()
  })
})
```

<a name="ipfs-nodejs-api-wrapper-tests-log"></a>
## .log
<a name="ipfs-nodejs-api-wrapper-tests-name"></a>
## .name
.name.publish.

```js
apiClients['a'].name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  name = res
  done()
})
```

.name.resolve.

```js
apiClients['a'].name.resolve(name.Name, function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  assert.deepEqual(res, { Path: '/ipfs/' + name.Value })
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-refs"></a>
## .refs
refs.

```js
if (!isNode) {
  return done()
}
this.timeout(10000)
apiClients['a'].refs(folder, {'format': '<src> <dst> <linkname>'}, function (err, objs) {
  if (err) {
    throw err
  }
  var result = [{
    Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmaeuuKLHzirbVoTjb3659fyyV381amjaGrU2pecHEWPrN add.js',
    Err: '' },
    { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmTQhTtDWeaaP9pttDd1CuoVTLQm1w51ABfjgmGUbCUF6i cat.js',
    Err: '' },
    { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy files',
    Err: '' },
    { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmTjXxUemcuMAZ2KNN3iJGWHwrkMsW8SWEwkYVSBi1nFD9 ipfs-add.js',
    Err: '' },
    { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmXYUXDFNNh1wgwtX5QDG7MsuhAAcE9NzDYnz8SjnhvQrK ls.js',
    Err: '' },
    { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmUmDmH4hZgN5THnVP1VjJ1YWh5kWuhLGUihch8nFiD9iy version.js',
    Err: '' } ]
  assert.deepEqual(objs, result)
  done()
})
```

<a name="ipfs-nodejs-api-wrapper-tests-dht"></a>
## .dht
returns an error when getting a non-existent key from the DHT.

```js
this.timeout(20000)
apiClients['a'].dht.get('non-existent', {timeout: '100ms'}, function (err, value) {
  assert(err)
  done()
})
```

puts and gets a key value pair in the DHT.

```js
this.timeout(20000)
apiClients['a'].dht.put('scope', 'interplanetary', function (err, res) {
  if (err) {
    throw err
  }
  return done()
  // non ipns or pk hashes fail to fetch, known bug
  // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
  // apiClients['a'].dht.get('scope', function (err, value) {
  //  console.log('->>', err, value)
  //  if (err) {
  //    throw err
  //  }
  //  assert.equal(value, 'interplanetary')
  //  done()
  // })
})
```

.dht.findprovs.

```js
apiClients['a'].dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', function (err, res) {
  if (err) {
    throw err
  }
  assert(res)
  done()
})
```

