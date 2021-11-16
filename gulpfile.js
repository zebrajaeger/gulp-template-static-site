const fs = require('fs')
const path = require("path")

const {src, dest, watch, series, parallel} = require('gulp')
const sourcemaps = require('gulp-sourcemaps');
const concat = require("gulp-concat");
const plumber = require("gulp-plumber")
const rename = require('gulp-rename');
const ignore = require('gulp-ignore');
const data = require('gulp-data');

const browserSync = require('browser-sync').create();

const beep = require('beepbeep');
// plugins.showFiles = require('gulp-print').default;

// js
const babel = require("gulp-babel");

// css
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

// html
const frontMatter = require('gulp-front-matter');
const hb = require('gulp-hb');

function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', {recursive: true})
    }
    cb();
}

exports.js = clean

function js() {
    return src("src/**/*.js")
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat("app.js"))
        .pipe(sourcemaps.write("."))
        .pipe(dest("dist"));
}

exports.js = js

function css() {
    return src('src/css/**/*.{scss,sass}')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: []}).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist'))
}

exports.css = css

function img() {
    return src('src/img/**/*.{jpg,jpeg,png,svg}')
        .pipe(dest('dist/img'))
}

exports.img = img

function html() {
    return src('src/*.hbs')
        .pipe(ignore.include(f => {
            return path.parse(f.path).name.startsWith('_')
        }))
        .pipe(plumber())
        .pipe(frontMatter({"property": "data.page"}))
        .pipe(data((file) => {
            return require(file.path.replace('.html', '.json'));
        }))
        .pipe(hb({debug: true})
            .partials('src/**/*.hbs')
            .helpers('src/helpers/**/*.js')
            .helpers(require('handlebars-layouts'))
            .decorators('src/decorators/**/*.js')
            .data('src/data/**/*.{js,json}')
            .data({
                "timestamp": Date.now()
            }))
        .pipe(rename(p => {
            p.basename = p.basename.substring(1);
            p.extname = '.html'
        }))
        .pipe(dest('dist'))
}

exports.html = html

function reload(cb){
    browserSync.reload();
    beep();
    cb();
}

function watcher(cb) {
    watch('src/css/**/*.{scss,sass}', series(css, reload), cb)
    watch('src/js/**/*.{js}', series(js, reload), cb)
    watch('src/img/**/*.{jpg,jpeg,png,svg}', series(img, reload), cb)
    watch('src/**/*.{hbs,html}', series(html, reload), cb)

    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
}

exports.watch = watcher
exports.default = series(clean, parallel(js, css, img, html), watcher)
// exports.default = series(clean, parallel(js, css, img, html))
