(function () {
    'use strict';

    angular
        .module('myapp')
        .factory('CompileService', CompileService);

    CompileService.$inject = ['$q', 'LESS', 'COFFEESCRIPT', 'JADE', 'MARKDOWN', 'SASS', 'STYLUS', 'TYPESCRIPT'];
    function CompileService($q, LESS, COFFEESCRIPT, JADE, MARKDOWN, SASS, STYLUS, TYPESCRIPT) {
        var service = {
            compile: compile,
            less: less,
            coffeeScript: coffeeScript,
            jade: jade,
            markdown: markdown,
            sass: sass,
            stylus: stylus
        };

        return service;

        ////////////////
        function compile(filetype, input) {
            var deferred = $q.defer();
            var result;

            switch (filetype) {
                case 'LESS':
                    result = less(input);
                    deferred.resolve(result);
                    break;
                case 'COFFEE':
                    result = coffeeScript(input);
                    deferred.resolve(result);
                    break;
                case 'JADE':
                    result = jade(input);
                    deferred.resolve(result);
                    break;
                case 'MARKDOWN':
                    result = markdown(input);
                    deferred.resolve(result);
                    break;
                case 'MD':
                    result = markdown(input);
                    deferred.resolve(result);
                    break;
                case 'SASS':
                    sass(input).then(function (out) {
                        result = out;
                        deferred.resolve(result);
                    });
                    break;
                case 'SCSS':
                    sass(input).then(function (out) {
                        result = out;
                        deferred.resolve(result);
                    });
                    break;
                case 'STYL':
                    result = stylus(input);
                    deferred.resolve(result);
                    break;
                case 'TS':
                    result = typescript(input);
                    deferred.resolve(result);
                    break;
            }

            return deferred.promise;
        }

        function less(input) {
            var out;
            LESS.render(input, function (error, output) {
                out = output.css;
            })

            return out;
        }

        function coffeeScript(input) {
            var out;
            out = COFFEESCRIPT.compile(input, { bare: true });
            return out;
        }

        function jade(input) {
            var out;
            var options = { pretty: true };
            // Compile a function
            var fn = JADE.compile(input, options);

            // Render the function
            //can use variables here inside fn
            out = fn();

            return out;
        }

        function markdown(input) {
            var out;
            out = MARKDOWN.toHTML(input);
            return out;
        }

        function sass(input) {
            var deferred = $q.defer();
            var out;

            SASS.compile(input, function (result) {
                if (!result.formatted) {
                    out = result.text;
                    deferred.resolve(out);
                }
                else {
                    out = result.formatted;
                    deferred.resolve(out);
                }
            });

            return deferred.promise;

        }

        function stylus(input) {
            var out;
            STYLUS(input.trim()).render(function (err, str) {
                if (err) {
                    out = err;
                }
                else {
                    out = str.trim();
                }

            });
            return out;
        }

        function typescript(input) {
            var out;
            out = TYPESCRIPT.transpile(input);
            return out;
        }
    }
})();