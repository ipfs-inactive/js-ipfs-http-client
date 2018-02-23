/**
 * Expect a Promise to timeout
 * @param  {Promise} promise promise that you expect to timeout
 * @param  {Number} ms       millis to wait
 * @return {Promise}
 */
module.exports = (promise, ms) => {
  return Promise.race([
    promise.then((out) => {
      throw new Error('Expected Promise to timeout but it was successful.')
    }),
    new Promise((resolve, reject) => setTimeout(resolve, ms))
  ])
}
