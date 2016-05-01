module.exports = function (args, gulp, $, config, util) {
    return function () {
		/**
		 * Compress images
		 * @return {Stream}
		 */
		util.log('Compressing and copying images');

		return gulp
			.src(config.images)
			.pipe($.imagemin({ optimizationLevel: 4 }))
			.pipe(gulp.dest(config.build + 'images'));
    };
};