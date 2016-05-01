module.exports = function (args, gulp, $, config, util) {
    return function () {
		/**
		* Optimize all files, move to a build folder,
		* and inject them into the new index.html
		* @return {Stream}
		*/
		util.log('Optimizing the js, css, and html');

		var assets = $.useref.assets({ searchPath: './' });
		// Filters are named for the gulp-useref path
		var cssFilter = $.filter('**/*.css');
		var jsAppFilter = $.filter('**/' + config.optimized.app);
		var jslibFilter = $.filter('**/' + config.optimized.lib);


		return gulp
			.src(config.index)
			.pipe($.plumber())
			.pipe(assets) // Gather all assets from the html with useref
        // Get the css
			.pipe(cssFilter)
			.pipe($.minifyCss())
			.pipe(cssFilter.restore())
        // Get the custom javascript
			.pipe(jsAppFilter)
			//.pipe($.uglify())
			.pipe(jsAppFilter.restore())
        // Get the vendor javascript
			.pipe(jslibFilter)
			//.pipe($.uglify()) // another option is to override wiredep to use min files
			.pipe(jslibFilter.restore())
        // Take inventory of the file names for future rev numbers
			//.pipe($.rev())
        // Apply the concat and file replacement with useref
			.pipe(assets.restore())
			.pipe($.useref())
        // Replace the file names in the html with rev numbers
			//.pipe($.revReplace())
			.pipe(gulp.dest(config.build));
	};
};