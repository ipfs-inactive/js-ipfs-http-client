#! /bin/bash
API_ORIGIN="*" ipfs daemon&
sleep 5
./node_modules/.bin/browserify test/test.js -o browserified.js
