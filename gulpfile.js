const gulp = require("gulp");
const del = require("del");
const csso = require("gulp-csso");
const svgstore = require("gulp-svgstore");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const htmlmin = require('gulp-htmlmin');
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML

const html = () => {
  return gulp.src("source/**/*.html")
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
}

exports.html = html;

// Scripts

const scripts = () => {
  return gulp.src("source/js/script.js")
  .pipe(terser())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest("build/js"))
  .pipe(sync.stream());
}

exports.scripts = scripts;

// Images

const optimizeImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.mozjpeg({progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"))
}

exports.images = optimizeImages;

const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(gulp.dest("build/img"))
}

exports.images = copyImages;


//WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 85}))
  .pipe(gulp.dest("build/img"))
}

exports.webp = createWebp;

// Clean

const clean = () => {
  return del ("build");
};

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/js/script", gulp.series("scripts"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

// Build

const build = gulp.series(
  clean,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebp
  ),
);

exports.build = build;

exports.default = gulp.series(
  clean,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebp
  ),
  gulp.series(
    server,
    watcher
));
