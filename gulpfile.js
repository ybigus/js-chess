var gulp = require('gulp');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');
var cssmin = require('gulp-cssmin');
/*var plumber = require('gulp-plumber');
var webserver = require('gulp-webserver');
var opn = require('opn');*/

var sourcePaths = {
  src: ['src/*.*']
};

var distPaths = {
  styles: 'css'
};

/*var server = {
  host: 'localhost',
  port: '8001',
  indexFile: '/src/game.html'
}

gulp.task('webserver', function() {
  gulp.src( '.' )
      .pipe(webserver({
        host:             server.host,
        port:             server.port,
        livereload:       true,
        directoryListing: false
      }));
});

gulp.task('openbrowser', function() {
  opn( 'http://' + server.host + ':' + server.port + server.indexFile);
});

gulp.task('watch', function(){
  gulp.watch(sourcePaths.src);
});

gulp.task('default', ['webserver', 'watch', 'openbrowser']);*/

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