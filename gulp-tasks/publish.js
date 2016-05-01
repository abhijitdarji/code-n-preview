module.exports = function (args, gulp, $, config, util) {
    return function () {
		/**
		* publish code on the gh-pages branch
		*/
		var ghPages = require('gulp-gh-pages');

		return gulp.src(config.publish)
			.pipe(ghPages());
	};
};