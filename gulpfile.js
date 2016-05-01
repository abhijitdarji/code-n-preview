var args = require('yargs').argv;
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ lazy: true });
var config = require('./gulp.config')();
var util = require('./gulp-tasks/util')(args, gulp, $, config);

function getTask(task) {
    return require('./gulp-tasks/' + task)(args, gulp, $, config, util);
}


/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('fonts', ['clean-fonts'], getTask('fonts'));
gulp.task('images', ['clean-images'], getTask('images'));

gulp.task('build', ['optimize', 'images', 'fonts'], getTask('build'));
gulp.task('optimize',['clean-code'], getTask('optimize'));
gulp.task('publish', ['build'], getTask('publish'));

/**
 * clean up tasks
 */
require('./gulp-tasks/cleanup')(args, gulp, $, config, util);