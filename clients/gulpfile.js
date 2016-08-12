var gulp = require('gulp');
var watch = require('gulp-watch');
var browserify = require('gulp-browserify');
var babel = require("gulp-babel");

gulp.task('default', function () {
    gulp.src('mobile/src/app.js')
        .pipe(babel())
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('mobile/js'))

    gulp.src('desktop/src/app.js')
        .pipe(babel())
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('desktop/js'))
});