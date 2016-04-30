(function () {
    'use strict';

    angular
        .module('myapp')
        .directive('compile', compile);

    compile.$inject = ['$compile', 'CompileService', 'HTML_BEAUTIFY', '$q', 'COMPILE_TYPES'];
    function compile($compile, CompileService, HTML_BEAUTIFY, $q, COMPILE_TYPES) {
        // Usage:
        // watches editor for changes and generates preview html
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;

        function link(scope, ele, attrs) {
            scope.$watch(attrs.compile, function (html) {


                function insertOrUpdate(filename, value) {
                    var exists = scope.vm.files.some(function (file) {
                        return file.name == filename
                    });

                    if (exists) {
                        angular.forEach(scope.vm.files, function (file) {
                            if (file.name == filename) {
                                file.value = value
                            }
                        })
                        scope.vm.saveFilesToLocal();
                    }
                    else {
                        scope.vm.addNewFile(filename, value);
                    };
                }

                function compileSource(name) {
                    var deferred = $q.defer();
                    var master = {
                        'LESS': '.css',
                        'COFFEE': '.js',
                        'JADE': '.html',
                        'MARKDOWN': '.html',
                        'MD': '.html',
                        'SASS': '.css',
                        'SCSS': '.css',
                        'STYL': '.css'
                    }
                    if (name.match(COMPILE_TYPES)) {
                        var type = name.match(COMPILE_TYPES)[0],
                            fileExt, compileType, out;
                        var regex = new RegExp(type.substring(1, type.length), "i");
                        for (var key in master) {
                            if (regex.test(key)) {
                                compileType = key;
                                fileExt = master[key];
                            }
                        }
                        CompileService.compile(compileType, scope.vm.dynFile.value).then(function (result) {
                            out = result;
                            var filename = scope.vm.dynFile.name.substr(0, scope.vm.dynFile.name.length - type.length) + fileExt;
                            insertOrUpdate(filename, out);
                            deferred.resolve('done');
                        });
                    }
                    else {
                        insertOrUpdate(name, html);
                        deferred.resolve('done');
                    }

                    return deferred.promise;

                }

                if (scope.vm.dynFile.name != null && scope.vm.dynFile.value != '') {

                    compileSource(scope.vm.dynFile.name)
                        .then(function (result) {

                            if (scope.vm.dynFile.name.match(/\.(css|js|less|coffee|sass|scss|styl)$/i)) {

                                angular.forEach(scope.vm.files, function (file) {
                                    if (file.name == 'index.html') {
                                        html = file.value
                                    }
                                })
                            }
                            if (scope.vm.dynFile.name.match(/\.(jade|md|markdown)$/i)) {

                                angular.forEach(scope.vm.files, function (file) {
                                    if (file.name == scope.vm.dynFile.name.substr(0, scope.vm.dynFile.name.length - scope.vm.dynFile.name.match(/\.(jade|md|markdown)$/i)[0].length) + '.html') {
                                        html = file.value
                                    }
                                })
                            }

                            var iframeHtml = '';

                            function get_doctype(document) {
                                var node = document.doctype;
                                var doctype =
                                    "<!DOCTYPE "
                                    + node.name
                                    + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                                    + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                                    + (node.systemId ? ' "' + node.systemId + '"' : '')
                                    + '>'
                                return doctype;
                            }

                            if (/^<!DOCTYPE/i.test(html)) {

                                var doc = (new DOMParser()).parseFromString(html, "text/html");

                                // or document can be created as below
                                // doc = window.document.implementation.createHTMLDocument("")
                                // doc.open()
                                // doc.write(html)
                                // if(doc.documentElement) doc.documentElement.innerHTML = html

                                angular.forEach(scope.vm.files, function (file) {

                                    if (file.ext == 'js') {

                                        var el = doc.querySelector("script[src=\"" + file.name + "\"]");

                                        //if not found by same case then try case insentitive search
                                        if (!el) {
                                            var superSet = doc.querySelectorAll('script');
                                            var regex = new RegExp(file.name, "i");
                                            var found = [].filter.call(superSet, function (x) {
                                                return regex.test(x.getAttribute('src'));
                                            })
                                            if (found.length > 0) el = found[0];
                                        }

                                        if (el) {
                                            var newScript = "<!-- " + file.name + " -->"
                                                + "<script type='text/javascript'> "
                                                + file.value + "<\/script>";

                                            //angular.element(script).remove();
                                            //angular.element(doc).find('head').append(newScript);
                                            angular.element(el).replaceWith(newScript);
                                        }
                                    }

                                });

                                angular.forEach(scope.vm.files, function (file) {

                                    if (file.ext == 'css') {

                                        var el = doc.querySelector("link[href=\"" + file.name + "\"]");

                                        //if not found by same case then try case insentitive search
                                        if (!el) {
                                            var superSet = doc.querySelectorAll('link');
                                            var regex = new RegExp(file.name, "i");
                                            var found = [].filter.call(superSet, function (x) {
                                                return regex.test(x.getAttribute('href'));
                                            })
                                            if (found.length > 0) el = found[0];
                                        }

                                        if (el) {
                                            var newLink = "<!-- " + file.name + " -->"
                                                + "<style type='text/css'> "
                                                + file.value + "<\/style>";

                                            //angular.element(link).remove();
                                            //angular.element(doc).find('head').append(newLink);
                                            angular.element(el).replaceWith(newLink);
                                        }
                                    }

                                });

                                iframeHtml = HTML_BEAUTIFY(get_doctype(doc) + doc.documentElement.outerHTML);

                            }
                            else if (scope.vm.dynFile.name.match(/\.(md|markdown)$/i)) {

                                var cont = "<article class='markdown-body'>" + html + '</article>';
                                var doc = (new DOMParser()).parseFromString(cont, "text/html");

                                var link = doc.createElement('link');
                                link.href = 'styles/github-markdown.css';
                                link.rel = 'stylesheet';

                                doc.getElementsByTagName('head')[0].appendChild(link);

                                iframeHtml = doc.documentElement.outerHTML;
                            }
                            else {
                                iframeHtml = html;
                            }

                            scope.vm.previewHTML = iframeHtml;
                            var preview = ele[0].contentDocument || ele[0].contentWindow.document;
                            if (ele[0].contentWindow.angular) delete ele[0].contentWindow.angular;
                            preview.open();
                            preview.write(iframeHtml);
                            preview.close();


                        });
                }


                //var template = $compile(scope.message)(scope);
                //ele.replaceWith(template);   

                //ele.html(html);
                //$compile(ele.contents())(scope);
            });
        }
    }
})();
