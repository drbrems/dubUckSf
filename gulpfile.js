'use strict';

const gulp          = require('gulp'),
      sass          = require('gulp-sass'),
      autoprefixer  = require('gulp-autoprefixer'),
      babel         = require('gulp-babel'),
      sourcemaps    = require('gulp-sourcemaps'),
      rename        = require('gulp-rename');

const browserSync = require("browser-sync").create(),
      open        = require('opn');

gulp.task('css', function () {
  return gulp.src('./sass/style.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
      }))
      .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('./css'))
})

gulp.task('js', function(async){
  return gulp.src('./components/*.next.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', function(error){console.log(error); async();})
    .pipe(sourcemaps.write(''))
    .pipe(rename(function(filepath) {
        filepath.basename = filepath.basename.replace(/(\.next)/, '');
     }))
  .pipe(gulp.dest('./components'))
})

gulp.task('watch', function(){
    gulp.watch(["./sass/*"], gulp.series('css'));
})

gulp.task('serve', function(){
  browserSync.init({
    files: ["./css/*.css", "./**/*.html", "./**/*.js"],
    ghostMode: false,
    open: false,
    socket: {
      socketIoClientConfig:{reconnectionAttempts: 1000, reconnectionDelay: 500, reconnectionDelayMax: 1200}
    },
    server: {
      index: "index.html"
    }
  }, function(err, bs) {
    // open browser if, after two seconds, no client has connected
    const startedAt   = new Date(),
          openTimeout = setTimeout(() => open(bs.getOption('urls').get('external')), 2000);
    bs.io.sockets.once('connection', function(socket) {
      if(new Date()-startedAt < 2000){
        clearTimeout(openTimeout);
      };
    });
  });
})

gulp.task('default', gulp.series(gulp.parallel('css'/*, 'js'*/), gulp.parallel('serve', 'watch')) );
