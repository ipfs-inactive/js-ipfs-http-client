# Pubsub in the browser

> Use pubsub in the browser!

This example is a demo web application that allows you to connect to an IPFS node, subscribe to a pubsub topic and send/receive messages.

## Getting started

With Node.js and git installed, clone the repo and install the project dependencies:

```sh
git clone https://github.com/ipfs/js-ipfs-http-client.git
cd js-ipfs-http-client
npm install # Installs ipfs-http-client dependencies
cd examples/browser-pubsub
npm install # Installs browser-pubsub app dependencies
```

Start the example application:

```sh
npm start
```

You should see something similar to the following in your terminal and the web app should now be available if you navigate to http://127.0.0.1:8888 using your browser:

```sh
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8888
```

## Start two IPFS nodes

Right now the easiest way to do this is to install and start a `js-ipfs` and `go-ipfs` node.

### Install and start the JS IPFS node

```sh
npm install -g ipfs
jsipfs init
# Configure CORS to allow ipfs-http-client to access this IPFS node
jsipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://127.0.0.1:8888"]'
# Start the IPFS node, enabling pubsub
jsipfs daemon --enable-pubsub-experiment
```

### Install and start the Go IPFS node

Head over to https://dist.ipfs.io/#go-ipfs and hit the "Download go-ipfs" button. Extract the archive and read the instructions to install.

After installation:

```sh
ipfs init
# Configure CORS to allow ipfs-http-client to access this IPFS node
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://127.0.0.1:8888"]'
# Start the IPFS node, enabling pubsub
ipfs daemon --enable-pubsub-experiment
```

##
