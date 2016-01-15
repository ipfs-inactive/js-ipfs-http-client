# TOC
   - [.add](#add)
   - [.block](#block)
   - [.cat](#cat)
   - [.commands](#commands)
   - [.config](#config)
   - [.dht](#dht)
   - [.diag](#diag)
   - [.id](#id)
   - [API](#api)
   - [.log](#log)
   - [.mount](#mount)
   - [.name](#name)
   - [.object](#object)
   - [.pin](#pin)
   - [.ping](#ping)
   - [.refs](#refs)
   - [.send](#send)
   - [.swarm](#swarm)
   - [.update (currently disabled, wait for IPFS 0.4.0)](#update-currently-disabled-wait-for-ipfs-040)
   - [.version](#version)

<a name="add"></a>
# .add
add file.

```js
done => {
    if (!isNode) {
      return done()
    }
    const file = new File({
      cwd: path.dirname(testfilePath),
      base: path.dirname(testfilePath),
      path: testfilePath,
      contents: new Buffer(testfile)
    })
    apiClients['a'].add
      if (err) throw err
      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      assert.equal(added.Name, path.basename(testfilePath))
      done()
    })
```

add buffer.

```js
done => {
    let buf = new Buffer(testfile)
    apiClients['a'].add
      if (err) throw err
      assert.equal(res.length, 1)
      const added = res[0]
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
```

add BIG buffer.

```js
done => {
    if (!isNode) {
      return done()
    }
    apiClients['a'].add
      if (err) throw err
      assert.equal(res.length, 1)
      const added = res[0]
      assert.equal(added.Hash, 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq')
      done()
    })
```

add path.

```js
done => {
    if (!isNode) {
      return done()
    }
    apiClients['a'].add
      if (err) throw err
      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
```

add a nested dir.

```js
done => {
    apiClients['a'].add
      if (isNode) {
        if (err) throw err
        const added = res[res.length - 1]
        assert.equal(added.Hash, 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg')
        done()
      } else {
        assert.equal(err.message, 'Recursive uploads are not supported in the browser')
        done()
      }
    })
```

add stream.

```js
done => {
    const stream = new Readable()
    stream.push('Hello world')
    stream.push(null)
    apiClients['a'].add
      if (err) throw err
      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'QmNRCQWfgze6AbBCaT1rkrkV5tJ2aP4oTNPb5JZcXYywve')
      done()
    })
```

add url.

```js
done => {
    const url = 'https://raw.githubusercontent.com/ipfs/js-ipfs-api/2a9cc63d7427353f2145af6b1a768a69e67c0588/README.md'
    apiClients['a'].add
      if (err) throw err
      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'QmZmHgEX9baxUn3qMjsEXQzG6DyNcrVnwieQQTrpDdrFvt')
      done()
    })
```

<a name="block"></a>
# .block
block.put.

```js
done => {
    apiClients['a'].block.put
      if (err) throw err
      const store = res.Key
      assert.equal(store, 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
      done()
    })
```

block.get.

```js
done => {
    apiClients['a'].block.get
      if (err) throw err
      let buf = ''
      res
        .on('data', function (data) { buf += data })
        .on('end', function () {
          assert.equal(buf, 'blorb')
          done()
        })
    })
```

<a name="cat"></a>
# .cat
cat.

```js
done => {
    apiClients['a'].cat
      if (err) {
        throw err
      }
      let buf = ''
      res
        .on('error', err => { throw err })
        .on('data', data => buf += data)
        .on('end', () => {
          assert.equal(buf, testfile)
          done()
        })
    })
```

cat BIG file.

```js
done => {
    if (!isNode) {
      return done()
    }
    apiClients['a'].cat
      if (err) {
        throw err
      }
      testfileBig = require('fs').createReadStream(__dirname + '/../15mb.random', { bufferSize: 128 })
      // Do not blow out the memory of nodejs :)
      streamEqual(res, testfileBig, (err, equal) => {
        if (err) throw err
        assert(equal)
        done()
      })
    })
```

<a name="commands"></a>
# .commands
lists commands.

```js
done => {
    apiClients['a'].commands
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
```

<a name="config"></a>
# .config
.config.{set, get}.

```js
done => {
    const confKey = 'arbitraryKey'
    const confVal = 'arbitraryVal'
    apiClients['a'].config.set
      if (err) throw err
      apiClients['a'].config.get(confKey, (err, res) => {
        if (err) throw err
        assert.equal(res.Value, confVal)
        done()
      })
    })
```

.config.show.

```js
done => {
    apiClients['c'].config.show
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
```

.config.replace.

```js
done => {
    if (!isNode) {
      return done()
    }
    apiClients['c'].config.replace
      if (err) {
        throw err
      }
      assert.equal(res, null)
      done()
    })
```

<a name="dht"></a>
# .dht
returns an error when getting a non-existent key from the DHT.

```js
done => {
       apiClients['a'].dht.get
         assert(err)
         done()
       })
```

puts and gets a key value pair in the DHT.

```js
done => {
    apiClients['a'].dht.put
      if (err) {
        throw err
      }
      assert.equal(typeof res, 'object')
      return done()
      // non ipns or pk hashes fail to fetch, known bug
      // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
      // apiClients['a'].dht.get('scope', (err, value) => {
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
done => {
    apiClients['a'].dht.findprovs
      if (err) {
        throw err
      }
      assert.equal(typeof res, 'object')
      assert(res)
      done()
    })
```

<a name="diag"></a>
# .diag
.diag.net.

```js
done => {
    apiClients['a'].diag.net
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
```

.diag.sys.

```js
done => {
    apiClients['a'].diag.sys
      if (err) {
        throw err
      }
      assert(res)
      assert(res.memory)
      assert(res.diskinfo)
      done()
    })
```

<a name="id"></a>
# .id
id.

```js
done => {
    apiClients['a'].id
      if (err) throw err
      const id = res
      assert(id.ID)
      assert(id.PublicKey)
      done()
    })
```

<a name="api"></a>
# API
has the api object.

```js
assert(apiClients['a'])
assert(apiClients['a'].id)
```

<a name="log"></a>
# .log
.log.tail.

```js
done => {
    apiClients['a'].log.tail
      if (err) {
        throw err
      }
      res.once('data', obj => {
        assert(obj)
        assert.equal(typeof obj, 'object')
        done()
      })
    })
```

<a name="name"></a>
# .name
.name.publish.

```js
done => {
    apiClients['a'].name.publish
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
done => {
    apiClients['a'].name.resolve
      if (err) {
        throw err
      }
      assert(res)
      assert.deepEqual(res, { Path: '/ipfs/' + name.Value })
      done()
    })
```

<a name="object"></a>
# .object
object.put.

```js
done => {
    apiClients['a'].object.put
      if (err) throw err
      const obj = res
      assert.equal(obj.Hash, testObjectHash)
      assert.equal(obj.Links.length, 0)
      done()
    })
```

object.get.

```js
done => {
    apiClients['a'].object.get
      if (err) {
        throw err
      }
      const obj = res
      assert.equal(obj.Data, 'testdata')
      assert.equal(obj.Links.length, 0)
      done()
    })
```

object.data.

```js
done => {
    apiClients['a'].object.data
      if (err) throw err
      let buf = ''
      res
        .on('error', err => { throw err })
        .on('data', data => buf += data)
        .on('end', () => {
          assert.equal(buf, 'testdata')
          done()
        })
    })
```

object.stat.

```js
done => {
    apiClients['a'].object.stat
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
done => {
    apiClients['a'].object.links
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
done => {
    apiClients['a'].object.put
      if (err) {
        throw err
      }
      apiClients['a'].object.patch(testObjectHash, ['add-link', 'next', testPatchObjectHash], (err, res) => {
        if (err) {
          throw err
        }
        assert.deepEqual(res, {
          Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd',
          Links: null
        })
        apiClients['a'].object.get(res.Hash, (err, res2) => {
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

<a name="pin"></a>
# .pin
.pin.add.

```js
done => {
    apiClients['b'].pin.add
      if (err) {
        throw err
      }
      assert.equal(res.Pinned[0], 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
```

.pin.list.

```js
done => {
    apiClients['b'].pin.list
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
```

.pin.remove.

```js
done => {
    apiClients['b'].pin.remove
      if (err) {
        throw err
      }
      assert(res)
      apiClients['b'].pin.list('direct', (err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        assert.equal(Object.keys(res.Keys).length, 0)
        done()
      })
    })
```

<a name="ping"></a>
# .ping
ping another peer.

```js
done => {
    // TODO remove this when https://github.com/ipfs/js-ipfs-api/issues/135 is resolved
    if (!isNode) {
      return done()
    }
    apiClients['b'].id
      if (err) {
        throw err
      }
      apiClients['a'].ping(id.ID, (err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        assert(res.Success)
        done()
      })
    })
```

<a name="refs"></a>
# .refs
refs.

```js
done => {
    if (!isNode) {
      return done()
    }
    apiClients['a'].refs
      if (err) {
        throw err
      }
      const result = [{
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmcUYKmQxmTcFom4R4UZP7FWeQzgJkwcFn51XrvsMy7PE9 add.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmNeHxDfQfjVFyYj2iruvysLH9zpp78v3cu1s3BZq1j5hY cat.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy files',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmU7wetVaAqc3Meurif9hcYBHGvQmL5QdpPJYBoZizyTNL ipfs-add.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmctZfSuegbi2TMFY2y3VQjxsH5JbRBu7XmiLfHNvshhio ls.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj test-folder',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmbkMNB6rwfYAxRvnG9CWJ6cKKHEdq2ZKTozyF5FQ7H8Rs version.js',
        Err: ''
      }]
      assert.deepEqual(objs, result)
      done()
    })
```

<a name="send"></a>
# .send
<a name="swarm"></a>
# .swarm
.swarm.peers.

```js
done => {
    apiClients['a'].swarm.peers
      if (err) {
        throw err
      }
      assert(res.Strings.length >= 2)
      done()
    })
```

.swarm.connect.

```js
done => {
    // Done in the 'before' segment
    done()
```

<a name="update-currently-disabled-wait-for-ipfs-040"></a>
# .update (currently disabled, wait for IPFS 0.4.0)
<a name="version"></a>
# .version
checks the version.

```js
done => {
    apiClients['a'].version
      if (err) {
        throw err
      }
      assert(res)
      assert(res.Version)
      console.log('      - running against version', res.Version)
      done()
    })
```

