var gulp = require('gulp');
var gzip = require('gulp-gzip');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var terser = require('gulp-terser');
var htmlMin = require('gulp-htmlmin');


gulp.task('default', ['watch','styles','copy-images', 'copy-html', 'scripts','copy-manifest']);

gulp.task('watch', function(){
	gulp.watch('./css/*.css').on('change', browserSync.reload);
	gulp.watch('./js/*.js').on('change', browserSync.reload);
	gulp.watch('./*.html').on('change', browserSync.reload);
	gulp.watch('./*.js').on('change', browserSync.reload);
	browserSync.init({
		server: './public/'
	});
});

gulp.task('styles', function(){
    gulp.src('css/**/*.css')
	    .pipe(cleanCSS())
	    .pipe(autoprefixer('last 2 versions'))
	    .pipe(gulp.dest('./public/css'))
});

gulp.task('copy-html', function() {
	gulp.src('./*.html')
		.pipe(htmlMin({collapseWhitespace: true}))
		.pipe(gulp.dest('./public/'));
});

gulp.task('copy-manifest', function() {
	gulp.src('./*.json')
		.pipe(gulp.dest('./public/'));
});


gulp.task('scripts', function() {
	gulp.src('js/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(terser())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/js'));
	gulp.src('./*.js')
		.pipe(sourcemaps.init())
		.pipe(terser())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/'));
});

gulp.task('copy-images', function() {
	gulp.src('img/*.webp')
		.pipe(gulp.dest('./public/img'));
});

