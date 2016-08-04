module.exports = {
  module: {
    loaders: [{
      test: /\.json/,
      loader: 'json'
    }],
    preLoaders: [{
      test: /\.js$/,
      loader: 'transform?brfs'
    }]
  }
}
