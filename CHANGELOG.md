<a name="27.0.0"></a>
# [27.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v26.1.2...v27.0.0) (2018-11-28)


### Bug Fixes

* also retry with misnemed format "dag-cbor" as "cbor" ([#888](https://github.com/ipfs/js-ipfs-http-client/issues/888)) ([348a144](https://github.com/ipfs/js-ipfs-http-client/commit/348a144))
* better input validation for add ([#876](https://github.com/ipfs/js-ipfs-http-client/issues/876)) ([315b7f7](https://github.com/ipfs/js-ipfs-http-client/commit/315b7f7))
* fix log.tail by calling add after listening for events ([#882](https://github.com/ipfs/js-ipfs-http-client/issues/882)) ([da35b0f](https://github.com/ipfs/js-ipfs-http-client/commit/da35b0f))
* handle peer-info validation errors ([#887](https://github.com/ipfs/js-ipfs-http-client/issues/887)) ([6e6d7a2](https://github.com/ipfs/js-ipfs-http-client/commit/6e6d7a2)), closes [#885](https://github.com/ipfs/js-ipfs-http-client/issues/885)
* updates ipld-dag-pb dep to version without .cid properties ([#889](https://github.com/ipfs/js-ipfs-http-client/issues/889)) ([ac30a82](https://github.com/ipfs/js-ipfs-http-client/commit/ac30a82))


### Code Refactoring

* object API write methods now return CIDs ([#896](https://github.com/ipfs/js-ipfs-http-client/issues/896)) ([38bed14](https://github.com/ipfs/js-ipfs-http-client/commit/38bed14))
* rename library to ipfs-http-client ([#897](https://github.com/ipfs/js-ipfs-http-client/issues/897)) ([d40cb6c](https://github.com/ipfs/js-ipfs-http-client/commit/d40cb6c))
* updated files API ([#878](https://github.com/ipfs/js-ipfs-http-client/issues/878)) ([39f4733](https://github.com/ipfs/js-ipfs-http-client/commit/39f4733))


### BREAKING CHANGES

* the `ipfs-api` library has been renamed to `ipfs-http-client`.

Now install via `npm install ipfs-http-client`.

Note that in the browser build the object attached to `window` is now `window.IpfsHttpClient`.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>

* Object API refactor.

Object API methods that write DAG nodes now return a CID instead of a DAG node. Affected methods:

* `ipfs.object.new`
* `ipfs.object.patch.addLink`
* `ipfs.object.patch.appendData`
* `ipfs.object.patch.rmLink`
* `ipfs.object.patch.setData`
* `ipfs.object.put`

Example:

```js
// Before
const dagNode = await ipfs.object.new()
```

```js
// After
const cid = await ipfs.object.new() // now returns a CID
const dagNode = await ipfs.object.get(cid) // fetch the DAG node that was created
```

IMPORTANT: `DAGNode` instances, which are part of the IPLD dag-pb format have been refactored.

These instances no longer have `multihash`, `cid` or `serialized` properties.

This effects the following API methods that return these types of objects:

* `ipfs.object.get`
* `ipfs.dag.get`

See https://github.com/ipld/js-ipld-dag-pb/pull/99 for more information.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>

* Files API methods `add*`, `cat*`, `get*` have moved from `files` to the root namespace.

Specifically, the following changes have been made:

* `ipfs.files.add` => `ipfs.add`
* `ipfs.files.addPullStream` => `ipfs.addPullStream`
* `ipfs.files.addReadableStream` => `ipfs.addReadableStream`
* `ipfs.files.cat` => `ipfs.cat`
* `ipfs.files.catPullStream` => `ipfs.catPullStream`
* `ipfs.files.catReadableStream` => `ipfs.catReadableStream`
* `ipfs.files.get` => `ipfs.get`
* `ipfs.files.getPullStream` => `ipfs.getPullStream`
* `ipfs.files.getReadableStream` => `ipfs.getReadableStream`

Additionally, `addFromFs`, `addFromUrl`, `addFromStream` have moved from `util` to the root namespace:

* `ipfs.util.addFromFs` => `ipfs.addFromFs`
* `ipfs.util.addFromUrl` => `ipfs.addFromUrl`
* `ipfs.util.addFromStream` => `ipfs.addFromStream`

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>

* Previously `swarm.peers` would throw an uncaught error if any peer in the response could not have its peerId or multiaddr validated.

This change catches errors that occur while validating the peer info. The returned array will contain an entry for every peer in the ipfs response. peer-info objects that couldn't be validated, now have an `error` property and a `rawPeerInfo` property. This at least means the count of peers in the response will be accurate, and there the info is available to the caller.

This means that callers now have to deal with peer-info objects that may
not have a `peer` or `addr` property.

Adds `nock` tests to exercice the code under different error conditions. Doing so uncovered a bug in our legacy go-ipfs <= 0.4.4 peer info parsing, which is also fixed. The code was trying to decapusalate the peerId from the multiaddr, but doing so trims the peerId rather than returning it.

License: MIT
Signed-off-by: Oli Evans <oli@tableflip.io>


<a name="26.1.2"></a>
## [26.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v26.1.0...v26.1.2) (2018-11-03)


### Features

* go-ipfs 0.4.18 ([e3e4d6c](https://github.com/ipfs/js-ipfs-http-client/commit/e3e4d6c))
* upload example works with big files ([62b844f](https://github.com/ipfs/js-ipfs-http-client/commit/62b844f))



<a name="26.1.1"></a>
## [26.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v26.1.0...v26.1.1) (2018-11-03)


### Features

* go-ipfs 0.4.18 ([9178e7d](https://github.com/ipfs/js-ipfs-http-client/commit/9178e7d))



<a name="26.1.0"></a>
# [26.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.3...v26.1.0) (2018-10-31)


### Bug Fixes

* make ping not mix errors with responses ([#883](https://github.com/ipfs/js-ipfs-http-client/issues/883)) ([80725f2](https://github.com/ipfs/js-ipfs-http-client/commit/80725f2))



<a name="26.0.3"></a>
## [26.0.3](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.2...v26.0.3) (2018-10-31)



<a name="26.0.2"></a>
## [26.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.0...v26.0.2) (2018-10-31)


### Bug Fixes

* pin.ls ignored opts when hash was present ([#875](https://github.com/ipfs/js-ipfs-http-client/issues/875)) ([0b46750](https://github.com/ipfs/js-ipfs-http-client/commit/0b46750)), closes [/github.com/ipfs-shipyard/ipfs-companion/issues/360#issuecomment-427525801](https://github.com//github.com/ipfs-shipyard/ipfs-companion/issues/360/issues/issuecomment-427525801)



<a name="26.0.1"></a>
## [26.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.0...v26.0.1) (2018-10-30)



<a name="26.0.0"></a>
# [26.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v25.0.0...v26.0.0) (2018-10-30)


### Bug Fixes

* add missing and remove unused dependencies ([#879](https://github.com/ipfs/js-ipfs-http-client/issues/879)) ([979d8b5](https://github.com/ipfs/js-ipfs-http-client/commit/979d8b5))


### Chores

* remove ipld formats re-export ([#872](https://github.com/ipfs/js-ipfs-http-client/issues/872)) ([c534375](https://github.com/ipfs/js-ipfs-http-client/commit/c534375))
* update to ipld-dag-cbor 0.13 ([0652ac0](https://github.com/ipfs/js-ipfs-http-client/commit/0652ac0))


### Features

* ipns over pubsub ([#846](https://github.com/ipfs/js-ipfs-http-client/issues/846)) ([ef49e95](https://github.com/ipfs/js-ipfs-http-client/commit/ef49e95))


### BREAKING CHANGES

* dag-cbor nodes now represent links as CID objects

The API for [dag-cbor](https://github.com/ipld/js-ipld-dag-cbor) changed.
Links are no longer represented as JSON objects (`{"/": "base-encoded-cid"}`,
but as [CID objects](https://github.com/ipld/js-cid). `ipfs.dag.get()` and
now always return links as CID objects. `ipfs.dag.put()` also expects links
to be represented as CID objects. The old-style JSON objects representation
is still supported, but deprecated.

Prior to this change:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
// Link as JSON object representation
const putCid = await ipfs.dag.put({link: {'/': cid.toBaseEncodedString()}})
const result = await ipfs.dag.get(putCid)
console.log(result.value)

```

Output:

```js
{ link:
   { '/':
      <Buffer 12 20 8a…> } }
```

Now:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
// Link as CID object
const putCid = await ipfs.dag.put({link: cid})
const result = await ipfs.dag.get(putCid)
console.log(result.value)
```

Output:

```js
{ link:
   CID {
     codec: 'dag-pb',
     version: 0,
     multihash:
      <Buffer 12 20 8a…> } }
```

See https://github.com/ipld/ipld/issues/44 for more information on why this
change was made.
* remove `types.dagCBOR` and `types.dagPB` from public API

If you need the `ipld-dag-cbor` or `ipld-dag-pb` module in the Browser,
you need to bundle them yourself.



<a name="25.0.0"></a>
# [25.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v24.0.2...v25.0.0) (2018-10-15)


### Bug Fixes

* >150mb bodies no longer crashing Chromium ([#868](https://github.com/ipfs/js-ipfs-http-client/issues/868)) ([180da77](https://github.com/ipfs/js-ipfs-http-client/commit/180da77)), closes [#654](https://github.com/ipfs/js-ipfs-http-client/issues/654)
* add bl module to package dependencies ([#853](https://github.com/ipfs/js-ipfs-http-client/issues/853)) ([#854](https://github.com/ipfs/js-ipfs-http-client/issues/854)) ([834934f](https://github.com/ipfs/js-ipfs-http-client/commit/834934f))
* add lodash dependency ([#873](https://github.com/ipfs/js-ipfs-http-client/issues/873)) ([c510cb7](https://github.com/ipfs/js-ipfs-http-client/commit/c510cb7)), closes [#870](https://github.com/ipfs/js-ipfs-http-client/issues/870)



<a name="24.0.2"></a>
## [24.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v24.0.1...v24.0.2) (2018-09-21)


### Bug Fixes

* block.put options ([#844](https://github.com/ipfs/js-ipfs-http-client/issues/844)) ([e290a38](https://github.com/ipfs/js-ipfs-http-client/commit/e290a38))



<a name="24.0.1"></a>
## [24.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v24.0.0...v24.0.1) (2018-08-21)



<a name="24.0.0"></a>
# [24.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v23.0.0...v24.0.0) (2018-08-15)


### Bug Fixes

* add test data to IPFS before fetching it ([#832](https://github.com/ipfs/js-ipfs-http-client/issues/832)) ([b2a77d6](https://github.com/ipfs/js-ipfs-http-client/commit/b2a77d6))
* BREAKING CHANGE use data-encoding arg so data is not corrupted ([#806](https://github.com/ipfs/js-ipfs-http-client/issues/806)) ([553c3fb](https://github.com/ipfs/js-ipfs-http-client/commit/553c3fb))
* dag.get return error on missing multicodec ([#831](https://github.com/ipfs/js-ipfs-http-client/issues/831)) ([ff7c7e5](https://github.com/ipfs/js-ipfs-http-client/commit/ff7c7e5))
* remove external urls from addFromURL tests ([#834](https://github.com/ipfs/js-ipfs-http-client/issues/834)) ([7cf7998](https://github.com/ipfs/js-ipfs-http-client/commit/7cf7998)), closes [#803](https://github.com/ipfs/js-ipfs-http-client/issues/803)


### BREAKING CHANGES

* Requires go-ipfs 0.4.17 as it allows for specifying the data encoding format when requesting object data.



<a name="23.0.0"></a>
# [23.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.3.0...v23.0.0) (2018-08-06)


### Bug Fixes

* config get ([#825](https://github.com/ipfs/js-ipfs-http-client/issues/825)) ([ef5a4a3](https://github.com/ipfs/js-ipfs-http-client/commit/ef5a4a3))


### Features

* add resolve cmd ([#826](https://github.com/ipfs/js-ipfs-http-client/issues/826)) ([c7ad0e4](https://github.com/ipfs/js-ipfs-http-client/commit/c7ad0e4))



<a name="22.3.0"></a>
# [22.3.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.4...v22.3.0) (2018-08-02)


### Bug Fixes

* config.set rejects buffer values ([#800](https://github.com/ipfs/js-ipfs-http-client/issues/800)) ([f3e6bf1](https://github.com/ipfs/js-ipfs-http-client/commit/f3e6bf1))


### Features

* compatible with go-ipfs 0.4.16 ([8536ee4](https://github.com/ipfs/js-ipfs-http-client/commit/8536ee4))
* expose mfs files.read*Stream methods ([#823](https://github.com/ipfs/js-ipfs-http-client/issues/823)) ([70c9df1](https://github.com/ipfs/js-ipfs-http-client/commit/70c9df1))



<a name="22.2.4"></a>
## [22.2.4](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.3...v22.2.4) (2018-07-17)


### Bug Fixes

* increase browserNoActivityTimeout to account for before ([328e338](https://github.com/ipfs/js-ipfs-http-client/commit/328e338))
* increase timeout for .name after all ([3dc4313](https://github.com/ipfs/js-ipfs-http-client/commit/3dc4313))
* missing debug dependency fixes [#809](https://github.com/ipfs/js-ipfs-http-client/issues/809) ([#810](https://github.com/ipfs/js-ipfs-http-client/issues/810)) ([0f1fe95](https://github.com/ipfs/js-ipfs-http-client/commit/0f1fe95))



<a name="22.2.3"></a>
## [22.2.3](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.2...v22.2.3) (2018-07-10)


### Bug Fixes

* Request logging broken in Electron ([#808](https://github.com/ipfs/js-ipfs-http-client/issues/808)) ([52298ae](https://github.com/ipfs/js-ipfs-http-client/commit/52298ae))



<a name="22.2.2"></a>
## [22.2.2](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.1...v22.2.2) (2018-07-05)


### Bug Fixes

* ignore response body for some mfs commands ([#805](https://github.com/ipfs/js-ipfs-http-client/issues/805)) ([b604a64](https://github.com/ipfs/js-ipfs-http-client/commit/b604a64))


### Features

* modular interface tests ([#785](https://github.com/ipfs/js-ipfs-http-client/issues/785)) ([2426072](https://github.com/ipfs/js-ipfs-http-client/commit/2426072)), closes [#339](https://github.com/ipfs/js-ipfs-http-client/issues/339) [#802](https://github.com/ipfs/js-ipfs-http-client/issues/802) [#801](https://github.com/ipfs/js-ipfs-http-client/issues/801)



<a name="22.2.1"></a>
## [22.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.0...v22.2.1) (2018-06-29)


### Bug Fixes

* res.req only in Node.js, in browser use res.url instead ([#798](https://github.com/ipfs/js-ipfs-http-client/issues/798)) ([e8a5ab9](https://github.com/ipfs/js-ipfs-http-client/commit/e8a5ab9))



<a name="22.2.0"></a>
# [22.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.1.1...v22.2.0) (2018-06-29)


### Features

* logs path & querystring for requests ([#796](https://github.com/ipfs/js-ipfs-http-client/issues/796)) ([4e55d19](https://github.com/ipfs/js-ipfs-http-client/commit/4e55d19))



<a name="22.1.1"></a>
## [22.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v22.1.0...v22.1.1) (2018-06-25)


### Bug Fixes

* get block with empty data ([#789](https://github.com/ipfs/js-ipfs-http-client/issues/789)) ([88edd83](https://github.com/ipfs/js-ipfs-http-client/commit/88edd83))



<a name="22.1.0"></a>
# [22.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.0.2...v22.1.0) (2018-06-18)


### Features

* add support for custom headers to send-request ([#741](https://github.com/ipfs/js-ipfs-http-client/issues/741)) ([7fb2e07](https://github.com/ipfs/js-ipfs-http-client/commit/7fb2e07))
* implement bitswap wantlist peer ID param and bitswap unwant ([#761](https://github.com/ipfs/js-ipfs-http-client/issues/761)) ([73a153e](https://github.com/ipfs/js-ipfs-http-client/commit/73a153e))



<a name="22.0.2"></a>
## [22.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v22.0.1...v22.0.2) (2018-06-14)


### Bug Fixes

* json-loader error in upload-file-via-browser example ([#784](https://github.com/ipfs/js-ipfs-http-client/issues/784)) ([5e7b7c4](https://github.com/ipfs/js-ipfs-http-client/commit/5e7b7c4))



<a name="22.0.1"></a>
## [22.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v22.0.0...v22.0.1) (2018-05-30)


### Bug Fixes

* configure webpack to not use esmodules in dependencies ([dc14333](https://github.com/ipfs/js-ipfs-http-client/commit/dc14333))
* correctly differentiate pong responses ([4ad25a3](https://github.com/ipfs/js-ipfs-http-client/commit/4ad25a3))
* util.addFromURL with URL-escaped file ([a3bd811](https://github.com/ipfs/js-ipfs-http-client/commit/a3bd811))



<a name="22.0.0"></a>
# [22.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v21.0.0...v22.0.0) (2018-05-20)


### Bug Fixes

* callback from unsub after stream ends ([51a80f2](https://github.com/ipfs/js-ipfs-http-client/commit/51a80f2))
* do not fail stop node if failed start node ([533760f](https://github.com/ipfs/js-ipfs-http-client/commit/533760f))
* **ping:** convert the ping messages to lowercase ([632af40](https://github.com/ipfs/js-ipfs-http-client/commit/632af40))
* more robust ping tests ([fc6d301](https://github.com/ipfs/js-ipfs-http-client/commit/fc6d301))
* remove .only ([0e21c8a](https://github.com/ipfs/js-ipfs-http-client/commit/0e21c8a))
* result.Peers can be null, ensure callback is called ([f5f2e83](https://github.com/ipfs/js-ipfs-http-client/commit/f5f2e83))
* update asserted error message ([17c1f1c](https://github.com/ipfs/js-ipfs-http-client/commit/17c1f1c))
* use async/setImmediate vs process.nextTick ([faa51b4](https://github.com/ipfs/js-ipfs-http-client/commit/faa51b4))



<a name="21.0.0"></a>
# [21.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v20.2.1...v21.0.0) (2018-05-12)


### Bug Fixes

* make pubsub.unsubscribe async and alter pubsub.subscribe signature ([b98f8f3](https://github.com/ipfs/js-ipfs-http-client/commit/b98f8f3))


### BREAKING CHANGES

* pubsub.unsubscribe is now async and argument order for pubsub.subscribe has changed

License: MIT
Signed-off-by: Alan Shaw <alan@tableflip.io>



<a name="20.2.1"></a>
## [20.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v20.2.0...v20.2.1) (2018-05-06)



<a name="20.2.0"></a>
# [20.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v20.0.1...v20.2.0) (2018-04-30)


### Bug Fixes

* adding files by pull stream ([2fa16c5](https://github.com/ipfs/js-ipfs-http-client/commit/2fa16c5))
* handle request errors in addFromURL ([7c5cea5](https://github.com/ipfs/js-ipfs-http-client/commit/7c5cea5))
* increase timeout for name.publish and fix setup code ([ceb1106](https://github.com/ipfs/js-ipfs-http-client/commit/ceb1106))
* ipfs add url wrap doesn't work ([#750](https://github.com/ipfs/js-ipfs-http-client/issues/750)) ([f6f1bf0](https://github.com/ipfs/js-ipfs-http-client/commit/f6f1bf0))


### Features

* Add offset/length arguments to files.cat ([17967c1](https://github.com/ipfs/js-ipfs-http-client/commit/17967c1))
* get it ready for release ([#751](https://github.com/ipfs/js-ipfs-http-client/issues/751)) ([1885af4](https://github.com/ipfs/js-ipfs-http-client/commit/1885af4))



<a name="20.1.0"></a>
# [20.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v20.0.1...v20.1.0) (2018-04-30)


### Bug Fixes

* adding files by pull stream ([2fa16c5](https://github.com/ipfs/js-ipfs-http-client/commit/2fa16c5))
* handle request errors in addFromURL ([7c5cea5](https://github.com/ipfs/js-ipfs-http-client/commit/7c5cea5))
* increase timeout for name.publish and fix setup code ([ceb1106](https://github.com/ipfs/js-ipfs-http-client/commit/ceb1106))
* ipfs add url wrap doesn't work ([#750](https://github.com/ipfs/js-ipfs-http-client/issues/750)) ([f6f1bf0](https://github.com/ipfs/js-ipfs-http-client/commit/f6f1bf0))


### Features

* Add offset/length arguments to files.cat ([17967c1](https://github.com/ipfs/js-ipfs-http-client/commit/17967c1))
* get it ready for release ([#751](https://github.com/ipfs/js-ipfs-http-client/issues/751)) ([1885af4](https://github.com/ipfs/js-ipfs-http-client/commit/1885af4))



<a name="20.0.1"></a>
## [20.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v20.0.0...v20.0.1) (2018-04-12)



<a name="20.0.0"></a>
# [20.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v19.0.0...v20.0.0) (2018-04-05)


### Bug Fixes

* **dag:** js-ipld format resolver take the raw block ([2683c7e](https://github.com/ipfs/js-ipfs-http-client/commit/2683c7e))
* **dag:** path logic for DAG get was wrong ([d2b203b](https://github.com/ipfs/js-ipfs-http-client/commit/d2b203b))
* **dag:** use SendOneFile for dag put ([9c37213](https://github.com/ipfs/js-ipfs-http-client/commit/9c37213))


### Features

* dag.put ([9463d3a](https://github.com/ipfs/js-ipfs-http-client/commit/9463d3a))
* **dag:** proper get implementation ([7ba0343](https://github.com/ipfs/js-ipfs-http-client/commit/7ba0343))
* **dag:** rebase, use waterfall for put ([ad9eab8](https://github.com/ipfs/js-ipfs-http-client/commit/ad9eab8))
* **dag:** update option names to reflect go-ipfs API ([9bf1c6c](https://github.com/ipfs/js-ipfs-http-client/commit/9bf1c6c))
* Provide access to bundled libraries when in browser ([#732](https://github.com/ipfs/js-ipfs-http-client/issues/732)) ([994bdad](https://github.com/ipfs/js-ipfs-http-client/commit/994bdad)), closes [#406](https://github.com/ipfs/js-ipfs-http-client/issues/406)
* public-readonly-method-for-getting-host-and-port ([41d32e3](https://github.com/ipfs/js-ipfs-http-client/commit/41d32e3)), closes [#580](https://github.com/ipfs/js-ipfs-http-client/issues/580)
* Wrap with dir ([#730](https://github.com/ipfs/js-ipfs-http-client/issues/730)) ([160860e](https://github.com/ipfs/js-ipfs-http-client/commit/160860e))



<a name="19.0.0"></a>
# [19.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v18.2.1...v19.0.0) (2018-03-28)


### Bug Fixes

* **bitswap:** 0.4.14 returns empty array instead of null ([5e37a54](https://github.com/ipfs/js-ipfs-http-client/commit/5e37a54))
* **ping:** tests were failing and there it was missing to catch when count and n are used at the same time ([2181568](https://github.com/ipfs/js-ipfs-http-client/commit/2181568))


### Features

* streamable ping and optional packet number ([#723](https://github.com/ipfs/js-ipfs-http-client/issues/723)) ([3f3ce8a](https://github.com/ipfs/js-ipfs-http-client/commit/3f3ce8a))



<a name="18.2.1"></a>
## [18.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v18.2.0...v18.2.1) (2018-03-22)


### Features

* add ability to files.cat with a cid instance ([aeeb94e](https://github.com/ipfs/js-ipfs-http-client/commit/aeeb94e))



<a name="18.2.0"></a>
# [18.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v18.1.2...v18.2.0) (2018-03-16)


### Bug Fixes

* disable Browser test on Windows ([385a6c3](https://github.com/ipfs/js-ipfs-http-client/commit/385a6c3))
* don't create one webpack bundle for every test file ([3967e96](https://github.com/ipfs/js-ipfs-http-client/commit/3967e96))
* last fixes for green ([#719](https://github.com/ipfs/js-ipfs-http-client/issues/719)) ([658bad2](https://github.com/ipfs/js-ipfs-http-client/commit/658bad2))
* set the FileResultStreamConverter explicitly ([dfad55e](https://github.com/ipfs/js-ipfs-http-client/commit/dfad55e)), closes [#696](https://github.com/ipfs/js-ipfs-http-client/issues/696)
* use a different remote server for test ([1fc15a5](https://github.com/ipfs/js-ipfs-http-client/commit/1fc15a5))


### Features

* --only-hash ([#717](https://github.com/ipfs/js-ipfs-http-client/issues/717)) ([1137401](https://github.com/ipfs/js-ipfs-http-client/commit/1137401)), closes [#700](https://github.com/ipfs/js-ipfs-http-client/issues/700)
* add support for ipfs files stat --with-local ([#695](https://github.com/ipfs/js-ipfs-http-client/issues/695)) ([b08f21a](https://github.com/ipfs/js-ipfs-http-client/commit/b08f21a))



<a name="18.1.2"></a>
## [18.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v18.1.1...v18.1.2) (2018-03-09)


### Bug Fixes

* regression on files.add and update deps ([#709](https://github.com/ipfs/js-ipfs-http-client/issues/709)) ([85cc2a8](https://github.com/ipfs/js-ipfs-http-client/commit/85cc2a8))
* remove argument from .stats.bw* ([#699](https://github.com/ipfs/js-ipfs-http-client/issues/699)) ([f81dce5](https://github.com/ipfs/js-ipfs-http-client/commit/f81dce5))



<a name="18.1.1"></a>
## [18.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v18.0.0...v18.1.1) (2018-02-20)


### Features

* support recursive ipfs ls  ([cfe95f6](https://github.com/ipfs/js-ipfs-http-client/commit/cfe95f6))



<a name="18.1.0"></a>
# [18.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v18.0.0...v18.1.0) (2018-02-20)


### Features

* support recursive ipfs ls  ([cfe95f6](https://github.com/ipfs/js-ipfs-http-client/commit/cfe95f6))



<a name="18.0.0"></a>
# [18.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.5.0...v18.0.0) (2018-02-14)


### Bug Fixes

* exception when dir is empty ([#680](https://github.com/ipfs/js-ipfs-http-client/issues/680)) ([ec04f6e](https://github.com/ipfs/js-ipfs-http-client/commit/ec04f6e))
* support all the Buffer shims and load fixtures correctly ([066988f](https://github.com/ipfs/js-ipfs-http-client/commit/066988f))
* update stats API ([#684](https://github.com/ipfs/js-ipfs-http-client/issues/684)) ([4f7999d](https://github.com/ipfs/js-ipfs-http-client/commit/4f7999d))


### Features

* (breaking change) stats spec, spec repo, stream to value on files read ([#679](https://github.com/ipfs/js-ipfs-http-client/issues/679)) ([118456e](https://github.com/ipfs/js-ipfs-http-client/commit/118456e))
* **breaking change:** use stream on stats.bw ([#686](https://github.com/ipfs/js-ipfs-http-client/issues/686)) ([895760e](https://github.com/ipfs/js-ipfs-http-client/commit/895760e))
* ipfs.stop ([5091115](https://github.com/ipfs/js-ipfs-http-client/commit/5091115))



<a name="17.5.0"></a>
# [17.5.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.3.0...v17.5.0) (2018-01-24)


### Bug Fixes

* normalize stats fields ([#669](https://github.com/ipfs/js-ipfs-http-client/issues/669)) ([5803d39](https://github.com/ipfs/js-ipfs-http-client/commit/5803d39))


### Features

* /api/v0/repo/version ([#676](https://github.com/ipfs/js-ipfs-http-client/issues/676)) ([ecf70b9](https://github.com/ipfs/js-ipfs-http-client/commit/ecf70b9))
* integrate new ipfsd-ctl ([2b1820b](https://github.com/ipfs/js-ipfs-http-client/commit/2b1820b))



<a name="17.4.0"></a>
# [17.4.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.3.0...v17.4.0) (2018-01-24)


### Bug Fixes

* normalize stats fields ([#669](https://github.com/ipfs/js-ipfs-http-client/issues/669)) ([5803d39](https://github.com/ipfs/js-ipfs-http-client/commit/5803d39))


### Features

* integrate new ipfsd-ctl ([2b1820b](https://github.com/ipfs/js-ipfs-http-client/commit/2b1820b))



<a name="17.3.0"></a>
# [17.3.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.7...v17.3.0) (2018-01-12)


### Features

* /api/v0/dns ([#665](https://github.com/ipfs/js-ipfs-http-client/issues/665)) ([81016bb](https://github.com/ipfs/js-ipfs-http-client/commit/81016bb))



<a name="17.2.7"></a>
## [17.2.7](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.6...v17.2.7) (2018-01-11)


### Bug Fixes

* name and key tests ([#661](https://github.com/ipfs/js-ipfs-http-client/issues/661)) ([5ab1d02](https://github.com/ipfs/js-ipfs-http-client/commit/5ab1d02))


### Features

* normalize KEY API ([#659](https://github.com/ipfs/js-ipfs-http-client/issues/659)) ([1b10821](https://github.com/ipfs/js-ipfs-http-client/commit/1b10821))
* normalize NAME API ([#658](https://github.com/ipfs/js-ipfs-http-client/issues/658)) ([9b8ef48](https://github.com/ipfs/js-ipfs-http-client/commit/9b8ef48))



<a name="17.2.6"></a>
## [17.2.6](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.5...v17.2.6) (2017-12-28)


### Features

* support key/export and key/import ([#653](https://github.com/ipfs/js-ipfs-http-client/issues/653)) ([496f08e](https://github.com/ipfs/js-ipfs-http-client/commit/496f08e))



<a name="17.2.5"></a>
## [17.2.5](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.4...v17.2.5) (2017-12-20)


### Bug Fixes

* **files.add:** handle weird directory names ([#646](https://github.com/ipfs/js-ipfs-http-client/issues/646)) ([012b86c](https://github.com/ipfs/js-ipfs-http-client/commit/012b86c))


### Features

* add files/flush ([#643](https://github.com/ipfs/js-ipfs-http-client/issues/643)) ([5c254eb](https://github.com/ipfs/js-ipfs-http-client/commit/5c254eb))
* support key/rm and key/rename ([#641](https://github.com/ipfs/js-ipfs-http-client/issues/641)) ([113030a](https://github.com/ipfs/js-ipfs-http-client/commit/113030a))



<a name="17.2.4"></a>
## [17.2.4](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.3...v17.2.4) (2017-12-06)


### Bug Fixes

* stats/bw uses stream ([#640](https://github.com/ipfs/js-ipfs-http-client/issues/640)) ([c4e922e](https://github.com/ipfs/js-ipfs-http-client/commit/c4e922e))



<a name="17.2.3"></a>
## [17.2.3](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.2...v17.2.3) (2017-12-05)



<a name="17.2.2"></a>
## [17.2.2](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.1...v17.2.2) (2017-12-05)



<a name="17.2.1"></a>
## [17.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.0...v17.2.1) (2017-12-05)


### Features

* add the stat commands ([#639](https://github.com/ipfs/js-ipfs-http-client/issues/639)) ([76c3068](https://github.com/ipfs/js-ipfs-http-client/commit/76c3068))



<a name="17.2.0"></a>
# [17.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.3...v17.2.0) (2017-12-01)


### Bug Fixes

* propagate trailer errors correctly ([#636](https://github.com/ipfs/js-ipfs-http-client/issues/636)) ([62d733e](https://github.com/ipfs/js-ipfs-http-client/commit/62d733e))



<a name="17.1.3"></a>
## [17.1.3](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.2...v17.1.3) (2017-11-23)



<a name="17.1.2"></a>
## [17.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.1...v17.1.2) (2017-11-22)


### Bug Fixes

* config.replace ([#634](https://github.com/ipfs/js-ipfs-http-client/issues/634)) ([79d79c5](https://github.com/ipfs/js-ipfs-http-client/commit/79d79c5)), closes [#633](https://github.com/ipfs/js-ipfs-http-client/issues/633)



<a name="17.1.1"></a>
## [17.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.0...v17.1.1) (2017-11-22)


### Bug Fixes

* pubsub do not eat error messages ([#632](https://github.com/ipfs/js-ipfs-http-client/issues/632)) ([5a1bf9b](https://github.com/ipfs/js-ipfs-http-client/commit/5a1bf9b))



<a name="17.1.0"></a>
# [17.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.0.1...v17.1.0) (2017-11-20)


### Features

* send files HTTP request should stream ([#629](https://github.com/ipfs/js-ipfs-http-client/issues/629)) ([dae62cb](https://github.com/ipfs/js-ipfs-http-client/commit/dae62cb))



<a name="17.0.1"></a>
## [17.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v17.0.0...v17.0.1) (2017-11-20)


### Bug Fixes

* allow topicCIDs from older peers ([#631](https://github.com/ipfs/js-ipfs-http-client/issues/631)) ([fe7cc22](https://github.com/ipfs/js-ipfs-http-client/commit/fe7cc22))



<a name="17.0.0"></a>
# [17.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v16.0.0...v17.0.0) (2017-11-17)


### Features

* Implementing the new interfaces ([#619](https://github.com/ipfs/js-ipfs-http-client/issues/619)) ([e1b38bf](https://github.com/ipfs/js-ipfs-http-client/commit/e1b38bf))



<a name="16.0.0"></a>
# [16.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v15.1.0...v16.0.0) (2017-11-16)


### Bug Fixes

* pubsub message fields ([#627](https://github.com/ipfs/js-ipfs-http-client/issues/627)) ([470777d](https://github.com/ipfs/js-ipfs-http-client/commit/470777d))



<a name="15.1.0"></a>
# [15.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v15.0.2...v15.1.0) (2017-11-14)


### Bug Fixes

* adapting HTTP API to the interface-ipfs-core spec ([#625](https://github.com/ipfs/js-ipfs-http-client/issues/625)) ([8e58225](https://github.com/ipfs/js-ipfs-http-client/commit/8e58225))


### Features

* windows interop ([#624](https://github.com/ipfs/js-ipfs-http-client/issues/624)) ([40557d0](https://github.com/ipfs/js-ipfs-http-client/commit/40557d0))



<a name="15.0.2"></a>
## [15.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v15.0.1...v15.0.2) (2017-11-13)



<a name="15.0.1"></a>
## [15.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v15.0.0...v15.0.1) (2017-10-22)



<a name="15.0.0"></a>
# [15.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.7...v15.0.0) (2017-10-22)


### Features

* update pin API to match interface-ipfs-core ([9102643](https://github.com/ipfs/js-ipfs-http-client/commit/9102643))



<a name="14.3.7"></a>
## [14.3.7](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.6...v14.3.7) (2017-10-18)



<a name="14.3.6"></a>
## [14.3.6](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.5...v14.3.6) (2017-10-18)


### Bug Fixes

* pass the config protocol to http requests ([#609](https://github.com/ipfs/js-ipfs-http-client/issues/609)) ([38d7289](https://github.com/ipfs/js-ipfs-http-client/commit/38d7289))


### Features

* avoid doing multiple RPC requests for files.add, fixes [#522](https://github.com/ipfs/js-ipfs-http-client/issues/522) ([#595](https://github.com/ipfs/js-ipfs-http-client/issues/595)) ([0ea5f57](https://github.com/ipfs/js-ipfs-http-client/commit/0ea5f57))
* report progress on ipfs add  ([e2d894c](https://github.com/ipfs/js-ipfs-http-client/commit/e2d894c))



<a name="14.3.5"></a>
## [14.3.5](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.4...v14.3.5) (2017-09-08)


### Features

* Support specify hash algorithm in files.add ([#597](https://github.com/ipfs/js-ipfs-http-client/issues/597)) ([ed68657](https://github.com/ipfs/js-ipfs-http-client/commit/ed68657))



<a name="14.3.4"></a>
## [14.3.4](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.3...v14.3.4) (2017-09-07)



<a name="14.3.3"></a>
## [14.3.3](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.2...v14.3.3) (2017-09-07)


### Features

* support options for .add / files.add  ([8c717b2](https://github.com/ipfs/js-ipfs-http-client/commit/8c717b2))



<a name="14.3.2"></a>
## [14.3.2](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.1...v14.3.2) (2017-09-04)


### Bug Fixes

* new fixed aegir ([93ac472](https://github.com/ipfs/js-ipfs-http-client/commit/93ac472))
