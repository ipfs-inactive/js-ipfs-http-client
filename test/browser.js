// This is webpack specific. It will create a single bundle
// out of all files ending in ".spec.js" within the "test"
// directory and all its subdirectories.
'use strict'
const testsContext = require.context('.', true, /\.spec\.js/)
testsContext.keys().forEach(testsContext)
