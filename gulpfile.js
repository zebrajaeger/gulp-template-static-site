const fs = require('fs')
const path = require("path")

const {src, dest, watch, series, parallel} = require('gulp')
const sourcemaps = require('gulp-sourcemaps');
const concat = require("gulp-concat");
const plumber = require("gulp-plumber")
const rename = require('gulp-rename');
const ignore = require('gulp-ignore');
const data = require('gulp-data');
const {production} = require('gulp-environments');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();

const beep = require('beepbeep');
// plugins.showFiles = require('gulp-print').default;

// js
const babel = require("gulp-babel");
const uglifyjs = require('gulp-uglify/composer')(require('uglify-js'), console)

// css
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cleanCSS = require('gulp-clean-css')

// html
const frontMatter = require('gulp-front-matter');
const hb = require('gulp-hb');
const layouts = require('handlebars-layouts');

// ---
const debug = false

// ---

function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', {recursive: true})
    }
    cb();
}

exports.js = clean

function js(srcPattern, targetFileName) {
    return src(srcPattern)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat(targetFileName))
        .pipe(gulpif(production(), uglifyjs()))
        .pipe(sourcemaps.write("."))
        .pipe(dest("dist"));
}

function jsApp() {
    return js("src/js/**/*.js", "app.js")
}

function jsVendor() {
    return js("src-vendor/js/**/*.js", "vendor.js")
}

exports.jsApp = jsApp
exports.jsVendor = jsVendor


function css(srcPattern) {
    return src(srcPattern)
        .pipe(plumber())
        .pipe(rename(p => {
            if (p.basename.startsWith('_')) {
                p.basename = p.basename.substring(1);
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: []}).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulpif(production(), cleanCSS()))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist'))
}

function cssApp() {
    return css('src/css/**/_*.{css,scss,sass}')
}

function cssVendor() {
    return css('src-vendor/css/**/_*.{css,scss,sass}')
}

exports.css = cssApp
exports.css = cssVendor

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
        .pipe(hb({debug})
            .partials('src/**/*.hbs')
            .helpers('src/helpers/**/*.js')
            .helpers(layouts)
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

function reload(cb) {
    browserSync.reload();
    beep();
    cb();
}

exports.reload = reload

function watcher(cb) {
    // css
    watch('src/css/**/*.{css,scss,sass}', series(cssApp, reload), cb)
    watch('src-vendor/css/**/*.{css,scss,sass}', series(cssVendor, reload), cb)

    // js
    watch('src/js/**/*.js', series(jsApp, reload), cb)
    watch('src-vendor/js/**/*.js', series(jsVendor, reload), cb)

    // assets
    watch('src/img/**/*.{jpg,jpeg,png,svg}', series(img, reload), cb)

    // html
    watch('src/**/*.{hbs,html}', series(html, reload), cb)

    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
}

exports.watch = watcher
exports.serve = series(clean, parallel(jsApp, jsVendor, cssApp, cssVendor, img, html), watcher)
exports.build = series(clean, parallel(jsApp, jsVendor, cssApp, cssVendor, img, html))

exports.default = exports.build