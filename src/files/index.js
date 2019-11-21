'use strict'

module.exports = config => ({
  cp: require('./cp')(config),
  mkdir: require('./mkdir')(config),
  flush: require('./flush')(config),
  stat: require('./stat')(config),
  rm: require('./rm')(config),
  ls: require('./ls')(config),
  read: require('./read')(config),
  write: require('./write')(config),
  mv: require('./mv')(config)
})
