var gulp = require('gulp');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');
var cssmin = require('gulp-cssmin');

gulp.task('bower', function() {
  var jsFilter = gulpFilter('*.js');
  var cssFilter = gulpFilter('*.css');
  var fontsFilter = gulpFilter('*fonts/*');
  return gulp.src(mainBowerFiles())
  	.pipe(jsFilter)
  	.pipe(uglify())
    .pipe(gulp.dest('src/lib'))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(cssmin())
    .pipe(gulp.dest('src/lib/css'))
    .pipe(cssFilter.restore())
    .pipe(fontsFilter)
    .pipe(gulp.dest('src/lib/fonts'))
});

gulp.task('compress', function() {
  gulp.src('src/app/*.js')
  	.pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('src/app'))
});