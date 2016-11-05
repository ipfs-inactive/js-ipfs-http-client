ipfs-api
========

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-api/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-api?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-api.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-api)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs-api.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-api)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-api.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-api)

> A client library for the IPFS HTTP API, implemented in JavaScript. This client library implements the [interface-ipfs-core](https://github.com/ipfs/interface-ipfs-core) enabling applications to change between a embebed js-ipfs node and any remote IPFS node without having to change the code. In addition, this client library implements a set of utility functions.

![](https://github.com/ipfs/interface-ipfs-core/raw/master/img/badge.png)

## Table of Contents

- [Install](#install)
  - [Running the daemon with the right port](#running-the-daemon-with-the-right-port)
  - [Importing the module and usage](#importing-the-module-and-usage)
  - [In the Browser through browserify](#in-the-browser-through-browserify)
  - [In the Browser through `<script>` tag](#in-the-browser-through-script-tag)
  - [CORS](#cors)
- [Usage](#usage)
  - [API](#api)
  - [Callbacks and promises](#callbacks-and-promises)
- [Contribute](#contribute)
- [License](#license)

## Install

This module uses node.js, and can be installed through npm:

```bash
$ npm install --save ipfs-api
```

**Note:** ipfs-api requires Node v4.x (LTS) or higher.

### Running the daemon with the right port

To interact with the API, you need to have a local daemon running. It needs to be open on the right port. `5001` is the default, and is used in the examples below, but it can be set to whatever you need.

```sh
# Show the ipfs config API port to check it is correct
$ ipfs config Addresses.API
/ip4/127.0.0.1/tcp/5001
# Set it if it does not match the above output
$ ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
# Restart the daemon after changing the config

# Run the daemon
$ ipfs daemon
```

### Importing the module and usage

```javascript
var ipfsAPI = require('ipfs-api')

// connect to ipfs daemon API server
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'}) // leaving out the arguments will default to these values

// or connect with multiaddr
var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

// or using options
var ipfs = ipfsAPI({host: 'localhost', port: '5001', procotol: 'http'})
```

### In the Browser through browserify

Same as in Node.js, you just have to [browserify](http://browserify.org) the code before serving it. See the browserify repo for how to do that.

### In the Browser through `<script>` tag

You can use [unpkg](https://unpkg.com/) to get the latest built version, like this

```html
<script src="https://unpkg.com/ipfs-api/dist/index.js"></script>
```

This will export the `IpfsApi` constructor on the `window` object, such that:

```
var ipfs = window.IpfsApi('localhost', '5001')
```

If you omit the host and port, the api will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```
var ipfs = window.IpfsApi()
```

### CORS

If are using this module in a browser with something like browserify, then you will get an error saying that the origin is not allowed. This would be a CORS ("Cross Origin Resource Sharing") failure. The ipfs server rejects requests from unknown domains by default. You can whitelist the domain that you are calling from by changing your ipfs config like this:

```bash
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://example.com\"]"
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "\"true\""
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"
```

## Usage

### API

> `js-ipfs-api` follows the spec defined by [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core), which concerns the interface to expect from IPFS implementations. This interface is a currently active endeavor - expect it to be complete in the next few weeks (August 2016). You can use it today to consult the methods available.

### Utility functions

Adding to the methods defined by [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core), `js-ipfs-api` exposes a set of extra utility methods. These utility functions are scoped behind the `ipfs.util`.

Complete documentation for these methods is coming with: https://github.com/ipfs/js-ipfs-api/pull/305


#### Add files or entire directories from the FileSystem to IPFS

> `ipfs.util.addFromFs(path, option, callback)`

Reads a file from `path` on the filesystem  and adds it to IPFS. If `path` is a directory, use option `{ recursive: true }` to add the directory and all its sub-directories.

```JavaScript
ipfs.util.addFromFs('path/to/a/file', { recursive: true }, (err, result) => {
  if (err) {
    throw err
  }
  console.log(result)
})
```

`result` is an array of objects describing the files that were added, such as:

```
[{
  path: 'test-folder',
  hash: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6',
  size: 2278
},
// ...
]
```

#### Add a file from a URL to IPFS

> `ipfs.util.addFromURL(url, callback)`

```JavaScript
ipfs.util.addFromURL('http://example.com/', (err, result) => {
  if (err) {
    throw err
  }
  console.log(result)
})

```

#### Add a file from a stream to IPFS

> `ipfs.util.addFromStream(stream, callback)`

This is very similar to `ipfs.files.add({path:'', content: stream})`. It is like the reverse of cat

```JavaScript
ipfs.util.addFromStream(<readable-stream>, (err, result) => {
  if (err) {
    throw err
  }
  console.log(result)
})
```

### Callbacks and promises

If you do not pass in a callback all API functions will return a `Promise`. For example:

```js
ipfs.id()
  .then(function (id) {
    console.log('my id is: ', id)
  })
  .catch(function(err) {
  	console.log('Fail: ', err)
  })
```

This relies on a global `Promise` object. If you are in an environment where that is not
yet available you need to bring your own polyfill.

## Development

### Testing

We run tests by executing `npm test` in a terminal window. This will run both Node.js and Browser tests, both in Chrome and PhantomJS. To ensure that the module conforms with the [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core) spec, we run the batch of tests provided by the interface module, which can be found [here](https://github.com/ipfs/interface-ipfs-core/tree/master/src).



## Contribute

The js-ipfs-api is a work in progress. As such, there's a few things you can do right now to help out:

* **[Check out the existing issues](https://github.com/ipfs/js-ipfs-api/issues)**!
* **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
* **Add tests**. There can never be enough tests. Note that interface tests exist inside [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core/tree/master/src).
* **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

**Want to hack on IPFS?**

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## Historical context

This module started as a direct mapping from the go-ipfs cli to a JavaScript implementation, although this was useful and familiar to a lot of developers that were coming to IPFS for the first time, it also created some confusion on how to operate the core of IPFS and have access to the full capacity of the protocol. After much consideration, we decided to create `interface-ipfs-core` with the goal of standardizing the interface of a core implementation of IPFS, and keep the utility functions the IPFS community learned to use and love, such as reading files from disk and storing them directly to IPFS.

## License

[MIT](LICENSE)
