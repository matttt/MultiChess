var sh = require('shelljs');
var gulp = require('gulp');

gulp.task('default', function () {
    sh.cd('clients')
    sh.exec('gulp')
    sh.cd('..')
    sh.exec('node .')
})