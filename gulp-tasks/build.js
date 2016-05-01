module.exports = function (args, gulp, $, config, util) {
    return function () {
		/**
		* Build everything
		* This is separate so we can run tests on
		* optimize before handling image or fonts
		*/
		util.log('Building everything');
		var del = require('del');
		
		var msg = {
			title: 'gulp build',
			subtitle: 'Deployed to the build folder',
			message: 'Running `gulp serve-build`'
		};
		
		util.log(msg);
    };
};