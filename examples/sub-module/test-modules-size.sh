#!/bin/sh

modules=($(ls modules/))

echo "name - bundled - minified"

# Full IPFS module
webpack --display none --config webpack.config.js complete-module.js complete-bundle.js
babili complete-bundle.js -o complete-bundle-minified.js

ipfsBundleSize=($(wc -c < complete-bundle.js | awk '{b=$1/1024; printf "%.2f\n", b}'))
ipfsMinSize=($(wc -c < complete-bundle-minified.js | awk '{b=$1/1024; printf "%.2f\n", b}'))

echo IPFS - $ipfsBundleSize - $ipfsMinSize

for module in "${modules[@]}"
do
  moduledir="modules/$module"
  webpack --display none --config webpack.config.js $moduledir/$module.js $moduledir/bundle.js
  babili $moduledir/bundle.js -o $moduledir/bundle-minified.js

  bundlesize=($(wc -c < $moduledir/bundle.js | awk '{b=$1/1024; printf "%.2f\n", b}'))
  minsize=($(wc -c < $moduledir/bundle-minified.js | awk '{b=$1/1024; printf "%.2f\n", b}'))
  echo $module - $bundlesize - $minsize
done
