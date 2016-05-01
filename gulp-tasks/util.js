module.exports = function (args, gulp, $, config) {

    var path = require('path');
    var del = require('del');
    
    var util = {
        log: log,
        clean: clean
    };
    
    return util;
    /**
     * Log a message or series of messages using chalk's blue color.
     * Can pass in a string, object or array.
     */
    function log(msg) {
        if (typeof (msg) === 'object') {
            for (var item in msg) {
                if (msg.hasOwnProperty(item)) {
                    $.util.log($.util.colors.blue(msg[item]));
                }
            }
        } else {
            $.util.log($.util.colors.blue(msg));
        }
    }
    
    /**
    * Delete all files in a given path
    * @param  {Array}   path - array of paths to delete
    * @param  {Function} done - callback when complete
    */
    function clean(path, done) {
        log('Cleaning: ' + $.util.colors.blue(path));
        del(path, done);
    }
    
}

