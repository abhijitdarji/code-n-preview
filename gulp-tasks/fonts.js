module.exports = function (args, gulp, $, config, util) {
    return function () {
		/**
		* Copy fonts
		* @return {Stream}
		*/
		util.log('Copying fonts');

		return gulp
			.src(config.fonts)
			.pipe(gulp.dest(config.build + 'fonts'));
    };
};