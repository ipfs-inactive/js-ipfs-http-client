IPFS API library for JavaScript
====================================================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) [![Dependency Status](https://david-dm.org/ipfs/node-ipfs-api.svg?style=flat-square)](https://david-dm.org/ipfs/node-ipfs-api)
[![Circle CI](https://circleci.com/gh/ipfs/node-ipfs-api.svg?style=svg)](https://circleci.com/gh/ipfs/node-ipfs-api)

- [Description](#description)
- [Installation](#installation)
  - [npm](#npm)
  - [Browser](#browser)
- [FAQ](#faq)
  - [CORS](#cors)
  - [Buffers in browser version](#buffers-in-browser-version)
- [Contributing](#contributing)
- [License](#license)

# Description

# Installation

## npm

```bash
npm install --save ipfs-api
```

Then you will be able to import the library with `require`.

```javascript
var ipfsAPI = require('ipfs-api');

// connect to ipfs daemon API server
var ipfs_client = ipfsAPI('localhost', '5001'); // leaving out the arguments will default to these values
```

## Browser
Make the [ipfsapi.min.js](/dist/ipfsapi.min.js) available through your server and load it using a normal `<script>` tag, this will export the `ipfsAPI` constructor on the `window` object.

```javascript
// connect to ipfs daemon API server
var ipfs_client = window.ipfsAPI('localhost', '5001') // leaving out the arguments will default to these values
```

# Usage

```javascript
ipfs_client.add(new Buffer('Hello World!'), function(err, resAdd) {
  if(err) throw err
  var hash = resAdd[0].Hash
  ipfs_client.cat(hash, function(err, resCat) {
    if(err) throw err
    resCat.on('data', function(chunk) {
    	console.log(chunk.toString())
    	// => "Hello World!"
    })
  })
})
```

For more examples and reference, check out the [API Reference](API.md)

# FAQ
## CORS

If are using this module in a browser with something like browserify, then you will get an error saying that the origin is not allowed.  This would be a CORS ("Cross Origin Resource Sharing") failure. The ipfs server rejects requests from unknown domains by default.  You can whitelist the domain that you are calling from by exporting API_ORIGIN and restarting the daemon, like:

```bash
export API_ORIGIN="http://localhost:8080"
ipfs daemon
```

## Buffers in browser version

When using the api from the browser for things that require buffers (ipfs.add, for example), you will have to use either the exposed ipfs.Buffer, that works just like a node buffer, or use this [browser buffer](https://github.com/feross/buffer)


# Contributing

# License

The MIT License (MIT)

Copyright (c) 2015 - Protocol Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
