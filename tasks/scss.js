var gulp = require('gulp')
var sass = require('gulp-sass')

gulp.task('scss', function () {
  gulp.src('static/scss/obsidian.scss')
    .pipe(sass())
    .pipe(gulp.dest('static/styles/'))
})
