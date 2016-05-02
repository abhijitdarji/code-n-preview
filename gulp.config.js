module.exports = function () {
    
    var root = './';
    var client = root;
    
    var config = {
        /**
         * File paths
         */
        // all javascript that we want to vet
        build: './build/',
        publish: './build/**/*',
        client: client,
        fonts: client + 'fonts/**/*.*',
        html: client + '**/*.html',
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        analytics: client + 'scripts/analytics.html',

        /**
         * optimized files
         */
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        }
    };


    return config;
};
