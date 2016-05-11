module.exports = function (args, gulp, $, config, util) {
    return function () {
		/**
		 * Compress images
		 * @return {Stream}
		 */
		util.log('Compressing and copying images');

		gulp.src('./favicon.ico')
			.pipe(gulp.dest(config.build));
			
		return gulp
			.src(config.images)
			.pipe($.imagemin({ optimizationLevel: 4 }))
			.pipe(gulp.dest(config.build + 'images'));
    };
};