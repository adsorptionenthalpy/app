var fs = require('fs-extra')
var path = require('path')
var gulp = require('gulp')
var gulpAtom = require('gulp-atom')
var livereload = require('gulp-livereload')
var pkg = require('./package')

var RELEASE_PATH = './release'
var ATOM_VERSION = 'v0.20.2'
var PLATFORMS = ['win32-ia32', 'darwin-x64']

gulp.task('build', ['build-atom-app'], function() {
  var filePaths = PLATFORMS.map(function(platform) {
    if (platform.indexOf('win32') != -1)
      return path.resolve(path.join(RELEASE_PATH, ATOM_VERSION, platform, 'atom.exe'))
    // https://github.com/atom/atom-shell/issues/960
    //else if (platform.indexOf('darwin') != -1)
    //  return path.resolve(path.join(RELEASE_PATH, ATOM_VERSION, platform, 'Atom.app'))
    else
      return ''
  })

  filePaths.forEach(function(fp) {
    if (!fp) return
    fs.rename(fp, fp.replace(/atom/i, 'Obsidian'), Function())
  })
})

gulp.task('build-atom-app', function() {
  var atomPkg = {
    name: pkg.name,
    version: pkg.version,
    main: './browser/main.js'
  }
  fs.writeJsonSync('./src/package.json', atomPkg)

  return gulpAtom({
    srcPath: './src',
    releasePath: RELEASE_PATH,
    cachePath: '/tmp/atom-cache',
    version: ATOM_VERSION,
    rebuild: false,
    platforms: PLATFORMS
  })
})

gulp.task('watch-js', function() {
  var watch = require('gulp-watch')
  livereload.listen()

  watch(["src/**/*.js", "!src/renderer/js/_bundle.js"], function() {
    return gulp.start("build-js")
  })
})

gulp.task('build-js', function() {
  console.log('wtf')
  var gutil = require('gulp-util')
  var browserify = require('browserify')
  var path = require('path')
  var source = require('vinyl-source-stream')
  //var watchify = require('watchify')
  //var _ = require('lodash')

  var file = './src/renderer/js/index.js'
  //var opts = _.extend({debug: true}, watchify.args)
  var b = browserify({debug: true})
  
  b.transform('reactify')

  b.add(file)
  //b.require('./config/dev.js', {expose: 'config'})
  b.on('update', rebundle)

  function rebundle(files) {
    var start = Date.now()
    files && files.forEach(function(file) {
      gutil.log(gutil.colors.magenta(path.basename(file)), 'was changed')
    })

    return b.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('_bundle.js'))
      .pipe(gulp.dest('./src/renderer/js/'))
      .pipe(livereload())
      .on('end', function() {
        var diff = ((Date.now() - start)/1000).toFixed(2) + ' s'
        gutil.log('Browserify finished after', gutil.colors.magenta(diff))
      })
  }

  return rebundle()
})

