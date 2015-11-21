'use strict'

const gulp = require('gulp')
const $ = require('gulp-load-plugins')()


gulp.task('docs', () => {
  return gulp.src('src/*.js')
    .pipe($.jsdocToMarkdown())
    .pipe($.concat('API.md'))
    .on('error', err => {
      $.util.log($.util.colors.red('jsdoc2md failed'), err.message)
    })
    .pipe(gulp.dest('.'))
})
