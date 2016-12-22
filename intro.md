Installable via  `npm install --save ipfs-api`, it can also be used directly in the browser.

## Quick Example

```js
const ipfsAPI = require('ipfs-api')

// connect to ipfs daemon API server

// leaving out the arguments will default to these values
const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})

// or connect with multiaddr
const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

// or using options
const ipfs = ipfsAPI({host: 'localhost', port: '5001', procotol: 'http'})
```

There are more available, so take a look at the docs below for a full list. This documentation aims to be comprehensive, so if you feel anything is missing please create a GitHub issue for it.

## Download

The source is available for download from [GitHub](https://github.com/ipfs/js-ipfs-api). Alternatively, you can install using npm:

```bash
$ npm install --save ipfs-api
```

You can then `require()` ${name} as normal:

```js
const ipfsApi = require('ipfs-api')
```

## In the Browser

Ipfs-api should work in any ES2015 environment out of the box.

Usage:

```html
<script type="text/javascript" src="index.js"></script>
```

The portable versions of ipfs-api, including `index.js` and `index.min.js`, are included in the `/dist` folder. Ipfs-api can also be found on [unkpkg.com](https://unpkg.com) under

- https://unpkg.com/ipfs-api/dist/index.min.js
- https://unpkg.com/ipfs-api/dist/index.js

For maximum security you may also decide to:

* reference a specific version of IPFS API (to prevent unexpected breaking changes when a newer latest version is published)
* [generate a SRI hash](https://www.srihash.org/) of that version and use it to ensure integrity
* set the [CORS settings attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) to make anonymous requests to CDN

Example:

```html
<script src="https://unpkg.com/ipfs-api@9.0.0/dist/index.js"
integrity="sha384-5bXRcW9kyxxnSMbOoHzraqa7Z0PQWIao+cgeg327zit1hz5LZCEbIMx/LWKPReuB"
crossorigin="anonymous"></script>
```

CDN-based IPFS API provides the `IpfsApi` constructor as a method of the global `window` object. Example:

```
const ipfs = window.IpfsApi('localhost', '5001')
```

If you omit the host and port, the API will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```
const ipfs = window.IpfsApi()
```

## Frequently Asked Questions

### Running the daemon with the right port

To interact with the API, you need to connect to a running ipfs daemon running. It needs to be available on the right port. `5001` is the default, and is used in the examples below, but it can be set to whatever you need.

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

### CORS

In a web browser IPFS API (either browserified or CDN-based) might encounter an error saying that the origin is not allowed. This would be a CORS ("Cross Origin Resource Sharing") failure: IPFS servers are designed to reject requests from unknown domains by default. You can whitelist the domain that you are calling from by changing your ipfs config like this:

```bash
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://example.com\"]"
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"
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

This relies on a global `Promise` object. If you are in an environment where none is available you need to bring your own polyfill.
