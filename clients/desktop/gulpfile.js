var gulp = require('gulp');
var watch = require('gulp-watch');
var browserify = require('gulp-browserify');
var babel = require("gulp-babel");

// Basic usage 
gulp.task('watchjs', function () {
    return watch('src/**', function () {
        gulp.src('src/app.js')
            .pipe(browserify({
                insertGlobals: true
            }))
            .pipe(gulp.dest('js'))
    });
});

gulp.task('buildjs', function () {
    gulp.src('src/app.js')
        .pipe(babel())
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('js'))
});