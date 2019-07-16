// Define modules
const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const del = require('del');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');

browserSync.create();

// File path variable
const files = {
  htmlPath: 'src/*.html',
  sassPath: 'src/sass/**/*.+(sass|scss)',
  cssPath: 'src/css/**/*.css',
  imagePath: 'src/images/*'
};

function compileSass() {
  return gulp.src(files.sassPath)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.stream());
}

function startServe() {
  browserSync.init({
    server: 'src',
    port: 8080
  });
  gulp.watch(files.sassPath, compileSass);
  gulp.watch(files.htmlPath).on('change', browserSync.reload);
}

function cleanDist() {
  return del(['dist/*']);
}

function copyHtml() {
  return gulp.src(files.htmlPath)
    .pipe(replace(/href="(\S*)\.css"/g, 'href="$1.min.css"'))
    .pipe(gulp.dest('dist'))
}

function minifyImage() {
  return gulp.src(files.imagePath)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: true}
        ]
      })
    ]))
    .pipe(gulp.dest('dist/images'));
}

function copyCss() {
  return gulp.src(files.cssPath)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(cssnano())
    .pipe(rename(path => {
      path.basename += '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'));
}

exports.default = gulp.series(
  gulp.parallel(compileSass),
  startServe
);

exports.build = gulp.series(
  gulp.parallel(compileSass, cleanDist),
  gulp.parallel(copyHtml, copyCss, minifyImage)
);
