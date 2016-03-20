'use strict'

const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const webpack = require('webpack-stream')
const rimraf = require('rimraf')
const runSequence = require('run-sequence')

const config = require('./config')

gulp.task('clean:browser', (done) => {
  rimraf('./dist', done)
})

gulp.task('clean:node', (done) => {
  rimraf('./lib', done)
})

gulp.task('build:browser:nonminified', () => {
  const c = Object.assign({}, config.webpack.dev)
  c.output.filename = 'ipfsapi.js'

  return gulp.src('src/index.js')
    .pipe(webpack(c))
    .pipe($.size())
    .pipe(gulp.dest('dist'))
})

gulp.task('build:browser:minified', () => {
  const c = Object.assign({}, config.webpack.prod)
  c.output.filename = 'ipfsapi.min.js'

  return gulp.src('src/index.js')
    .pipe(webpack(c))
    .pipe($.size())
    .pipe(gulp.dest('dist'))
})

gulp.task('build:browser', ['clean:browser'], (done) => {
  runSequence(
    'build:browser:nonminified',
    'build:browser:minified',
    done
  )
})

gulp.task('build:node', ['clean:node'], () => {
  return gulp.src('src/**/*.js')
    .pipe($.babel(config.babel))
    .pipe($.size())
    .pipe(gulp.dest('lib'))
})

gulp.task('build', ['build:browser', 'build:node'])
